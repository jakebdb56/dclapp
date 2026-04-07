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
  ["transatlantic", "Transatlantic"],
  [
    "departure-ports",
    "Departure Ports",
    `${DISNEY_PORTS_BASE_URL}/ports/overview/departure-ports/`
  ]
];

const KNOWN_PORTS = [
  ["Ajaccio, Corsica, France", 41.9189, 8.7386, ["ajaccio", "corsica", "ajaccio france"]],
  ["Alesund, Norway", 62.4722, 6.1495, ["alesund", "alesund norway"]],
  ["Astoria, Oregon", 46.1879, -123.8313, ["astoria"]],
  ["Auckland, New Zealand", -36.8406, 174.7633, ["auckland"]],
  ["Baie-Comeau, Quebec", 49.2213, -68.1489, ["baie comeau", "baie comeau quebec", "baie comeau quebec canada"]],
  ["Barcelona, Spain", 41.3525, 2.1586, ["barcelona"]],
  ["Bar Harbor, Maine", 44.392, -68.2043, ["bar harbor"]],
  ["Basseterre, St. Kitts", 17.2948, -62.725, ["basseterre", "st kitts", "saint kitts"]],
  ["Bergen, Norway", 60.3925, 5.3221, ["bergen"]],
  ["Bilbao, Spain", 43.263, -2.935, ["bilbao"]],
  ["Bridgetown, Barbados", 13.106, -59.6305, ["bridgetown", "barbados"]],
  ["Brisbane, Australia", -27.381, 153.165, ["brisbane"]],
  ["Cabo San Lucas, Mexico", 22.8809, -109.9046, ["cabo san lucas"]],
  ["Cadiz, Spain", 36.535, -6.288, ["cadiz"]],
  ["Cagliari, Sardinia, Italy", 39.213, 9.111, ["cagliari", "sardinia"]],
  ["Cartagena, Colombia", 10.391, -75.521, ["cartagena colombia"]],
  ["Cartagena, Spain", 37.599, -0.981, ["cartagena spain"]],
  ["Castaway Cay, Bahamas", 26.0842, -77.5331, ["castaway cay", "gorda cay"]],
  ["Castries, St. Lucia", 14.0101, -60.9875, ["castries", "st lucia", "saint lucia"]],
  ["Catalina Island, California", 33.3458, -118.3258, ["catalina island", "avalon"]],
  ["Catania, Sicily, Italy", 37.5027, 15.0873, ["catania", "catania italy"]],
  ["Chania, Greece", 35.516, 24.018, ["chania", "souda"]],
  ["Cherbourg, France", 49.646, -1.618, ["cherbourg"]],
  ["Charlottetown, Prince Edward Island", 46.235, -63.126, ["charlottetown"]],
  ["Christchurch, New Zealand", -43.6029, 172.7206, ["christchurch", "lyttelton"]],
  ["Civitavecchia, Italy", 42.093, 11.791, ["civitavecchia", "rome"]],
  ["Cobh, Ireland", 51.849, -8.294, ["cobh", "cork", "cobh ireland"]],
  ["Copenhagen, Denmark", 55.685, 12.599, ["copenhagen"]],
  ["Corfu, Greece", 39.6243, 19.9217, ["corfu"]],
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
  ["Fort-de-France, Martinique", 14.601, -61.074, ["fort de france", "martinique"]],
  ["Funchal, Madeira, Portugal", 32.6477, -16.9089, ["funchal", "madeira"]],
  ["Galveston, Texas", 29.3102, -94.7937, ["galveston"]],
  ["George Town, Grand Cayman", 19.2866, -81.3744, ["george town", "grand cayman"]],
  ["Genoa, Italy", 44.4097, 8.916, ["genoa", "genova"]],
  ["Gibraltar", 36.1408, -5.3536, ["gibraltar", "gibraltar uk"]],
  ["Glacier Viewing, Stikine Icecap", 57.066, -132.05, ["glacier viewing", "stikine icecap", "glacier viewing stikine icecap"]],
  ["Gothenburg, Sweden", 57.7089, 11.9746, ["gothenburg"]],
  ["Greenock, Scotland", 55.956, -4.761, ["greenock"]],
  ["Halifax, Nova Scotia", 44.6488, -63.5752, ["halifax"]],
  ["Hamburg, Germany", 53.5461, 9.9661, ["hamburg"]],
  ["Haugesund, Norway", 59.414, 5.267, ["haugesund"]],
  ["Hebrides, Scotland", 58.209, -6.389, ["hebrides", "stornoway"]],
  ["Helsinki, Finland", 60.1675, 24.9525, ["helsinki"]],
  ["Heraklion, Crete, Greece", 35.34, 25.134, ["heraklion", "crete"]],
  ["Hilo, Hawaii", 19.7303, -155.0672, ["hilo", "hawaii island"]],
  ["Hobart, Tasmania, Australia", -42.8821, 147.3272, ["hobart", "tasmania"]],
  ["Honolulu, Hawaii", 21.3069, -157.8583, ["honolulu", "oahu"]],
  ["Ibiza, Spain", 38.909, 1.438, ["ibiza"]],
  ["Icy Strait Point, Alaska", 58.1283, -135.4611, ["icy strait point", "hoonah"]],
  ["Invergordon, Scotland", 57.689, -4.168, ["invergordon"]],
  ["Isafjordur, Iceland", 66.0749, -23.1353, ["isafjordur"]],
  ["Juneau, Alaska", 58.2985, -134.414, ["juneau"]],
  ["Kahului, Maui, Hawaii", 20.895, -156.476, ["kahului"]],
  ["Katakolon, Greece", 37.646, 21.3205, ["katakolon"]],
  ["Kefalonia, Greece", 38.175, 20.489, ["kefalonia"]],
  ["Ketchikan, Alaska", 55.3422, -131.6461, ["ketchikan"]],
  ["Kiel, Germany", 54.3233, 10.1394, ["kiel"]],
  ["King's Wharf, Bermuda", 32.3273, -64.8326, ["king s wharf", "kings wharf", "kings warf", "royal naval dockyard", "bermuda"]],
  ["Kirkwall, Scotland", 58.9847, -2.9587, ["kirkwall", "orkney"]],
  ["Kotka, Finland", 60.467, 26.945, ["kotka"]],
  ["Kralendijk, Bonaire", 12.1517, -68.276, ["kralendijk", "bonaire"]],
  ["Kristiansand, Norway", 58.146, 7.995, ["kristiansand", "kristiansend"]],
  ["Kusadasi, Turkey", 37.862, 27.256, ["kusadasi"]],
  ["La Coruna, Spain", 43.3713, -8.396, ["la coruna", "a coruna"]],
  ["La Rochelle, France", 46.157, -1.151, ["la rochelle"]],
  ["La Spezia, Italy", 44.102, 9.824, ["la spezia", "florence", "pisa"]],
  ["Le Havre, France", 49.491, 0.107, ["le havre", "paris"]],
  ["Lisbon, Portugal", 38.7072, -9.1355, ["lisbon"]],
  ["Livorno, Italy", 43.551, 10.3017, ["livorno", "florence", "pisa"]],
  ["Liverpool, England", 53.405, -2.999, ["liverpool"]],
  ["Malaga, Spain", 36.716, -4.418, ["malaga"]],
  ["Maloy, Norway", 61.935, 5.114, ["maloy"]],
  ["Marseille, France", 43.3032, 5.3616, ["marseille"]],
  ["Mazatlan, Mexico", 23.189, -106.412, ["mazatlan"]],
  ["Mekjarvik, Norway", 59.022, 5.597, ["mekjarvik", "stavenger"]],
  ["Melbourne, Australia", -37.8409, 144.9303, ["melbourne"]],
  ["Messina, Sicily, Italy", 38.1938, 15.554, ["messina", "sicily"]],
  ["Molde, Norway", 62.737, 7.16, ["molde"]],
  ["Mykonos, Greece", 37.4655, 25.3286, ["mykonos"]],
  ["Naples, Italy", 40.8407, 14.2676, ["naples", "napoli"]],
  ["Nassau, Bahamas", 25.0781, -77.3412, ["nassau"]],
  ["Napier, New Zealand", -39.4753, 176.9218, ["napier"]],
  ["Nawiliwili, Kauai, Hawaii", 21.954, -159.356, ["nawiliwili", "kauai"]],
  ["New Orleans, Louisiana", 29.9511, -90.063, ["new orleans"]],
  ["Newcastle upon Tyne, England", 55.0077, -1.4518, ["newcastle upon tyne", "newcastle", "tyne"]],
  ["New York, New York", 40.7648, -74.0018, ["new york"]],
  ["New Plymouth, New Zealand", -39.0556, 174.0752, ["new plymouth"]],
  ["Nordfjordeid, Norway", 61.912, 5.986, ["nordfjordeid", "nordjordeid"]],
  ["Norwegian Fjords, Norway", 61.837, 6.806, ["norwegian fjords"]],
  ["Noumea, New Caledonia", -22.2758, 166.458, ["noumea"]],
  ["Nynashamn, Sweden", 58.903, 17.947, ["nynashamn", "stockholm"]],
  ["Olbia, Sardinia, Italy", 40.923, 9.501, ["olbia", "sardinia"]],
  ["Olden, Norway", 61.836, 6.806, ["olden"]],
  ["Oranjestad, Aruba", 12.5196, -70.0411, ["oranjestad", "aruba"]],
  ["Oslo, Norway", 59.909, 10.729, ["oslo"]],
  ["Pago Pago, American Samoa", -14.2756, -170.702, ["pago pago"]],
  ["Palermo, Sicily, Italy", 38.128, 13.368, ["palermo"]],
  ["Palma de Mallorca, Spain", 39.5528, 2.6397, ["palma", "mallorca"]],
  ["Panama Canal, Panama", 9.08, -79.681, ["panama canal"]],
  ["Peter Port, Guernsey", 49.456, -2.535, ["peter port", "guernsey"]],
  ["Philipsburg, St. Maarten", 18.024, -63.0458, ["philipsburg", "st maarten", "saint maarten"]],
  ["Piraeus, Greece", 37.9445, 23.6408, ["piraeus", "athens"]],
  ["Plymouth, England", 50.364, -4.142, ["plymouth"]],
  ["Ponta Delgada, Azores, Portugal", 37.739, -25.668, ["ponta delgada", "azores"]],
  ["Port Canaveral, Florida", 28.4104, -80.6188, ["port canaveral", "cape canaveral"]],
  ["Portland, England", 50.565, -2.444, ["portland", "stonehenge", "portland england"]],
  ["Porto, Portugal", 41.14, -8.611, ["porto"]],
  ["Progreso, Mexico", 21.3036, -89.6652, ["progreso", "progresso"]],
  ["Puerto Plata, Dominican Republic", 19.797, -70.695, ["puerto plata"]],
  ["Puerto Vallarta, Mexico", 20.653, -105.241, ["puerto vallarta"]],
  ["Puntarenas, Costa Rica", 9.976, -84.834, ["puntarenas", "puntarenas costa rice", "puntarenas costa rica"]],
  ["Quebec City, Quebec", 46.8139, -71.2025, ["quebec city", "quebec city quebec"]],
  ["Reykjavik, Iceland", 64.1502, -21.9321, ["reykjavik", "rekjavik"]],
  ["Rhodes, Greece", 36.444, 28.232, ["rhodes"]],
  ["Riga, Latvia", 56.949, 24.105, ["riga"]],
  ["Ringaskiddy, Ireland", 51.833, -8.316, ["ringaskiddy", "cork", "ringaskiddy ireland"]],
  ["Road Town, Tortola", 18.4241, -64.6185, ["road town", "tortola"]],
  ["Roseau, Dominica", 15.301, -61.388, ["roseau", "dominica"]],
  ["Rostock, Germany", 54.092, 12.132, ["rostock"]],
  ["Rotterdam, Netherlands", 51.905, 4.489, ["rotterdam", "amsterdam"]],
  ["Saguenay, Quebec", 48.428, -71.069, ["saguenay", "saguenay quebec"]],
  ["Saint John, New Brunswick", 45.273, -66.063, ["saint john", "saint john new brunswick"]],
  ["San Diego, California", 32.7157, -117.1746, ["san diego"]],
  ["San Francisco, California", 37.8087, -122.4098, ["san francisco"]],
  ["San Juan, Puerto Rico", 18.4602, -66.1057, ["san juan"]],
  ["Sandnes, Norway", 58.852, 5.735, ["sandnes"]],
  ["Santorini, Greece", 36.4166, 25.4324, ["santorini", "thira"]],
  ["Seattle, Washington", 47.6061, -122.3412, ["seattle"]],
  ["Skagen, Denmark", 57.72, 10.59, ["skagen"]],
  ["Singapore", 1.2644, 103.8207, ["singapore"]],
  ["Skagway, Alaska", 59.4504, -135.3269, ["skagway"]],
  ["Southampton, England", 50.9008, -1.4136, ["southampton"]],
  ["St. John's, Antigua", 17.1274, -61.8468, ["st john s", "saint john s", "antigua"]],
  ["St. John's, Newfoundland", 47.5615, -52.7126, [
    "st john s newfoundland",
    "st johns newfoundland",
    "saint john s newfoundland",
    "saint johns newfoundland"
  ]],
  ["St. Thomas, U.S. Virgin Islands", 18.3358, -64.9307, ["st thomas", "saint thomas", "charlotte amalie"]],
  ["Stavanger, Norway", 58.97, 5.733, ["stavanger"]],
  ["Suva, Fiji", -18.1248, 178.438, ["suva"]],
  ["Sydney, Australia", -33.8587, 151.2101, ["sydney"]],
  ["Sydney, Nova Scotia", 46.1368, -60.1942, ["sydney nova scotia"]],
  ["Tauranga, New Zealand", -37.662, 176.177, ["tauranga"]],
  ["Toulon, France", 43.117, 5.933, ["toulon", "provence"]],
  ["Valletta, Malta", 35.8989, 14.5146, ["valletta", "malta"]],
  ["Valencia, Spain", 39.461, -0.323, ["valencia"]],
  ["Vancouver, British Columbia", 49.2897, -123.1119, ["vancouver"]],
  ["Victoria, British Columbia", 48.4213, -123.3721, ["victoria"]],
  ["Vigo, Spain", 42.241, -8.721, ["vigo"]],
  ["Villefranche, France", 43.7034, 7.3128, ["villefranche", "villefrance", "monte carlo", "nice"]],
  ["Visby, Sweden", 57.634, 18.294, ["visby"]],
  ["Ward Cove, Alaska", 55.407, -131.731, ["ward cove", "ward cove ketchikan", "ward cove ketchikan alaska"]],
  ["Warnemunde, Germany", 54.176, 12.091, ["warnemunde", "berlin"]],
  ["Wellington, New Zealand", -41.2858, 174.7787, ["wellington"]],
  ["Willemstad, Curacao", 12.108, -68.934, ["willemstad", "curacao"]],
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
    .replace(/&apos;/g, "'")
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

const KNOWN_PORT_DETAIL_URLS = new Map(
  [
    ["Fort Lauderdale", "fort-lauderdale-florida"],
    ["Fort Lauderdale, Florida", "fort-lauderdale-florida"],
    ["San Diego", "san-diego-california"],
    ["San Diego, California", "san-diego-california"],
    ["Galveston", "galveston-texas"],
    ["Galveston, Texas", "galveston-texas"],
    ["Port Canaveral", "port-canaveral-florida"],
    ["Port Canaveral, Florida", "port-canaveral-florida"],
    ["Auckland", "auckland-new-zealand"],
    ["Auckland, New Zealand", "auckland-new-zealand"],
    ["Barcelona", "barcelona-spain"],
    ["Barcelona, Spain", "barcelona-spain"],
    ["Brisbane", "brisbane-australia"],
    ["Brisbane, Australia", "brisbane-australia"],
    ["Civitavecchia (Rome)", "civitavecchia-italy"],
    ["Civitavecchia (Rome), Italy", "civitavecchia-italy"],
    ["Civitavecchia, Italy", "civitavecchia-italy"],
    ["Copenhagen", "copenhagen-denmark"],
    ["Copenhagen, Denmark", "copenhagen-denmark"],
    ["Honolulu", "honolulu-hawaii"],
    ["Honolulu, Hawaii", "honolulu-hawaii"],
    ["Melbourne", "melbourne-australia"],
    ["Melbourne, Australia", "melbourne-australia"],
    ["New Orleans", "new-orleans-louisiana"],
    ["New Orleans, Louisiana", "new-orleans-louisiana"],
    ["New York", "new-york-new-york"],
    ["New York, New York", "new-york-new-york"],
    ["San Juan", "san-juan-puerto-rico"],
    ["San Juan, Puerto Rico", "san-juan-puerto-rico"],
    ["Singapore", "singapore-singapore"],
    ["Singapore, Singapore", "singapore-singapore"],
    ["Southampton", "southampton-england"],
    ["Southampton, England", "southampton-england"],
    ["Sydney", "sydney-australia"],
    ["Sydney, Australia", "sydney-australia"],
    ["Vancouver", "vancouver-canada"],
    ["Vancouver, British Columbia", "vancouver-canada"],
    ["Vancouver (British Columbia), Canada", "vancouver-canada"],
    ["Juneau", "juneau-alaska"],
    ["Juneau, Alaska", "juneau-alaska"],
    ["Ketchikan", "ketchikan-alaska"],
    ["Ketchikan, Alaska", "ketchikan-alaska"],
    ["Glacier Viewing (Stikine Icecap)", "glacier-viewing-stikine-icecap"],
    ["Glacier Viewing, Stikine Icecap", "glacier-viewing-stikine-icecap"],
    ["Icy Strait Point", "icy-strait-point-alaska"],
    ["Icy Strait Point, Alaska", "icy-strait-point-alaska"],
    ["Skagway", "skagway-alaska"],
    ["Skagway, Alaska", "skagway-alaska"],
    ["Ward Cove (Ketchikan)", "ward-cove-ketchikan-alaska"],
    ["Ward Cove, Alaska", "ward-cove-ketchikan-alaska"],
    ["Castaway Cay", "castaway-cay-bahamas"],
    ["Castaway Cay, Bahamas", "castaway-cay-bahamas"],
    ["Lookout Cay at Lighthouse Point", "lookout-cay-at-lighthouse-point-bahamas"],
    ["Disney Lookout Cay at Lighthouse Point, Bahamas", "lookout-cay-at-lighthouse-point-bahamas"],
    ["Nassau", "nassau-bahamas"],
    ["Nassau, Bahamas", "nassau-bahamas"],
    ["King's Warf", "kings-wharf-bermuda"],
    ["King's Wharf, Bermuda", "kings-wharf-bermuda"],
    ["Baie-Comeau (Quebec)", "baie-comeau-quebec-canada"],
    ["Baie-Comeau, Quebec", "baie-comeau-quebec-canada"],
    ["Bar Harbor, Maine", "bar-harbor-maine"],
    ["Charlottetown (Prince Edward Island)", "charlottetown-prince-edward-island-canada"],
    ["Charlottetown, Prince Edward Island", "charlottetown-prince-edward-island-canada"],
    ["Halifax (Nova Scotia)", "halifax-nova-scotia-canada"],
    ["Halifax, Nova Scotia", "halifax-nova-scotia-canada"],
    ["Quebec City (Quebec)", "quebec-city-quebec-canada"],
    ["Quebec City, Quebec", "quebec-city-quebec-canada"],
    ["Saguenay (Quebec)", "saguenay-quebec-canada"],
    ["Saguenay, Quebec", "saguenay-quebec-canada"],
    ["Saint John (New Brunswick)", "saint-john-new-brunswick-canada"],
    ["Saint John, New Brunswick", "saint-john-new-brunswick-canada"],
    ["St. John's (Newfoundland)", "st-johns-newfoundland-canada"],
    ["St. John's, Newfoundland", "st-johns-newfoundland-canada"],
    ["Sydney (Nova Scotia)", "sydney-nova-scotia-canada"],
    ["Sydney, Nova Scotia", "sydney-nova-scotia-canada"],
    ["Costa Maya, Mexico", "costa-maya-mexico"],
    ["Cozumel, Mexico", "cozumel-mexico"],
    ["Falmouth, Jamaica", "falmouth-jamaica"],
    ["George Town, Grand Cayman", "george-town-grand-cayman"],
    ["Progresso, Mexico", "progresso-mexico"],
    ["Progreso, Mexico", "progresso-mexico"],
    ["Philipsburg, St. Maarten", "philipsburg-st-maarten"],
    ["St. Thomas, U.S. Virgin Islands", "st-thomas-us-virgin-islands"],
    ["Tortola, British Virgin Islands", "tortola-british-virgin-islands"],
    ["Road Town, Tortola", "tortola-british-virgin-islands"],
    ["Puerto Plata, Dominican Republic", "puerto-plata-dominican-republic"],
    ["Basseterre, St. Kitts", "basseterre-st-kitts"],
    ["Bridgetown, Barbados", "bridgetown-barbados"],
    ["Castries, St. Lucia", "castries-st-lucia"],
    ["Fort-de-France, Martinique", "fort-de-france-martinique"],
    ["Kralendijk, Bonaire", "kralendijk-bonaire"],
    ["Oranjestad, Aruba", "oranjestad-aruba"],
    ["St. John's, Antigua", "st-johns-antigua"],
    ["Willemstad, Curacao", "willemstad-curacao"],
    ["Roseau, Dominica", "roseau-dominica"],
    ["Alesund, Norway", "alesund-norway"],
    ["Bergen, Norway", "bergen-norway"],
    ["Bilbao, Spain", "bilbao-spain"],
    ["Cherbourg, France", "cherbourg-france"],
    ["Cobh (Cork), Ireland", "cobh-ireland"],
    ["Cobh, Ireland", "cobh-ireland"],
    ["Gothenburg, Sweden", "gothenburg-sweden"],
    ["Greenock, Scotland", "greenock-scotland"],
    ["Hamburg, Germany", "hamburg-germany"],
    ["Haugesund, Norway", "haugesund-norway"],
    ["Hebrides, Scotland", "hebrides-scotland"],
    ["Helsinki, Finland", "helsinki-finland"],
    ["Invergordon, Scotland", "invergordon-scotland"],
    ["Isafjordur, Iceland", "isafjordur-iceland"],
    ["Kiel, Germany", "kiel-germany"],
    ["Kirkwall (Orkney), Scotland", "kirkwall-scotland"],
    ["Kirkwall, Scotland", "kirkwall-scotland"],
    ["Kotka, Finland", "kotka-finland"],
    ["Kristiansend, Norway", "kristiansend-norway"],
    ["Kristiansand, Norway", "kristiansend-norway"],
    ["La Coruna, Spain", "la-coruna-spain"],
    ["La Rochelle, France", "la-rochelle-france"],
    ["Le Havre (Paris), France", "le-havre-france"],
    ["Le Havre, France", "le-havre-france"],
    ["Liverpool, England", "liverpool-england"],
    ["Maloy, Norway", "maloy-norway"],
    ["Mekjarvik (Stavenger), Norway", "mekjarvik-norway"],
    ["Mekjarvik, Norway", "mekjarvik-norway"],
    ["Molde, Norway", "molde-norway"],
    ["Newcastle upon Tyne, England", "newcastle-upon-tyne-england"],
    ["Nordjordeid, Norway", "nordjordeid-norway"],
    ["Nordfjordeid, Norway", "nordjordeid-norway"],
    ["Norwegian Fjords, Norway", "norwegian-fjords-norway"],
    ["Nynashamn (Stockholm), Sweden", "nynashamn-sweden"],
    ["Nynashamn, Sweden", "nynashamn-sweden"],
    ["Olden, Norway", "olden-norway"],
    ["Oslo, Norway", "oslo-norway"],
    ["Peter Port, Guernsey", "peter-port-guernsey"],
    ["Ponta Delgada (Azores), Portugal", "ponta-delgada-portugal"],
    ["Ponta Delgada, Azores, Portugal", "ponta-delgada-portugal"],
    ["Plymouth, England", "plymouth-england"],
    ["Portland (Stonehenge), England", "portland-england"],
    ["Portland, England", "portland-england"],
    ["Rekjavik, Iceland", "rekjavik-iceland"],
    ["Reykjavik, Iceland", "rekjavik-iceland"],
    ["Riga, Latvia", "riga-latvia"],
    ["Ringaskiddy (Cork), Ireland", "ringaskiddy-ireland"],
    ["Ringaskiddy, Ireland", "ringaskiddy-ireland"],
    ["Rostock, Germany", "rostock-germany"],
    ["Rotterdam (Amsterdam), Netherlands", "rotterdam-netherlands"],
    ["Rotterdam, Netherlands", "rotterdam-netherlands"],
    ["Sandnes, Norway", "sandnes-norway"],
    ["Skagen, Denmark", "skagen-denmark"],
    ["Stavanger, Norway", "stavanger-norway"],
    ["Visby, Sweden", "visby-sweden"],
    ["Warnemunde (Berlin), Germany", "warnemunde-germany"],
    ["Warnemunde, Germany", "warnemunde-germany"],
    ["Zeebrugge (Brussels), Belgium", "zeebrugge-belgium"],
    ["Zeebrugge, Belgium", "zeebrugge-belgium"],
    ["Ajaccio (Corsica), France", "ajaccio-france"],
    ["Ajaccio, Corsica, France", "ajaccio-france"],
    ["Cadiz, Spain", "cadiz-spain"],
    ["Cagliari, Italy", "cagliari-italy"],
    ["Cagliari, Sardinia, Italy", "cagliari-italy"],
    ["Cartagena, Spain", "cartagena-spain"],
    ["Catania, Italy", "catania-italy"],
    ["Catania, Sicily, Italy", "catania-italy"],
    ["Chania, Greece", "chania-greece"],
    ["Corfu, Greece", "corfu-greece"],
    ["Dover, England", "dover-england"],
    ["Dubrovnik, Croatia", "dubrovnik-croatia"],
    ["Genoa (Milan), Italy", "genoa-italy"],
    ["Genoa, Italy", "genoa-italy"],
    ["Gibraltar, U.K.", "gibraltar-uk"],
    ["Gibraltar", "gibraltar-uk"],
    ["Heraklion, Greece", "heraklion-greece"],
    ["Heraklion, Crete, Greece", "heraklion-greece"],
    ["Ibiza, Spain", "ibiza-spain"],
    ["Katakolon, Greece", "katakolon-greece"],
    ["Kefalonia, Greece", "kefalonia-greece"],
    ["Kusadasi, Turkey", "kusadasi-turkey"],
    ["La Spezia (Florence, Pisa), Italy", "la-spezia-italy"],
    ["La Spezia, Italy", "la-spezia-italy"],
    ["Lisbon, Portugal", "lisbon-portugal"],
    ["Livorno (Florence, Pisa), Italy", "livorno-italy"],
    ["Livorno, Italy", "livorno-italy"],
    ["Malaga, Spain", "malaga-spain"],
    ["Marseilles, France", "marseilles-france"],
    ["Marseille, France", "marseilles-france"],
    ["Sicily, Italy", "sicily-italy"],
    ["Messina, Sicily, Italy", "sicily-italy"],
    ["Mykonos, Greence", "mykonos-greece"],
    ["Mykonos, Greece", "mykonos-greece"],
    ["Naples (Pompeii), Italy", "naples-italy"],
    ["Naples, Italy", "naples-italy"],
    ["Olbia (Sardinia), Italy", "olbia-italy"],
    ["Olbia, Sardinia, Italy", "olbia-italy"],
    ["Palermo (Sicily), Italy", "palermo-italy"],
    ["Palermo, Sicily, Italy", "palermo-italy"],
    ["Palma de Mallorca, Spain", "palma-de-mallorca-spain"],
    ["Piraeus (Athens), Greece", "piraeus-greece"],
    ["Piraeus, Greece", "piraeus-greece"],
    ["Porto, Portugal", "porto-portugal"],
    ["Rhodes, Greece", "rhodes-greece"],
    ["Santorini, Greece", "santorini-greece"],
    ["Toulon (Provence), France", "toulon-france"],
    ["Toulon, France", "toulon-france"],
    ["Valencia, Spain", "valencia-spain"],
    ["Valletta, Malta", "valletta-malta"],
    ["Vigo, Spain", "vigo-spain"],
    ["Villefrance (Monte Carlo / Nice), France", "villefrance-france"],
    ["Villefranche, France", "villefrance-france"],
    ["Honolulu, O'ahu", "honolulu-oahu-hawaii"],
    ["Kahului, Maui", "kahului-maui-hawaii"],
    ["Kahului, Maui, Hawaii", "kahului-maui-hawaii"],
    ["Nawiliwili, Kaua'i", "nawiliwili-kauai-hawaii"],
    ["Nawiliwili, Kauai, Hawaii", "nawiliwili-kauai-hawaii"],
    ["Hilo, Hawai'i", "hilo-hawaii-island-hawaii"],
    ["Hilo, Hawaii", "hilo-hawaii-island-hawaii"],
    ["Cabo San Lucas, Mexico", "cabo-san-lucas-mexico"],
    ["Catalina Island, California", "catalina-island-california"],
    ["Ensenada, Mexico", "ensenada-mexico"],
    ["Mazatlan, Mexico", "mazatlan-mexico"],
    ["Puerto Vallarta, Mexico", "puerto-vallarta-mexico"],
    ["Christchurch (Lyttelton), New Zealand", "christchurch-new-zealand"],
    ["Christchurch, New Zealand", "christchurch-new-zealand"],
    ["Eden, Australia", "eden-australia"],
    ["Fiordland National Park, New Zealand", "fiordland-national-park-new-zealand"],
    ["Hobart, Australia", "hobart-australia"],
    ["Hobart, Tasmania, Australia", "hobart-australia"],
    ["Napier, New Zealand", "napier-new-zealand"],
    ["New Plymouth, New Zealand", "new-plymouth-new-zealand"],
    ["Noumea, New Caledonia", "noumea-new-caledonia"],
    ["Tauranga, New Zealand", "tauranga-new-zealand"],
    ["Wellington, New Zealand", "wellington-new-zealand"],
    ["Astoria, Oregon", "astoria-oregon"],
    ["San Francisco, California", "san-francisco-california"],
    ["Seattle, Washington", "seattle-washington"],
    ["Victoria (British Columbia), Canada", "victoria-canada"],
    ["Victoria, British Columbia", "victoria-canada"],
    ["Cartagena, Colombia", "cartagena-colombia"],
    ["Panama Canal", "panama-canal-panama"],
    ["Panama Canal, Panama", "panama-canal-panama"],
    ["Puntarenas, Costa Rice", "puntarenas-costa-rica"],
    ["Puntarenas, Costa Rica", "puntarenas-costa-rica"],
    ["Pago Pago, American Samoa", "pago-pago-american-samoa"],
    ["Suva, Fiji", "suva-fiji"],
    ["Funchal, Portugal", "funchal-portugal"],
    ["Funchal, Madeira, Portugal", "funchal-portugal"]
  ].map(([name, slug]) => [normalizePortName(name), absolutePortUrl(`/ports/${slug}/`)])
);

function knownPortDetailUrl(name) {
  const normalized = normalizePortName(name);
  return normalized ? KNOWN_PORT_DETAIL_URLS.get(normalized) || null : null;
}

function urlAwareCoordinateForPort(url) {
  const slug = normalizePortName(slugFromUrl(url));
  if (!slug) {
    return null;
  }

  const slugCoordinate = KNOWN_PORTS_BY_ALIAS.get(slug);
  if (slugCoordinate) {
    return slugCoordinate;
  }

  if (slug === "sydney nova scotia" || slug === "sydney nova scotia canada") {
    return KNOWN_PORTS_BY_ALIAS.get("sydney nova scotia");
  }

  if (slug === "saint johns newfoundland" || slug === "st johns newfoundland canada") {
    return KNOWN_PORTS_BY_ALIAS.get("st john s newfoundland");
  }

  for (const [alias, coordinate] of KNOWN_PORTS_BY_ALIAS) {
    if (alias.length >= 6 && (slug.includes(alias) || alias.includes(slug))) {
      return coordinate;
    }
  }

  return null;
}

function regionAwareCoordinateForPort(normalized, region) {
  const normalizedRegion = normalizePortName(region);
  if (!normalized || !normalizedRegion) {
    return null;
  }

  if (normalized === "sydney" || normalized.startsWith("sydney ")) {
    return normalizedRegion.includes("canada") || normalizedRegion.includes("transatlantic")
      ? KNOWN_PORTS_BY_ALIAS.get("sydney nova scotia")
      : KNOWN_PORTS_BY_ALIAS.get("sydney");
  }

  if (
    normalized === "st john s"
    || normalized === "saint john s"
    || normalized.startsWith("st john s ")
    || normalized.startsWith("saint john s ")
  ) {
    return normalizedRegion.includes("canada") || normalizedRegion.includes("transatlantic")
      ? KNOWN_PORTS_BY_ALIAS.get("st john s newfoundland")
      : KNOWN_PORTS_BY_ALIAS.get("st john s");
  }

  return null;
}

function coordinateForPort(name, region, detailUrl) {
  const normalized = normalizePortName(name);
  if (!normalized) {
    return null;
  }

  const urlCoordinate = urlAwareCoordinateForPort(detailUrl);
  if (urlCoordinate) {
    return urlCoordinate;
  }

  const regional = regionAwareCoordinateForPort(normalized, region);
  if (regional) {
    return regional;
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
    const detailUrl = absolutePortUrl(match[1]);
    if (!name || !coordinateForPort(name, overview.label, detailUrl) || seenNames.has(name)) {
      continue;
    }

    seenNames.add(name);
    ports.push({
      name,
      detailUrl,
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
      const coordinate = coordinateForPort(port.name, overview.label, port.detailUrl);
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
      const coordinate = coordinateForPort(port.name, overview.label, port.detailUrl);
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
  const url = overview.url || `${DISNEY_PORTS_OVERVIEW_BASE_URL}/ports/overview/${overview.slug}/`;

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

export function withKnownPortDetailUrls(ports = []) {
  return ports.map((port) => ({
    ...port,
    detailUrl: port.detailUrl || knownPortDetailUrl(port.name)
  }));
}

export async function collectDisneyPorts({ timeoutMs = 8000 } = {}) {
  if (typeof fetch !== "function") {
    return FALLBACK_DISNEY_PORTS;
  }

  const results = await Promise.allSettled(
    DESTINATION_OVERVIEWS.map(([slug, label, url]) =>
      fetchDisneyPortsOverview({ slug, label, url }, { timeoutMs })
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
      detailUrl: knownPortDetailUrl(name),
      source: "Local Disney ports coordinate catalog"
    }
  ])
);
