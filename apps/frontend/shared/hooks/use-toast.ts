'use client'

import { useCallback } from 'react'
import { useToastStore, type ToastVariant } from '@/shared/store/toast-store'

export interface ShowOptions {
  title?: string
  duration?: number
  dismissible?: boolean
  action?: { label: string; onClick?: () => void }
}

export function useToast() {
  const showBase = useToastStore((s) => s.show)
  const dismiss = useToastStore((s) => s.dismiss)
  const clear = useToastStore((s) => s.clear)

  const show = useCallback((message: string, variant: ToastVariant = 'info', options: ShowOptions = {}) => {
    return showBase({
      message,
      variant,
      title: options.title,
      duration: options.duration ?? 4000,
      dismissible: options.dismissible ?? true,
      action: options.action,
    })
  }, [showBase])

  const success = useCallback((message: string, options: ShowOptions = {}) => show(message, 'success', options), [show])
  const error = useCallback((message: string, options: ShowOptions = {}) => show(message, 'error', options), [show])
  const info = useCallback((message: string, options: ShowOptions = {}) => show(message, 'info', options), [show])
  const warning = useCallback((message: string, options: ShowOptions = {}) => show(message, 'warning', options), [show])

  return { show, success, error, info, warning, dismiss, clear }
}