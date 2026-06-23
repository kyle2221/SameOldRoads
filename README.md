# SameOldRoads

> Track your road trips. Discover places. Read real Google reviews. Works offline.

[![CI](https://github.com/kyle2221/SameOldRoads/actions/workflows/ci.yml/badge.svg)](https://github.com/kyle2221/SameOldRoads/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](.nvmrc)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0efc)](https://web.dev/progressive-web-apps/)

A mobile-first PWA for road-trippers — record your routes, save the spots you love, follow curated community routes, and discover new places with live Google reviews pulled through a hardened backend proxy.

## ✨ Features

- **Trip tracking** — GPS recording with live distance + duration + speed, offline-first via IndexedDB.
- **Curated routes** — Follow hand-picked scenic drives (Blue Ridge, PCH, Hill Country) with stops and notes.
- **Discover** — Search Google Places with **type-ahead autocomplete**, read real Google reviews, browse **place photos** and **opening hours**, all without ever exposing API keys to the browser.
- **Places** — Save restaurants and destinations, attach notes, edit / delete.
- **Stats** — Distance over time, trip-length distribution, restaurant vs destination breakdown, leaderboard of your longest trips, average speed, year-over-year delta — all in pure SVG.
- **Settings** — Light / dark / system theme, metric / imperial units, JSON export, **live backend health indicator**, account management.
- **PWA** — Installable, works offline, caches map tiles + routing responses.
- **Security** — PBKDF2 password hashing (Web Crypto), per-IP rate limiting, helmet security headers, server-side API key vault, request-id correlation.

## 🏗 Architecture

```
SameOldRoads/
├── src/                       # React 19 + Vite + Tailwind 4 + Zustand
│   ├── pages/                 # Home, Discover, Map, Routes, Places, Trips, Stats, Settings, Auth
│   ├── components/             # NavBar, RouteMap, NodeBackground, ReviewsPanel, ErrorBoundary, Toaster
│   ├── services/api.js         # Frontend client for the backend (fetch /api/*)
│   ├── auth.js                 # Web Crypto PBKDF2 hashing + legacy btoa migration
│   ├── theme.js                # Light/dark/system + units preferences
│   ├── db.js                   # IndexedDB wrappers
│   └── store.js                # Zustand global state
└── server/                    # Node 18+ Express backend
    └── src/
        ├── routes/             # /api/places/* /api/reviews /api/health
        ├── services/           # googleMaps.js (Places v1 + photos + autocomplete), serpApi.js (reviews + rating dist)
        ├── middleware/         # rateLimit, errorHandler, requestId
        └── utils/              # cache (TTL+LRU), http (fetch+timeout+retry+buffer), logger, validate, config
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

The frontend's Vite dev server proxies `/api/*` to `http://localhost:8787`, so just keep both running. Or run both at once with `npm run dev:all`.

### 3. Build for production

```bash
# Frontend
npm run build        # outputs to dist/

# Backend
cd server && npm start
```

In production, serve `dist/` as static files and put the Express server on the same origin (or set `VITE_API_BASE` to the absolute API URL before building).

## 🐳 Deploy with Docker

```bash
docker build -t sameoldroads .
docker run -p 8787:8787 \
  -e GOOGLE_MAPS_API_KEY=... \
  -e SERPAPI_API_KEY=... \
  -e CORS_ORIGIN=https://your-frontend.com \
  sameoldroads
```

Or with `docker compose`:

```bash
cp .env.example .env   # fill in keys
docker compose up -d
```

### One-click deploys

- **Render** — `render.yaml` is included. Create a new Blueprint and point it at this repo.
- **Fly.io** — `fly.toml` is included. `fly launch` then `fly deploy`.
- **Railway / Northflank / any container host** — use the Dockerfile.

## 🔌 API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `GET` | `/api/health/stats` | Cache hit/miss stats, mem, uptime, key status |
| `GET` | `/api/places/autocomplete?input=&lat=&lng=&radius=` | Type-ahead place suggestions |
| `GET` | `/api/places/search?q=&lat=&lng=&radius=&pageSize=` | Google Maps Places Text Search |
| `GET` | `/api/places/details?placeId=` | Google Maps Places Details (hours, photos, open now) |
| `GET` | `/api/places/photo?photoRef=&maxWidthPx=&maxHeightPx=` | Proxied Google Place photo (24h browser cache) |
| `GET` | `/api/places/reverse-geocode?lat=&lng=` | Reverse geocode → Google `place_id` |
| `GET` | `/api/reviews?query=&placeId=&lat=&lng=&limit=` | Google reviews via SerpApi (with rating distribution) |

All upstream-proxying routes are rate-limited per IP (default 200 req/15min globally, 120 req/hour for paid upstreams). Cached responses stay fresh for 30 min (search) to 12 hours (reviews). Every response includes an `X-Request-Id` header for support correlation.

## 🔐 Security notes

- API keys are read from `server/.env` server-side only — `.env` is gitignored at both repo root and `server/`.
- Passwords are hashed with **PBKDF2 (SHA-256, 150k iterations, 16-byte salt)** via Web Crypto. A one-time migration upgrades any legacy `btoa`-style hashes transparently on next sign-in.
- The server uses `helmet` for security headers, `compression`, `cors` allowlist, and per-IP rate limiting via `express-rate-limit`.
- All upstream API calls use `AbortController` with an 8s timeout — slow upstreams never hang a request. Transient (5xx, timeout, network) failures get one automatic retry with exponential backoff.
- Every request is tagged with a short `X-Request-Id` (generated or echoed from the client) and logged with method, path, status, and duration for observability.

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 8, Tailwind 4, Zustand 5, Leaflet 1.9, idb 8, vite-plugin-pwa |
| Backend | Node 18+, Express 4, helmet, compression, express-rate-limit |
| Data | IndexedDB (client) — no server-side database required |
| Map tiles | OpenStreetMap (with cached OSRM routing) |
| Reviews | SerpApi Google Maps Reviews engine |
| Places search | Google Maps Places API v1 (`places.googleapis.com`) |

## 🤝 Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for setup, style, and review expectations.

## 📝 License

MIT — see [LICENSE](LICENSE).
