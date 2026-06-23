import { create } from 'zustand'
import { BY_SYMBOL, SYMBOLS, DEFAULT_WATCHLISTS } from './data/universe'
import { BY_CODE } from './data/functions'
import { load, save } from './services/persist'

const initWatchlists = load('watchlists', DEFAULT_WATCHLISTS)
const initActiveWl = load('activeWatchlist', Object.keys(initWatchlists)[0])

export const useStore = create((set, get) => ({
  activeModule: 'dash',
  symbol: 'AAPL',            // the loaded security (amber context)
  secTab: 'overview',        // tab inside the security overview screen
  chartTf: load('chartTf', '1d'),

  watchlists: initWatchlists,
  activeWatchlist: initActiveWl,

  commandHistory: load('cmdHistory', []),
  paletteOpen: false,
  statusMsg: 'NXT Terminal ready — type a ticker or function and press ENTER. Try  AAPL GP',
  statusKind: 'info',

  // ---------- navigation ----------
  navigate: (module, params = {}) => {
    const patch = { activeModule: module }
    if (params.symbol && BY_SYMBOL[params.symbol]) patch.symbol = params.symbol
    if (params.tab) patch.secTab = params.tab
    else if (module === 'sec') patch.secTab = 'overview'
    set(patch)
  },

  loadSecurity: (symbol, module) => {
    const s = symbol?.toUpperCase()
    if (!BY_SYMBOL[s]) { get().setStatus(`No security found for "${symbol}"`, 'error'); return false }
    set({ symbol: s, activeModule: module || 'sec', secTab: 'overview' })
    return true
  },

  setSecTab: (tab) => set({ secTab: tab }),
  setChartTf: (tf) => { set({ chartTf: tf }); save('chartTf', tf) },

  setStatus: (msg, kind = 'info') => set({ statusMsg: msg, statusKind: kind }),

  // ---------- command line ----------
  runCommand: (raw) => {
    const text = (raw || '').trim()
    if (!text) return
    const tokens = text.toUpperCase().split(/\s+/).filter(Boolean)

    // record history (dedupe consecutive)
    const hist = get().commandHistory
    const nextHist = [text, ...hist.filter((h) => h.toUpperCase() !== text.toUpperCase())].slice(0, 40)
    set({ commandHistory: nextHist }); save('cmdHistory', nextHist)

    // find a symbol token and a function token in either order
    let symTok = tokens.find((t) => BY_SYMBOL[t])
    let fnTok = tokens.find((t) => BY_CODE[t])

    // <SYMBOL> <FUNC>  or  <FUNC> <SYMBOL>
    if (symTok && fnTok) {
      const fn = BY_CODE[fnTok]
      set({ symbol: symTok, activeModule: fn.module, secTab: fn.tab || 'overview' })
      get().setStatus(`${symTok} · ${fn.label}`, 'ok')
      return
    }
    // <FUNC> only
    if (fnTok && !symTok) {
      const fn = BY_CODE[fnTok]
      if (fn.needsSym) {
        set({ activeModule: fn.module, secTab: fn.tab || 'overview' }) // use current loaded symbol
        get().setStatus(`${get().symbol} · ${fn.label}`, 'ok')
      } else {
        set({ activeModule: fn.module })
        get().setStatus(fn.label, 'ok')
      }
      return
    }
    // <SYMBOL> only -> overview
    if (symTok) {
      set({ symbol: symTok, activeModule: 'sec', secTab: 'overview' })
      get().setStatus(`${symTok} · ${BY_SYMBOL[symTok].name}`, 'ok')
      return
    }
    // fuzzy: prefix match on symbol or company name
    const q = tokens.join(' ')
    const hit = SYMBOLS.find((s) => s.startsWith(tokens[0])) ||
      SYMBOLS.find((s) => BY_SYMBOL[s].name.toUpperCase().includes(q))
    if (hit) {
      set({ symbol: hit, activeModule: 'sec', secTab: 'overview' })
      get().setStatus(`${hit} · ${BY_SYMBOL[hit].name}`, 'ok')
      return
    }
    get().setStatus(`Unknown command: "${text}"  —  type HELP for functions`, 'error')
  },

  // ---------- command palette ----------
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),

  // ---------- watchlists ----------
  setActiveWatchlist: (name) => { set({ activeWatchlist: name }); save('activeWatchlist', name) },

  addSymbol: (list, sym) => {
    sym = sym.toUpperCase()
    if (!BY_SYMBOL[sym]) { get().setStatus(`Unknown symbol "${sym}"`, 'error'); return }
    set((s) => {
      const cur = s.watchlists[list] || []
      if (cur.includes(sym)) return {}
      const wl = { ...s.watchlists, [list]: [...cur, sym] }
      save('watchlists', wl); return { watchlists: wl }
    })
    get().setStatus(`Added ${sym} to ${list}`, 'ok')
  },

  removeSymbol: (list, sym) => set((s) => {
    const wl = { ...s.watchlists, [list]: (s.watchlists[list] || []).filter((x) => x !== sym) }
    save('watchlists', wl); return { watchlists: wl }
  }),

  createWatchlist: (name) => {
    name = name.trim()
    if (!name) return
    set((s) => {
      if (s.watchlists[name]) return { activeWatchlist: name }
      const wl = { ...s.watchlists, [name]: [] }
      save('watchlists', wl); save('activeWatchlist', name)
      return { watchlists: wl, activeWatchlist: name }
    })
  },

  deleteWatchlist: (name) => set((s) => {
    const wl = { ...s.watchlists }
    delete wl[name]
    const keys = Object.keys(wl)
    if (keys.length === 0) { wl['My List'] = []; }
    const active = s.activeWatchlist === name ? Object.keys(wl)[0] : s.activeWatchlist
    save('watchlists', wl); save('activeWatchlist', active)
    return { watchlists: wl, activeWatchlist: active }
  }),
}))
