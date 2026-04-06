import { getSnapshotForRequest } from "../lib/snapshot-service.js";

export const config = {
  maxDuration: 20
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const snapshot = await getSnapshotForRequest(process.env.AISSTREAM_API_KEY);

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json(snapshot);
}
