import { useStore } from '../store'

export default function NavBar() {
  const { activeTab, setTab, trackingActive } = useStore()

  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 4px',
      paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(24px) saturate(1.5)', WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
      borderTop: `0.5px solid var(--nav-border)`,
      boxShadow: 'var(--shadow-nav)',
      position: 'relative',
      zIndex: 100,
    }}>
      <NavTab id="home" label="Home" Icon={HomeIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="discover" label="Discover" Icon={CompassIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="routes" label="Routes" Icon={RouteIcon} activeTab={activeTab} setTab={setTab} />

      <div style={{ flex: 0.85, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <button
          onClick={() => setTab('map')}
          aria-label="Track a trip"
          className="pressable"
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(145deg, #ff8a52 0%, #ef5616 100%)',
            border: '3px solid var(--surface)',
            boxShadow: activeTab === 'map'
              ? '0 0 0 3px var(--orange-deep), 0 6px 24px rgba(239,86,22,0.5)'
              : '0 4px 20px rgba(239,86,22,0.38)',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', flexShrink: 0, fontSize: 24,
            marginTop: -8,
          }}>
          {trackingActive
            ? <span style={{ width: 14, height: 14, borderRadius: 3, background: '#fff', display: 'block' }} />
            : <CarIcon />
          }
          {trackingActive && (
            <span style={{
              position: 'absolute', top: 0, right: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: '#ff3b30', border: '2px solid #fff',
              animation: 'pulse-ring 1.4s ease-in-out infinite',
            }} />
          )}
        </button>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase',
          color: activeTab === 'map' ? 'var(--orange-deep)' : 'var(--text-mute)', marginTop: -2 }}>
          {trackingActive ? 'Live' : 'Track'}
        </span>
      </div>

      <NavTab id="places" label="Places" Icon={PlaceIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="stats" label="Stats" Icon={ChartIcon} activeTab={activeTab} setTab={setTab} />
      <NavTab id="settings" label="Settings" Icon={SettingsIcon} activeTab={activeTab} setTab={setTab} />
    </nav>
  )
}

function NavTab({ id, label, Icon, activeTab, setTab }) {
  const active = activeTab === id
  return (
    <button
      onClick={() => setTab(id)}
      aria-label={label}
      className="pressable"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '5px 2px 4px', background: 'none', border: 'none', cursor: 'pointer',
        color: active ? 'var(--orange-deep)' : 'var(--text-mute)',
        transition: 'color 0.2s ease',
      }}>
      <div style={{
        padding: '6px 12px', borderRadius: 12,
        background: active ? 'var(--orange-wash)' : 'transparent',
        transition: 'background 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={21} active={active} />
      </div>
      <span style={{ fontSize: 9, fontWeight: active ? 800 : 600, letterSpacing: 0.3 }}>{label}</span>
    </button>
  )
}

/* --- Icons --- */
function HomeIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? 'var(--orange-wash)' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function CompassIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" fill={active ? 'var(--orange-wash)' : 'none'} />
      <polygon points="16,8 13,13 8,16 11,11" fill={active ? 'var(--orange-deep)' : 'currentColor'} />
    </svg>
  )
}

function RouteIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="19" r="2.5" fill={active ? 'var(--orange-wash)' : 'none'}/>
      <circle cx="19" cy="5" r="2.5" fill={active ? 'var(--orange-wash)' : 'none'}/>
      <path d="M7.5 19h4a3.5 3.5 0 003.5-3.5V8.5a3.5 3.5 0 013.5-3.5h2"/>
    </svg>
  )
}

function PlaceIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77l-6.18 3.23L7 14.14 2 9.27l6.91-1.01L12 2z" fill={active ? 'var(--orange-wash)' : 'none'}/>
    </svg>
  )
}

function ChartIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <rect x="5" y="13" width="3" height="6" fill={active ? 'var(--orange-wash)' : 'none'} rx="1" />
      <rect x="10.5" y="9" width="3" height="10" fill={active ? 'var(--orange-wash)' : 'none'} rx="1" />
      <rect x="16" y="5" width="3" height="14" fill={active ? 'var(--orange-wash)' : 'none'} rx="1" />
    </svg>
  )
}

function SettingsIcon({ size, active }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" fill={active ? 'var(--orange-wash)' : 'none'} />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17a2 2 0 104 0 2 2 0 00-4 0z"/>
      <path d="M15 17a2 2 0 104 0 2 2 0 00-4 0z"/>
      <path d="M3 17V11l3-5h12l3 5v6" />
      <path d="M3 11h18" />
    </svg>
  )
}
