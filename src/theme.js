// Theme + units persisted in localStorage. Pure helper module — no React context needed,
// any component can subscribe via the subscribe() function or just read on mount.

const THEME_KEY = 'sor_theme'      // 'light' | 'dark' | 'system'
const UNITS_KEY = 'sor_units'      // 'metric' | 'imperial'
const RESOLVED_KEY = 'sor_resolved' // 'light' | 'dark' (the actual applied value)

export function getThemePref() {
  return localStorage.getItem(THEME_KEY) || 'system'
}
export function setThemePref(v) {
  localStorage.setItem(THEME_KEY, v)
  applyTheme()
}
export function getUnits() {
  return localStorage.getItem(UNITS_KEY) || 'metric'
}
export function setUnits(v) {
  localStorage.setItem(UNITS_KEY, v)
}

export function getResolvedTheme() {
  const pref = getThemePref()
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function applyTheme() {
  const resolved = getResolvedTheme()
  document.documentElement.setAttribute('data-theme', resolved)
  localStorage.setItem(RESOLVED_KEY, resolved)
  // Notify any listeners
  window.dispatchEvent(new CustomEvent('themechange', { detail: { resolved, pref: getThemePref() } }))
}

// Auto-apply on import + listen to system preference changes
if (typeof window !== 'undefined') {
  applyTheme()
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getThemePref() === 'system') applyTheme()
    })
  } catch { /* older browsers */ }
}

// Hook helper for React components
import { useEffect, useState } from 'react'
export function useTheme() {
  const [state, setState] = useState({ pref: getThemePref(), resolved: getResolvedTheme() })
  useEffect(() => {
    const handler = (e) => setState({ pref: getThemePref(), resolved: e.detail.resolved })
    window.addEventListener('themechange', handler)
    return () => window.removeEventListener('themechange', handler)
  }, [])
  return {
    ...state,
    setPref: (p) => setThemePref(p),
    toggle: () => setThemePref(state.resolved === 'dark' ? 'light' : 'dark'),
  }
}

export function useUnits() {
  const [units, setUnitsState] = useState(getUnits())
  useEffect(() => {
    const handler = () => setUnitsState(getUnits())
    window.addEventListener('unitschange', handler)
    return () => window.removeEventListener('unitschange', handler)
  }, [])
  return [units, (v) => { setUnits(v); window.dispatchEvent(new Event('unitschange')) }]
}
