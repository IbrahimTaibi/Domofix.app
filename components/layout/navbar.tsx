'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Logo } from './logo'
import NavLinks from './nav-links'
import { useMobile } from '@/lib/hooks'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useMobile()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && 
          menuRef.current && 
          !menuRef.current.contains(event.target as Node) &&
          menuButtonRef.current && 
          !menuButtonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey as unknown as EventListener)
    return () => document.removeEventListener('keydown', handleEscKey as unknown as EventListener)
  }, [isMenuOpen])

  // Focus trap for accessibility
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleMenu()
    }
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-md py-2' 
        : 'bg-white/80 backdrop-blur-md py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="lg" />
          </div>

          {/* Desktop Navigation - Centered */}
          {!isMobile && (
            <div className="flex items-center justify-center flex-1 mx-4">
              <div className="flex items-center space-x-8">
                <NavLinks />
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium px-5 py-2.5">Se connecter</Button>
              </Link>
              <Link href="/get-started">
                <Button variant="primary" size="sm" className="font-medium px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">Commencer</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <button
              ref={menuButtonRef}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={toggleMenu}
              onKeyDown={handleKeyDown}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-controls="mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
        </div>

        {/* Mobile menu - with animation and accessibility */}
        <div 
          id="mobile-menu"
          ref={menuRef}
          className={`
            fixed left-0 right-0 top-[calc(var(--navbar-height,4rem))] 
            bg-white/95 backdrop-blur-md shadow-lg 
            transition-all duration-300 ease-in-out 
            overflow-hidden z-40
            ${isMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}
          `}
          aria-hidden={!isMenuOpen}
        >
          <div className={`
            py-5 px-4 space-y-6 
            transform transition-transform duration-300 ease-in-out
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-10'}
          `}>
            {/* Navigation links with fade-in animation */}
            <div className="transition-opacity duration-300 ease-in-out delay-100">
              <NavLinks isMobile={true} onLinkClick={closeMenu} />
            </div>
            
            {/* CTA buttons with fade-in animation */}
            <div className="pt-3 space-y-3 transition-opacity duration-300 ease-in-out delay-200">
              <Link href="/login" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-center">Se connecter</Button>
              </Link>
              <Link href="/get-started" className="block">
                <Button variant="primary" size="sm" className="w-full justify-center">Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

