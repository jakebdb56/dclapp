# Disney Cruise Tracker

Mobile-friendly web app for tracking Disney Cruise Line ships with AIS position data from [AISStream](https://aisstream.io/documentation.html).

## What it does

- Lists Disney Cruise Line ships in a mobile-friendly card layout
- Shows each ship's most recent reported latitude and longitude
- Displays the next reported destination and ETA when AIS static data is available
- Renders ship markers on a live map
- Uses a Vercel-compatible API route so your AISStream API key is not exposed in the browser

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

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env`.
3. Set `AISSTREAM_API_KEY` in `.env`.
4. Run with Vercel's local dev server:

```bash
npx vercel dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Vercel deployment

1. Import the repo into Vercel.
2. Add `AISSTREAM_API_KEY` as an environment variable.
3. Add Redis cache integration through Vercel Marketplace Storage using Upstash Redis.
4. Optionally set `CRON_SECRET` if you want to protect manual or scheduled refresh calls.
5. Deploy.

The frontend is static and the data comes from the serverless route at `/api/ships`.

## Notes

- `aisstream.io` does not support direct browser connections, so this app connects from a serverless API route and returns snapshots to the frontend.
- On Vercel, `/api/ships` serves the last good cached snapshot from Redis and refreshes AISStream only when the cache is empty or stale.
- The optional `/api/refresh-ships` endpoint can be used for manual warming or scheduled refreshes. If you set `CRON_SECRET`, send it as a bearer token or `?secret=...`.
- Vercel Hobby cron jobs only run once per day according to Vercel's docs, so frequent warming requires either a higher Vercel plan or an external scheduler calling `/api/refresh-ships`.
