import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatSpeed } from '../utils/format'
import { routeAlongRoads } from '../utils/routing'
import { getWeather } from '../utils/weather'
import { geocodeSearch } from '../utils/geocode'
import { uid } from '../utils/uid'
import { IconCar, IconSearch, IconPin, IconCamera, IconUtensils, IconX } from '../components/Icons'

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const pathLayerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const watchIdRef = useRef(null)
  const roRef = useRef(null)

  const { trackingActive, currentPath, activeTrip, startTrip, appendPathPoint, stopTrip, places, followingRoute, stopFollowing, addPlace } = useStore()
  const [elapsed, setElapsed] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [weather, setWeather] = useState(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [tripName, setTripName] = useState('')
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [newPlace, setNewPlace] = useState({ type: 'restaurant', name: '', notes: '', photo: null })
  const [pendingLatLng, setPendingLatLng] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchTimerRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return
    // `cancelled` guards against React StrictMode's double-mount: the leaflet
    // import is async, so a second effect invocation can fire before the first
    // resolves. Without this both would call L.map() on the same node and throw
    // "Map container is already initialized."
    let cancelled = false
    import('leaflet').then(L => {
      if (cancelled || mapInstanceRef.current || !mapRef.current) return
      const map = L.default.map(mapRef.current, {
        center: [37.7, -98.5], zoom: 4,
        zoomControl: true, attributionControl: false,
      })
      L.default.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
      map.on('click', (e) => {
        if (!trackingActive) return
        setPendingLatLng(e.latlng)
        setShowAddPlace(true)
      })
      mapInstanceRef.current = map
      pathLayerRef.current = L.default.polyline([], {
        color: '#ff6a2b', weight: 5, opacity: 0.95, lineJoin: 'round', lineCap: 'round',
      }).addTo(map)
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
      cancelled = true
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null }
      if (watchIdRef.current) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null }
      // Fully tear down the map so a remount starts clean (no leaked instance).
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
      pathLayerRef.current = null
      routeLayerRef.current = null
      markersRef.current = []
      userMarkerRef.current = null
    }
  }, [])

  // Live tracking polyline
  useEffect(() => {
    if (!pathLayerRef.current || !currentPath.length) return
    pathLayerRef.current.setLatLngs(currentPath.map(p => [p.lat, p.lng]))
  }, [currentPath])

  // Followed route
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
      draw(followingRoute.path.map(p => [p.lat, p.lng]))
      const routed = await routeAlongRoads(followingRoute.path)
      if (!cancelled && routed.length) draw(routed)
    })
    return () => { cancelled = true }
  }, [followingRoute])

  // Place markers
  useEffect(() => {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      places.forEach(pl => {
        const icon = pl.type === 'restaurant' ? '🍽️' : '📍'
        const photoHtml = pl.photo
          ? `<img src="${pl.photo}" style="width:100%;height:60px;object-fit:cover;border-radius:6px;margin-top:6px;"/>`
          : ''
        const m = L.default.marker([pl.lat, pl.lng], {
          icon: L.default.divIcon({ html: `<div style="font-size:20px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${icon}</div>`, iconSize: [24, 24], className: '' })
        }).bindPopup(`<b>${pl.name}</b>${pl.notes ? `<br><small>${pl.notes}</small>` : ''}${photoHtml}`)
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

  // Search debounce
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true)
      const results = await geocodeSearch(search)
      setSearchResults(results)
      setSearchLoading(false)
    }, 500)
    return () => clearTimeout(searchTimerRef.current)
  }, [search])

  function updateUserDot(latlng) {
    if (!mapInstanceRef.current) return
    import('leaflet').then(L => {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.default.marker([latlng.lat, latlng.lng], {
          icon: L.default.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#4287f5;border:3px solid #fff;box-shadow:0 0 0 4px rgba(66,135,245,0.25),0 2px 8px rgba(0,0,0,0.3)"></div>`,
            iconSize: [16, 16], iconAnchor: [8, 8], className: '',
          }),
          zIndexOffset: 500,
        }).addTo(mapInstanceRef.current)
      } else {
        userMarkerRef.current.setLatLng([latlng.lat, latlng.lng])
      }
    })
  }

  function startGPS() {
    if (!navigator.geolocation) return alert('Geolocation not available')
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const speed = pos.coords.speed ?? 0
        setUserPos(latlng)
        setCurrentSpeed(speed)
        appendPathPoint(latlng)
        updateUserDot(latlng)
        mapInstanceRef.current?.setView([latlng.lat, latlng.lng], 15)
        // Fetch weather once on first fix
        if (!weather) getWeather(latlng.lat, latlng.lng).then(w => w && setWeather(w))
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
    setSearch('')
    setSearchResults([])
    startGPS()
  }

  async function handleStop() {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setCurrentSpeed(0)
    setWeather(null)
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }
    await stopTrip()
    setElapsed(0)
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setNewPlace(p => ({ ...p, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function handleSavePlace() {
    if (!newPlace.name.trim() || !pendingLatLng) return
    const place = {
      id: uid(),
      ...newPlace,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      tripId: activeTrip?.id || null,
      createdAt: Date.now(),
    }
    await addPlace(place)
    setShowAddPlace(false)
    setNewPlace({ type: 'restaurant', name: '', notes: '', photo: null })
  }

  function flyTo({ lat, lng }) {
    setSearch('')
    setSearchResults([])
    mapInstanceRef.current?.setView([lat, lng], 14)
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <style>{`
        @keyframes recPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.75)} }
      `}</style>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Search bar — shown when not tracking */}
      {!trackingActive && (
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}>
          <div style={{
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)', borderRadius: 16,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.07)',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
              <IconSearch size={16} color="var(--text-mute)" sw={2} />
              <input
                className="input-field"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search places, cities, roads..."
                style={{
                  flex: 1, border: 'none', fontSize: 15,
                  background: 'transparent', color: 'var(--text)',
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: 500,
                }}
              />
              {(search || searchLoading) && (
                <button onClick={() => { setSearch(''); setSearchResults([]) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                  {searchLoading ? <span style={{ fontSize: 16 }}>…</span> : <IconX size={18} color="var(--text-mute)" sw={2} />}
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => flyTo(r)} style={{
                    width: '100%', padding: '12px 16px', background: 'none', border: 'none',
                    borderBottom: i < searchResults.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <IconPin size={14} color="var(--text-mute)" sw={2} />
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, lineHeight: 1.4 }}>{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tracking HUD */}
      {trackingActive && (
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}>
          {/* Top row: trip name + weather */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', display: 'block', animation: 'recPulse 1.4s ease-in-out infinite', boxShadow: '0 0 6px rgba(255,59,48,0.6)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1, textShadow: '0 1px 4px rgba(0,0,0,0.5)', textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{activeTrip?.name}</span>
            </div>
            {weather && (
              <div style={{ background: 'rgba(14,8,4,0.7)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5, border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: 14 }}>{weather.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Rajdhani', sans-serif" }}>{weather.temp}°F</span>
              </div>
            )}
          </div>
          {/* Stats row */}
          <div style={{
            background: 'rgba(14,8,4,0.86)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            borderRadius: 22, padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center',
          }}>
            <HudStat label="Duration" value={formatDuration(elapsed)} />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 12px' }} />
            <HudStat label="Distance" value={formatDistance(activeTrip?.distance || 0)} orange />
            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)', margin: '0 12px' }} />
            <HudStat label="Speed" value={formatSpeed(currentSpeed)} />
            <div style={{ display: 'flex', gap: 7, marginLeft: 'auto', paddingLeft: 10 }}>
              <button
                onClick={() => { setPendingLatLng(userPos || { lat: 0, lng: 0 }); setShowAddPlace(true) }}
                style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              ><IconPin size={18} color="#fff" sw={2} /></button>
              <button
                onClick={handleStop}
                style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #ff4444, #cc0000)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(204,0,0,0.4)' }}
              >■</button>
            </div>
          </div>
        </div>
      )}

      {/* Following route banner */}
      {followingRoute && (
        <div style={{
          position: 'absolute', bottom: 88, left: 16, right: 16,
          background: 'rgba(14,8,4,0.86)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderRadius: 18, padding: '13px 16px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 4, borderRadius: 4, background: 'linear-gradient(90deg, #ff8a52, #ef5616)', boxShadow: '0 0 8px rgba(255,140,60,0.5)' }} />
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,180,100,0.7)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 2, fontFamily: "'Rajdhani', sans-serif" }}>Following Route</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.2 }}>{followingRoute.name}</div>
            </div>
          </div>
          <button onClick={stopFollowing} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 11, color: 'rgba(255,255,255,0.8)', padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Stop
          </button>
        </div>
      )}

      {/* Start button */}
      {!trackingActive && (
        <button onClick={() => setShowNameModal(true)} style={{
          position: 'absolute', bottom: 24, left: 20, right: 20,
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none',
          borderRadius: 20, padding: '17px 0',
          fontSize: 19, fontWeight: 700, color: '#fff', cursor: 'pointer', zIndex: 1000,
          boxShadow: '0 8px 28px rgba(239,86,22,0.52)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif",
        }}>
          <IconCar size={22} color="#fff" sw={2} />
          Start a Trip
        </button>
      )}

      {/* Name modal */}
      {showNameModal && (
        <Modal title="Name Your Trip" onClose={() => setShowNameModal(false)}>
          <input
            className="input-field"
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
          <div style={{ display: 'flex', gap: 8 }}>
            {['restaurant', 'destination'].map(t => (
              <button key={t} onClick={() => setNewPlace(p => ({ ...p, type: t }))} style={{
                flex: 1, padding: '11px 0', borderRadius: 12,
                background: newPlace.type === t ? 'var(--orange-wash)' : 'var(--surface-2)',
                border: `1.5px solid ${newPlace.type === t ? 'var(--orange)' : 'var(--border)'}`,
                color: newPlace.type === t ? 'var(--orange-deep)' : 'var(--text-soft)', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {t === 'restaurant'
                    ? <><IconUtensils size={13} color={newPlace.type === t ? 'var(--orange-deep)' : 'var(--text-soft)'} sw={2} /> Restaurant</>
                    : <><IconPin size={13} color={newPlace.type === t ? 'var(--orange-deep)' : 'var(--text-soft)'} sw={2} /> Destination</>
                  }
                </span>
              </button>
            ))}
          </div>
          <input className="input-field" placeholder="Place name" value={newPlace.name} onChange={e => setNewPlace(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <textarea className="input-field" placeholder="Notes (optional)" value={newPlace.notes} onChange={e => setNewPlace(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, height: 68, resize: 'none' }} />

          {/* Photo capture */}
          {newPlace.photo ? (
            <div style={{ position: 'relative' }}>
              <img src={newPlace.photo} alt="Place" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12 }} />
              <button onClick={() => setNewPlace(p => ({ ...p, photo: null }))}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 20, color: '#fff', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconX size={14} color="#fff" sw={2.5} />
              </button>
            </div>
          ) : (
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 0', borderRadius: 12, border: '1.5px dashed var(--border)',
              background: 'var(--surface-2)', color: 'var(--text-soft)', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
            }}>
              <IconCamera size={18} color="var(--text-soft)" sw={1.8} />
              Add Photo
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          )}

          <button onClick={handleSavePlace} style={primaryBtn}>Save Place</button>
        </Modal>
      )}
    </div>
  )
}

function HudStat({ label, value, orange }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 2, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{label}</div>
      <div style={{
        fontSize: 24, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif",
        ...(orange ? {
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        } : { color: '#fff' }),
      }}>{value}</div>
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
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.3 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconX size={20} color="var(--text-mute)" sw={2} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 13,
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 15,
}

const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: 14,
  background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none',
  color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(239,86,22,0.3)',
  fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
}
