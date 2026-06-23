import { useStore } from './store'
import TopBar from './components/TopBar'
import TickerTape from './components/TickerTape'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import CommandPalette from './components/CommandPalette'

import Dashboard from './modules/Dashboard'
import WatchlistModule from './modules/WatchlistModule'
import SecurityOverview from './modules/SecurityOverview'
import ChartModule from './modules/ChartModule'
import NewsModule from './modules/NewsModule'
import MoversModule from './modules/MoversModule'
import HeatmapModule from './modules/HeatmapModule'
import EconomicCalendar from './modules/EconomicCalendar'
import Portfolio from './modules/Portfolio'
import Screener from './modules/Screener'
import HelpModule from './modules/HelpModule'

const MODULES = {
  dash: Dashboard,
  watch: WatchlistModule,
  sec: SecurityOverview,
  chart: ChartModule,
  news: NewsModule,
  movers: MoversModule,
  heat: HeatmapModule,
  eco: EconomicCalendar,
  port: Portfolio,
  screener: Screener,
  help: HelpModule,
}

export default function App() {
  const activeModule = useStore((s) => s.activeModule)
  const Module = MODULES[activeModule] || Dashboard

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
      <TopBar />
      <TickerTape />
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          <Module />
        </main>
      </div>
      <StatusBar />
      <CommandPalette />
    </div>
  )
}
