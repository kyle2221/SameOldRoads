import { useEffect, useRef, useState } from 'react'
import {
  createChart, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries,
  ColorType, CrosshairMode, LineStyle,
} from 'lightweight-charts'
import { market } from '../services/marketData'
import { fmtPrice, fmtPct } from '../utils/format'

const UP = '#1ecb81', DOWN = '#ff4d4f'
const TF_INTERVAL = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '1d': 86400, '1w': 604800 }

function sma(bars, period) {
  if (bars.length < period) return []
  const out = []
  let sum = 0
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close
    if (i >= period) sum -= bars[i - period].close
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period })
  }
  return out
}

export default function PriceChart({ symbol, tf = '1d', chartType = 'candles', showVolume = true, mas = [20, 50] }) {
  const wrapRef = useRef(null)
  const chartRef = useRef(null)
  const mainRef = useRef(null)
  const volRef = useRef(null)
  const maRefs = useRef([])
  const barsRef = useRef([])
  const lastBarRef = useRef(null)
  const [legend, setLegend] = useState(null)

  // build / rebuild chart when symbol / tf / type change
  useEffect(() => {
    if (!wrapRef.current) return
    const q = market.getQuote(symbol)
    const digits = q ? q.digits : 2
    const intraday = TF_INTERVAL[tf] < 86400

    const chart = createChart(wrapRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#0a0c0f' },
        textColor: '#8a9099',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        attributionLogo: false,
      },
      grid: { vertLines: { color: 'rgba(27,31,39,0.7)' }, horzLines: { color: 'rgba(27,31,39,0.7)' } },
      rightPriceScale: { borderColor: '#1b1f27', scaleMargins: { top: 0.08, bottom: showVolume ? 0.26 : 0.06 } },
      timeScale: { borderColor: '#1b1f27', timeVisible: intraday, secondsVisible: false, rightOffset: 4 },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#39414d', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#262c36' },
        horzLine: { color: '#39414d', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#262c36' },
      },
    })
    chartRef.current = chart

    const bars = market.getBars(symbol, tf)
    barsRef.current = bars
    lastBarRef.current = bars.length ? { ...bars[bars.length - 1] } : null

    // price format
    const priceFormat = { type: 'price', precision: digits, minMove: 1 / 10 ** digits }

    let main
    if (chartType === 'line') {
      main = chart.addSeries(LineSeries, { color: '#36c2ff', lineWidth: 2, priceFormat })
      main.setData(bars.map((b) => ({ time: b.time, value: b.close })))
    } else if (chartType === 'area') {
      main = chart.addSeries(AreaSeries, {
        lineColor: '#36c2ff', topColor: 'rgba(54,194,255,0.28)', bottomColor: 'rgba(54,194,255,0)',
        lineWidth: 2, priceFormat,
      })
      main.setData(bars.map((b) => ({ time: b.time, value: b.close })))
    } else {
      main = chart.addSeries(CandlestickSeries, {
        upColor: UP, downColor: DOWN, borderVisible: false, wickUpColor: UP, wickDownColor: DOWN, priceFormat,
      })
      main.setData(bars)
    }
    mainRef.current = main

    // moving averages
    const maColors = ['#ffae00', '#b07cff', '#36c2ff']
    maRefs.current = (mas || []).map((p, i) => {
      const s = chart.addSeries(LineSeries, { color: maColors[i % maColors.length], lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false })
      s.setData(sma(bars, p))
      return { period: p, series: s, color: maColors[i % maColors.length] }
    })

    // volume
    if (showVolume) {
      const vol = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'vol' })
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } })
      vol.setData(bars.map((b) => ({ time: b.time, value: b.volume, color: b.close >= b.open ? 'rgba(30,203,129,0.45)' : 'rgba(255,77,79,0.45)' })))
      volRef.current = vol
    }

    chart.timeScale().fitContent()

    // crosshair legend
    const setFromBar = (b) => {
      if (!b) return
      setLegend({ o: b.open, h: b.high, l: b.low, c: b.close, v: b.volume, chg: ((b.close - b.open) / b.open) * 100 })
    }
    setFromBar(lastBarRef.current)
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) { setFromBar(lastBarRef.current); return }
      const d = param.seriesData.get(main)
      if (!d) return
      if (d.open != null) setLegend({ o: d.open, h: d.high, l: d.low, c: d.close, v: null, chg: ((d.close - d.open) / d.open) * 100 })
      else setLegend({ o: null, h: null, l: null, c: d.value, v: null, chg: null })
    })

    return () => { chart.remove(); chartRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, tf, chartType, showVolume, (mas || []).join(',')])

  // live updates: roll/refresh the last bar from the quote engine
  useEffect(() => {
    const interval = TF_INTERVAL[tf] || 86400
    return market.subscribeSymbol(symbol, (q) => {
      if (!mainRef.current || !lastBarRef.current) return
      const now = Math.floor(Date.now() / 1000)
      const bucket = now - (now % interval)
      let lb = lastBarRef.current
      if (bucket > lb.time) {
        // roll a new bar
        lb = { time: bucket, open: q.last, high: q.last, low: q.last, close: q.last, volume: 0 }
        barsRef.current.push(lb)
      } else {
        lb.close = q.last
        lb.high = Math.max(lb.high, q.last)
        lb.low = Math.min(lb.low, q.last)
        lb.volume += 50_000
      }
      lastBarRef.current = lb
      if (chartType === 'candles') mainRef.current.update(lb)
      else mainRef.current.update({ time: lb.time, value: lb.close })
      if (volRef.current) volRef.current.update({ time: lb.time, value: lb.volume, color: lb.close >= lb.open ? 'rgba(30,203,129,0.45)' : 'rgba(255,77,79,0.45)' })
      setLegend({ o: lb.open, h: lb.high, l: lb.low, c: lb.close, v: lb.volume, chg: ((lb.close - lb.open) / lb.open) * 100 })
    })
  }, [symbol, tf, chartType])

  const q = market.getQuote(symbol)
  const digits = q ? q.digits : 2

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }} />
      {legend && (
        <div className="mono" style={{
          position: 'absolute', top: 6, left: 8, zIndex: 3, pointerEvents: 'none',
          fontSize: 10.5, display: 'flex', gap: 10, color: 'var(--text-2)',
          background: 'rgba(6,7,8,0.55)', padding: '3px 8px', borderRadius: 4,
        }}>
          {legend.o != null && <><span>O <b style={{ color: 'var(--text)' }}>{fmtPrice(legend.o, digits)}</b></span>
            <span>H <b style={{ color: 'var(--up)' }}>{fmtPrice(legend.h, digits)}</b></span>
            <span>L <b style={{ color: 'var(--down)' }}>{fmtPrice(legend.l, digits)}</b></span></>}
          <span>C <b style={{ color: 'var(--text)' }}>{fmtPrice(legend.c, digits)}</b></span>
          {legend.chg != null && <span className={legend.chg >= 0 ? 'up' : 'down'}>{fmtPct(legend.chg)}</span>}
          {maRefs.current.length > 0 && mas.map((p, i) => (
            <span key={p} style={{ color: ['#ffae00', '#b07cff', '#36c2ff'][i % 3] }}>MA{p}</span>
          ))}
        </div>
      )}
    </div>
  )
}
