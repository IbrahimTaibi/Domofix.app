import { create } from 'zustand'

export interface ProviderSummary {
  id: string
  name: string
  title?: string
  avatar?: string | null
  bio?: string | null
  address?: { fullAddress?: string | null; city?: string | null; country?: string | null } | null
  timezone?: string | null
  locale?: string | null
  status?: string | null
  providerStatus?: string | null
  rating?: number
  reviewCount?: number
  completedCount?: number
  specialties?: string[]
  proposedEts?: string | null
  proposedPrice?: number | null
  proposedPriceRange?: { min: number; max: number } | null
  pricingRange?: { min: number; max: number } | null
  availability?: any | null
}

export interface ProvidersSelectionState {
  request: { id: string; category?: string; status?: string; estimatedTimeOfService?: string } | null
  providers: ProviderSummary[]
  selected: string[]
  filters: { sort?: 'rating' | 'reviews' | 'price' | 'availability'; minRating?: number }
  loading: boolean
  error: string | null
  setRequest: (r: ProvidersSelectionState['request']) => void
  setProviders: (list: ProviderSummary[]) => void
  toggleSelect: (id: string) => void
  setFilters: (f: ProvidersSelectionState['filters']) => void
  setLoading: (v: boolean) => void
  setError: (msg: string | null) => void
}

export const useProvidersSelectionStore = create<ProvidersSelectionState>((set, get) => ({
  request: null,
  providers: [],
  selected: [],
  filters: { sort: 'rating', minRating: undefined },
  loading: false,
  error: null,
  setRequest: (r) => set({ request: r }),
  setProviders: (list) => set({ providers: list }),
  toggleSelect: (id) => {
    const sel = get().selected
    const next = sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id].slice(0, 2)
    set({ selected: next })
  },
  setFilters: (f) => set({ filters: f }),
  setLoading: (v) => set({ loading: v }),
  setError: (msg) => set({ error: msg }),
}))