import React from 'react'
import { render, screen } from '@testing-library/react'
import RequestCard from '@/shared/components/requests/request-card'
import { RequestStatus, type Request } from '@domofix/shared-types'

function makeRequest(overrides: Partial<Request> = {}): any {
  return {
    id: 'req_1',
    phone: '0600000000',
    category: 'plumber',
    status: RequestStatus.OPEN,
    createdAt: new Date().toISOString(),
    estimatedTimeOfService: new Date().toISOString(),
    location: { address: '1 rue de Paris' },
    details: 'Problème de fuite',
    ...overrides,
  }
}

describe('RequestCard', () => {
  it('renders status badge and details', () => {
    render(<RequestCard request={makeRequest()} />)
    expect(screen.getByText(/Problème de fuite/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Statut/)).toBeInTheDocument()
  })
})

