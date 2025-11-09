import { useState, useEffect } from 'react'
import { Location } from '@darigo/shared-types'

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n’est pas supportée par votre navigateur.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (error) => {
        let message = 'Échec de la localisation.'
        // Provide friendlier messages depending on error code
        // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
        switch ((error as GeolocationPositionError).code) {
          case 1:
            message = 'Accès à la position refusé. Autorisez la localisation dans votre navigateur.'
            break
          case 2:
            message = 'Position indisponible pour le moment. Vérifiez vos services de localisation.'
            break
          case 3:
            message = 'La demande de localisation a expiré. Réessayez.'
            break
          default:
            message = error.message || message
        }
        // Also log technical details for diagnostics
        // eslint-disable-next-line no-console
        console.warn('Geolocation error:', { code: (error as GeolocationPositionError).code, message: error.message })
        setError(message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }, [])

  return { location, error, loading }
}

