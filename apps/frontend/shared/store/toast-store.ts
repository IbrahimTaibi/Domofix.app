import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick?: () => void
}

export interface Toast {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration?: number // milliseconds
  dismissible?: boolean
  action?: ToastAction
  createdAt: number
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id' | 'createdAt'> & { id?: string }) => string
  dismiss: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = toast.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const createdAt = Date.now()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id, createdAt }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))