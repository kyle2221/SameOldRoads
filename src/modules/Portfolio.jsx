import { useTick } from '../hooks/useMarket'
import { useStore } from '../store'
import { market } from '../services/marketData'
import { ACCOUNT, POSITIONS } from '../data/portfolio'
import { fmtPrice, fmtNum, fmtCompact, fmtSigned, fmtPct, dirClass } from '../utils/format'
import Panel from '../components/Panel'

function Card({ label, value, sub, cls }) {
  return (
    <div style={{ flex: 1, minWidth: 150, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
      <div className="dim" style={{ fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div className={`num ${cls || ''}`} style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: cls ? undefined : 'var(--text)' }}>{value}</div>
      {sub && <div className={`num ${cls || 'dim'}`} style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function Portfolio() {
  useTick()
  const { loadSecurity, symbol } = useStore()

  const rows = POSITIONS.map((p) => {
    const q = market.getQuote(p.symbol)
    const last = q ? q.last : p.avgCost
    const mv = last * p.qty
    const cost = p.avgCost * p.qty
    const upl = mv - cost
    const uplPct = (upl / cost) * 100
    const dayPL = q ? q.change * p.qty : 0
    return { ...p, q, last, mv, cost, upl, uplPct, dayPL, digits: q ? q.digits : 2 }
  })

  const totMV = rows.reduce((s, r) => s + r.mv, 0)
  const totCost = rows.reduce((s, r) => s + r.cost, 0)
  const totUPL = totMV - totCost
  const totDay = rows.reduce((s, r) => s + r.dayPL, 0)
  const netLiq = totMV + ACCOUNT.cash
  const dayPctEq = (totDay / (netLiq - totDay)) * 100
  rows.sort((a, b) => b.mv - a.mv)
  const maxW = Math.max(...rows.map((r) => r.mv))

  return (
    <div className="thin-scroll" style={{ height: '100%', overflow: 'auto', padding: 12 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <Card label="Net Liquidation" value={`$${fmtCompact(netLiq)}`} sub={`${ACCOUNT.name} · ${ACCOUNT.id}`} />
        <Card label="Day P&L" value={`${totDay >= 0 ? '+' : '-'}$${fmtCompact(Math.abs(totDay))}`} sub={fmtPct(dayPctEq)} cls={dirClass(totDay)} />
        <Card label="Total Unrealized P&L" value={`${totUPL >= 0 ? '+' : '-'}$${fmtCompact(Math.abs(totUPL))}`} sub={fmtPct((totUPL / totCost) * 100)} cls={dirClass(totUPL)} />
        <Card label="Cash" value={`$${fmtCompact(ACCOUNT.cash)}`} sub={`Invested ${fmtCompact(totMV)}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 12 }}>
        <Panel title="Positions" tag="PRTU" tools={<span className="dim" style={{ fontSize: 10 }}>{rows.length} holdings</span>}>
          <table className="dt">
            <thead><tr><th className="l">Symbol</th><th>Qty</th><th>Avg Cost</th><th>Last</th><th>Mkt Value</th><th>Day P&L</th><th>Unreal P&L</th><th>%</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.symbol} className={r.symbol === symbol ? 'sel' : ''} onClick={() => loadSecurity(r.symbol)}>
                  <td className="l"><span className="sym">{r.symbol}</span></td>
                  <td><span className="num muted">{fmtNum(r.qty, r.qty % 1 ? 2 : 0)}</span></td>
                  <td><span className="num muted">{fmtPrice(r.avgCost, r.digits)}</span></td>
                  <td><span className="num">{fmtPrice(r.last, r.digits)}</span></td>
                  <td><span className="num">{fmtCompact(r.mv)}</span></td>
                  <td><span className={`num ${dirClass(r.dayPL)}`}>{fmtSigned(r.dayPL, 0)}</span></td>
                  <td><span className={`num ${dirClass(r.upl)}`}>{fmtSigned(r.upl, 0)}</span></td>
                  <td><span className={`num ${dirClass(r.upl)}`}>{fmtPct(r.uplPct)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Allocation" tag="ALLO">
          <div style={{ padding: 12 }}>
            {rows.map((r) => (
              <div key={r.symbol} style={{ marginBottom: 9, cursor: 'pointer' }} onClick={() => loadSecurity(r.symbol)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{r.symbol}</span>
                  <span className="num muted" style={{ fontSize: 10.5 }}>{fmtNum((r.mv / totMV) * 100, 1)}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--panel-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(r.mv / maxW) * 100}%`, height: '100%', background: r.upl >= 0 ? 'linear-gradient(90deg, var(--amber-deep), var(--amber))' : 'linear-gradient(90deg, #7a2a2c, var(--down))', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
