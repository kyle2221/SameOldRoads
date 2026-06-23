# Contributing to SameOldRoads

Thanks for being here. This is a small, opinionated repo — keep PRs focused and the diffs readable.

## Setup

```bash
git clone https://github.com/kyle2221/SameOldRoads.git
cd SameOldRoads
npm install               # frontend
cd server && npm install  # backend
cp server/.env.example server/.env   # fill in real keys
cd ..
npm run dev:all           # runs frontend (5173) + backend (8787) together
```

## Project layout

```
src/              React 19 frontend (Vite, Tailwind 4, Zustand, Leaflet)
server/src/       Node 18+ Express API
```

The frontend talks to `/api/*` on the same origin (Vite proxies to `:8787` in dev).
**Never** put third-party API keys in the frontend — they live in `server/.env`.

## Before you open a PR

1. **Lint** — `npm run lint` (eslint, configured in `eslint.config.js`)
2. **Build** — `npm run build` (catches import errors, type mistakes)
3. **Boot the backend** — `cd server && npm start` then `curl http://localhost:8787/api/health`
4. **No secrets in code** — `.env` files are gitignored at root and in `server/`. If you accidentally commit a key, rotate it **before** pushing.

## Code style

- Frontend: functional React, inline styles using CSS variables (no Tailwind utility classes despite Tailwind being installed — the design system is CSS-var based). Keep components small. Lift shared state into the Zustand store (`src/store.js`).
- Backend: ESM, no TypeScript. Pure-Node fetch. Each upstream call goes through `utils/http.js` so timeouts and structured errors are consistent. Add new caches to `utils/cache.js` — don't roll your own.
- Naming: camelCase JS, kebab-case files for routes/services, PascalCase for React components.

## Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add autocomplete to discover search
fix: cache photo bytes server-side to cut quota use
chore: bump vite to 8.0.13
docs: add deploy section to README
```

## Adding a new API endpoint

1. Add the service function in `server/src/services/<upstream>.js` — it should cache results via `caches.<name>` and throw `UpstreamError` on failure.
2. Add the route in `server/src/routes/<resource>.js` — use `asyncHandler` and the validators in `utils/validate.js`.
3. Mount it in `server/src/index.js` under the right limiter (`globalLimiter` for cheap, `upstreamLimiter` for anything that proxies to a paid API).
4. Add the frontend client method in `src/services/api.js`.
5. Update the root `/` listing in `server/src/index.js` and the API table in `README.md`.

## Adding a new frontend page

1. Create `src/pages/<Name>Page.jsx`.
2. Add to the `TABS` array in `src/store.js` and the switch in `src/App.jsx`.
3. Add a tab in `src/components/NavBar.jsx` (or hide it behind a feature flag).
4. Mobile-first — design for a 390px wide phone first, then expand.

## Releasing

This repo is pre-1.x — no formal release process yet. When we cut a `v1`, we'll tag and add a CHANGELOG.

## Questions

Open an issue with the `question` label.
