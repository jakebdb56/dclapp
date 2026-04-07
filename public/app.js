const shipList = document.querySelector("#ship-list");
const fleetSummary = document.querySelector("#fleet-summary");
const feedStatus = document.querySelector("#feed-status");
const feedUpdated = document.querySelector("#feed-updated");
const fleetDrawer = document.querySelector("#fleet-drawer");
const fleetToggle = document.querySelector("#fleet-toggle");
const mapToolbar = document.querySelector(".map-toolbar");
const viewAllButton = document.querySelector("#view-all");
const regionButtons = Array.from(document.querySelectorAll("[data-region]"));
const toggleButtons = Array.from(document.querySelectorAll(".toggle-button"));
const panels = Array.from(document.querySelectorAll("[data-view]"));
const aboutOpen = document.querySelector("#about-open");
const aboutModal = document.querySelector("#about-modal");
const aboutCloseButtons = Array.from(document.querySelectorAll("[data-about-close]"));
const POLL_INTERVAL_MS = 60000;
const COLD_START_RETRY_MS = 15000;
const SNAPSHOT_STORAGE_KEY = "dcl-tracker-snapshot";
const REGION_BOUNDS = {
  bahamas: [
    [22, -80.5],
    [28.7, -72.5]
  ],
  caribbean: [
    [9, -90],
    [28, -58]
  ],
  europe: [
    [34, -13],
    [72, 32]
  ],
  alaska: [
    [47, -146],
    [61, -119]
  ],
  bermudaCanada: [
    [31, -82],
    [51, -52]
  ],
  mexicoPacific: [
    [14, -124],
    [34, -93]
  ],
  panamaCanal: [
    [5, -121],
    [28, -74]
  ],
  transatlantic: [
    [24, -85],
    [56, 15]
  ],
  pacificCoast: [
    [29, -132],
    [51, -115]
  ],
  hawaii: [
    [18, -161],
    [23, -154]
  ],
  southPacific: [
    [-35, 140],
    [23, 205]
  ],
  australiaNewZealand: [
    [-48, 110],
    [-9, 180]
  ],
  singapore: [
    [-2, 100],
    [4, 107]
  ]
};
const PORT_COORDINATES = new Map(
  [
    [["PORT CANAVERAL", "CAPE CANAVERAL"], [28.4104, -80.6188]],
    [["FORT LAUDERDALE", "PORT EVERGLADES", "EVERGLADES"], [26.0916, -80.1219]],
    [["MIAMI"], [25.7781, -80.1794]],
    [["NASSAU"], [25.0781, -77.3412]],
    [["CASTAWAY CAY", "GORDA CAY"], [26.0842, -77.5331]],
    [["LOOKOUT CAY", "LIGHTHOUSE POINT", "ELEUTHERA"], [24.6193, -76.1636]],
    [["COZUMEL"], [20.5128, -86.9499]],
    [["GEORGE TOWN", "GRAND CAYMAN"], [19.2866, -81.3744]],
    [["FALMOUTH"], [18.491, -77.655]],
    [["TORTOLA", "ROAD TOWN"], [18.4241, -64.6185]],
    [["ST THOMAS", "SAINT THOMAS", "CHARLOTTE AMALIE"], [18.3358, -64.9307]],
    [["SAN JUAN"], [18.4602, -66.1057]],
    [["ST MAARTEN", "SAINT MAARTEN", "PHILIPSBURG"], [18.024, -63.0458]],
    [["KEY WEST"], [24.5551, -81.78]],
    [["NEW ORLEANS"], [29.9511, -90.063]],
    [["GALVESTON"], [29.3102, -94.7937]],
    [["VANCOUVER"], [49.2897, -123.1119]],
    [["VICTORIA"], [48.4213, -123.3721]],
    [["KETCHIKAN"], [55.3422, -131.6461]],
    [["JUNEAU"], [58.2985, -134.414]],
    [["SKAGWAY"], [59.4504, -135.3269]],
    [["ICY STRAIT POINT", "HOONAH"], [58.1283, -135.4611]],
    [["SITKA"], [57.0516, -135.3376]],
    [["SOUTHAMPTON"], [50.9008, -1.4136]],
    [["BARCELONA"], [41.3525, 2.1586]],
    [["CIVITAVECCHIA", "ROME"], [42.093, 11.791]],
    [["NAPLES", "NAPOLI"], [40.8407, 14.2676]],
    [["LIVORNO"], [43.551, 10.3017]],
    [["MARSEILLE"], [43.3032, 5.3616]],
    [["GENOA", "GENOVA"], [44.4097, 8.916]],
    [["PIRAEUS", "ATHENS"], [37.9445, 23.6408]],
    [["MYKONOS"], [37.4655, 25.3286]],
    [["SANTORINI", "THIRA"], [36.4166, 25.4324]],
    [["SINGAPORE"], [1.2644, 103.8207]]
  ].flatMap(([aliases, coordinate]) => aliases.map((alias) => [alias, coordinate]))
);
const SEA_ROUTE_WAYPOINTS = new Map(
  [
    [
      ["PORT CANAVERAL", "CAPE CANAVERAL"],
      [
        [24.35, -82.75],
        [24.32, -80.2],
        [26.2, -79.4],
        [27.8, -79.55],
        [28.28, -80.22]
      ]
    ],
    [
      ["FORT LAUDERDALE", "PORT EVERGLADES", "EVERGLADES", "MIAMI"],
      [
        [24.35, -82.75],
        [24.32, -80.2],
        [25.45, -79.82],
        [26.05, -79.95]
      ]
    ],
    [
      ["NASSAU"],
      [
        [27.8, -79.55],
        [26.55, -78.65],
        [25.28, -77.55]
      ]
    ],
    [
      ["CASTAWAY CAY", "GORDA CAY"],
      [
        [27.8, -79.55],
        [26.85, -78.3],
        [26.25, -77.75]
      ]
    ],
    [
      ["LOOKOUT CAY", "LIGHTHOUSE POINT", "ELEUTHERA"],
      [
        [26.55, -78.65],
        [25.45, -77.25],
        [24.75, -76.35]
      ]
    ],
    [
      ["COZUMEL"],
      [
        [27.8, -79.55],
        [26.2, -79.4],
        [24.32, -80.2],
        [24.35, -82.75],
        [22.6, -85.85],
        [20.75, -86.75]
      ]
    ],
    [
      ["GEORGE TOWN", "GRAND CAYMAN"],
      [
        [27.8, -79.55],
        [26.2, -79.4],
        [24.32, -80.2],
        [24.35, -82.75],
        [22.2, -84.6],
        [19.6, -81.55]
      ]
    ],
    [
      ["FALMOUTH"],
      [
        [27.8, -79.55],
        [26.2, -79.4],
        [24.32, -80.2],
        [24.35, -82.75],
        [22.2, -84.6],
        [19.6, -81.55],
        [18.7, -78.4]
      ]
    ],
    [
      ["TORTOLA", "ROAD TOWN", "ST THOMAS", "SAINT THOMAS", "CHARLOTTE AMALIE"],
      [
        [25.45, -77.25],
        [23.8, -74.8],
        [21.1, -70.2],
        [18.8, -65.4]
      ]
    ],
    [
      ["SAN JUAN", "ST MAARTEN", "SAINT MAARTEN", "PHILIPSBURG"],
      [
        [25.45, -77.25],
        [23.8, -74.8],
        [21.1, -70.2],
        [18.7, -66.5]
      ]
    ],
    [
      ["KEY WEST"],
      [
        [24.35, -82.75],
        [24.45, -81.95]
      ]
    ],
    [
      ["GALVESTON"],
      [
        [25.45, -79.82],
        [24.32, -80.2],
        [24.35, -82.75],
        [25.2, -87.5],
        [27.0, -92.0],
        [28.85, -94.45]
      ]
    ],
    [
      ["NEW ORLEANS"],
      [
        [25.45, -79.82],
        [24.32, -80.2],
        [24.35, -82.75],
        [25.2, -87.5],
        [28.45, -89.0],
        [29.1, -89.25]
      ]
    ],
    [
      ["VANCOUVER", "VICTORIA", "KETCHIKAN", "JUNEAU", "SKAGWAY", "ICY STRAIT POINT", "HOONAH", "SITKA"],
      [
        [48.35, -124.5],
        [50.2, -128.2],
        [52.6, -131.4],
        [55.2, -134.0],
        [57.35, -136.1]
      ]
    ],
    [
      ["SOUTHAMPTON"],
      [
        [49.5, -5.4],
        [50.0, -3.2],
        [50.35, -1.7]
      ]
    ],
    [
      ["BARCELONA", "MARSEILLE", "GENOA", "GENOVA", "LIVORNO", "CIVITAVECCHIA", "ROME", "NAPLES", "NAPOLI"],
      [
        [41.0, 3.0],
        [41.6, 6.0],
        [42.4, 8.5],
        [42.5, 10.2],
        [41.7, 12.1],
        [40.9, 13.7]
      ]
    ],
    [
      ["PIRAEUS", "ATHENS", "MYKONOS", "SANTORINI", "THIRA"],
      [
        [38.5, 18.2],
        [37.0, 21.2],
        [37.2, 23.6],
        [37.0, 25.1]
      ]
    ],
    [
      ["SINGAPORE"],
      [
        [1.1, 104.2],
        [1.2, 103.9]
      ]
    ]
  ].flatMap(([aliases, waypoints]) => aliases.map((alias) => [alias, waypoints]))
);

