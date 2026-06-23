import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { SYMBOLS, BY_SYMBOL } from '../data/universe'
import { FUNCTIONS } from '../data/functions'
import Icon from './Icons'

export default function CommandPalette() {
  const { paletteOpen, closePalette, runCommand, commandHistory } = useStore()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => { if (paletteOpen) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 10) } }, [paletteOpen])

  const items = useMemo(() => {
    const term = q.trim().toUpperCase()
    const fns = FUNCTIONS
      .filter((f) => !term || f.code.includes(term) || f.label.toUpperCase().includes(term) || f.aliases.some((a) => a.includes(term)))
      .map((f) => ({ kind: 'fn', icon: f.icon, title: f.label, sub: `${f.code}${f.needsSym ? ' · current security' : ''}`, cmd: f.code }))
    const syms = SYMBOLS
      .filter((s) => !term || s.includes(term) || BY_SYMBOL[s].name.toUpperCase().includes(term))
      .slice(0, term ? 8 : 6)
      .map((s) => ({ kind: 'sym', icon: 'info', title: s, sub: BY_SYMBOL[s].name, cmd: s }))
    const recents = (!term ? commandHistory.slice(0, 5) : [])
      .map((c) => ({ kind: 'recent', icon: 'refresh', title: c, sub: 'recent command', cmd: c }))
    return [...fns.slice(0, term ? 8 : 12), ...syms, ...recents]
  }, [q, commandHistory])

  useEffect(() => { setActive(0) }, [q])
  useEffect(() => {
    const el = listRef.current?.children[active]
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!paletteOpen) return null

  const choose = (it) => { runCommand(it.cmd); closePalette() }

  const onKey = (e) => {
    if (e.key === 'Escape') closePalette()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (items[active]) choose(items[active]); else runCommand(q), closePalette() }
  }

  return (
    <div onMouseDown={closePalette} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '11vh' }}>
      <div className="pop" onMouseDown={(e) => e.stopPropagation()} style={{ width: 'min(620px, 92vw)', background: 'var(--panel-2)', border: '1px solid var(--border-2)', borderRadius: 10, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <Icon name="search" size={16} stroke="var(--text-3)" />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
                 placeholder="Search functions & securities — type to filter, ⏎ to run"
                 spellCheck={false}
                 style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14 }} />
          <kbd style={{ fontSize: 9.5, color: 'var(--text-3)', border: '1px solid var(--border-2)', borderRadius: 3, padding: '2px 6px' }}>ESC</kbd>
        </div>
        <div ref={listRef} className="thin-scroll" style={{ maxHeight: '54vh', overflowY: 'auto', padding: 6 }}>
          {items.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>No matches — press ⏎ to run “{q}” anyway</div>}
          {items.map((it, i) => (
            <div key={it.kind + it.cmd + i}
                 onMouseDown={(e) => { e.preventDefault(); choose(it) }}
                 onMouseEnter={() => setActive(i)}
                 style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: i === active ? 'var(--sel)' : 'transparent' }}>
              <Icon name={it.icon} size={15} stroke={i === active ? 'var(--amber)' : 'var(--text-3)'} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }} className={it.kind === 'sym' ? 'mono' : ''}>{it.title}</span>
              <span className="muted" style={{ fontSize: 11, marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{it.sub}</span>
              <span className="pill flat" style={{ fontSize: 8.5 }}>{it.kind === 'fn' ? 'FUNCTION' : it.kind === 'sym' ? 'SECURITY' : 'RECENT'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
