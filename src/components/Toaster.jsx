import { useToastStore } from '../store/toast'

const ICONS = {
  info: 'ℹ️',
  success: '✓',
  error: '⚠️',
  warn: '⚠️',
}

const COLORS = {
  info: { bg: 'var(--glass-bg)', border: 'var(--glass-border)', accent: 'var(--text-soft)' },
  success: { bg: 'var(--green-wash)', border: '#bbf7d0', accent: 'var(--green)' },
  error: { bg: 'var(--red-wash)', border: '#fecaca', accent: 'var(--red)' },
  warn: { bg: 'var(--yellow-wash)', border: '#fde68a', accent: 'var(--yellow)' },
}

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
            borderRadius: 14, padding: '12px 14px',
            backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            boxShadow: 'var(--shadow-pop)',
            display: 'flex', alignItems: 'center', gap: 10,
            pointerEvents: 'auto',
            animation: 'fadeInDown 0.22s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <span style={{
              fontSize: 14, flexShrink: 0, fontWeight: 700,
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'transparent',
              color: (t.type === 'success' || t.type === 'error') ? '#fff' : c.accent,
            }}>{ICONS[t.type] || ICONS.info}</span>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{t.message}</div>
            {t.action && (
              <button onClick={() => { t.action.onClick?.(); dismiss(t.id) }} className="pressable"
                style={{ background: 'none', border: 'none', color: 'var(--orange-deep)', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="pressable"
              style={{ background: 'none', border: 'none', color: 'var(--text-mute)', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
