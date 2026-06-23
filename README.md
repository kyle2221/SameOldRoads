# SameOldRoads

> Track your road trips. Discover places. Read real Google reviews. Works offline.

A mobile-first PWA for road-trippers — record your routes, save the spots you love, follow curated community routes, and discover new places with live Google reviews pulled through a hardened backend proxy.

## ✨ Features

- **Trip tracking** — GPS recording with live distance + duration, offline-first via IndexedDB.
- **Curated routes** — Follow hand-picked scenic drives (Blue Ridge, PCH, Hill Country) with stops and notes.
- **Discover** — Search Google Places (Text Search API) and read real Google reviews (via SerpApi) without ever exposing API keys to the browser.
- **Places** — Save restaurants and destinations, attach notes, edit / delete.
- **Stats** — Distance over time, trip-length distribution, restaurant vs destination breakdown, leaderboard of your longest trips — all in pure SVG.
- **Settings** — Light / dark / system theme, metric / imperial units, JSON export, account management.
- **PWA** — Installable, works offline, caches map tiles + routing responses.
- **Security** — PBKDF2 password hashing (Web Crypto), per-IP rate limiting, helmet security headers, server-side API key vault.

## 🏗 Architecture

```
SameOldRoads/
├── src/                       # React 19 + Vite + Tailwind 4 + Zustand
│   ├── pages/                 # Home, Discover, Map, Routes, Places, Trips, Stats, Settings, Auth
│   ├── components/             # NavBar, RouteMap, NodeBackground, ReviewsPanel, ErrorBoundary
│   ├── services/api.js         # Frontend client for the backend (fetch /api/*)
│   ├── auth.js                 # Web Crypto PBKDF2 hashing + legacy btoa migration
│   ├── theme.js                # Light/dark/system + units preferences
│   ├── db.js                   # IndexedDB wrappers
│   └── store.js                # Zustand global state
└── server/                    # Node 18+ Express backend
    └── src/
        ├── routes/             # /api/places/* /api/reviews /api/health
        ├── services/           # googleMaps.js (Places v1 API), serpApi.js (Google reviews)
        ├── middleware/         # rateLimit, errorHandler, asyncHandler
        └── utils/              # cache (TTL+LRU), http (fetch+timeout), logger, config
```

The frontend talks to `/api/*` on the same origin (proxied to `:8787` in dev via Vite). All third-party API keys live in `server/.env` and never reach the browser.

## 🚀 Quick start

### 1. Frontend

```bash
npm install
npm run dev          # http://localhost:5173
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in real values:
#   GOOGLE_MAPS_API_KEY  — from https://console.cloud.google.com (enable Places API New)
#   SERPAPI_API_KEY       — from https://serpapi.com/dashboard
npm start            # http://localhost:8787
```

The frontend's Vite dev server proxies `/api/*` to `http://localhost:8787`, so just keep both running.

### 3. Build for production

```bash
# Frontend
npm run build        # outputs to dist/

# Backend
cd server && npm start
```

In production, serve `dist/` as static files and put the Express server on the same origin (or set `VITE_API_BASE` to the absolute API URL before building).

## 🔌 API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/health/stats` | Cache hit/miss stats |
| `GET` | `/api/places/search?q=&lat=&lng=&radius=&pageSize=` | Google Maps Places Text Search |
| `GET` | `/api/places/details?placeId=` | Google Maps Places Details |
| `GET` | `/api/places/reverse-geocode?lat=&lng=` | Reverse geocode → Google `place_id` |
| `GET` | `/api/reviews?query=&placeId=&lat=&lng=&limit=` | Google reviews via SerpApi |

All upstream-proxying routes are rate-limited per IP (default 120 req/hour — repeated queries are cached server-side so this is generous). Cached responses stay fresh for 30 min (search) to 12 hours (reviews).

## 🔐 Security notes

- API keys are read from `server/.env` server-side only — `.env` is gitignored at both repo root and `server/`.
- Passwords are hashed with **PBKDF2 (SHA-256, 150k iterations, 16-byte salt)** via Web Crypto. A one-time migration upgrades any legacy `btoa`-style hashes transparently on next sign-in.
- The server uses `helmet` for security headers, `compression`, `cors` allowlist, and per-IP rate limiting via `express-rate-limit`.
- All upstream API calls use `AbortController` with an 8s timeout — slow upstreams never hang a request.

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind 4, Zustand 5, Leaflet 1.9, idb 8, vite-plugin-pwa |
| Backend | Node 18+, Express 4, helmet, compression, express-rate-limit |
| Data | IndexedDB (client) — no server-side database required |
| Map tiles | OpenStreetMap (with cached OSRM routing) |
| Reviews | SerpApi Google Maps Reviews engine |
| Places search | Google Maps Places API v1 (`places.googleapis.com`) |

## 📝 License

MIT — see `LICENSE` if present. Default is all rights reserved by the repo owner.
