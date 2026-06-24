// Local-only auth — uses Web Crypto (PBKDF2) for password hashing.
// Note: this is NOT a substitute for a real backend with server-side auth,
// but it's a vast improvement over the previous btoa() base64 scheme.
// PBKDF2 with 150k iterations + per-user salt + SHA-256.

const SESSION_KEY = 'sor_session'
const USERS_KEY = 'sor_users'
const PBKDF2_ITERATIONS = 150_000
const SALT_LENGTH = 16 // bytes
const KEY_LENGTH = 32  // bytes

function bufToB64(buf) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}
function b64ToBuf(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

async function deriveKey(password, saltBytes) {
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    KEY_LENGTH * 8
  )
  return new Uint8Array(bits)
}
function randomSalt() {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}
async function hashPassword(password) {
  const salt = randomSalt()
  const hash = await deriveKey(password, salt)
  return `${PBKDF2_ITERATIONS}.$${bufToB64(salt)}.$${bufToB64(hash)}`
}
async function verifyPassword(password, stored) {
  try {
    const [iterStr, saltB64, hashB64] = stored.split('.$')
    const iter = Number(iterStr)
    if (!iter || !saltB64 || !hashB64) return false
    const salt = new Uint8Array(b64ToBuf(saltB64))
    const expected = new Uint8Array(b64ToBuf(hashB64))
    const computed = await deriveKey(password, salt)
    if (computed.length !== expected.length) return false
    // constant-time compare
    let diff = 0
    for (let i = 0; i < computed.length; i++) diff |= computed[i] ^ expected[i]
    return diff === 0
  } catch {
    return false
  }
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}
function setUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function storeSession(user) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); return user }
export function signOut() { localStorage.removeItem(SESSION_KEY) }

export async function signUpWithEmail(email, password, name) {
  const key = email.trim().toLowerCase()
  if (!key || !password) throw new Error('Email and password are required.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')
  if (password.length > 256) throw new Error('Password is too long.')
  const users = getUsers()
  if (users[key]) throw new Error('An account already exists with that email.')
  const hashed = await hashPassword(password)
  const user = {
    id: crypto.randomUUID(),
    email: key,
    name: (name || key.split('@')[0]).trim(),
    pw: hashed,
    provider: 'email',
    createdAt: Date.now(),
  }
  users[key] = user; setUsers(users)
  return storeSession({ id: user.id, email: user.email, name: user.name, provider: 'email', createdAt: user.createdAt })
}

export async function signInWithEmail(email, password) {
  const key = email.trim().toLowerCase()
  const users = getUsers()
  const user = users[key]
  if (!user) throw new Error('No account found. Sign up first.')
  const ok = await verifyPassword(password, user.pw)
  if (!ok) throw new Error('Incorrect password.')
  return storeSession({ id: user.id, email: user.email, name: user.name, provider: 'email', createdAt: user.createdAt })
}

export async function signInAsGuest() {
  return storeSession({ id: `guest-${Date.now()}`, email: null, name: 'Road Tripper', provider: 'guest', createdAt: Date.now() })
}

// One-time migration: upgrade any legacy btoa()-style passwords to PBKDF2.
// Runs transparently on first sign-in; users keep the same password.
export async function migrateLegacyPasswords() {
  const users = getUsers()
  let changed = false
  for (const [email, u] of Object.entries(users)) {
    if (u.pw && !u.pw.includes('.$')) {
      // Legacy btoa password — decode and re-hash
      try {
        const plain = decodeURIComponent(escape(atob(u.pw)))
        u.pw = await hashPassword(plain)
        changed = true
      } catch {
        // can't decode — drop the user (their old data is unrecoverable anyway since this is local-only)
        delete users[email]
        changed = true
      }
    }
  }
  if (changed) setUsers(users)
}
