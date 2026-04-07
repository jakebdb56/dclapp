const DISNEY_SAILING_SOURCE_URLS = [
  "https://disneycruise.disney.go.com/special-offers/domestic-special-rates/",
  "https://disneycruise.disney.go.com/special-offers/military-rates/",
  "https://disneycruise.disney.go.com/special-offers/canadian-resident-rates/",
  "https://disneycruise.disney.go.com/special-offers/florida-resident-rates/",
  "https://disneycruise.disney.go.com/special-offers/discount-plus-onboard-credit/",
  "https://disneycruise.disney.go.com/special-offers/military-onboard-credit-offer/",
  "https://disneycruise.disney.go.com/en-gb/special-offers/europe-special-rates/"
];

const SAILING_PROXY_PREFIX = "https://r.jina.ai/http://";
const SAILING_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";
const DISNEY_SHIP_NAME_PATTERN =
  "Disney-(?:Magic|Wonder|Dream|Fantasy|Wish|Treasure|Destiny|Adventure|Believe)";
const SAILING_LINK_PATTERN = new RegExp(
  `https://disneycruise\\.disney\\.go\\.com/cruises-destinations/list/([^/\\s)]+)/([^/\\s)]+)/` +
    `(\\d{4}-\\d{2}-\\d{2})-(${DISNEY_SHIP_NAME_PATTERN})(?:/)?`,
  "g"
);

function proxyUrl(url) {
  return `${SAILING_PROXY_PREFIX}${url.replace(/^https?:\/\//, "")}`;
}

function cleanText(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed || null;
}

function titleFromSlug(slug) {
  const normalized = decodeURIComponent(slug)
    .replace(/\+/g, " ")
    .replace(/%20/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return null;
  }

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeShipName(shipSlug) {
  return cleanText(decodeURIComponent(shipSlug).replace(/-/g, " "));
}

function parseDepartureDate(dateText) {
  const isoDate = cleanText(dateText);
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }

  return `${isoDate}T00:00:00.000Z`;
}

function extractNightCount(title) {
  const match = cleanText(title)?.match(/^(\d+)\s+Night\b/i);
  if (!match) {
    return null;
  }

  const nights = Number(match[1]);
  return Number.isFinite(nights) ? nights : null;
}

function addDays(isoValue, days) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function extractDeparturePort(title) {
  const match = cleanText(title)?.match(/\bCruise from (.+?)(?: ending in .+)?$/i);
  return match ? cleanText(match[1]) : null;
}

function normalizeDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function parseOfficialSailingsMarkdown(markdown, sourceUrl) {
  const text = typeof markdown === "string" ? markdown : "";
  const sailings = [];
  const seen = new Set();

  for (const match of text.matchAll(SAILING_LINK_PATTERN)) {
    const [url, sailingCode, titleSlug, departureDateText, shipSlug] = match;
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);

    const title = titleFromSlug(titleSlug);
    const departureDate = parseDepartureDate(departureDateText);
    const shipName = normalizeShipName(shipSlug);
    const nights = extractNightCount(title);
    const returnDate = departureDate && nights !== null ? addDays(departureDate, nights) : null;

    sailings.push({
      url,
      code: cleanText(sailingCode),
      title,
      departureDate,
      returnDate,
      shipName,
      departurePort: extractDeparturePort(title),
      nights,
      sourceUrl
    });
  }

  return sailings;
}

async function fetchSailingSource(url, { timeoutMs }) {
  const response = await fetch(proxyUrl(url), {
    headers: {
      "Accept": "text/plain",
      "User-Agent": SAILING_USER_AGENT
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!response.ok) {
    throw new Error(`Sailing source returned ${response.status} for ${url}.`);
  }

  return response.text();
}

export async function collectOfficialSailings({
  timeoutMs = 8000
} = {}) {
  if (typeof fetch !== "function") {
    return [];
  }

  const results = await Promise.allSettled(
    DISNEY_SAILING_SOURCE_URLS.map(async (url) => {
      const markdown = await fetchSailingSource(url, { timeoutMs });
      return parseOfficialSailingsMarkdown(markdown, url);
    })
  );

  const deduped = new Map();
  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }

    for (const sailing of result.value) {
      if (sailing?.url) {
        deduped.set(sailing.url, sailing);
      }
    }
  }

  return Array.from(deduped.values());
}

export function findActiveSailingForShip(ship, sailings, referenceDate = new Date()) {
  const shipName = cleanText(ship?.name);
  const dayKey = normalizeDateKey(referenceDate);
  if (!shipName || !dayKey) {
    return null;
  }

  const matches = sailings.filter((sailing) => {
    if (
      cleanText(sailing?.shipName) !== shipName ||
      !sailing?.url ||
      !sailing?.title ||
      !sailing?.departureDate ||
      !sailing?.returnDate
    ) {
      return false;
    }

    const departureKey = normalizeDateKey(sailing.departureDate);
    const returnKey = normalizeDateKey(sailing.returnDate);
    return Boolean(departureKey && returnKey && departureKey <= dayKey && dayKey <= returnKey);
  });

  return matches.length === 1 ? matches[0] : null;
}

export function attachActiveSailingsToSnapshot(snapshot, sailings, referenceDate = new Date()) {
  if (!snapshot?.ships?.length) {
    return snapshot;
  }

  return {
    ...snapshot,
    ships: snapshot.ships.map((ship) => ({
      ...ship,
      activeSailing: findActiveSailingForShip(ship, sailings, referenceDate)
    }))
  };
}
