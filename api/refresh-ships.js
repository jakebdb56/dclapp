import { refreshAndCacheSnapshot } from "../lib/snapshot-service.js";

export const config = {
  maxDuration: 60
};

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const querySecret = req.query?.secret;
  return bearer === secret || querySecret === secret;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = await refreshAndCacheSnapshot({
    attempts: 2,
    timeoutMs: 25000
  });

  const payload = {
    ...result.snapshot,
    cacheDebug: result.cacheDebug
  };

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json(payload);
}
