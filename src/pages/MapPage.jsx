import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatSpeed } from '../utils/format'
import { routeAlongRoads } from '../utils/routing'
import { toast } from '../store/toast'
import { BottomSheet } from '../components/ui'

function haversine(a, b) {
  const R = 6371e3, p1 = a.lat * Math.PI / 180, p2 = b.lat * Math.PI / 180
  const dp = (b.lat - a.lat) * Math.PI / 180, dl = (b.lng - a.lng) * Math.PI / 180
  const x = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const inputStyle = { width: '100%', padding: '13px 14px', borderRadius: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none' }
const primaryBtn = { width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: 'var(--on-orange)', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-orange)', fontFamily: 'var(--font-display)' }

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pathLayerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const userMarkerRef = useRef(null)
  const markersRef = useRef([])
  const watchIdRef = useRef(null)
  const roRef = useRef(null)
  const lastPosRef = useRef(null)
  const lastSpeedTsRef = useRef(null)

  const { trackingActive, currentPath, activeTrip, startTrip, appendPathPoint, stopTrip, places, followingRoute, stopFollowing, addPlace } = useStore()
  const [elapsed, setElapsed] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [showNameModal, setShowNameModal] = useState(false)
  const [tripName, setTripName] = useState('')
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [newPlace, setNewPlace] = useState({ type: 'restaurant', name: '', notes: '' })
  const [pendingLatLng, setPendingLatLng] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [distToNextStop, setDistToNextStop] = useState(null)

  useEffect(() => {
    if (mapInstanceRef.current) return
    import('leaflet').then(L => {
      const map = L.default.map(mapRef.current, { center: [37.7, -98.5], zoom: 4, zoomControl: true, attributionControl: false })
      L.default.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      map.on('click', (e) => { if (!trackingActive) return; setPendingLatLng(e.latlng); setShowAddPlace(true) })
      mapInstanceRef.current = map
      pathLayerRef.current = L.default.polyline([], { color: '#ff6a2b', weight: 5, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map)
      if ('ResizeObserver' in window) {
        roRef.current = new ResizeObserver(() => {
          map.invalidateSize()
          if (routeLayerRef.current) map.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50], maxZoom: 13 })
        })
        roRef.current.observe(mapRef.current)
      }
    })
    return () => {
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!pathLayerRef.current || !currentPath.length) return
    pathLayerRef.current.setLatLngs(currentPath.map(p => [p.lat, p.lng]))
  }, [currentPath])

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
          L.default.marker([pl.lat, pl.lng], { icon: L.default.divIcon({ html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [28, 28], className: '' }) }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}`).addTo(group)
        })
        group.addTo(mapInstanceRef.current)
        mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 13 })
        routeLayerRef.current = group
      }
      draw(followingRoute.path.map(p => [p.lat, p.lng]))
      const routed = await routeAlongRoads(followingRoute.path)
      if (!cancelled && routed.length) draw(routed)
    })
    return () => { cancelled = true }
  }, [followingRoute])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      places.forEach(pl => {
        const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
        const m = L.default.marker([pl.lat, pl.lng], { icon: L.default.divIcon({ html: `<div style="font-size:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [24, 24], className: '' }) }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}`)
        m.addTo(mapInstanceRef.current)
        markersRef.current.push(m)
      })
    })
  }, [places])

  useEffect(() => {
    if (!trackingActive || !activeTrip) { setElapsed(0); setSpeed(0); return }
    const id = setInterval(() => setElapsed(Date.now() - activeTrip.startTime), 1000)
    return () => clearInterval(id)
  }, [trackingActive, activeTrip])

  useEffect(() => {
    if (!trackingActive) return
    const id = setInterval(() => {
      if (lastSpeedTsRef.current && Date.now() - lastSpeedTsRef.current > 3000) setSpeed(0)
    }, 1000)
    return () => clearInterval(id)
  }, [trackingActive])

  useEffect(() => {
    if (!followingRoute?.places?.length || !userPos) { setDistToNextStop(null); return }
    let min = Infinity
    for (const p of followingRoute.places) {
      const d = haversine(userPos, { lat: p.lat, lng: p.lng })
      if (d < min) min = d
    }
    setDistToNextStop(min === Infinity ? null : min)
  }, [userPos, followingRoute])

  function startGPS() {
    if (!navigator.geolocation) { toast.error('Geolocation not available'); return }
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(latlng)
        if (pos.coords.speed != null && pos.coords.speed >= 0) {
          setSpeed(pos.coords.speed)
        } else if (lastPosRef.current) {
          const dt = (Date.now() - lastSpeedTsRef.current) / 1000
          if (dt > 0.5) {
            const d = haversine(lastPosRef.current, latlng)
            setSpeed(d / dt)
          }
        }
        lastPosRef.current = latlng
        lastSpeedTsRef.current = Date.now()
        appendPathPoint(latlng)
        mapInstanceRef.current?.setView([latlng.lat, latlng.lng], 15)
        import('leaflet').then(L => {
          if (!mapInstanceRef.current) return
          if (userMarkerRef.current) { userMarkerRef.current.setLatLng([latlng.lat, latlng.lng]) }
          else {
            userMarkerRef.current = L.default.marker([latlng.lat, latlng.lng], {
              icon: L.default.divIcon({
                html: `<div style="width:18px;height:18px;border-radius:50%;background:#ff6a2b;border:3px solid #fff;box-shadow:0 0 12px rgba(255,106,43,0.7);animation:userPulse 1.6s ease-in-out infinite"></div>`,
                iconSize: [18, 18], className: '',
              }),
              zIndexOffset: 1000,
            }).addTo(mapInstanceRef.current)
          }
        })
      },
      err => { console.warn(err); toast.warn('GPS signal lost — check your location permissions') },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 }
    )
  }

  async function handleStart() {
    if (!tripName.trim()) return
    await startTrip(tripName.trim())
    setShowNameModal(false); setTripName(''); startGPS()
    if (navigator.vibrate) navigator.vibrate(15)
    toast.success(`Tracking "${tripName.trim()}"`)
  }

  async function handleStop() {
    if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
    await stopTrip(); setElapsed(0); setSpeed(0)
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null }
    if (navigator.vibrate) navigator.vibrate([10, 40, 10])
    toast.success('Trip saved')
  }

  function handleRecenter() {
    if (userPos && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userPos.lat, userPos.lng], 15)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(ll)
        mapInstanceRef.current?.setView([ll.lat, ll.lng], 15)
      }, () => toast.warn('Could not get your location'), { enableHighAccuracy: true, timeout: 8000 })
    }
  }

  async function handleSavePlace() {
    if (!newPlace.name.trim() || !pendingLatLng) return
    await addPlace({ id: crypto.randomUUID(), ...newPlace, lat: pendingLatLng.lat, lng: pendingLatLng.lng, tripId: activeTrip?.id || null, createdAt: Date.now() })
    setShowAddPlace(false); setNewPlace({ type: 'restaurant', name: '', notes: '' })
    if (navigator.vibrate) navigator.vibrate(15)
    toast.success('Place saved')
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <style>{`@keyframes recPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.75)} } @keyframes userPulse { 0%,100%{box-shadow:0 0 12px rgba(255,106,43,0.7)} 50%{box-shadow:0 0 24px rgba(255,106,43,0.9)} }`}</style>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Tracking HUD */}
      {trackingActive && (
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }} className="fade-in-down">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingLeft: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', display: 'block', animation: 'recPulse 1.4s ease-in-out infinite', boxShadow: '0 0 8px rgba(255,59,48,0.7)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: 0.5, textShadow: '0 1px 4px rgba(0,0,0,0.6)', fontFamily: 'var(--font-display)' }}>{activeTrip?.name}</span>
          </div>
          <div className="glass" style={{
            borderRadius: 22, padding: '16px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'var(--font-display)' }}>Duration</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{formatDuration(elapsed)}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: '0 14px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'var(--font-display)' }}>Distance</div>
              <div className="text-gradient-warm" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>{formatDistance(activeTrip?.distance || 0)}</div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.12)', margin: '0 14px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'var(--font-display)' }}>Speed</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -1, lineHeight: 1, fontFamily: 'var(--font-mono)' }}>{formatSpeed(speed)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 10 }}>
              <button onClick={() => { setPendingLatLng(userPos || { lat: 0, lng: 0 }); setShowAddPlace(true) }} className="pressable" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</button>
              <button onClick={handleStop} className="pressable" style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ff5252, #ef2020)', border: 'none', color: '#fff', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(239,32,32,0.4)' }}>■</button>
            </div>
          </div>
        </div>
      )}

      {/* Recenter FAB */}
      <button onClick={handleRecenter} aria-label="Recenter" className="pressable" style={{
        position: 'absolute', right: 16, bottom: trackingActive ? 100 : 88, zIndex: 1000,
        width: 46, height: 46, borderRadius: 14,
        background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
        boxShadow: 'var(--shadow-pop)', cursor: 'pointer', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        🎯
      </button>

      {/* Following route banner */}
      {followingRoute && (
        <div className="glass" style={{
          position: 'absolute', bottom: 88, left: 16, right: 16,
          borderRadius: 18, padding: '13px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 4, borderRadius: 4, background: 'linear-gradient(90deg, #ff8a52, #ef5616)', boxShadow: '0 0 8px rgba(255,140,60,0.5)' }} />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,180,100,0.75)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, marginBottom: 2, fontFamily: 'var(--font-display)' }}>Following Route</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>{followingRoute.name}</div>
              {distToNextStop != null && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>📍 {formatDistance(distToNextStop)} to next stop</div>
              )}
            </div>
          </div>
          <button onClick={stopFollowing} className="pressable" style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 11, color: 'rgba(255,255,255,0.85)', padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Stop</button>
        </div>
      )}

      {/* Start trip button */}
      {!trackingActive && (
        <button onClick={() => setShowNameModal(true)} className="pressable" style={{
          position: 'absolute', bottom: 24, left: 20, right: 20,
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none',
          borderRadius: 20, padding: '17px 0', fontSize: 16, fontWeight: 700, color: '#fff',
          cursor: 'pointer', zIndex: 1000, boxShadow: 'var(--shadow-orange-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font-display)',
        }}>
          <span style={{ fontSize: 20 }}>🚗</span>Start a Trip
        </button>
      )}

      {showNameModal && (
        <BottomSheet title="Name Your Trip" onClose={() => setShowNameModal(false)}>
          <input autoFocus placeholder="e.g. Weekend in the Mountains" value={tripName} onChange={e => setTripName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleStart()} style={inputStyle} />
          <button onClick={handleStart} className="pressable" style={primaryBtn}>Start Tracking</button>
        </BottomSheet>
      )}

      {showAddPlace && (
        <BottomSheet title="Save a Place" onClose={() => setShowAddPlace(false)}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {['restaurant', 'destination'].map(t => (
              <button key={t} onClick={() => setNewPlace(p => ({ ...p, type: t }))} className="pressable" style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: newPlace.type === t ? 'var(--orange-wash)' : 'var(--surface-2)', border: `1.5px solid ${newPlace.type === t ? 'var(--orange)' : 'var(--border)'}`, color: newPlace.type === t ? 'var(--orange-deep)' : 'var(--text-soft)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {t === 'restaurant' ? '🍽️ Restaurant' : '📍 Destination'}
              </button>
            ))}
          </div>
          <input placeholder="Place name" value={newPlace.name} onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <textarea placeholder="Notes (optional)" value={newPlace.notes} onChange={e => setNewPlace(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, height: 80, resize: 'none' }} />
          <button onClick={handleSavePlace} className="pressable" style={primaryBtn}>Save Place</button>
        </BottomSheet>
      )}
    </div>
  )
}
