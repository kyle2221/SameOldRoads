// Simulated newswire. Headlines are generated from original templates and a
// rolling feed prepends fresh items so the tape feels live.
import { UNIVERSE } from '../data/universe'

const SOURCES = ['NXT Wire', 'MarketPulse', 'Global Macro Desk', 'Capital Brief', 'Tape Reader', 'The Quote', 'Street Signal', 'Macro Memo']

const EQUITIES = UNIVERSE.filter((s) => s.type === 'equity' || s.type === 'etf')
const CRYPTOS = UNIVERSE.filter((s) => s.type === 'crypto')

// template: (ctx) => { headline, sentiment, category }
const TEMPLATES = [
  (c) => ({ headline: `${c.name} ${c.up ? 'climbs' : 'slips'} ${c.absPct}% as traders weigh demand outlook`, sentiment: c.up ? 'pos' : 'neg', category: 'Markets' }),
  (c) => ({ headline: `${c.sym} ${c.up ? 'tops' : 'misses'} estimates; management lifts full-year guidance`, sentiment: c.up ? 'pos' : 'neg', category: 'Earnings' }),
  (c) => ({ headline: `Analysts at major desk ${c.up ? 'raise' : 'cut'} ${c.sym} price target, cite ${c.up ? 'margin expansion' : 'softening orders'}`, sentiment: c.up ? 'pos' : 'neg', category: 'Ratings' }),
  (c) => ({ headline: `${c.name} announces $${(2 + Math.floor(Math.random() * 40))}B buyback and dividend increase`, sentiment: 'pos', category: 'Corporate' }),
  (c) => ({ headline: `${c.sym} in focus after report of strategic review and potential asset sale`, sentiment: 'neu', category: 'M&A' }),
  (c) => ({ headline: `Options flow turns ${c.up ? 'bullish' : 'bearish'} on ${c.sym} ahead of catalyst`, sentiment: c.up ? 'pos' : 'neg', category: 'Derivatives' }),
  (c) => ({ headline: `${c.name} unveils next-gen product line; shares ${c.up ? 'rally' : 'fade'} on details`, sentiment: c.up ? 'pos' : 'neg', category: 'Corporate' }),
]

const MACRO = [
  () => ({ headline: 'Treasury yields ease as soft inflation print revives rate-cut bets', sentiment: 'pos', category: 'Macro' }),
  () => ({ headline: 'Dollar firms against majors after hawkish central-bank commentary', sentiment: 'neu', category: 'FX' }),
  () => ({ headline: 'Futures point higher as risk appetite returns to global equities', sentiment: 'pos', category: 'Markets' }),
  () => ({ headline: 'Oil steadies near multi-week range as supply concerns linger', sentiment: 'neu', category: 'Commodities' }),
  () => ({ headline: 'Jobless claims come in below consensus; labor market stays resilient', sentiment: 'pos', category: 'Macro' }),
  () => ({ headline: 'Volatility gauge slides as breadth improves across sectors', sentiment: 'pos', category: 'Markets' }),
  () => ({ headline: 'Fed officials signal patience on policy path, data dependence in focus', sentiment: 'neu', category: 'Macro' }),
  () => ({ headline: 'Gold holds near record as real yields drift lower', sentiment: 'pos', category: 'Commodities' }),
]

const CRYPTO_T = [
  (c) => ({ headline: `${c.name.split(' / ')[0]} ${c.up ? 'jumps' : 'drops'} ${c.absPct}% as spot ETF flows ${c.up ? 'accelerate' : 'cool'}`, sentiment: c.up ? 'pos' : 'neg', category: 'Crypto' }),
  (c) => ({ headline: `On-chain data shows ${c.up ? 'accumulation' : 'distribution'} in ${c.sym}; funding rates shift`, sentiment: c.up ? 'pos' : 'neg', category: 'Crypto' }),
]

let _id = 1
const pick = (a) => a[Math.floor(Math.random() * a.length)]

function makeItem(ts) {
  const roll = Math.random()
  if (roll < 0.28) {
    const t = pick(MACRO)()
    return { id: _id++, ts, symbol: null, source: pick(SOURCES), ...t }
  }
  if (roll < 0.40 && CRYPTOS.length) {
    const s = pick(CRYPTOS)
    const up = Math.random() > 0.45
    const t = pick(CRYPTO_T)({ sym: s.symbol, name: s.name, up, absPct: (Math.random() * 6 + 0.5).toFixed(1) })
    return { id: _id++, ts, symbol: s.symbol, source: pick(SOURCES), ...t }
  }
  const s = pick(EQUITIES)
  const up = Math.random() > 0.45
  const ctx = { sym: s.symbol, name: s.name, up, absPct: (Math.random() * 4 + 0.3).toFixed(1) }
  const t = pick(TEMPLATES)(ctx)
  return { id: _id++, ts, symbol: s.symbol, source: pick(SOURCES), ...t }
}

class NewsFeed {
  constructor() {
    this.items = []
    this.listeners = new Set()
    // seed ~50 items spread over the last ~5 hours
    const now = Date.now()
    for (let i = 0; i < 50; i++) this.items.push(makeItem(now - i * (1000 * 60 * (4 + Math.random() * 6))))
    this.items.sort((a, b) => b.ts - a.ts)
    this.timer = setInterval(() => this._emit(), 11000 + Math.random() * 9000)
  }
  _emit() {
    this.items.unshift(makeItem(Date.now()))
    if (this.items.length > 220) this.items.pop()
    for (const cb of this.listeners) cb(this.items)
  }
  getAll() { return this.items }
  forSymbol(sym) { return this.items.filter((i) => i.symbol === sym) }
  subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb) }
}

export const newsFeed = new NewsFeed()
