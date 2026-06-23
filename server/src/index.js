import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'

import { config } from './config.js'
import { logger } from './utils/logger.js'
import { globalLimiter, upstreamLimiter } from './middleware/rateLimit.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { requestId, accessLog } from './middleware/requestId.js'
import healthRouter from './routes/health.js'
import placesRouter from './routes/places.js'
import reviewsRouter from './routes/reviews.js'

const app = express()

// --- Security & infra middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // API-only server, no inline content
}))
app.use(compression())
app.use(express.json({ limit: '256kb' }))
app.use(express.urlencoded({ extended: false, limit: '256kb' }))

// Request id + access logging — runs before everything else so every log line is correlatable
app.use(requestId)
app.use(accessLog)

// CORS — only allow origins from env
app.use(cors({
  origin(origin, cb) {
    // Allow same-origin / curl / no-origin requests
    if (!origin) return cb(null, true)
    if (config.corsOrigins.length === 0) return cb(null, true)
    if (config.corsOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS blocked for origin ${origin}`))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 600,
}))

// Request logging
app.use(morgan(config.isProd ? 'combined' : 'dev', {
  skip: (req) => req.path === '/api/health' && !config.isProd,
}))

// Global rate limit on everything
app.use(globalLimiter)

// --- Routes ---
app.get('/', (_req, res) => {
  res.json({
    name: 'SameOldRoads API',
    version: '1.1.0',
    docs: '/api/health',
    endpoints: [
      'GET /api/places/autocomplete?input=&lat=&lng=&radius=',
      'GET /api/places/search?q=&lat=&lng=&radius=&pageSize=',
      'GET /api/places/details?placeId=',
      'GET /api/places/photo?photoRef=&maxWidthPx=&maxHeightPx=',
      'GET /api/places/reverse-geocode?lat=&lng=',
      'GET /api/reviews?query=&placeId=&lat=&lng=&limit=',
      'GET /api/health',
      'GET /api/health/stats',
    ],
  })
})

app.use('/api/health', healthRouter)
// Stricter limiter on the upstream-proxying routes
app.use('/api/places', upstreamLimiter, placesRouter)
app.use('/api/reviews', upstreamLimiter, reviewsRouter)

// --- 404 + error handling ---
app.use(notFound)
app.use(errorHandler)

const server = app.listen(config.port, () => {
  logger.info(`SameOldRoads API listening on :${config.port}`, {
    env: config.nodeEnv,
    cors: config.corsOrigins.length ? config.corsOrigins : ['*'],
    googleMaps: !!config.googleMapsApiKey,
    serpapi: !!config.serpApiApiKey,
  })
})

// Graceful shutdown
function shutdown(sig) {
  logger.info(`${sig} received, shutting down...`)
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  setTimeout(() => { logger.warn('Forcing exit'); process.exit(1) }, 8000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (e) => logger.error('uncaughtException', e))
process.on('unhandledRejection', (e) => logger.error('unhandledRejection', e))

export default app
