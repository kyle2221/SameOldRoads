import { Router } from 'express'
import { caches } from '../utils/cache.js'
import { config } from '../config.js'
import os from 'os'

const router = Router()
const startedAt = Date.now()

// Liveness — always 200 if the process is up.
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sameoldroads-server',
    version: '1.1.0',
    time: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  })
})

// Readiness + observability — what's configured, what's hot, what's cached.
router.get('/stats', (_req, res) => {
  const mem = process.memoryUsage?.() || {}
  res.json({
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    keys: {
      googleMaps: !!config.googleMapsApiKey,
      serpapi: !!config.serpApiApiKey,
    },
    cache: {
      placeSearch: caches.placeSearch.getStats(),
      placeDetails: caches.placeDetails.getStats(),
      reviews: caches.reviews.getStats(),
      geocode: caches.geocode.getStats(),
    },
    mem: {
      rssMb: Math.round((mem.rss || 0) / 1024 / 1024),
      heapUsedMb: Math.round((mem.heapUsed || 0) / 1024 / 1024),
      heapTotalMb: Math.round((mem.heapTotal || 0) / 1024 / 1024),
    },
    loadavg: os.loadavg?.() || null,
  })
})

export default router
