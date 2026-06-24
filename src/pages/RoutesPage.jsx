import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import RouteMap from '../components/RouteMap'
import ReviewsPanel from '../components/ReviewsPanel'
import { PageHeader, BottomSheet, EmptyState, Tag } from '../components/ui'

export default function RoutesPage() {
  const { routes, followRoute, saveOwnRoute, trips, places } = useStore()
  const [tab, setTab] = useState('discover')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)

  const communityRoutes = routes.filter(r => !r.isOwn)
  const myRoutes = routes.filter(r => r.isOwn)

  async function handleCreateFromTrip(trip) {
    const tripPlaces = places.filter(p => p.tripId === trip.id)
    await saveOwnRoute({ id: crypto.randomUUID(), name: trip.name, author: 'You', description: '', distance: trip.distance || 0, duration: trip.duration || 0, coverColor: '#ff7a3c', createdAt: Date.now(), isOwn: true, path: trip.path || [], places: tripPlaces })
    setShowCreate(false)
  }

  if (selected) return <RouteDetail route={selected} onBack={() => setSelected(null)} onFollow={() => { followRoute(selected); setSelected(null) }} />

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <PageHeader title="Routes" subtitle="Discover curated trips or share your own" variant="soft" />

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 16px 18px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
        {[['discover', 'Discover'], ['mine', 'My Routes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className="pressable" style={{
            flex: 1, padding: '10px 0', borderRadius: 11,
            background: tab === id ? 'var(--surface)' : 'transparent', border: 'none',
            color: tab === id ? 'var(--orange-deep)' : 'var(--text-soft)',
            fontSize: 14, fontWeight: tab === id ? 700 : 600, cursor: 'pointer',
            boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
            fontFamily: 'var(--font-display)',
            transition: 'all 0.2s ease',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'discover' && (
        <div className="stagger" style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {communityRoutes.map((r, i) => <div key={r.id} style={{ '--i': i }}><RouteCard route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} /></div>)}
        </div>
      )}

      {tab === 'mine' && (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <button onClick={() => setShowCreate(true)} className="pressable" style={{
            width: '100%', padding: 16,
            background: 'var(--orange-wash)', border: '1.5px dashed var(--orange-light)',
            borderRadius: 16, color: 'var(--orange-deep)', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}>+ Create Route from Trip</button>
          {myRoutes.length === 0 && <EmptyState icon="🛣️" title="No routes yet" message="Complete a trip and save it as a shareable route!" />}
          {myRoutes.map(r => <RouteCard key={r.id} route={r} onTap={() => setSelected(r)} onFollow={() => followRoute(r)} />)}
        </div>
      )}

      {showCreate && (
        <BottomSheet title="Choose a Trip" onClose={() => setShowCreate(false)}>
          {trips.length === 0 && <div style={{ color: 'var(--text-mute)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No trips yet</div>}
          {trips.map(t => (
            <button key={t.id} onClick={() => handleCreateFromTrip(t)} className="pressable" style={{
              width: '100%', padding: '14px 16px', background: 'var(--surface-2)',
              border: '1px solid var(--border)', borderRadius: 13, color: 'var(--text)',
              fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 8,
              textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{t.name}</span>
              <span style={{ color: 'var(--orange-deep)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatDistance(t.distance || 0)}</span>
            </button>
          ))}
        </BottomSheet>
      )}
      <div style={{ height: 24 }} />
    </div>
  )
}

function RouteCard({ route, onTap, onFollow }) {
  return (
    <div onClick={onTap} className="pressable" style={{
      background: 'var(--surface)', borderRadius: 22, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', cursor: 'pointer',
    }}>
      <div style={{
        height: 124, position: 'relative',
        background: `linear-gradient(150deg, #0a0300 0%, ${route.coverColor || '#ff7a3c'} 100%)`,
        display: 'flex', alignItems: 'flex-end', padding: '0 15px 14px',
      }}>
        {/* subtle texture overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.08), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ flex: 1, paddingRight: 10, position: 'relative' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.4, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)', fontFamily: 'var(--font-display)' }}>{route.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>by {route.author}</div>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
          borderRadius: 10, padding: '5px 11px',
          border: '1px solid rgba(255,255,255,0.15)', position: 'relative',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{formatDistance(route.distance)}</div>
        </div>
        {route.isOwn && <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.92)', color: 'var(--orange-deep)', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, letterSpacing: 0.5, fontFamily: 'var(--font-display)' }}>YOURS</span>}
      </div>
      <div style={{ padding: '13px 15px 14px' }}>
        {route.description && <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 10, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{route.description}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag>{route.places?.length || 0} stops</Tag>
          <span style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{formatDuration(route.duration)}</span>
          <div style={{ flex: 1 }} />
          <button onClick={e => { e.stopPropagation(); onFollow() }} className="pressable" style={{
            padding: '8px 18px', background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: 'none', borderRadius: 10, color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', boxShadow: 'var(--shadow-orange)',
            fontFamily: 'var(--font-display)',
          }}>Follow</button>
        </div>
      </div>
    </div>
  )
}

function RouteDetail({ route, onBack, onFollow }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }} className="fade-in">
      <div style={{
        minHeight: 240, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(165deg, #0a0300 0%, ${route.coverColor || '#ff7a3c'} 70%, #ef5616 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '70px 20px 22px',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.09), transparent)', pointerEvents: 'none' }} />
        <button onClick={onBack} className="pressable" style={{
          position: 'absolute', top: 50, left: 16,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12,
          color: '#fff', width: 38, height: 38, fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-display)' }}>by {route.author}</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: -0.7, lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{route.name}</h2>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{formatDate(route.createdAt)}</div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {[
          { label: 'Distance', value: formatDistance(route.distance) },
          { label: 'Duration', value: formatDuration(route.duration) },
          { label: 'Places', value: route.places?.length || 0 },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: '14px 0', textAlign: 'center',
            borderRight: i < 2 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange-deep)', letterSpacing: -0.5, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 2, fontFamily: 'var(--font-display)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 16px' }}>
        {route.description && <p style={{ margin: '0 0 20px', color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.7 }}>{route.description}</p>}
        <div style={{ marginBottom: 22, borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <RouteMap path={route.path} places={route.places} height={218} interactive />
        </div>
        {route.places?.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.3, fontFamily: 'var(--font-display)' }}>Stops Along the Way</div>
            <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: '4px 16px', marginBottom: 24 }}>
              {route.places.map((p, i) => <RouteStop key={p.id} p={p} last={i === route.places.length - 1} />)}
            </div>
          </>
        )}
        <button onClick={onFollow} className="pressable" style={{
          width: '100%', padding: 17,
          background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none',
          borderRadius: 16, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          letterSpacing: -0.3, boxShadow: 'var(--shadow-orange-lg)',
          fontFamily: 'var(--font-display)',
        }}>Follow This Route →</button>
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function RouteStop({ p, last }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', gap: 14, padding: '13px 0', alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'var(--orange-wash)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>{p.type === 'restaurant' ? '🍽️' : '📍'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', flex: 1, minWidth: 0, fontFamily: 'var(--font-display)' }}>{p.name}</div>
            <button onClick={() => setOpen((o) => !o)} className="pressable" style={{
              background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)',
              borderRadius: 9, padding: '5px 11px', fontSize: 11, fontWeight: 700,
              color: 'var(--orange-deep)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
              fontFamily: 'var(--font-display)',
            }}>
              {open ? 'Hide' : '★ Reviews'}
            </button>
          </div>
          {p.notes && <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 3, lineHeight: 1.55 }}>{p.notes}</div>}
        </div>
      </div>
      {open && (
        <div style={{ paddingBottom: 14 }} className="fade-in">
          <ReviewsPanel query={`${p.name}`} lat={p.lat} lng={p.lng} limit={3} compact />
        </div>
      )}
    </div>
  )
}
