import { timeoutSignal } from './timeout'

const WMO = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌦️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export async function getWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`
    const r = await fetch(url, { signal: timeoutSignal(6000) })
    if (!r.ok) return null
    const { current: c } = await r.json()
    return {
      temp: Math.round(c.temperature_2m),
      icon: WMO[c.weathercode] ?? '🌡️',
      wind: Math.round(c.windspeed_10m),
    }
  } catch {
    return null
  }
}
