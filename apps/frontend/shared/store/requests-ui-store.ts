import { create } from 'zustand'
import type { RequestStatus, ServiceCategory } from '@darigo/shared-types'

interface RequestsUiState {
  status?: RequestStatus
  category?: ServiceCategory
  search?: string
  sort?: 'newest' | 'eta' | 'category'
  page: number
  limit: number
  viewMode: 'grid' | 'list'
  appliedIds: Set<string>
  statusOverrides: Map<string, RequestStatus>
  setStatus: (s?: RequestStatus) => void
  setCategory: (c?: ServiceCategory) => void
  setSearch: (q?: string) => void
  setSort: (s: 'newest' | 'eta' | 'category') => void
  setPage: (p: number) => void
  setViewMode: (m: 'grid' | 'list') => void
  addApplied: (id: string) => void
  removeApplied: (id: string) => void
  clearApplied: () => void
  setStatusOverride: (id: string, status: RequestStatus) => void
  removeStatusOverride: (id: string) => void
  reset: () => void
}

export const useRequestsUiStore = create<RequestsUiState>((set) => ({
  status: undefined,
  category: undefined,
  search: '',
  sort: 'newest',
  page: 1,
  limit: 10,
  viewMode: 'list',
  appliedIds: new Set<string>(),
  statusOverrides: new Map<string, RequestStatus>(),
  setStatus: (status) => set({ status, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setSearch: (search) => set({ search: search || '', page: 1 }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set({ page }),
  setViewMode: (viewMode) => set({ viewMode }),
  addApplied: (id) => set((s) => { const n = new Set(s.appliedIds); n.add(id); return { appliedIds: n } }),
  removeApplied: (id) => set((s) => { const n = new Set(s.appliedIds); n.delete(id); return { appliedIds: n } }),
  clearApplied: () => set({ appliedIds: new Set<string>() }),
  setStatusOverride: (id, status) => set((s) => { const m = new Map(s.statusOverrides); m.set(id, status); return { statusOverrides: m } }),
  removeStatusOverride: (id) => set((s) => { const m = new Map(s.statusOverrides); m.delete(id); return { statusOverrides: m } }),
  reset: () => set({ status: undefined, category: undefined, search: '', sort: 'newest', page: 1 }),
}))