const map = L.map("map", {
  zoomControl: true,
  worldCopyJump: true
}).setView([25.7617, -80.1918], 3);

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  maxZoom: 20,
  subdomains: "abcd",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

const markers = new Map();
const routeLines = new Map();
const portMarkers = new Map();
const dclPortMarkers = new Map();
let hasFitMap = false;
let currentSnapshot = null;
let refreshTimer = null;
let selectedShipMmsi = null;
let aboutReturnFocus = null;

function setActiveView(target) {
  toggleButtons.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.viewTarget === target);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.view === target);
  });

  if (target === "map") {
    setTimeout(() => map.invalidateSize(), 150);
  }
}

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveView(button.dataset.viewTarget);
  });
});

fleetToggle.addEventListener("click", () => {
  const collapsed = fleetDrawer.classList.toggle("is-collapsed");
  fleetToggle.textContent = collapsed ? "Show fleet" : "Hide fleet";
  fleetToggle.setAttribute("aria-expanded", String(!collapsed));
  setTimeout(() => map.invalidateSize(), 180);
});

viewAllButton.addEventListener("click", () => {
  fitAllShipsOnMap();
});

regionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    fitRegionOnMap(REGION_BOUNDS[button.dataset.region]);
  });
});

function openAboutModal() {
  aboutReturnFocus = document.activeElement;
  aboutModal.hidden = false;
  document.body.classList.add("has-open-modal");
  requestAnimationFrame(() => {
    aboutModal.classList.add("is-open");
    aboutModal.querySelector(".about-close").focus();
  });
}

