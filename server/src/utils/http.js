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
