import type { Meta, StoryObj } from '@storybook/react'
import FiltersBar from './filters-bar'
import { RequestStatus, ServiceCategory } from '@domofix/shared-types'

const meta: Meta<typeof FiltersBar> = {
  title: 'Requests/FiltersBar',
  component: FiltersBar,
}

export default meta

type Story = StoryObj<typeof FiltersBar>

export const Default: Story = {
  args: {
    status: RequestStatus.OPEN,
    category: ServiceCategory.PLUMBER,
    search: '',
    sort: 'newest',
    onChange: () => {},
  },
}

