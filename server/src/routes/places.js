import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { searchPlaces, getPlaceDetails, reverseGeocode } from '../services/googleMaps.js'

const router = Router()

function num(v, dflt) {
  const n = Number(v)
  return Number.isFinite(n) ? n : dflt
}

// GET /api/places/search?q=...&lat=..&lng=..&radius=..&pageSize=..
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query
  const lat = req.query.lat != null ? num(req.query.lat, null) : null
  const lng = req.query.lng != null ? num(req.query.lng, null) : null
  const radius = num(req.query.radius, 25000)
  const pageSize = num(req.query.pageSize, 10)
  const result = await searchPlaces({ q, lat, lng, radius, pageSize })
  res.json(result)
}))

// GET /api/places/details?placeId=ChIJ...
router.get('/details', asyncHandler(async (req, res) => {
  const { placeId } = req.query
  if (!placeId) return res.status(400).json({ error: 'placeId is required', code: 'BAD_REQUEST' })
  const result = await getPlaceDetails(placeId)
  res.json(result)
}))

// GET /api/places/reverse-geocode?lat=..&lng=..
router.get('/reverse-geocode', asyncHandler(async (req, res) => {
  const lat = num(req.query.lat, null)
  const lng = num(req.query.lng, null)
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required', code: 'BAD_REQUEST' })
  const result = await reverseGeocode(lat, lng)
  res.json(result)
}))

export default router
