export const DISNEY_SHIPS = [
  { mmsi: "308516000", name: "Disney Magic", className: "Magic Class", homeRegion: "Caribbean / Alaska" },
  { mmsi: "308457000", name: "Disney Wonder", className: "Magic Class", homeRegion: "West Coast / Alaska" },
  { mmsi: "311042900", name: "Disney Dream", className: "Dream Class", homeRegion: "Florida / Bahamas" },
  { mmsi: "311058700", name: "Disney Fantasy", className: "Dream Class", homeRegion: "Florida / Caribbean" },
  { mmsi: "311001098", name: "Disney Wish", className: "Wish Class", homeRegion: "Port Canaveral" },
  { mmsi: "311001221", name: "Disney Treasure", className: "Wish Class", homeRegion: "Port Canaveral" },
  { mmsi: "311001540", name: "Disney Destiny", className: "Wish Class", homeRegion: "Fort Lauderdale" },
  { mmsi: "311000934", name: "Disney Adventure", className: "Global Class", homeRegion: "Singapore" }
];

export const DISNEY_BOUNDING_BOXES = [[[-90, -180], [90, 180]]];

export const MESSAGE_TYPES = [
  "PositionReport",
  "ExtendedClassBPositionReport",
  "StandardClassBPositionReport",
  "ShipStaticData",
  "StaticDataReport"
];

const MESSAGE_TYPE_SET = new Set(MESSAGE_TYPES);
const DISNEY_NAME_TO_MMSI = new Map(
  DISNEY_SHIPS.map((ship) => [ship.name.toUpperCase(), ship.mmsi])
);

export function createShipState() {
  return new Map(
    DISNEY_SHIPS.map((ship) => [
      ship.mmsi,
      {
        ...ship,
        destination: null,
        eta: null,
        latitude: null,
        longitude: null,
        course: null,
        heading: null,
        speedKnots: null,
        navigationStatus: null,
        lastSeen: null,
        sourceMessageType: null
      }
    ])
  );
}

export function createConnectionState(apiKeyPresent) {
  return {
    status: apiKeyPresent ? "connecting" : "awaiting_api_key",
    lastEventAt: null,
    lastError: apiKeyPresent ? null : "Set AISSTREAM_API_KEY before starting the app.",
    startedAt: new Date().toISOString(),
    reconnectCount: 0,
    pollMode: "short-lived"
  };
}

export function snapshot(shipState, connectionState) {
  return {
    connection: connectionState,
    ships: Array.from(shipState.values()).sort((a, b) => a.name.localeCompare(b.name))
  };
}

export function hasUsefulShipData(snapshot) {
  return Boolean(
    snapshot?.ships?.some(
      (ship) =>
        ship.latitude !== null ||
        ship.longitude !== null ||
        Boolean(ship.destination) ||
        Boolean(ship.lastSeen)
    )
  );
}

export function mergeShipSnapshots(previousSnapshot, nextSnapshot) {
  if (!previousSnapshot) {
    return nextSnapshot;
  }

  const previousShips = new Map(previousSnapshot.ships.map((ship) => [ship.mmsi, ship]));
  const ships = nextSnapshot.ships.map((ship) => {
    const previousShip = previousShips.get(ship.mmsi);
    if (!previousShip) {
      return ship;
    }

    return {
      ...previousShip,
      ...ship,
      destination: ship.destination || previousShip.destination,
      eta: ship.eta || previousShip.eta,
      latitude: ship.latitude ?? previousShip.latitude,
      longitude: ship.longitude ?? previousShip.longitude,
      course: ship.course ?? previousShip.course,
      heading: ship.heading ?? previousShip.heading,
      speedKnots: ship.speedKnots ?? previousShip.speedKnots,
      navigationStatus: ship.navigationStatus ?? previousShip.navigationStatus,
      lastSeen: ship.lastSeen || previousShip.lastSeen,
      sourceMessageType: ship.sourceMessageType || previousShip.sourceMessageType
    };
  });

  return {
    connection: {
      ...nextSnapshot.connection,
      lastEventAt: nextSnapshot.connection.lastEventAt || previousSnapshot.connection.lastEventAt,
      lastError: nextSnapshot.connection.lastError || previousSnapshot.connection.lastError
    },
    ships
  };
}

function readMeta(message) {
  return message.MetaData || message.Metadata || {};
}

function getMessageBody(message) {
  return message.Message?.[message.MessageType] || null;
}

function cleanText(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/@+/g, " ").replace(/\s+/g, " ").trim();
  return trimmed || null;
}

function normalizeShipName(value) {
  const cleaned = cleanText(value);
  return cleaned ? cleaned.toUpperCase() : null;
}

