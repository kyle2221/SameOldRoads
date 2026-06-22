import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration } from '../utils/format'
import { routeAlongRoads } from '../utils/routing'

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pathLayerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const markersRef = useRef([])
  const watchIdRef = useRef(null)
  const roRef = useRef(null)

  const { trackingActive, currentPath, activeTrip, startTrip, appendPathPoint, stopTrip, places, followingRoute, stopFollowing, addPlace } = useStore()
  const [elapsed, setElapsed] = useState(0)
  const [showNameModal, setShowNameModal] = useState(false)
  const [tripName, setTripName] = useState('')
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [newPlace, setNewPlace] = useState({ type: 'restaurant', name: '', notes: '' })
  const [pendingLatLng, setPendingLatLng] = useState(null)
  const [userPos, setUserPos] = useState(null)

  useEffect(() => {
    if (mapInstanceRef.current) return
    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current, {
        center: [37.7, -98.5],
        zoom: 4,
        zoomControl: true,
        attributionControl: false,
      })
      L.default.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      map.on('click', (e) => {
        if (!trackingActive) return
        setPendingLatLng(e.latlng)
        setShowAddPlace(true)
      })
      mapInstanceRef.current = map
      pathLayerRef.current = L.default.polyline([], { color: '#ff6a2b', weight: 5, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map)

      // The Track map stays mounted while hidden behind other tabs, so it can
      // initialise at 0×0. Re-sync size (and re-fit any followed route) once it
      // gets real dimensions.
      if ('ResizeObserver' in window) {
        roRef.current = new ResizeObserver(() => {
          map.invalidateSize()
          if (routeLayerRef.current) {
            map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50], maxZoom: 13 })
          }
        })
        roRef.current.observe(mapRef.current)
      }
    })
    return () => {
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  // Update live tracking polyline
  useEffect(() => {
    if (!pathLayerRef.current || !currentPath.length) return
    pathLayerRef.current.setLatLngs(currentPath.map(p => [p.lat, p.lng]))
  }, [currentPath])

  // Draw the followed route as an orange road-following line
  useEffect(() => {
    if (!mapInstanceRef.current) return
    let cancelled = false
    import('leaflet').then(async L => {
      if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null }
      if (!followingRoute) return

      const draw = (latlngs) => {
        if (cancelled || !mapInstanceRef.current) return
        if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null }
        const group = L.default.featureGroup()
        L.default.polyline(latlngs, { color: '#ff6a2b', weight: 12, opacity: 0.18, lineJoin: 'round', lineCap: 'round' }).addTo(group)
        L.default.polyline(latlngs, { color: '#ff6a2b', weight: 5, opacity: 1, lineJoin: 'round', lineCap: 'round' }).addTo(group)
        followingRoute.places?.forEach(pl => {
          const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
          L.default.marker([pl.lat, pl.lng], {
            icon: L.default.divIcon({ html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [28, 28], className: '' })
          }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}`).addTo(group)
        })
        group.addTo(mapInstanceRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 13 })
        routeLayerRef.current = group
      }

      // instant straight line, then upgrade to road-following
      draw(followingRoute.path.map(p => [p.lat, p.lng]))
      const routed = await routeAlongRoads(followingRoute.path)
      if (!cancelled && routed.length) draw(routed)
    })
    return () => { cancelled = true }
  }, [followingRoute])

  // Draw saved places
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      places.forEach(pl => {
        const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
        const m = L.default.marker([pl.lat, pl.lng], {
          icon: L.default.divIcon({ html: `<div style="font-size:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [24, 24], className: '' })
        }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}`)
        m.addTo(mapInstanceRef.current)
        markersRef.current.push(m)
      })
    })
  }, [places])

  // Elapsed timer
  useEffect(() => {
    if (!trackingActive || !activeTrip) { setElapsed(0); return }
    const id = setInterval(() => setElapsed(Date.now() - activeTrip.startTime), 1000)
    return () => clearInterval(id)
  }, [trackingActive, activeTrip])

  function startGPS() {
    if (!navigator.geolocation) return alert('Geolocation not available')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(latlng)
        appendPathPoint(latlng)
        mapInstanceRef.current?.setView([latlng.lat, latlng.lng], 15)
      },
      err => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 2000 }
    )
  }

  async function handleStart() {
    if (!tripName.trim()) return
    await startTrip(tripName.trim())
    setShowNameModal(false)
    setTripName('')
    startGPS()
  }

  async function handleStop() {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    await stopTrip()
    setElapsed(0)
  }

  async function handleSavePlace() {
    if (!newPlace.name.trim() || !pendingLatLng) return
    const place = {
      id: crypto.randomUUID(),
      ...newPlace,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      tripId: activeTrip?.id || null,
      createdAt: Date.now(),
    }
    await addPlace(place)
    setShowAddPlace(false)
    setNewPlace({ type: 'restaurant', name: '', notes: '' })
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Tracking HUD */}
      {trackingActive && (
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)',
          borderRadius: 18, padding: '13px 16px', border: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000, boxShadow: 'var(--shadow-card)',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 600 }}>{activeTrip?.name}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.5 }}>{formatDuration(elapsed)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--orange-deep)' }}>{formatDistance(activeTrip?.distance || 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>distance</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setPendingLatLng(userPos || { lat: 0, lng: 0 }); setShowAddPlace(true) }} style={iconBtn}>📍</button>
            <button onClick={handleStop} style={{ ...iconBtn, background: 'var(--orange)', border: 'none', color: '#fff' }}>■</button>
          </div>
        </div>
      )}

      {/* Following route banner */}
      {followingRoute && (
        <div style={{
          position: 'absolute', bottom: 80, left: 16, right: 16,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
          borderRadius: 16, padding: '11px 14px', border: '1px solid var(--orange-tint)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000, boxShadow: 'var(--shadow-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 30, height: 4, borderRadius: 4, background: 'var(--orange)', boxShadow: '0 0 8px var(--orange-glow)' }} />
            <div>
              <div style={{ fontSize: 10, color: 'var(--orange-deep)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Following Route</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{followingRoute.name}</div>
            </div>
          </div>
          <button onClick={stopFollowing} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-soft)', padding: '7px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Stop
          </button>
        </div>
      )}

      {/* Start button */}
      {!trackingActive && (
        <button onClick={() => setShowNameModal(true)} style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', borderRadius: 50, width: 72, height: 72,
          fontSize: 28, cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 6px 26px rgba(239,86,22,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>🚗</button>
      )}

      {/* Name modal */}
      {showNameModal && (
        <Modal title="Name Your Trip" onClose={() => setShowNameModal(false)}>
          <input
            autoFocus
            placeholder="e.g. Weekend in the Mountains"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            style={inputStyle}
          />
          <button onClick={handleStart} style={primaryBtn}>Start Tracking</button>
        </Modal>
      )}

      {/* Add place modal */}
      {showAddPlace && (
        <Modal title="Save a Place" onClose={() => setShowAddPlace(false)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['restaurant', 'destination'].map(t => (
              <button key={t} onClick={() => setNewPlace(p => ({ ...p, type: t }))} style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                background: newPlace.type === t ? 'var(--orange-wash)' : 'var(--surface-2)',
                border: `1.5px solid ${newPlace.type === t ? 'var(--orange)' : 'var(--border)'}`,
                color: newPlace.type === t ? 'var(--orange-deep)' : 'var(--text-soft)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
                {t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}
              </button>
            ))}
          </div>
          <input placeholder="Place name" value={newPlace.name} onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <textarea placeholder="Notes (optional)" value={newPlace.notes} onChange={e => setNewPlace(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'none' }} />
          <button onClick={handleSavePlace} style={primaryBtn}>Save Place</button>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(20,20,25,0.4)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '18px 20px calc(20px + env(safe-area-inset-bottom,0px))',
        boxShadow: 'var(--shadow-pop)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-mute)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      </div>
    </div>
  )
}

const iconBtn = {
  width: 42, height: 42, borderRadius: 12, background: 'var(--surface-2)',
  border: '1px solid var(--border)', color: 'var(--text)',
  fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 13,
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 15, outline: 'none',
}

const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: 14,
  background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none',
  color: 'var(--on-orange)', fontSize: 16, fontWeight: 800, cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(239,86,22,0.3)',
}
