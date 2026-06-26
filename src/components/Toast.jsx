import { useEffect } from 'react'
import { useStore } from '../store'
import { IconCheck, IconCar, IconCompass, IconFlag } from './Icons'

const TYPE_META = {
  success: {
    bg: 'linear-gradient(135deg, #ff8a52, #fc4c02)',
    border: 'rgba(255,255,255,0.18)',
    Icon: IconCheck,
  },
  info: {
    bg: 'rgba(14,8,4,0.95)',
    border: 'rgba(255,255,255,0.1)',
    Icon: IconCar,
  },
  route: {
    bg: 'rgba(14,8,4,0.95)',
    border: 'rgba(255,120,40,0.3)',
    Icon: IconCompass,
  },
  delete: {
    bg: 'rgba(239,68,68,0.92)',
    border: 'rgba(255,255,255,0.1)',
    Icon: IconFlag,
  },
}

export default function Toasts() {
  const toasts = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)
  if (!toasts.length) return null
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      padding: '12px 16px', pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDone={() => removeToast(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDone }) {
  useEffect(() => {
    const id = setTimeout(onDone, 2800)
    return () => clearTimeout(id)
  }, [onDone])

  const meta = TYPE_META[toast.type] || TYPE_META.info
  const { Icon } = meta

  return (
    <div style={{
      background: meta.bg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRadius: 16, padding: '13px 16px',
      border: `1px solid ${meta.border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)',
      display: 'flex', alignItems: 'center', gap: 10,
      color: '#fff', fontSize: 14, fontWeight: 700,
      fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.2,
      pointerEvents: 'auto',
      animation: 'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 9,
        background: 'rgba(255,255,255,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} color="#fff" sw={2.5} />
      </div>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{toast.message}</span>
      {toast.sub && (
        <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, flexShrink: 0 }}>{toast.sub}</span>
      )}
    </div>
  )
}
