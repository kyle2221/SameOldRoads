import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate, formatSpeed } from '../utils/format'
import RouteMap from '../components/RouteMap'

export default function TripsPage() {
  const { trips, places, deleteTrip, saveOwnRoute } = useStore()
  const [selected, setSelected] = useState(null)

  const sorted = [...trips].sort((a, b) => b.createdAt - a.createdAt)

  if (selected) {
    const trip = trips.find(t => t.id === selected)
    if (!trip) { setSelected(null); return null }
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    return <TripDetail trip={trip} places={tripPlaces} onBack={() => setSelected(null)} onDelete={async () => { await deleteTrip(trip.id); setSelected(null) }} onSaveRoute={saveOwnRoute} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{
        padding: '54px 20px 28px',
        background: 'linear-gradient(170deg, #0e0500 0%, #1e0a02 45%, #7a2606 80%, #c43d0c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.2), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,80,20,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,200,140,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Logbook</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>My Trips</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,220,180,0.55)', fontWeight: 500 }}>{trips.length} trips recorded</p>
        </div>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 24px', color: 'var(--text-mute)' }}>
          <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.7 }}>🚗</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>No trips yet. Head to the Track tab to start your first journey!</div>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {sorted.map(trip => {
          const rCount = places.filter(p => p.tripId === trip.id && p.type === 'restaurant').length
          const dCount = places.filter(p => p.tripId === trip.id && p.type === 'destination').length
          return (
            <div
              key={trip.id}
              onClick={() => setSelected(trip.id)}
              style={{
                background: 'var(--surface)', borderRadius: 20, marginBottom: 13,
                border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)',
                display: 'flex', cursor: 'pointer',
              }}
            >
              {/* Left accent stripe */}
              <div style={{ width: 5, flexShrink: 0, background: 'linear-gradient(180deg, #ff8a52, #ef5616)' }} />
              <div style={{ flex: 1, padding: '15px 15px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{formatDate(trip.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                    <div style={{ fontSize: 21, fontWeight: 900, color: 'var(--orange-deep)', letterSpacing: -0.3, fontFamily: "'Rajdhani', sans-serif" }}>{formatDistance(trip.distance || 0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>{formatDuration(trip.duration || 0)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Chip label={`${rCount} restaurants`} icon="🍽️" />
                  <Chip label={`${dCount} spots`} icon="📍" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Chip({ icon, label }) {
  return (
    <span style={{ fontSize: 11, color: 'var(--text-soft)', background: 'var(--surface-2)', borderRadius: 8, padding: '4px 9px', fontWeight: 600 }}>
      {icon} {label}
    </span>
  )
}

async function handleShare(trip, places) {
  const text = [
    `🚗 ${trip.name}`,
    `📅 ${new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    `📍 ${formatDistance(trip.distance || 0)} · ${formatDuration(trip.duration || 0)}`,
    trip.avgSpeed ? `⚡ Avg ${formatSpeed(trip.avgSpeed)} · Top ${formatSpeed(trip.maxSpeed || 0)}` : '',
    places.length ? `\nStops:\n${places.map(p => `  ${p.type === 'restaurant' ? '🍽️' : '📍'} ${p.name}`).join('\n')}` : '',
    '\nTracked with Same Old Roads',
  ].filter(Boolean).join('\n')

  if (navigator.share) {
    await navigator.share({ title: trip.name, text }).catch(() => {})
  } else {
    await navigator.clipboard.writeText(text).catch(() => {})
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
      <div style={{
        padding: '70px 20px 22px',
        background: 'linear-gradient(165deg, #120600 0%, #c84a10 70%, #ef5616 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
        <button onClick={onBack} style={{ position: 'absolute', top: 50, left: 16, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12, color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>←</button>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,200,140,0.6)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>Trip</div>
          <h2 style={{ margin: '0 0 5px', fontSize: 32, color: '#fff', fontWeight: 900, letterSpacing: -0.4, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>{trip.name}</h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDate(trip.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        {/* Stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(trip.distance || 0) },
            { label: 'Duration', value: formatDuration(trip.duration || 0) },
            { label: 'Stops', value: places.length },
            { label: 'Avg Speed', value: formatSpeed(trip.avgSpeed || 0) },
            { label: 'Top Speed', value: formatSpeed(trip.maxSpeed || 0) },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 calc(33% - 8px)', minWidth: 80, background: 'var(--surface)', borderRadius: 14, padding: '12px 8px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
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

        {restaurants.length > 0 && <PlaceGroup title="🍽️ Restaurants" places={restaurants} />}
        {destinations.length > 0 && <PlaceGroup title="📍 Destinations" places={destinations} />}
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
          }}>
            {saved ? '✓ Saved as Route' : saving ? 'Saving...' : 'Save as Shareable Route'}
          </button>

          <button onClick={() => handleShare(trip, places)} style={{
            padding: 13, borderRadius: 14, background: 'var(--surface)',
            border: '1px solid var(--border)', color: 'var(--text)',
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            <span>↗️</span> Share Trip
          </button>

          {confirmDel ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onDelete} style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Delete Trip</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ padding: 13, borderRadius: 13, background: '#fff', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete Trip</button>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function PlaceGroup({ title, places }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-mute)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'Rajdhani', sans-serif" }}>{title}</div>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
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
