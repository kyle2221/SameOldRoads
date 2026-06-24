import { useId } from 'react'

// Lightweight SVG preview of a route path — no Leaflet, no network.
// Normalizes lat/lng into a viewBox and draws a glowing orange line with
// green start / orange end dots over a dark adventure gradient. Used on
// trip-log cards where mounting a full map would be heavy and slow.
export default function RouteThumb({ path = [], height = 104, radius = 0, flat = false }) {
  const W = 240, H = 132, pad = 20
  // Unique gradient ids per instance — multiple thumbnails on one screen would
  // otherwise collide on shared ids and mis-resolve the fills.
  const uid = useId().replace(/:/g, '')
  const bgId = `rt-bg-${uid}`, strokeId = `rt-stroke-${uid}`, glowId = `rt-glow-${uid}`

  let body
  if (!path || path.length < 2) {
    body = (
      <text x={W / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.3)" fontSize="13" fontFamily="'Rajdhani', sans-serif"
        letterSpacing="1.5" style={{ textTransform: 'uppercase' }}>
        No route data
      </text>
    )
  } else {
    const lats = path.map(p => p.lat), lngs = path.map(p => p.lng)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
    const spanLat = (maxLat - minLat) || 1e-6
    const spanLng = (maxLng - minLng) || 1e-6
    const s = Math.min((W - pad * 2) / spanLng, (H - pad * 2) / spanLat)
    const offX = (W - spanLng * s) / 2
    const offY = (H - spanLat * s) / 2
    const pts = path.map(p => [
      offX + (p.lng - minLng) * s,
      offY + (maxLat - p.lat) * s, // invert latitude (north = up)
    ])
    const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ')
    const [x0, y0] = pts[0]
    const [x1, y1] = pts[pts.length - 1]
    body = (
      <>
        <path d={d} fill="none" stroke="#ff6a2b" strokeWidth="9" strokeOpacity="0.22" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={`url(#${strokeId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x0} cy={y0} r="5.5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
        <circle cx={x1} cy={y1} r="5.5" fill="#ef5616" stroke="#fff" strokeWidth="2" />
      </>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height, display: 'block', borderRadius: radius }}>
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#160800" />
          <stop offset="55%" stopColor="#2a0f04" />
          <stop offset="100%" stopColor="#5e2207" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffb070" />
          <stop offset="100%" stopColor="#ef5616" />
        </linearGradient>
        <radialGradient id={glowId} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="rgba(255,140,60,0.22)" />
          <stop offset="100%" stopColor="rgba(255,140,60,0)" />
        </radialGradient>
      </defs>
      {!flat && <rect x="0" y="0" width={W} height={H} fill={`url(#${bgId})`} />}
      {!flat && <rect x="0" y="0" width={W} height={H} fill={`url(#${glowId})`} />}
      {body}
    </svg>
  )
}
