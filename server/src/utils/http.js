import { config } from '../config.js'

// Node 18+ has global fetch — we don't need node-fetch.

export class UpstreamError extends Error {
  constructor(message, { status = 502, upstream = null, code = null } = {}) {
    super(message)
    this.name = 'UpstreamError'
    this.status = status
    this.upstream = upstream
    this.code = code
  }
}

// fetch() with timeout + JSON parsing + structured errors
export async function fetchJSON(url, { timeoutMs, method = 'GET', headers = {}, query = null, body = null, label = 'upstream' } = {}) {
  const t = timeoutMs || config.upstreamTimeoutMs
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), t)

  const finalUrl = new URL(url)
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      finalUrl.searchParams.set(k, String(v))
    })
  }

  try {
    const res = await fetch(finalUrl.toString(), {
      method,
      headers: { 'Accept': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const text = await res.text()
    let json = null
    try { json = text ? JSON.parse(text) : null } catch { /* leave json null */ }

    if (!res.ok) {
      const apiMsg = json?.error?.message || json?.error || json?.message || text?.slice(0, 200) || res.statusText
      throw new UpstreamError(`${label} returned ${res.status}: ${apiMsg}`, {
        status: res.status >= 400 && res.status < 500 ? 502 : 502,
        upstream: label,
        code: String(res.status),
      })
    }
    return json
  } catch (e) {
    if (e instanceof UpstreamError) throw e
    if (e.name === 'AbortError') {
      throw new UpstreamError(`${label} timed out after ${t}ms`, { status: 504, upstream: label, code: 'TIMEOUT' })
    }
    throw new UpstreamError(`${label} network error: ${e.message}`, { status: 502, upstream: label, code: 'NETWORK' })
  } finally {
    clearTimeout(timer)
  }
}

// fetch() that returns binary bytes — used for proxying Google Place photos.
export async function fetchBuffer(url, { timeoutMs, method = 'GET', headers = {}, label = 'upstream' } = {}) {
  const t = timeoutMs || config.upstreamTimeoutMs
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), t)

  try {
    const res = await fetch(url, {
      method,
      headers: { ...headers },
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new UpstreamError(`${label} returned ${res.status}: ${text?.slice(0, 200) || res.statusText}`, {
        status: 502,
        upstream: label,
        code: String(res.status),
      })
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    return { buffer, contentType }
  } catch (e) {
    if (e instanceof UpstreamError) throw e
    if (e.name === 'AbortError') {
      throw new UpstreamError(`${label} timed out after ${t}ms`, { status: 504, upstream: label, code: 'TIMEOUT' })
    }
    throw new UpstreamError(`${label} network error: ${e.message}`, { status: 502, upstream: label, code: 'NETWORK' })
  } finally {
    clearTimeout(timer)
  }
}

// Wrap a promise-returning fn with one retry on transient errors (5xx, timeout, network).
// Exponential backoff: 250ms → 500ms. Don't retry 4xx (client errors are not transient).
export async function withRetry(fn, { retries = 1, baseDelayMs = 250 } = {}) {
  let lastErr
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      const isTransient = e instanceof UpstreamError
        && (e.code === 'TIMEOUT' || e.code === 'NETWORK' || (e.status >= 500 && e.status < 600))
      if (!isTransient || attempt === retries) throw e
      const delay = baseDelayMs * Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}
