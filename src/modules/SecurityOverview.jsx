import { useStore } from '../store'
import { useQuote } from '../hooks/useMarket'
import { BY_SYMBOL, EQUITY_SYMBOLS } from '../data/universe'
import { seeded } from '../utils/rng'
import { fmtPrice, fmtCompact, fmtPct, fmtNum, dirClass } from '../utils/format'
import QuoteHeader from '../components/QuoteHeader'
import PriceChart from '../components/PriceChart'
import WatchTable from '../components/WatchTable'
import Panel from '../components/Panel'

function StatRow({ label, value, cls }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(27,31,39,0.6)' }}>
      <span className="muted" style={{ fontSize: 11.5 }}>{label}</span>
      <span className={`num ${cls || ''}`} style={{ fontSize: 11.5, color: cls ? undefined : 'var(--text)' }}>{value}</span>
    </div>
  )
}

// synthetic but deterministic performance returns
function perf(symbol, dayPct) {
  const r = seeded(symbol + 'perf')
  const mk = (scale) => (r() - 0.42) * scale
  return { '1D': dayPct, '1W': mk(8), '1M': mk(16), '3M': mk(28), 'YTD': mk(44), '1Y': mk(70) }
}

// synthetic multi-year financials from market cap / eps
function financials(meta, price) {
  const r = seeded(meta.symbol + 'fin')
  const shares = meta.mktCap / price
  const marginBySector = { Technology: 0.26, Communication: 0.22, 'Consumer Disc.': 0.10, 'Consumer Staples': 0.11, Healthcare: 0.18, Financials: 0.30, Energy: 0.12, Industrials: 0.13, Materials: 0.14, 'Index ETF': 0.0 }
  const netMargin = (marginBySector[meta.sector] || 0.15) * (0.85 + r() * 0.3)
  const eps0 = meta.eps && meta.eps > 0 ? meta.eps : 1
  const netIncome0 = eps0 * shares
  const revenue0 = netIncome0 / netMargin
  const growth = 0.04 + r() * 0.22
  const years = []
  const thisYear = new Date().getFullYear()
  for (let i = 3; i >= 0; i--) {
    const f = 1 / (1 + growth) ** i
    const rev = revenue0 * f
    const ni = netIncome0 * f * (0.9 + r() * 0.2)
    const gross = rev * (netMargin + 0.32 + r() * 0.05)
    const op = rev * (netMargin + 0.06)
    years.push({
      year: thisYear - i,
      revenue: rev, gross, op, net: ni,
      eps: ni / shares, fcf: ni * (0.78 + r() * 0.25),
      grossM: (gross / rev) * 100, opM: (op / rev) * 100, netM: (ni / rev) * 100,
    })
  }
  return { years, growth: growth * 100, shares }
}

function Tab({ id, label, active, onClick }) {
  return <button className={`chip ${active ? 'active' : ''}`} onClick={onClick}>{label}</button>
}

export default function SecurityOverview() {
  const { symbol, secTab, setSecTab } = useStore()
  const q = useQuote(symbol)
  const meta = BY_SYMBOL[symbol]
  if (!q || !meta) return null

  const isEquity = meta.type === 'equity' || meta.type === 'etf'
  const rangePos = meta.high52 && meta.low52 ? Math.max(0, Math.min(1, (q.last - meta.low52) / (meta.high52 - meta.low52))) : 0.5
  const pf = perf(symbol, q.changePct)
  const peers = EQUITY_SYMBOLS.filter((s) => BY_SYMBOL[s].sector === meta.sector && s !== symbol)
    .sort((a, b) => BY_SYMBOL[b].mktCap - BY_SYMBOL[a].mktCap).slice(0, 7)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <QuoteHeader symbol={symbol} />
      <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <Tab id="overview" label="Overview" active={secTab === 'overview'} onClick={() => setSecTab('overview')} />
        {isEquity && <Tab id="financials" label="Financials" active={secTab === 'financials'} onClick={() => setSecTab('financials')} />}
      </div>

      {secTab === 'financials' && isEquity
        ? <FinancialsTab meta={meta} price={q.last} />
        : <OverviewTab q={q} meta={meta} rangePos={rangePos} pf={pf} peers={peers} symbol={symbol} isEquity={isEquity} />}
    </div>
  )
}

