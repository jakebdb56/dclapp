const DISNEY_PORTS_BASE_URL = "https://disneycruise.disney.go.com";
const DISNEY_PORTS_OVERVIEW_BASE_URL = `${DISNEY_PORTS_BASE_URL}/en-us`;
const DISNEY_PORTS_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36";

const DESTINATION_OVERVIEWS = [
  ["alaska", "Alaska"],
  ["bahamas", "Bahamas"],
  ["bermuda", "Bermuda"],
  ["canada", "Canada"],
  ["caribbean", "Caribbean"],
  ["europe", "Europe"],
  ["hawaii", "Hawaii"],
  ["mexico", "Mexico"],
  ["new-zealand-australia", "New Zealand and Australia"],
  ["pacific-coast", "Pacific Coast"],
  ["panama-canal", "Panama Canal"],
  ["singapore", "Singapore"],
  ["south-pacific", "South Pacific"],
  ["transatlantic", "Transatlantic"]
];

const KNOWN_PORTS = [
  ["Amsterdam, Netherlands", 52.3791, 4.8994, ["amsterdam"]],
  ["Astoria, Oregon", 46.1879, -123.8313, ["astoria"]],
  ["Auckland, New Zealand", -36.8406, 174.7633, ["auckland"]],
  ["Barcelona, Spain", 41.3525, 2.1586, ["barcelona"]],
  ["Basseterre, St. Kitts", 17.2948, -62.725, ["basseterre", "st kitts", "saint kitts"]],
  ["Bergen, Norway", 60.3925, 5.3221, ["bergen"]],
  ["Bridgetown, Barbados", 13.106, -59.6305, ["bridgetown", "barbados"]],
  ["Brisbane, Australia", -27.381, 153.165, ["brisbane"]],
  ["Cabo San Lucas, Mexico", 22.8809, -109.9046, ["cabo san lucas"]],
  ["Cagliari, Sardinia, Italy", 39.213, 9.111, ["cagliari", "sardinia"]],
  ["Cartagena, Colombia", 10.391, -75.521, ["cartagena colombia"]],
  ["Castaway Cay, Bahamas", 26.0842, -77.5331, ["castaway cay", "gorda cay"]],
  ["Chania, Greece", 35.516, 24.018, ["chania", "souda"]],
  ["Charlottetown, Prince Edward Island", 46.235, -63.126, ["charlottetown"]],
  ["Christchurch, New Zealand", -43.6029, 172.7206, ["christchurch", "lyttelton"]],
  ["Civitavecchia, Italy", 42.093, 11.791, ["civitavecchia", "rome"]],
  ["Copenhagen, Denmark", 55.685, 12.599, ["copenhagen"]],
  ["Costa Maya, Mexico", 18.7331, -87.695, ["costa maya", "mahahual"]],
  ["Cozumel, Mexico", 20.5128, -86.9499, ["cozumel"]],
  ["Disney Lookout Cay at Lighthouse Point, Bahamas", 24.6193, -76.1636, [
    "lookout cay",
    "lighthouse point",
    "eleuthera"
  ]],
  ["Dover, England", 51.1279, 1.3134, ["dover"]],
  ["Dubrovnik, Croatia", 42.658, 18.086, ["dubrovnik"]],
  ["Eden, Australia", -37.0662, 149.9077, ["eden"]],
  ["Ensenada, Mexico", 31.8578, -116.6246, ["ensenada"]],
  ["Falmouth, Jamaica", 18.491, -77.655, ["falmouth"]],
  ["Fiordland National Park, New Zealand", -45.4167, 167.7167, ["fiordland"]],
  ["Fort Lauderdale, Florida", 26.0916, -80.1219, ["fort lauderdale", "port everglades", "everglades"]],
  ["Galveston, Texas", 29.3102, -94.7937, ["galveston"]],
  ["Geiranger, Norway", 62.1014, 7.2058, ["geiranger"]],
  ["George Town, Grand Cayman", 19.2866, -81.3744, ["george town", "grand cayman"]],
  ["Genoa, Italy", 44.4097, 8.916, ["genoa", "genova"]],
  ["Halifax, Nova Scotia", 44.6488, -63.5752, ["halifax"]],
  ["Hobart, Tasmania, Australia", -42.8821, 147.3272, ["hobart", "tasmania"]],
  ["Honolulu, Hawaii", 21.3069, -157.8583, ["honolulu"]],
  ["Icy Strait Point, Alaska", 58.1283, -135.4611, ["icy strait point", "hoonah"]],
  ["Isafjordur, Iceland", 66.0749, -23.1353, ["isafjordur"]],
  ["Juneau, Alaska", 58.2985, -134.414, ["juneau"]],
  ["Kahului, Maui, Hawaii", 20.895, -156.476, ["kahului"]],
  ["Ketchikan, Alaska", 55.3422, -131.6461, ["ketchikan"]],
  ["Key West, Florida", 24.5551, -81.78, ["key west"]],
  ["King's Wharf, Bermuda", 32.3273, -64.8326, ["king s wharf", "kings wharf", "royal naval dockyard", "bermuda"]],
  ["Kirkwall, Scotland", 58.9847, -2.9587, ["kirkwall", "orkney"]],
  ["Kralendijk, Bonaire", 12.1517, -68.276, ["kralendijk", "bonaire"]],
  ["La Rochelle, France", 46.157, -1.151, ["la rochelle"]],
  ["Lahaina, Maui, Hawaii", 20.8783, -156.6825, ["lahaina", "maui"]],
  ["Lautoka, Fiji", -17.6044, 177.4386, ["lautoka", "lautooka"]],
  ["Lisbon, Portugal", 38.7072, -9.1355, ["lisbon"]],
  ["Livorno, Italy", 43.551, 10.3017, ["livorno", "florence", "pisa"]],
  ["Malaga, Spain", 36.716, -4.418, ["malaga"]],
  ["Marseille, France", 43.3032, 5.3616, ["marseille"]],
  ["Melbourne, Australia", -37.8409, 144.9303, ["melbourne"]],
  ["Messina, Sicily, Italy", 38.1938, 15.554, ["messina", "sicily"]],
  ["Miami, Florida", 25.7781, -80.1794, ["miami"]],
  ["Mykonos, Greece", 37.4655, 25.3286, ["mykonos"]],
  ["Naples, Italy", 40.8407, 14.2676, ["naples", "napoli"]],
  ["Nassau, Bahamas", 25.0781, -77.3412, ["nassau"]],
  ["Napier, New Zealand", -39.4753, 176.9218, ["napier"]],
  ["New Orleans, Louisiana", 29.9511, -90.063, ["new orleans"]],
  ["New York, New York", 40.7648, -74.0018, ["new york"]],
  ["New Plymouth, New Zealand", -39.0556, 174.0752, ["new plymouth"]],
  ["Noumea, New Caledonia", -22.2758, 166.458, ["noumea"]],
  ["Pago Pago, American Samoa", -14.2756, -170.702, ["pago pago"]],
  ["Palma de Mallorca, Spain", 39.5528, 2.6397, ["palma", "mallorca"]],
  ["Papeete, Tahiti, French Polynesia", -17.535, -149.5696, ["papeete", "tahiti"]],
  ["Philipsburg, St. Maarten", 18.024, -63.0458, ["philipsburg", "st maarten", "saint maarten"]],
  ["Piraeus, Greece", 37.9445, 23.6408, ["piraeus", "athens"]],
  ["Port Canaveral, Florida", 28.4104, -80.6188, ["port canaveral", "cape canaveral"]],
  ["Port Douglas, Australia", -16.4846, 145.462, ["port douglas"]],
  ["Portsmouth, England", 50.812, -1.094, ["portsmouth"]],
  ["Progreso, Mexico", 21.3036, -89.6652, ["progreso"]],
  ["Reykjavik, Iceland", 64.1502, -21.9321, ["reykjavik"]],
  ["Road Town, Tortola", 18.4241, -64.6185, ["road town", "tortola"]],
  ["San Diego, California", 32.7157, -117.1746, ["san diego"]],
  ["San Francisco, California", 37.8087, -122.4098, ["san francisco"]],
  ["San Juan, Puerto Rico", 18.4602, -66.1057, ["san juan"]],
  ["Santorini, Greece", 36.4166, 25.4324, ["santorini", "thira"]],
  ["Seattle, Washington", 47.6061, -122.3412, ["seattle"]],
  ["Singapore", 1.2644, 103.8207, ["singapore"]],
  ["Sitka, Alaska", 57.0516, -135.3376, ["sitka"]],
  ["Skagway, Alaska", 59.4504, -135.3269, ["skagway"]],
  ["Southampton, England", 50.9008, -1.4136, ["southampton"]],
  ["St. John's, Antigua", 17.1274, -61.8468, ["st john s", "saint john s", "antigua"]],
  ["St. Thomas, U.S. Virgin Islands", 18.3358, -64.9307, ["st thomas", "saint thomas", "charlotte amalie"]],
  ["Suva, Fiji", -18.1248, 178.438, ["suva"]],
  ["Sydney, Australia", -33.8587, 151.2101, ["sydney"]],
  ["Tauranga, New Zealand", -37.662, 176.177, ["tauranga"]],
  ["Valletta, Malta", 35.8989, 14.5146, ["valletta", "malta"]],
  ["Vancouver, British Columbia", 49.2897, -123.1119, ["vancouver"]],
  ["Victoria, British Columbia", 48.4213, -123.3721, ["victoria"]],
  ["Villefranche, France", 43.7034, 7.3128, ["villefranche", "monte carlo", "nice"]],
  ["Wellington, New Zealand", -41.2858, 174.7787, ["wellington"]],
  ["Zeebrugge, Belgium", 51.3356, 3.2078, ["zeebrugge", "brussels", "bruges"]]
];

