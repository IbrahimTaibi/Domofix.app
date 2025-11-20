"use client"

import { useState, useEffect } from 'react'
import Input from '@/shared/components/input'
import Button from '@/shared/components/button'
import { Lock } from 'lucide-react'
import { apiClient } from '@/shared/utils/api'
import { isValidPassword } from '@domofix/shared-utils'

interface ResetPasswordPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ResetPasswordPage({ searchParams = {} }: ResetPasswordPageProps) {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({})

  useEffect(() => {
    const t = (searchParams['token'] ?? '')
    setToken(Array.isArray(t) ? t[0] : t)
  }, [searchParams])

  const validate = () => {
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {}
    if (!isValidPassword(newPassword)) {
      nextErrors.newPassword = 'Minimum 8 caractères, au moins une majuscule, une minuscule et un chiffre.'
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!validate()) return
    setStatus('loading')
    try {
      await apiClient.resetPassword({ token, newPassword })
      setStatus('success')
      setMessage('Votre mot de passe a été réinitialisé. Vous pouvez vous connecter.')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h2>
          <p className="mt-2 text-sm text-gray-600">Choisissez un nouveau mot de passe pour votre compte.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-md border ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <Input
            id="reset-newPassword"
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            name="newPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
            required
            error={errors.newPassword}
          />
          <Input
            id="reset-confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            required
            error={errors.confirmPassword}
          />
          <p className="text-xs text-gray-500">
            Le mot de passe doit contenir au minimum 8 caractères, avec au moins une minuscule, une majuscule et un chiffre.
          </p>
          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Réinitialisation...' : 'Réinitialiser'}
          </Button>
          <div className="text-center">
            <a href="/auth" className="text-sm text-gray-600 hover:text-gray-900">Retour à la connexion</a>
          </div>
        </form>
      </div>
    </div>
  )
}