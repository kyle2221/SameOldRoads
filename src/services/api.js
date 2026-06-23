// Frontend API client — calls the SameOldRoads backend.
// All third-party keys stay server-side; this client only knows about /api.

const BASE = import.meta.env.VITE_API_BASE || '/api'

class ApiError extends Error {
  constructor(message, { status, code, upstream } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.upstream = upstream
  }
}

async function request(path, { query, signal } = {}) {
  const url = new URL(BASE + path, window.location.origin)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      url.searchParams.set(k, String(v))
    })
  }
  let res
  try {
    res = await fetch(url.toString(), { signal, headers: { Accept: 'application/json' } })
  } catch (e) {
    throw new ApiError(e.name === 'AbortError' ? 'Request cancelled' : 'Network error talking to API', { status: 0, code: 'NETWORK' })
  }
  // For binary endpoints (photos) the caller should use photoUrl() instead.
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* leave null */ }
  if (!res.ok) {
    throw new ApiError(json?.error || `HTTP ${res.status}`, { status: res.status, code: json?.code, upstream: json?.upstream })
  }
  return json
}

// Build a direct URL for a proxied photo — the <img src> can fetch it natively
// and the browser caches it for 24h via the Cache-Control header we set.
export function photoUrl(photoRef, { maxWidthPx = 480, maxHeightPx = 360 } = {}) {
  if (!photoRef) return null
  const url = new URL(BASE + '/places/photo', window.location.origin)
  url.searchParams.set('photoRef', photoRef)
  url.searchParams.set('maxWidthPx', String(maxWidthPx))
  url.searchParams.set('maxHeightPx', String(maxHeightPx))
  return url.toString()
}

export const api = {
  autocomplete: ({ input, lat, lng, radius, signal } = {}) =>
    request('/places/autocomplete', { query: { input, lat, lng, radius }, signal }),

  searchPlaces: ({ q, lat, lng, radius, pageSize, signal } = {}) =>
    request('/places/search', { query: { q, lat, lng, radius, pageSize }, signal }),

  getPlaceDetails: (placeId, { signal } = {}) =>
    request('/places/details', { query: { placeId }, signal }),

  reverseGeocode: ({ lat, lng }, { signal } = {}) =>
    request('/places/reverse-geocode', { query: { lat, lng }, signal }),

  getReviews: ({ query, placeId, lat, lng, limit, signal } = {}) =>
    request('/reviews', { query: { query, placeId, lat, lng, limit }, signal }),

  health: ({ signal } = {}) => request('/health', { signal }),
  healthStats: ({ signal } = {}) => request('/health/stats', { signal }),
}

export { ApiError }