function closeAboutModal() {
  aboutModal.classList.remove("is-open");
  document.body.classList.remove("has-open-modal");
  window.setTimeout(() => {
    aboutModal.hidden = true;
    if (aboutReturnFocus instanceof HTMLElement) {
      aboutReturnFocus.focus();
    }
    aboutReturnFocus = null;
  }, 220);
}

aboutOpen.addEventListener("click", openAboutModal);

aboutCloseButtons.forEach((button) => {
  button.addEventListener("click", closeAboutModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !aboutModal.hidden) {
    closeAboutModal();
  }
});

function updateMapToolbarHeight() {
  document.documentElement.style.setProperty("--map-toolbar-height", `${mapToolbar.offsetHeight}px`);
}

updateMapToolbarHeight();
if ("ResizeObserver" in window) {
  new ResizeObserver(updateMapToolbarHeight).observe(mapToolbar);
} else {
  window.addEventListener("resize", updateMapToolbarHeight);
}

function formatTime(value) {
  if (!value) {
    return "No data yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatCoordinate(latitude, longitude) {
  if (latitude === null || longitude === null) {
    return "Awaiting position";
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function formatSpeed(speedKnots) {
  if (speedKnots === null || Number.isNaN(speedKnots)) {
    return "Unknown";
  }

  return `${speedKnots.toFixed(1)} kn`;
}

function normalizeDestination(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\b(THE\s+)?PORT\s+OF\b/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

function getDestinationCoordinate(destination) {
  const normalized = normalizeDestination(destination);
  if (!normalized) {
    return null;
  }

  const directMatch = PORT_COORDINATES.get(normalized);
  if (directMatch) {
    return directMatch;
  }

  for (const [alias, coordinate] of PORT_COORDINATES) {
    if (alias.length >= 6 && normalized.includes(alias)) {
      return coordinate;
    }
  }

  return null;
}

function getSeaRouteWaypoints(destination) {
  const normalized = normalizeDestination(destination);
  if (!normalized) {
    return [];
  }

  const directMatch = SEA_ROUTE_WAYPOINTS.get(normalized);
  if (directMatch) {
    return directMatch;
  }

  for (const [alias, waypoints] of SEA_ROUTE_WAYPOINTS) {
    if (alias.length >= 6 && normalized.includes(alias)) {
      return waypoints;
    }
  }

  return [];
}

function routeDistance(pointA, pointB) {
  const latitudeDelta = pointA[0] - pointB[0];
  const longitudeDelta = (pointA[1] - pointB[1]) * Math.cos(((pointA[0] + pointB[0]) / 2) * Math.PI / 180);

  return Math.hypot(latitudeDelta, longitudeDelta);
}

function buildSeaRoute(ship, destinationCoordinate) {
  const start = [ship.latitude, ship.longitude];
  const waypoints = getSeaRouteWaypoints(ship.destination);
  if (!waypoints.length || routeDistance(start, destinationCoordinate) < 0.35) {
    return [start, destinationCoordinate];
  }

  const closestWaypointIndex = waypoints.reduce(
    (closestIndex, waypoint, index) =>
      routeDistance(start, waypoint) < routeDistance(start, waypoints[closestIndex]) ? index : closestIndex,
    0
  );
  const destinationWaypointIndex = waypoints.reduce(
    (closestIndex, waypoint, index) =>
      routeDistance(destinationCoordinate, waypoint) < routeDistance(destinationCoordinate, waypoints[closestIndex])
        ? index
        : closestIndex,
    0
  );
  const routeWaypoints =
    closestWaypointIndex <= destinationWaypointIndex
      ? waypoints.slice(closestWaypointIndex, destinationWaypointIndex + 1)
      : waypoints.slice(destinationWaypointIndex, closestWaypointIndex + 1).reverse();

  if (
    routeWaypoints.length &&
    routeDistance(start, destinationCoordinate) < routeDistance(start, routeWaypoints[0])
  ) {
    return [start, destinationCoordinate];
  }

  return [start, ...routeWaypoints, destinationCoordinate];
}

function renderFleet(ships) {
  const shipsWithPosition = ships.filter((ship) => ship.latitude !== null && ship.longitude !== null).length;
  fleetSummary.textContent = `${shipsWithPosition} of ${ships.length} ships currently plotted`;

  if (!ships.length) {
    shipList.innerHTML = `<div class="empty-state">No ships are configured.</div>`;
    return;
  }

  shipList.innerHTML = ships
    .map((ship) => {
      const hasPosition = ship.latitude !== null && ship.longitude !== null;
      const cardClasses = ["ship-card", hasPosition ? "has-position" : "no-position"];
      if (selectedShipMmsi === ship.mmsi) {
        cardClasses.push("is-selected");
      }

      return `
        <article
          class="${cardClasses.join(" ")}"
          data-ship-mmsi="${ship.mmsi}"
          tabindex="0"
          role="button"
          aria-label="${hasPosition ? `Show ${ship.name} on the map` : `${ship.name} does not have a reported position yet`}"
        >
          <div class="ship-card-top">
            <div>
              <h3>${ship.name}</h3>
              <p class="ship-subline">${ship.className} • ${ship.homeRegion}</p>
            </div>
          </div>

          <div class="ship-grid">
            <div class="ship-metric">
              <span>Current position</span>
              <strong>${formatCoordinate(ship.latitude, ship.longitude)}</strong>
            </div>
            <div class="ship-metric">
              <span>Next destination</span>
              <strong>${ship.destination || "Not reported"}</strong>
            </div>
            <div class="ship-metric">
              <span>Speed</span>
              <strong>${formatSpeed(ship.speedKnots)}</strong>
            </div>
            <div class="ship-metric">
              <span>ETA</span>
              <strong>${ship.eta ? formatTime(ship.eta) : "Not reported"}</strong>
            </div>
          </div>

          <p class="ship-meta">
            Last Report: ${formatTime(ship.lastSeen)}
          </p>
          <p class="ship-card-action">${hasPosition ? "Tap to zoom to ship" : "Waiting for a reported position"}</p>
        </article>
      `;
    })
    .join("");
}

function focusShipOnMap(mmsi) {
  const marker = markers.get(mmsi);
  const ship = currentSnapshot?.ships?.find((item) => item.mmsi === mmsi);

  selectedShipMmsi = mmsi;
  if (currentSnapshot) {
    renderFleet(currentSnapshot.ships);
  }

  if (!marker || !ship || ship.latitude === null || ship.longitude === null) {
    return;
  }

  setActiveView("map");
  if (window.matchMedia("(max-width: 700px)").matches) {
    fleetDrawer.classList.add("is-collapsed");
    fleetToggle.textContent = "Show fleet";
    fleetToggle.setAttribute("aria-expanded", "false");
  }
  map.flyTo([ship.latitude, ship.longitude], Math.max(map.getZoom(), 8), {
    duration: 0.8
  });
  marker.openPopup();
}

shipList.addEventListener("click", (event) => {
  const card = event.target.closest(".ship-card");
  if (!card) {
    return;
  }

  focusShipOnMap(card.dataset.shipMmsi);
});

shipList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const card = event.target.closest(".ship-card");
  if (!card) {
    return;
  }

  event.preventDefault();
  focusShipOnMap(card.dataset.shipMmsi);
});

function popupMarkup(ship) {
  return `
    <div>
      <strong>${ship.name}</strong>
      <p class="popup-copy">Next stop: ${ship.destination || "Not reported"}</p>
      <p class="popup-copy">Position: ${formatCoordinate(ship.latitude, ship.longitude)}</p>
      <p class="popup-copy">Updated: ${formatTime(ship.lastSeen)}</p>
    </div>
  `;
}

function routePopupMarkup(ship) {
  return `
    <div>
      <strong>${ship.destination}</strong>
      <p class="popup-copy">Next stop for ${ship.name}</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function portPopupMarkup(port) {
  const regionList = port.regions?.length ? port.regions.join(", ") : "Disney Cruise Line port";
  const portName = escapeHtml(port.name);
  const portTitle = port.detailUrl
    ? `<a href="${escapeHtml(port.detailUrl)}" target="_blank" rel="noreferrer">${portName}</a>`
    : portName;

  return `
    <div>
      <strong>${portTitle}</strong>
      <p class="popup-copy">${escapeHtml(regionList)}</p>
    </div>
  `;
}

function getPlottedShipBounds(ships = currentSnapshot?.ships || []) {
  const bounds = ships
    .filter((ship) => ship.latitude !== null && ship.longitude !== null)
    .map((ship) => [ship.latitude, ship.longitude]);

  return bounds.length ? bounds : null;
}

function getPortBounds(ports = currentSnapshot?.ports || []) {
  const bounds = ports
    .filter((port) => port.latitude !== null && port.longitude !== null)
    .map((port) => [port.latitude, port.longitude]);

  return bounds.length ? bounds : null;
}

function clearSelectedShip() {
  selectedShipMmsi = null;
  map.closePopup();
  if (currentSnapshot) {
    renderFleet(currentSnapshot.ships);
  }
}

function fitRegionOnMap(bounds) {
  if (!bounds) {
    return false;
  }

  clearSelectedShip();
  setActiveView("map");
  map.fitBounds(bounds, { padding: [36, 36] });
  return true;
}

function fitAllShipsOnMap(ships) {
  const bounds = [
    ...(getPlottedShipBounds(ships) || []),
    ...(getPortBounds(currentSnapshot?.ports) || [])
  ];
  if (!bounds.length) {
    return false;
  }

  clearSelectedShip();
  setActiveView("map");
  map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
  return true;
}

function syncPorts(ports = []) {
  const livePortIds = new Set();

  ports.forEach((port) => {
    if (port.latitude === null || port.longitude === null) {
      return;
    }

    livePortIds.add(port.id);
    let marker = dclPortMarkers.get(port.id);
    if (!marker) {
      marker = L.circleMarker([port.latitude, port.longitude], {
        radius: 3,
        color: "#466d91",
        weight: 1,
        fillColor: "#d6a84f",
        fillOpacity: 0.68
      }).addTo(map);
      dclPortMarkers.set(port.id, marker);
    } else {
      marker.setLatLng([port.latitude, port.longitude]);
    }

    marker.bindPopup(portPopupMarkup(port));
    marker.bindTooltip(port.name);
  });

  for (const [id, marker] of dclPortMarkers) {
    if (!livePortIds.has(id)) {
      map.removeLayer(marker);
      dclPortMarkers.delete(id);
    }
  }
}

function syncMap(ships) {
  ships.forEach((ship) => {
    if (ship.latitude === null || ship.longitude === null) {
      const existing = markers.get(ship.mmsi);
      if (existing) {
        map.removeLayer(existing);
        markers.delete(ship.mmsi);
      }
      removeShipRoute(ship.mmsi);
      return;
    }

    let marker = markers.get(ship.mmsi);
    if (!marker) {
      marker = L.marker([ship.latitude, ship.longitude], {
        icon: L.divIcon({
          className: "",
          html: `<div class="marker-dot"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(map);

      markers.set(ship.mmsi, marker);
    } else {
      marker.setLatLng([ship.latitude, ship.longitude]);
    }

    marker.bindPopup(popupMarkup(ship));
    syncShipRoute(ship);
  });

  if (selectedShipMmsi && markers.has(selectedShipMmsi)) {
    markers.get(selectedShipMmsi).openPopup();
  }

  const bounds = [
    ...(getPlottedShipBounds(ships) || []),
    ...(getPortBounds(currentSnapshot?.ports) || [])
  ];
  if (bounds.length) {
    if (!hasFitMap) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
      hasFitMap = true;
    }
  } else {
    hasFitMap = false;
  }
}

