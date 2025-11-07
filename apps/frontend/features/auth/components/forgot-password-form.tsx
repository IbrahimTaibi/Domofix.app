"use client"

import { useState } from 'react'
import Input from '@/shared/components/input'
import Button from '@/shared/components/button'
import { Mail } from 'lucide-react'
import { apiClient } from '@/shared/utils/api'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage(null)
    try {
      await apiClient.forgotPassword({ email })
      setStatus('success')
      setMessage('Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue")
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="mt-2 text-2xl font-bold text-gray-900">Mot de passe oublié</h2>
        <p className="mt-2 text-sm text-gray-600">Entrez votre email pour recevoir un lien de réinitialisation.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md border ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="forgot-email"
          label="Email"
          type="email"
          placeholder="exemple@email.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le lien'}
        </Button>
        <div className="text-center">
          <a href="/auth" className="text-sm text-gray-600 hover:text-gray-900">Retour à la connexion</a>
        </div>
      </form>
    </div>
  )
}