import test from "node:test";
import assert from "node:assert/strict";

import {
  attachActiveSailingsToSnapshot,
  findActiveSailingForShip,
  parseOfficialSailingsMarkdown
} from "../lib/disney-sailings.js";

test("parseOfficialSailingsMarkdown extracts normalized sailings from official linked offers", () => {
  const markdown = `
## 3-Night Bahamian Cruise from Port Canaveral
Date Ship Percentage Category
[May 15, 2026](https://disneycruise.disney.go.com/cruises-destinations/list/WW0476/3-Night-Bahamian-Cruise-from-Port-Canaveral/2026-05-15-Disney-Wish)Disney Wish 20%Verandah
[May 29, 2026](https://disneycruise.disney.go.com/cruises-destinations/list/WW0480/3-Night-Bahamian-Cruise-from-Port-Canaveral/2026-05-29-Disney-Wish/)Disney Wish 20%Verandah
[May 29, 2026](https://disneycruise.disney.go.com/cruises-destinations/list/WW0480/3-Night-Bahamian-Cruise-from-Port-Canaveral/2026-05-29-Disney-Wish/)Disney Wish 20%Verandah
`;

  const sailings = parseOfficialSailingsMarkdown(markdown, "https://example.com/offers");

  assert.equal(sailings.length, 2);
  assert.deepEqual(sailings[0], {
    url: "https://disneycruise.disney.go.com/cruises-destinations/list/WW0476/3-Night-Bahamian-Cruise-from-Port-Canaveral/2026-05-15-Disney-Wish",
    code: "WW0476",
    title: "3 Night Bahamian Cruise From Port Canaveral",
    departureDate: "2026-05-15T00:00:00.000Z",
    returnDate: "2026-05-18T00:00:00.000Z",
    shipName: "Disney Wish",
    departurePort: "Port Canaveral",
    nights: 3,
    sourceUrl: "https://example.com/offers"
  });
});

test("findActiveSailingForShip returns only a single exact date-window match", () => {
  const ship = { name: "Disney Wish" };
  const sailings = [
    {
      url: "https://example.com/wish-1",
      code: "WW0476",
      title: "3 Night Bahamian Cruise From Port Canaveral",
      departureDate: "2026-05-15T00:00:00.000Z",
      returnDate: "2026-05-18T00:00:00.000Z",
      shipName: "Disney Wish"
    },
    {
      url: "https://example.com/magic-1",
      code: "DM0001",
      title: "4 Night Bahamian Cruise From Port Canaveral",
      departureDate: "2026-05-15T00:00:00.000Z",
      returnDate: "2026-05-19T00:00:00.000Z",
      shipName: "Disney Magic"
    }
  ];

  assert.equal(
    findActiveSailingForShip(ship, sailings, new Date("2026-05-14T12:00:00.000Z")),
    null
  );
  assert.equal(
    findActiveSailingForShip(ship, sailings, new Date("2026-05-19T12:00:00.000Z")),
    null
  );
  assert.equal(
    findActiveSailingForShip(ship, sailings, new Date("2026-05-16T12:00:00.000Z"))?.url,
    "https://example.com/wish-1"
  );
});

test("findActiveSailingForShip returns null for ambiguous or incomplete matches", () => {
  const ship = { name: "Disney Wish" };
  const overlapping = [
    {
      url: "https://example.com/a",
      code: "WW0476",
      title: "3 Night Bahamian Cruise From Port Canaveral",
      departureDate: "2026-05-15T00:00:00.000Z",
      returnDate: "2026-05-18T00:00:00.000Z",
      shipName: "Disney Wish"
    },
    {
      url: "https://example.com/b",
      code: "WW0477",
      title: "Special Bahamian Cruise",
      departureDate: "2026-05-16T00:00:00.000Z",
      returnDate: "2026-05-19T00:00:00.000Z",
      shipName: "Disney Wish"
    },
    {
      url: "https://example.com/c",
      code: "WW0478",
      title: "Broken Sailing",
      departureDate: null,
      returnDate: "2026-05-19T00:00:00.000Z",
      shipName: "Disney Wish"
    }
  ];

  assert.equal(
    findActiveSailingForShip(ship, overlapping, new Date("2026-05-16T12:00:00.000Z")),
    null
  );
});

test("attachActiveSailingsToSnapshot enriches only the ship with an active exact match", () => {
  const snapshot = {
    ships: [
      { name: "Disney Wish", mmsi: "1" },
      { name: "Disney Magic", mmsi: "2" }
    ]
  };
  const sailings = [
    {
      url: "https://example.com/wish-1",
      code: "WW0476",
      title: "3 Night Bahamian Cruise From Port Canaveral",
      departureDate: "2026-05-15T00:00:00.000Z",
      returnDate: "2026-05-18T00:00:00.000Z",
      shipName: "Disney Wish"
    }
  ];

  const enriched = attachActiveSailingsToSnapshot(snapshot, sailings, new Date("2026-05-17T12:00:00.000Z"));

  assert.equal(enriched.ships[0].activeSailing?.url, "https://example.com/wish-1");
  assert.equal(enriched.ships[1].activeSailing, null);
});
