// Minimal structured logger — no deps. Writes JSON in prod, pretty in dev.
const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production'

function fmt(o) {
  if (o instanceof Error) return { message: o.message, name: o.name, stack: isProd ? undefined : o.stack }
  return o
}

function emit(level, msg, meta) {
  const line = {
    t: new Date().toISOString(),
    level,
    msg,
    ...(meta ? fmt(meta) : {}),
  }
  if (isProd) {
    process.stdout.write(JSON.stringify(line) + '\n')
  } else {
    const c = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', debug: '\x1b[90m' }[level] || '\x1b[0m'
    process.stdout.write(`${c}[${line.t}] ${level.toUpperCase()}\x1b[0m ${msg}` + (meta ? ' ' + JSON.stringify(fmt(meta)) : '') + '\n')
  }
}

export const logger = {
  error: (msg, meta) => emit('error', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  info: (msg, meta) => emit('info', msg, meta),
  debug: (msg, meta) => { if (!isProd) emit('debug', msg, meta) },
}
