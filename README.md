# NXT Terminal

A fast, **black-themed market terminal** in the browser — an original, open-source
take on the pro-terminal workflow, drawing inspiration from the feature sets of
Bloomberg, Koyfin, TradingView and the fincept terminal.

Type a ticker and a function code on the command line and hit **GO** — e.g.
`AAPL GP` for a chart, `NVDA FA` for financials, `TOP` for movers — just like a
real terminal. Everything updates live.

> All market data is produced by a built-in **simulation engine** so the app runs
> fully offline with zero API keys. The data layer is intentionally provider-shaped
> (`getQuote` / `getBars` / `subscribe` / `movers` / `sectorPerformance`), so it can
> be swapped for a live feed (e.g. an Interactive Brokers connection) without
> touching the UI.

## Features

- **Command line + palette** — Bloomberg-style mnemonics (`DES`, `GP`, `N`, `TOP`,
  `ECO`, `PORT`, `EQS`, `HEAT`…) with autocomplete, history recall, and a `⌘K`
  command palette.
- **Live quotes everywhere** — a tick engine drives every panel; rows flash green/red
  on up/down ticks; a scrolling ticker tape runs across the top.
- **TradingView charts** — interactive cand/ line / area charts via TradingView's
  open-source [`lightweight-charts`](https://github.com/tradingview/lightweight-charts),
  with multiple timeframes, volume, moving averages, a live crosshair OHLC legend,
  and a forming bar that updates in real time.
- **Dashboard workspace** — a multi-panel launchpad: index strip, live chart,
  watchlist, movers and a news feed in one view.
- **Watchlists / Monitor** — multiple persisted lists, add/remove tickers, rich
  columns and sparklines.
- **Security overview (DES)** — snapshot, key statistics, 52-week range, performance
  grid, company description and sector peers.
- **Financial analysis (FA)** — multi-year income statement, margins and revenue trend
  (model estimates).
- **Market movers (TOP)** — top gainers, losers and most active by dollar volume.
- **Heatmap (HEAT)** — sector / market-cap heatmap coloured by daily change.
- **Equity screener (EQS)** — filter the universe by asset class & sector, sort by
  any metric, add to a watchlist.
- **Economic calendar (ECO)** — macro releases with importance, forecast vs actual.
- **Portfolio (PORT)** — positions valued live with day P&L, unrealized P&L and
  allocation.

## Stack

React 19 · Vite · Tailwind v4 · Zustand · lightweight-charts · PWA. No backend.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the build
```

## Command reference (a few)

| Command      | Action                                  |
|--------------|-----------------------------------------|
| `AAPL`       | Load Apple → security overview          |
| `AAPL GP`    | Price chart for Apple                   |
| `NVDA FA`    | Financial analysis for NVIDIA           |
| `TSLA N`     | News filtered to Tesla                  |
| `TOP`        | Market movers                           |
| `HEAT`       | Sector heatmap                          |
| `EQS`        | Equity screener                         |
| `ECO`        | Economic calendar                       |
| `PORT`       | Portfolio                               |
| `HELP`       | Full function & shortcut reference       |

`⌘K` opens the palette · `/` focuses the command line · `↑/↓` browse history.

## Wiring real data

Replace the simulated engine in `src/services/marketData.js` (it already exposes a
provider-shaped API). The repo is configured with an Interactive Brokers data
integration in the host environment; `getQuote`/`getBars` are the two methods to
back with a live source.

---

*Educational/demo software. Simulated data is not investment advice.*
