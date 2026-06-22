import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'
import NodeBackground from '../components/NodeBackground'

export default function HomePage() {
  const { trips, places, routes, setTab, followRoute, currentUser, logout } = useStore()
  const [showProfile, setShowProfile] = useState(false)
  const recentTrips = [...trips].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const totalTrips = trips.length
  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')

  const firstName = currentUser?.name?.split(' ')[0] || 'Explorer'
  const initials = currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        padding: '52px 20px 28px',
        background: 'linear-gradient(180deg, #ffd0aa 0%, #ffe4d0 40%, #fff7f2 75%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 210,
      }}>
        <NodeBackground color="#ff8c3c" count={28} connectDist={95} speed={0.28} />
        <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.42), transparent 70%)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, filter: 'drop-shadow(0 1px 4px rgba(255,100,0,0.4))' }}>🛣️</span>
            <span style={{ fontSize: 12, letterSpacing: 1.2, color: 'var(--text)', fontWeight: 800, textTransform: 'uppercase' }}>Same Old Roads</span>
          </div>
          <button
            onClick={() => setShowProfile(p => !p)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
              border: '2.5px solid rgba(255,255,255,0.9)', color: '#fff',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(239,86,22,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {initials}
          </button>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 13, color: 'var(--orange-deep)', fontWeight: 700, marginBottom: 4 }}>
            Hey, {firstName} 👋
          </div>
          <h1 style={{ margin: 0, fontSize: 31, fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, letterSpacing: -1 }}>
            Where will the<br />road take you?
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.5, maxWidth: 290 }}>
            Track trips, follow curated routes, save places worth remembering.
          </p>
        </div>
      </div>

      {/* Profile popover */}
      {showProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setShowProfile(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 90, right: 16, background: '#fff',
              borderRadius: 18, boxShadow: '0 10px 40px rgba(0,0,0,0.16)',
              border: '1px solid var(--border)', padding: '18px 20px', minWidth: 220, zIndex: 101,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #ff8a52, #ef5616)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{currentUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{currentUser?.email || 'Guest account'}</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
            <button
              onClick={() => { setShowProfile(false); logout() }}
              style={{ width: '100%', padding: '11px 0', borderRadius: 12, background: '#fff8f6', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Stats card */}
      <div style={{
        display: 'flex', margin: '4px 16px 24px',
        background: 'var(--surface)', borderRadius: 20, overflow: 'hidden',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
      }}>
        {[
          { label: 'Trips', value: totalTrips },
          { label: 'Distance', value: formatDistance(totalDist) },
          { label: 'Food', value: restaurants.length },
          { label: 'Spots', value: destinations.length },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '16px 4px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border-soft)' : 'none' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--orange-deep)', letterSpacing: -0.5 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 3, fontWeight: 600, letterSpacing: 0.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 16px 26px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 11, fontWeight: 700 }}>Quick Start</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn icon="🗺️" label="Start Tracking" onClick={() => setTab('map')} accent />
          <QuickBtn icon="🧭" label="Explore Routes" onClick={() => setTab('routes')} />
          <QuickBtn icon="⭐" label="My Places" onClick={() => setTab('places')} />
        </div>
      </div>

      {/* Featured routes */}
      <Section title="Featured Routes" action="See all" onAction={() => setTab('routes')}>
        <div style={{ display: 'flex', gap: 13, overflowX: 'auto', paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
          {routes.filter(r => !r.isOwn).map(route => (
            <RouteCard key={route.id} route={route} onFollow={() => followRoute(route)} />
          ))}
        </div>
      </Section>

      {/* Recent trips */}
      {recentTrips.length > 0 && (
        <Section title="Recent Trips" action="See all" onAction={() => setTab('trips')}>
          <div style={{ padding: '0 16px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', padding: '4px 16px' }}>
              {recentTrips.map((trip, i) => (
                <TripRow key={trip.id} trip={trip} last={i === recentTrips.length - 1} />
              ))}
            </div>
          </div>
        </Section>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}

function QuickBtn({ icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '16px 8px',
      background: accent ? 'linear-gradient(135deg, #ff8a52, #ef5616)' : 'var(--surface)',
      border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
      borderRadius: 18, color: accent ? '#fff' : 'var(--text)', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      boxShadow: accent ? '0 6px 18px rgba(239,86,22,0.32)' : 'var(--shadow-soft)',
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
    </button>
  )
}

function Section({ title, action, onAction, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 13 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>{title}</div>
        {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{action} →</button>}
      </div>
      {children}
    </div>
  )
}

function RouteCard({ route, onFollow }) {
  return (
    <div style={{ minWidth: 214, background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', flexShrink: 0 }}>
      <div style={{ height: 88, background: `linear-gradient(135deg, ${route.coverColor || '#ff8a52'}, #ef5616)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 38 }}>🛣️</span>
        <span style={{ position: 'absolute', top: 9, right: 9, background: 'rgba(255,255,255,0.92)', color: 'var(--orange-deep)', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20 }}>
          {formatDistance(route.distance)}
        </span>
      </div>
      <div style={{ padding: 13 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginBottom: 11 }}>by {route.author}</div>
        <button onClick={onFollow} style={{ width: '100%', padding: '9px 0', background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)', borderRadius: 11, color: 'var(--orange-deep)', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
          Follow Route
        </button>
      </div>
    </div>
  )
}

function TripRow({ trip, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: last ? 'none' : '1px solid var(--border-soft)', gap: 13 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚗</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{trip.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{formatDate(trip.createdAt)}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange-deep)' }}>{formatDistance(trip.distance || 0)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{formatDuration(trip.duration || 0)}</div>
      </div>
    </div>
  )
}
