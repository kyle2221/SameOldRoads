// Snaps a list of waypoints to actual roads using the public OSRM service.
// Returns an array of [lat, lng] pairs tracing the roads between the points.
// Falls back to the straight-line path when offline or the request fails,
// so the app keeps working without a network connection.

const memCache = new Map()

function straight(path) {
  return (path || []).map((p) => [p.lat, p.lng])
}

export async function routeAlongRoads(path) {
  if (!path || path.length < 2) return straight(path)

  const key = path.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join(';')
  if (memCache.has(key)) return memCache.get(key)

  const coords = path.map((p) => `${p.lng},${p.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (res.ok) {
      const data = await res.json()
      const geo = data?.routes?.[0]?.geometry?.coordinates
      if (Array.isArray(geo) && geo.length) {
        const line = geo.map(([lng, lat]) => [lat, lng])
        memCache.set(key, line)
        return line
      }
    }
  } catch {
    // offline or blocked — fall through to straight-line
  }

  const fallback = straight(path)
  memCache.set(key, fallback)
  return fallback
}
