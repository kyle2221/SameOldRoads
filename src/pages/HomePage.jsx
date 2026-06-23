import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import NodeBackground from '../components/NodeBackground'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return ['Night owl driving?', '🌙']
  if (h < 12) return ['Good morning', '☀️']
  if (h < 17) return ['Good afternoon', '🌤️']
  if (h < 21) return ['Good evening', '🌆']
  return ['Late-night run?', '🌕']
}

export default function HomePage() {
  const { trips, places, routes, setTab, followRoute, currentUser, logout } = useStore()
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

      {/* Dark hero */}
      <div style={{
        padding: '50px 20px 32px',
        background: 'linear-gradient(170deg, #100500 0%, #2a0e05 48%, #a03208 82%, #d44810 100%)',
        position: 'relative', overflow: 'hidden', minHeight: 230,
        display: 'flex', flexDirection: 'column',
      }}>
        <NodeBackground color="#ffa04a" count={26} connectDist={90} speed={0.24} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,50,0.18), transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 40, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,20,0.12), transparent 70%)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, filter: 'drop-shadow(0 1px 6px rgba(255,140,40,0.6))' }}>🛣️</span>
            <span style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.55)', fontWeight: 800, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>Same Old Roads</span>
          </div>
          <button
            onClick={() => setShowProfile(p => !p)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
              border: '2px solid rgba(255,255,255,0.25)', color: '#fff',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(239,86,22,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {initials}
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,210,140,0.75)', fontWeight: 700, marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
            {greetIcon} {greetText}, {firstName}
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 0.96, letterSpacing: -0.5, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
            Where Will the<br />Road Take You?
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
            Track · Explore · Remember
          </p>
        </div>
      </div>

      {/* Profile popover */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setShowProfile(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 86, right: 16,
              background: '#fff', borderRadius: 20,
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
              border: '1px solid var(--border)', padding: '18px 20px', minWidth: 228, zIndex: 201,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ff8a52, #ef5616)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{currentUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 1 }}>{currentUser?.email || 'Guest account'}</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 13 }} />
            <button
              onClick={() => { setShowProfile(false); logout() }}
              style={{ width: '100%', padding: '11px 0', borderRadius: 13, background: '#fff8f6', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Stats 2×2 grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '20px 16px 8px' }}>
        {[
          { icon: '🏁', label: 'Trips', value: trips.length },
          { icon: '🛣️', label: 'Miles', value: formatDistance(totalDist) },
          { icon: '🍽️', label: 'Restaurants', value: restaurants.length },
          { icon: '📍', label: 'Spots', value: destinations.length },
        ].map(s => (
          <div key={s.label} style={{
            width: 'calc(50% - 5px)',
            background: 'var(--surface)', borderRadius: 18,
            padding: '16px 18px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{
              fontSize: 30, fontWeight: 900, letterSpacing: -0.5,
              fontFamily: "'Rajdhani', sans-serif",
              background: 'linear-gradient(135deg, #ff8a52, #e84d0e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, marginTop: 2, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>Quick Start</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn
            icon="🚗" label="Start Trip" sub="Track your route"
            onClick={() => setTab('map')} accent
          />
          <QuickBtn
            icon="🧭" label="Explore" sub="Find routes"
            onClick={() => setTab('routes')}
          />
          <QuickBtn
            icon="⭐" label="Places" sub="My saved spots"
            onClick={() => setTab('places')}
          />
        </div>
      </div>

      {/* Featured Routes */}
      {featuredRoutes.length > 0 && (
        <Section title="Featured Routes" action="See all" onAction={() => setTab('routes')}>
          <div style={{ display: 'flex', gap: 13, overflowX: 'auto', paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
            {featuredRoutes.map(route => (
              <HomeRouteCard key={route.id} route={route} onFollow={() => followRoute(route)} />
            ))}
          </div>
        </Section>
      )}

      {/* Recent trips */}
      {recentTrips.length > 0 && (
        <Section title="Recent Trips" action="See all" onAction={() => setTab('trips')}>
          <div style={{ padding: '0 16px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
              {recentTrips.map((trip, i) => (
                <TripRow key={trip.id} trip={trip} last={i === recentTrips.length - 1} places={places} />
              ))}
            </div>
          </div>
        </Section>
      )}

      {trips.length === 0 && featuredRoutes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 24px 50px' }}>
          <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.6 }}>🛣️</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Start your first adventure</div>
          <div style={{ fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
            Tap Track to begin recording your journey.
          </div>
        </div>
      )}

      <div style={{ height: 28 }} />
    </div>
  )
}

function QuickBtn({ icon, label, sub, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '16px 8px 14px',
      background: accent ? 'linear-gradient(145deg, #ff8a52, #ef5616)' : 'var(--surface)',
      border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
      borderRadius: 20, color: accent ? '#fff' : 'var(--text)', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      boxShadow: accent ? '0 6px 22px rgba(239,86,22,0.36)' : 'var(--shadow-soft)',
      transition: 'transform 0.12s',
    }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 10, opacity: accent ? 0.7 : 0, color: accent ? '#fff' : 'var(--text-mute)', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  )
}

function Section({ title, action, onAction, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{title}</div>
        {action && (
          <button onClick={onAction} style={{ background: 'none', border: 'none', color: 'var(--orange-deep)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {action} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function HomeRouteCard({ route, onFollow }) {
  return (
    <div style={{ minWidth: 200, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', flexShrink: 0, background: 'var(--surface)' }}>
      {/* Dark image header */}
      <div style={{
        height: 108, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(150deg, #180800 0%, ${route.coverColor || '#ff7a3c'} 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '10px 13px',
      }}>
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '3px 9px' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>
            {formatDistance(route.distance || 0)}
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.2, lineHeight: 1.05, textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
          {route.name}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>by {route.author}</div>
      </div>
      {/* CTA */}
      <div style={{ padding: '10px 12px' }}>
        <button onClick={onFollow} style={{
          width: '100%', padding: '9px 0',
          background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)',
          borderRadius: 11, color: 'var(--orange-deep)', fontSize: 12, fontWeight: 800, cursor: 'pointer',
        }}>
          Follow Route →
        </button>
      </div>
    </div>
  )
}

function TripRow({ trip, last, places }) {
  const stops = places.filter(p => p.tripId === trip.id)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--border-soft)', gap: 13,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: 'linear-gradient(145deg, #fff1e8, #ffe0cc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
      }}>🚗</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
          {formatDate(trip.createdAt)}
          {stops.length > 0 && <span style={{ color: 'var(--text-soft)' }}> · {stops.length} stop{stops.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--orange-deep)', letterSpacing: -0.4 }}>{formatDistance(trip.distance || 0)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>{formatDuration(trip.duration || 0)}</div>
      </div>
    </div>
  )
}
