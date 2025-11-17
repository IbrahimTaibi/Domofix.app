"use client"

import { create } from 'zustand'

export type WidgetTab = 'home' | 'messages' | 'help'

interface WidgetState {
  open: boolean
  tab: WidgetTab
  setOpen: (v: boolean) => void
  setTab: (t: WidgetTab) => void
}

export const useWidgetStore = create<WidgetState>((set) => ({
  open: false,
  tab: 'home',
  setOpen: (v) => set({ open: v }),
  setTab: (t) => set({ tab: t }),
}))