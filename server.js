import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { refreshAndCacheSnapshot } from "./lib/snapshot-service.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number.parseInt(process.env.PORT || "3000", 10);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function serveStatic(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  const reqPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = join(publicDir, reqPath);

  try {
    const data = await readFile(filePath);
    const contentType = mimeTypes[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function handleShipsApi(res) {
  const result = await refreshAndCacheSnapshot({
    attempts: 1,
    timeoutMs: 8000
  });

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0"
  });
  res.end(JSON.stringify(result.snapshot));
}

async function handleRefreshApi(res) {
  const result = await refreshAndCacheSnapshot({
    attempts: 1,
    timeoutMs: 9000
  });

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, max-age=0"
  });
  res.end(JSON.stringify({
    ...result.snapshot,
    cacheDebug: result.cacheDebug
  }));
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (pathname === "/api/ships") {
      await handleShipsApi(res);
      return;
    }

    if (pathname === "/api/refresh-ships") {
      await handleRefreshApi(res);
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      error: error instanceof Error ? error.message : "Unexpected server error."
    }));
  }
});

server.listen(port, () => {
  console.log(`Disney Cruise Tracker listening on http://localhost:${port}`);
});
