import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import RouteMap from '../components/RouteMap'

export default function RoutesPage() {
  const { routes, followRoute, saveOwnRoute, trips, places } = useStore()
  const [tab, setTab] = useState('discover')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)

  const communityRoutes = routes.filter(r => !r.isOwn)
  const myRoutes = routes.filter(r => r.isOwn)

  async function handleCreateFromTrip(trip) {
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    await saveOwnRoute({
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
      places: tripPlaces,
    })
    setShowCreate(false)
  }

  if (selected) {
    return <RouteDetail route={selected} onBack={() => setSelected(null)} onFollow={() => { followRoute(selected); setSelected(null) }} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        padding: '54px 20px 28px',
        background: 'linear-gradient(170deg, #0e0500 0%, #1e0a02 45%, #7a2606 80%, #c43d0c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.2), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,80,20,0.12), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,200,140,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Explore</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif" }}>Routes</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,220,180,0.55)', fontWeight: 500 }}>Discover curated trips or share your own</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '14px 16px 18px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
        {[['discover', 'Discover'], ['mine', 'My Routes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '10px 0', borderRadius: 11,
            background: tab === id ? '#fff' : 'transparent',
            border: 'none', color: tab === id ? 'var(--orange-deep)' : 'var(--text-soft)',
            fontSize: 14, fontWeight: tab === id ? 800 : 600, cursor: 'pointer',
            boxShadow: tab === id ? 'var(--shadow-soft)' : 'none',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {communityRoutes.map(r => (
            <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />
          ))}
        </div>
      )}

      {tab === 'mine' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => setShowCreate(true)} style={{
            width: '100%', padding: 16, background: 'var(--orange-wash)',
            border: '1.5px dashed var(--orange-light)', borderRadius: 16,
            color: 'var(--orange-deep)', fontSize: 15, fontWeight: 800, cursor: 'pointer',
          }}>+ Create Route from Trip</button>
          {myRoutes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-mute)' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.7 }}>🛣️</div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>No routes yet. Complete a trip and save it as a shareable route!</div>
            </div>
          )}
          {myRoutes.map(r => (
            <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />
          ))}
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,20,25,0.45)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(2px)' }} onClick={() => setShowCreate(false)}>
          <div style={{ width: '100%', background: 'var(--surface)', borderRadius: '24px 24px 0 0', padding: '18px 20px calc(20px + env(safe-area-inset-bottom,0px))', boxShadow: 'var(--shadow-pop)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Choose a Trip</div>
            {trips.length === 0 && <div style={{ color: 'var(--text-mute)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No trips yet</div>}
            {trips.map(t => (
              <button key={t.id} onClick={() => handleCreateFromTrip(t)} style={{
                width: '100%', padding: '14px 16px', background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 13, color: 'var(--text)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 8, textAlign: 'left',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>{t.name}</span>
                <span style={{ color: 'var(--orange-deep)', fontSize: 13, fontWeight: 800 }}>{formatDistance(t.distance || 0)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}

function RouteCard({ route, onTap, onFollow }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', cursor: 'pointer' }} onClick={onTap}>
      {/* Dark gradient hero with text inside */}
      <div style={{
        height: 118,
        background: `linear-gradient(150deg, #180800 0%, ${route.coverColor || '#ff7a3c'} 100%)`,
        position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 15px 14px',
      }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: '#fff', letterSpacing: -0.2, lineHeight: 1.05, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>{route.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.58)', marginTop: 3, fontWeight: 500 }}>by {route.author}</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '5px 11px', border: '1px solid rgba(255,255,255,0.14)', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{formatDistance(route.distance)}</div>
        </div>
        {route.isOwn && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.92)', color: 'var(--orange-deep)', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, letterSpacing: 0.5 }}>YOURS</span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 15px 14px' }}>
        {route.description && (
          <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {route.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600 }}>{route.places?.length || 0} stops</span>
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600 }}>{formatDuration(route.duration)}</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={e => { e.stopPropagation(); onFollow() }}
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 10px rgba(239,86,22,0.3)' }}
          >
            Follow
          </button>
        </div>
      </div>
    </div>
  )
}

function RouteDetail({ route, onBack, onFollow }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* TRAK-style dark hero with route name */}
      <div style={{
        minHeight: 230, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(165deg, #120600 0%, ${route.coverColor || '#ff7a3c'} 70%, #ef5616 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '70px 20px 22px',
      }}>
        {/* Radial shine */}
        <div style={{ position: 'absolute', top: -40, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.09), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.25), transparent)', pointerEvents: 'none' }} />

        <button onClick={onBack} style={{
          position: 'absolute', top: 50, left: 16,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12,
          color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,200,140,0.6)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif" }}>
            by {route.author}
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: -0.4, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
            {route.name}
          </h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            {formatDate(route.createdAt)}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Distance', value: formatDistance(route.distance) },
          { label: 'Duration', value: formatDuration(route.duration) },
          { label: 'Places', value: route.places?.length || 0 },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, padding: '14px 0', textAlign: 'center', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--orange-deep)', letterSpacing: -0.3, fontFamily: "'Rajdhani', sans-serif" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2, fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 16px' }}>
        {route.description && (
          <p style={{ margin: '0 0 20px', color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.7 }}>{route.description}</p>
        )}

        {/* Map */}
        <div style={{ marginBottom: 22, borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <RouteMap path={route.path} places={route.places} height={218} interactive />
        </div>

        {/* Stops */}
        {route.places?.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-mute)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.3 }}>Stops Along the Way</div>
            <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: '4px 16px', marginBottom: 24 }}>
              {route.places.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', gap: 14, padding: '13px 0', alignItems: 'flex-start', borderBottom: i === route.places.length - 1 ? 'none' : '1px solid var(--border-soft)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {p.type === 'restaurant' ? '🍽️' : '📍'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                    {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3, lineHeight: 1.55 }}>{p.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={onFollow} style={{
          width: '100%', padding: 17,
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', borderRadius: 16,
          color: '#fff', fontSize: 19, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.6,
          boxShadow: '0 8px 24px rgba(239,86,22,0.38)',
          fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase',
        }}>
          Follow This Route →
        </button>
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
