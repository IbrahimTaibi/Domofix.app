import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomNav from '@/features/widget/components/bottom-nav'
import { useWidgetStore } from '@/features/widget/store/widget-store'

describe('BottomNav', () => {
  it('renders three tabs with labels and icons', () => {
    render(<BottomNav />)
    expect(screen.getByRole('tab', { name: /Acceuil/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Messages/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Help/i })).toBeInTheDocument()
  })
  it('switches tab on click', () => {
    render(<BottomNav />)
    fireEvent.click(screen.getByRole('tab', { name: /Messages/i }))
    expect(useWidgetStore.getState().tab).toBe('messages')
  })
})