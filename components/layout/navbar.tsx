'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Logo } from './logo'
import NavLinks from './nav-links'
import { useMobile } from '@/lib/hooks'
import { useAuth } from '@/hooks/use-auth'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useMobile()
  const { isAuthenticated, user, logout } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  
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
      
      if (isUserMenuOpen && 
          userMenuRef.current && 
          !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current && 
          !userMenuButtonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen, isUserMenuOpen])

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false)
        }
        if (isUserMenuOpen) {
          setIsUserMenuOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscKey as unknown as EventListener)
    return () => document.removeEventListener('keydown', handleEscKey as unknown as EventListener)
  }, [isMenuOpen, isUserMenuOpen])

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
        ? 'bg-white shadow-md py-1 sm:py-1.5' 
        : 'bg-white/80 backdrop-blur-md py-2 sm:py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size={isMobile ? "sm" : "md"} />
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
              {isAuthenticated ? (
                // Authenticated user menu
                <div className="relative">
                  <button
                    ref={userMenuButtonRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                    </span>
                    <svg 
                      className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div 
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Mon profil
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Paramètres
                      </Link>
                      <hr className="my-1" />
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Non-authenticated user buttons
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="font-medium px-5 py-2.5">Se connecter</Button>
                  </Link>
                  <Link href="/get-started">
                    <Button variant="primary" size="sm" className="font-medium px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">Commencer</Button>
                  </Link>
                </>
              )}
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
              {isAuthenticated ? (
                // Authenticated user mobile menu
                <>
                  <div className="text-center text-sm text-gray-600 pb-2">
                    Bonjour, {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                  </div>
                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-center">Tableau de bord</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-center"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                // Non-authenticated user mobile menu
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-center">Se connecter</Button>
                  </Link>
                  <Link href="/get-started" className="block">
                    <Button variant="primary" size="sm" className="w-full justify-center">Commencer</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

