// ============================================================
// NXT Terminal — live market-data engine (simulated)
//
// A single in-process engine that holds a live quote for every instrument in
// the universe and evolves it on a timer using a drift + volatility random walk.
// Components subscribe to ticks; chart bars are generated on demand.
//
// The public surface (getQuote / getBars / subscribe / movers / sectors) is the
// same shape a real provider would expose, so the simulator can be swapped for a
// live feed (e.g. the Interactive Brokers tools) without touching the UI.
// ============================================================

import { UNIVERSE } from '../data/universe'

// per-tick volatility (fraction of price) by asset class
const VOL = { equity: 0.0012, etf: 0.0008, index: 0.0007, fx: 0.00035, crypto: 0.0026, future: 0.0014, rate: 0.0009 }
// gentle per-tick upward drift so sessions feel alive, not random-flat
const DRIFT = 0.0000045

// ---- deterministic RNG helpers (stable charts across re-renders) ----
function hashStr(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gauss(rng) {
  // Box–Muller
  let u = 0, v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function digitsFor(q) {
  if (q.type === 'fx') return q.price < 20 ? 4 : 2
  if (q.type === 'rate') return 3
  if (q.type === 'crypto') return q.price < 1 ? 4 : 2
  return 2
}
function round(v, d) { const m = 10 ** d; return Math.round(v * m) / m }

class MarketEngine {
  constructor() {
    this.quotes = new Map()
    this.listeners = new Set()        // global tick listeners
    this.symbolListeners = new Map()  // symbol -> Set<cb>
    this.barCache = new Map()         // `${symbol}:${tf}` -> bars
    this.speed = 1000
    this.timer = null
    this._init()
  }

  _init() {
    for (const s of UNIVERSE) {
      const rng = mulberry32(hashStr(s.symbol))
      const digits = digitsFor(s)
      // build a small recent spark history so widgets look populated immediately
      const spark = []
      let p = s.prevClose
      for (let i = 0; i < 40; i++) { p *= 1 + (gauss(rng) * (VOL[s.type] || 0.001) * (s.volMul || 1) * 3); spark.push(p) }
      // glide the spark's end toward the seed price
      const adj = s.price / spark[spark.length - 1]
      for (let i = 0; i < spark.length; i++) spark[i] = round(spark[i] * adj, digits)

      const change = s.price - s.prevClose
      this.quotes.set(s.symbol, {
        symbol: s.symbol, name: s.name, type: s.type, sector: s.sector,
        exchange: s.exchange, currency: s.currency, digits,
        last: s.price, prevClose: s.prevClose,
        open: round(s.prevClose * (1 + gauss(rng) * 0.001), digits),
        high: Math.max(s.price, s.prevClose), low: Math.min(s.price, s.prevClose),
        bid: 0, ask: 0,
        volume: Math.floor(rng() * 18_000_000) + 800_000,
        change, changePct: (change / s.prevClose) * 100,
        dir: 0, ts: Date.now(), spark,
        rng,
        meta: s,
      })
      this._spread(this.quotes.get(s.symbol))
    }
  }

  _spread(q) {
    const spr = q.type === 'crypto' ? q.last * 0.0004 : q.type === 'fx' ? q.last * 0.00005 : Math.max(q.last * 0.00012, 0.01)
    q.bid = round(q.last - spr / 2, q.digits)
    q.ask = round(q.last + spr / 2, q.digits)
  }

  start() {
    if (this.timer) return
    this.timer = setInterval(() => this._tick(), this.speed)
  }
  stop() { clearInterval(this.timer); this.timer = null }
  setSpeed(ms) { this.speed = ms; if (this.timer) { this.stop(); this.start() } }

  _tick() {
    const changed = new Set()
    for (const q of this.quotes.values()) {
      const vol = (VOL[q.type] || 0.001) * (q.meta.volMul || 1)
      const ret = DRIFT + gauss(q.rng) * vol
      const prev = q.last
      let next = q.last * (1 + ret)
      if (q.type === 'rate') next = q.last + gauss(q.rng) * 0.006 // yields move in bps
      next = round(next, q.digits)
      if (next <= 0) next = prev
      q.last = next
      q.dir = next > prev ? 1 : next < prev ? -1 : 0
      q.high = Math.max(q.high, next)
      q.low = Math.min(q.low, next)
      q.change = round(next - q.prevClose, q.digits)
      q.changePct = (q.change / q.prevClose) * 100
      q.volume += Math.floor(q.rng() * 60_000 * (q.type === 'crypto' ? 0.4 : 1))
      q.ts = Date.now()
      this._spread(q)
      q.spark.push(next)
      if (q.spark.length > 60) q.spark.shift()
      changed.add(q.symbol)
    }
    // notify symbol-specific listeners
    for (const [sym, set] of this.symbolListeners) {
      if (changed.has(sym)) { const q = this.quotes.get(sym); for (const cb of set) cb(q) }
    }
    // notify global listeners
    for (const cb of this.listeners) cb(changed)
  }

  getQuote(symbol) { return this.quotes.get(symbol) }
  getAllQuotes() { return [...this.quotes.values()] }

  subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb) }
  subscribeSymbol(symbol, cb) {
    if (!this.symbolListeners.has(symbol)) this.symbolListeners.set(symbol, new Set())
    this.symbolListeners.get(symbol).add(cb)
    return () => { const s = this.symbolListeners.get(symbol); if (s) s.delete(cb) }
  }

  // ---- analytics ----
  movers(kind = 'gainers', n = 12, types = ['equity', 'etf']) {
    const list = this.getAllQuotes().filter((q) => types.includes(q.type))
    if (kind === 'gainers') list.sort((a, b) => b.changePct - a.changePct)
    else if (kind === 'losers') list.sort((a, b) => a.changePct - b.changePct)
    else list.sort((a, b) => b.volume * b.last - a.volume * a.last) // active = $ volume
    return list.slice(0, n)
  }

  sectorPerformance() {
    const map = new Map()
    for (const q of this.quotes.values()) {
      if (q.type !== 'equity') continue
      if (!map.has(q.sector)) map.set(q.sector, [])
      map.get(q.sector).push(q)
    }
    const out = []
    for (const [sector, qs] of map) {
      const avg = qs.reduce((s, q) => s + q.changePct, 0) / qs.length
      const cap = qs.reduce((s, q) => s + (q.meta.mktCap || 0), 0)
      out.push({ sector, changePct: avg, cap, members: qs })
    }
    return out.sort((a, b) => b.cap - a.cap)
  }

  // ---- historical bars for charts ----
  getBars(symbol, tf = '1d') {
    const key = `${symbol}:${tf}`
    if (this.barCache.has(key)) return this.barCache.get(key)
    const q = this.quotes.get(symbol)
    if (!q) return []

    const cfg = {
      '1m':  { interval: 60,     count: 200, vmul: 0.5 },
      '5m':  { interval: 300,    count: 200, vmul: 1.0 },
      '15m': { interval: 900,    count: 180, vmul: 1.6 },
      '1h':  { interval: 3600,   count: 180, vmul: 2.6 },
      '1d':  { interval: 86400,  count: 280, vmul: 7.0 },
      '1w':  { interval: 604800, count: 170, vmul: 16 },
    }[tf] || { interval: 86400, count: 280, vmul: 7 }

    const rng = mulberry32(hashStr(symbol + tf))
    const barVol = (VOL[q.type] || 0.001) * (q.meta.volMul || 1) * cfg.vmul
    const drift = DRIFT * cfg.vmul * 0.6

    // walk backward from the current price so the chart connects to the live quote
    const closes = new Array(cfg.count)
    closes[cfg.count - 1] = q.last
    for (let i = cfg.count - 2; i >= 0; i--) {
      const ret = drift + gauss(rng) * barVol
      closes[i] = closes[i + 1] / (1 + ret)
    }

    const now = Math.floor(Date.now() / 1000)
    const aligned = now - (now % cfg.interval)
    const bars = []
    for (let i = 0; i < cfg.count; i++) {
      const close = closes[i]
      const open = i === 0 ? close * (1 - gauss(rng) * barVol * 0.3) : closes[i - 1]
      const wick = Math.abs(gauss(rng)) * barVol * 0.8 + barVol * 0.2
      const high = Math.max(open, close) * (1 + wick * rng())
      const low = Math.min(open, close) * (1 - wick * rng())
      const baseVol = q.type === 'crypto' ? 4e8 : q.type === 'index' ? 0 : 2e6
      const volume = Math.floor(baseVol * (0.4 + rng() * 1.6))
      bars.push({
        time: aligned - (cfg.count - 1 - i) * cfg.interval,
        open: round(open, q.digits), high: round(high, q.digits),
        low: round(low, q.digits), close: round(close, q.digits),
        volume,
      })
    }
    this.barCache.set(key, bars)
    return bars
  }
}

export const market = new MarketEngine()
market.start()

if (typeof window !== 'undefined') window.__nxtMarket = market // handy for debugging
