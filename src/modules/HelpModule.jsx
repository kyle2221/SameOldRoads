import { useStore } from '../store'
import { FUNCTIONS } from '../data/functions'
import Panel from '../components/Panel'
import Icon from '../components/Icons'

const GROUPS = ['Core', 'Security', 'Markets', 'Research', 'Trading']

const EXAMPLES = [
  ['AAPL', 'Load Apple and open its overview'],
  ['AAPL GP', 'Open the price chart for Apple'],
  ['NVDA FA', 'Financial analysis for NVIDIA'],
  ['TSLA N', 'News filtered to Tesla'],
  ['TOP', 'Market movers (gainers / losers)'],
  ['HEAT', 'Sector heatmap'],
  ['ECO', 'Economic calendar'],
  ['BTC GP', 'Chart Bitcoin'],
]

const SHORTCUTS = [
  ['⌘K / Ctrl K', 'Open the command palette'],
  ['/', 'Jump to the command line'],
  ['⏎', 'Run the typed command'],
  ['↑ / ↓', 'Browse autocomplete or command history'],
  ['Tab', 'Complete the highlighted suggestion'],
  ['Esc', 'Dismiss palette / suggestions'],
]

export default function HelpModule() {
  const { runCommand } = useStore()
  return (
    <div className="thin-scroll" style={{ height: '100%', overflow: 'auto', padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 800, margin: 0 }}>NXT<span className="amber"> TERMINAL</span> — Function Reference</h1>
        <p className="muted" style={{ fontSize: 12, marginTop: 4, maxWidth: 720, lineHeight: 1.5 }}>
          Drive the terminal from the command line at the top: type a security, a function code, or both
          (e.g. <span className="mono amber">AAPL GP</span>). Use the sidebar to jump between screens, or
          <span className="mono"> ⌘K</span> for the command palette.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
        <Panel title="Functions" tag="MENU">
          <div style={{ padding: 6 }}>
            {GROUPS.map((g) => (
              <div key={g} style={{ marginBottom: 10 }}>
                <div className="dim" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 8px' }}>{g}</div>
                {FUNCTIONS.filter((f) => f.group === g).map((f) => (
                  <button key={f.code} onClick={() => runCommand(f.code)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 5, textAlign: 'left' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <Icon name={f.icon} size={15} stroke="var(--text-3)" />
                    <span className="mono amber" style={{ fontSize: 12, fontWeight: 700, width: 52 }}>{f.code}</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', width: 150 }}>{f.label}</span>
                    <span className="muted" style={{ fontSize: 11, flex: 1 }}>{f.desc}</span>
                    {f.aliases.length > 0 && <span className="dim mono" style={{ fontSize: 9.5 }}>{f.aliases.join(' ')}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel title="Command Examples" tag="TRY">
            <div style={{ padding: 8 }}>
              {EXAMPLES.map(([cmd, desc]) => (
                <button key={cmd} onClick={() => runCommand(cmd)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 5, textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <span className="mono amber" style={{ fontSize: 11.5, fontWeight: 700, width: 78 }}>{cmd}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{desc}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Keyboard Shortcuts" tag="KEYS">
            <div style={{ padding: 10 }}>
              {SHORTCUTS.map(([k, d]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(27,31,39,0.6)' }}>
                  <span className="muted" style={{ fontSize: 11.5 }}>{d}</span>
                  <kbd className="mono" style={{ fontSize: 10, color: 'var(--text)', border: '1px solid var(--border-2)', borderRadius: 3, padding: '2px 7px', background: 'var(--panel-3)' }}>{k}</kbd>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
