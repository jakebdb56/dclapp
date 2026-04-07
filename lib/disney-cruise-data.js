export const DISNEY_SHIPS = [
  { mmsi: "308516000", name: "Disney Magic", className: "Magic Class", homeRegion: "Caribbean / Alaska" },
  { mmsi: "308457000", name: "Disney Wonder", className: "Magic Class", homeRegion: "West Coast / Alaska" },
  { mmsi: "311042900", name: "Disney Dream", className: "Dream Class", homeRegion: "Florida / Bahamas" },
  { mmsi: "311058700", name: "Disney Fantasy", className: "Dream Class", homeRegion: "Florida / Caribbean" },
  { mmsi: "311001098", name: "Disney Wish", className: "Wish Class", homeRegion: "Port Canaveral" },
  { mmsi: "311001221", name: "Disney Treasure", className: "Wish Class", homeRegion: "Port Canaveral" },
  {
    mmsi: "311001540",
    imo: "9834741",
    name: "Disney Destiny",
    className: "Wish Class",
    homeRegion: "Fort Lauderdale",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9834741"
  },
  { mmsi: "311000934", name: "Disney Adventure", className: "Global Class", homeRegion: "Singapore" }
];

const VESSELFINDER_API_URL = "https://api.vesselfinder.com/vessels";
const DISNEY_DESTINY_MMSI = "311001540";
const DISNEY_DESTINY_DETAILS_URL = "https://www.vesselfinder.com/vessels/details/9834741";
const DETAILS_PAGE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";

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
        sourceMessageType: null,
        vesselArea: null,
        currentDraughtMeters: null,
        callsign: null,
        aisType: null,
        aisFlag: null,
        lastPort: null,
        lastPortDeparture: null,
        detailsUrl: ship.detailsUrl || null
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
      sourceMessageType: ship.sourceMessageType || previousShip.sourceMessageType,
      vesselArea: ship.vesselArea || previousShip.vesselArea,
      currentDraughtMeters: ship.currentDraughtMeters ?? previousShip.currentDraughtMeters,
      callsign: ship.callsign || previousShip.callsign,
      aisType: ship.aisType || previousShip.aisType,
      aisFlag: ship.aisFlag || previousShip.aisFlag,
      lastPort: ship.lastPort || previousShip.lastPort,
      lastPortDeparture: ship.lastPortDeparture || previousShip.lastPortDeparture,
      detailsUrl: ship.detailsUrl || previousShip.detailsUrl
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
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeOptionalNumber(value) {
  const cleaned = cleanText(String(value ?? "").replace(/[^\d.-]/g, ""));
  return cleaned ? normalizeNumber(cleaned) : null;
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

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripTags(value) {
  return cleanText(decodeHtmlEntities(value.replace(/<[^>]+>/g, " ")));
}

function extractMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : null;
}

function dateFromMonthParts({ monthName, day, year, hour, minute, referenceDate, inferYear = true }) {
  const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    .indexOf(monthName.slice(0, 3).toLowerCase());
  if (month === -1) {
    return null;
  }

  let date = new Date(Date.UTC(year, month, Number(day), Number(hour), Number(minute)));
  if (!inferYear) {
    return date;
  }

  const sixMonthsMs = 1000 * 60 * 60 * 24 * 183;

  if (date.getTime() - referenceDate.getTime() > sixMonthsMs) {
    date = new Date(Date.UTC(year - 1, month, Number(day), Number(hour), Number(minute)));
  } else if (referenceDate.getTime() - date.getTime() > sixMonthsMs) {
    date = new Date(Date.UTC(year + 1, month, Number(day), Number(hour), Number(minute)));
  }

  return date;
}

function parseDetailsPageDate(value, referenceDate = new Date()) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }

  const normalized = cleaned.replace(/\s+UTC$/i, " UTC").replace(/,\s+/g, ", ");
  const withYear = normalized.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+UTC$/i);
  const withoutYear = normalized.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s+(\d{1,2}):(\d{2})\s+UTC$/i);
  const date = withYear
    ? dateFromMonthParts({
        monthName: withYear[1],
        day: withYear[2],
        year: Number(withYear[3]),
        hour: withYear[4],
        minute: withYear[5],
        referenceDate,
        inferYear: false
      })
    : withoutYear
      ? dateFromMonthParts({
          monthName: withoutYear[1],
          day: withoutYear[2],
          year: referenceDate.getUTCFullYear(),
          hour: withoutYear[3],
          minute: withoutYear[4],
          referenceDate
        })
      : new Date(normalized);
  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function parseDetailsPageEta(value, referenceDate = new Date()) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }

  const match = cleaned.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s+(\d{1,2}):(\d{2})$/i);
  if (!match) {
    return null;
  }
  const date = dateFromMonthParts({
    monthName: match[1],
    day: match[2],
    year: referenceDate.getUTCFullYear(),
    hour: match[3],
    minute: match[4],
    referenceDate
  });

  return !date || Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseRelativeAge(value, referenceDate = new Date()) {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }

  const match = cleaned.match(/(\d+)\s*(min|minute|minutes|hour|hours|day|days)\s+ago/i);
  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit.startsWith("min")
    ? 60 * 1000
    : unit.startsWith("hour")
      ? 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

  return new Date(referenceDate.getTime() - amount * multiplier).toISOString();
}

function extractDataJson(html) {
  const match = html.match(/<div[^>]+id=["']djson["'][^>]+data-json=(["'])(.*?)\1/i);
  if (!match) {
    return {};
  }

  try {
    return JSON.parse(decodeHtmlEntities(match[2]));
  } catch {
    return {};
  }
}

