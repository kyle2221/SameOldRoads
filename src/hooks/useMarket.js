import { useEffect, useReducer, useRef } from 'react'
import { market } from '../services/marketData'

// Force a re-render whenever the engine ticks (globally).
export function useTick() {
  const [, force] = useReducer((x) => x + 1, 0)
  useEffect(() => market.subscribe(() => force()), [])
}

// Live quote for a single symbol. The engine mutates the quote in place, so we
// just trigger a re-render and read the current values.
export function useQuote(symbol) {
  const [, force] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    if (!symbol) return
    return market.subscribeSymbol(symbol, () => force())
  }, [symbol])
  return symbol ? market.getQuote(symbol) : null
}

// Live quotes for a set of symbols.
export function useQuotes(symbols) {
  const [, force] = useReducer((x) => x + 1, 0)
  const key = (symbols || []).join(',')
  useEffect(() => {
    const unsubs = (symbols || []).map((s) => market.subscribeSymbol(s, () => force()))
    return () => unsubs.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return (symbols || []).map((s) => market.getQuote(s)).filter(Boolean)
}

// Throttled global tick (every N ms) for heavy widgets like heatmaps.
export function useThrottledTick(ms = 2000) {
  const [, force] = useReducer((x) => x + 1, 0)
  const last = useRef(0)
  useEffect(() => market.subscribe(() => {
    const now = Date.now()
    if (now - last.current >= ms) { last.current = now; force() }
  }), [ms])
}
