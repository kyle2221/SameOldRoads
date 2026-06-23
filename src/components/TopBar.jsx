import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { SYMBOLS, BY_SYMBOL } from '../data/universe'
import { FUNCTIONS, BY_CODE } from '../data/functions'
import { fmtClock } from '../utils/format'
import Icon from './Icons'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

function Clock({ tz, label, now }) {
  return (
    <div style={{ textAlign: 'right', lineHeight: 1.05 }}>
      <div className="dim" style={{ fontSize: 8.5, letterSpacing: 0.6 }}>{label}</div>
      <div className="num" style={{ fontSize: 11, color: 'var(--text-2)' }}>{fmtClock(now, false, tz)}</div>
    </div>
  )
}

// build autocomplete suggestions for the trailing token
function suggest(value) {
  const v = value.trim()
  if (!v) return []
  const tokens = v.toUpperCase().split(/\s+/)
  const last = tokens[tokens.length - 1]
  const prior = tokens.slice(0, -1)
  const priorStr = prior.join(' ')
  const priorIsSym = prior.length === 1 && BY_SYMBOL[prior[0]]
  const priorIsFn = prior.length === 1 && BY_CODE[prior[0]]

  const out = []
  if (priorIsSym) {
    for (const f of FUNCTIONS) {
      if (f.code.startsWith(last) || f.aliases.some((a) => a.startsWith(last)) || f.label.toUpperCase().includes(last)) {
        out.push({ type: 'fn', title: `${prior[0]} ${f.code}`, sub: f.label, cmd: `${prior[0]} ${f.code}` })
      }
    }
    return out.slice(0, 8)
  }
  if (priorIsFn) {
    for (const s of SYMBOLS) {
      if (s.startsWith(last) || BY_SYMBOL[s].name.toUpperCase().includes(last)) {
        out.push({ type: 'sym', title: `${prior[0]} ${s}`, sub: BY_SYMBOL[s].name, cmd: `${prior[0]} ${s}` })
      }
    }
    return out.slice(0, 8)
  }
  // single token: mix symbols + functions
  for (const s of SYMBOLS) {
    if (s.startsWith(last) || BY_SYMBOL[s].name.toUpperCase().includes(last)) {
      out.push({ type: 'sym', title: s, sub: BY_SYMBOL[s].name, cmd: s })
    }
  }
  const syms = out.slice(0, 6)
  const fns = []
  for (const f of FUNCTIONS) {
    if (f.code.startsWith(last) || f.aliases.some((a) => a.startsWith(last)) || f.label.toUpperCase().includes(last)) {
      fns.push({ type: 'fn', title: f.code, sub: f.label, cmd: f.code })
    }
  }
  return [...syms, ...fns.slice(0, 5)].slice(0, 9)
}

export default function TopBar() {
  const now = useNow()
  const { runCommand, commandHistory, togglePalette, symbol } = useStore()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef(null)

  const sugg = useMemo(() => suggest(value), [value])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); togglePalette() }
      else if (e.key === '/' && document.activeElement !== inputRef.current && !/input|textarea/i.test(document.activeElement?.tagName)) {
        e.preventDefault(); inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePalette])

  const run = (text) => {
    runCommand(text)
    setValue(''); setOpen(false); setActive(-1); setHistIdx(-1)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (open && active >= 0 && sugg[active]) run(sugg[active].cmd)
      else run(value)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (open && sugg.length) setActive((a) => Math.min(a + 1, sugg.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (open && sugg.length && active > -1) setActive((a) => Math.max(a - 1, 0))
      else { // recall history
        const ni = Math.min(histIdx + 1, commandHistory.length - 1)
        if (commandHistory[ni]) { setHistIdx(ni); setValue(commandHistory[ni]); setOpen(false) }
      }
    } else if (e.key === 'Tab') {
      if (open && sugg.length) { e.preventDefault(); setValue(sugg[Math.max(active, 0)].cmd + ' ') }
    } else if (e.key === 'Escape') {
      setOpen(false); setActive(-1)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, height: 46, padding: '0 12px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border-2)', zIndex: 50 }}>
      {/* brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--amber)', display: 'grid', placeItems: 'center', color: '#000', fontWeight: 900, fontSize: 16, fontFamily: 'var(--mono)' }}>N</div>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>NXT<span className="amber"> TERMINAL</span></div>
          <div className="dim" style={{ fontSize: 8, letterSpacing: 1.5 }}>MARKETS · CHARTS · NEWS</div>
        </div>
      </div>

      {/* command line */}
      <div style={{ flex: 1, maxWidth: 640, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--panel-3)', border: '1px solid var(--border-2)', borderLeft: '3px solid var(--amber)', borderRadius: 5, height: 30, padding: '0 10px', gap: 8 }}>
          <span className="amber mono" style={{ fontWeight: 800, fontSize: 13 }}>&gt;</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); setOpen(true); setActive(-1); setHistIdx(-1) }}
            onKeyDown={onKeyDown}
            onFocus={() => value && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Enter ticker or function  ·  e.g.  AAPL GP   ·   TOP   ·   HELP"
            spellCheck={false} autoComplete="off"
            className="mono"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--amber)', fontSize: 13, fontWeight: 600, letterSpacing: 0.4 }}
          />
          <kbd style={{ fontSize: 9, color: 'var(--text-3)', border: '1px solid var(--border-2)', borderRadius: 3, padding: '1px 5px' }}>GO ⏎</kbd>
        </div>

        {open && sugg.length > 0 && (
          <div className="pop" style={{ position: 'absolute', top: 34, left: 0, right: 0, background: 'var(--panel-2)', border: '1px solid var(--border-2)', borderRadius: 6, boxShadow: '0 18px 50px rgba(0,0,0,0.6)', overflow: 'hidden', zIndex: 60 }}>
            {sugg.map((s, i) => (
              <div key={s.cmd + i}
                   onMouseDown={(e) => { e.preventDefault(); run(s.cmd) }}
                   onMouseEnter={() => setActive(i)}
                   style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', cursor: 'pointer', background: i === active ? 'var(--hover)' : 'transparent' }}>
                <span className="pill" style={{ background: s.type === 'sym' ? 'var(--amber-wash)' : 'rgba(54,194,255,0.12)', color: s.type === 'sym' ? 'var(--amber)' : 'var(--cyan)' }}>{s.type === 'sym' ? 'SEC' : 'FUNC'}</span>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.title}</span>
                <span className="muted" style={{ fontSize: 11, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* palette button */}
      <button onClick={togglePalette} title="Command palette (⌘K)"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 5, border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 10.5, flexShrink: 0 }}>
        <Icon name="command" size={12} /> <kbd style={{ fontSize: 9 }}>⌘K</kbd>
      </button>

      {/* clocks + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <Clock label="NEW YORK" tz="America/New_York" now={now} />
        <Clock label="LONDON" tz="Europe/London" now={now} />
        <Clock label="TOKYO" tz="Asia/Tokyo" now={now} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
          <span className="live-dot" />
          <span className="dim" style={{ fontSize: 9.5, letterSpacing: 0.5 }}>LIVE</span>
        </div>
      </div>
    </div>
  )
}
