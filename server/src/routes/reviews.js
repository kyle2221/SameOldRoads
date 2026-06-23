import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { getReviews } from '../services/serpApi.js'

const router = Router()

// GET /api/reviews?query=...&placeId=...&lat=..&lng=..&limit=..
router.get('/', asyncHandler(async (req, res) => {
  const { query, placeId } = req.query
  const lat = req.query.lat != null ? Number(req.query.lat) : null
  const lng = req.query.lng != null ? Number(req.query.lng) : null
  const limit = Number(req.query.limit) || 10
  const result = await getReviews({ query, placeId, lat, lng, limit })
  res.json(result)
}))

export default router
