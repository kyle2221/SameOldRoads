import { useQuotes } from '../hooks/useMarket'
import { useStore } from '../store'
import { fmtPrice, fmtSigned, fmtPct, fmtCompact, dirClass } from '../utils/format'
import Sparkline from './Sparkline'
import Icon from './Icons'

const COLS = {
  last:  { th: 'Last',   render: (q) => <span key={q.last} className={`num ${q.dir > 0 ? 'fx-up' : q.dir < 0 ? 'fx-down' : ''}`}>{fmtPrice(q.last, q.digits)}</span> },
  chg:   { th: 'Chg',    render: (q) => <span className={`num ${dirClass(q.change)}`}>{fmtSigned(q.change, q.digits)}</span> },
  pct:   { th: '%Chg',   render: (q) => <span className={`num ${dirClass(q.change)}`}>{fmtPct(q.changePct)}</span> },
  bid:   { th: 'Bid',    render: (q) => <span className="num muted">{fmtPrice(q.bid, q.digits)}</span> },
  ask:   { th: 'Ask',    render: (q) => <span className="num muted">{fmtPrice(q.ask, q.digits)}</span> },
  high:  { th: 'High',   render: (q) => <span className="num">{fmtPrice(q.high, q.digits)}</span> },
  low:   { th: 'Low',    render: (q) => <span className="num">{fmtPrice(q.low, q.digits)}</span> },
  vol:   { th: 'Volume', render: (q) => <span className="num muted">{q.type === 'index' ? '—' : fmtCompact(q.volume)}</span> },
  mcap:  { th: 'Mkt Cap',render: (q) => <span className="num muted">{q.meta.mktCap ? fmtCompact(q.meta.mktCap) : '—'}</span> },
  spark: { th: '30D',    render: (q) => <div style={{ display: 'inline-block' }}><Sparkline data={q.spark} /></div> },
}

export default function WatchTable({ symbols, columns = ['last', 'chg', 'pct', 'spark'], showName = true, showRemove = false, listName, onPick }) {
  const quotes = useQuotes(symbols)
  const { symbol: active, loadSecurity, removeSymbol } = useStore()

  if (!symbols || symbols.length === 0) {
    return <div style={{ padding: 20, color: 'var(--text-3)', fontSize: 12, textAlign: 'center' }}>No symbols. Add one with the + above or type a ticker on the command line.</div>
  }

  return (
    <table className="dt">
      <thead>
        <tr>
          <th className="l">Symbol</th>
          {showName && <th className="l">Name</th>}
          {columns.map((c) => <th key={c}>{COLS[c]?.th || c}</th>)}
          {showRemove && <th style={{ width: 28 }}></th>}
        </tr>
      </thead>
      <tbody>
        {quotes.map((q) => (
          <tr key={q.symbol} className={q.symbol === active ? 'sel' : ''}
              onClick={() => (onPick ? onPick(q.symbol) : loadSecurity(q.symbol))}>
            <td className="l"><span className="sym">{q.symbol}</span></td>
            {showName && <td className="l"><span className="name">{q.name}</span></td>}
            {columns.map((c) => <td key={c}>{COLS[c]?.render(q)}</td>)}
            {showRemove && (
              <td>
                <button title="Remove" onClick={(e) => { e.stopPropagation(); removeSymbol(listName, q.symbol) }}
                        style={{ color: 'var(--text-3)', display: 'flex' }}>
                  <Icon name="x" size={13} />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
