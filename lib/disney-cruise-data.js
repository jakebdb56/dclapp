export const DISNEY_SHIPS = [
  {
    mmsi: "308516000",
    imo: "9126807",
    name: "Disney Magic",
    className: "Magic Class",
    homeRegion: "Caribbean / Alaska",
    fleetOrder: 1,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/magic/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9126807"
  },
  {
    mmsi: "308457000",
    imo: "9126819",
    name: "Disney Wonder",
    className: "Magic Class",
    homeRegion: "West Coast / Alaska",
    fleetOrder: 2,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/wonder/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9126819"
  },
  {
    mmsi: "311042900",
    imo: "9434254",
    name: "Disney Dream",
    className: "Dream Class",
    homeRegion: "Florida / Bahamas",
    fleetOrder: 3,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/dream/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9434254"
  },
  {
    mmsi: "311058700",
    imo: "9445590",
    name: "Disney Fantasy",
    className: "Dream Class",
    homeRegion: "Florida / Caribbean",
    fleetOrder: 4,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/fantasy/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9445590"
  },
  {
    mmsi: "311001098",
    imo: "9834739",
    name: "Disney Wish",
    className: "Wish Class",
    homeRegion: "Port Canaveral",
    fleetOrder: 5,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/wish/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9834739"
  },
  {
    mmsi: "311001221",
    imo: "9834753",
    name: "Disney Treasure",
    className: "Wish Class",
    homeRegion: "Port Canaveral",
    fleetOrder: 6,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/treasure/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9834753"
  },
  {
    mmsi: "311001540",
    imo: "9834741",
    name: "Disney Destiny",
    className: "Wish Class",
    homeRegion: "Fort Lauderdale",
    fleetOrder: 7,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/destiny/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9834741"
  },
  {
    mmsi: "311000934",
    imo: "9808986",
    name: "Disney Adventure",
    className: "Global Class",
    homeRegion: "Singapore",
    fleetOrder: 8,
    officialShipUrl: "https://disneycruise.disney.go.com/ships/adventure/",
    detailsUrl: "https://www.vesselfinder.com/vessels/details/9808986"
  }
];

const DETAILS_PAGE_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";
const VESSELFINDER_MAP_LOCATION_URL = "https://www.vesselfinder.com/api/pub/ml";

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

export function createConnectionState() {
  return {
    status: "connecting",
    lastEventAt: null,
    lastError: null,
    startedAt: new Date().toISOString(),
    reconnectCount: 0,
    pollMode: "request",
    provider: "VesselFinder details pages"
  };
}

export function snapshot(shipState, connectionState, ports = []) {
  return {
    connection: connectionState,
    ships: Array.from(shipState.values()).sort((a, b) =>
      (a.fleetOrder ?? Number.MAX_SAFE_INTEGER) - (b.fleetOrder ?? Number.MAX_SAFE_INTEGER)
      || a.name.localeCompare(b.name)
    ),
    ports
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
    ships,
    ports: nextSnapshot.ports?.length ? nextSnapshot.ports : previousSnapshot.ports || []
  };
}

function cleanText(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/@+/g, " ").replace(/\s+/g, " ").trim();
  return trimmed || null;
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

function extractMarkdownLine(markdown, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^${escaped}\\s+(.+)$`, "im"));
  return match ? cleanText(match[1]) : null;
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

export function parseVesselDetailsPage(html, ship, referenceDate = new Date()) {
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
  const vesselArea = intro?.match(/current position of .*? is at (.+?) reported/i)?.[1] || null;
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
    detailsUrl: ship.detailsUrl
  };
}

export function parseVesselDetailsMarkdown(markdown, ship, referenceDate = new Date()) {
  const intro = markdown.match(/The current position of \*\*.*?\*\* is at (.+?) reported (.+?) by AIS\./i);
  const destination = markdown.match(/en route to the port of \*\*(.*?)\*\*/i)?.[1] || null;
  const speed = markdown.match(/sailing at a speed of ([\d.]+) knots/i)?.[1] || null;
  const eta = markdown.match(/expected to arrive there on \*\*(.*?)\*\*/i)?.[1] || null;
  const courseSpeed = markdown.match(/Course \/ Speed\s+([\d.]+).+?\/\s*([\d.]+)\s*kn/i);
  const positionReceived = extractMarkdownLine(markdown, "Position received");

  return {
    destination: cleanText(destination),
    eta: parseDetailsPageEta(eta, referenceDate),
    course: normalizeNumber(courseSpeed?.[1]),
    speedKnots: normalizeNumber(speed || courseSpeed?.[2]),
    navigationStatus: extractMarkdownLine(markdown, "Navigation Status"),
    lastSeen: parseRelativeAge(positionReceived, referenceDate) || parseRelativeAge(intro?.[2], referenceDate),
    sourceMessageType: "VesselFinder details text",
    vesselArea: cleanText(intro?.[1]),
    currentDraughtMeters: normalizeOptionalNumber(extractMarkdownLine(markdown, "Current draught")),
    callsign: extractMarkdownLine(markdown, "Callsign"),
    aisType: extractMarkdownLine(markdown, "AIS Type"),
    aisFlag: extractMarkdownLine(markdown, "AIS Flag"),
    detailsUrl: ship.detailsUrl
  };
}

function compactUpdates(updates) {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== null && value !== undefined && value !== "")
  );
}

function decodeMapLocationResponse(buffer, ship) {
  const view = new DataView(buffer);
  if (view.byteLength === 2) {
    throw new Error(`${ship.name} map location is unavailable.`);
  }

  if (view.byteLength < 16) {
    throw new Error(`${ship.name} map location response was incomplete.`);
  }

  const flags = view.getInt8(0);
  const nameLength = view.getInt8(11);
  const titleStart = 12;
  const timestampStart = titleStart + nameLength;
  const title =
    timestampStart <= view.byteLength
      ? String.fromCharCode(...new Uint8Array(buffer, titleStart, nameLength))
      : ship.name;

  return compactUpdates({
    latitude: view.getInt32(7) / 600000,
    longitude: view.getInt32(3) / 600000,
    speedKnots: view.getInt16(1) / 10,
    sourceMessageType: "VesselFinder map location",
    navigationStatus: flags & 2 ? "SAR" : null,
    vesselArea: cleanText(title),
    detailsUrl: ship.detailsUrl
  });
}

async function scrapeVesselMapLocation(ship, { timeoutMs = 3500 }) {
  const response = await fetch(`${VESSELFINDER_MAP_LOCATION_URL}/${encodeURIComponent(ship.mmsi)}`, {
    headers: {
      "Accept": "application/octet-stream",
      "Referer": `https://www.vesselfinder.com/?imo=${encodeURIComponent(ship.imo || ship.mmsi)}`,
      "User-Agent": process.env.VESSELFINDER_DETAILS_USER_AGENT || DETAILS_PAGE_USER_AGENT
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`${ship.name} map location returned ${response.status}.`);
  }

  return decodeMapLocationResponse(await response.arrayBuffer(), ship);
}

