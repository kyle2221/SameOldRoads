import { useMemo } from 'react'
import { useStore } from '../store'
import { formatDistance, formatDuration, formatSpeed } from '../utils/format'
import { PageHeader, EmptyState } from '../components/ui'

export default function StatsPage() {
  const { trips, places } = useStore()
  const stats = useMemo(() => computeStats(trips, places), [trips, places])

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <PageHeader title="Stats" subtitle="Your road, by the numbers" variant="soft" />

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {stats.totalTrips === 0 ? (
          <EmptyState icon="📊" title="No trips yet" message="Record one to start seeing stats!" />
        ) : (
          <>
            {/* Headline stats — 4-column grid on mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { icon: '🛣️', value: formatDistance(stats.totalDistance), label: 'Distance', delay: 0 },
                { icon: '⏱️', value: formatDuration(stats.totalDuration), label: 'Drive time', delay: 40 },
                { icon: '🚗', value: String(stats.totalTrips), label: 'Trips', delay: 80 },
                { icon: '📍', value: String(stats.totalPlaces), label: 'Places', delay: 120 },
                { icon: '🍽️', value: String(stats.restaurants), label: 'Restaurants', delay: 160 },
                { icon: '⭐', value: String(stats.destinations), label: 'Spots', delay: 200 },
                { icon: '⚡', value: formatSpeed(stats.avgSpeed), label: 'Avg speed', delay: 240 },
                { icon: '📏', value: formatDistance(stats.longestTrip), label: 'Longest', delay: 280 },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'var(--surface)', borderRadius: 16, padding: '14px 16px',
                  border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
                  position: 'relative', overflow: 'hidden',
                  animation: `fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both`,
                  animationDelay: `${s.delay}ms`,
                }}>
                  <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, var(--orange-glow), transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ fontSize: 17, marginBottom: 4, opacity: 0.9 }}>{s.icon}</div>
                  <div className="text-gradient" style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.6, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600, marginTop: 2, letterSpacing: 0.2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* YoY delta */}
            {stats.yoyDelta != null && (
              <Card title="Year over year" subtitle="This year vs last year, total distance">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--font-display)' }}>This year</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 2, fontFamily: 'var(--font-display)' }}>{formatDistance(stats.thisYearDistance)}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--font-display)' }}>Last year</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-soft)', marginTop: 2, fontFamily: 'var(--font-display)' }}>{formatDistance(stats.lastYearDistance)}</div>
                  </div>
                  <div style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: stats.yoyDelta > 0 ? 'var(--green-wash)' : stats.yoyDelta < 0 ? 'var(--red-wash)' : 'var(--surface-2)',
                    color: stats.yoyDelta > 0 ? 'var(--green)' : stats.yoyDelta < 0 ? 'var(--red)' : 'var(--text-soft)',
                    fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {stats.yoyDelta > 0 ? '↑' : stats.yoyDelta < 0 ? '↓' : '–'} {Math.abs(stats.yoyDelta)}%
                  </div>
                </div>
              </Card>
            )}

            {/* Distance over time */}
            <Card title="Distance over time" subtitle={`Last ${Math.min(stats.last6.length, 6)} months`}>
              {stats.last6.length === 0 ? (
                <Empty>Not enough history yet.</Empty>
              ) : (
                <BarChart data={stats.last6.map((m) => ({ label: m.label, value: m.distance }))} color="#ff6a2b" formatter={formatDistance} />
              )}
            </Card>

            {/* Trip distribution */}
            <Card title="Trip distance distribution" subtitle="Bucketed by length">
              <BarChart data={stats.buckets} color="#ff8a52" formatter={(v) => `${v} trip${v !== 1 ? 's' : ''}`} />
            </Card>

            {/* Places breakdown */}
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
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: i === 0 ? 'linear-gradient(135deg, #ff8a52, #ef5616)' : 'var(--surface-2)',
                        color: i === 0 ? '#fff' : 'var(--text-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)',
                        boxShadow: i === 0 ? 'var(--shadow-orange)' : 'none',
                      }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>{t.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{formatDuration(t.duration || 0)}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange-deep)', fontFamily: 'var(--font-mono)' }}>{formatDistance(t.distance || 0)}</div>
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
  const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 1000) : 0
  const longestTrip = trips.reduce((m, t) => Math.max(m, t.distance || 0), 0)

  const now = new Date()
  const thisYear = now.getFullYear()
  const thisYearDistance = trips.filter((t) => new Date(t.createdAt || 0).getFullYear() === thisYear).reduce((s, t) => s + (t.distance || 0), 0)
  const lastYearDistance = trips.filter((t) => new Date(t.createdAt || 0).getFullYear() === thisYear - 1).reduce((s, t) => s + (t.distance || 0), 0)
  const hasYoy = thisYearDistance > 0 || lastYearDistance > 0
  const yoyDelta = hasYoy && lastYearDistance > 0 ? Math.round(((thisYearDistance - lastYearDistance) / lastYearDistance) * 100) : hasYoy && thisYearDistance > 0 ? 100 : null

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

  const buckets = [
    { label: '<5km', value: 0 }, { label: '5–25km', value: 0 },
    { label: '25–100km', value: 0 }, { label: '100–500km', value: 0 },
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

  return { totalDistance, totalDuration, totalTrips: trips.length, totalPlaces: places.length, restaurants, destinations, avgSpeed, longestTrip, thisYearDistance, lastYearDistance, yoyDelta, last6: months, buckets, topTrips }
}

function Card({ title, subtitle, children }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18,
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)', padding: 16,
      animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3, fontFamily: 'var(--font-display)' }}>{title}</div>
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 4px' }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 100
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', gap: 4 }}>
              <div style={{ fontSize: 9, color: 'var(--text-mute)', fontWeight: 700, opacity: d.value > 0 ? 1 : 0, fontFamily: 'var(--font-mono)' }}>{d.value > 0 ? formatter(d.value) : ''}</div>
              <div style={{
                width: '100%', maxWidth: 38, height: `${Math.max(h, 2)}%`,
                background: `linear-gradient(180deg, ${color}, ${color}cc)`,
                borderRadius: '8px 8px 3px 3px',
                transition: 'height 0.5s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: d.value > 0 ? `0 2px 8px ${color}33` : 'none',
              }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, padding: '0 4px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--text-soft)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{d.label}</div>
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
      <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginTop: 2, fontFamily: 'var(--font-display)' }}>{value} <span style={{ fontSize: 12, color: 'var(--text-mute)', fontWeight: 600 }}>({pct}%)</span></div>
    </div>
  )
}
