// Number / price / time formatting helpers used across the terminal.

export function fmtPrice(v, digits) {
  if (v == null || Number.isNaN(v)) return '—'
  const d = digits != null ? digits : v >= 1000 ? 2 : v >= 1 ? 2 : 4
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export function fmtNum(v, digits = 2) {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function fmtSigned(v, digits = 2) {
  if (v == null || Number.isNaN(v)) return '—'
  const s = v > 0 ? '+' : ''
  return s + v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function fmtPct(v, digits = 2) {
  if (v == null || Number.isNaN(v)) return '—'
  const s = v > 0 ? '+' : ''
  return `${s}${v.toFixed(digits)}%`
}

// 1.23T / 45.6B / 789M / 12.3K
export function fmtCompact(v) {
  if (v == null || Number.isNaN(v)) return '—'
  const a = Math.abs(v)
  const sign = v < 0 ? '-' : ''
  if (a >= 1e12) return `${sign}${(a / 1e12).toFixed(2)}T`
  if (a >= 1e9)  return `${sign}${(a / 1e9).toFixed(2)}B`
  if (a >= 1e6)  return `${sign}${(a / 1e6).toFixed(2)}M`
  if (a >= 1e3)  return `${sign}${(a / 1e3).toFixed(1)}K`
  return `${sign}${a.toFixed(0)}`
}

export function dirClass(v) {
  if (v > 0) return 'up'
  if (v < 0) return 'down'
  return 'flat'
}

export function arrow(v) {
  if (v > 0) return '▲'
  if (v < 0) return '▼'
  return '·'
}

const pad = (n) => String(n).padStart(2, '0')

export function fmtClock(d, withSeconds = true, tz) {
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  if (withSeconds) opts.second = '2-digit'
  if (tz) opts.timeZone = tz
  return new Intl.DateTimeFormat('en-US', opts).format(d)
}

export function fmtTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function fmtBarTime(unixSec) {
  const d = new Date(unixSec * 1000)
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
