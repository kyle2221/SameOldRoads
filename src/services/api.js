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
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* leave null */ }
  if (!res.ok) {
    throw new ApiError(json?.error || `HTTP ${res.status}`, { status: res.status, code: json?.code, upstream: json?.upstream })
  }
  return json
}

export const api = {
  searchPlaces: ({ q, lat, lng, radius, pageSize } = {}) =>
    request('/places/search', { query: { q, lat, lng, radius, pageSize } }),

  getPlaceDetails: (placeId) =>
    request('/places/details', { query: { placeId } }),

  reverseGeocode: ({ lat, lng }) =>
    request('/places/reverse-geocode', { query: { lat, lng } }),

  getReviews: ({ query, placeId, lat, lng, limit } = {}) =>
    request('/reviews', { query: { query, placeId, lat, lng, limit } }),

  health: () => request('/health'),
}

export { ApiError }
