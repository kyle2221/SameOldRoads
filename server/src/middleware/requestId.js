import { randomUUID } from 'crypto'
import { logger } from '../utils/logger.js'

// Assigns a short request id to every request and measures duration.
// Id is surfaced in logs and in the X-Request-Id response header so a user
// can include it in a bug report and we can grep for it.
export function requestId(req, res, next) {
  const id = (req.get('x-request-id') || randomUUID()).slice(0, 36)
  req.id = id
  res.set('X-Request-Id', id)
  res._startTime = Date.now()
  next()
}

// After-the-fact structured access log per request.
// Skips /api/health in prod to keep logs clean.
export function accessLog(req, res, next) {
  res.on('finish', () => {
    if (req.path === '/api/health' && process.env.NODE_ENV === 'production') return
    const dur = Date.now() - (res._startTime || Date.now())
    const level = res.statusCode >= 500 ? 'warn' : 'debug'
    logger[level]('req', {
      id: req.id,
      method: req.method,
      path: req.originalUrl || req.path,
      status: res.statusCode,
      dur,
      ip: req.ip?.replace(/^::ffff:/, ''),
    })
  })
  next()
}
