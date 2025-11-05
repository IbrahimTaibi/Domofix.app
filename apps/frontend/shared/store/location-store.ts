import { create } from 'zustand'
import { Location } from '@darigo/shared-types'

interface LocationState {
  currentLocation: Location | null
  selectedLocation: Location | null
  hasLocation: boolean
  
  setCurrentLocation: (location: Location) => void
  setSelectedLocation: (location: Location) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  selectedLocation: null,
  hasLocation: false,

  setCurrentLocation: (location) => 
    set({ currentLocation: location, hasLocation: true }),
  
  setSelectedLocation: (location) => 
    set({ selectedLocation: location }),
  
  clearLocation: () => 
    set({ currentLocation: null, selectedLocation: null, hasLocation: false }),
}))

