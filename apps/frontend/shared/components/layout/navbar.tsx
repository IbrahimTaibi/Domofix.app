'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/shared/components'
import { Bell } from 'lucide-react'
import { useNotificationsStore } from '@/shared/store/notifications-store'
import { Logo } from './logo'
import NavLinks from './nav-links'
import { useMobile } from '@/shared/hooks'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSession } from 'next-auth/react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useMobile()
  const { isAuthenticated, user, logout } = useAuth()
  const { data: session, status } = useSession()
  const sessionUser = session?.user
  const unreadCount = useNotificationsStore((s) => s.unreadCount)
  const notifications = useNotificationsStore((s) => s.notifications)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifMenuRef = useRef<HTMLDivElement>(null)
  const notifButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // NextAuth session is managed by SessionProvider; useSession() updates on sign-in/out

  // Dynamically set CSS var --navbar-height based on actual rendered height
  useEffect(() => {
    const updateNavbarHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight
        document.documentElement.style.setProperty('--navbar-height', `${height}px`)
      }
    }

    // Initial measurement
    updateNavbarHeight()

    // Observe size changes
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      ro = new ResizeObserver(() => updateNavbarHeight())
      ro.observe(navRef.current)
    }

    // Also update on window resize and scroll state changes
    const handleResize = () => updateNavbarHeight()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize)
      if (ro && navRef.current) {
        ro.disconnect()
      }
    }
  }, [scrolled])

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

      if (isNotifOpen &&
          notifMenuRef.current &&
          !notifMenuRef.current.contains(event.target as Node) &&
          notifButtonRef.current &&
          !notifButtonRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
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
    <nav ref={navRef} className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-md py-1 sm:py-1.5' 
        : 'bg-white/80 backdrop-blur-md py-2 sm:py-3'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size={isMobile ? "sm" : "md"} />
          </div>

          {/* Desktop Navigation - Centered */}
          {!isMobile && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex items-center space-x-8">
                <NavLinks />
              </div>
            </div>
          )}

          {/* Right-side content: CTA or Mobile Menu Button */}
          <div className="flex items-center justify-end">
            {!isMobile ? (
              <div className="flex items-center space-x-4">
                {(isAuthenticated || status === 'authenticated') ? (
                  // Authenticated user menu
                  <>
                    {/* Become provider link (authenticated non-provider users only) */}
                    {user?.role !== 'provider' && (
                      <Link
                        href="/register/provider"
                        className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800"
                      >
                        Devenir prestataire
                      </Link>
                    )}
                    <div className="relative">
                      <button
                        ref={notifButtonRef}
                        type="button"
                        onClick={() => setIsNotifOpen((v) => !v)}
                        aria-label="Notifications"
                        className="relative inline-flex items-center justify-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                      >
                        <span className="w-8 h-8 rounded-full bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                          <Bell className="w-5 h-5" />
                        </span>
                        {unreadCount > 0 && (
                          <span
                            className="absolute rounded-full bg-red-600"
                            style={{ top: '-2px', right: '-2px', width: '10px', height: '10px', boxShadow: '0 0 0 2px #fff' }}
                          />
                        )}
                      </button>
                      {isNotifOpen && (
                        <div
                          ref={notifMenuRef}
                          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 overflow-x-hidden"
                        >
                          <div className="px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Notifications</span>
                            <Link href="/notifications" className="text-xs text-primary-600 hover:text-primary-700">Voir tout</Link>
                          </div>
                          <div className="max-h-64 overflow-y-auto overflow-x-hidden scrollbar-light">
                            {notifications.filter((n) => !n.readAt).length === 0 ? (
                              <div className="px-3 py-3 text-xs text-gray-600">Aucune notification non lue</div>
                            ) : (
                              notifications.filter((n) => !n.readAt).slice(0, 6).map((n) => (
                                <div key={n.id} className="px-3 py-2 hover:bg-gray-50">
                                  <div className="flex items-start gap-2">
                                    <span className="mt-0.5 inline-block w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate break-words">{n.title}</div>
                                      <div className="text-xs text-gray-600 truncate break-words">{n.message}</div>
                                      <div className="text-[11px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                            <button className="text-xs text-gray-600 hover:text-gray-800" onClick={() => { markAllRead(); setIsNotifOpen(false) }}>Marquer tout comme lu</button>
                            <Link href="/notifications" className="text-xs text-primary-600 hover:text-primary-700">Aller aux notifications</Link>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        ref={userMenuButtonRef}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-expanded={isUserMenuOpen}
                        aria-haspopup="true"
                      >
                        {(user?.avatar || session?.user?.image) ? (
                          <Image
                            src={(user?.avatar || session?.user?.image) as string}
                            alt={((user?.firstName ? user.firstName : (session?.user?.name || 'Utilisateur')) as string)}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                            quality={100}
                            priority
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {(user?.firstName?.charAt(0).toUpperCase()) || (session?.user?.name?.charAt(0).toUpperCase()) || 'U'}
                          </div>
                        )}
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
                            <p className="text-sm font-medium text-gray-900">{user ? `${user.firstName} ${user.lastName}` : (sessionUser?.name || 'Utilisateur')}</p>
                            <p className="text-xs text-gray-500">{user?.email || sessionUser?.email || ''}</p>
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
                  </>
                ) : (
                  // Non-authenticated user buttons
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" size="sm" className="font-medium px-5 py-2.5">Se connecter</Button>
                    </Link>
                    <Link href="/get-started">
                      <Button variant="primary" size="sm" className="font-medium px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow">Commencer</Button>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              /* Mobile menu button */
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
                  <Link href="/auth" className="block">
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

