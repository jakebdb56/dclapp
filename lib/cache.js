import { Redis } from "@upstash/redis";

const SNAPSHOT_KEY = "dcl:snapshot:latest";
const LOCK_KEY = "dcl:snapshot:refresh-lock";
const SNAPSHOT_TTL_SECONDS = 60 * 60 * 24 * 7;
const LOCK_TTL_SECONDS = 45;

let redis = null;

function getRedis() {
  if (redis) {
    return redis;
  }

  try {
    redis = Redis.fromEnv();
    return redis;
  } catch {
    return null;
  }
}

export function isCacheConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_URL ||
      process.env.KV_REST_API_TOKEN
  );
}

export async function readCachedSnapshot() {
  const client = getRedis();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(SNAPSHOT_KEY);
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

export async function writeCachedSnapshot(snapshot) {
  const client = getRedis();
  if (!client) {
    return false;
  }

  try {
    await client.set(SNAPSHOT_KEY, snapshot, {
      ex: SNAPSHOT_TTL_SECONDS
    });
    return true;
  } catch {
    return false;
  }
}

export async function acquireRefreshLock() {
  const client = getRedis();
  if (!client) {
    return true;
  }

  try {
    const result = await client.set(LOCK_KEY, Date.now().toString(), {
      nx: true,
      ex: LOCK_TTL_SECONDS
    });

    return result === "OK";
  } catch {
    return true;
  }
}

export async function releaseRefreshLock() {
  const client = getRedis();
  if (!client) {
    return;
  }

  try {
    await client.del(LOCK_KEY);
  } catch {
    // Ignore cache cleanup failures and serve uncached snapshots instead.
  }
}
