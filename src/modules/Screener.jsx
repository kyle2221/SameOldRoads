import { useState } from 'react'
import { useTick } from '../hooks/useMarket'
import { market } from '../services/marketData'
import { UNIVERSE, SECTORS } from '../data/universe'
import { useStore } from '../store'
import { fmtPrice, fmtPct, fmtCompact, fmtNum, dirClass } from '../utils/format'

const TYPES = [['all', 'All'], ['equity', 'Equities'], ['etf', 'ETFs'], ['index', 'Indices'], ['fx', 'FX'], ['crypto', 'Crypto'], ['future', 'Futures'], ['rate', 'Rates']]

const SORTS = [
  ['symbol', 'Symbol', false], ['changePct', '%Chg', true], ['last', 'Last', true],
  ['mktCap', 'Mkt Cap', true], ['pe', 'P/E', true], ['divYield', 'Div %', true], ['beta', 'Beta', true],
]

export default function Screener() {
  useTick()
  const { loadSecurity, symbol, addSymbol, activeWatchlist } = useStore()
  const [type, setType] = useState('all')
  const [sector, setSector] = useState('all')
  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState('mktCap')
  const [dir, setDir] = useState(-1)

  let rows = UNIVERSE.filter((s) => (type === 'all' || s.type === type))
  if (type === 'equity' && sector !== 'all') rows = rows.filter((s) => s.sector === sector)
  if (q.trim()) rows = rows.filter((s) => s.symbol.includes(q.toUpperCase()) || s.name.toUpperCase().includes(q.toUpperCase()))

  rows = rows.map((s) => {
    const quote = market.getQuote(s.symbol)
    return { ...s, last: quote.last, changePct: quote.changePct, change: quote.change, digits: quote.digits, volume: quote.volume }
  })
  rows.sort((a, b) => {
    if (sortKey === 'symbol') return dir * a.symbol.localeCompare(b.symbol)
    const av = a[sortKey] ?? -Infinity, bv = b[sortKey] ?? -Infinity
    return dir * (av - bv)
  })

  const setSort = (k) => { if (k === sortKey) setDir((d) => -d); else { setSortKey(k); setDir(k === 'symbol' ? 1 : -1) } }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TYPES.map(([k, l]) => <button key={k} className={`chip ${type === k ? 'active' : ''}`} onClick={() => { setType(k); setSector('all') }}>{l}</button>)}
        {type === 'equity' && (
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="field" style={{ width: 'auto', height: 26, padding: '2px 8px', fontSize: 11 }}>
            <option value="all">All Sectors</option>
            {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="field" style={{ width: 150, height: 28, marginLeft: 'auto', fontSize: 11.5 }} />
        <span className="dim mono" style={{ fontSize: 10.5 }}>{rows.length} results</span>
      </div>

      <div className="thin-scroll" style={{ flex: 1, overflow: 'auto' }}>
        <table className="dt">
          <thead>
            <tr>
              <th className="l">Symbol</th><th className="l">Name</th>
              {SORTS.slice(1).map(([k, l]) => (
                <th key={k} onClick={() => setSort(k)} style={{ cursor: 'pointer', color: sortKey === k ? 'var(--amber)' : undefined }}>
                  {l}{sortKey === k ? (dir === -1 ? ' ↓' : ' ↑') : ''}
                </th>
              ))}
              <th style={{ width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.symbol} className={r.symbol === symbol ? 'sel' : ''} onClick={() => loadSecurity(r.symbol)}>
                <td className="l"><span className="sym">{r.symbol}</span></td>
                <td className="l"><span className="name">{r.name}</span></td>
                <td><span className={`num ${dirClass(r.change)}`}>{fmtPct(r.changePct)}</span></td>
                <td><span className="num">{fmtPrice(r.last, r.digits)}</span></td>
                <td><span className="num muted">{r.mktCap ? fmtCompact(r.mktCap) : '—'}</span></td>
                <td><span className="num muted">{r.pe ? fmtNum(r.pe, 1) : '—'}</span></td>
                <td><span className="num muted">{r.divYield != null ? `${fmtNum(r.divYield, 2)}%` : '—'}</span></td>
                <td><span className="num muted">{r.beta != null ? fmtNum(r.beta, 2) : '—'}</span></td>
                <td>
                  <button title={`Add to ${activeWatchlist}`} onClick={(e) => { e.stopPropagation(); addSymbol(activeWatchlist, r.symbol) }}
                          style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1 }}>+</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
