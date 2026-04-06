import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number.parseInt(process.env.PORT || "3000", 10);
const apiKey = process.env.AISSTREAM_API_KEY || "";

const DISNEY_SHIPS = [
  { mmsi: "308516000", name: "Disney Magic", className: "Magic Class", homeRegion: "Caribbean / Alaska" },
  { mmsi: "308457000", name: "Disney Wonder", className: "Magic Class", homeRegion: "West Coast / Alaska" },
  { mmsi: "311042900", name: "Disney Dream", className: "Dream Class", homeRegion: "Florida / Bahamas" },
  { mmsi: "311058700", name: "Disney Fantasy", className: "Dream Class", homeRegion: "Florida / Caribbean" },
  { mmsi: "311001098", name: "Disney Wish", className: "Wish Class", homeRegion: "Port Canaveral" },
  { mmsi: "311001221", name: "Disney Treasure", className: "Wish Class", homeRegion: "Port Canaveral" },
  { mmsi: "311001540", name: "Disney Destiny", className: "Wish Class", homeRegion: "Fort Lauderdale" },
  { mmsi: "311000934", name: "Disney Adventure", className: "Global Class", homeRegion: "Singapore" }
];

const MESSAGE_TYPES = new Set([
  "PositionReport",
  "ExtendedClassBPositionReport",
  "StandardClassBPositionReport",
  "ShipStaticData",
  "StaticDataReport"
]);

const shipState = new Map(
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

const clients = new Set();
const connectionState = {
  status: apiKey ? "connecting" : "awaiting_api_key",
  lastEventAt: null,
  lastError: apiKey ? null : "Set AISSTREAM_API_KEY before starting the server.",
  startedAt: new Date().toISOString(),
  reconnectCount: 0
};

let aisSocket = null;
let reconnectTimer = null;

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

function formatEta(eta) {
  if (!eta || typeof eta !== "object") {
    return null;
  }

  const month = Number(eta.Month);
  const day = Number(eta.Day);
  const hour = Number(eta.Hour);
  const minute = Number(eta.Minute);

  if (![month, day, hour, minute].every(Number.isFinite)) {
    return null;
  }

  if (month <= 0 || day <= 0) {
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

function updateShip(mmsi, updates) {
  const current = shipState.get(String(mmsi));
  if (!current) {
    return;
  }

  shipState.set(String(mmsi), {
    ...current,
    ...updates
  });
}

function handleAisMessage(rawMessage) {
  let parsed;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return;
  }

  if (parsed?.error) {
    connectionState.lastError = parsed.error;
    connectionState.status = "error";
    broadcastSnapshot();
    return;
  }

  if (!MESSAGE_TYPES.has(parsed?.MessageType)) {
    return;
  }

  const body = getMessageBody(parsed);
  const meta = readMeta(parsed);
  const mmsi = String(body?.UserID || meta?.MMSI || "");

  if (!shipState.has(mmsi)) {
    return;
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

  if (parsed.MessageType === "PositionReport" || parsed.MessageType === "ExtendedClassBPositionReport" || parsed.MessageType === "StandardClassBPositionReport") {
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

  updateShip(mmsi, baseUpdates);
  connectionState.status = "connected";
  connectionState.lastEventAt = now;
  connectionState.lastError = null;
  broadcastSnapshot();
}

function snapshot() {
  return {
    connection: connectionState,
    ships: Array.from(shipState.values()).sort((a, b) => a.name.localeCompare(b.name))
  };
}

function broadcastSnapshot() {
  const payload = `event: snapshot\ndata: ${JSON.stringify(snapshot())}\n\n`;

  for (const client of clients) {
    client.write(payload);
  }
}

function scheduleReconnect() {
  if (reconnectTimer || !apiKey) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToAisStream();
  }, 5000);
}

function connectToAisStream() {
  if (!apiKey) {
    connectionState.status = "awaiting_api_key";
    connectionState.lastError = "Set AISSTREAM_API_KEY before starting the server.";
    broadcastSnapshot();
    return;
  }

  if (typeof WebSocket !== "function") {
    connectionState.status = "error";
    connectionState.lastError = "This app needs Node.js 22+ for the built-in WebSocket client.";
    broadcastSnapshot();
    return;
  }

  if (aisSocket && (aisSocket.readyState === WebSocket.OPEN || aisSocket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  connectionState.status = "connecting";
  connectionState.lastError = null;
  broadcastSnapshot();

  aisSocket = new WebSocket("wss://stream.aisstream.io/v0/stream");

  aisSocket.addEventListener("open", () => {
    const subscription = {
      APIKey: apiKey,
      BoundingBoxes: [[[-90, -180], [90, 180]]],
      FiltersShipMMSI: DISNEY_SHIPS.map((ship) => ship.mmsi),
      FilterMessageTypes: Array.from(MESSAGE_TYPES)
    };

    aisSocket.send(JSON.stringify(subscription));
  });

  aisSocket.addEventListener("message", (event) => {
    handleAisMessage(event.data);
  });

  aisSocket.addEventListener("close", () => {
    connectionState.status = apiKey ? "disconnected" : "awaiting_api_key";
    connectionState.reconnectCount += 1;
    broadcastSnapshot();
    scheduleReconnect();
  });

  aisSocket.addEventListener("error", () => {
    connectionState.status = "error";
    connectionState.lastError = "Unable to reach AISStream. Check the API key and network connectivity.";
    broadcastSnapshot();
  });
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  const reqPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(publicDir, reqPath);

  try {
    const data = await readFile(filePath);
    const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  if (req.url === "/api/ships") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(snapshot()));
    return;
  }

  if (req.url === "/api/stream") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    });

    res.write(`event: snapshot\ndata: ${JSON.stringify(snapshot())}\n\n`);
    clients.add(res);

    req.on("close", () => {
      clients.delete(res);
    });
    return;
  }

  await serveStatic(req, res);
});

server.listen(port, () => {
  connectToAisStream();
  console.log(`Disney Cruise Tracker listening on http://localhost:${port}`);
});
