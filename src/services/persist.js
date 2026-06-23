// Tiny namespaced localStorage wrapper for watchlists, layout and settings.
const NS = 'nxt:'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch {
    /* quota / private mode — ignore */
  }
}
