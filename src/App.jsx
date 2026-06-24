import { useEffect } from 'react'
import { useStore } from './store'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import MapPage from './pages/MapPage'
import RoutesPage from './pages/RoutesPage'
import PlacesPage from './pages/PlacesPage'
import TripsPage from './pages/TripsPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AuthPage from './pages/AuthPage'
import ErrorBoundary from './components/ErrorBoundary'
import Toaster from './components/Toaster'
import { applyTheme } from './theme'

export default function App() {
  const { loadAll, activeTab, currentUser, setUser, initAuth, authReady } = useStore()

  // Initial theme apply + legacy password migration on first mount
  useEffect(() => {
    applyTheme()
    initAuth()
  }, [initAuth])

  useEffect(() => { if (currentUser) loadAll() }, [currentUser, loadAll])

  if (!authReady) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 28, height: 28, border: '3px solid var(--orange-tint)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }
  if (!currentUser) return <ErrorBoundary><AuthPage onAuth={setUser} /><Toaster /></ErrorBoundary>

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <div style={{ display: activeTab === 'home' ? 'block' : 'none', height: '100%' }}><HomePage /></div>
          <div style={{ display: activeTab === 'discover' ? 'block' : 'none', height: '100%' }}><DiscoverPage /></div>
          <div style={{ display: activeTab === 'map' ? 'block' : 'none', height: '100%' }}><MapPage /></div>
          <div style={{ display: activeTab === 'routes' ? 'block' : 'none', height: '100%' }}><RoutesPage /></div>
          <div style={{ display: activeTab === 'places' ? 'block' : 'none', height: '100%' }}><PlacesPage /></div>
          <div style={{ display: activeTab === 'trips' ? 'block' : 'none', height: '100%' }}><TripsPage /></div>
          <div style={{ display: activeTab === 'stats' ? 'block' : 'none', height: '100%' }}><StatsPage /></div>
          <div style={{ display: activeTab === 'settings' ? 'block' : 'none', height: '100%' }}><SettingsPage /></div>
        </div>
        <NavBar />
        <Toaster />
      </div>
    </ErrorBoundary>
  )
}
