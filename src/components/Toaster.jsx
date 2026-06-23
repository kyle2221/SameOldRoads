import { useToastStore } from '../store/toast'

const ICONS = {
  info: 'ℹ️',
  success: '✓',
  error: '⚠️',
  warn: '⚠️',
}

const COLORS = {
  info: { bg: 'var(--surface)', border: 'var(--border)', accent: 'var(--text-soft)' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', accent: '#15803d' },
  error: { bg: '#fef2f2', border: '#fecaca', accent: '#b91c1c' },
  warn: { bg: '#fffbeb', border: '#fde68a', accent: '#b45309' },
}

// Toaster — fixed at the top of the viewport, dismissible, supports an optional
// action button (e.g. "Retry"). Renders above everything (z-index 9999).
export default function Toaster() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      width: 'calc(100% - 24px)', maxWidth: 440, pointerEvents: 'none',
    }}>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info
        return (
          <div key={t.id} style={{
            background: c.bg, border: `1px solid ${c.border}`, color: 'var(--text)',
            borderRadius: 14, padding: '12px 14px', boxShadow: 'var(--shadow-pop)',
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'auto',
            animation: 'toastIn 0.22s ease-out',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0, color: c.accent }}>{ICONS[t.type] || ICONS.info}</span>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{t.message}</div>
            {t.action && (
              <button onClick={() => { t.action.onClick?.(); dismiss(t.id) }}
                style={{ background: 'none', border: 'none', color: 'var(--orange-deep)', fontSize: 12, fontWeight: 800, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"
              style={{ background: 'none', border: 'none', color: 'var(--text-mute)', fontSize: 16, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0 }}>
              ×
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