export function parseDisneyDestinyDetailsPage(html, referenceDate = new Date()) {
  const dataJson = extractDataJson(html);
  const intro = extractMatch(html, /<p[^>]+class=["']text2["'][^>]*>(.*?)<\/p>/is);
  const destination = extractMatch(
    html,
    /<div class=["']vilabel["']>Destination<\/div>[\s\S]*?<a[^>]+class=["']_npNa["'][^>]*>(.*?)<\/a>/i
  );
  const eta = extractMatch(html, /ETA:\s*([^<]+)</i);
  const positionReceived = html.match(/Position received[\s\S]*?data-title=["']([^"']+)["']/i)?.[1] || null;
  const lastSeen =
    parseDetailsPageDate(decodeHtmlEntities(positionReceived || ""), referenceDate) ||
    parseRelativeAge(dataJson.lrpd, referenceDate) ||
    parseRelativeAge(intro?.match(/reported\s+(.+?)\s+by AIS/i)?.[1], referenceDate);
  const vesselArea = intro?.match(/current position of DISNEY DESTINY is at (.+?) reported/i)?.[1] || null;
  const lastPort = extractMatch(
    html,
    /<div class=["']vilabel["']>Last Port<\/div>[\s\S]*?<a[^>]+class=["']_npNa["'][^>]*>(.*?)<\/a>/i
  );
  const lastPortDeparture = parseDetailsPageDate(
    extractMatch(html, /ATD:\s*([^<]+UTC)/i) || "",
    referenceDate
  );

  return {
    destination,
    eta: parseDetailsPageEta(eta, referenceDate),
    latitude: normalizeNumber(dataJson.ship_lat),
    longitude: normalizeNumber(dataJson.ship_lon),
    course: normalizeNumber(dataJson.ship_cog),
    speedKnots: normalizeNumber(dataJson.ship_sog),
    navigationStatus: extractMatch(html, /Navigation Status[\s\S]*?<td[^>]*class=["']v3["'][^>]*>([\s\S]*?)<\/td>/i),
    lastSeen,
    sourceMessageType: "VesselFinder details page",
    vesselArea: cleanText(vesselArea),
    currentDraughtMeters: normalizeOptionalNumber(
      extractMatch(html, /Current draught<\/td>\s*<td[^>]*>(.*?)<\/td>/i)
    ),
    callsign: extractMatch(html, /Callsign<\/td><td[^>]*>(.*?)<\/td>/i),
    aisType: extractMatch(html, /AIS Type<\/td><td[^>]*>(.*?)<\/td>/i),
    aisFlag: extractMatch(html, /AIS Flag<\/td><td[^>]*>(.*?)<\/td>/i),
    lastPort,
    lastPortDeparture,
    detailsUrl: process.env.DISNEY_DESTINY_DETAILS_URL || DISNEY_DESTINY_DETAILS_URL
  };
}

function compactUpdates(updates) {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== null && value !== undefined && value !== "")
  );
}

async function scrapeDisneyDestinyDetailsPage({ timeoutMs = 8000 }) {
  const response = await fetch(process.env.DISNEY_DESTINY_DETAILS_URL || DISNEY_DESTINY_DETAILS_URL, {
    headers: {
      "Accept": "text/html,application/xhtml+xml",
      "User-Agent": process.env.VESSELFINDER_DETAILS_USER_AGENT || DETAILS_PAGE_USER_AGENT
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`Disney Destiny details scrape returned ${response.status}.`);
  }

  const html = await response.text();
  const updates = compactUpdates(parseDisneyDestinyDetailsPage(html));
  if (updates.latitude == null && updates.longitude == null && !updates.destination && !updates.lastSeen) {
    throw new Error("Disney Destiny details scrape did not contain usable vessel data.");
  }

  return updates;
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
  let matchedRecords = 0;
  const errors = [];

  if (typeof fetch !== "function") {
    connectionState.status = "error";
    connectionState.lastError = "Fetch support is unavailable in this runtime.";
    return snapshot(shipState, connectionState);
  }

  if (apiKey) {
    try {
      connectionState.status = "requesting";
      const response = await fetch(getVesselFinderUrl(apiKey), {
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!response.ok) {
        errors.push(`VesselFinder returned ${response.status}.`);
      } else {
        const data = await response.json();
        if (data?.error || data?.ERROR) {
          errors.push(cleanText(data.error || data.ERROR) || "VesselFinder returned an error.");
        } else {
          const records = Array.isArray(data) ? data : [];

          for (const record of records) {
            if (applyVesselFinderRecord(record, shipState)) {
              matchedRecords += 1;
            }
          }
        }
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unable to reach VesselFinder.");
    }
  }

  if (process.env.VESSELFINDER_DETAILS_SCRAPE !== "false") {
    try {
      const destinyUpdates = await scrapeDisneyDestinyDetailsPage({
        timeoutMs: Math.min(timeoutMs, 8000)
      });
      applyShipUpdates(shipState, DISNEY_DESTINY_MMSI, destinyUpdates);
      matchedRecords += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Unable to scrape Disney Destiny details.");
    }
  }

  if (matchedRecords) {
    connectionState.status = "connected";
    connectionState.lastEventAt = new Date().toISOString();
    connectionState.lastError = null;
  } else if (!apiKey) {
    connectionState.status = "awaiting_api_key";
    connectionState.lastError = errors[0] || "Set VESSELFINDER_API_KEY before starting the app.";
  } else if (errors.length) {
    connectionState.status = "error";
    connectionState.lastError = errors.join(" ");
  } else {
    connectionState.status = "no_recent_vesselfinder_records";
    connectionState.lastError = null;
  }

  return snapshot(shipState, connectionState);
}
