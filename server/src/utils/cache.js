// Simple bounded LRU cache with TTL. No external deps.
// Use the same API as Map: get / set / has / delete.

export class TTLCache {
  constructor(maxEntries = 500) {
    this.max = maxEntries
    this.store = new Map() // Map preserves insertion order in JS
    this.stats = { hits: 0, misses: 0, sets: 0, evictions: 0 }
  }

  _expired(entry) {
    return Date.now() > entry.expiresAt
  }

  get(key) {
    if (!this.store.has(key)) { this.stats.misses++; return undefined }
    const entry = this.store.get(key)
    if (this._expired(entry)) {
      this.store.delete(key)
      this.stats.misses++
      return undefined
    }
    // Refresh insertion order so LRU eviction works
    this.store.delete(key)
    this.store.set(key, entry)
    this.stats.hits++
    return entry.value
  }

  set(key, value, ttlMs) {
    this.stats.sets++
    if (this.store.has(key)) this.store.delete(key)
    this.store.set(key, { value, expiresAt: Date.now() + (ttlMs || 60_000) })
    while (this.store.size > this.max) {
      const oldest = this.store.keys().next().value
      this.store.delete(oldest)
      this.stats.evictions++
    }
  }

  has(key) {
    if (!this.store.has(key)) return false
    if (this._expired(this.store.get(key))) { this.store.delete(key); return false }
    return true
  }

  delete(key) { return this.store.delete(key) }
  clear() { this.store.clear() }
  size() { return this.store.size }
  getStats() { return { ...this.stats, size: this.store.size, max: this.max } }
}

// Long-lived process-wide caches
export const caches = {
  placeSearch: new TTLCache(500),
  placeDetails: new TTLCache(500),
  reviews: new TTLCache(500),
  geocode: new TTLCache(500),
}
