import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * ResponsiveNavigation Component
 *
 * Implements mobile-first navigation with:
 * - Hamburger menu on mobile (<1024px)
 * - Full horizontal nav on desktop
 * - Accessible ARIA attributes
 * - ESC key to close menu
 * - Click outside to close menu
 * - Prevents body scroll when mobile menu open
 */
export const ResponsiveNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Close menu when ESC pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 font-bold text-2xl text-blue-600">
            🏓 Almere
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/tournaments" className="text-gray-700 hover:text-blue-600 transition">
              Tournaments
            </Link>
            <Link to="/memberships" className="text-gray-700 hover:text-blue-600 transition">
              Membership
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
            )}
          </div>

          {/* User Profile / Auth (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 text-sm">
                  {(user as any).firstName || (user as any).name || user.email}
                </span>
                <Link
                  to="/logout"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 left-0 right-0 bg-white lg:hidden transition-all duration-300 z-40 overflow-y-auto max-h-screen ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Home
          </Link>
          <Link
            to="/tournaments"
            onClick={handleLinkClick}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Tournaments
          </Link>
          <Link
            to="/memberships"
            onClick={handleLinkClick}
            className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Membership
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={handleLinkClick}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Dashboard
            </Link>
          )}

          <hr className="my-4" />

          {user ? (
            <div className="px-4 py-3 space-y-3">
              <p className="text-sm text-gray-600">
                {(user as any).firstName || (user as any).name || user.email}
              </p>
              <Link
                to="/logout"
                onClick={handleLinkClick}
                className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center text-sm"
              >
                Logout
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center text-sm"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
