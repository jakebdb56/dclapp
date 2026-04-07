# Disney Cruise Tracker

Mobile-friendly web app for tracking Disney Cruise Line ships with AIS position data scraped from VesselFinder detail pages.

## What it does

- Lists Disney Cruise Line ships in a mobile-friendly card layout
- Shows each ship's most recent reported latitude and longitude
- Displays the next reported destination and ETA when AIS data is available
- Scrapes VesselFinder detail pages for every configured Disney Cruise Line ship
- Renders ship markers on a live map
- Uses a Vercel-compatible API route so scraping happens server-side

## Included ships

- Disney Magic
- Disney Wonder
- Disney Dream
- Disney Fantasy
- Disney Wish
- Disney Treasure
- Disney Destiny
- Disney Adventure

## Local setup

1. Install Node.js 24 or newer. The local setup has been updated and verified with Node.js 24.14.1.
2. Copy `.env.example` to `.env`.
3. Optionally set `VESSELFINDER_DETAILS_USER_AGENT` in `.env`.
4. Run with Vercel's local dev server:

```bash
npx vercel dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Vercel deployment

1. Import the repo into Vercel.
2. Add Redis cache integration through Vercel Marketplace Storage using Upstash Redis.
3. Optionally set `VESSELFINDER_DETAILS_USER_AGENT` if you need to override the default scraper user agent.
4. Optionally set `CRON_SECRET` if you want to protect manual or scheduled refresh calls.
5. Deploy.

The frontend is static and the data comes from the serverless route at `/api/ships`.

## Scheduled refresh

This repo includes a GitHub Actions workflow at `.github/workflows/warm-cache.yml` that warms the Redis cache every hour. Each warm-up runs the scraper from GitHub Actions and writes the normalized snapshot directly to Redis.

To enable it:

1. In GitHub, open `Settings` -> `Secrets and variables` -> `Actions`.
2. Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` with the same Redis credentials used by Vercel. If your integration uses Vercel KV names instead, add `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Optionally add `VESSELFINDER_DETAILS_USER_AGENT` if you need to override the default scraper user agent.
4. Enable GitHub Actions for the repo if they are disabled.

You can also run the workflow manually with `Run workflow` from the Actions tab.

## Notes

- VesselFinder detail pages are scraped from the serverless API route so the browser only receives normalized ship data.
- On Vercel, `/api/ships` serves the last good cached snapshot from Redis and never waits on a live scrape.
- The optional `/api/refresh-ships` endpoint can be used for manual warming from Vercel. If you set `CRON_SECRET`, send it as a bearer token or `?secret=...`.
- Vercel may time out while scraping VesselFinder directly, so scheduled warming runs in GitHub Actions and writes to Redis directly.
