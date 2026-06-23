import rateLimit from 'express-rate-limit'
import { config } from '../config.js'

// Global per-IP limiter — applied at router root.
export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMITED',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
})

// Stricter limiter on the expensive upstream proxies.
export const upstreamLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 120,                  // 120/hour/IP — generous but protects quota
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many upstream requests this hour. Caching is on — repeated queries are cheap.',
    code: 'UPSTREAM_RATE_LIMITED',
  },
})
