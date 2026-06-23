import { config } from '../config.js'
import { fetchJSON, fetchBuffer, UpstreamError, withRetry } from '../utils/http.js'
import { caches } from '../utils/cache.js'
import { logger } from '../utils/logger.js'

const PLACES_BASE = 'https://places.googleapis.com/v1/places'

// Field mask — only request what we actually use, to keep quotas tight.
// Docs: https://developers.google.com/maps/documentation/places/web-service/place-details#field-mask
const SEARCH_FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress',
  'places.location', 'places.rating', 'places.userRatingCount',
  'places.googleMapsUri', 'places.photos.name', 'places.primaryTypeDisplayName',
  'places.businessStatus',
].join(',')

const DETAILS_FIELDS = [
  'id', 'displayName', 'formattedAddress', 'location', 'rating',
  'userRatingCount', 'googleMapsUri', 'websiteUri', 'internationalPhoneNumber',
  'photos.name', 'photos.widthPx', 'photos.heightPx', 'primaryTypeDisplayName',
  'currentOpeningHours', 'businessStatus', 'editorialSummary', 'priceLevel',
  'regularOpeningHours',
].join(',')

const AUTOCOMPLETE_FIELDS = [
  'suggestions.placePrediction.placeId',
  'suggestions.placePrediction.text',
  'suggestions.placePrediction.structuredFormat.mainText',
  'suggestions.placePrediction.structuredFormat.secondaryText',
  'suggestions.placePrediction.types',
].join(',')

function ensureKey() {
  if (!config.googleMapsApiKey) {
    throw new UpstreamError('Google Maps API key not configured on the server', { status: 503, upstream: 'google-maps', code: 'NO_KEY' })
  }
}

function shapePlace(p) {
  if (!p) return null
  return {
    id: p.id,
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    rating: p.rating ?? null,
    reviewCount: p.userRatingCount ?? null,
    mapsUri: p.googleMapsUri || null,
    type: p.primaryTypeDisplayName?.text || null,
    status: p.businessStatus || null,
    photoRef: p.photos?.[0]?.name || null,
  }
}

function shapeDetails(p) {
  const base = shapePlace(p) || {}
  const cur = p.currentOpeningHours || {}
  const reg = p.regularOpeningHours || {}
  // Build a friendly "open now?" + today's hours summary
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayHours = cur.weekdayDescriptions?.[todayIdx]
    || reg.weekdayDescriptions?.[todayIdx]
    || null
  const openNow = typeof cur.openNow === 'boolean' ? cur.openNow
    : typeof reg.openNow === 'boolean' ? reg.openNow : null
  return {
    ...base,
    website: p.websiteUri || null,
    phone: p.internationalPhoneNumber || null,
    priceLevel: p.priceLevel ?? null,
    openingHours: cur.weekdayDescriptions || reg.weekdayDescriptions || null,
    openNow,
    todayHours,
    editorialSummary: p.editorialSummary?.text || null,
    photos: (p.photos || []).map((ph) => ({ ref: ph.name, width: ph.widthPx, height: ph.heightPx })),
  }
}

// Search places by text query, optionally biased by location + radius
// q:        text query (e.g. "best tacos in Big Sur")
// lat,lng:  optional bias point
// radius:   optional bias radius in meters (max 50000)
export async function searchPlaces({ q, lat, lng, radius = 25000, pageSize = 10 }) {
  ensureKey()
  if (!q || !q.trim()) {
    throw new UpstreamError('Query parameter "q" is required', { status: 400, upstream: 'google-maps', code: 'BAD_REQUEST' })
  }
  pageSize = Math.max(1, Math.min(20, Number(pageSize) || 10))

  const cacheKey = JSON.stringify({ q: q.trim().toLowerCase(), lat, lng, radius, pageSize })
  const cached = caches.placeSearch.get(cacheKey)
  if (cached) { logger.debug('google-maps search cache hit', { q }); return cached }

  const body = {
    textQuery: q.trim(),
    pageSize,
    languageCode: 'en',
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: Math.max(1, Math.min(50000, Number(radius) || 25000)) } }
  }

  const data = await withRetry(
    () => fetchJSON(PLACES_BASE + ':searchText', {
      method: 'POST',
      timeoutMs: 7000,
      label: 'google-maps-search',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': config.googleMapsApiKey,
        'X-Goog-FieldMask': SEARCH_FIELDS,
      },
      body,
    }),
    { retries: 1 }
  )

  const places = (data?.places || []).map(shapePlace).filter(Boolean)
  const result = { places, count: places.length, query: q.trim() }
  caches.placeSearch.set(cacheKey, result, config.cache.placeSearch)
  logger.info('google-maps search ok', { q: q.trim(), count: places.length })
  return result
}

