import { useMemo } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatSpeed } from '../utils/format'

// Pure-SVG charts — no chart library. Mobile-first, fits the existing design system.
export default function StatsPage() {
  const { trips, places } = useStore()

  const stats = useMemo(() => computeStats(trips, places), [trips, places])

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '54px 20px 22px', background: 'linear-gradient(180deg, var(--discover-1, #ffd0aa) 0%, var(--discover-2, #ffe4d0) 42%, var(--bg) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.45), transparent)' }} />
        <h1 style={{ margin: '0 0 5px', fontSize: 30, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.8, position: 'relative' }}>Stats</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', position: 'relative' }}>Your road, by the numbers</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {stats.totalTrips === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-mute)' }}>
            <div style={{ fontSize: 44, marginBottom: 14, opacity: 0.7 }}>📊</div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>No trips yet — record one to start seeing stats!</div>
          </div>
        ) : (
          <>
            {/* Headline numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <BigStat icon="🛣️" value={formatDistance(stats.totalDistance)} label="Distance" />
              <BigStat icon="⏱️" value={formatDuration(stats.totalDuration)} label="Driving time" />
              <BigStat icon="🚗" value={String(stats.totalTrips)} label="Trips" />
              <BigStat icon="📍" value={String(stats.totalPlaces)} label="Places saved" />
              <BigStat icon="🍽️" value={String(stats.restaurants)} label="Restaurants" />
              <BigStat icon="⭐" value={String(stats.destinations)} label="Destinations" />
              <BigStat icon="⚡" value={formatSpeed(stats.avgSpeed)} label="Avg speed" />
              <BigStat icon="📏" value={formatDistance(stats.longestTrip)} label="Longest trip" />
            </div>

            {/* YoY delta */}
            {stats.yoyDelta != null && (
              <Card title="Year over year" subtitle="This year vs last year, total distance">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>This year</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginTop: 2 }}>{formatDistance(stats.thisYearDistance)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Last year</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-soft)', marginTop: 2 }}>{formatDistance(stats.lastYearDistance)}</div>
                  </div>
                  <div style={{
                    padding: '8px 12px', borderRadius: 12,
                    background: stats.yoyDelta > 0 ? '#f0fdf4' : stats.yoyDelta < 0 ? '#fef2f2' : 'var(--surface-2)',
                    color: stats.yoyDelta > 0 ? '#15803d' : stats.yoyDelta < 0 ? '#b91c1c' : 'var(--text-soft)',
                    fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap',
                  }}>
                    {stats.yoyDelta > 0 ? '↑' : stats.yoyDelta < 0 ? '↓' : '–'} {Math.abs(stats.yoyDelta)}%
                  </div>
                </div>
              </Card>
            )}

            {/* Distance over time chart */}
            <Card title="Distance over time" subtitle={`Last ${Math.min(stats.last6.length, 6)} months`}>
              {stats.last6.length === 0 ? (
                <Empty>Not enough history yet.</Empty>
              ) : (
                <BarChart data={stats.last6.map((m) => ({ label: m.label, value: m.distance }))} color="#ff6a2b" formatter={formatDistance} />
              )}
            </Card>

            {/* Trip length distribution */}
            <Card title="Trip distance distribution" subtitle="Bucketed by length">
              <BarChart data={stats.buckets} color="#ff8a52" formatter={(v) => `${v} trip${v !== 1 ? 's' : ''}`} />
            </Card>

            {/* Places type breakdown */}
            {stats.totalPlaces > 0 && (
              <Card title="Places breakdown" subtitle="Restaurants vs destinations">
                <Donut restaurants={stats.restaurants} destinations={stats.destinations} />
              </Card>
            )}

            {/* Top trips */}
            {stats.topTrips.length > 0 && (
              <Card title="Longest trips" subtitle="Your top 5 by distance">
                <div style={{ padding: '4px 0' }}>
                  {stats.topTrips.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === stats.topTrips.length - 1 ? 'none' : '1px solid var(--border-soft)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #ff8a52, #ef5616)' : 'var(--surface-2)', color: i === 0 ? '#fff' : 'var(--text-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>{formatDuration(t.duration || 0)}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange-deep)' }}>{formatDistance(t.distance || 0)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}

function computeStats(trips, places) {
  const totalDistance = trips.reduce((s, t) => s + (t.distance || 0), 0)
  const totalDuration = trips.reduce((s, t) => s + (t.duration || 0), 0)
  const restaurants = places.filter((p) => p.type === 'restaurant').length
  const destinations = places.filter((p) => p.type === 'destination').length
  const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 1000) : 0 // m/s
  const longestTrip = trips.reduce((m, t) => Math.max(m, t.distance || 0), 0)

  // YoY
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisYearDistance = trips
    .filter((t) => new Date(t.createdAt || 0).getFullYear() === thisYear)
    .reduce((s, t) => s + (t.distance || 0), 0)
  const lastYearDistance = trips
    .filter((t) => new Date(t.createdAt || 0).getFullYear() === thisYear - 1)
    .reduce((s, t) => s + (t.distance || 0), 0)
  // Only show YoY if there's data for either year
  const hasYoy = thisYearDistance > 0 || lastYearDistance > 0
  const yoyDelta = hasYoy && lastYearDistance > 0
    ? Math.round(((thisYearDistance - lastYearDistance) / lastYearDistance) * 100)
    : hasYoy && thisYearDistance > 0 ? 100 : null

  // Last 6 months distance
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(thisYear, now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('en-US', { month: 'short' }), distance: 0 })
  }
  for (const t of trips) {
    const d = new Date(t.createdAt || 0)
    const m = months.find((mm) => mm.year === d.getFullYear() && mm.month === d.getMonth())
    if (m) m.distance += (t.distance || 0)
  }

  // Buckets: <5km, 5-25, 25-100, 100-500, 500+
  const buckets = [
    { label: '<5km', value: 0 },
    { label: '5–25km', value: 0 },
    { label: '25–100km', value: 0 },
    { label: '100–500km', value: 0 },
    { label: '500km+', value: 0 },
  ]
  for (const t of trips) {
    const d = (t.distance || 0) / 1000
    if (d < 5) buckets[0].value++
    else if (d < 25) buckets[1].value++
    else if (d < 100) buckets[2].value++
    else if (d < 500) buckets[3].value++
    else buckets[4].value++
  }

  const topTrips = [...trips].sort((a, b) => (b.distance || 0) - (a.distance || 0)).slice(0, 5)

  return {
    totalDistance, totalDuration, totalTrips: trips.length, totalPlaces: places.length,
    restaurants, destinations, avgSpeed, longestTrip,
    thisYearDistance, lastYearDistance, yoyDelta,
    last6: months, buckets, topTrips,
  }
}

