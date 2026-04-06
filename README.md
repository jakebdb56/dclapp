# Disney Cruise Tracker

Mobile-friendly web app for tracking Disney Cruise Line ships with live AIS position data from [AISStream](https://aisstream.io/documentation.html).

## What it does

- Lists Disney Cruise Line ships in a mobile-friendly card layout
- Shows each ship's most recent reported latitude and longitude
- Displays the next reported destination and ETA when AIS static data is available
- Renders ship markers on a live map
- Uses a backend relay so your AISStream API key is not exposed in the browser

## Included ships

- Disney Magic
- Disney Wonder
- Disney Dream
- Disney Fantasy
- Disney Wish
- Disney Treasure
- Disney Destiny
- Disney Adventure

## Setup

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env`.
3. Set `AISSTREAM_API_KEY` in `.env`.
4. Start the app:

```bash
node --env-file=.env server.js
```

5. Open [http://localhost:3000](http://localhost:3000)

## Notes

- `aisstream.io` does not support direct browser connections, so this app connects to AISStream from the server and streams snapshots to the frontend with Server-Sent Events.
- The app subscribes to the whole world bounding box but filters down to the Disney ship MMSI numbers.
- If a ship has not reported recently, it will still appear in the list but may not be plotted on the map until a fresh position arrives.
- This workspace did not have Node installed, so the code was scaffolded but not run locally here.