async function scrapeVesselDetailsPage(ship, { timeoutMs = 8000 }) {
  let htmlError = null;

  try {
    const response = await fetch(ship.detailsUrl, {
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": process.env.VESSELFINDER_DETAILS_USER_AGENT || DETAILS_PAGE_USER_AGENT
      },
      signal: AbortSignal.timeout(Math.min(timeoutMs, 3500))
    });

    if (!response.ok) {
      throw new Error(`${ship.name} details scrape returned ${response.status}.`);
    }

    const html = await response.text();
    const updates = compactUpdates(parseVesselDetailsPage(html, ship));
    if (updates.latitude != null || updates.longitude != null || updates.destination || updates.lastSeen) {
      return updates;
    }

    htmlError = new Error(`${ship.name} details scrape did not contain usable vessel data.`);
  } catch (error) {
    htmlError = error;
  }

  const fallbackUrl = `https://r.jina.ai/http://${ship.detailsUrl}`;
  const fallbackResponse = await fetch(fallbackUrl, {
    headers: {
      "Accept": "text/plain",
      "User-Agent": process.env.VESSELFINDER_DETAILS_USER_AGENT || DETAILS_PAGE_USER_AGENT
    },
    signal: AbortSignal.timeout(Math.max(1000, timeoutMs - 3500))
  });

  if (!fallbackResponse.ok) {
    throw htmlError || new Error(`${ship.name} details text scrape returned ${fallbackResponse.status}.`);
  }

  const markdown = await fallbackResponse.text();
  const fallbackUpdates = compactUpdates(parseVesselDetailsMarkdown(markdown, ship));
  if (
    fallbackUpdates.latitude == null &&
    fallbackUpdates.longitude == null &&
    !fallbackUpdates.destination &&
    !fallbackUpdates.lastSeen
  ) {
    throw htmlError || new Error(`${ship.name} details text scrape did not contain usable vessel data.`);
  }

  return fallbackUpdates;
}

export async function collectDisneySnapshot({
  timeoutMs = 8000
} = {}) {
  const shipState = createShipState();
  const connectionState = createConnectionState();
  let matchedRecords = 0;
  const errors = [];

  if (typeof fetch !== "function") {
    connectionState.status = "error";
    connectionState.lastError = "Fetch support is unavailable in this runtime.";
    return snapshot(shipState, connectionState);
  }

  const scrapeResults = await Promise.allSettled(
    DISNEY_SHIPS.map(async (ship) => {
      const sourceResults = await Promise.allSettled([
        scrapeVesselDetailsPage(ship, {
          timeoutMs
        }),
        scrapeVesselMapLocation(ship, {
          timeoutMs: Math.min(timeoutMs, 3500)
        })
      ]);
      const updates = sourceResults.reduce(
        (merged, result) => (result.status === "fulfilled" ? { ...merged, ...result.value } : merged),
        {}
      );

      if (!Object.keys(updates).length) {
        const messages = sourceResults.map((result) =>
          result.status === "rejected" && result.reason instanceof Error
            ? result.reason.message
            : "Unable to scrape vessel source."
        );
        throw new Error(messages.join(" "));
      }

      return { ship, updates };
    })
  );

  for (const result of scrapeResults) {
    if (result.status === "fulfilled") {
      applyShipUpdates(shipState, result.value.ship.mmsi, result.value.updates);
      matchedRecords += 1;
    } else {
      errors.push(result.reason instanceof Error ? result.reason.message : "Unable to scrape vessel details.");
    }
  }

  if (matchedRecords) {
    connectionState.status = "connected";
    connectionState.lastEventAt = new Date().toISOString();
    connectionState.lastError = null;
  } else if (errors.length) {
    connectionState.status = "error";
    connectionState.lastError = errors.join(" ");
  } else {
    connectionState.status = "no_recent_scraped_records";
    connectionState.lastError = null;
  }

  return snapshot(shipState, connectionState);
}
