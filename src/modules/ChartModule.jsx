import { useState } from 'react'
import { useStore } from '../store'
import QuoteHeader from '../components/QuoteHeader'
import PriceChart from '../components/PriceChart'

const TFS = ['1m', '5m', '15m', '1h', '1d', '1w']
const TYPES = [['candles', 'Candles'], ['line', 'Line'], ['area', 'Area']]

export default function ChartModule() {
  const { symbol, chartTf, setChartTf } = useStore()
  const [type, setType] = useState('candles')
  const [showVol, setShowVol] = useState(true)
  const [ma20, setMa20] = useState(true)
  const [ma50, setMa50] = useState(true)

  const mas = [ma20 && 20, ma50 && 50].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <QuoteHeader symbol={symbol} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TFS.map((tf) => <button key={tf} className={`chip ${chartTf === tf ? 'active' : ''}`} onClick={() => setChartTf(tf)}>{tf.toUpperCase()}</button>)}
        </div>
        <span style={{ color: 'var(--border-2)' }}>│</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {TYPES.map(([id, label]) => <button key={id} className={`chip ${type === id ? 'active' : ''}`} onClick={() => setType(id)}>{label}</button>)}
        </div>
        <span style={{ color: 'var(--border-2)' }}>│</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`chip ${ma20 ? 'active' : ''}`} onClick={() => setMa20((v) => !v)}>MA 20</button>
          <button className={`chip ${ma50 ? 'active' : ''}`} onClick={() => setMa50((v) => !v)}>MA 50</button>
          <button className={`chip ${showVol ? 'active' : ''}`} onClick={() => setShowVol((v) => !v)}>Volume</button>
        </div>
        <span className="dim" style={{ marginLeft: 'auto', fontSize: 10 }}>Powered by lightweight-charts™</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: 'var(--panel)' }}>
        <PriceChart key={symbol + chartTf + type} symbol={symbol} tf={chartTf} chartType={type} showVolume={showVol} mas={mas} />
      </div>
    </div>
  )
}
