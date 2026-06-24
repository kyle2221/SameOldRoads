import { logger } from '../utils/logger.js'

// 404 handler
export function notFound(req, res) {
  res.status(404).json({ error: 'Not found', path: req.path })
}

// Central error handler — must have 4 args for Express to detect it.
export function errorHandler(err, _req, res, _next) {
  const status = err?.status || err?.statusCode || 500
  const code = err?.code || 'INTERNAL'
  const upstream = err?.upstream || null
  const payload = {
    error: err?.message || 'Internal server error',
    code,
  }
  if (upstream) payload.upstream = upstream
  if (status >= 500) {
    logger.error('request failed', { status, code, upstream, msg: err?.message, name: err?.name })
  } else {
    logger.warn('client error', { status, code, upstream, msg: err?.message })
  }
  res.status(status).json(payload)
}

// Async route wrapper — avoids try/catch boilerplate.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
