import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Dev-only middleware that mirrors api/reviews.js (the Vercel Edge Function)
// so the Google Reviews feature works under `vite dev` too — using SERPAPI_KEY
// from .env.local. In production Vercel runs the edge function instead.
function devReviewsApi(env) {
  return {
    name: 'dev-reviews-api',
    configureServer(server) {
      server.middlewares.use('/api/reviews', async (req, res) => {
        const send = (status, obj) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }
        try {
          const url = new URL(req.url, 'http://localhost')
          const name = url.searchParams.get('name')
          const lat = url.searchParams.get('lat')
          const lng = url.searchParams.get('lng')
          if (!name) return send(400, { error: 'name required' })

          const key = env.SERPAPI_KEY || process.env.SERPAPI_KEY
          if (!key) return send(503, { error: 'SERPAPI_KEY not configured' })

          const searchP = new URLSearchParams({ engine: 'google_maps', q: name, api_key: key, num: '1' })
          if (lat && lng) searchP.set('ll', `@${lat},${lng},15z`)
          const r1 = await fetch(`https://serpapi.com/search.json?${searchP}`)
          if (!r1.ok) return send(502, { error: `SerpApi ${r1.status}` })
          const d1 = await r1.json()
          const place = d1.local_results?.[0] || d1.place_results
          if (!place) return send(404, { error: 'place not found' })

          let reviewsList = []
          if (place.place_id) {
            try {
              const revP = new URLSearchParams({ engine: 'google_maps_reviews', place_id: place.place_id, api_key: key })
              const r2 = await fetch(`https://serpapi.com/search.json?${revP}`)
              if (r2.ok) {
                const d2 = await r2.json()
                reviewsList = (d2.reviews || []).slice(0, 5).map(rv => ({
                  author: rv.user?.name || 'Anonymous',
                  avatar: rv.user?.thumbnail || null,
                  rating: rv.rating || null,
                  text: rv.snippet || null,
                  date: rv.date || null,
                  likes: rv.likes || 0,
                }))
              }
            } catch { /* reviews optional */ }
          }

          send(200, {
            rating: place.rating ?? null,
            reviews: place.reviews ?? null,
            address: place.address ?? null,
            phone: place.phone ?? null,
            website: place.website ?? null,
            hours: place.open_state ?? place.hours ?? null,
            price: place.price ?? null,
            category: place.type ?? null,
            thumbnail: place.thumbnail ?? null,
            photos: (place.images || []).slice(0, 4).map(i => i.image || i).filter(Boolean),
            reviewsList,
          })
        } catch (err) {
          send(500, { error: String(err?.message || err) })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      devReviewsApi(env),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'carto-tiles',
                expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/router\.project-osrm\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'osrm-routes',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
              },
            },
          ],
        },
        manifest: {
          name: 'Same Old Roads',
          short_name: 'SameOldRoads',
          description: 'Track your trips, follow curated routes, discover places',
          theme_color: '#fc4c02',
          background_color: '#0d1117',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
    ],
  }
})
