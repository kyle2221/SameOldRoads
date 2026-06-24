import { useState } from 'react'
import { signInWithEmail, signUpWithEmail, signInAsGuest } from '../auth'
import NodeBackground from '../components/NodeBackground'

const inputStyle = {
  width: '100%', padding: '14px 16px', borderRadius: 14, fontSize: 16,
  border: '1.5px solid #e8e8e8', background: '#fafafa', color: '#0e0e10',
  marginBottom: 12, WebkitAppearance: 'none', appearance: 'none',
}

const btnPrimary = {
  width: '100%', padding: '15px 0', borderRadius: 14, fontSize: 18, fontWeight: 700,
  background: 'linear-gradient(135deg, #ff8a52, #ef5616)', color: '#fff', border: 'none',
  boxShadow: '0 6px 20px rgba(239,86,22,0.35)', cursor: 'pointer', marginBottom: 10,
  fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase', letterSpacing: 0.6,
}

const btnOutline = {
  width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 600,
  background: '#fff', border: '1.5px solid #e8e8e8', color: '#0e0e10',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10,
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg width="18" height="20" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-155.5-127.4C46.5 673.2 0 498.9 0 441c0-261.2 200.9-318.3 332.9-318.3 94.8 0 174.9 65.4 234.8 65.4 56 0 143.7-69.4 247.5-69.4zM540.5 100.6c-29.4 41.9-52.4 97.6-49.4 154.5 71.8 9.7 145.1-32.3 191.8-87.6 42.4-50 70.2-107.6 64.3-162.5-69.7 5-139.7 43.9-206.7 95.6z"/>
    </svg>
  )
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [showEmail, setShowEmail] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmail = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const user = mode === 'signup'
        ? await signUpWithEmail(email, password, name)
        : await signInWithEmail(email, password)
      onAuth(user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    const user = await signInAsGuest()
    onAuth(user)
  }

  const handleGoogle = () => {
    setError('Google Sign-In requires Firebase setup. Use email or continue as guest.')
  }

  const handleApple = () => {
    setError('Apple Sign-In requires an Apple Developer account. Use email or continue as guest.')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1a0d04', overflow: 'hidden' }}>
      {/* Hero */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #120800 0%, #2a1106 40%, #3d1a08 100%)', overflow: 'hidden' }}>
        <NodeBackground color="#ff8c3c" count={38} connectDist={110} speed={0.35} />

        {/* Radial glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,60,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,30,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, padding: '0 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16, filter: 'drop-shadow(0 2px 12px rgba(255,140,60,0.5))' }}>🛣️</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 46, fontWeight: 900, color: '#fff', letterSpacing: 0, lineHeight: 0.95, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
            Same Old<br />
            <span style={{ color: '#ff8a52' }}>Roads</span>
          </h1>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,220,190,0.6)', fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
            Your road trips, tracked.
          </p>
        </div>

        {/* Road decoration */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 60, background: 'linear-gradient(180deg, transparent, #fff)', pointerEvents: 'none' }} />
      </div>

      {/* Auth panel */}
      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', padding: '28px 24px 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)', marginTop: -24, maxHeight: '62%', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 22px' }} />

        <h2 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#1a1208', letterSpacing: 0, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: 14, color: '#9b9ba0' }}>
          {mode === 'signin' ? 'Sign in to your account to continue.' : 'Start tracking your road adventures.'}
        </p>

        {!showEmail ? (
          <>
            <button onClick={handleGoogle} style={btnOutline}>
              <GoogleLogo />
              Continue with Google
            </button>
            <button onClick={handleApple} style={{ ...btnOutline, background: '#000', color: '#fff', borderColor: '#000' }}>
              <AppleLogo />
              Continue with Apple
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 14px' }}>
              <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
              <span style={{ fontSize: 12, color: '#b0b0b5', fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#ebebeb' }} />
            </div>

            <button onClick={() => setShowEmail(true)} style={btnPrimary}>
              Continue with Email
            </button>
          </>
        ) : (
          <>
            {mode === 'signup' && (
              <input
                className="input-field"
                style={inputStyle}
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <input
              className="input-field"
              style={inputStyle}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
            <input
              className="input-field"
              style={{ ...inputStyle, marginBottom: 16 }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              onKeyDown={e => e.key === 'Enter' && handleEmail()}
            />
            {error && (
              <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: '#fff3f0', border: '1px solid #ffccc2', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button onClick={handleEmail} disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
            <button onClick={() => setShowEmail(false)} style={{ ...btnOutline, marginBottom: 6 }}>
              Back
            </button>
          </>
        )}

        {error && !showEmail && (
          <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 10, background: '#fff8f0', border: '1px solid #ffe0cc', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '4px 0 8px' }}>
          <span style={{ fontSize: 13, color: '#9b9ba0' }}>
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ fontSize: 13, fontWeight: 700, color: '#ef5616', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <button
          onClick={handleGuest}
          style={{ width: '100%', padding: '12px 0', borderRadius: 12, background: 'none', border: 'none', fontSize: 13, color: '#b0b0b5', cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}
        >
          Continue as Guest
        </button>

        <div style={{ height: 'env(safe-area-inset-bottom, 16px)', minHeight: 16 }} />
      </div>
    </div>
  )
}