function formatEta(eta) {
  if (!eta || typeof eta !== "object") {
    return null;
  }

  const month = Number(eta.Month);
  const day = Number(eta.Day);
  const hour = Number(eta.Hour);
  const minute = Number(eta.Minute);

  if (![month, day, hour, minute].every(Number.isFinite) || month <= 0 || day <= 0) {
    return null;
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const etaDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (etaDate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 30) {
    etaDate.setUTCFullYear(year + 1);
  }

  return etaDate.toISOString();
}

async function normalizeIncomingMessage(rawMessage) {
  if (typeof rawMessage === "string") {
    return rawMessage;
  }

  if (rawMessage instanceof Blob) {
    return rawMessage.text();
  }

  if (rawMessage instanceof ArrayBuffer) {
    return Buffer.from(rawMessage).toString("utf8");
  }

  if (ArrayBuffer.isView(rawMessage)) {
    return Buffer.from(rawMessage.buffer, rawMessage.byteOffset, rawMessage.byteLength).toString("utf8");
  }

  return String(rawMessage);
}

function applyShipUpdates(shipState, mmsi, updates) {
  const current = shipState.get(mmsi);
  if (!current) {
    return;
  }

  shipState.set(mmsi, {
    ...current,
    ...updates
  });
}

export async function ingestAisMessage(rawMessage, shipState, connectionState) {
  const messageText = await normalizeIncomingMessage(rawMessage);

  let parsed;
  try {
    parsed = JSON.parse(messageText);
  } catch {
    return false;
  }

  if (parsed?.error) {
    connectionState.status = "error";
    connectionState.lastError = parsed.error;
    return false;
  }

  if (!MESSAGE_TYPE_SET.has(parsed?.MessageType)) {
    return false;
  }

  const body = getMessageBody(parsed);
  const meta = readMeta(parsed);
  const reportedMmsi = String(body?.UserID || meta?.MMSI || "");
  const candidateName = normalizeShipName(
    meta?.ShipName || body?.Name || body?.ReportA?.Name || body?.ReportB?.Name
  );
  const mmsi = shipState.has(reportedMmsi) ? reportedMmsi : DISNEY_NAME_TO_MMSI.get(candidateName || "") || "";

  if (!shipState.has(mmsi)) {
    return false;
  }

  const latitude = body?.Latitude ?? meta?.Latitude ?? meta?.latitude ?? null;
  const longitude = body?.Longitude ?? meta?.Longitude ?? meta?.longitude ?? null;
  const now = new Date().toISOString();

  const baseUpdates = {
    lastSeen: meta?.time_utc || meta?.TimeUTC || now,
    sourceMessageType: parsed.MessageType
  };

  if (latitude !== null && longitude !== null) {
    baseUpdates.latitude = Number(latitude);
    baseUpdates.longitude = Number(longitude);
  }

  if (
    parsed.MessageType === "PositionReport" ||
    parsed.MessageType === "ExtendedClassBPositionReport" ||
    parsed.MessageType === "StandardClassBPositionReport"
  ) {
    baseUpdates.course = Number.isFinite(Number(body?.Cog)) ? Number(body.Cog) : null;
    baseUpdates.heading = Number.isFinite(Number(body?.TrueHeading)) ? Number(body.TrueHeading) : null;
    baseUpdates.speedKnots = Number.isFinite(Number(body?.Sog)) ? Number(body.Sog) : null;
    baseUpdates.navigationStatus = body?.NavigationalStatus ?? null;
  }

  if (parsed.MessageType === "ShipStaticData") {
    baseUpdates.destination = cleanText(body?.Destination);
    baseUpdates.eta = formatEta(body?.Eta);
  }

  if (parsed.MessageType === "StaticDataReport") {
    baseUpdates.destination = cleanText(body?.Destination || body?.ReportA?.Destination || body?.ReportB?.Destination);
  }

  applyShipUpdates(shipState, mmsi, baseUpdates);
  connectionState.status = "connected";
  connectionState.lastEventAt = now;
  connectionState.lastError = null;
  return true;
}

export async function collectDisneySnapshot({
  apiKey,
  timeoutMs = 8000,
  idleAfterFirstMessageMs = 1500,
  maxRelevantMessages = 24
}) {
  const shipState = createShipState();
  const connectionState = createConnectionState(Boolean(apiKey));

  if (!apiKey) {
    return snapshot(shipState, connectionState);
  }

  if (typeof WebSocket !== "function") {
    connectionState.status = "error";
    connectionState.lastError = "WebSocket support is unavailable in this runtime.";
    return snapshot(shipState, connectionState);
  }

  return new Promise((resolve) => {
    let resolved = false;
    let relevantMessages = 0;
    let idleTimer = null;
    let timeoutTimer = null;
    let sawUsefulData = false;

    const finish = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
      }
      resolve(snapshot(shipState, connectionState));
    };

    const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

    timeoutTimer = setTimeout(() => {
      if (connectionState.status === "subscribed") {
        connectionState.status = "no_recent_disney_messages";
      }
      try {
        socket.close();
      } catch {
        finish();
      }
    }, timeoutMs);

    socket.addEventListener("open", () => {
      connectionState.status = "subscribed";
      connectionState.lastError = null;

      socket.send(
        JSON.stringify({
          APIKey: apiKey,
          BoundingBoxes: DISNEY_BOUNDING_BOXES,
          FilterMessageTypes: MESSAGE_TYPES
        })
      );
    });

    socket.addEventListener("message", (event) => {
      ingestAisMessage(event.data, shipState, connectionState)
        .then((matched) => {
          if (!matched) {
            return;
          }

          relevantMessages += 1;
          sawUsefulData = true;
          if (idleTimer) {
            clearTimeout(idleTimer);
          }

          if (relevantMessages >= maxRelevantMessages) {
            socket.close();
            return;
          }

          idleTimer = setTimeout(() => {
            socket.close();
          }, idleAfterFirstMessageMs);
        })
        .catch((error) => {
          if (!sawUsefulData) {
            connectionState.status = "error";
            connectionState.lastError = error instanceof Error ? error.message : "Unable to process AISStream message.";
          }
          socket.close();
        });
    });

    socket.addEventListener("error", () => {
      if (!sawUsefulData && !connectionState.lastError) {
        connectionState.status = "error";
        connectionState.lastError = "Unable to reach AISStream.";
      }
    });

    socket.addEventListener("close", () => {
      if (sawUsefulData && connectionState.status === "error") {
        connectionState.status = "connected";
      }
      finish();
    });
  });
}
