// Tiny global toast store + portal. No deps. Use `toast.show(msg, opts)` from anywhere.
// Mount <Toaster /> once near the app root (App.jsx already does this).

import { create } from 'zustand'

let _id = 0

export const useToastStore = create((set, get) => ({
  toasts: [],
  show: (message, { type = 'info', duration = 3200, action } = {}) => {
    const id = ++_id
    set((s) => ({ toasts: [...s.toasts, { id, message, type, action }] }))
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  info: (msg, opts) => useToastStore.getState().show(msg, { ...opts, type: 'info' }),
  success: (msg, opts) => useToastStore.getState().show(msg, { ...opts, type: 'success' }),
  error: (msg, opts) => useToastStore.getState().show(msg, { ...opts, type: 'error', duration: opts?.duration ?? 4500 }),
  warn: (msg, opts) => useToastStore.getState().show(msg, { ...opts, type: 'warn' }),
  dismiss: (id) => useToastStore.getState().dismiss(id),
}
