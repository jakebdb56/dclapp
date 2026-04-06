const shipList = document.querySelector("#ship-list");
const fleetSummary = document.querySelector("#fleet-summary");
const feedStatus = document.querySelector("#feed-status");
const feedUpdated = document.querySelector("#feed-updated");
const toggleButtons = Array.from(document.querySelectorAll(".toggle-button"));
const panels = Array.from(document.querySelectorAll("[data-view]"));

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

async function loadInitialData() {
  const response = await fetch("/api/ships");
  const data = await response.json();
  render(data);
}

function connectStream() {
  const source = new EventSource("/api/stream");

  source.addEventListener("snapshot", (event) => {
    render(JSON.parse(event.data));
  });

  source.onerror = () => {
    feedStatus.textContent = "stream reconnecting";
  };
}

loadInitialData().catch((error) => {
  shipList.innerHTML = `<div class="empty-state">Unable to load fleet data. ${error.message}</div>`;
});

connectStream();
