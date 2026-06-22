import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'

export default function TripsPage() {
  const { trips, places, deleteTrip, saveOwnRoute } = useStore()
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const sorted = [...trips].sort((a, b) => b.createdAt - a.createdAt)

  if (selected) {
    const trip = trips.find(t => t.id === selected)
    if (!trip) { setSelected(null); return null }
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    return <TripDetail trip={trip} places={tripPlaces} onBack={() => setSelected(null)} onDelete={async () => { await deleteTrip(trip.id); setSelected(null) }} onSaveRoute={saveOwnRoute} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      <div style={{ padding: '48px 16px 16px', background: 'linear-gradient(180deg, var(--green-800) 0%, var(--green-950) 100%)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: 'var(--khaki-100)' }}>My Trips</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--khaki-400)' }}>{trips.length} trips recorded</p>
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--khaki-400)', fontSize: 14 }}>
          No trips yet. Head to the Track tab to start your first journey!
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {sorted.map(trip => (
          <div
            key={trip.id}
            onClick={() => setSelected(trip.id)}
            style={{
              background: 'var(--green-800)', borderRadius: 16, marginBottom: 12,
              border: '1px solid var(--green-700)', overflow: 'hidden',
            }}
          >
            <div style={{ height: 6, background: 'linear-gradient(90deg, var(--green-500), var(--green-300))' }} />
            <div style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚗</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--khaki-200)' }}>{trip.name}</div>
                <div style={{ fontSize: 12, color: 'var(--khaki-400)' }}>{formatDate(trip.createdAt)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-300)' }}>{formatDistance(trip.distance || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--khaki-400)' }}>{formatDuration(trip.duration || 0)}</div>
              </div>
            </div>
            <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
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
    <span style={{ fontSize: 11, color: 'var(--khaki-400)', background: 'var(--green-900)', borderRadius: 6, padding: '3px 8px' }}>
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
      coverColor: '#2d5a3d',
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

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      {/* Top bar */}
      <div style={{ padding: '48px 16px 16px', background: 'linear-gradient(180deg, var(--green-800) 0%, var(--green-950) 100%)', position: 'relative' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: 48, left: 16, background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 10, color: 'var(--khaki-100)', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}>←</button>
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 32 }}>🚗</div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 22, color: 'var(--khaki-100)' }}>{trip.name}</h2>
          <div style={{ fontSize: 13, color: 'var(--khaki-400)' }}>{formatDate(trip.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(trip.distance || 0) },
            { label: 'Duration', value: formatDuration(trip.duration || 0) },
            { label: 'Stops', value: places.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--green-800)', borderRadius: 12, padding: '12px 6px', textAlign: 'center', border: '1px solid var(--green-600)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--khaki-200)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--khaki-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Restaurants */}
        {restaurants.length > 0 && (
          <PlaceGroup title="🍽️ Restaurants" places={restaurants} />
        )}

        {/* Destinations */}
        {destinations.length > 0 && (
          <PlaceGroup title="📍 Destinations" places={destinations} />
        )}

        {places.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--khaki-400)', fontSize: 14 }}>No places saved for this trip.</div>
        )}

        {/* Actions */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleSaveAsRoute} disabled={saving || saved} style={{
            padding: 14, borderRadius: 12, background: saved ? 'var(--green-700)' : 'var(--green-500)',
            border: 'none', color: 'var(--khaki-100)', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            {saved ? '✓ Saved as Route' : saving ? 'Saving...' : 'Save as Shareable Route'}
          </button>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} style={{ flex: 1, padding: 12, borderRadius: 12, background: 'var(--green-800)', border: '1px solid var(--green-600)', color: 'var(--khaki-400)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onDelete} style={{ flex: 1, padding: 12, borderRadius: 12, background: '#7b2020', border: '1px solid #c0392b', color: '#ff9999', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete Trip</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ padding: 12, borderRadius: 12, background: 'transparent', border: '1px solid #c0392b', color: '#e57373', fontSize: 14, cursor: 'pointer' }}>Delete Trip</button>
          )}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function PlaceGroup({ title, places }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-300)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      {places.map(p => (
        <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--green-800)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--khaki-200)' }}>{p.name}</div>
          {p.notes && <div style={{ fontSize: 13, color: 'var(--khaki-400)', marginTop: 3 }}>{p.notes}</div>}
        </div>
      ))}
    </div>
  )
}
