'use client'

import React from 'react'
import Button from './button'
import { AlertTriangle } from 'lucide-react'

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
  if (!isOpen) return null

  const variantStyles = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  }

  const iconColor = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 ${iconColor[variant]}`}>
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className={`text-lg font-semibold ${variantStyles[variant]} mb-2`}>
              {title}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
