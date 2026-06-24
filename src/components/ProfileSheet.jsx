import { useMemo, useState } from 'react'
import NodeBackground from './NodeBackground'
import { formatDistance, formatDuration, formatSpeed } from '../utils/format'
import { uid } from '../utils/uid'
import {
  IconX, IconRoad, IconClock, IconFlag, IconPin, IconZap,
  IconTrophy, IconMedal, IconCompass, IconUtensils, IconStar, IconLock, IconCamera,
} from './Icons'

// Full-screen Strava-style athlete profile: lifetime aggregates, personal
// records, a recent-activity bar chart, and the achievement showcase.
// All metrics derive from local trip/place data — no network required.
export default function ProfileSheet({ user, trips, places, onClose, onLogout, onImportHealth }) {
  const stats = useMemo(() => computeStats(trips, places), [trips, places])
  const [healthStatus, setHealthStatus] = useState(null)  // null | 'parsing' | 'done' | 'error'
  const [healthCount, setHealthCount] = useState(0)

  async function handleHealthFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setHealthStatus('parsing')
    try {
      const text = await file.text()
      const doc = new DOMParser().parseFromString(text, 'text/xml')
      const workouts = [...doc.querySelectorAll('Workout')]
      // Filter to driving / general workouts worth importing
      const TYPES = new Set([
        'HKWorkoutActivityTypeAutomobile',
        'HKWorkoutActivityTypeCycling',
        'HKWorkoutActivityTypeRunning',
        'HKWorkoutActivityTypeWalking',
        'HKWorkoutActivityTypeHiking',
        'HKWorkoutActivityTypeOther',
      ])
      const importable = workouts.filter(w => {
        const t = w.getAttribute('workoutActivityType') || ''
        return TYPES.has(t) || t.includes('Automobile')
      })
      if (importable.length === 0) {
        // Try importing all workouts if none match the filter
        importable.push(...workouts.slice(0, 50))
      }
      const imported = importable.map(w => {
        const start = new Date(w.getAttribute('startDate') || Date.now()).getTime()
        const end   = new Date(w.getAttribute('endDate')   || Date.now()).getTime()
        const distM = parseFloat(w.getAttribute('totalDistance') || '0')
        const unit  = w.getAttribute('totalDistanceUnit') || 'km'
        const distMeters = unit === 'mi' ? distM * 1609.34 : distM * 1000
        const typeRaw = (w.getAttribute('workoutActivityType') || 'Trip').replace('HKWorkoutActivityType', '')
        return {
          id: uid(),
          name: `Health: ${typeRaw} ${new Date(start).toLocaleDateString()}`,
          createdAt: start,
          startTime: start,
          endTime: end,
          duration: end - start,
          distance: distMeters,
          path: [],
          places: [],
          source: 'apple-health',
        }
      })
      if (onImportHealth && imported.length > 0) {
        await onImportHealth(imported)
      }
      setHealthCount(imported.length)
      setHealthStatus('done')
    } catch {
      setHealthStatus('error')
    }
    e.target.value = ''
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const providerLabel = { google: 'Google', apple: 'Apple', email: 'Email', guest: 'Guest' }[user?.provider] || 'Member'

  const achievements = [
    { Icon: IconFlag,     label: 'First Trip',  sub: 'Hit the road', unlocked: trips.length >= 1 },
    { Icon: IconCompass,  label: 'Trailblazer', sub: '3 trips',      unlocked: trips.length >= 3 },
    { Icon: IconTrophy,   label: 'Century',     sub: '100 miles',    unlocked: stats.totalMiles >= 100 },
    { Icon: IconUtensils, label: 'Foodie',      sub: '3 eats',       unlocked: stats.restaurants >= 3 },
    { Icon: IconStar,     label: 'Explorer',    sub: '5 spots',      unlocked: places.length >= 5 },
    { Icon: IconZap,      label: 'Speed Demon', sub: '60+ mph',      unlocked: stats.topSpeedMph >= 60 },
  ]
  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'var(--bg)', overflowY: 'auto', animation: 'sheetUp 0.32s cubic-bezier(0.22,1,0.36,1)' }}>
      {/* Hero */}
      <div style={{
        padding: '52px 20px 60px',
        background: 'linear-gradient(168deg, #100500 0%, #2a0e05 46%, #a03208 82%, #d44810 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <NodeBackground color="#ffa04a" count={22} connectDist={88} speed={0.22} />
        <div style={{ position: 'absolute', bottom: -50, right: -50, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,50,0.18), transparent 68%)', pointerEvents: 'none' }} />

        <button onClick={onClose} style={{
          position: 'absolute', top: 50, right: 16, zIndex: 3,
          width: 38, height: 38, borderRadius: 12,
          background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconX size={20} color="#fff" sw={2} />
        </button>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: 92, height: 92, borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff8a52, #ef5616)',
            border: '3px solid rgba(255,255,255,0.28)',
            boxShadow: '0 8px 30px rgba(239,86,22,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 34, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif", marginBottom: 14,
          }}>
            {initials}
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: -0.4, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', lineHeight: 1 }}>
            {user?.name || 'Explorer'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,210,160,0.75)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.14)' }}>{providerLabel}</span>
            {stats.sinceLabel && <span>{stats.sinceLabel}</span>}
          </div>
        </div>
      </div>

      <div className="hero-to-content">
        {/* Lifetime stats 2×2 */}
        <SectionLabel>Lifetime</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 16px 8px' }}>
          <BigStat Icon={IconRoad}  value={formatDistance(stats.totalDist)} label="Distance" />
          <BigStat Icon={IconClock} value={formatDuration(stats.totalDuration)} label="Drive Time" />
          <BigStat Icon={IconFlag}  value={trips.length} label="Trips" />
          <BigStat Icon={IconPin}   value={places.length} label="Places" />
        </div>

        {/* Personal records */}
        <SectionLabel>Personal Records</SectionLabel>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 8 }}>
          <RecordRow Icon={IconMedal}  label="Longest Trip"   value={stats.longestDist ? formatDistance(stats.longestDist) : '—'} sub={stats.longestDistName} />
          <RecordRow Icon={IconClock}  label="Longest Drive"  value={stats.longestDur ? formatDuration(stats.longestDur) : '—'} sub={stats.longestDurName} />
          <RecordRow Icon={IconZap}    label="Top Speed"      value={stats.topSpeed ? formatSpeed(stats.topSpeed) : '—'} sub={stats.topSpeedName} />
          <RecordRow Icon={IconTrophy} label="Best Avg Speed" value={stats.bestAvg ? formatSpeed(stats.bestAvg) : '—'} sub={stats.bestAvgName} />
        </div>

        {/* Recent activity bar chart */}
        {stats.chart.length > 0 && (
          <>
            <SectionLabel>Recent Activity</SectionLabel>
            <div style={{ margin: '0 16px 8px', padding: '18px 16px 14px', background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 92 }}>
                {stats.chart.map((c, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{
                      width: '100%', maxWidth: 30,
                      height: `${Math.max(8, c.pct)}%`,
                      background: 'linear-gradient(180deg, #ff9a60, #ef5616)',
                      borderRadius: '6px 6px 3px 3px',
                      boxShadow: '0 2px 8px rgba(239,86,22,0.25)',
                    }} title={formatDistance(c.dist)} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 9, fontSize: 9.5, color: 'var(--text-mute)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
                <span>{stats.chart.length} most recent trips</span>
                <span>{formatDistance(stats.chartMax)} peak</span>
              </div>
            </div>
          </>
        )}

        {/* Achievements */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 0' }}>
          <SectionLabel inline>Achievements</SectionLabel>
          <div style={{ fontSize: 12, color: 'var(--orange-deep)', fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>{unlockedCount}/{achievements.length}</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 16px 8px' }}>
          {achievements.map(a => (
            <div key={a.label} style={{
              width: 'calc(33.333% - 7px)', borderRadius: 16, padding: '14px 6px 11px', textAlign: 'center',
              background: a.unlocked ? 'linear-gradient(160deg, #fff4ec, #ffe6d4)' : 'var(--surface)',
              border: `1px solid ${a.unlocked ? 'var(--orange-tint)' : 'var(--border)'}`,
              opacity: a.unlocked ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                {a.unlocked ? <a.Icon size={23} color="var(--orange-deep)" sw={2} /> : <IconLock size={20} color="var(--text-mute)" sw={1.8} />}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: a.unlocked ? 'var(--orange-deep)' : 'var(--text-mute)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.3, lineHeight: 1.1 }}>{a.label}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-mute)', marginTop: 2 }}>{a.sub}</div>
            </div>
          ))}
        </div>

        {/* Apple Health Import */}
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #ff2d55, #ff6b88)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconCamera size={18} color="#fff" sw={2} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.3 }}>Apple Health</div>
                <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 1 }}>Import workouts from exported Health data</div>
              </div>
            </div>
            <div style={{ padding: '13px 16px' }}>
              {healthStatus === 'parsing' && (
                <div style={{ fontSize: 13, color: 'var(--text-soft)', textAlign: 'center', padding: '8px 0' }}>Parsing health data…</div>
              )}
              {healthStatus === 'done' && (
                <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700, textAlign: 'center', padding: '6px 0' }}>
                  ✓ Imported {healthCount} workout{healthCount !== 1 ? 's' : ''}
                </div>
              )}
              {healthStatus === 'error' && (
                <div style={{ fontSize: 13, color: 'var(--orange-deep)', fontWeight: 600, textAlign: 'center', padding: '6px 0' }}>
                  Could not parse the file. Export from Health → Profile → Export.
                </div>
              )}
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 0', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(255,45,85,0.08), rgba(255,107,136,0.08))',
                border: '1.5px dashed rgba(255,45,85,0.3)',
                color: '#ff2d55', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                {healthStatus === 'parsing' ? '…' : 'Choose export.xml'}
                <input type="file" accept=".xml" onChange={handleHealthFile} style={{ display: 'none' }} />
              </label>
              <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
                Health app → Profile icon → Export All Health Data → share the ZIP → extract export.xml
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div style={{ padding: '16px 16px 0' }}>
          <button onClick={onLogout} style={{
            width: '100%', padding: 15, borderRadius: 15,
            background: '#fff8f6', border: '1px solid var(--orange-tint)',
            color: 'var(--orange-deep)', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 1,
          }}>
            Sign Out
          </button>
        </div>
        <div style={{ height: 28 }} />
      </div>
    </div>
  )
}