function BigStat({ icon, value, label }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.6, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

function Empty({ children }) {
  return <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--text-mute)' }}>{children}</div>
}

function BarChart({ data, color, formatter }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, padding: '0 4px' }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 100
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', gap: 4 }}>
              <div style={{ fontSize: 9, color: 'var(--text-mute)', fontWeight: 700, opacity: d.value > 0 ? 1 : 0 }}>{d.value > 0 ? formatter(d.value) : ''}</div>
              <div style={{ width: '100%', maxWidth: 36, height: `${Math.max(h, 2)}%`, background: `linear-gradient(180deg, ${color}, ${color}cc)`, borderRadius: '6px 6px 2px 2px', transition: 'height 0.4s' }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--text-soft)', fontWeight: 600 }}>{d.label}</div>
        ))}
      </div>
    </div>
  )
}

function Donut({ restaurants, destinations }) {
  const total = Math.max(1, restaurants + destinations)
  const r = 36
  const c = 2 * Math.PI * r
  const restPct = restaurants / total
  const destPct = destinations / total
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#ff6a2b" strokeWidth="12"
          strokeDasharray={`${c * restPct} ${c}`} strokeDashoffset={0} transform="rotate(-90 50 50)" strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="#4f6ef7" strokeWidth="12"
          strokeDasharray={`${c * destPct} ${c}`} strokeDashoffset={-c * restPct} transform="rotate(-90 50 50)" strokeLinecap="round" />
      </svg>
      <div style={{ flex: 1 }}>
        <LegendItem color="#ff6a2b" label="🍽️ Restaurants" value={restaurants} pct={Math.round(restPct * 100)} />
        <div style={{ height: 8 }} />
        <LegendItem color="#4f6ef7" label="📍 Destinations" value={destinations} pct={Math.round(destPct * 100)} />
      </div>
    </div>
  )
}
function LegendItem({ color, label, value, pct }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
        <div style={{ fontSize: 12, color: 'var(--text-soft)', fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{value} <span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 600 }}>({pct}%)</span></div>
    </div>
  )
}
