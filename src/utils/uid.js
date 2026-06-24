// Safe unique-id generator.
// crypto.randomUUID() only exists in *secure contexts* (https or localhost).
// Opened over plain http on a LAN IP — e.g. http://192.168.x.x:5173 on a phone —
// window.crypto.randomUUID is undefined and calling it throws
// "undefined is not a function". This falls back to a manual RFC-4122 v4.
export function uid() {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()

  if (c && typeof c.getRandomValues === 'function') {
    const b = c.getRandomValues(new Uint8Array(16))
    b[6] = (b[6] & 0x0f) | 0x40 // version 4
    b[8] = (b[8] & 0x3f) | 0x80 // variant 10
    const h = [...b].map(x => x.toString(16).padStart(2, '0'))
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`
  }

  // Last-resort fallback for ancient runtimes with no crypto at all.
  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`
}
