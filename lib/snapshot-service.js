import {
  collectDisneySnapshot,
  createConnectionState,
  createShipState,
  hasUsefulShipData,
  mergeShipSnapshots,
  snapshot
} from "./disney-cruise-data.js";
import {
  acquireRefreshLock,
  isCacheConfigured,
  readCachedSnapshot,
  releaseRefreshLock,
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
    await writeCachedSnapshot(merged);
  }

  return merged;
}

export async function getSnapshotForRequest(apiKey) {
  const cached = await readCachedSnapshot();
  const stale = shouldRefreshSnapshot(cached);

  if (cached && !stale) {
    return addCacheMetadata(cached, "hit");
  }

  const lockAcquired = await acquireRefreshLock();
  if (!lockAcquired) {
    if (cached) {
      return addCacheMetadata(cached, "stale-serving-while-refreshing");
    }

    return addCacheMetadata(
      emptyFleetSnapshot("refresh_in_progress"),
      "miss"
    );
  }

  try {
    const refreshed = await refreshAndCacheSnapshot({
      apiKey,
      attempts: cached ? 1 : 2,
      timeoutMs: cached ? 9000 : 8000,
      idleAfterFirstMessageMs: 2200,
      maxRelevantMessages: 40
    });

    if (refreshed && hasUsefulShipData(refreshed)) {
      return addCacheMetadata(refreshed, cached ? "refreshed" : "seeded");
    }

    if (cached) {
      return addCacheMetadata(cached, "stale-fallback");
    }

    return addCacheMetadata(refreshed || emptyFleetSnapshot("searching_for_disney_updates"), "miss");
  } finally {
    await releaseRefreshLock();
  }
}
