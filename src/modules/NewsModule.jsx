import { useEffect, useState } from 'react'
import { newsFeed } from '../services/news'
import { useStore } from '../store'
import { fmtTimeAgo } from '../utils/format'

const SENT = { pos: { c: 'var(--up)', l: '▲' }, neg: { c: 'var(--down)', l: '▼' }, neu: { c: 'var(--text-3)', l: '•' } }

export default function NewsModule({ embedded }) {
  const { symbol, loadSecurity } = useStore()
  const [items, setItems] = useState(newsFeed.getAll())
  const [filter, setFilter] = useState('all') // all | security | <category>
  const [q, setQ] = useState('')

  useEffect(() => newsFeed.subscribe((list) => setItems([...list])), [])

  const categories = ['all', 'security', ...[...new Set(newsFeed.getAll().map((i) => i.category))]]
  let view = items
  if (filter === 'security') view = view.filter((i) => i.symbol === symbol)
  else if (filter !== 'all') view = view.filter((i) => i.category === filter)
  if (q.trim()) view = view.filter((i) => i.headline.toLowerCase().includes(q.toLowerCase()) || (i.symbol || '').includes(q.toUpperCase()))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!embedded && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button key={c} className={`chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All News' : c === 'security' ? `${symbol} only` : c}
            </button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search headlines…" className="field" style={{ width: 180, height: 28, marginLeft: 'auto', fontSize: 11.5 }} />
        </div>
      )}

      <div className="thin-scroll" style={{ flex: 1, overflow: 'auto' }}>
        {view.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>No headlines match.</div>}
        {view.map((it) => {
          const s = SENT[it.sentiment]
          return (
            <div key={it.id} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <span className="num dim" style={{ fontSize: 10, width: 34, flexShrink: 0, paddingTop: 1, textAlign: 'right' }}>{fmtTimeAgo(it.ts)}</span>
              <span style={{ color: s.c, fontSize: 10, flexShrink: 0, paddingTop: 2 }}>{s.l}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.4 }}>{it.headline}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                  <span className="dim" style={{ fontSize: 10 }}>{it.source}</span>
                  <span className="pill flat" style={{ fontSize: 8.5 }}>{it.category}</span>
                  {it.symbol && (
                    <button className="pill amber" style={{ fontSize: 9 }} onClick={() => loadSecurity(it.symbol)}>{it.symbol}</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
