'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useToastStore, type Toast } from '@/shared/store/toast-store'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import Button from '@/shared/components/button'

function VariantIcon({ variant }: { variant: Toast['variant'] }) {
  if (variant === 'success') return <CheckCircle2 className="h-5 w-5 text-green-700" aria-hidden="true" />
  if (variant === 'error') return <XCircle className="h-5 w-5 text-red-700" aria-hidden="true" />
  if (variant === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-700" aria-hidden="true" />
  return <Info className="h-5 w-5 text-blue-700" aria-hidden="true" />
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => dismiss(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, dismiss])

  const role = toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status'
  const ariaLive = toast.variant === 'error' || toast.variant === 'warning' ? 'assertive' : 'polite'

  const accent = {
    success: { border: 'border-green-600', title: 'text-green-700' },
    error: { border: 'border-red-600', title: 'text-red-700' },
    info: { border: 'border-blue-600', title: 'text-blue-700' },
    warning: { border: 'border-yellow-600', title: 'text-yellow-700' },
  } as const

  return (
    <div
      className={`pointer-events-auto w-[360px] max-w-[90vw] rounded-lg shadow-lg bg-white ring-1 ring-gray-200 p-3 border-l-4 ${accent[toast.variant].border}`}
      role={role}
      aria-live={ariaLive}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0"><VariantIcon variant={toast.variant} /></div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className={`text-sm font-semibold truncate ${accent[toast.variant].title}`}>{toast.title}</p>
          )}
          <p className="text-sm">
            {toast.message}
          </p>
          {toast.action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.action?.onClick?.()}
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
        {toast.dismissible !== false && (
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => dismiss(toast.id)}
            className="rounded-md p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const target = document.getElementById('toast-root') ?? document.body

  const content = (
    <div className="fixed right-4 top-4 md:top-auto md:bottom-4 z-[100] flex flex-col gap-3 pointer-events-none items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )

  return createPortal(content, target)
}