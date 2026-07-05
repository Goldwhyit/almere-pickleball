import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * ResponsiveNavigation Component
 * 
 * Mobile First Architecture:
 * - Mobile (<1024px): Hamburger menu, slides from left
 * - Desktop (1024px+): Full horizontal navigation
 * 
 * Features:
 * ✅ Hamburger menu only on mobile
 * ✅ Menu closes on link click
 * ✅ Menu closes on ESC key
 * ✅ Prevents body scroll when menu open
 * ✅ Overlay behind mobile menu
 * ✅ Smooth animations
 * ✅ ARIA labels for accessibility
 * ✅ Touch targets minimum 44px
 */

interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

const ResponsiveNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  // Navigation links - customize based on user role
  const publicLinks: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Proeflessen', href: '/onboarding' },
    { label: 'Word Lid', href: '/onboarding' },
    { label: 'Toernooien', href: '/tournaments' },
    { label: 'Contact', href: '/contact' },
  ];

  const authenticatedLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Toernooien', href: '/tournaments' },
    { label: 'Mijn Profiel', href: '/profile' },
  ];

  const adminLinks: NavLink[] = [
    { label: 'Admin Dashboard', href: '/admin' },
    { label: 'Leden', href: '/admin/members' },
    { label: 'Toernooien', href: '/admin/tournaments' },
    { label: 'Speeldagen', href: '/admin/play-days' },
  ];

  const navLinks = isAuthenticated ? authenticatedLinks : publicLinks;
  const showAdminLinks = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'ORGANIZER');

  // Close menu on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  // Close menu when clicking on overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full bg-white shadow-sm safe-area-top"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between py-4 md:py-5 lg:py-6">
          {/* Logo - Always visible */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg sm:text-xl text-primary-600 
                      hover:text-primary-700 transition-colors"
            aria-label="Almere Pickleball Home"
          >
            <span className="text-2xl">🏓</span>
            <span className="hidden xs:inline">Almere Pickleball</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile, shown from lg (1024px) */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-gray-700 hover:text-primary-600 font-medium py-2 px-3 
                          rounded-lg transition-colors duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {link.label}
              </Link>
            ))}

            {showAdminLinks && (
              <div className="border-l border-gray-300 pl-8">
                <span className="text-sm font-semibold text-gray-600 block mb-3">Admin</span>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="block text-gray-700 hover:text-primary-600 font-medium py-1 px-3 
                            rounded-lg transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Auth buttons - Desktop only */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-gray-700">
                  Hallo, {user ? (user as any).firstName || (user as any).name || 'gebruiker' : 'gebruiker'}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-4 py-2 md:px-6 md:py-3"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium px-3 py-2
                          rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 md:px-6 md:py-3 text-sm"
                >
                  Registreren
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Menu Button - Mobile only (hidden from lg: 1024px) */}
          <button
            ref={triggerRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5
                      rounded-lg hover:bg-gray-100 transition-colors duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={isMenuOpen ? 'Menu sluiten' : 'Menu openen'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 origin-center ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 origin-center ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay - Only visible on mobile */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 top-[var(--nav-height)] bg-black/50 z-40
                    animate-fade-in"
          onClick={handleOverlayClick}
          role="presentation"
        >
          {/* Mobile Menu - Slides in from left */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className="fixed left-0 top-0 mt-[4.5rem] h-[calc(100vh-4.5rem)] 
                      w-full max-w-xs bg-white shadow-lg z-50
                      animate-slide-in overflow-y-auto"
            role="menu"
          >
            {/* Mobile Navigation Links */}
            <div className="p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase px-3 py-2 mb-4">
                Navigatie
              </p>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleLinkClick}
                  className="block text-gray-900 hover:bg-gray-100 font-medium px-4 py-3 
                          rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
                  role="menuitem"
                >
                  {link.label}
                </Link>
              ))}

              {/* Admin Links on Mobile */}
              {showAdminLinks && (
                <>
                  <div className="border-t border-gray-200 my-4" />
                  <p className="text-xs font-bold text-gray-500 uppercase px-3 py-2 mb-2">
                    Admin
                  </p>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={handleLinkClick}
                      className="block text-gray-900 hover:bg-gray-100 font-medium px-4 py-3 
                              rounded-lg transition-colors duration-200 min-h-[44px] flex items-center"
                      role="menuitem"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 p-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                    Hallo, {user ? (user as any).firstName || (user as any).name || 'gebruiker' : 'gebruiker'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full btn-secondary px-4 py-3"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="block w-full text-center bg-white text-primary-600 
                            font-semibold border-2 border-primary-600 px-4 py-3
                            rounded-lg hover:bg-primary-50 transition-colors duration-200
                            min-h-[44px] flex items-center justify-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleLinkClick}
                    className="block w-full btn-primary px-4 py-3 text-center"
                  >
                    Registreren
                  </Link>
                </>
              )}
            </div>

            {/* Close hint on mobile */}
            <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-200 mt-8">
              Druk ESC om te sluiten
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveNavigation;