const KNOWN_PORTS_BY_ALIAS = new Map(
  KNOWN_PORTS.flatMap(([name, latitude, longitude, aliases]) =>
    [name, ...aliases].map((alias) => [
      normalizePortName(alias),
      { name, latitude, longitude }
    ])
  )
);

function cleanText(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed || null;
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

function absolutePortUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, DISNEY_PORTS_BASE_URL).toString();
  } catch {
    return null;
  }
}

function normalizePortName(value) {
  return cleanText(value)
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(the\s+)?port\s+of\b/g, " ")
    .replace(/\bdisney\b/g, " ")
    .replace(/\bu\.s\./g, "us")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || null;
}

function coordinateForPort(name) {
  const normalized = normalizePortName(name);
  if (!normalized) {
    return null;
  }

  const direct = KNOWN_PORTS_BY_ALIAS.get(normalized);
  if (direct) {
    return direct;
  }

  for (const [alias, coordinate] of KNOWN_PORTS_BY_ALIAS) {
    if (alias.length >= 6 && (normalized.includes(alias) || alias.includes(normalized))) {
      return coordinate;
    }
  }

  return null;
}

function slugFromUrl(url) {
  return url?.match(/\/ports\/([^/]+)\//i)?.[1] || null;
}

function isOverviewSectionHeading(value) {
  return /^(destination details|things to see and do|port adventures|travel information|search cruises|ports of call)$/i
    .test(value);
}

function portUrlFromHtmlBlock(value) {
  const match = value?.match(/<a[^>]+href=["']([^"']*\/ports\/(?!overview\/)[^"']+)["'][^>]*>/i);
  return absolutePortUrl(match?.[1]);
}

function portUrlFromMarkdownBlock(value) {
  const match = value?.match(/\[[^\]]*\]\(([^)]*\/ports\/(?!overview\/)[^)]*)\)/i);
  return absolutePortUrl(match?.[1]);
}

