import type { ServiceCategory } from '@domofix/shared-types'

export interface TimePoint {
  date: string
  value: number
}

export interface OrdersStatusCount {
  status: string
  count: number
}

export interface RequestsCategoryCount {
  category: ServiceCategory
  count: number
}

export interface KPIItem {
  title: string
  value: string
  delta?: string
  icon?: React.ReactNode
  series?: TimePoint[]
}

export interface ActivityItem {
  type: 'request' | 'order' | 'message'
  title: string
  timestamp: string
}