function removeShipRoute(mmsi) {
  const routeLine = routeLines.get(mmsi);
  if (routeLine) {
    map.removeLayer(routeLine);
    routeLines.delete(mmsi);
  }

  const portMarker = portMarkers.get(mmsi);
  if (portMarker) {
    map.removeLayer(portMarker);
    portMarkers.delete(mmsi);
  }
}

function syncShipRoute(ship) {
  const destinationCoordinate = getDestinationCoordinate(ship.destination);
  if (!destinationCoordinate) {
    removeShipRoute(ship.mmsi);
    return;
  }

  const routePoints = buildSeaRoute(ship, destinationCoordinate);
  let routeLine = routeLines.get(ship.mmsi);
  if (!routeLine) {
    routeLine = L.polyline(routePoints, {
      color: "#2f6f9d",
      weight: 2.25,
      opacity: 0.62,
      dashArray: "3 9",
      lineCap: "round"
    }).addTo(map);
    routeLines.set(ship.mmsi, routeLine);
  } else {
    routeLine.setLatLngs(routePoints);
  }

  let portMarker = portMarkers.get(ship.mmsi);
  if (!portMarker) {
    portMarker = L.circleMarker(destinationCoordinate, {
      radius: 4,
      color: "#2f6f9d",
      weight: 1.5,
      fillColor: "#ffffff",
      fillOpacity: 0.86
    }).addTo(map);
    portMarkers.set(ship.mmsi, portMarker);
  } else {
    portMarker.setLatLng(destinationCoordinate);
  }

  routeLine.bindTooltip(`${ship.name} to ${ship.destination}`);
  portMarker.bindPopup(routePopupMarkup(ship));
}

