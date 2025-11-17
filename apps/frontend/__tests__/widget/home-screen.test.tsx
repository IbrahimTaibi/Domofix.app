import React from 'react'
import { render, screen } from '@testing-library/react'
import HomeScreen from '@/features/widget/components/screens/home-screen'

describe('HomeScreen', () => {
  it('renders Domofix in full white and welcome message', () => {
    render(<HomeScreen />)
    const heading = screen.getByLabelText(/Domofix/i)
    expect(heading).toBeInTheDocument()
    const span = heading.querySelector('span')
    expect(span?.textContent?.toLowerCase()).toBe('domofix')
    expect(span?.className).toContain('text-white')
    expect(screen.getByText(/Bienvenue sur Domofix/i)).toBeInTheDocument()
  })
})