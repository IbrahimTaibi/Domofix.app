import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FiltersBar from '@/shared/components/requests/filters-bar'
import { RequestStatus, ServiceCategory } from '@darigo/shared-types'

describe('FiltersBar', () => {
  it('calls onChange when status changes', () => {
    const onChange = jest.fn()
    render(<FiltersBar status={RequestStatus.OPEN} category={ServiceCategory.PLUMBER} search="" sort="newest" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Statut'), { target: { value: '' } })
    expect(onChange).toHaveBeenCalled()
  })
})

