import { useEffect } from 'react'
import { useStore } from './store'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import RoutesPage from './pages/RoutesPage'
import PlacesPage from './pages/PlacesPage'
import TripsPage from './pages/TripsPage'

export default function App() {
  const { loadAll, activeTab } = useStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--green-950)' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: activeTab === 'home' ? 'block' : 'none', height: '100%' }}><HomePage /></div>
        <div style={{ display: activeTab === 'map' ? 'block' : 'none', height: '100%' }}><MapPage /></div>
        <div style={{ display: activeTab === 'routes' ? 'block' : 'none', height: '100%' }}><RoutesPage /></div>
        <div style={{ display: activeTab === 'places' ? 'block' : 'none', height: '100%' }}><PlacesPage /></div>
        <div style={{ display: activeTab === 'trips' ? 'block' : 'none', height: '100%' }}><TripsPage /></div>
      </div>
      <NavBar />
    </div>
  )
}
