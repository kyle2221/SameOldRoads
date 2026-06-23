import { useQuotes } from '../hooks/useMarket'
import { useStore } from '../store'
import { fmtPrice, fmtPct, dirClass, arrow } from '../utils/format'

const TAPE = ['SPX', 'NDX', 'DJI', 'RUT', 'VIX', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AMD', 'BTC', 'ETH', 'SOL', 'EURUSD', 'USDJPY', 'GBPUSD', 'CL', 'GC', 'US10Y', 'DXY']

function Item({ q, onClick }) {
  const dc = dirClass(q.change)
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 24, whiteSpace: 'nowrap', borderRight: '1px solid var(--border)' }}>
      <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{q.symbol}</span>
      <span className="num" style={{ fontSize: 11, color: 'var(--text-2)' }}>{fmtPrice(q.last, q.digits)}</span>
      <span className={`num ${dc}`} style={{ fontSize: 10.5, fontWeight: 700 }}>{arrow(q.change)} {fmtPct(q.changePct)}</span>
    </button>
  )
}

export default function TickerTape() {
  const quotes = useQuotes(TAPE)
  const { loadSecurity } = useStore()
  const row = (k) => quotes.map((q) => <Item key={k + q.symbol} q={q} onClick={() => loadSecurity(q.symbol)} />)
  return (
    <div style={{ height: 25, background: 'var(--panel)', borderBottom: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 70s linear infinite' }}
           onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
           onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}>
        {row('a')}{row('b')}
      </div>
    </div>
  )
}
