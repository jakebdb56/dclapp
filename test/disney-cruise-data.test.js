import test from "node:test";
import assert from "node:assert/strict";

import { mergeShipSnapshots } from "../lib/disney-cruise-data.js";

test("mergeShipSnapshots preserves activeSailing when a refresh omits sailing data", () => {
  const previousSnapshot = {
    connection: {
      status: "connected",
      lastEventAt: "2026-05-17T12:00:00.000Z",
      lastError: null
    },
    ships: [
      {
        mmsi: "311001098",
        name: "Disney Wish",
        latitude: 28.4,
        longitude: -80.6,
        activeSailing: {
          url: "https://example.com/wish-1",
          title: "3 Night Bahamian Cruise From Port Canaveral",
          departureDate: "2026-05-15T00:00:00.000Z",
          returnDate: "2026-05-18T00:00:00.000Z",
          shipName: "Disney Wish"
        }
      }
    ],
    ports: []
  };

  const nextSnapshot = {
    connection: {
      status: "connected",
      lastEventAt: "2026-05-17T13:00:00.000Z",
      lastError: null
    },
    ships: [
      {
        mmsi: "311001098",
        name: "Disney Wish",
        latitude: 28.5,
        longitude: -80.5,
        activeSailing: null
      }
    ],
    ports: []
  };

  const merged = mergeShipSnapshots(previousSnapshot, nextSnapshot);

  assert.equal(merged.ships[0].latitude, 28.5);
  assert.equal(merged.ships[0].activeSailing?.url, "https://example.com/wish-1");
});
