import { useEffect, useRef, useState } from 'react'

// Wraps content and fades/rises it in the first time it scrolls into view.
// Uses IntersectionObserver against the viewport (works even though each page
// scrolls inside its own overflow container, since children still move in
// viewport coordinates). Falls back to visible if IO is unavailable, and the
// CSS disables the motion entirely under prefers-reduced-motion.
export default function Reveal({ children, delay = 0, y = 18, className = '', style, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }

    // Anything already touching the viewport at mount reveals right away
    // (it still animates from the offset) — covers above-the-fold content and
    // items peeking under the nav bar so they can never get stuck hidden.
    const vh = window.innerHeight || document.documentElement.clientHeight || 800
    const r = el.getBoundingClientRect()
    if (r.top < vh && r.bottom > 0) { setShown(true); return }

    // Everything else reveals the instant any pixel scrolls into view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) { setShown(true); io.disconnect() }
      },
      { threshold: 0, rootMargin: '0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <div
      ref={ref}
      className={`reveal${shown ? ' in-view' : ''}${className ? ' ' + className : ''}`}
      style={{ '--reveal-y': `${y}px`, transitionDelay: shown ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
