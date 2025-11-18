'use client'

import React, { useEffect, useState } from 'react'
import Button from './button'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'info',
}: ConfirmationDialogProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const variantConfig = {
    danger: {
      titleColor: 'text-red-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      Icon: AlertTriangle,
    },
    warning: {
      titleColor: 'text-amber-700',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      Icon: AlertTriangle,
    },
    info: {
      titleColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: Info,
    },
  }

  const config = variantConfig[variant]
  const IconComponent = config.Icon

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={onCancel}
    >
      <div
        className={`bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${config.iconBg} p-3 rounded-xl`}>
              <IconComponent className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-1">
              <h2 className={`text-xl font-bold ${config.titleColor} mb-2`}>
                {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-base text-gray-700 leading-relaxed pl-[4.5rem]">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Chargement...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
