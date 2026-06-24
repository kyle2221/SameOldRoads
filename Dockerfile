# ---- Build the frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY index.html vite.config.js eslint.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

# ---- Runtime (backend + static frontend) ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

# Backend deps
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm ci --omit=dev

# Backend source
COPY server/src ./server/src

# Frontend build output, served as static files
COPY --from=frontend-build /app/dist ./public

# Tiny static server is built into the Express app via the optional
# `serve-static` mounted when PUBLIC_DIR is set. To avoid adding a dep
# at runtime, we instead let the user run a static server of choice OR
# use the included `npm run serve` script (below). For this image we
# add a 3-line static middleware shim in the server at startup.

EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=4s --start-period=10s \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" || exit 1

CMD ["node", "server/src/index.js"]
