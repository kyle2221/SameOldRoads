import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate, formatSpeed } from '../utils/format'
import RouteMap from '../components/RouteMap'
import RouteThumb from '../components/RouteThumb'
import {
  IconClock, IconZap, IconUtensils, IconPin, IconShare, IconCheck, IconTrash,
} from '../components/Icons'

export default function TripsPage() {
  const { trips, places, deleteTrip, saveOwnRoute } = useStore()
  const [selected, setSelected] = useState(null)

  const sorted = [...trips].sort((a, b) => b.createdAt - a.createdAt)

  if (selected) {
    const trip = trips.find(t => t.id === selected)
    if (!trip) { setSelected(null); return null }
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    return (
      <TripDetail
        trip={trip}
        places={tripPlaces}
        onBack={() => setSelected(null)}
        onDelete={async () => { await deleteTrip(trip.id); setSelected(null) }}
        onSaveRoute={saveOwnRoute}
      />
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{
        padding: '54px 20px 56px',
        background: 'linear-gradient(170deg, #0e0500 0%, #1e0a02 45%, #7a2606 80%, #c43d0c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.2), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,200,140,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Logbook</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>My Trips</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,220,180,0.55)', fontWeight: 500 }}>{trips.length} trip{trips.length !== 1 ? 's' : ''} recorded</p>
        </div>
      </div>

      <div className="hero-to-content">
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '70px 24px', color: 'var(--text-mute)' }}>
            <IconClock size={44} color="rgba(0,0,0,0.2)" />
            <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 14 }}>No trips yet. Head to the Track tab to start your first journey!</div>
          </div>
        )}

        <div style={{ padding: '20px 16px 0' }}>
          {sorted.map(trip => {
            const rCount = places.filter(p => p.tripId === trip.id && p.type === 'restaurant').length
            const dCount = places.filter(p => p.tripId === trip.id && p.type === 'destination').length
            return (
              <div
                key={trip.id}
                className="pressable"
                onClick={() => setSelected(trip.id)}
                style={{
                  background: 'var(--surface)', borderRadius: 20, marginBottom: 14,
                  border: '1px solid var(--border)', overflow: 'hidden',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                {/* Photo / RouteThumb header — RouteThumb always renders; photo overlays on load */}
                <div style={{ position: 'relative', height: 140 }}>
                  <RouteThumb path={trip.path} height={140} />
                  {trip.photo && (
                    <img
                      src={trip.photo} alt={trip.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 30%, rgba(10,4,0,0.68) 100%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.14)' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.2 }}>{formatDistance(trip.distance || 0)}</span>
                  </div>
                  <div style={{ position: 'absolute', left: 14, bottom: 10, right: 14 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: -0.2, lineHeight: 1.05, textShadow: '0 1px 8px rgba(0,0,0,0.6)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1, fontWeight: 600 }}>{formatDate(trip.createdAt)}</div>
                  </div>
                </div>

                {/* Stats footer */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconClock size={13} color="var(--text-mute)" sw={2} />
                    <span style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{formatDuration(trip.duration || 0)}</span>
                  </div>
                  {trip.avgSpeed ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconZap size={13} color="var(--text-mute)" sw={2} />
                      <span style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{formatSpeed(trip.avgSpeed)}</span>
                    </div>
                  ) : null}
                  <div style={{ flex: 1 }} />
                  {rCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--surface-2)', borderRadius: 7, padding: '3px 8px' }}>
                      <IconUtensils size={11} color="var(--text-mute)" sw={2} />
                      <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 700 }}>{rCount}</span>
                    </div>
                  )}
                  {dCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--surface-2)', borderRadius: 7, padding: '3px 8px' }}>
                      <IconPin size={11} color="var(--text-mute)" sw={2} />
                      <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 700 }}>{dCount}</span>
                    </div>
                  )}
                  <span style={{ color: 'var(--text-mute)', fontSize: 18, marginLeft: 2 }}>›</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}

async function handleShare(trip, places) {
  const lines = [
    trip.name,
    new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    `${formatDistance(trip.distance || 0)} · ${formatDuration(trip.duration || 0)}`,
    trip.avgSpeed ? `Avg ${formatSpeed(trip.avgSpeed)} · Top ${formatSpeed(trip.maxSpeed || 0)}` : '',
    places.length ? `\nStops:\n${places.map(p => `  ${p.type === 'restaurant' ? 'Food' : 'Spot'}: ${p.name}`).join('\n')}` : '',
    '\nTracked with Same Old Roads',
  ].filter(Boolean).join('\n')

  if (navigator.share) {
    await navigator.share({ title: trip.name, text: lines }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(lines).catch(() => {})
    alert('Trip summary copied to clipboard!')
  }
}

function TripDetail({ trip, places, onBack, onDelete, onSaveRoute }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  async function handleSaveAsRoute() {
    setSaving(true)
    await onSaveRoute({
      id: crypto.randomUUID(),
      name: trip.name,
      author: 'You',
      description: '',
      distance: trip.distance || 0,
      duration: trip.duration || 0,
      coverColor: '#ff7a3c',
      createdAt: Date.now(),
      isOwn: true,
      path: trip.path || [],
      places,
    })
    setSaving(false)
    setSaved(true)
  }

  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')
  const hasPath = (trip.path || []).length > 1

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Hero — RouteThumb base + optional photo overlay */}
      <div style={{ position: 'relative', minHeight: 200, overflow: 'hidden' }}>
        <RouteThumb path={trip.path} height={200} flat />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(165deg, #120600 0%, #c84a10 70%, #ef5616 100%)',
          opacity: trip.photo ? 0 : 1,
        }} />
        {trip.photo && (
          <img
            src={trip.photo} alt={trip.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(10,3,0,0.82) 100%)', pointerEvents: 'none' }} />
        <button onClick={onBack} style={{ position: 'absolute', top: 50, left: 16, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>←</button>

        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,200,140,0.6)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>Trip</div>
          <h2 style={{ margin: '0 0 5px', fontSize: 32, color: '#fff', fontWeight: 900, letterSpacing: -0.4, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>{trip.name}</h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{formatDate(trip.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        {/* Stats grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(trip.distance || 0) },
            { label: 'Duration', value: formatDuration(trip.duration || 0) },
            { label: 'Stops',    value: places.length },
            { label: 'Avg Speed', value: formatSpeed(trip.avgSpeed || 0) },
            { label: 'Top Speed', value: formatSpeed(trip.maxSpeed || 0) },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 calc(33% - 8px)', minWidth: 80, background: 'var(--surface)', borderRadius: 14, padding: '12px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--orange-deep)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: -0.3 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Route map */}
        {hasPath && (
          <div style={{ marginBottom: 20, boxShadow: 'var(--shadow-card)', borderRadius: 18 }}>
            <RouteMap path={trip.path} places={places} height={190} interactive />
          </div>
        )}

        {restaurants.length > 0 && <PlaceGroup title="Restaurants" PlaceIcon={IconUtensils} places={restaurants} />}
        {destinations.length > 0 && <PlaceGroup title="Destinations" PlaceIcon={IconPin} places={destinations} />}
        {places.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-mute)', fontSize: 14 }}>No places saved for this trip.</div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleSaveAsRoute} disabled={saving || saved} style={{
            padding: 15, borderRadius: 14,
            background: saved ? 'var(--surface-2)' : 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: saved ? '1px solid var(--border)' : 'none',
            color: saved ? 'var(--text-soft)' : '#fff',
            fontSize: 17, fontWeight: 700, cursor: 'pointer',
            boxShadow: saved ? 'none' : '0 5px 16px rgba(239,86,22,0.3)',
            fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {saved ? <><IconCheck size={18} color="var(--text-soft)" sw={2.5} /> Saved as Route</> : saving ? 'Saving...' : 'Save as Shareable Route'}
          </button>

          <button onClick={() => handleShare(trip, places)} style={{
            padding: 13, borderRadius: 14, background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--text)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <IconShare size={18} color="var(--text)" sw={1.8} />
            Share Trip
          </button>

          {confirmDel ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onDelete} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <IconTrash size={15} color="#fff" sw={2} />
                Delete Trip
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ padding: 13, borderRadius: 13, background: '#fff', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconTrash size={15} color="var(--orange-deep)" sw={1.8} />
              Delete Trip
            </button>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function PlaceGroup({ title, PlaceIcon, places }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: 'var(--text-mute)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'Rajdhani', sans-serif" }}>
        <PlaceIcon size={13} color="var(--text-mute)" sw={2} />
        {title}
      </div>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {places.map((p, i) => (
          <div key={p.id} style={{ borderBottom: i === places.length - 1 ? 'none' : '1px solid var(--border-soft)' }}>
            {p.photo && <img src={p.photo} alt={p.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
              {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3 }}>{p.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
