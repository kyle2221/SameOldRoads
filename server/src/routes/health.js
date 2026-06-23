import { Router } from 'express'
import { caches } from '../utils/cache.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sameoldroads-server',
    version: '1.0.0',
    time: new Date().toISOString(),
  })
})

router.get('/stats', (_req, res) => {
  res.json({
    placeSearch: caches.placeSearch.getStats(),
    placeDetails: caches.placeDetails.getStats(),
    reviews: caches.reviews.getStats(),
    geocode: caches.geocode.getStats(),
  })
})

export default router
