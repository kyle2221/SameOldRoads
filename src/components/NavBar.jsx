import { useStore } from '../store'
import { IconCar } from './Icons'

export default function NavBar() {
  const { activeTab, setTab, trackingActive } = useStore()

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 4px',
      paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
      background: '#111',
      borderTop: '0.5px solid rgba(255,255,255,0.08)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
    }}>
      <NavTab id="home"   label="Home"   Icon={HomeIcon}  activeTab={activeTab} setTab={setTab} />
      <NavTab id="routes" label="Routes" Icon={RouteIcon} activeTab={activeTab} setTab={setTab} />

      {/* Center Track button */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button
          onClick={() => setTab('map')}
          style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(145deg, #ff8a52 0%, #fc4c02 100%)',
            border: 'none',
            boxShadow: activeTab === 'map'
              ? '0 0 0 2.5px rgba(252,76,2,0.5), 0 4px 22px rgba(252,76,2,0.55)'
              : '0 3px 16px rgba(252,76,2,0.42)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {trackingActive
            ? <span style={{ width: 14, height: 14, borderRadius: 3, background: '#fff', display: 'block' }} />
            : <IconCar size={21} color="#fff" sw={2} />
          }
          {trackingActive && (
            <span style={{
              position: 'absolute', top: 1, right: 1,
              width: 11, height: 11, borderRadius: '50%',
              background: '#ef4444', border: '2px solid #111',
              animation: 'recPulse 1.4s ease-in-out infinite',
            }} />
          )}
        </button>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          fontFamily: "'Rajdhani', sans-serif",
          color: activeTab === 'map' ? '#fc4c02' : 'rgba(255,255,255,0.4)',
        }}>
          {trackingActive ? '● Live' : 'Track'}
        </span>
      </div>

      <NavTab id="places" label="Places" Icon={PlaceIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="trips"  label="Trips"  Icon={TripIcon}  activeTab={activeTab} setTab={setTab} />

      <style>{`
        @keyframes recPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.35; transform:scale(0.78); }
        }
      `}</style>
    </nav>
  )
}

function NavTab({ id, label, Icon, activeTab, setTab }) {
  const active = activeTab === id
  return (
    <button
      onClick={() => setTab(id)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '5px 2px 4px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: active ? '#fc4c02' : 'rgba(255,255,255,0.38)',
        transition: 'color 0.15s',
        position: 'relative',
      }}
    >
      <Icon size={21} active={active} />
      <span style={{
        fontSize: 9, fontWeight: active ? 800 : 600,
        letterSpacing: 1, textTransform: 'uppercase',
        fontFamily: "'Rajdhani', sans-serif",
      }}>
        {label}
      </span>
      {/* Active dot */}
      {active && (
        <span style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 4, height: 4, borderRadius: '50%',
          background: '#fc4c02',
          boxShadow: '0 0 6px rgba(252,76,2,0.8)',
        }} />
      )}
    </button>
  )
}

function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={active ? 'rgba(252,76,2,0.18)' : 'none'}
      stroke={active ? '#fc4c02' : 'rgba(255,255,255,0.38)'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function RouteIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#fc4c02' : 'rgba(255,255,255,0.38)'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="19" r="2" fill={active ? 'rgba(252,76,2,0.25)' : 'none'}/>
      <circle cx="19" cy="5" r="2" fill={active ? 'rgba(252,76,2,0.25)' : 'none'}/>
      <path d="M7 19h4a4 4 0 004-4V9a4 4 0 014-4"/>
    </svg>
  )
}

function PlaceIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#fc4c02' : 'rgba(255,255,255,0.38)'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill={active ? 'rgba(252,76,2,0.18)' : 'none'}/>
      <circle cx="12" cy="9" r="2.5" fill={active ? '#fc4c02' : 'none'}/>
    </svg>
  )
}

function TripIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={active ? 'rgba(252,76,2,0.18)' : 'none'}
      stroke={active ? '#fc4c02' : 'rgba(255,255,255,0.38)'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}
