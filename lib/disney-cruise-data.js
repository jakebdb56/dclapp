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

const VESSELFINDER_API_URL = "https://api.vesselfinder.com/vessels";

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
    lastError: apiKeyPresent ? null : "Set VESSELFINDER_API_KEY before starting the app.",
    startedAt: new Date().toISOString(),
    reconnectCount: 0,
    pollMode: "request",
    provider: "VesselFinder"
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

function cleanText(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/@+/g, " ").replace(/\s+/g, " ").trim();
  return trimmed || null;
}

function parseVesselFinderTimestamp(value) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }

  const dateTime = cleaned.endsWith(" UTC")
    ? cleaned.slice(0, -4).replace(" ", "T")
    : cleaned.replace(" ", "T");
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateTime) ? dateTime : `${dateTime}Z`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeHeading(value) {
  const heading = normalizeNumber(value);
  if (heading === null || heading === 511) {
    return null;
  }

  return heading;
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

function applyVesselFinderRecord(record, shipState) {
  const ais = record?.AIS || record?.ais || record;
  const mmsi = String(ais?.MMSI || ais?.mmsi || "");
  if (!shipState.has(mmsi)) {
    return false;
  }

  const updates = {
    destination: cleanText(ais?.DESTINATION || ais?.destination),
    eta: parseVesselFinderTimestamp(ais?.ETA || ais?.eta),
    latitude: normalizeNumber(ais?.LATITUDE ?? ais?.latitude),
    longitude: normalizeNumber(ais?.LONGITUDE ?? ais?.longitude),
    course: normalizeNumber(ais?.COURSE ?? ais?.course),
    heading: normalizeHeading(ais?.HEADING ?? ais?.heading),
    speedKnots: normalizeNumber(ais?.SPEED ?? ais?.speed),
    navigationStatus: ais?.NAVSTAT ?? ais?.navstat ?? null,
    lastSeen: parseVesselFinderTimestamp(ais?.TIMESTAMP || ais?.timestamp),
    sourceMessageType: `VesselFinder${ais?.SRC ? ` ${ais.SRC}` : ""}`
  };

  applyShipUpdates(shipState, mmsi, updates);
  return true;
}

function getVesselFinderUrl(apiKey) {
  const url = new URL(process.env.VESSELFINDER_API_URL || VESSELFINDER_API_URL);
  url.searchParams.set("userkey", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("mmsi", DISNEY_SHIPS.map((ship) => ship.mmsi).join(","));

  if (process.env.VESSELFINDER_INCLUDE_SATELLITE === "true") {
    url.searchParams.set("sat", "1");
  }

  if (process.env.VESSELFINDER_INTERVAL_MINUTES) {
    url.searchParams.set("interval", process.env.VESSELFINDER_INTERVAL_MINUTES);
  }

  return url;
}

export async function collectDisneySnapshot({
  apiKey,
  timeoutMs = 8000
}) {
  const shipState = createShipState();
  const connectionState = createConnectionState(Boolean(apiKey));

  if (!apiKey) {
    return snapshot(shipState, connectionState);
  }

  if (typeof fetch !== "function") {
    connectionState.status = "error";
    connectionState.lastError = "Fetch support is unavailable in this runtime.";
    return snapshot(shipState, connectionState);
  }

  try {
    connectionState.status = "requesting";
    const response = await fetch(getVesselFinderUrl(apiKey), {
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!response.ok) {
      connectionState.status = "error";
      connectionState.lastError = `VesselFinder returned ${response.status}.`;
      return snapshot(shipState, connectionState);
    }

    const data = await response.json();
    if (data?.error || data?.ERROR) {
      connectionState.status = "error";
      connectionState.lastError = cleanText(data.error || data.ERROR) || "VesselFinder returned an error.";
      return snapshot(shipState, connectionState);
    }

    const records = Array.isArray(data) ? data : [];
    let matchedRecords = 0;

    for (const record of records) {
      if (applyVesselFinderRecord(record, shipState)) {
        matchedRecords += 1;
      }
    }

    connectionState.status = matchedRecords ? "connected" : "no_recent_vesselfinder_records";
    connectionState.lastEventAt = matchedRecords ? new Date().toISOString() : null;
    connectionState.lastError = null;
  } catch (error) {
    connectionState.status = "error";
    connectionState.lastError = error instanceof Error ? error.message : "Unable to reach VesselFinder.";
  }

  return snapshot(shipState, connectionState);
}
