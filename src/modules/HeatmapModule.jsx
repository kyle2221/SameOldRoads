import { market } from '../services/marketData'
import { useThrottledTick } from '../hooks/useMarket'
import { useStore } from '../store'
import { fmtPct } from '../utils/format'

function heatColor(pct) {
  const x = Math.max(-3, Math.min(3, pct)) / 3
  if (x >= 0) return `rgba(30,203,129,${0.1 + 0.6 * x})`
  return `rgba(255,77,79,${0.1 + 0.6 * -x})`
}

export default function HeatmapModule() {
  useThrottledTick(2000)
  const { loadSecurity } = useStore()
  const sectors = market.sectorPerformance()
  const totalCap = sectors.reduce((s, x) => s + x.cap, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
        <span className="amber mono" style={{ fontWeight: 700, fontSize: 12 }}>MARKET HEATMAP</span>
        <span className="dim" style={{ fontSize: 11 }}>tile size = market cap · color = daily % change</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dim" style={{ fontSize: 10 }}>-3%</span>
          <div style={{ width: 120, height: 8, borderRadius: 4, background: 'linear-gradient(90deg, var(--down), #1a1e25, var(--up))' }} />
          <span className="dim" style={{ fontSize: 10 }}>+3%</span>
        </div>
      </div>

      <div className="thin-scroll" style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
        {sectors.map((sec) => {
          const grow = Math.max(0.6, (sec.cap / totalCap) * sectors.length)
          return (
            <div key={sec.sector} style={{ flex: `${grow} 1 240px`, minWidth: 220, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--panel)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 9px', background: 'var(--panel-3)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{sec.sector}</span>
                <span className={`num ${sec.changePct >= 0 ? 'up' : 'down'}`} style={{ fontSize: 10.5, fontWeight: 700 }}>{fmtPct(sec.changePct)}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 2 }}>
                {sec.members.sort((a, b) => b.meta.mktCap - a.meta.mktCap).map((q) => {
                  const w = Math.max(0.8, Math.sqrt(q.meta.mktCap / 1e9) / 8)
                  return (
                    <button key={q.symbol} onClick={() => loadSecurity(q.symbol)}
                      title={`${q.name}  ${fmtPct(q.changePct)}`}
                      style={{ flex: `${w} 1 60px`, minWidth: 58, height: 50, background: heatColor(q.changePct), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 3, border: '1px solid rgba(0,0,0,0.3)' }}>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{q.symbol}</span>
                      <span className="num" style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{fmtPct(q.changePct)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
