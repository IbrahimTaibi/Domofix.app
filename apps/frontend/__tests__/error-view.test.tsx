import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorView from '@/shared/components/error/error-view'

describe('ErrorView', () => {
  it('renders code, title, description and actions', () => {
    render(
      <ErrorView
        code={404}
        title="Page introuvable"
        description="La page que vous recherchez n'existe pas ou a été déplacée."
        actions={[
          { label: 'Retour à l’accueil', href: '/' },
          { label: 'Aller à la connexion', href: '/auth' },
        ]}
      />
    )

    expect(screen.getByText(/404 — Page introuvable/i)).toBeInTheDocument()
    expect(screen.getByText(/La page que vous recherchez/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retour à l’accueil/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aller à la connexion/i })).toBeInTheDocument()
  })
})