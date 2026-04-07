const shipList = document.querySelector("#ship-list");
const fleetSummary = document.querySelector("#fleet-summary");
const feedStatus = document.querySelector("#feed-status");
const feedUpdated = document.querySelector("#feed-updated");
const fleetDrawer = document.querySelector("#fleet-drawer");
const fleetToggle = document.querySelector("#fleet-toggle");
const mapToolbar = document.querySelector(".map-toolbar");
const viewAllButton = document.querySelector("#view-all");
const continentButtons = Array.from(document.querySelectorAll("[data-continent]"));
const toggleButtons = Array.from(document.querySelectorAll(".toggle-button"));
const panels = Array.from(document.querySelectorAll("[data-view]"));
const POLL_INTERVAL_MS = 60000;
const COLD_START_RETRY_MS = 15000;
const SNAPSHOT_STORAGE_KEY = "dcl-tracker-snapshot";
const CONTINENT_BOUNDS = {
  northAmerica: [
    [5, -170],
    [83, -50]
  ],
  southAmerica: [
    [-56, -82],
    [13, -34]
  ],
  europe: [
    [35, -25],
    [72, 45]
  ],
  africa: [
    [-35, -20],
    [38, 52]
  ],
  asia: [
    [-10, 25],
    [82, 180]
  ],
  australia: [
    [-47, 110],
    [-10, 180]
  ]
};

const map = L.map("map", {
  zoomControl: true,
  worldCopyJump: true
}).setView([25.7617, -80.1918], 3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const markers = new Map();
let hasFitMap = false;
let currentSnapshot = null;
let refreshTimer = null;
let selectedShipMmsi = null;

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

continentButtons.forEach((button) => {
  button.addEventListener("click", () => {
    fitRegionOnMap(CONTINENT_BOUNDS[button.dataset.continent]);
  });
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

function getPlottedShipBounds(ships = currentSnapshot?.ships || []) {
  const bounds = ships
    .filter((ship) => ship.latitude !== null && ship.longitude !== null)
    .map((ship) => [ship.latitude, ship.longitude]);

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
  const bounds = getPlottedShipBounds(ships);
  if (!bounds) {
    return false;
  }

  clearSelectedShip();
  setActiveView("map");
  map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
  return true;
}

function syncMap(ships) {
  ships.forEach((ship) => {
    if (ship.latitude === null || ship.longitude === null) {
      const existing = markers.get(ship.mmsi);
      if (existing) {
        map.removeLayer(existing);
        markers.delete(ship.mmsi);
      }
      return;
    }

    let marker = markers.get(ship.mmsi);
    if (!marker) {
      marker = L.marker([ship.latitude, ship.longitude], {
        icon: L.divIcon({
          className: "",
          html: `<div class="marker-dot"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);

      markers.set(ship.mmsi, marker);
    } else {
      marker.setLatLng([ship.latitude, ship.longitude]);
    }

    marker.bindPopup(popupMarkup(ship));
  });

  if (selectedShipMmsi && markers.has(selectedShipMmsi)) {
    markers.get(selectedShipMmsi).openPopup();
  }

  const bounds = getPlottedShipBounds(ships);
  if (bounds) {
    if (!hasFitMap) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 5 });
      hasFitMap = true;
    }
  } else {
    hasFitMap = false;
  }
}

function render(data) {
  const { connection, ships } = data;
  const cacheStatus = connection.cacheStatus ? ` (${connection.cacheStatus.replace(/-/g, " ")})` : "";
  feedStatus.textContent = `${connection.status.replace(/_/g, " ")}${cacheStatus}`;
  feedUpdated.textContent = formatTime(connection.lastEventAt);
  renderFleet(ships);
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
    ships
  };
}

function persistSnapshot(data) {
  currentSnapshot = data;
  if (hasUsefulShipData(data)) {
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