// Autocomplete — type-ahead suggestions for the Discover search box.
// Uses the v1 :autocompleteText endpoint. Returns lightweight predictions.
export async function autocompletePlaces({ input, lat, lng, radius = 50000 }) {
  ensureKey()
  if (!input || !input.trim()) {
    return { suggestions: [] }
  }
  if (input.trim().length < 2) {
    return { suggestions: [] }
  }

  const cacheKey = JSON.stringify({ input: input.trim().toLowerCase(), lat, lng, radius })
  const cached = caches.placeSearch.get('ac:' + cacheKey)
  if (cached) { logger.debug('google-maps autocomplete cache hit', { input }); return cached }

  const body = {
    text: input.trim(),
    languageCode: 'en',
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: Math.max(1, Math.min(50000, Number(radius) || 50000)) } }
  }

  const data = await fetchJSON(PLACES_BASE + ':autocompleteText', {
    method: 'POST',
    timeoutMs: 4000,
    label: 'google-maps-autocomplete',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': config.googleMapsApiKey,
      'X-Goog-FieldMask': AUTOCOMPLETE_FIELDS,
    },
    body,
  })

  const suggestions = (data?.suggestions || [])
    .map((s) => {
      const p = s.placePrediction
      if (!p) return null
      return {
        placeId: p.placeId,
        text: p.text?.text || '',
        mainText: p.structuredFormat?.mainText?.text || '',
        secondaryText: p.structuredFormat?.secondaryText?.text || '',
        types: p.types || [],
      }
    })
    .filter(Boolean)

  const result = { suggestions }
  caches.placeSearch.set('ac:' + cacheKey, result, 1000 * 60 * 10) // 10 min for autocomplete
  logger.info('google-maps autocomplete ok', { input: input.trim(), count: suggestions.length })
  return result
}

// Get rich details for a single place by place_id
export async function getPlaceDetails(placeId) {
  ensureKey()
  if (!placeId) throw new UpstreamError('placeId is required', { status: 400, upstream: 'google-maps', code: 'BAD_REQUEST' })

  const cached = caches.placeDetails.get(placeId)
  if (cached) { logger.debug('google-maps details cache hit', { placeId }); return cached }

  const data = await withRetry(
    () => fetchJSON(`${PLACES_BASE}/${placeId}`, {
      timeoutMs: 7000,
      label: 'google-maps-details',
      headers: {
        'X-Goog-Api-Key': config.googleMapsApiKey,
        'X-Goog-FieldMask': DETAILS_FIELDS,
      },
    }),
    { retries: 1 }
  )

  const result = shapeDetails(data)
  caches.placeDetails.set(placeId, result, config.cache.placeDetails)
  logger.info('google-maps details ok', { placeId, name: result.name })
  return result
}

// Fetch a place photo as binary, with server-side caching of the bytes.
// Returns { buffer, contentType } so the route handler can stream it.
// photoRef is the `places/{id}/photos/{n}` resource name from a Places response.
export async function getPlacePhoto(photoRef, { maxWidthPx = 480, maxHeightPx = 360 } = {}) {
  ensureKey()
  if (!photoRef) throw new UpstreamError('photoRef is required', { status: 400, upstream: 'google-maps', code: 'BAD_REQUEST' })
  maxWidthPx = Math.max(1, Math.min(4800, Number(maxWidthPx) || 480))
  maxHeightPx = Math.max(1, Math.min(4800, Number(maxHeightPx) || 360))

  const cacheKey = `photo:${photoRef}:${maxWidthPx}x${maxHeightPx}`
  const cached = caches.placeDetails.get(cacheKey)
  if (cached) { logger.debug('google-maps photo cache hit', { photoRef }); return cached }

  const url = new URL(`https://places.googleapis.com/v1/${photoRef.startsWith('places/') ? photoRef : 'places/' + photoRef}/media`)
  url.searchParams.set('maxWidthPx', String(maxWidthPx))
  url.searchParams.set('maxHeightPx', String(maxHeightPx))
  url.searchParams.set('key', config.googleMapsApiKey)

  const { buffer, contentType } = await fetchBuffer(url.toString(), {
    timeoutMs: 6000,
    label: 'google-maps-photo',
  })

  const result = { buffer, contentType: contentType || 'image/jpeg' }
  // Photos rarely change — cache for 24h
  caches.placeDetails.set(cacheKey, result, 1000 * 60 * 60 * 24)
  return result
}

// Resolve a place_id from lat/lng via reverse geocode (Maps Geocoding API)
// Used so the frontend can attach a Google place_id to a manually-dropped pin.
export async function reverseGeocode(lat, lng) {
  ensureKey()
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new UpstreamError('lat and lng are required', { status: 400, upstream: 'google-maps', code: 'BAD_REQUEST' })
  }
  const key = `geo:${lat.toFixed(5)},${lng.toFixed(5)}`
  const cached = caches.geocode.get(key)
  if (cached) return cached

  const data = await fetchJSON('https://maps.googleapis.com/maps/api/geocode/json', {
    timeoutMs: 6000,
    label: 'google-maps-geocode',
    query: { latlng: `${lat},${lng}`, key: config.googleMapsApiKey, result_type: 'street_address|establishment|point_of_interest' },
  })

  const top = data?.results?.[0] || null
  const result = top ? {
    placeId: top.place_id || null,
    formattedAddress: top.formatted_address || null,
    types: top.types || [],
  } : { placeId: null, formattedAddress: null, types: [] }

  caches.geocode.set(key, result, config.cache.geocode)
  return result
}
