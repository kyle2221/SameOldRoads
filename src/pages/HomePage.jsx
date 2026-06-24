import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import NodeBackground from '../components/NodeBackground'
import { SectionLabel } from '../components/ui'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return ['Night owl driving?', '🌙']
  if (h < 12) return ['Good morning', '☀️']
  if (h < 17) return ['Good afternoon', '🌤️']
  if (h < 21) return ['Good evening', '🌆']
  return ['Late-night run?', '🌕']
}

function AnimatedNumber({ value, format }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    prevRef.current = to
    if (from === to) { setDisplay(to); return }
    if (typeof to !== 'number' || !isFinite(to)) { setDisplay(to); return }
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setDisplay(to); return }
    const start = performance.now()
    const dur = 700
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  if (typeof display === 'number' && format) return <>{format(display)}</>
  return <>{display}</>
}

export default function HomePage() {
  const { trips, places, routes, setTab, followRoute, currentUser, logout, activeTrip, trackingActive } = useStore()
  const [showProfile, setShowProfile] = useState(false)

  const recentTrips = [...trips].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')
  const firstName = currentUser?.name?.split(' ')[0] || 'Explorer'
  const initials = currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const [greetText, greetIcon] = getTimeGreeting()
  const featuredRoutes = routes.filter(r => !r.isOwn)

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        padding: '50px 20px 32px',
        background: 'var(--hero-grad)',
        position: 'relative', overflow: 'hidden',
        minHeight: 240, display: 'flex', flexDirection: 'column',
      }}>
        <NodeBackground color="#ffa04a" count={26} connectDist={90} speed={0.24} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,50,0.2), transparent 68%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, filter: 'drop-shadow(0 1px 6px rgba(255,140,40,0.6))' }}>🛣️</span>
            <span style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>Same Old Roads</span>
          </div>
          <button onClick={() => setShowProfile(p => !p)} className="pressable" style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: '2px solid rgba(255,255,255,0.25)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(239,86,22,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)',
          }}>{initials}</button>
        </div>

        <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,210,140,0.75)', fontWeight: 600, marginBottom: 8, letterSpacing: 0.3 }}>{greetIcon} {greetText}, {firstName}</div>
          <h1 style={{
            margin: '0 0 10px', fontSize: 34, fontWeight: 700, color: '#fff',
            lineHeight: 1.04, letterSpacing: -1.2,
            fontFamily: 'var(--font-display)',
          }}>Where will the<br />road take you?</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, letterSpacing: 0.3 }}>Track · Explore · Remember</p>
        </div>
      </div>

      {/* Profile dropdown */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setShowProfile(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: 86, right: 16,
            background: 'var(--surface)', borderRadius: 20,
            boxShadow: 'var(--shadow-pop)', border: '1px solid var(--border)',
            padding: '18px 20px', minWidth: 228, zIndex: 201,
            animation: 'scaleIn 0.18s ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 16,
                fontFamily: 'var(--font-display)',
              }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{currentUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 1 }}>{currentUser?.email || 'Guest account'}</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 13 }} />
            <button onClick={() => { setShowProfile(false); logout() }} className="pressable" style={{ width: '100%', padding: '11px 0', borderRadius: 13, background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>
      )}

      {/* Continue trip banner */}
      {trackingActive && activeTrip && (
        <div
          onClick={() => setTab('map')}
          className="pressable fade-in"
          style={{
            margin: '16px 16px 0', padding: '14px 16px', borderRadius: 18,
            background: 'linear-gradient(135deg, var(--orange-wash), var(--orange-tint))',
            border: '1px solid var(--orange-tint)',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#fff', boxShadow: 'var(--shadow-orange)',
          }}>🚗</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--orange-deep)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: 'var(--font-display)' }}>● Trip in progress</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 1 }}>{activeTrip.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--orange-deep)', fontFamily: 'var(--font-mono)' }}>{formatDistance(activeTrip.distance || 0)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 1 }}>tap to resume</div>
          </div>
        </div>
      )}

      {/* Stat grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '20px 16px 8px' }}>
        {[
          { icon: '🏁', label: 'Trips', value: trips.length, format: (v) => String(Math.round(v)) },
          { icon: '🛣️', label: 'Distance', value: totalDist, format: formatDistance },
          { icon: '🍽️', label: 'Restaurants', value: restaurants.length, format: (v) => String(Math.round(v)) },
          { icon: '📍', label: 'Spots', value: destinations.length, format: (v) => String(Math.round(v)) },
        ].map((s, i) => (
          <div key={s.label} style={{
            width: 'calc(50% - 5px)', background: 'var(--surface)',
            borderRadius: 20, padding: '16px 18px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
            position: 'relative', overflow: 'hidden',
            animation: `fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${i * 50}ms`,
          }}>
            {/* subtle corner glow */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-glow), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 20, marginBottom: 6, opacity: 0.9 }}>{s.icon}</div>
            <div className="text-gradient" style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, fontFamily: 'var(--font-display)' }}>
              <AnimatedNumber value={s.value} format={s.format} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600, marginTop: 2, letterSpacing: 0.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div style={{ padding: '16px 16px 24px' }}>
        <SectionLabel style={{ marginBottom: 12 }}>Quick Start</SectionLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn icon="🚗" label="Start Trip" sub="Track your route" onClick={() => setTab('map')} accent />
          <QuickBtn icon="🧭" label="Discover" sub="Find places + reviews" onClick={() => setTab('discover')} />
          <QuickBtn icon="📊" label="Stats" sub="Your numbers" onClick={() => setTab('stats')} />
        </div>
      </div>

      {/* Featured routes */}
      {featuredRoutes.length > 0 && (
        <Section title="Featured Routes" action="See all" onAction={() => setTab('routes')}>
          <div style={{ display: 'flex', gap: 13, overflowX: 'auto', paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
            {featuredRoutes.map(route => <HomeRouteCard key={route.id} route={route} onFollow={() => followRoute(route)} />)}
          </div>
        </Section>
      )}

      {/* Recent trips */}
      {recentTrips.length > 0 && (
        <Section title="Recent Trips" action="See all" onAction={() => setTab('trips')}>
          <div style={{ padding: '0 16px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              {recentTrips.map((trip, i) => <TripRow key={trip.id} trip={trip} last={i === recentTrips.length - 1} places={places} />)}
            </div>
          </div>
        </Section>
      )}

      {trips.length === 0 && featuredRoutes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 24px 50px' }}>
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>🛣️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Start your first adventure</div>
          <div style={{ fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>Tap Track to begin recording your journey.</div>
        </div>
      )}
      <div style={{ height: 28 }} />
    </div>
  )
}

function QuickBtn({ icon, label, sub, onClick, accent }) {
  return (
    <button onClick={onClick} className="pressable" style={{
      flex: 1, padding: '16px 8px 14px',
      background: accent ? 'linear-gradient(145deg, #ff8a52, #ef5616)' : 'var(--surface)',
      border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
      borderRadius: 20,
      color: accent ? '#fff' : 'var(--text)',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      boxShadow: accent ? 'var(--shadow-orange)' : 'var(--shadow-soft)',
    }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{label}</div>
        <div style={{ fontSize: 10, opacity: accent ? 0.75 : 0, color: accent ? '#fff' : 'var(--text-mute)', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  )
}

function Section({ title, action, onAction, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.4, fontFamily: 'var(--font-display)' }}>{title}</div>
        {action && <button onClick={onAction} className="pressable" style={{ background: 'none', border: 'none', color: 'var(--orange-deep)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>{action} →</button>}
      </div>
      {children}
    </div>
  )
}

function HomeRouteCard({ route, onFollow }) {
  return (
    <div style={{ minWidth: 210, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', flexShrink: 0, background: 'var(--surface)' }}>
      <div style={{
        height: 112, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(150deg, #180800 0%, ${route.coverColor || '#ff7a3c'} 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 13px',
      }}>
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '3px 9px' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatDistance(route.distance || 0)}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.4, lineHeight: 1.2, textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: 'var(--font-display)' }}>{route.name}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>by {route.author}</div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <button onClick={onFollow} className="pressable" style={{ width: '100%', padding: '9px 0', background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)', borderRadius: 11, color: 'var(--orange-deep)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>Follow Route →</button>
      </div>
    </div>
  )
}

function TripRow({ trip, last, places }) {
  const stops = places.filter(p => p.tripId === trip.id)
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: last ? 'none' : '1px solid var(--border-soft)', gap: 13 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'linear-gradient(145deg, var(--orange-wash), var(--orange-tint))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>🚗</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>{trip.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{formatDate(trip.createdAt)}{stops.length > 0 && <span style={{ color: 'var(--text-soft)' }}> · {stops.length} stop{stops.length !== 1 ? 's' : ''}</span>}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange-deep)', letterSpacing: -0.4, fontFamily: 'var(--font-mono)' }}>{formatDistance(trip.distance || 0)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>{formatDuration(trip.duration || 0)}</div>
      </div>
    </div>
  )
}
