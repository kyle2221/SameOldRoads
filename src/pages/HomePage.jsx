import { useState } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatDate, formatSpeed } from '../utils/format'
import NodeBackground from '../components/NodeBackground'
import RouteThumb from '../components/RouteThumb'
import ProfileSheet from '../components/ProfileSheet'
import {
  IconCar, IconCompass, IconStar, IconFlag, IconRoad, IconTrophy,
  IconZap, IconClock, IconPin, IconUtensils, IconLock,
} from '../components/Icons'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Night owl driving?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Late-night run?'
}

export default function HomePage() {
  const { trips, places, routes, setTab, followRoute, currentUser, logout, importHealthTrips } = useStore()
  const [showProfile, setShowProfile] = useState(false)

  const recentTrips = [...trips].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const restaurants = places.filter(p => p.type === 'restaurant')
  const destinations = places.filter(p => p.type === 'destination')

  const firstName = currentUser?.name?.split(' ')[0] || 'Explorer'
  const initials = currentUser?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const greetText = getTimeGreeting()
  const featuredRoutes = routes.filter(r => !r.isOwn)
  const totalMiles = Math.round(totalDist / 1609.34)

  const achievements = [
    { Icon: IconFlag,     label: 'First Trip',  sub: 'Hit the road', unlocked: trips.length >= 1 },
    { Icon: IconCompass,  label: 'Trailblazer', sub: '3 trips',       unlocked: trips.length >= 3 },
    { Icon: IconTrophy,   label: 'Century',     sub: '100 miles',     unlocked: totalMiles >= 100 },
    { Icon: IconUtensils, label: 'Foodie',      sub: '3 eats',        unlocked: restaurants.length >= 3 },
    { Icon: IconStar,     label: 'Explorer',    sub: '5 spots',       unlocked: places.length >= 5 },
  ]
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>

      {/* Dark hero */}
      <div style={{
        padding: '50px 20px 56px',
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
            <IconRoad size={18} color="rgba(255,200,120,0.8)" sw={2} />
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
            {greetText}, {firstName}
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 0.96, letterSpacing: -0.5, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
            Where Will the<br />Road Take You?
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
            Track · Explore · Remember
          </p>
        </div>
      </div>

      {/* White content area with orange bleed at top */}
      <div className="hero-to-content">

        {/* Stats 2×2 grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '24px 16px 8px' }}>
          {[
            { Icon: IconFlag,     label: 'Trips',  value: trips.length },
            { Icon: IconRoad,     label: 'Miles',  value: totalMiles },
            { Icon: IconUtensils, label: 'Food',   value: restaurants.length },
            { Icon: IconPin,      label: 'Spots',  value: destinations.length },
          ].map(s => (
            <div key={s.label} style={{
              width: 'calc(50% - 5px)',
              background: 'var(--surface)', borderRadius: 18,
              padding: '16px 18px',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'flex-start', gap: 13,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon size={18} color="var(--orange-deep)" sw={2} />
              </div>
              <div>
                <div style={{
                  fontSize: 32, fontWeight: 900, letterSpacing: -1, lineHeight: 1,
                  fontFamily: "'Rajdhani', sans-serif",
                  background: 'linear-gradient(135deg, #ff8a52, #e84d0e)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, marginTop: 3, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* This Week */}
        <ThisWeek trips={trips} />

        {/* Quick actions */}
        <div style={{ padding: '16px 16px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>Quick Start</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <QuickBtn Icon={IconCar}     label="Start Trip" sub="Track your route" onClick={() => setTab('map')}    accent />
            <QuickBtn Icon={IconCompass} label="Explore"    sub="Find routes"      onClick={() => setTab('routes')} />
            <QuickBtn Icon={IconStar}    label="Places"     sub="My saved spots"   onClick={() => setTab('places')} />
          </div>
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>Achievements</div>
            <div style={{ fontSize: 12, color: 'var(--orange-deep)', fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>{unlockedCount}/{achievements.length}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 4px', scrollbarWidth: 'none' }}>
            {achievements.map(a => <Badge key={a.label} {...a} />)}
          </div>
        </div>

        {/* Featured Routes */}
        {featuredRoutes.length > 0 && (
          <Section title="Featured Routes" action="See all" onAction={() => setTab('routes')}>
            <div style={{ display: 'flex', gap: 13, overflowX: 'auto', paddingBottom: 6, paddingLeft: 16, paddingRight: 16, scrollbarWidth: 'none' }}>
              {featuredRoutes.map(route => (
                <HomeRouteCard key={route.id} route={route} onFollow={() => followRoute(route)} />
              ))}
            </div>
          </Section>
        )}

        {/* Recent trips */}
        {recentTrips.length > 0 && (
          <Section title="Recent Trips" action="See all" onAction={() => setTab('trips')}>
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} places={places} onClick={() => setTab('trips')} />
              ))}
            </div>
          </Section>
        )}

        {trips.length === 0 && featuredRoutes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px 50px' }}>
            <div style={{ display: 'inline-flex', marginBottom: 14 }}>
              <IconRoad size={52} color="rgba(0,0,0,0.15)" />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Start your first adventure</div>
            <div style={{ fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
              Tap Track to begin recording your journey.
            </div>
          </div>
        )}

        <div style={{ height: 28 }} />
      </div>

      {showProfile && (
        <ProfileSheet
          user={currentUser}
          trips={trips}
          places={places}
          onClose={() => setShowProfile(false)}
          onLogout={() => { setShowProfile(false); logout() }}
          onImportHealth={importHealthTrips}
        />
      )}
    </div>
  )
}

function QuickBtn({ Icon, label, sub, onClick, accent }) {
  return (
    <button className="pressable" onClick={onClick} style={{
      flex: 1, padding: '16px 8px 14px',
      background: accent ? 'linear-gradient(145deg, #ff8a52, #ef5616)' : 'var(--surface)',
      border: `1px solid ${accent ? 'transparent' : 'var(--border)'}`,
      borderRadius: 18, color: accent ? '#fff' : 'var(--text)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
      boxShadow: accent ? '0 6px 22px rgba(239,86,22,0.36)' : 'none',
    }}>
      <Icon size={24} color={accent ? '#fff' : 'var(--orange)'} sw={1.8} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 10, color: accent ? 'rgba(255,255,255,0.7)' : 'var(--text-mute)', marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  )
}

function Badge({ Icon, label, sub, unlocked }) {
  return (
    <div style={{
      minWidth: 90, flexShrink: 0, borderRadius: 18, padding: '14px 10px 12px',
      textAlign: 'center',
      background: unlocked ? 'linear-gradient(160deg, #fff4ec, #ffe6d4)' : 'var(--surface)',
      border: `1px solid ${unlocked ? 'var(--orange-tint)' : 'var(--border)'}`,
      opacity: unlocked ? 1 : 0.5,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 7 }}>
        {unlocked
          ? <Icon size={24} color="var(--orange-deep)" sw={2} />
          : <IconLock size={22} color="var(--text-mute)" sw={1.8} />
        }
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, color: unlocked ? 'var(--orange-deep)' : 'var(--text-mute)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 1.1 }}>{label}</div>
      <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-mute)', marginTop: 2, letterSpacing: 0.3 }}>{sub}</div>
    </div>
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
    <div className="pressable" style={{ minWidth: 220, borderRadius: 20, overflow: 'hidden', flexShrink: 0, background: '#180800', boxShadow: '0 4px 20px rgba(0,0,0,0.14)' }}>
      <div style={{
        height: 124, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(150deg, #180800 0%, ${route.coverColor || '#ff7a3c'} 100%)`,
      }}>
        {route.photo && (
          <img
            src={route.photo} alt={route.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10,4,0,0.72) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '3px 9px' }}>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 800 }}>{formatDistance(route.distance || 0)}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 12, left: 13, right: 13 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.2, lineHeight: 1.05, textShadow: '0 1px 8px rgba(0,0,0,0.5)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>{route.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>by {route.author}</div>
        </div>
      </div>
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

function ThisWeek({ trips }) {
  const DAY_LABELS = ['S','M','T','W','T','F','S']
  const today = new Date()
  const todayDay = today.getDay() // 0=Sun
  // Build 7-day window ending today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d
  })
  // Sum distance per day
  const distByDay = days.map(d => {
    const start = new Date(d); start.setHours(0,0,0,0)
    const end   = new Date(d); end.setHours(23,59,59,999)
    return trips
      .filter(t => t.createdAt >= start.getTime() && t.createdAt <= end.getTime())
      .reduce((s, t) => s + (t.distance || 0), 0)
  })
  const weekDist = distByDay.reduce((s, d) => s + d, 0)
  const weekKm   = (weekDist / 1000).toFixed(1)
  const maxDay   = Math.max(1, ...distByDay)
  const activeDays = distByDay.filter(d => d > 0).length

  return (
    <div style={{ padding: '0 16px 4px' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: '16px 18px', boxShadow: 'var(--shadow-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", marginBottom: 4 }}>This Week</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontSize: 36, fontWeight: 900, letterSpacing: -1, lineHeight: 1,
                fontFamily: "'Rajdhani', sans-serif",
                background: 'linear-gradient(135deg, #ff8a52, #fc4c02)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{weekKm}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-mute)', fontFamily: "'Rajdhani', sans-serif" }}>km</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', fontFamily: "'Rajdhani', sans-serif", lineHeight: 1 }}>{activeDays}</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", marginTop: 2 }}>Active Days</div>
          </div>
        </div>
        {/* Day bars */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
          {distByDay.map((dist, i) => {
            const isToday = i === 6
            const pct = dist > 0 ? Math.max(10, (dist / maxDay) * 100) : 0
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 5 }}>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 2px 2px',
                  height: dist > 0 ? `${pct}%` : 3,
                  background: dist > 0
                    ? isToday
                      ? 'linear-gradient(180deg, #ff8a52, #fc4c02)'
                      : 'rgba(252,76,2,0.35)'
                    : 'var(--border)',
                  boxShadow: dist > 0 && isToday ? '0 2px 8px rgba(252,76,2,0.35)' : 'none',
                  transition: 'height 0.3s ease',
                }} />
                <span style={{
                  fontSize: 9, fontWeight: isToday ? 800 : 600,
                  color: isToday ? '#fc4c02' : 'var(--text-mute)',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: 0.5,
                }}>{DAY_LABELS[(days[i].getDay())]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TripCard({ trip, places, onClick }) {
  const stops = places.filter(p => p.tripId === trip.id)
  const rCount = stops.filter(p => p.type === 'restaurant').length
  const dCount = stops.filter(p => p.type === 'destination').length

  return (
    <div className="pressable" onClick={onClick} style={{
      background: 'var(--surface)', borderRadius: 18, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{ position: 'relative', height: 108 }}>
        <RouteThumb path={trip.path} height={108} />
        {trip.photo && (
          <img src={trip.photo} alt={trip.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, rgba(10,4,0,0.72) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 14, right: 80 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.6)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>{formatDate(trip.createdAt)}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 9px' }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#ff9a60', fontFamily: "'Rajdhani', sans-serif" }}>{formatDistance(trip.distance || 0)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconClock size={13} color="var(--text-mute)" sw={2} />
          <span style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{formatDuration(trip.duration || 0)}</span>
        </div>
        {(trip.avgSpeed || 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconZap size={13} color="var(--text-mute)" sw={2} />
            <span style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>{formatSpeed(trip.avgSpeed)}</span>
          </div>
        )}
        <div style={{ flex: 1 }} />
        {rCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--surface-2)', borderRadius: 7, padding: '3px 8px' }}>
            <IconUtensils size={11} color="var(--text-mute)" sw={2} />
            <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 700 }}>{rCount}</span>
          </div>
        )}
        {dCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--surface-2)', borderRadius: 7, padding: '3px 8px' }}>
            <IconPin size={11} color="var(--text-mute)" sw={2} />
            <span style={{ fontSize: 11, color: 'var(--text-soft)', fontWeight: 700 }}>{dCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}
