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
    const route = {
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
    }
    await saveOwnRoute(route)
    setShowCreate(false)
  }

  if (selected) {
    return <RouteDetail route={selected} onBack={() => setSelected(null)} onFollow={() => { followRoute(selected); setSelected(null) }} />
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <Header title="Routes" subtitle="Discover curated trips or share your own" />

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 16px 18px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
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
            <EmptyState icon="🛣️" text="No routes yet. Complete a trip and save it as a shareable route!" />
          )}
          {myRoutes.map(r => (
            <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />
          ))}
        </div>
      )}

      {showCreate && (
        <Sheet title="Choose a Trip" onClose={() => setShowCreate(false)}>
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
        </Sheet>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}

function Header({ title, subtitle }) {
  return (
    <div style={{
      padding: '54px 20px 24px',
      background: 'linear-gradient(180deg, #ffd9c2 0%, #ffe9dc 45%, #ffffff 100%)',
      marginBottom: 18,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -90, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.45), rgba(255,122,60,0))' }} />
      <h1 style={{ margin: '0 0 5px', fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.6, position: 'relative' }}>{title}</h1>
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', position: 'relative' }}>{subtitle}</p>
    </div>
  )
}

function RouteCard({ route, onTap, onFollow }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 20, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
    }} onClick={onTap}>
      <div style={{
        height: 108, background: `linear-gradient(135deg, ${route.coverColor || '#ff8a52'} 0%, #ef5616 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, position: 'relative',
      }}>
        🛣️
        {route.isOwn && <span style={{ position: 'absolute', top: 10, right: 10, background: '#fff', color: 'var(--orange-deep)', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20 }}>YOURS</span>}
      </div>
      <div style={{ padding: '14px 15px' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4, letterSpacing: -0.3 }}>{route.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 11, fontWeight: 500 }}>
          by {route.author} · {formatDate(route.createdAt)}
        </div>
        {route.description && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 13, lineHeight: 1.55 }}>{route.description}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 11, padding: '7px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{formatDistance(route.distance)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 600 }}>distance</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 11, padding: '7px 0' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{route.places?.length || 0}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 600 }}>places</div>
          </div>
          <button onClick={e => { e.stopPropagation(); onFollow() }} style={{
            flex: 2, padding: '8px 0', background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: 'none', borderRadius: 11, color: 'var(--on-orange)',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,86,22,0.28)',
          }}>Follow</button>
        </div>
      </div>
    </div>
  )
}

function RouteDetail({ route, onBack, onFollow }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{
        height: 150, background: `linear-gradient(150deg, ${route.coverColor || '#ff8a52'} 0%, #ef5616 100%)`,
        display: 'flex', alignItems: 'flex-end', position: 'relative',
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 50, left: 16,
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 12,
          color: 'var(--text)', width: 38, height: 38, fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-soft)',
        }}>←</button>
        <span style={{ fontSize: 60, padding: '0 0 16px 20px' }}>🛣️</span>
      </div>
      <div style={{ padding: 20 }}>
        <h2 style={{ margin: '0 0 5px', fontSize: 25, color: 'var(--text)', fontWeight: 800, letterSpacing: -0.5 }}>{route.name}</h2>
        <p style={{ margin: '0 0 16px', color: 'var(--text-mute)', fontSize: 14, fontWeight: 500 }}>by {route.author} · {formatDate(route.createdAt)}</p>
        {route.description && <p style={{ margin: '0 0 18px', color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.65 }}>{route.description}</p>}

        {/* Live map preview with orange road-following line */}
        <div style={{ marginBottom: 20, boxShadow: 'var(--shadow-card)', borderRadius: 18 }}>
          <RouteMap path={route.path} places={route.places} height={210} interactive />
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Distance', value: formatDistance(route.distance) },
            { label: 'Duration', value: formatDuration(route.duration) },
            { label: 'Places', value: route.places?.length || 0 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'var(--surface)', borderRadius: 14, padding: '12px 6px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--orange-deep)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {route.places?.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-soft)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1.2 }}>Stops Along the Way</div>
            <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: '4px 16px' }}>
              {route.places.map((p, i) => (
                <div key={p.id} style={{
                  display: 'flex', gap: 13, padding: '13px 0', alignItems: 'flex-start',
                  borderBottom: i === route.places.length - 1 ? 'none' : '1px solid var(--border-soft)',
                }}>
                  <span style={{ fontSize: 24 }}>{p.type === 'restaurant' ? '🍽️' : '📍'}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{p.name}</div>
                    {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3, lineHeight: 1.5 }}>{p.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={onFollow} style={{
          width: '100%', marginTop: 24, padding: 16,
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', borderRadius: 16,
          color: 'var(--on-orange)', fontSize: 17, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(239,86,22,0.32)',
        }}>Follow This Route</button>
        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}

function Sheet({ title, children, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,20,25,0.4)', zIndex: 2000,
      display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '18px 20px calc(20px + env(safe-area-inset-bottom,0px))',
        boxShadow: 'var(--shadow-pop)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 16px' }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-mute)' }}>
      <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.7 }}>{icon}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  )
}
