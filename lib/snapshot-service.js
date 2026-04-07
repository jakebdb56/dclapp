import {
  collectDisneySnapshot,
  createConnectionState,
  createShipState,
  hasUsefulShipData,
  mergeShipSnapshots,
  snapshot
} from "./disney-cruise-data.js";
import { FALLBACK_DISNEY_PORTS, collectDisneyPorts } from "./disney-ports.js";
import {
  getCacheDebugInfo,
  isCacheConfigured,
  readCachedSnapshot,
  writeCachedSnapshot
} from "./cache.js";

const CACHE_STALE_MS = 1000 * 60 * 10;

function emptyFleetSnapshot(status) {
  return snapshot(createShipState(), {
    ...createConnectionState(),
    status
  }, FALLBACK_DISNEY_PORTS);
}

function addCacheMetadata(snapshot, cacheStatus) {
  return {
    ...snapshot,
    ports: snapshot.ports?.length ? snapshot.ports : FALLBACK_DISNEY_PORTS,
    connection: {
      ...snapshot.connection,
      cacheStatus
    }
  };
}

function snapshotAgeMs(snapshot) {
  const stamp = snapshot?.connection?.lastEventAt || snapshot?.connection?.startedAt;
  const time = stamp ? new Date(stamp).getTime() : Number.NaN;
  return Number.isFinite(time) ? Date.now() - time : Number.POSITIVE_INFINITY;
}

export function shouldRefreshSnapshot(snapshot) {
  if (!snapshot) {
    return true;
  }

  return snapshotAgeMs(snapshot) > CACHE_STALE_MS;
}

export async function refreshAndCacheSnapshot({
  attempts = 2,
  timeoutMs = 9000
}) {
  const cached = await readCachedSnapshot();
  const ports = await collectDisneyPorts({
    timeoutMs: Math.min(timeoutMs, 5000)
  }).catch(() => cached?.ports?.length ? cached.ports : FALLBACK_DISNEY_PORTS);
  let merged = null;
  let cacheWriteSucceeded = false;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const next = await collectDisneySnapshot({
      timeoutMs
    });
    next.ports = ports.length ? ports : FALLBACK_DISNEY_PORTS;

    const nextWithCachedPositions =
      cached && hasUsefulShipData(next) ? mergeShipSnapshots(cached, next) : next;

    merged = merged ? mergeShipSnapshots(merged, nextWithCachedPositions) : nextWithCachedPositions;

    if (hasUsefulShipData(merged)) {
      break;
    }
  }

  if (merged && hasUsefulShipData(merged) && isCacheConfigured()) {
    cacheWriteSucceeded = await writeCachedSnapshot(merged);
  }

  return {
    snapshot: merged,
    cacheDebug: {
      ...getCacheDebugInfo(),
      writeAttempted: Boolean(merged && hasUsefulShipData(merged) && isCacheConfigured()),
      writeSucceeded: cacheWriteSucceeded
    }
  };
}

export async function getSnapshotForRequest() {
  const cached = await readCachedSnapshot();
  if (cached && !shouldRefreshSnapshot(cached)) {
    return addCacheMetadata(cached, "hit");
  }

  if (cached) {
    return addCacheMetadata(cached, "stale");
  }

  return addCacheMetadata(
    emptyFleetSnapshot("awaiting_cache_seed"),
    "miss"
  );
}
