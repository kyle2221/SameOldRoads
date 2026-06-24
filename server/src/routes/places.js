import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { searchPlaces, getPlaceDetails, reverseGeocode, autocompletePlaces, getPlacePhoto } from '../services/googleMaps.js'
import { asLat, asLng, asStr, clampInt } from '../utils/validate.js'

const router = Router()

// GET /api/places/autocomplete?input=...&lat=..&lng=..&radius=..
// Type-ahead suggestions for the Discover search box.
router.get('/autocomplete', asyncHandler(async (req, res) => {
  const input = asStr(req.query.input, { max: 200 })
  const lat = asLat(req.query.lat)
  const lng = asLng(req.query.lng)
  const radius = clampInt(req.query.radius, 1000, 50000, 50000)
  const result = await autocompletePlaces({ input, lat, lng, radius })
  res.json(result)
}))

// GET /api/places/search?q=...&lat=..&lng=..&radius=..&pageSize=..
router.get('/search', asyncHandler(async (req, res) => {
  const q = asStr(req.query.q, { max: 300 })
  const lat = asLat(req.query.lat) ?? null
  const lng = asLng(req.query.lng) ?? null
  const radius = clampInt(req.query.radius, 1, 50000, 25000)
  const pageSize = clampInt(req.query.pageSize, 1, 20, 10)
  const result = await searchPlaces({ q, lat, lng, radius, pageSize })
  res.json(result)
}))

// GET /api/places/details?placeId=ChIJ...
router.get('/details', asyncHandler(async (req, res) => {
  const placeId = asStr(req.query.placeId, { max: 500 })
  if (!placeId) return res.status(400).json({ error: 'placeId is required', code: 'BAD_REQUEST' })
  const result = await getPlaceDetails(placeId)
  res.json(result)
}))

// GET /api/places/photo?photoRef=places/.../photos/N&maxWidthPx=480&maxHeightPx=360
// Streams the binary image directly. Browser caches via the long max-age header.
router.get('/photo', asyncHandler(async (req, res) => {
  const photoRef = asStr(req.query.photoRef, { max: 1000, trim: false })
  if (!photoRef) return res.status(400).json({ error: 'photoRef is required', code: 'BAD_REQUEST' })
  const maxWidthPx = clampInt(req.query.maxWidthPx, 1, 4800, 480)
  const maxHeightPx = clampInt(req.query.maxHeightPx, 1, 4800, 360)
  const { buffer, contentType } = await getPlacePhoto(photoRef, { maxWidthPx, maxHeightPx })
  res.set('Content-Type', contentType)
  res.set('Cache-Control', 'public, max-age=86400, immutable')
  res.send(buffer)
}))

// GET /api/places/reverse-geocode?lat=..&lng=..
router.get('/reverse-geocode', asyncHandler(async (req, res) => {
  const lat = asLat(req.query.lat) ?? null
  const lng = asLng(req.query.lng) ?? null
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required', code: 'BAD_REQUEST' })
  const result = await reverseGeocode(lat, lng)
  res.json(result)
}))

export default router