function render(data) {
  const { connection, ships, ports = [] } = data;
  const cacheStatus = connection.cacheStatus ? ` (${connection.cacheStatus.replace(/-/g, " ")})` : "";
  const portStatus = ports.length ? ` • ${ports.length} DCL ports` : "";
  feedStatus.textContent = `${connection.status.replace(/_/g, " ")}${cacheStatus}`;
  feedUpdated.textContent = `${formatTime(connection.lastEventAt)}${portStatus}`;
  renderFleet(ships);
  syncPorts(ports);
  syncMap(ships);
}

function hasUsefulShipData(snapshot) {
  if (!snapshot?.ships) {
    return false;
  }

  return snapshot.ships.some(
    (ship) =>
      ship.latitude !== null ||
      ship.longitude !== null ||
      Boolean(ship.destination) ||
      Boolean(ship.lastSeen)
  );
}

function mergeShips(previousShip, nextShip) {
  if (!previousShip) {
    return nextShip;
  }

  return {
    ...previousShip,
    ...nextShip,
    destination: nextShip.destination || previousShip.destination,
    eta: nextShip.eta || previousShip.eta,
    latitude: nextShip.latitude ?? previousShip.latitude,
    longitude: nextShip.longitude ?? previousShip.longitude,
    course: nextShip.course ?? previousShip.course,
    heading: nextShip.heading ?? previousShip.heading,
    speedKnots: nextShip.speedKnots ?? previousShip.speedKnots,
    navigationStatus: nextShip.navigationStatus ?? previousShip.navigationStatus,
    lastSeen: nextShip.lastSeen || previousShip.lastSeen,
    sourceMessageType: nextShip.sourceMessageType || previousShip.sourceMessageType,
    vesselArea: nextShip.vesselArea || previousShip.vesselArea,
    currentDraughtMeters: nextShip.currentDraughtMeters ?? previousShip.currentDraughtMeters,
    callsign: nextShip.callsign || previousShip.callsign,
    aisType: nextShip.aisType || previousShip.aisType,
    aisFlag: nextShip.aisFlag || previousShip.aisFlag,
    lastPort: nextShip.lastPort || previousShip.lastPort,
    lastPortDeparture: nextShip.lastPortDeparture || previousShip.lastPortDeparture,
    detailsUrl: nextShip.detailsUrl || previousShip.detailsUrl
  };
}

