import { useEffect } from 'react'
import { useStore } from './store'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import RoutesPage from './pages/RoutesPage'
import PlacesPage from './pages/PlacesPage'
import TripsPage from './pages/TripsPage'
import AuthPage from './pages/AuthPage'
import Toasts from './components/Toast'

export default function App() {
  const { loadAll, activeTab, currentUser, setUser } = useStore()

  useEffect(() => {
    if (currentUser) loadAll()
  }, [currentUser, loadAll])

  if (!currentUser) {
    return <AuthPage onAuth={setUser} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 0 80px rgba(0,0,0,0.14)', position: 'relative' }}>
      <Toasts />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className={`tab-page${activeTab === 'home' ? ' active' : ''}`}><HomePage /></div>
        <div className={`tab-page${activeTab === 'map' ? ' active' : ''}`}><MapPage /></div>
        <div className={`tab-page${activeTab === 'routes' ? ' active' : ''}`}><RoutesPage /></div>
        <div className={`tab-page${activeTab === 'places' ? ' active' : ''}`}><PlacesPage /></div>
        <div className={`tab-page${activeTab === 'trips' ? ' active' : ''}`}><TripsPage /></div>
      </div>
      <NavBar />
    </div>
  )
}
