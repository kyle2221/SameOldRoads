// Vercel Edge Function — proxies SerpApi Google Maps to keep the API key server-side.
// Deploy env var: SERPAPI_KEY
export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const lat  = searchParams.get('lat')
  const lng  = searchParams.get('lng')

  if (!name) {
    return new Response(JSON.stringify({ error: 'name required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const key = process.env.SERPAPI_KEY
  if (!key) {
    return new Response(JSON.stringify({ error: 'SERPAPI_KEY not configured' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const params = new URLSearchParams({ engine: 'google_maps', q: name, api_key: key, num: 1 })
    if (lat && lng) params.set('ll', `@${lat},${lng},14z`)

    const r = await fetch(`https://serpapi.com/search.json?${params}`, { signal: AbortSignal.timeout(8000) })
    if (!r.ok) throw new Error(`SerpApi ${r.status}`)
    const data = await r.json()

    const place = data.local_results?.[0]
    if (!place) {
      return new Response(JSON.stringify({ error: 'place not found' }), { status: 404, headers: cors() })
    }

    return new Response(JSON.stringify({
      rating:    place.rating ?? null,
      reviews:   place.reviews ?? null,
      address:   place.address ?? null,
      hours:     place.hours?.schedule?.[0]?.hours ?? null,
      thumbnail: place.thumbnail ?? null,
    }), { status: 200, headers: cors() })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors() })
  }
}

function cors() {
  return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
}
