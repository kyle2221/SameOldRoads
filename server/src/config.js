import dotenv from 'dotenv'

dotenv.config()

const required = ['GOOGLE_MAPS_API_KEY', 'SERPAPI_API_KEY']
const missing = required.filter((k) => !process.env[k])
if (missing.length) {
  console.warn(
    `[config] Missing required env var(s): ${missing.join(', ')}.\n` +
    `Copy server/.env.example to server/.env and fill in real values.\n` +
    `Server will still boot, but those endpoints will return 503.`
  )
}

function parseList(v) {
  if (!v) return []
  return v.split(',').map((s) => s.trim()).filter(Boolean)
}

export const config = {
  port: Number(process.env.PORT) || 8787,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || '').toLowerCase() === 'production',
  corsOrigins: parseList(process.env.CORS_ORIGIN),
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  serpApiApiKey: process.env.SERPAPI_API_KEY || '',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
  },
  // Cache TTLs in ms
  cache: {
    placeSearch: 1000 * 60 * 30,      // 30 min
    placeDetails: 1000 * 60 * 60 * 6, // 6h
    reviews: 1000 * 60 * 60 * 12,     // 12h
    geocode: 1000 * 60 * 60 * 24,     // 24h
  },
  // Outbound HTTP timeout for upstream API calls
  upstreamTimeoutMs: 8000,
}
