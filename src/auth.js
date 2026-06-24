// localStorage-based auth — works offline, no backend needed.
// To add real OAuth, wire up Firebase in src/firebase.js and replace
// signInWithGoogle / signInWithApple implementations.

import { uid } from './utils/uid'

const SESSION_KEY = 'sor_session'
const USERS_KEY = 'sor_users'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}

function setUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}

function storeSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function signOut() { localStorage.removeItem(SESSION_KEY) }

export async function signUpWithEmail(email, password, name) {
  const users = getUsers()
  const key = email.trim().toLowerCase()
  if (!key || !password) throw new Error('Email and password are required.')
  if (password.length < 6) throw new Error('Password must be at least 6 characters.')
  if (users[key]) throw new Error('An account already exists with that email.')
  const user = { id: uid(), email: key, name: (name || key.split('@')[0]).trim(), pw: btoa(unescape(encodeURIComponent(password))), provider: 'email', createdAt: Date.now() }
  users[key] = user
  setUsers(users)
  return storeSession({ id: user.id, email: user.email, name: user.name, provider: 'email' })
}

export async function signInWithEmail(email, password) {
  const users = getUsers()
  const key = email.trim().toLowerCase()
  const user = users[key]
  if (!user) throw new Error('No account found. Sign up first.')
  const pw = btoa(unescape(encodeURIComponent(password)))
  if (user.pw !== pw) throw new Error('Incorrect password.')
  return storeSession({ id: user.id, email: user.email, name: user.name, provider: 'email' })
}

export async function signInAsGuest() {
  return storeSession({ id: `guest-${Date.now()}`, email: null, name: 'Road Tripper', provider: 'guest' })
}
