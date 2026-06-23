import { useStore } from '../store'
import { FUNCTIONS } from '../data/functions'
import Icon from './Icons'

const GROUPS = ['Core', 'Security', 'Markets', 'Research', 'Trading']

export default function Sidebar() {
  const { activeModule, secTab, navigate, symbol } = useStore()

  const isActive = (f) => {
    if (f.module !== activeModule) return false
    if (f.tab) return secTab === f.tab
    if (f.module === 'sec') return secTab === 'overview'
    return true
  }

  return (
    <nav className="thin-scroll" style={{ width: 158, flexShrink: 0, background: 'var(--bg-1)', borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '6px 6px 14px' }}>
      {GROUPS.map((g) => (
        <div key={g} style={{ marginTop: 8 }}>
          <div className="dim" style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 8px' }}>{g}</div>
          {FUNCTIONS.filter((f) => f.group === g).map((f) => {
            const active = isActive(f)
            return (
              <button key={f.code} onClick={() => navigate(f.module, { tab: f.tab })}
                title={`${f.code} — ${f.desc}`}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 5,
                  marginBottom: 1, color: active ? 'var(--text)' : 'var(--text-2)',
                  background: active ? 'var(--sel)' : 'transparent',
                  borderLeft: active ? '2px solid var(--amber)' : '2px solid transparent',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--hover)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <Icon name={f.icon} size={14} stroke={active ? 'var(--amber)' : 'currentColor'} />
                <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, flex: 1, textAlign: 'left' }}>{f.label}</span>
                <span className="mono" style={{ fontSize: 8.5, color: active ? 'var(--amber)' : 'var(--text-3)', fontWeight: 700 }}>{f.code}</span>
              </button>
            )
          })}
        </div>
      ))}
      <div style={{ marginTop: 14, padding: '8px', borderTop: '1px solid var(--border)' }}>
        <div className="dim" style={{ fontSize: 8.5, letterSpacing: 0.5 }}>LOADED SECURITY</div>
        <div className="mono amber" style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{symbol}</div>
      </div>
    </nav>
  )
}
