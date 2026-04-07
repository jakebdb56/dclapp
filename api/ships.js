import { getSnapshotForRequest } from "../lib/snapshot-service.js";
import { createConnectionState, createShipState, snapshot } from "../lib/disney-cruise-data.js";
import { FALLBACK_DISNEY_PORTS } from "../lib/disney-ports.js";

export const config = {
  maxDuration: 20
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const shipsSnapshot = await getSnapshotForRequest();

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json(shipsSnapshot);
  } catch (error) {
    const fallback = snapshot(
      createShipState(),
      {
        ...createConnectionState(),
        status: "error",
        lastError: error instanceof Error ? error.message : "Unexpected server error."
      },
      FALLBACK_DISNEY_PORTS
    );

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json(fallback);
  }
}
