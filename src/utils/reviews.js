// Fetches Google place reviews via the /api/reviews Vercel proxy.
// Results are cached in sessionStorage to avoid repeat calls.

const CACHE_PREFIX = 'sor_review_'

export async function fetchPlaceReviews(name, lat, lng) {
  const key = `${CACHE_PREFIX}${name}`
  const cached = sessionStorage.getItem(key)
  if (cached) return JSON.parse(cached)

  try {
    const params = new URLSearchParams({ name })
    if (lat != null) params.set('lat', lat)
    if (lng != null) params.set('lng', lng)

    const r = await fetch(`/api/reviews?${params}`, { signal: AbortSignal.timeout(10000) })
    if (!r.ok) return null
    const data = await r.json()
    if (data.error) return null
    sessionStorage.setItem(key, JSON.stringify(data))
    return data
  } catch {
    return null
  }
}
