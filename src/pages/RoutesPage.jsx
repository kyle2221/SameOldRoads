import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import RouteMap from '../components/RouteMap'
import RouteThumb from '../components/RouteThumb'
import { IconRoad, IconUtensils, IconPin, IconClock, IconFlag } from '../components/Icons'

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
        padding: '54px 20px 56px',
        background: 'linear-gradient(170deg, #0e0500 0%, #1e0a02 45%, #7a2606 80%, #c43d0c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.2), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(255,200,140,0.6)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Explore</div>
          <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -0.5, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>Routes</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,220,180,0.55)', fontWeight: 500 }}>Discover curated trips or share your own</p>
        </div>
      </div>

      <div className="hero-to-content">
        {/* Tabs */}
        <div style={{ display: 'flex', margin: '20px 16px 18px', background: 'var(--sunk)', borderRadius: 14, padding: 4, gap: 4 }}>
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
                <IconRoad size={40} color="rgba(0,0,0,0.18)" />
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 12 }}>No routes yet. Complete a trip and save it as a shareable route!</div>
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
    </div>
  )
}

function RouteCard({ route, onTap, onFollow }) {
  return (
    <div className="pressable" style={{ background: 'var(--surface)', borderRadius: 22, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }} onClick={onTap}>
      {/* Hero: dark gradient → RouteThumb art → optional photo */}
      <div style={{
        height: 158, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(150deg, #100600 0%, #2a0d03 50%, ${route.coverColor || '#c43d0c'} 100%)`,
      }}>
        {/* Route line art always rendered */}
        {route.path?.length > 1 && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
            <RouteThumb path={route.path} height={158} flat />
          </div>
        )}
        {/* Photo overlay */}
        {route.photo && (
          <img
            src={route.photo} alt={route.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(8,3,0,0.78) 100%)', pointerEvents: 'none' }} />

        {route.isOwn && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.95)', color: 'var(--orange-deep)', fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 20, letterSpacing: 0.8 }}>YOURS</span>
        )}
        {/* Distance chip */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderRadius: 10, padding: '5px 10px', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif" }}>{formatDistance(route.distance)}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 14, left: 15, right: 15 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.2, lineHeight: 1.05, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{route.name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,200,160,0.7)', marginTop: 3, fontWeight: 600, letterSpacing: 0.3 }}>by {route.author}</div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '13px 15px 15px' }}>
        {route.description && (
          <div style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 11, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {route.description}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconFlag size={12} color="var(--text-mute)" sw={2} />
            <span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 700 }}>{route.places?.length || 0} stops</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconClock size={12} color="var(--text-mute)" sw={2} />
            <span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 700 }}>{formatDuration(route.duration)}</span>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={e => { e.stopPropagation(); onFollow() }}
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', borderRadius: 11, color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 3px 12px rgba(239,86,22,0.35)', letterSpacing: 0.3 }}
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
      {/* Hero — gradient always shown, photo overlaid */}
      <div style={{
        minHeight: 230, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(165deg, #120600 0%, ${route.coverColor || '#ff7a3c'} 70%, #ef5616 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '70px 20px 22px',
      }}>
        {route.photo && (
          <img
            src={route.photo} alt={route.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(10,3,0,0.82) 100%)', pointerEvents: 'none' }} />

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
          { label: 'Places',   value: route.places?.length || 0 },
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
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.type === 'restaurant'
                      ? <IconUtensils size={18} color="var(--orange-deep)" sw={1.8} />
                      : <IconPin size={18} color="var(--orange-deep)" sw={1.8} />
                    }
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
