# Disney Cruise Tracker

Mobile-friendly web app for tracking Disney Cruise Line ships with AIS position data from [VesselFinder](https://www.vesselfinder.com/vessel-positions-api).

## What it does

- Lists Disney Cruise Line ships in a mobile-friendly card layout
- Shows each ship's most recent reported latitude and longitude
- Displays the next reported destination and ETA when AIS data is available
- Scrapes the Disney Destiny detail page at `https://www.vesselfinder.com/vessels/details/9834741`
- Renders ship markers on a live map
- Uses a Vercel-compatible API route so your VesselFinder API key is not exposed in the browser

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
3. Set `VESSELFINDER_API_KEY` in `.env`.
4. Run with Vercel's local dev server:

```bash
npx vercel dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Vercel deployment

1. Import the repo into Vercel.
2. Add `VESSELFINDER_API_KEY` as an environment variable.
3. Add Redis cache integration through Vercel Marketplace Storage using Upstash Redis.
4. Optionally set `CRON_SECRET` if you want to protect manual or scheduled refresh calls.
5. Deploy.

The frontend is static and the data comes from the serverless route at `/api/ships`.

## Scheduled refresh

This repo includes a GitHub Actions workflow at `.github/workflows/warm-cache.yml` that warms the Redis cache every hour. Each warm-up calls `/api/refresh-ships`, which also scrapes the Disney Destiny VesselFinder details page.

To enable it:

1. In GitHub, open `Settings` -> `Secrets and variables` -> `Actions`.
2. Add `DCL_REFRESH_URL` with your refresh endpoint URL:

```text
https://www.disneycruise.tech/api/refresh-ships
```

3. If you set `CRON_SECRET` in Vercel, add the same value in GitHub as `DCL_CRON_SECRET`.
4. Enable GitHub Actions for the repo if they are disabled.

You can also run the workflow manually with `Run workflow` from the Actions tab.

## Notes

- VesselFinder requests are made from the serverless API route so the API key stays out of the browser.
- The Disney Destiny details-page scrape is enabled by default and can be disabled with `VESSELFINDER_DETAILS_SCRAPE=false`.
- On Vercel, `/api/ships` serves the last good cached snapshot from Redis and never waits on a live VesselFinder refresh.
- The optional `/api/refresh-ships` endpoint can be used for manual warming or scheduled refreshes. If you set `CRON_SECRET`, send it as a bearer token or `?secret=...`.
- Vercel Hobby cron jobs only run once per day according to Vercel's docs, so frequent warming requires either a higher Vercel plan or an external scheduler calling `/api/refresh-ships`.
