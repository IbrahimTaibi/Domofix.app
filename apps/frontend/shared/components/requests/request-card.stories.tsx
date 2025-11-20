import type { Meta, StoryObj } from '@storybook/react'
import RequestCard from './request-card'
import { RequestStatus } from '@domofix/shared-types'

const meta: Meta<typeof RequestCard> = {
  title: 'Requests/RequestCard',
  component: RequestCard,
}

export default meta

type Story = StoryObj<typeof RequestCard>

export const Open: Story = {
  args: {
    request: {
      id: 'req_1',
      phone: '0600000000',
      category: 'plumber',
      status: RequestStatus.OPEN,
      createdAt: new Date().toISOString(),
      estimatedTimeOfService: new Date().toISOString(),
      location: { address: '1 rue de Paris' },
      details: 'Problème de fuite',
    },
  },
}

