import { useQuote } from '../hooks/useMarket'
import { fmtPrice, fmtSigned, fmtPct, fmtCompact, dirClass, arrow } from '../utils/format'

function Stat({ label, value, cls }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
      <span className="dim" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span className={`num ${cls || ''}`} style={{ fontSize: 11.5, color: cls ? undefined : 'var(--text)' }}>{value}</span>
    </div>
  )
}

export default function QuoteHeader({ symbol }) {
  const q = useQuote(symbol)
  if (!q) return null
  const dc = dirClass(q.change)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', background: 'var(--panel)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: 0.5 }}>{q.symbol}</span>
        <span className="muted" style={{ fontSize: 12, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.name}</span>
        <span className="pill flat">{q.exchange}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className={`num ${dc}`} style={{ fontSize: 26, fontWeight: 800 }}>{fmtPrice(q.last, q.digits)}</span>
        <span className={`num ${dc}`} style={{ fontSize: 13, fontWeight: 700 }}>
          {arrow(q.change)} {fmtSigned(q.change, q.digits)} ({fmtPct(q.changePct)})
        </span>
        <span className="dim" style={{ fontSize: 10 }}>{q.currency}</span>
      </div>

      <div style={{ display: 'flex', gap: 22, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <Stat label="Bid" value={fmtPrice(q.bid, q.digits)} />
        <Stat label="Ask" value={fmtPrice(q.ask, q.digits)} />
        <Stat label="Open" value={fmtPrice(q.open, q.digits)} />
        <Stat label="Prev" value={fmtPrice(q.prevClose, q.digits)} />
        <Stat label="Day Low" value={fmtPrice(q.low, q.digits)} cls="down" />
        <Stat label="Day High" value={fmtPrice(q.high, q.digits)} cls="up" />
        {q.type !== 'index' && q.type !== 'rate' && <Stat label="Volume" value={fmtCompact(q.volume)} />}
        {q.meta.mktCap && <Stat label="Mkt Cap" value={fmtCompact(q.meta.mktCap)} />}
      </div>
    </div>
  )
}
