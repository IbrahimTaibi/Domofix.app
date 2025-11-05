"use client";

import Link from "next/link";
import { useMobile } from "@/shared/hooks";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLink = ({ href, children, className = "", onClick }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={`text-gray-700 font-medium hover:text-primary-600 transition-colors relative group ${className}`}
      onClick={onClick}>
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
};

interface NavLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
}

export default function NavLinks({ isMobile: forceMobile, onLinkClick }: NavLinksProps) {
  // Use the provided prop or fallback to the hook
  const isMobileDevice = useMobile();
  const isMobile = forceMobile !== undefined ? forceMobile : isMobileDevice;
  const { isAuthenticated, user } = useAuth();
  
  const linkClass = isMobile
    ? "block px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 hover:text-primary-600 rounded-md transition-colors"
    : "";

  // Common links for all users
  const commonLinks = (
    <>
      <NavLink href="#how-it-works" className={linkClass} onClick={onLinkClick}>
        Comment ça marche
      </NavLink>
      <NavLink href="/contact" className={linkClass} onClick={onLinkClick}>
        Contact
      </NavLink>
      <NavLink href="/about" className={linkClass} onClick={onLinkClick}>
        À propos
      </NavLink>
    </>
  );

  // Links for authenticated users
  const authenticatedLinks = (
    <>
      {user?.role === 'provider' && (
        <NavLink href="/my-services" className={linkClass} onClick={onLinkClick}>
          Mes services
        </NavLink>
      )}
    </>
  );

  // Links for non-authenticated users
  const nonAuthenticatedLinks = (
    <>
      {/* Old guest-specific links removed */}
    </>
  );

  return (
    <>
      {isAuthenticated ? authenticatedLinks : nonAuthenticatedLinks}
      {commonLinks}
      {isMobile && isAuthenticated && user && user.role !== 'provider' && (
        <NavLink
          href="/register/provider"
          className={`${linkClass} !text-transparent hover:!text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 font-semibold`}
          onClick={onLinkClick}
        >
          Devenir prestataire
        </NavLink>
      )}
    </>
  );
}