function makePortId(port) {
  return normalizePortName(port.detailUrl ? slugFromUrl(port.detailUrl) || port.name : port.name)
    ?.replace(/\s+/g, "-") || null;
}

function hasPortCoordinate(port) {
  return port.latitude !== null && port.longitude !== null;
}

function mergePort(existing, next) {
  return {
    ...existing,
    ...next,
    regions: Array.from(new Set([...(existing?.regions || []), ...(next.regions || [])])).sort(),
    latitude: next.latitude ?? existing?.latitude ?? null,
    longitude: next.longitude ?? existing?.longitude ?? null,
    detailUrl: next.detailUrl || existing?.detailUrl || null
  };
}

export function parseDisneyPortsOverview(html, overview) {
  const ports = [];
  const seenNames = new Set();
  const headingBlockPattern = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3\b|$)/gi;
  const linkPattern = /<a[^>]+href=["']([^"']*\/ports\/(?!overview\/)[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(linkPattern)) {
    const name = stripTags(match[2]);
    if (!name || !coordinateForPort(name) || seenNames.has(name)) {
      continue;
    }

    seenNames.add(name);
    ports.push({
      name,
      detailUrl: absolutePortUrl(match[1]),
      regions: [overview.label]
    });
  }

  for (const match of html.matchAll(headingBlockPattern)) {
    const name = stripTags(match[1]);
    if (!name || seenNames.has(name) || isOverviewSectionHeading(name)) {
      continue;
    }

    seenNames.add(name);
    ports.push({
      name,
      detailUrl: portUrlFromHtmlBlock(match[2]),
      regions: [overview.label]
    });
  }

  return ports
    .map((port) => {
      const coordinate = coordinateForPort(port.name);
      const canonicalName = coordinate?.name || port.name;
      return {
        ...port,
        id: makePortId({ ...port, name: canonicalName }),
        name: canonicalName,
        latitude: coordinate?.latitude ?? null,
        longitude: coordinate?.longitude ?? null,
        source: "Disney Cruise Line ports page"
      };
    })
    .filter((port) => port.id);
}

