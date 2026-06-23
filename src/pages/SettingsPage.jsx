import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useTheme, useUnits } from '../theme'
import * as db from '../db'
import { formatRelative } from '../utils/format'
import { api, ApiError } from '../services/api'

export default function SettingsPage() {
  const { currentUser, logout, trips, places, routes } = useStore()
  const [theme, setTheme] = useTheme()
  const [units, setUnits] = useUnits()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [health, setHealth] = useState({ status: 'checking', data: null, err: null })

  // Live ping the backend — surfaces API key misconfig + cache stats to the user.
  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    async function check() {
      try {
        const data = await api.healthStats({ signal: ctrl.signal })
        if (!cancelled) setHealth({ status: 'ok', data, err: null })
      } catch (e) {
        if (cancelled) return
        setHealth({ status: 'err', data: null, err: e })
      }
    }
    check()
    const id = setInterval(check, 30000) // refresh every 30s
    return () => { cancelled = true; ctrl.abort(); clearInterval(id) }
  }, [])

  async function handleExport() {
    const data = { user: currentUser, trips, places, routes, exportedAt: new Date().toISOString(), version: 1 }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sameoldroads-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleClear() {
    // Delete all trips/places/routes from IndexedDB
    await Promise.all([
      ...trips.map((t) => db.deleteTrip(t.id)),
      ...places.map((p) => db.deletePlace(p.id)),
      ...routes.filter((r) => r.isOwn).map((r) => db.deleteRoute(r.id)),
    ])
    setClearConfirm(false)
    logout()
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      <div style={{ padding: '54px 20px 22px', background: 'linear-gradient(180deg, var(--discover-1, #ffd0aa) 0%, var(--discover-2, #ffe4d0) 42%, var(--bg) 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,60,0.45), transparent)' }} />
        <h1 style={{ margin: '0 0 5px', fontSize: 30, fontWeight: 900, color: 'var(--text)', letterSpacing: -0.8, position: 'relative' }}>Settings</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-soft)', position: 'relative' }}>Make it yours</p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Account */}
        <Section title="Account">
          <Row icon="👤" label="Name" value={currentUser?.name} />
          <Row icon="✉️" label="Email" value={currentUser?.email || 'Guest account'} />
          <Row icon="🔐" label="Sign-in" value={currentUser?.provider ? currentUser.provider.charAt(0).toUpperCase() + currentUser.provider.slice(1) : '—'} />
          <Row icon="🗓️" label="Joined" value={currentUser?.createdAt ? formatRelative(currentUser.createdAt) : '—'} />
        </Section>

        {/* Backend health */}
        <Section title="Backend Status">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%',
                background: health.status === 'ok' ? '#22c55e' : health.status === 'err' ? '#ef4444' : '#f59e0b',
                boxShadow: health.status === 'ok' ? '0 0 8px rgba(34,197,94,0.6)' : 'none',
              }} />
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                {health.status === 'ok' ? 'API online' : health.status === 'err' ? 'API unreachable' : 'Checking…'}
              </div>
              {health.data?.uptime != null && (
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginLeft: 'auto' }}>
                  uptime {formatDurationLong(health.data.uptime * 1000)}
                </div>
              )}
            </div>

            {health.status === 'ok' && health.data && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <KeyBadge label="Google Maps" ok={health.data.keys?.googleMaps} />
                  <KeyBadge label="SerpApi" ok={health.data.keys?.serpapi} />
                </div>
                {/* Cache stats */}
                {health.data.cache && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Server cache (size · hit / miss)</div>
                    {Object.entries(health.data.cache).map(([name, c]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', color: 'var(--text-soft)' }}>
                        <span style={{ fontWeight: 600 }}>{name}</span>
                        <span>{c.size} · {c.hits} / {c.misses}</span>
                      </div>
                    ))}
                  </div>
                )}
                {health.data.mem && (
                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-mute)' }}>
                    mem: {health.data.mem.heapUsedMb} / {health.data.mem.heapTotalMb} MB · rss {health.data.mem.rssMb} MB
                  </div>
                )}
              </>
            )}

            {health.status === 'err' && (
              <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.5 }}>
                {health.err?.code === 'NETWORK'
                  ? 'Could not reach the backend. Make sure the server is running (cd server && npm start) and that VITE_API_BASE is correct.'
                  : `Error: ${health.err?.message || 'unknown'}`}
              </div>
            )}
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Theme</div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--sunk)', padding: 4, borderRadius: 12 }}>
              {['light', 'dark', 'system'].map((t) => (
                <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: theme.pref === t ? 'var(--surface)' : 'transparent', border: 'none', color: theme.pref === t ? 'var(--orange-deep)' : 'var(--text-soft)', fontSize: 13, fontWeight: theme.pref === t ? 800 : 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🖥️'} {t}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Units */}
        <Section title="Units">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Distance</div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--sunk)', padding: 4, borderRadius: 12 }}>
              {[
                { id: 'metric', label: 'Metric (km/m)', icon: '🇪🇺' },
                { id: 'imperial', label: 'Imperial (mi/ft)', icon: '🇺🇸' },
              ].map((u) => (
                <button key={u.id} onClick={() => setUnits(u.id)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: units === u.id ? 'var(--surface)' : 'transparent', border: 'none', color: units === u.id ? 'var(--orange-deep)' : 'var(--text-soft)', fontSize: 13, fontWeight: units === u.id ? 800 : 600, cursor: 'pointer' }}>
                  {u.icon} {u.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section title="Your Data">
          <Row icon="🛣️" label="Trips" value={`${trips.length}`} />
          <Row icon="📍" label="Saved places" value={`${places.length}`} />
          <Row icon="📚" label="Routes" value={`${routes.length}`} />
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleExport} style={btnStyle}>⬇️ Export my data (JSON)</button>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" danger>
          <div style={{ padding: '14px 16px' }}>
            {!clearConfirm ? (
              <button onClick={() => setClearConfirm(true)} style={{ ...btnStyle, background: '#fff5f3', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)' }}>
                🗑️ Clear all my local data
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--orange-deep)', fontWeight: 700, padding: '8px 10px', background: '#fff5f3', border: '1px solid var(--orange-tint)', borderRadius: 8 }}>
                  This will permanently delete all your trips, places, and personal routes from this device. Cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setClearConfirm(false)} style={{ ...btnStyle, flex: 1, background: 'var(--surface-2)', color: 'var(--text-soft)' }}>Cancel</button>
                  <button onClick={handleClear} style={{ ...btnStyle, flex: 1, background: 'var(--orange)', color: '#fff' }}>Delete everything</button>
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Session">
          <div style={{ padding: '14px 16px' }}>
            <button onClick={logout} style={{ ...btnStyle, background: '#fff8f6', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)' }}>Sign out</button>
          </div>
        </Section>

        <div style={{ textAlign: 'center', padding: '8px 0 24px', fontSize: 11, color: 'var(--text-mute)' }}>
          SameOldRoads v1.1.0 · Made with 🛣️
        </div>
      </div>
    </div>
  )
}

function formatDurationLong(ms) {
  const s = Math.floor((ms || 0) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${sec}s`
}

function KeyBadge({ label, ok }) {
  return (
    <div style={{
      flex: 1, padding: '8px 10px', borderRadius: 10,
      background: ok ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#22c55e' : '#ef4444' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: ok ? '#15803d' : '#b91c1c' }}>{label}</span>
      <span style={{ fontSize: 10, color: ok ? '#15803d' : '#b91c1c', marginLeft: 'auto' }}>{ok ? 'on' : 'off'}</span>
    </div>
  )
}

const btnStyle = { width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }

function Section({ title, children, danger }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: `1px solid ${danger ? 'var(--orange-tint)' : 'var(--border)'}`, boxShadow: 'var(--shadow-soft)', overflow: 'hidden' }}>
      <div style={{ padding: '11px 16px', fontSize: 11, fontWeight: 800, color: danger ? 'var(--orange-deep)' : 'var(--text-mute)', letterSpacing: 1, textTransform: 'uppercase', background: 'var(--surface-2)' }}>{title}</div>
      {children}
    </div>
  )
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-soft)', fontWeight: 600 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</div>
    </div>
  )
}