function OverviewTab({ q, meta, rangePos, pf, peers, symbol, isEquity }) {
  return (
    <div className="thin-scroll" style={{ flex: 1, overflow: 'auto', padding: 12, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
      {/* left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <Panel title="Price" tag="GP" tools={<span className="dim" style={{ fontSize: 10 }}>1D · candles</span>}>
          <div style={{ height: 280 }}><PriceChart symbol={symbol} tf="1d" chartType="candles" showVolume mas={[50]} /></div>
        </Panel>

        <Panel title="Performance" tag="PERF">
          <div style={{ display: 'flex', gap: 8, padding: 12, flexWrap: 'wrap' }}>
            {Object.entries(pf).map(([k, v]) => (
              <div key={k} style={{ flex: 1, minWidth: 76, background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
                <div className="dim" style={{ fontSize: 9.5, letterSpacing: 0.5 }}>{k}</div>
                <div className={`num ${dirClass(v)}`} style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>{fmtPct(v)}</div>
              </div>
            ))}
          </div>
        </Panel>

        {peers.length > 0 && (
          <Panel title={`${meta.sector} Peers`} tag="PEERS">
            <WatchTable symbols={peers} columns={['last', 'pct', 'mcap']} showName />
          </Panel>
        )}
      </div>

      {/* right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
        <Panel title="Key Statistics" tag="DES">
          <div style={{ padding: '4px 12px 12px' }}>
            {meta.mktCap && <StatRow label="Market Cap" value={fmtCompact(meta.mktCap)} />}
            {meta.pe && <StatRow label="P/E Ratio" value={fmtNum(meta.pe, 1)} />}
            {meta.eps != null && <StatRow label="EPS (TTM)" value={`$${fmtNum(meta.eps, 2)}`} cls={meta.eps < 0 ? 'down' : ''} />}
            {meta.divYield != null && <StatRow label="Dividend Yield" value={meta.divYield ? `${fmtNum(meta.divYield, 2)}%` : '—'} />}
            {meta.beta != null && <StatRow label="Beta" value={fmtNum(meta.beta, 2)} />}
            <StatRow label="Day Range" value={`${fmtPrice(q.low, q.digits)} – ${fmtPrice(q.high, q.digits)}`} />
            {meta.low52 && <StatRow label="52-Week Range" value={`${fmtPrice(meta.low52, q.digits)} – ${fmtPrice(meta.high52, q.digits)}`} />}
            {isEquity && q.type !== 'index' && <StatRow label="Volume" value={fmtCompact(q.volume)} />}
            <StatRow label="Exchange" value={meta.exchange} />
            <StatRow label="Sector" value={meta.sector} />
            <StatRow label="Currency" value={meta.currency} />
          </div>

          {meta.low52 && (
            <div style={{ padding: '0 12px 14px' }}>
              <div className="dim" style={{ fontSize: 9.5, marginBottom: 6 }}>52-WEEK RANGE</div>
              <div style={{ position: 'relative', height: 6, background: 'var(--panel-3)', borderRadius: 3 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${rangePos * 100}%`, background: 'linear-gradient(90deg, var(--down), var(--gold), var(--up))', borderRadius: 3, opacity: 0.5 }} />
                <div style={{ position: 'absolute', left: `calc(${rangePos * 100}% - 4px)`, top: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--amber)', border: '2px solid var(--bg)' }} />
              </div>
              <div className="num" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-3)' }}>
                <span>{fmtPrice(meta.low52, q.digits)}</span><span>{fmtPrice(meta.high52, q.digits)}</span>
              </div>
            </div>
          )}
        </Panel>

        {meta.desc && (
          <Panel title="About" tag="CO">
            <p style={{ padding: 12, fontSize: 12, lineHeight: 1.6, color: 'var(--text-2)', margin: 0 }}>{meta.desc}</p>
          </Panel>
        )}
      </div>
    </div>
  )
}

function FinancialsTab({ meta, price }) {
  const { years, growth } = financials(meta, price)
  const latest = years[years.length - 1]
  const rows = [
    ['Revenue', (y) => fmtCompact(y.revenue)],
    ['Gross Profit', (y) => fmtCompact(y.gross)],
    ['Operating Income', (y) => fmtCompact(y.op)],
    ['Net Income', (y) => fmtCompact(y.net)],
    ['EPS (diluted)', (y) => `$${fmtNum(y.eps, 2)}`],
    ['Free Cash Flow', (y) => fmtCompact(y.fcf)],
  ]
  const maxRev = Math.max(...years.map((y) => y.revenue))

  return (
    <div className="thin-scroll" style={{ flex: 1, overflow: 'auto', padding: 12, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
      <Panel title="Income Statement" tag="FA" tools={<span className="dim" style={{ fontSize: 10 }}>USD · annual</span>}>
        <table className="dt">
          <thead><tr><th className="l">Metric</th>{years.map((y) => <th key={y.year}>{y.year}</th>)}</tr></thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} style={{ cursor: 'default' }}>
                <td className="l muted" style={{ fontFamily: 'var(--ui)' }}>{label}</td>
                {years.map((y) => <td key={y.year}>{fn(y)}</td>)}
              </tr>
            ))}
            <tr style={{ cursor: 'default' }}>
              <td className="l dim" style={{ fontFamily: 'var(--ui)' }}>Gross Margin</td>
              {years.map((y) => <td key={y.year} className="muted">{fmtNum(y.grossM, 1)}%</td>)}
            </tr>
            <tr style={{ cursor: 'default' }}>
              <td className="l dim" style={{ fontFamily: 'var(--ui)' }}>Net Margin</td>
              {years.map((y) => <td key={y.year} className="muted">{fmtNum(y.netM, 1)}%</td>)}
            </tr>
          </tbody>
        </table>
      </Panel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Panel title="Revenue Trend" tag="GF">
          <div style={{ padding: 14, display: 'flex', alignItems: 'flex-end', gap: 10, height: 150 }}>
            {years.map((y) => (
              <div key={y.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                <span className="num muted" style={{ fontSize: 9.5 }}>{fmtCompact(y.revenue)}</span>
                <div style={{ width: '70%', height: `${(y.revenue / maxRev) * 100}%`, background: 'linear-gradient(180deg, var(--amber), var(--amber-deep))', borderRadius: '3px 3px 0 0', minHeight: 4 }} />
                <span className="dim" style={{ fontSize: 9.5 }}>{y.year}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Highlights" tag="KPI">
          <div style={{ padding: '4px 12px 12px' }}>
            <StatRow label="Revenue (LTM)" value={fmtCompact(latest.revenue)} />
            <StatRow label="Revenue Growth" value={fmtPct(growth)} cls={dirClass(growth)} />
            <StatRow label="Net Margin" value={`${fmtNum(latest.netM, 1)}%`} />
            <StatRow label="Operating Margin" value={`${fmtNum(latest.opM, 1)}%`} />
            <StatRow label="EPS (LTM)" value={`$${fmtNum(latest.eps, 2)}`} />
            <StatRow label="P/E" value={meta.pe ? fmtNum(meta.pe, 1) : '—'} />
          </div>
          <div className="dim" style={{ padding: '0 12px 12px', fontSize: 10, lineHeight: 1.5 }}>
            Figures are model estimates generated for demonstration. Wire a fundamentals provider to replace.
          </div>
        </Panel>
      </div>
    </div>
  )
}
