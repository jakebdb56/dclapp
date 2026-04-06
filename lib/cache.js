import { Redis } from "@upstash/redis";

const SNAPSHOT_KEY = "dcl:snapshot:latest";
const LOCK_KEY = "dcl:snapshot:refresh-lock";
const SNAPSHOT_TTL_SECONDS = 60 * 60 * 24 * 7;
const LOCK_TTL_SECONDS = 45;

let redis = null;
let lastCacheError = null;

function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

export function getCacheDebugInfo() {
  const credentials = getRedisCredentials();

  return {
    configured: Boolean(credentials),
    envFamily: process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN
      ? "upstash"
      : process.env.KV_REST_API_URL || process.env.KV_REST_API_TOKEN
        ? "kv"
        : "none",
    lastError: lastCacheError
  };
}

function getRedis() {
  if (redis) {
    return redis;
  }

  try {
    const credentials = getRedisCredentials();
    if (!credentials) {
      return null;
    }

    redis = new Redis(credentials);
    lastCacheError = null;
    return redis;
  } catch (error) {
    lastCacheError = error instanceof Error ? error.message : "Unable to initialize Redis client.";
    return null;
  }
}

export function isCacheConfigured() {
  return Boolean(getRedisCredentials());
}

export async function readCachedSnapshot() {
  const client = getRedis();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get(SNAPSHOT_KEY);
    lastCacheError = null;
    return value && typeof value === "object" ? value : null;
  } catch (error) {
    lastCacheError = error instanceof Error ? error.message : "Redis read failed.";
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
    lastCacheError = null;
    return true;
  } catch (error) {
    lastCacheError = error instanceof Error ? error.message : "Redis write failed.";
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

    lastCacheError = null;
    return result === "OK";
  } catch (error) {
    lastCacheError = error instanceof Error ? error.message : "Redis lock failed.";
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
    lastCacheError = null;
  } catch {
    // Ignore cache cleanup failures and serve uncached snapshots instead.
  }
}
