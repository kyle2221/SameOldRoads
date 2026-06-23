import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('[ErrorBoundary]', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null })
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🛣️💥</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>You hit a pothole</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--text-mute)', lineHeight: 1.5 }}>
              Something went wrong rendering this screen. Reload to get back on the road.
            </p>
            <button
              onClick={this.handleReload}
              style={{ padding: '12px 22px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ff8a52, #ef5616)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
            >
              Reload
            </button>
            {this.state.error && (
              <pre style={{ marginTop: 16, textAlign: 'left', fontSize: 11, color: 'var(--text-mute)', background: 'var(--surface-2)', padding: 10, borderRadius: 8, overflow: 'auto', maxHeight: 120 }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
