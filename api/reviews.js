// Vercel Edge Function — proxies SerpApi Google Maps to keep the API key server-side.
// Deploy env var: SERPAPI_KEY
export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() })
  }

  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const lat  = searchParams.get('lat')
  const lng  = searchParams.get('lng')

  if (!name) {
    return new Response(JSON.stringify({ error: 'name required' }), { status: 400, headers: cors() })
  }

  const key = process.env.SERPAPI_KEY
  if (!key) {
    return new Response(JSON.stringify({ error: 'SERPAPI_KEY not configured' }), { status: 503, headers: cors() })
  }

  try {
    // Step 1 — find the place and get basic info
    const searchP = new URLSearchParams({ engine: 'google_maps', q: name, api_key: key, num: 1 })
    if (lat && lng) searchP.set('ll', `@${lat},${lng},15z`)

    const r1 = await fetch(`https://serpapi.com/search.json?${searchP}`, { signal: AbortSignal.timeout(8000) })
    if (!r1.ok) throw new Error(`SerpApi ${r1.status}`)
    const d1 = await r1.json()
    const place = d1.local_results?.[0]

    if (!place) {
      return new Response(JSON.stringify({ error: 'place not found' }), { status: 404, headers: cors() })
    }

    // Step 2 — fetch up to 5 review snippets (best-effort, non-blocking)
    let reviewsList = []
    if (place.place_id) {
      try {
        const revP = new URLSearchParams({ engine: 'google_maps_reviews', place_id: place.place_id, api_key: key, num: 5 })
        const r2 = await fetch(`https://serpapi.com/search.json?${revP}`, { signal: AbortSignal.timeout(8000) })
        if (r2.ok) {
          const d2 = await r2.json()
          reviewsList = (d2.reviews || []).slice(0, 5).map(r => ({
            author: r.user?.name || 'Anonymous',
            avatar: r.user?.thumbnail || null,
            rating: r.rating || null,
            text:   r.snippet || null,
            date:   r.date || null,
            likes:  r.likes || 0,
          }))
        }
      } catch { /* reviews are optional */ }
    }

    return new Response(JSON.stringify({
      rating:      place.rating   ?? null,
      reviews:     place.reviews  ?? null,
      address:     place.address  ?? null,
      phone:       place.phone    ?? null,
      website:     place.website  ?? null,
      hours:       place.open_state ?? place.hours?.schedule?.[0]?.hours ?? null,
      thumbnail:   place.thumbnail ?? null,
      photos:      (place.images || []).slice(0, 4).map(i => i.image).filter(Boolean),
      reviewsList,
    }), { status: 200, headers: cors() })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors() })
  }
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}
