import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration } from '../utils/format'

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pathLayerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const markersRef = useRef([])
  const watchIdRef = useRef(null)
  const elapsedRef = useRef(null)

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
      pathLayerRef.current = L.default.polyline([], { color: '#5aaa6e', weight: 4, opacity: 0.9 }).addTo(map)
    })
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  // Update path polyline
  useEffect(() => {
    if (!pathLayerRef.current || !currentPath.length) return
    pathLayerRef.current.setLatLngs(currentPath.map(p => [p.lat, p.lng]))
  }, [currentPath])

  // Draw following route overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      if (routeLayerRef.current) routeLayerRef.current.remove()
      if (!followingRoute) return
      const group = L.default.featureGroup()
      L.default.polyline(followingRoute.path.map(p => [p.lat, p.lng]), {
        color: '#c8b87a', weight: 4, opacity: 0.85, dashArray: '8,6'
      }).addTo(group)
      followingRoute.places?.forEach(pl => {
        const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
        L.default.marker([pl.lat, pl.lng], {
          icon: L.default.divIcon({ html: `<div style="font-size:22px;line-height:1">${icon}</div>`, iconSize: [28, 28], className: '' })
        }).bindPopup(`<b style="color:var(--khaki-100)">${pl.name}</b><br><small>${pl.notes || ''}</small>`).addTo(group)
      })
      group.addTo(mapInstanceRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [40, 40] })
      routeLayerRef.current = group
    })
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
          icon: L.default.divIcon({ html: `<div style="font-size:20px">${icon}</div>`, iconSize: [24, 24], className: '' })
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
    elapsedRef.current = id
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
          background: 'rgba(10,26,16,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: 16, padding: '12px 16px', border: '1px solid var(--green-600)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--khaki-400)' }}>{activeTrip?.name}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--khaki-200)' }}>{formatDuration(elapsed)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-300)' }}>{formatDistance(activeTrip?.distance || 0)}</div>
            <div style={{ fontSize: 11, color: 'var(--khaki-400)' }}>distance</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setPendingLatLng(userPos || { lat: 0, lng: 0 }); setShowAddPlace(true) }} style={iconBtn}>📍</button>
            <button onClick={handleStop} style={{ ...iconBtn, background: '#c0392b' }}>■</button>
          </div>
        </div>
      )}

      {/* Following route banner */}
      {followingRoute && (
        <div style={{
          position: 'absolute', bottom: 80, left: 16, right: 16,
          background: 'rgba(10,26,16,0.92)', backdropFilter: 'blur(8px)',
          borderRadius: 14, padding: '10px 14px', border: '1px solid var(--khaki-400)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--khaki-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Following</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-200)' }}>{followingRoute.name}</div>
          </div>
          <button onClick={stopFollowing} style={{ background: 'var(--green-700)', border: '1px solid var(--green-500)', borderRadius: 8, color: 'var(--khaki-300)', padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>
            Stop
          </button>
        </div>
      )}

      {/* Start button */}
      {!trackingActive && (
        <button onClick={() => setShowNameModal(true)} style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green-500)', border: 'none', borderRadius: 50, width: 72, height: 72,
          fontSize: 28, cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 4px 24px rgba(46,107,64,0.6)',
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
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: newPlace.type === t ? 'var(--green-600)' : 'var(--green-900)',
                border: `1px solid ${newPlace.type === t ? 'var(--green-400)' : 'var(--green-700)'}`,
                color: 'var(--khaki-100)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
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
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: 'var(--green-900)', borderRadius: '20px 20px 0 0',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom,0px))',
        border: '1px solid var(--green-700)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--khaki-200)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--khaki-400)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      </div>
    </div>
  )
}

const iconBtn = {
  width: 40, height: 40, borderRadius: 10, background: 'var(--green-700)',
  border: '1px solid var(--green-500)', color: 'var(--khaki-100)',
  fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  background: 'var(--green-800)', border: '1px solid var(--green-600)',
  color: 'var(--khaki-100)', fontSize: 15, outline: 'none',
}

const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: 12,
  background: 'var(--green-500)', border: 'none',
  color: 'var(--khaki-100)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
}
