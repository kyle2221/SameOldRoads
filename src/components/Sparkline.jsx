// Lightweight inline SVG sparkline coloured by net direction.
export default function Sparkline({ data, width = 84, height = 22, strokeWidth = 1.3 }) {
  if (!data || data.length < 2) return <svg width={width} height={height} />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const n = data.length
  const pts = data.map((v, i) => {
    const x = (i / (n - 1)) * (width - 2) + 1
    const y = height - 1 - ((v - min) / range) * (height - 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const up = data[n - 1] >= data[0]
  const color = up ? 'var(--up)' : 'var(--down)'
  const id = `sg-${up ? 'u' : 'd'}-${width}-${height}`
  const areaPts = `1,${height - 1} ${pts.join(' ')} ${width - 1},${height - 1}`
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${id})`} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
