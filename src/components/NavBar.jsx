import { useStore } from '../store'

export default function NavBar() {
  const { activeTab, setTab, trackingActive } = useStore()

  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 4px',
      paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: `0.5px solid var(--nav-border)`,
      boxShadow: 'var(--shadow-nav)',
    }}>
      <NavTab id="home" label="Home" Icon={HomeIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="discover" label="Discover" Icon={CompassIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="routes" label="Routes" Icon={RouteIcon} activeTab={activeTab} setTab={setTab} />

      <div style={{ flex: 0.85, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setTab('map')} aria-label="Track a trip" style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'linear-gradient(145deg, #ff8a52 0%, #ef5616 100%)',
          border: '3px solid var(--surface)',
          boxShadow: activeTab === 'map'
            ? '0 0 0 2.5px var(--orange-deep), 0 4px 22px rgba(239,86,22,0.55)'
            : '0 3px 18px rgba(239,86,22,0.4)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'box-shadow 0.2s',
          flexShrink: 0, fontSize: 22,
        }}>
          {trackingActive
            ? <span style={{ width: 15, height: 15, borderRadius: 3, background: '#fff', display: 'block' }} />
            : '🚗'
          }
          {trackingActive && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              width: 11, height: 11, borderRadius: '50%',
              background: '#ff3b30', border: '2px solid #fff',
              animation: 'recPulse 1.4s ease-in-out infinite',
            }} />
          )}
        </button>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
          color: activeTab === 'map' ? 'var(--orange-deep)' : 'var(--text-mute)' }}>
          {trackingActive ? '● Live' : 'Track'}
        </span>
      </div>

      <NavTab id="places" label="Places" Icon={PlaceIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="stats" label="Stats" Icon={ChartIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="settings" label="Settings" Icon={SettingsIcon} activeTab={activeTab} setTab={setTab} />

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
    <button onClick={() => setTab(id)} aria-label={label} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      padding: '5px 2px 4px', background: 'none', border: 'none', cursor: 'pointer',
      color: active ? 'var(--orange-deep)' : 'var(--text-mute)', transition: 'color 0.18s',
    }}>
      <div style={{ padding: '5px 10px', borderRadius: 12, background: active ? 'var(--orange-wash)' : 'transparent', transition: 'background 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} active={active} />
      </div>
      <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: 0.3 }}>{label}</span>
    </button>
  )
}

function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'var(--orange-wash)' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function CompassIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" fill={active ? 'var(--orange-wash)' : 'none'} />
      <polygon points="16,8 13,13 8,16 11,11" fill={active ? 'var(--orange-deep)' : 'currentColor'} />
    </svg>
  )
}

function RouteIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="5" cy="19" r="2" fill={active ? 'var(--orange-wash)' : 'none'}/>
      <circle cx="19" cy="5" r="2" fill={active ? 'var(--orange-wash)' : 'none'}/>
      <path d="M7 19h4a4 4 0 004-4V9a4 4 0 014-4"/>
    </svg>
  )
}

function PlaceIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01L12 2z" fill={active ? 'var(--orange-wash)' : 'none'}/>
    </svg>
  )
}

function ChartIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 21h18" />
      <rect x="5" y="13" width="3" height="6" fill={active ? 'var(--orange-wash)' : 'none'} />
      <rect x="10.5" y="9" width="3" height="10" fill={active ? 'var(--orange-wash)' : 'none'} />
      <rect x="16" y="5" width="3" height="14" fill={active ? 'var(--orange-wash)' : 'none'} />
    </svg>
  )
}

function SettingsIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3" fill={active ? 'var(--orange-wash)' : 'none'} />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}
