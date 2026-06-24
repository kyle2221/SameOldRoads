import { useState, useEffect } from 'react'
import { useStore } from '../store'
import { useTheme, useUnits } from '../theme'
import * as db from '../db'
import { formatRelative } from '../utils/format'
import { api, ApiError } from '../services/api'
import { PageHeader, SectionLabel } from '../components/ui'
import { toast } from '../store/toast'

export default function SettingsPage() {
  const { currentUser, logout, trips, places, routes } = useStore()
  const [theme, setTheme] = useTheme()
  const [units, setUnits] = useUnits()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [health, setHealth] = useState({ status: 'checking', data: null, err: null })

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
    const id = setInterval(check, 30000)
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
    toast.success('Data exported')
  }

  async function handleClear() {
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
      <PageHeader title="Settings" subtitle="Make it yours" variant="soft" />

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
                background: health.status === 'ok' ? 'var(--green)' : health.status === 'err' ? 'var(--red)' : '#f59e0b',
                boxShadow: health.status === 'ok' ? '0 0 10px rgba(34,197,94,0.6)' : 'none',
              }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                {health.status === 'ok' ? 'API online' : health.status === 'err' ? 'API unreachable' : 'Checking…'}
              </div>
              {health.data?.uptime != null && (
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
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
                {health.data.cache && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px' }}>
                    <SectionLabel style={{ marginBottom: 10 }}>Server cache · size / hit / miss</SectionLabel>
                    {Object.entries(health.data.cache).map(([name, c]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', color: 'var(--text-soft)' }}>
                        <span style={{ fontWeight: 600 }}>{name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{c.size} · {c.hits} / {c.misses}</span>
                      </div>
                    ))}
                  </div>
                )}
                {health.data.mem && (
                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                    mem: {health.data.mem.heapUsedMb} / {health.data.mem.heapTotalMb} MB · rss {health.data.mem.rssMb} MB
                  </div>
                )}
              </>
            )}

            {health.status === 'err' && (
              <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.5 }}>
                {health.err?.code === 'NETWORK'
                  ? 'Could not reach the backend. Make sure the server is running and VITE_API_BASE is correct.'
                  : `Error: ${health.err?.message || 'unknown'}`}
              </div>
            )}
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Theme</div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--sunk)', padding: 4, borderRadius: 12 }}>
              {['light', 'dark', 'system'].map((t) => (
                <button key={t} onClick={() => setTheme(t)} className="pressable" style={{
                  flex: 1, padding: '9px 0', borderRadius: 9,
                  background: theme.pref === t ? 'var(--surface)' : 'transparent', border: 'none',
                  color: theme.pref === t ? 'var(--orange-deep)' : 'var(--text-soft)',
                  fontSize: 13, fontWeight: theme.pref === t ? 700 : 600, cursor: 'pointer',
                  textTransform: 'capitalize', fontFamily: 'var(--font-display)',
                  transition: 'all 0.2s ease',
                }}>
                  {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🖥️'} {t}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Units */}
        <Section title="Units">
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Distance</div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--sunk)', padding: 4, borderRadius: 12 }}>
              {[
                { id: 'metric', label: 'Metric (km/m)', icon: '🇪🇺' },
                { id: 'imperial', label: 'Imperial (mi/ft)', icon: '🇺🇸' },
              ].map((u) => (
                <button key={u.id} onClick={() => setUnits(u.id)} className="pressable" style={{
                  flex: 1, padding: '9px 0', borderRadius: 9,
                  background: units === u.id ? 'var(--surface)' : 'transparent', border: 'none',
                  color: units === u.id ? 'var(--orange-deep)' : 'var(--text-soft)',
                  fontSize: 13, fontWeight: units === u.id ? 700 : 600, cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  transition: 'all 0.2s ease',
                }}>
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
            <button onClick={handleExport} className="pressable" style={btnStyle}>⬇️ Export my data (JSON)</button>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" danger>
          <div style={{ padding: '14px 16px' }}>
            {!clearConfirm ? (
              <button onClick={() => setClearConfirm(true)} className="pressable" style={{ ...btnStyle, background: 'var(--red-wash)', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)' }}>
                🗑️ Clear all my local data
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--orange-deep)', fontWeight: 700, padding: '8px 10px', background: 'var(--red-wash)', border: '1px solid var(--orange-tint)', borderRadius: 8 }}>
                  This will permanently delete all your trips, places, and personal routes from this device. Cannot be undone.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setClearConfirm(false)} className="pressable" style={{ ...btnStyle, flex: 1, background: 'var(--surface-2)', color: 'var(--text-soft)' }}>Cancel</button>
                  <button onClick={handleClear} className="pressable" style={{ ...btnStyle, flex: 1, background: 'var(--orange)', color: '#fff' }}>Delete everything</button>
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Session">
          <div style={{ padding: '14px 16px' }}>
            <button onClick={logout} className="pressable" style={{ ...btnStyle, background: 'var(--orange-wash)', border: '1px solid var(--orange-tint)', color: 'var(--orange-deep)' }}>Sign out</button>
          </div>
        </Section>

        <div style={{ textAlign: 'center', padding: '8px 0 24px', fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-display)' }}>
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
      background: ok ? 'var(--green-wash)' : 'var(--red-wash)',
      border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? 'var(--green)' : 'var(--red)' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: ok ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-display)' }}>{label}</span>
      <span style={{ fontSize: 10, color: ok ? 'var(--green)' : 'var(--red)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>{ok ? 'on' : 'off'}</span>
    </div>
  )
}

const btnStyle = { width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg, #ff8a52, #ef5616)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-display)' }

function Section({ title, children, danger }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 18,
      border: `1px solid ${danger ? 'var(--orange-tint)' : 'var(--border)'}`,
      boxShadow: 'var(--shadow-soft)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '11px 16px', fontSize: 11, fontWeight: 700,
        color: danger ? 'var(--orange-deep)' : 'var(--text-mute)',
        letterSpacing: 1, textTransform: 'uppercase',
        background: 'var(--surface-2)', fontFamily: 'var(--font-display)',
      }}>{title}</div>
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
      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, maxWidth: '60%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-display)' }}>{value || '—'}</div>
    </div>
  )
}
