import { useEffect, useRef } from 'react'

function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export default function NodeBackground({ color = '#ff8c3c', count = 42, connectDist = 115, speed = 0.38 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let nodes = []

    const init = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement?.getBoundingClientRect() || { width: 0, height: 0 }
      const w = rect.width || window.innerWidth
      const h = rect.height || window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.resetTransform?.()
      ctx.scale(dpr, dpr)
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 1.1,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      const t = Date.now() / 1000

      ctx.clearRect(0, 0, w, h)

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0) { n.x = 0; n.vx = Math.abs(n.vx) }
        else if (n.x > w) { n.x = w; n.vx = -Math.abs(n.vx) }
        if (n.y < 0) { n.y = 0; n.vy = Math.abs(n.vy) }
        else if (n.y > h) { n.y = h; n.vy = -Math.abs(n.vy) }
      })

      ctx.lineWidth = 0.75
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectDist) {
            const alpha = (1 - dist / connectDist) * 0.38
            ctx.strokeStyle = rgba(color, alpha)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      nodes.forEach(n => {
        const pulse = 0.8 + 0.2 * Math.sin(t * 1.4 + n.phase)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = rgba(color, 0.65)
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()

    const onResize = () => { cancelAnimationFrame(animId); init(); draw() }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [color, count, connectDist, speed])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}
