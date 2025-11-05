import { useLocationStore } from '@/shared/store'
import { useLocation } from './use-location'
import { useEffect } from 'react'

export function useLocationData() {
  const { 
    currentLocation, 
    selectedLocation, 
    hasLocation,
    setCurrentLocation, 
    setSelectedLocation, 
    clearLocation 
  } = useLocationStore()
  
  // Use the browser geolocation hook
  const { location, error, loading } = useLocation()

  // Sync browser location with the store
  useEffect(() => {
    if (location && !currentLocation) {
      setCurrentLocation(location)
    }
  }, [location, currentLocation, setCurrentLocation])

  return {
    currentLocation,
    selectedLocation,
    hasLocation,
    isLoading: loading,
    error,
    setCurrentLocation,
    setSelectedLocation,
    clearLocation,
    // Helper function to select current location as the selected one
    useCurrentAsSelected: () => {
      if (currentLocation) {
        setSelectedLocation(currentLocation)
        return true
      }
      return false
    }
  }
}