function mergeSnapshots(previousSnapshot, nextSnapshot) {
  if (!previousSnapshot) {
    if (hasUsefulShipData(nextSnapshot)) {
      return nextSnapshot;
    }

    return {
      ...nextSnapshot,
      connection: {
        ...nextSnapshot.connection,
        status: "searching_for_scraped_updates"
      }
    };
  }

  const previousShips = new Map(previousSnapshot.ships.map((ship) => [ship.mmsi, ship]));
  const ships = nextSnapshot.ships.map((ship) => mergeShips(previousShips.get(ship.mmsi), ship));
  const hasFreshEvent = Boolean(nextSnapshot.connection.lastEventAt);
  const hasCachedUsefulData = hasUsefulShipData(previousSnapshot);

  return {
    connection: {
      ...nextSnapshot.connection,
      status: hasFreshEvent
        ? nextSnapshot.connection.status
        : hasCachedUsefulData
          ? "cached"
          : "searching_for_scraped_updates",
      lastEventAt: nextSnapshot.connection.lastEventAt || previousSnapshot.connection.lastEventAt,
      lastError: hasFreshEvent ? nextSnapshot.connection.lastError : previousSnapshot.connection.lastError
    },
    ships,
    ports: nextSnapshot.ports?.length ? nextSnapshot.ports : previousSnapshot.ports || []
  };
}

