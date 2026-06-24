// AbortSignal.timeout() is unavailable in Safari < 16 and other older mobile
// browsers, where calling it throws "undefined is not a function". This returns
// an equivalent abort signal, falling back to AbortController + setTimeout.
export function timeoutSignal(ms) {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms)
  }
  if (typeof AbortController !== 'undefined') {
    const ctrl = new AbortController()
    setTimeout(() => ctrl.abort(), ms)
    return ctrl.signal
  }
  return undefined // no abort support — fetch simply runs without a timeout
}
