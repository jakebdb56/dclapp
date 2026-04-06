const shipList = document.querySelector("#ship-list");
const fleetSummary = document.querySelector("#fleet-summary");
const feedStatus = document.querySelector("#feed-status");
const feedUpdated = document.querySelector("#feed-updated");
const toggleButtons = Array.from(document.querySelectorAll(".toggle-button"));
const panels = Array.from(document.querySelectorAll("[data-view]"));
const POLL_INTERVAL_MS = 60000;
const COLD_START_RETRY_MS = 15000;
const SNAPSHOT_STORAGE_KEY = "dcl-tracker-snapshot";

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

toggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.viewTarget;

    toggleButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.view === target);
    });

    if (target === "map") {
      setTimeout(() => map.invalidateSize(), 150);
    }
  });
});

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

function getShipStatus(ship) {
  if (!ship.lastSeen) {
    return { label: "No signal", className: "status-offline" };
  }

  const lastSeen = new Date(ship.lastSeen).getTime();
  const ageMinutes = (Date.now() - lastSeen) / 60000;

  if (ageMinutes <= 30) {
    return { label: "Live", className: "status-live" };
  }

  if (ageMinutes <= 240) {
    return { label: "Stale", className: "status-stale" };
  }

  return { label: "Offline", className: "status-offline" };
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
      const status = getShipStatus(ship);
      return `
        <article class="ship-card">
          <div class="ship-card-top">
            <div>
              <h3>${ship.name}</h3>
              <p class="ship-subline">${ship.className} • ${ship.homeRegion}</p>
            </div>
            <span class="status-badge ${status.className}">${status.label}</span>
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
            Last seen: ${formatTime(ship.lastSeen)}${ship.sourceMessageType ? ` • ${ship.sourceMessageType}` : ""}
          </p>
        </article>
      `;
    })
    .join("");
}

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

function syncMap(ships) {
  const bounds = [];

  ships.forEach((ship) => {
    if (ship.latitude === null || ship.longitude === null) {
      const existing = markers.get(ship.mmsi);
      if (existing) {
        map.removeLayer(existing);
        markers.delete(ship.mmsi);
      }
      return;
    }

    bounds.push([ship.latitude, ship.longitude]);

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

  if (bounds.length) {
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
  feedStatus.textContent = connection.status.replace(/_/g, " ");
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
    sourceMessageType: nextShip.sourceMessageType || previousShip.sourceMessageType
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
        status: "searching_for_disney_updates"
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
          : "searching_for_disney_updates",
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
