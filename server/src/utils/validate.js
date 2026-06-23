// Tiny validation helpers — no zod, no deps.
// Each returns a sanitized value or `undefined` if the input is invalid.
// Use them in route handlers to keep param-parsing terse and consistent.

export function asNum(v, dflt) {
  if (v == null || v === '') return dflt
  const n = Number(v)
  return Number.isFinite(n) ? n : dflt
}

export function asInt(v, dflt) {
  if (v == null || v === '') return dflt
  const n = Number(v)
  if (!Number.isFinite(n)) return dflt
  return Math.trunc(n)
}

export function asLat(v) {
  if (v == null || v === '') return undefined
  const n = Number(v)
  if (!Number.isFinite(n) || n < -90 || n > 90) return undefined
  return n
}

export function asLng(v) {
  if (v == null || v === '') return undefined
  const n = Number(v)
  if (!Number.isFinite(n) || n < -180 || n > 180) return undefined
  return n
}

export function asStr(v, { max = 500, trim = true } = {}) {
  if (v == null) return undefined
  let s = String(v)
  if (trim) s = s.trim()
  if (!s) return undefined
  if (s.length > max) s = s.slice(0, max)
  return s
}

export function clampInt(v, min, max, dflt) {
  const n = asInt(v, dflt)
  if (n == null) return dflt
  if (n < min) return min
  if (n > max) return max
  return n
}
