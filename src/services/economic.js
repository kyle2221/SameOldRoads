// Simulated economic calendar covering a window around "today". Past events carry
// an actual; upcoming events show forecast/previous only.

const COUNTRIES = { US: '🇺🇸', EU: '🇪🇺', UK: '🇬🇧', JP: '🇯🇵', CN: '🇨🇳', DE: '🇩🇪' }

// recurring release templates: [country, name, importance, unit, basePrev, baseFcst, dayOfWeek, time]
const EVENTS = [
  ['US', 'Initial Jobless Claims', 'md', 'K', 221, 225, 4, '08:30'],
  ['US', 'CPI (YoY)', 'hi', '%', 3.1, 3.0, 2, '08:30'],
  ['US', 'Core CPI (MoM)', 'hi', '%', 0.3, 0.3, 2, '08:30'],
  ['US', 'Retail Sales (MoM)', 'md', '%', 0.4, 0.3, 1, '08:30'],
  ['US', 'Nonfarm Payrolls', 'hi', 'K', 177, 185, 5, '08:30'],
  ['US', 'Unemployment Rate', 'hi', '%', 4.2, 4.2, 5, '08:30'],
  ['US', 'ISM Manufacturing PMI', 'md', '', 48.7, 49.2, 1, '10:00'],
  ['US', 'FOMC Rate Decision', 'hi', '%', 4.50, 4.50, 3, '14:00'],
  ['US', 'Fed Chair Press Conference', 'hi', '', null, null, 3, '14:30'],
  ['US', 'GDP (QoQ, annualized)', 'hi', '%', 2.8, 2.5, 4, '08:30'],
  ['US', 'PCE Price Index (YoY)', 'hi', '%', 2.6, 2.5, 5, '08:30'],
  ['US', 'Durable Goods Orders', 'lo', '%', 0.2, 0.4, 3, '08:30'],
  ['US', 'Consumer Confidence', 'md', '', 100.4, 101.0, 2, '10:00'],
  ['EU', 'ECB Rate Decision', 'hi', '%', 2.75, 2.75, 4, '08:15'],
  ['EU', 'HICP Inflation (YoY)', 'md', '%', 2.2, 2.1, 3, '05:00'],
  ['UK', 'BoE Rate Decision', 'hi', '%', 4.25, 4.25, 4, '07:00'],
  ['UK', 'CPI (YoY)', 'md', '%', 2.6, 2.5, 3, '02:00'],
  ['JP', 'BoJ Rate Decision', 'hi', '%', 0.50, 0.50, 5, '23:00'],
  ['CN', 'Manufacturing PMI', 'md', '', 49.5, 49.8, 6, '21:00'],
  ['DE', 'Ifo Business Climate', 'lo', '', 87.0, 87.5, 1, '04:00'],
]

const pad = (n) => String(n).padStart(2, '0')
function jitter(base, scale, seed) {
  if (base == null) return null
  const r = Math.sin(seed * 99.13) * 43758.5453
  return base + (r - Math.floor(r) - 0.5) * scale
}

export function getEconomicCalendar(refDate = new Date(), daysBack = 3, daysFwd = 6) {
  const out = []
  const today = new Date(refDate); today.setHours(0, 0, 0, 0)
  for (let d = -daysBack; d <= daysFwd; d++) {
    const day = new Date(today); day.setDate(day.getDate() + d)
    const dow = day.getDay()
    const isPast = d < 0 || (d === 0)
    EVENTS.forEach((e, idx) => {
      const [country, name, importance, unit, prev, fcst, evDow, time] = e
      if (evDow !== dow) return
      const seed = idx * 7 + d * 31 + dow
      const previous = prev == null ? null : Number(jitter(prev, Math.abs(prev) * 0.08 + 0.1, seed).toFixed(2))
      const forecast = fcst == null ? null : Number(jitter(fcst, Math.abs(fcst) * 0.06 + 0.1, seed + 1).toFixed(2))
      const released = d < 0 || (d === 0 && Math.random() < 0.5)
      const actual = released && forecast != null ? Number(jitter(forecast, Math.abs(forecast) * 0.12 + 0.15, seed + 2).toFixed(2)) : null
      out.push({
        id: `${day.toISOString().slice(0, 10)}-${idx}`,
        date: day, dateStr: `${pad(day.getMonth() + 1)}/${pad(day.getDate())}`,
        dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
        time, country, flag: COUNTRIES[country] || '🏳️',
        name, importance, unit,
        previous, forecast, actual,
        isToday: d === 0, isPast,
      })
    })
  }
  return out.sort((a, b) => a.date - b.date || a.time.localeCompare(b.time))
}
