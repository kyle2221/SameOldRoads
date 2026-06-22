import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
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
        padding: '54px 20px 22px',
        background: 'linear-gradient(180deg, #ffd9c2 0%, #ffe9dc 45%, #ffffff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -90, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.45), rgba(255,122,60,0))' }} />
        <h1 style={{ margin: '0 0 5px', fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.6, position: 'relative' }}>My Trips</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', position: 'relative' }}>{trips.length} trips recorded</p>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '70px 24px', color: 'var(--text-mute)' }}>
          <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.7 }}>🚗</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>No trips yet. Head to the Track tab to start your first journey!</div>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {sorted.map(trip => (
          <div
            key={trip.id}
            onClick={() => setSelected(trip.id)}
            style={{
              background: 'var(--surface)', borderRadius: 20, marginBottom: 13,
              border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ height: 6, background: 'linear-gradient(90deg, #ff8a52, #ef5616)' }} />
            <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚗</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{trip.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{formatDate(trip.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--orange-deep)' }}>{formatDistance(trip.distance || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{formatDuration(trip.duration || 0)}</div>
              </div>
            </div>
            <div style={{ padding: '0 16px 13px', display: 'flex', gap: 8 }}>
              <Chip label={`${places.filter(p => p.tripId === trip.id && p.type === 'restaurant').length} restaurants`} icon="🍽️" />
              <Chip label={`${places.filter(p => p.tripId === trip.id && p.type === 'destination').length} spots`} icon="📍" />
            </div>
          </div>
        ))}
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
        padding: '52px 16px 20px',
        background: 'linear-gradient(180deg, #ffd9c2 0%, #ffe9dc 55%, #ffffff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 50, left: 16, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', width: 38, height: 38, fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-soft)', zIndex: 2 }}>←</button>
        <div style={{ textAlign: 'center', paddingTop: 6, position: 'relative' }}>
          <div style={{ fontSize: 34 }}>🚗</div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 23, color: 'var(--text)', fontWeight: 800, letterSpacing: -0.5 }}>{trip.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>{formatDate(trip.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(trip.distance || 0) },
            { label: 'Duration', value: formatDuration(trip.duration || 0) },
            { label: 'Stops', value: places.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--surface)', borderRadius: 14, padding: '13px 6px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--orange-deep)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600 }}>{s.label}</div>
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
            padding: 15, borderRadius: 14, background: saved ? 'var(--surface-2)' : 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: saved ? '1px solid var(--border)' : 'none', color: saved ? 'var(--text-soft)' : '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            boxShadow: saved ? 'none' : '0 5px 16px rgba(239,86,22,0.3)',
          }}>
            {saved ? '✓ Saved as Route' : saving ? 'Saving...' : 'Save as Shareable Route'}
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
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', padding: '4px 16px' }}>
        {places.map((p, i) => (
          <div key={p.id} style={{ padding: '12px 0', borderBottom: i === places.length - 1 ? 'none' : '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
            {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3 }}>{p.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