function persistSnapshot(data) {
  currentSnapshot = data;
  if (hasUsefulShipData(data) || data?.ports?.length) {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(data));
  }
}

function hydrateSnapshot() {
  const stored = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

async function loadSnapshot() {
  const response = await fetch("/api/ships");
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  const data = await response.json();
  const merged = mergeSnapshots(currentSnapshot, data);
  persistSnapshot(merged);
  render(merged);
}

async function refreshSnapshot() {
  try {
    await loadSnapshot();
  } catch (error) {
    feedStatus.textContent = "refresh failed";
    shipList.innerHTML = `<div class="empty-state">Unable to load fleet data. ${error.message}</div>`;
  } finally {
    scheduleNextRefresh();
  }
}

function scheduleNextRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const delay = hasUsefulShipData(currentSnapshot) ? POLL_INTERVAL_MS : COLD_START_RETRY_MS;
  refreshTimer = setTimeout(() => {
    refreshSnapshot();
  }, delay);
}

refreshSnapshot().catch((error) => {
  shipList.innerHTML = `<div class="empty-state">Unable to load fleet data. ${error.message}</div>`;
});

const cachedSnapshot = hydrateSnapshot();
if (cachedSnapshot) {
  currentSnapshot = cachedSnapshot;
  render(cachedSnapshot);
}
