import { useQuotes, useThrottledTick } from '../hooks/useMarket'
import { useStore } from '../store'
import { market } from '../services/marketData'
import { fmtPrice, fmtPct, dirClass, arrow } from '../utils/format'
import Sparkline from '../components/Sparkline'
import WatchTable from '../components/WatchTable'
import Panel from '../components/Panel'
import PriceChart from '../components/PriceChart'
import NewsModule from './NewsModule'

const STRIP = ['SPX', 'NDX', 'DJI', 'RUT', 'VIX', 'BTC', 'ETH', 'CL', 'GC', 'US10Y', 'DXY', 'EURUSD']

function IndexStrip() {
  const quotes = useQuotes(STRIP)
  const { loadSecurity, symbol } = useStore()
  return (
    <div className="thin-scroll" style={{ display: 'flex', gap: 8, padding: '10px 12px', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
      {quotes.map((q) => {
        const dc = dirClass(q.change)
        return (
          <button key={q.symbol} onClick={() => loadSecurity(q.symbol)}
            style={{ flex: '0 0 auto', minWidth: 142, textAlign: 'left', background: 'var(--panel)', border: `1px solid ${q.symbol === symbol ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: 7, padding: '8px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{q.symbol}</span>
              <Sparkline data={q.spark} width={48} height={16} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className={`num ${dc}`} style={{ fontSize: 14, fontWeight: 700 }}>{fmtPrice(q.last, q.digits)}</span>
              <span className={`num ${dc}`} style={{ fontSize: 10.5, fontWeight: 700 }}>{arrow(q.change)} {fmtPct(q.changePct)}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function MiniMovers() {
  useThrottledTick(2500)
  const { loadSecurity } = useStore()
  const gainers = market.movers('gainers', 7)
  const losers = market.movers('losers', 7)
  const Row = ({ q }) => (
    <tr onClick={() => loadSecurity(q.symbol)}>
      <td className="l"><span className="sym">{q.symbol}</span></td>
      <td><span className="num">{fmtPrice(q.last, q.digits)}</span></td>
      <td><span className={`num ${dirClass(q.changePct)}`}>{fmtPct(q.changePct)}</span></td>
    </tr>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', borderBottom: '1px solid var(--border)' }} className="thin-scroll">
        <div className="dim" style={{ fontSize: 9, padding: '4px 9px', letterSpacing: 0.6 }}>▲ GAINERS</div>
        <table className="dt"><tbody>{gainers.map((q) => <Row key={q.symbol} q={q} />)}</tbody></table>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }} className="thin-scroll">
        <div className="dim" style={{ fontSize: 9, padding: '4px 9px', letterSpacing: 0.6 }}>▼ LOSERS</div>
        <table className="dt"><tbody>{losers.map((q) => <Row key={q.symbol} q={q} />)}</tbody></table>
      </div>
    </div>
  )
}

function ChartPanel() {
  const { symbol, navigate } = useStore()
  const quotes = useQuotes([symbol])
  const q = quotes[0]
  return (
    <Panel
      title={q ? q.name : symbol}
      tag={symbol}
      tools={q && <span className={`num ${dirClass(q.change)}`} style={{ fontSize: 12, fontWeight: 700 }}>{fmtPrice(q.last, q.digits)} ({fmtPct(q.changePct)})</span>}
      bodyStyle={{ overflow: 'hidden' }}
    >
      <div style={{ height: '100%', minHeight: 0, position: 'relative' }}>
        <PriceChart symbol={symbol} tf="1d" chartType="candles" showVolume mas={[20, 50]} />
        <button onClick={() => navigate('chart')} className="chip" style={{ position: 'absolute', top: 8, right: 10, zIndex: 4 }}>Open GP →</button>
      </div>
    </Panel>
  )
}

export default function Dashboard() {
  const { watchlists, activeWatchlist } = useStore()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <IndexStrip />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.55fr 1fr 0.95fr', gridTemplateRows: '1fr 1fr', gap: 8, padding: 8 }}>
        <div style={{ gridColumn: '1', gridRow: '1 / span 2', minHeight: 0 }}><ChartPanel /></div>
        <div style={{ gridColumn: '2', gridRow: '1 / span 2', minHeight: 0 }}>
          <Panel title={`Watchlist · ${activeWatchlist}`} tag="W">
            <WatchTable symbols={watchlists[activeWatchlist] || []} columns={['last', 'pct', 'spark']} showName={false} />
          </Panel>
        </div>
        <div style={{ gridColumn: '3', gridRow: '1', minHeight: 0 }}>
          <Panel title="Movers" tag="TOP"><MiniMovers /></Panel>
        </div>
        <div style={{ gridColumn: '3', gridRow: '2', minHeight: 0 }}>
          <Panel title="Top News" tag="N"><NewsModule embedded /></Panel>
        </div>
      </div>
    </div>
  )
}
