import type { Meta, StoryObj } from '@storybook/react'
import RequestsList from './requests-list'
import { RequestStatus } from '@darigo/shared-types'

const meta: Meta<typeof RequestsList> = {
  title: 'Requests/RequestsList',
  component: RequestsList,
}

export default meta

type Story = StoryObj<typeof RequestsList>

export const Many: Story = {
  args: {
    items: Array.from({ length: 3 }).map((_, i) => ({
      id: `req_${i + 1}`,
      phone: '0600000000',
      category: 'plumber',
      status: RequestStatus.OPEN,
      createdAt: new Date().toISOString(),
      estimatedTimeOfService: new Date().toISOString(),
      location: { address: '1 rue de Paris' },
      details: 'Problème de fuite',
    })),
  },
}