export function parseDisneyPortsMarkdown(markdown, overview) {
  const ports = [];
  const seenNames = new Set();
  const headingBlockPattern = /(?:^|\n)###\s+(.+)\n([\s\S]*?)(?=\n###\s+|$)/g;

  for (const match of markdown.matchAll(headingBlockPattern)) {
    const name = cleanText(match[1]?.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
    if (!name || seenNames.has(name) || isOverviewSectionHeading(name)) {
      continue;
    }

    seenNames.add(name);
    ports.push({
      name,
      detailUrl: portUrlFromMarkdownBlock(match[2]),
      regions: [overview.label]
    });
  }

  return ports
    .map((port) => {
      const coordinate = coordinateForPort(port.name);
      const canonicalName = coordinate?.name || port.name;
      return {
        ...port,
        id: makePortId({ ...port, name: canonicalName }),
        name: canonicalName,
        latitude: coordinate?.latitude ?? null,
        longitude: coordinate?.longitude ?? null,
        source: "Disney Cruise Line ports page"
      };
    })
    .filter((port) => port.id);
}

async function fetchDisneyPortsOverview(overview, { timeoutMs }) {
  const url = `${DISNEY_PORTS_OVERVIEW_BASE_URL}/ports/overview/${overview.slug}/`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": process.env.DISNEY_PORTS_USER_AGENT || DISNEY_PORTS_USER_AGENT
      },
      signal: AbortSignal.timeout(Math.max(1000, Math.floor(timeoutMs / 2)))
    });

    if (!response.ok) {
      throw new Error(`Disney ports overview ${overview.label} returned ${response.status}.`);
    }

    const ports = parseDisneyPortsOverview(await response.text(), {
      ...overview,
      url
    });
    if (ports.length) {
      return ports;
    }
  } catch {
    // Disney can redirect-loop in non-browser fetch clients; try the text reader next.
  }

  const readerUrl = `https://r.jina.ai/http://${url}`;
  const fallbackResponse = await fetch(readerUrl, {
    headers: {
      "Accept": "text/plain",
      "User-Agent": process.env.DISNEY_PORTS_USER_AGENT || DISNEY_PORTS_USER_AGENT
    },
    signal: AbortSignal.timeout(Math.max(1000, Math.floor(timeoutMs / 2)))
  });

  if (!fallbackResponse.ok) {
    throw new Error(`Disney ports overview text ${overview.label} returned ${fallbackResponse.status}.`);
  }

  return parseDisneyPortsMarkdown(await fallbackResponse.text(), {
    ...overview,
    url
  });
}

export function mergePorts(portGroups) {
  const ports = new Map();

  for (const port of portGroups.flat()) {
    const key = hasPortCoordinate(port)
      ? `${port.latitude.toFixed(4)},${port.longitude.toFixed(4)}`
      : normalizePortName(port.name);
    ports.set(key, mergePort(ports.get(key), port));
  }

  return Array.from(ports.values())
    .filter(hasPortCoordinate)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function collectDisneyPorts({ timeoutMs = 8000 } = {}) {
  if (typeof fetch !== "function") {
    return FALLBACK_DISNEY_PORTS;
  }

  const results = await Promise.allSettled(
    DESTINATION_OVERVIEWS.map(([slug, label]) =>
      fetchDisneyPortsOverview({ slug, label }, { timeoutMs })
    )
  );

  const ports = mergePorts(
    results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
  );
  return ports.length ? ports : FALLBACK_DISNEY_PORTS;
}

export const FALLBACK_DISNEY_PORTS = mergePorts(
  KNOWN_PORTS.map(([name, latitude, longitude]) => [
    {
      id: makePortId({ name }),
      name,
      latitude,
      longitude,
      regions: [],
      detailUrl: null,
      source: "Local Disney ports coordinate catalog"
    }
  ])
);
