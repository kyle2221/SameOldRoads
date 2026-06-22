import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate } from '../utils/format'

export default function HomePage() {
  const { trips, places, routes, setTab, followRoute } = useStore()
  const recentTrips = [...trips].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const totalTrips = trips.length
  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--green-950)' }}>
      {/* Header */}
      <div style={{
        padding: '48px 20px 20px',
        background: 'linear-gradient(180deg, var(--green-800) 0%, var(--green-950) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <RoadIcon />
          <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--khaki-400)', textTransform: 'uppercase' }}>Same Old Roads</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--khaki-100)', lineHeight: 1.2 }}>
          Where will the<br />road take you?
        </h1>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        margin: '0 16px 20px',
        background: 'var(--green-800)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--green-600)',
      }}>
        {[
          { label: 'Trips', value: totalTrips },
          { label: 'Distance', value: formatDistance(totalDist) },
          { label: 'Restaurants', value: restaurants.length },
          { label: 'Spots', value: destinations.length },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '14px 4px',
            textAlign: 'center',
            borderRight: i < 3 ? '1px solid var(--green-600)' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--khaki-200)' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--khaki-400)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--khaki-400)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Quick Start</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <QuickBtn icon="🗺️" label="Start Tracking" onClick={() => setTab('map')} accent />
          <QuickBtn icon="📍" label="Explore Routes" onClick={() => setTab('routes')} />
          <QuickBtn icon="⭐" label="My Places" onClick={() => setTab('places')} />
        </div>
      </div>

      {/* Featured routes */}
      <Section title="Featured Routes" action="See all" onAction={() => setTab('routes')}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, paddingLeft: 16, paddingRight: 16 }}>
          {routes.filter(r => !r.isOwn).map(route => (
            <RouteCard key={route.id} route={route} onFollow={() => followRoute(route)} />
          ))}
        </div>
      </Section>

      {/* Recent trips */}
      {recentTrips.length > 0 && (
        <Section title="Recent Trips" action="See all" onAction={() => setTab('trips')}>
          <div style={{ padding: '0 16px' }}>
            {recentTrips.map(trip => (
              <TripRow key={trip.id} trip={trip} />
            ))}
          </div>
        </Section>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}

function QuickBtn({ icon, label, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      flex: 1,
      padding: '14px 8px',
      background: accent ? 'var(--green-600)' : 'var(--green-800)',
      border: `1px solid ${accent ? 'var(--green-400)' : 'var(--green-600)'}`,
      borderRadius: 14,
      color: accent ? 'var(--khaki-100)' : 'var(--khaki-300)',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{label}</span>
    </button>
  )
}

function Section({ title, action, onAction, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--khaki-200)' }}>{title}</div>
        {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: 'var(--green-300)', fontSize: 13, cursor: 'pointer' }}>{action}</button>}
      </div>
      {children}
    </div>
  )
}

function RouteCard({ route, onFollow }) {
  return (
    <div style={{
      minWidth: 200,
      background: 'var(--green-800)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--green-600)',
      flexShrink: 0,
    }}>
      <div style={{ height: 80, background: `linear-gradient(135deg, ${route.coverColor || 'var(--green-700)'}, var(--green-900))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 36 }}>🛣️</span>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--khaki-200)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{route.name}</div>
        <div style={{ fontSize: 11, color: 'var(--khaki-400)', marginBottom: 8 }}>by {route.author} · {formatDistance(route.distance)}</div>
        <button onClick={onFollow} style={{
          width: '100%',
          padding: '8px 0',
          background: 'var(--green-600)',
          border: 'none',
          borderRadius: 8,
          color: 'var(--khaki-100)',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}>Follow Route</button>
      </div>
    </div>
  )
}

function TripRow({ trip }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid var(--green-800)',
      gap: 12,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚗</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--khaki-200)' }}>{trip.name}</div>
        <div style={{ fontSize: 12, color: 'var(--khaki-400)' }}>{formatDate(trip.createdAt)}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--khaki-300)' }}>{formatDistance(trip.distance || 0)}</div>
        <div style={{ fontSize: 11, color: 'var(--khaki-400)' }}>{formatDuration(trip.duration || 0)}</div>
      </div>
    </div>
  )
}

function RoadIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--khaki-400)" strokeWidth={2}>
      <path d="M3 17l3-10 3 3 3-7 3 3 3-6"/>
    </svg>
  )
}
