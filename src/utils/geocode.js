import { timeoutSignal } from './timeout'

export async function geocodeSearch(query) {
  if (query.length < 3) return []
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`
    const r = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'SameOldRoads/1.0' },
      signal: timeoutSignal(6000),
    })
    const data = await r.json()
    return data.map(d => ({
      name: d.display_name.split(',').slice(0, 3).join(', '),
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }))
  } catch {
    return []
  }
}
