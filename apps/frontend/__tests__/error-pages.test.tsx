import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'
import Forbidden from '@/app/403/page'
import InternalError from '@/app/500/page'

describe('Static Error Pages', () => {
  it('renders NotFound page', () => {
    render(<NotFound />)
    expect(screen.getByText(/404 — Page introuvable/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retour à l’accueil/i })).toBeInTheDocument()
  })

  it('renders Forbidden page', () => {
    render(<Forbidden />)
    expect(screen.getByText(/403 — Accès interdit/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument()
  })

  it('renders InternalError page', () => {
    render(<InternalError />)
    expect(screen.getByText(/500 — Erreur interne du serveur/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retour à l’accueil/i })).toBeInTheDocument()
  })
})