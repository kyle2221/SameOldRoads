import { useEffect, useRef } from 'react'
import { routeAlongRoads } from '../utils/routing'

// Renders a Leaflet map that draws the route as a glowing orange line.
// It paints the straight waypoint path instantly, then upgrades the line to
// follow the actual roads once OSRM responds (falls back to straight offline).
export default function RouteMap({ path = [], places = [], height = 200, interactive = false, radius = 18 }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const lineGroupRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    // Resolve once the container has real dimensions, so Leaflet never
    // initialises or fits bounds against a 0×0 size (which throws the
    // vector layer off-screen).
    const waitForSize = () => new Promise((resolve) => {
      let tries = 0
      const check = () => {
        const el = elRef.current
        if (cancelled || !el) return resolve(false)
        if (el.clientWidth > 0 && el.clientHeight > 0) return resolve(true)
        if (tries++ > 90) return resolve(true)
        requestAnimationFrame(check)
      }
      check()
    })

    const init = async () => {
      const L = (await import('leaflet')).default
      const ok = await waitForSize()
      const el = elRef.current
      if (cancelled || !el || !ok) return

      const map = L.map(el, {
        center: [37.7, -98.5],
        zoom: 4,
        zoomControl: interactive,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: interactive,
        touchZoom: interactive,
        tap: interactive,
      })
      mapRef.current = map
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      map.invalidateSize()

      const drawLine = (latlngs) => {
        if (cancelled || !mapRef.current) return
        if (lineGroupRef.current) { lineGroupRef.current.remove(); lineGroupRef.current = null }
        const group = L.featureGroup()
        const lineLayer = L.featureGroup()
        if (latlngs.length) {
          L.polyline(latlngs, { color: '#ff6a2b', weight: 11, opacity: 0.18, lineJoin: 'round', lineCap: 'round' }).addTo(lineLayer)
          L.polyline(latlngs, { color: '#ff6a2b', weight: 4.5, opacity: 1, lineJoin: 'round', lineCap: 'round' }).addTo(lineLayer)
          L.circleMarker(latlngs[0], { radius: 6, color: '#fff', weight: 2, fillColor: '#16a34a', fillOpacity: 1 }).addTo(lineLayer)
          L.circleMarker(latlngs[latlngs.length - 1], { radius: 6, color: '#fff', weight: 2, fillColor: '#ef5616', fillOpacity: 1 }).addTo(lineLayer)
        }
        lineLayer.addTo(group)
        places.forEach((pl) => {
          const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
          L.marker([pl.lat, pl.lng], {
            icon: L.divIcon({ html: `<div style="font-size:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [24, 24], className: '' }),
          }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}`).addTo(group)
        })
        group.addTo(map)
        lineGroupRef.current = group
        const fitTarget = lineLayer.getLayers().length ? lineLayer : group
        const fit = () => {
          if (cancelled || !mapRef.current) return
          map.invalidateSize()
          if (fitTarget.getLayers().length) map.fitBounds(fitTarget.getBounds(), { padding: [30, 30], maxZoom: 13 })
        }
        fit()
        // Re-sync once layout/animation fully settles — fixes panes that were
        // positioned against an unstable size on first paint.
        setTimeout(fit, 250)
      }

      drawLine(path.map((p) => [p.lat, p.lng]))
      const routed = await routeAlongRoads(path)
      if (!cancelled && routed.length) drawLine(routed)
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, [path, places, interactive])

  return <div ref={elRef} style={{ height, width: '100%', borderRadius: radius, overflow: 'hidden', border: '1px solid var(--border)' }} />
}
