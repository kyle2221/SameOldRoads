import { useEffect, useState } from 'react'
import { useStore } from '../store'

function usSession(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now)
  const get = (t) => parts.find((p) => p.type === t)?.value
  const wd = get('weekday')
  const h = parseInt(get('hour'), 10)
  const m = parseInt(get('minute'), 10)
  const mins = h * 60 + m
  if (wd === 'Sat' || wd === 'Sun') return { label: 'MARKET CLOSED', color: 'var(--text-3)', dot: 'var(--text-3)' }
  if (mins >= 570 && mins < 960) return { label: 'US MARKET OPEN', color: 'var(--up)', dot: 'var(--up)' }
  if (mins >= 240 && mins < 570) return { label: 'PRE-MARKET', color: 'var(--gold)', dot: 'var(--gold)' }
  if (mins >= 960 && mins < 1200) return { label: 'AFTER HOURS', color: 'var(--gold)', dot: 'var(--gold)' }
  return { label: 'MARKET CLOSED', color: 'var(--text-3)', dot: 'var(--text-3)' }
}

export default function StatusBar() {
  const { statusMsg, statusKind } = useStore()
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  const ses = usSession(now)
  const kindColor = statusKind === 'error' ? 'var(--down)' : statusKind === 'ok' ? 'var(--up)' : 'var(--text-2)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 24, padding: '0 12px', background: 'var(--bg-1)', borderTop: '1px solid var(--border-2)', fontSize: 10.5, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: ses.dot }} className={ses.label.includes('OPEN') ? 'blink' : ''} />
        <span className="mono" style={{ color: ses.color, fontWeight: 700, letterSpacing: 0.5 }}>{ses.label}</span>
      </div>
      <span style={{ color: 'var(--border-2)' }}>│</span>
      <div className="mono" style={{ color: kindColor, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{statusMsg}</div>
      <div className="dim" style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <span><b className="mono" style={{ color: 'var(--text-2)' }}>⌘K</b> Palette</span>
        <span><b className="mono" style={{ color: 'var(--text-2)' }}>/</b> Command</span>
        <span><b className="mono" style={{ color: 'var(--text-2)' }}>HELP</b> Functions</span>
        <span className="mono">NXT v1.0</span>
      </div>
    </div>
  )
}
