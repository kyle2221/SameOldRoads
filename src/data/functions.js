// Function registry — the "command codes" that drive navigation, à la a pro
// terminal. Used by the command line, the command palette, the sidebar and HELP.
//
// module   : screen key rendered by App
// code     : primary mnemonic typed on the command line
// aliases  : alternate mnemonics
// needsSym : function operates on the loaded security
// group    : grouping for the menu / help

export const FUNCTIONS = [
  { code: 'DASH', aliases: ['HOME', 'NXT'], module: 'dash',   label: 'Dashboard',          desc: 'Multi-panel market overview workspace', group: 'Core', icon: 'grid' },
  { code: 'W',    aliases: ['MON', 'WATCH'], module: 'watch', label: 'Monitor / Watchlist', desc: 'Live watchlists with columns & sparklines', group: 'Core', icon: 'list' },
  { code: 'DES',  aliases: ['SECF', 'CO'], module: 'sec',     label: 'Security Overview',  desc: 'Snapshot, key stats & fundamentals', group: 'Security', needsSym: true, icon: 'info' },
  { code: 'GP',   aliases: ['CHART', 'GIP', 'G'], module: 'chart', label: 'Price Chart',    desc: 'Interactive candlestick chart & studies', group: 'Security', needsSym: true, icon: 'chart' },
  { code: 'FA',   aliases: ['FIN'], module: 'sec',            label: 'Financial Analysis', desc: 'Income, balance sheet & ratios', group: 'Security', needsSym: true, icon: 'sheet', tab: 'financials' },
  { code: 'N',    aliases: ['NEWS', 'CN'], module: 'news',    label: 'News',               desc: 'Live headlines, filter by security', group: 'Research', icon: 'news' },
  { code: 'TOP',  aliases: ['MOV', 'MOST'], module: 'movers', label: 'Market Movers',      desc: 'Top gainers, losers & most active', group: 'Markets', icon: 'fire' },
  { code: 'HEAT', aliases: ['MAP', 'IMAP'], module: 'heat',   label: 'Market Heatmap',     desc: 'Sector / market-cap heatmap', group: 'Markets', icon: 'map' },
  { code: 'EQS',  aliases: ['SCR', 'SCREEN'], module: 'screener', label: 'Equity Screener', desc: 'Filter & rank the universe', group: 'Markets', icon: 'filter' },
  { code: 'ECO',  aliases: ['ECON', 'CAL'], module: 'eco',    label: 'Economic Calendar',  desc: 'Macro releases, forecasts & actuals', group: 'Research', icon: 'calendar' },
  { code: 'PORT', aliases: ['PRTU', 'PF'], module: 'port',    label: 'Portfolio',          desc: 'Positions, P&L & allocation', group: 'Trading', icon: 'wallet' },
  { code: 'HELP', aliases: ['MENU', '?'], module: 'help',     label: 'Help & Functions',   desc: 'Command reference & shortcuts', group: 'Core', icon: 'help' },
]

export const BY_CODE = (() => {
  const m = {}
  for (const f of FUNCTIONS) {
    m[f.code] = f
    for (const a of f.aliases) m[a] = f
  }
  return m
})()
