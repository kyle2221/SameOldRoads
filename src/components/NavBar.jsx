import { useStore } from '../store'

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'map', label: 'Track', icon: MapIcon },
  { id: 'routes', label: 'Routes', icon: RouteIcon },
  { id: 'places', label: 'Places', icon: PlaceIcon },
  { id: 'trips', label: 'Trips', icon: TripIcon },
]

export default function NavBar() {
  const { activeTab, setTab, trackingActive } = useStore()

  return (
    <nav style={{
      display: 'flex',
      background: 'var(--green-800)',
      borderTop: '1px solid var(--green-600)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 0 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--khaki-300)' : 'var(--green-400)',
              position: 'relative',
            }}
          >
            {id === 'map' && trackingActive && (
              <span style={{
                position: 'absolute',
                top: 6,
                right: '50%',
                transform: 'translateX(14px)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#e53',
                animation: 'pulse 1.5s infinite',
              }} />
            )}
            <Icon size={22} active={active} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: 0.3 }}>{label}</span>
            {active && (
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: '20%',
                right: '20%',
                height: 2,
                background: 'var(--khaki-300)',
                borderRadius: 2,
              }} />
            )}
          </button>
        )
      })}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </nav>
  )
}

function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'var(--khaki-300)' : 'none'} stroke="currentColor" strokeWidth={1.8}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function MapIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="10" r="3" fill={active ? 'var(--khaki-300)' : 'none'}/>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    </svg>
  )
}

function RouteIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="5" cy="19" r="2" fill={active ? 'var(--khaki-300)' : 'none'}/>
      <circle cx="19" cy="5" r="2" fill={active ? 'var(--khaki-300)' : 'none'}/>
      <path d="M7 19h4a4 4 0 004-4V9a4 4 0 014-4"/>
    </svg>
  )
}

function PlaceIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill={active ? 'var(--khaki-300)' : 'none'}/>
    </svg>
  )
}

function TripIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="4" width="18" height="16" rx="2" fill={active ? 'var(--khaki-300)' : 'none'} fillOpacity={0.3}/>
      <path d="M3 9h18M8 4v5M16 4v5"/>
    </svg>
  )
}
