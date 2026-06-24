import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import RouteMap from '../components/RouteMap'
import { PageHeader, EmptyState, Tag } from '../components/ui'
import { toast } from '../store/toast'

export default function TripsPage() {
  const { trips, places, deleteTrip, saveOwnRoute } = useStore()
  const [selected, setSelected] = useState(null)
  const sorted = [...trips].sort((a, b) => b.createdAt - a.createdAt)

  if (selected) {
    const trip = trips.find(t => t.id === selected)
    if (!trip) { setSelected(null); return null }
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    return <TripDetail trip={trip} places={tripPlaces} onBack={() => setSelected(null)} onDelete={async () => { await deleteTrip(trip.id); setSelected(null); toast.success('Trip deleted') }} onSaveRoute={saveOwnRoute} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <PageHeader title="My Trips" subtitle={`${trips.length} trips recorded`} variant="soft" />

      {sorted.length === 0 && <EmptyState icon="🚗" title="No trips yet" message="Head to the Track tab to start your first journey!" />}

      <div className="stagger" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {sorted.map((trip, i) => {
          const rCount = places.filter(p => p.tripId === trip.id && p.type === 'restaurant').length
          const dCount = places.filter(p => p.tripId === trip.id && p.type === 'destination').length
          return (
            <div key={trip.id} onClick={() => setSelected(trip.id)} className="pressable" style={{
              '--i': i,
              background: 'var(--surface)', borderRadius: 20, marginBottom: 0,
              border: '1px solid var(--border)', overflow: 'hidden',
              boxShadow: 'var(--shadow-card)', display: 'flex', cursor: 'pointer',
            }}>
              <div style={{ width: 5, flexShrink: 0, background: 'linear-gradient(180deg, #ff8a52, #ef5616)' }} />
              <div style={{ flex: 1, padding: '15px 15px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>{trip.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{formatDate(trip.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--orange-deep)', letterSpacing: -0.5, fontFamily: 'var(--font-mono)' }}>{formatDistance(trip.distance || 0)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{formatDuration(trip.duration || 0)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Tag size="sm">🍽️ {rCount} food</Tag>
                  <Tag size="sm">📍 {dCount} spots</Tag>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TripDetail({ trip, places, onBack, onDelete, onSaveRoute }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)

  async function handleSaveAsRoute() {
    setSaving(true)
    await onSaveRoute({ id: crypto.randomUUID(), name: trip.name, author: 'You', description: '', distance: trip.distance || 0, duration: trip.duration || 0, coverColor: '#ff7a3c', createdAt: Date.now(), isOwn: true, path: trip.path || [], places })
    setSaving(false); setSaved(true)
    toast.success('Saved as shareable route')
  }

  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')
  const hasPath = (trip.path || []).length > 1

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }} className="fade-in">
      <div style={{
        padding: '70px 20px 22px',
        background: 'linear-gradient(165deg, #0a0300 0%, #a03208 70%, #ef5616 100%)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)', pointerEvents: 'none' }} />
        <button onClick={onBack} className="pressable" style={{
          position: 'absolute', top: 50, left: 16,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12,
          color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>←</button>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Trip</div>
          <h2 style={{ margin: '0 0 5px', fontSize: 26, color: '#fff', fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{trip.name}</h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDate(trip.createdAt)}</div>
        </div>
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(trip.distance || 0) },
            { label: 'Duration', value: formatDuration(trip.duration || 0) },
            { label: 'Stops', value: places.length },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'var(--surface)', borderRadius: 14,
              padding: '13px 6px', textAlign: 'center',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange-deep)', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 0.5, fontFamily: 'var(--font-display)', marginTop: 2, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {hasPath && (
          <div style={{ marginBottom: 20, boxShadow: 'var(--shadow-card)', borderRadius: 18 }}>
            <RouteMap path={trip.path} places={places} height={190} interactive />
          </div>
        )}
        {restaurants.length > 0 && <PlaceGroup title="🍽️ Restaurants" places={restaurants} />}
        {destinations.length > 0 && <PlaceGroup title="📍 Destinations" places={destinations} />}
        {places.length === 0 && <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-mute)', fontSize: 14 }}>No places saved for this trip.</div>}

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleSaveAsRoute} disabled={saving || saved} className="pressable" style={{
            padding: 15, borderRadius: 14,
            background: saved ? 'var(--surface-2)' : 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: saved ? '1px solid var(--border)' : 'none',
            color: saved ? 'var(--text-soft)' : '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            boxShadow: saved ? 'none' : 'var(--shadow-orange)',
            fontFamily: 'var(--font-display)',
          }}>
            {saved ? '✓ Saved as Route' : saving ? 'Saving...' : 'Save as Shareable Route'}
          </button>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDel(false)} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-soft)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onDelete} className="pressable" style={{ flex: 1, padding: 13, borderRadius: 13, background: 'var(--orange)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Delete Trip</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} className="pressable" style={{ padding: 13, borderRadius: 13, background: 'var(--surface)', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Delete Trip</button>
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
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-display)' }}>{title}</div>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', padding: '4px 16px' }}>
        {places.map((p, i) => (
          <div key={p.id} style={{ padding: '12px 0', borderBottom: i === places.length - 1 ? 'none' : '1px solid var(--border-soft)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{p.name}</div>
            {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3, lineHeight: 1.5 }}>{p.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
