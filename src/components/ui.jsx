// Shared UI primitives — use these across pages for visual consistency.
// Each is a tiny functional component with sensible defaults.

// ---------- Card ----------
// Consistent surface with border + shadow. Optional hover lift and press.
export function Card({ children, style, hover = false, onClick, className = '', ...rest }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={`pressable ${className}`}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        ...(hover ? { cursor: 'pointer' } : {}),
        ...(onClick ? { cursor: 'pointer', textAlign: 'left', width: '100%' } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// ---------- PageHeader ----------
// The colored gradient header used at the top of every page.
// Variants: 'warm' (orange-to-dark), 'soft' (peach wash), 'minimal' (surface only)
export function PageHeader({ title, subtitle, variant = 'soft', children, right }) {
  const styles = {
    warm: {
      background: 'var(--hero-grad)',
      color: '#fff',
    },
    soft: {
      background: 'linear-gradient(180deg, var(--discover-1) 0%, var(--discover-2) 42%, var(--bg) 100%)',
      color: 'var(--text)',
    },
    minimal: {
      background: 'var(--surface)',
      color: 'var(--text)',
      borderBottom: '1px solid var(--border)',
    },
  }
  return (
    <div style={{
      padding: variant === 'warm' ? '70px 20px 22px' : '54px 20px 22px',
      position: 'relative', overflow: 'hidden',
      ...styles[variant],
    }}>
      {variant !== 'minimal' && (
        <div style={{
          position: 'absolute', top: -80, right: -60, width: 220, height: 220,
          borderRadius: '50%',
          background: variant === 'warm'
            ? 'radial-gradient(circle, rgba(255,255,255,0.08), transparent)'
            : 'radial-gradient(circle, rgba(255,122,60,0.4), transparent)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {subtitle && (
            <p style={{
              margin: 0, fontSize: 14,
              color: variant === 'warm' ? 'rgba(255,255,255,0.55)' : 'var(--text-soft)',
              position: 'relative', fontWeight: 500,
            }}>{subtitle}</p>
          )}
          <h1 style={{
            margin: subtitle ? '4px 0 0' : '0',
            fontSize: 30, fontWeight: 700, letterSpacing: -0.8,
            fontFamily: 'var(--font-display)',
            color: variant === 'warm' ? '#fff' : 'var(--text)',
            position: 'relative', lineHeight: 1.1,
          }}>{title}</h1>
        </div>
        {right && <div style={{ flexShrink: 0 }}>{right}</div>}
      </div>
      {children}
    </div>
  )
}

// ---------- ShimmerSkeleton ----------
// Animated placeholder block.
export function Skeleton({ width = '100%', height = 14, radius = 8, style }) {
  return (
    <div
      className="shimmer"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

// ---------- EmptyState ----------
export function EmptyState({ icon = '✨', title, message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{
        fontSize: 44, marginBottom: 14, opacity: 0.6,
        display: 'inline-block', animation: 'float 3s ease-in-out infinite',
      }}>{icon}</div>
      {title && (
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>{title}</div>
      )}
      {message && (
        <div style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>{message}</div>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}

// ---------- Tag / Chip ----------
export function Tag({ children, color = 'default', size = 'md' }) {
  const colors = {
    default: { bg: 'var(--surface-2)', color: 'var(--text-soft)' },
    orange: { bg: 'var(--orange-wash)', color: 'var(--orange-deep)' },
    blue: { bg: 'var(--blue-wash)', color: 'var(--blue-deep)' },
    green: { bg: 'var(--green-wash)', color: 'var(--green)' },
    red: { bg: 'var(--red-wash)', color: 'var(--red)' },
  }
  const c = colors[color] || colors.default
  const sizes = {
    sm: { padding: '2px 7px', fontSize: 10 },
    md: { padding: '3px 9px', fontSize: 11 },
  }
  return (
    <span style={{
      ...sizes[size], ...c,
      borderRadius: 6, fontWeight: 600, whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>{children}</span>
  )
}

// ---------- SectionLabel ----------
// Small uppercase label above a section of content.
export function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--text-mute)', letterSpacing: 1.4,
      textTransform: 'uppercase', fontWeight: 700, ...style,
    }}>{children}</div>
  )
}

// ---------- Spinner ----------
export function Spinner({ size = 26, color = 'var(--orange)', track = 'var(--orange-tint)' }) {
  return (
    <div style={{
      width: size, height: size, margin: '0 auto',
      border: `3px solid ${track}`, borderTopColor: color,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ---------- Modal / BottomSheet ----------
// Spring-up bottom sheet with backdrop blur. Close on backdrop tap.
export function BottomSheet({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 2000,
        background: 'rgba(10, 10, 15, 0.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pressable"
        style={{
          width: '100%', background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          padding: '16px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          boxShadow: 'var(--shadow-pop)',
          animation: 'slideUpSheet 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 4, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{title}</div>
          <button onClick={onClose} className="pressable" style={{ background: 'var(--surface-2)', border: 'none', color: 'var(--text-mute)', fontSize: 16, cursor: 'pointer', lineHeight: 1, width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      </div>
    </div>
  )
}

// ---------- StatTile ----------
// A compact stat card with icon, value, and label.
export function StatTile({ icon, value, label, accent = false }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--r-lg)', padding: '14px 16px',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
      position: 'relative', overflow: 'hidden',
    }}>
      {accent && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--orange-light), var(--orange-deep))' }} />
      )}
      <div style={{ fontSize: 18, marginBottom: 4, opacity: 0.9 }}>{icon}</div>
      <div className="text-gradient" style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, fontFamily: 'var(--font-display)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  )
}
