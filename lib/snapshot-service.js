import {
  collectDisneySnapshot,
  createConnectionState,
  createShipState,
  hasUsefulShipData,
  mergeShipSnapshots,
  snapshot
} from "./disney-cruise-data.js";
import {
  getCacheDebugInfo,
  isCacheConfigured,
  readCachedSnapshot,
  writeCachedSnapshot
} from "./cache.js";

const CACHE_STALE_MS = 1000 * 60 * 10;

function emptyFleetSnapshot(status) {
  return snapshot(createShipState(), {
    ...createConnectionState(true),
    status
  });
}

function addCacheMetadata(snapshot, cacheStatus) {
  return {
    ...snapshot,
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
  apiKey,
  attempts = 2,
  timeoutMs = 9000,
  idleAfterFirstMessageMs = 2200,
  maxRelevantMessages = 40
}) {
  let merged = null;
  let cacheWriteSucceeded = false;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const next = await collectDisneySnapshot({
      apiKey,
      timeoutMs,
      idleAfterFirstMessageMs,
      maxRelevantMessages
    });

    merged = merged ? mergeShipSnapshots(merged, next) : next;

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

export async function getSnapshotForRequest(apiKey) {
  const cached = await readCachedSnapshot();
  if (cached && !shouldRefreshSnapshot(cached)) {
    return addCacheMetadata(cached, "hit");
  }

  if (cached) {
    return addCacheMetadata(cached, "stale");
  }

  return addCacheMetadata(
    emptyFleetSnapshot(apiKey ? "awaiting_cache_seed" : "awaiting_api_key"),
    "miss"
  );
}
