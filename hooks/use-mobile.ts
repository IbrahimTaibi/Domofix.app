import { useState, useEffect } from 'react'

/**
 * Hook to detect if the current viewport is mobile-sized
 * @param breakpoint - The max width in pixels to consider as mobile (default: 768px)
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    // Function to check if the screen is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile)

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [breakpoint])

  return isMobile
}