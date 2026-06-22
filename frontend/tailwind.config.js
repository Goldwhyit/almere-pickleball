/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 📱 RESPONSIVE BREAKPOINTS - Mobile First Architecture
      // screens from 320px to 1536px+ with custom names
      screens: {
        'xs': '320px',    // iPhone SE, small phones
        'sm': '576px',    // Mobile landscape, larger phones
        'md': '768px',    // Tablet portrait
        'lg': '1024px',   // Tablet landscape, small laptop
        'xl': '1280px',   // Desktop
        '2xl': '1536px',  // Large desktop
      },

      // Container sizes - use with responsive containers
      maxWidth: {
        'xs': '320px',
        'sm': '28rem',    // 448px
        'md': '32rem',    // 512px
        'lg': '36rem',    // 576px
        'xl': '40rem',    // 640px
        '2xl': '42rem',   // 672px
        '3xl': '48rem',   // 768px
        '4xl': '56rem',   // 896px
        '5xl': '64rem',   // 1024px
        '6xl': '72rem',   // 1152px
        '7xl': '80rem',   // 1280px
        'container-mobile': '320px',
        'container-tablet': '720px',
        'container-desktop': '960px',
        'container-lg': '1140px',
        'container-xl': '1320px',
      },

      // Padding scale for containers (mobile first)
      padding: {
        'container-xs': '1rem',    // 16px - mobile
        'container-sm': '1.5rem',  // 24px - mobile landscape
        'container-md': '1.5rem',  // 24px - tablet
        'container-lg': '2rem',    // 32px - desktop
        'container-xl': '2.5rem',  // 40px - large desktop
      },

      gap: {
        'compact': '0.5rem',   // 8px - tight spacing
        'relaxed': '1rem',     // 16px - standard spacing
        'spacious': '1.5rem',  // 24px - desktop spacing
      },

      // Spacing utilities for different breakpoints
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },

      colors: {
        // Almere Pickleball brand colors - FROM LOGO
        primary: {
          50: '#e8f3fc',
          100: '#d0e7f9',
          200: '#a1cef3',
          300: '#72b6ed',
          400: '#439de7',
          500: '#1485d8', // Main blue from logo
          600: '#106ab0',
          700: '#0c5088',
          800: '#083560',
          900: '#041b38',
        },
        accent: {
          50: '#fee2e2',
          100: '#fecaca',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#e31c24', // Main red from logo
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
        },
        // Pickleball yellow (from ball in logo)
        ball: {
          400: '#facc15',
          500: '#eab308',
        }
      },

      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },

      // Responsive font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px - minimum for mobile
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1' }],             // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],          // 60px
      },

      // Min height for touch targets (44px = 110% of 16px body)
      minHeight: {
        'touch': '44px',
        '10': '10px',
        '12': '12px',
      },
      minWidth: {
        'touch': '44px',
      },

      // Responsive heights for hero sections
      height: {
        'screen-safe': 'clamp(100vh, 100dvh, 100vh)',
        'screen-dynamic': '100dvh', // iOS 15+
      },

      // Aspect ratios
      aspectRatio: {
        'video': '16 / 9',
        'square': '1 / 1',
        'portrait': '3 / 4',
      },
    },
  },

  plugins: [
    // Touch target enforcement
    function({ addComponents }) {
      addComponents({
        '.btn-touch': {
          '@apply min-h-11 min-w-11': {},
        },
        '.icon-touch': {
          '@apply w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center': {},
        },
        // Responsive container base
        '.container-responsive': {
          '@apply mx-auto w-full px-4 sm:px-4 md:px-6 lg:px-8': {},
        },
        // Mobile-first grid
        '.grid-responsive': {
          '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8': {},
        },
        // Admin dashboard grid (1-2-3-4 columns)
        '.grid-dashboard': {
          '@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8': {},
        },

        // Smooth scrolling
        'html': {
          '@apply scroll-smooth': {},
        },
      });
    },
  ],
}
