import { getUnits } from '../theme'

// Distance: stored in meters. Display based on user preference (metric/imperial).
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return '0'
  const units = getUnits()
  if (units === 'imperial') {
    const ft = meters * 3.28084
    if (ft < 1000) return `${Math.round(ft)} ft`
    const mi = meters / 1609.344
    return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`
  }
  // metric (default)
  if (meters < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`
}

// Speed: meters/sec -> km/h or mph
export function formatSpeed(metersPerSec) {
  if (metersPerSec == null || isNaN(metersPerSec)) return '0'
  const units = getUnits()
  if (units === 'imperial') return `${Math.round(metersPerSec * 2.23694)} mph`
  return `${Math.round(metersPerSec * 3.6)} km/h`
}

export function formatDuration(ms) {
  const s = Math.floor((ms || 0) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${sec}s`
}

export function formatDurationLong(ms) {
  const s = Math.floor((ms || 0) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const parts = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ') || '0m'
}

export function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return formatDate(ts)
}

export function formatRating(rating) {
  if (rating == null) return '—'
  return Number(rating).toFixed(1)
}