function computeStats(trips, places) {
  const totalDist = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const totalDuration = trips.reduce((s, t) => s + (t.duration || 0), 0)
  const totalMiles = Math.round(totalDist / 1609.34)
  const restaurants = places.filter(p => p.type === 'restaurant').length

  const pick = (key) => trips.reduce((best, t) => ((t[key] || 0) > (best?.[key] || 0) ? t : best), null)
  const longest   = pick('distance')
  const longestD  = pick('duration')
  const fastest   = pick('maxSpeed')
  const bestAvgT  = pick('avgSpeed')
  const topSpeedMph = fastest?.maxSpeed ? Math.round(fastest.maxSpeed * 2.23694) : 0

  // Member-since from earliest trip
  const earliest = trips.reduce((min, t) => (t.createdAt && t.createdAt < min ? t.createdAt : min), Date.now())
  const sinceLabel = trips.length > 0
    ? `Since ${new Date(earliest).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : null

  // Recent-activity chart: last 8 trips chronologically, normalized to peak
  const recent = [...trips].sort((a, b) => a.createdAt - b.createdAt).slice(-8)
  const chartMax = Math.max(1, ...recent.map(t => t.distance || 0))
  const chart = recent.map(t => ({ dist: t.distance || 0, pct: ((t.distance || 0) / chartMax) * 100 }))

  return {
    totalDist, totalDuration, totalMiles, restaurants,
    longestDist: longest?.distance || 0, longestDistName: longest?.name,
    longestDur: longestD?.duration || 0,  longestDurName: longestD?.name,
    topSpeed: fastest?.maxSpeed || 0,      topSpeedName: fastest?.name, topSpeedMph,
    bestAvg: bestAvgT?.avgSpeed || 0,      bestAvgName: bestAvgT?.name,
    sinceLabel, chart, chartMax,
  }
}

function SectionLabel({ children, inline }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-mute)', letterSpacing: 2.5, textTransform: 'uppercase',
      fontWeight: 800, fontFamily: "'Rajdhani', sans-serif",
      padding: inline ? 0 : '20px 16px 12px',
    }}>{children}</div>
  )
}

function BigStat({ Icon, value, label }) {
  return (
    <div style={{ width: 'calc(50% - 5px)', background: 'var(--surface)', borderRadius: 18, padding: '15px 16px', border: '1px solid var(--border)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11 }}>
        <Icon size={17} color="var(--orange-deep)" sw={2} />
      </div>
      <div style={{
        fontSize: 30, fontWeight: 900, letterSpacing: -1, lineHeight: 1, fontFamily: "'Rajdhani', sans-serif",
        background: 'linear-gradient(135deg, #ff8a52, #e84d0e)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{label}</div>
    </div>
  )
}

function RecordRow({ Icon, label, value, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, background: 'var(--surface)', borderRadius: 15, border: '1px solid var(--border)', padding: '12px 15px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--orange-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="var(--orange-deep)" sw={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--orange-deep)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: -0.3, flexShrink: 0 }}>{value}</div>
    </div>
  )
}
