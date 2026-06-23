import { market } from '../services/marketData'
import { useThrottledTick } from '../hooks/useMarket'
import { useStore } from '../store'
import { fmtPrice, fmtPct, fmtCompact, dirClass } from '../utils/format'
import Panel from '../components/Panel'

function MoverTable({ rows, kind }) {
  const { loadSecurity, symbol } = useStore()
  return (
    <table className="dt">
      <thead><tr><th className="l" style={{ width: 22 }}>#</th><th className="l">Symbol</th><th>Last</th><th>%Chg</th>{kind === 'active' ? <th>$ Vol</th> : <th>Chg</th>}</tr></thead>
      <tbody>
        {rows.map((q, i) => (
          <tr key={q.symbol} className={q.symbol === symbol ? 'sel' : ''} onClick={() => loadSecurity(q.symbol)}>
            <td className="l dim">{i + 1}</td>
            <td className="l"><span className="sym">{q.symbol}</span> <span className="name" style={{ marginLeft: 4 }}>{q.name.length > 18 ? q.name.slice(0, 18) + '…' : q.name}</span></td>
            <td><span className="num">{fmtPrice(q.last, q.digits)}</span></td>
            <td><span className={`num ${dirClass(q.changePct)}`}>{fmtPct(q.changePct)}</span></td>
            {kind === 'active'
              ? <td><span className="num muted">{fmtCompact(q.volume * q.last)}</span></td>
              : <td><span className={`num ${dirClass(q.change)}`}>{q.change > 0 ? '+' : ''}{fmtPrice(q.change, q.digits)}</span></td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function MoversModule() {
  useThrottledTick(2500)
  const gainers = market.movers('gainers', 15)
  const losers = market.movers('losers', 15)
  const active = market.movers('active', 15)

  return (
    <div style={{ height: '100%', padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <Panel title="Top Gainers" tag="TOP" tools={<span className="pill up">▲ {gainers.length}</span>}>
        <MoverTable rows={gainers} kind="gainers" />
      </Panel>
      <Panel title="Top Losers" tag="BOT" tools={<span className="pill down">▼ {losers.length}</span>}>
        <MoverTable rows={losers} kind="losers" />
      </Panel>
      <Panel title="Most Active" tag="MOST" tools={<span className="pill cyan">$ vol</span>}>
        <MoverTable rows={active} kind="active" />
      </Panel>
    </div>
  )
}
