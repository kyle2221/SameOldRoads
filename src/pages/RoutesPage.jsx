import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'

export default function RoutesPage() {
  const { routes, followRoute, saveOwnRoute, trips, places } = useStore()
  const [tab, setTab] = useState('discover')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)

  const communityRoutes = routes.filter(r => !r.isOwn)
  const myRoutes = routes.filter(r => r.isOwn)

  async function handleCreateFromTrip(trip) {
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    const route = {
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
      places: tripPlaces,
    }
    await saveOwnRoute(route)
    setShowCreate(false)
  }

  if (selected) {
    return <RouteDetail route={selected} onBack={() => setSelected(null)} onFollow={() => { followRoute(selected); setSelected(null) }} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      {/* Header */}
      <div style={{ padding: '48px 16px 16px', background: 'linear-gradient(180deg, var(--green-800) 0%, var(--green-950) 100%)' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, color: 'var(--khaki-100)' }}>Routes</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--khaki-400)' }}>Discover curated trips or share your own</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 16px 16px', background: 'var(--green-900)', borderRadius: 12, padding: 4, gap: 4 }}>
        {[['discover', 'Discover'], ['mine', 'My Routes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 9,
            background: tab === id ? 'var(--green-600)' : 'transparent',
            border: 'none', color: tab === id ? 'var(--khaki-100)' : 'var(--khaki-400)',
            fontSize: 14, fontWeight: tab === id ? 700 : 400, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communityRoutes.map(r => (
            <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => setShowCreate(true)} style={{
            width: '100%', padding: 16, background: 'var(--green-800)',
            border: '1px dashed var(--green-500)', borderRadius: 16,
            color: 'var(--green-300)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>+ Create Route from Trip</button>
          {myRoutes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--khaki-400)', fontSize: 14 }}>
              No routes yet. Complete a trip and save it as a route!
            </div>
          )}
          {myRoutes.map(r => (
            <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />
          ))}
        </div>
      )}

      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            width: '100%', background: 'var(--green-900)', borderRadius: '20px 20px 0 0',
            padding: '20px 20px calc(20px + env(safe-area-inset-bottom,0px))',
            border: '1px solid var(--green-700)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--khaki-200)', marginBottom: 16 }}>Choose a Trip</div>
            {trips.length === 0 && <div style={{ color: 'var(--khaki-400)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No trips yet</div>}
            {trips.map(t => (
              <button key={t.id} onClick={() => handleCreateFromTrip(t)} style={{
                width: '100%', padding: '14px 16px', background: 'var(--green-800)',
                border: '1px solid var(--green-600)', borderRadius: 12, color: 'var(--khaki-100)',
                fontSize: 15, cursor: 'pointer', marginBottom: 8, textAlign: 'left',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>{t.name}</span>
                <span style={{ color: 'var(--khaki-400)', fontSize: 13 }}>{formatDistance(t.distance || 0)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}

function RouteCard({ route, onTap, onFollow }) {
  return (
    <div style={{
      background: 'var(--green-800)', borderRadius: 16, overflow: 'hidden',
      border: '1px solid var(--green-600)',
    }} onClick={onTap}>
      <div style={{
        height: 100, background: `linear-gradient(135deg, ${route.coverColor || 'var(--green-700)'} 0%, var(--green-900) 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48,
      }}>🛣️</div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--khaki-200)', marginBottom: 4 }}>{route.name}</div>
        <div style={{ fontSize: 12, color: 'var(--khaki-400)', marginBottom: 8 }}>
          by {route.author} · {formatDistance(route.distance)} · {formatDate(route.createdAt)}
        </div>
        {route.description && <div style={{ fontSize: 13, color: 'var(--khaki-300)', marginBottom: 10, lineHeight: 1.5 }}>{route.description}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--green-900)', borderRadius: 8, padding: '6px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-200)' }}>{formatDistance(route.distance)}</div>
            <div style={{ fontSize: 10, color: 'var(--khaki-400)' }}>distance</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--green-900)', borderRadius: 8, padding: '6px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-200)' }}>{route.places?.length || 0}</div>
            <div style={{ fontSize: 10, color: 'var(--khaki-400)' }}>places</div>
          </div>
          <button onClick={e => { e.stopPropagation(); onFollow() }} style={{
            flex: 2, padding: '8px 0', background: 'var(--green-600)',
            border: 'none', borderRadius: 8, color: 'var(--khaki-100)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Follow Route</button>
        </div>
      </div>
    </div>
  )
}

function RouteDetail({ route, onBack, onFollow }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      <div style={{
        height: 180, background: `linear-gradient(135deg, ${route.coverColor || 'var(--green-700)'} 0%, var(--green-900) 100%)`,
        display: 'flex', alignItems: 'flex-end', position: 'relative',
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 48, left: 16,
          background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 10,
          color: 'var(--khaki-100)', width: 36, height: 36, fontSize: 18, cursor: 'pointer',
        }}>←</button>
        <span style={{ fontSize: 64, padding: '0 0 16px 20px' }}>🛣️</span>
      </div>
      <div style={{ padding: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 24, color: 'var(--khaki-100)' }}>{route.name}</h2>
        <p style={{ margin: '0 0 16px', color: 'var(--khaki-400)', fontSize: 14 }}>by {route.author} · {formatDate(route.createdAt)}</p>
        {route.description && <p style={{ margin: '0 0 20px', color: 'var(--khaki-300)', fontSize: 14, lineHeight: 1.6 }}>{route.description}</p>}

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Distance', value: formatDistance(route.distance) },
            { label: 'Duration', value: formatDuration(route.duration) },
            { label: 'Places', value: route.places?.length || 0 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--green-800)', borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: '1px solid var(--green-600)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--khaki-200)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--khaki-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {route.places?.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-300)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Stops</div>
            {route.places.map(p => (
              <div key={p.id} style={{
                display: 'flex', gap: 12, padding: '12px 0',
                borderBottom: '1px solid var(--green-800)',
              }}>
                <span style={{ fontSize: 24 }}>{p.type === 'restaurant' ? '🍽️' : '📍'}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--khaki-200)' }}>{p.name}</div>
                  {p.notes && <div style={{ fontSize: 13, color: 'var(--khaki-400)', marginTop: 2 }}>{p.notes}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        <button onClick={onFollow} style={{
          width: '100%', marginTop: 24, padding: 16,
          background: 'var(--green-500)', border: 'none', borderRadius: 14,
          color: 'var(--khaki-100)', fontSize: 17, fontWeight: 700, cursor: 'pointer',
        }}>Follow This Route</button>
      </div>
    </div>
  )
}
