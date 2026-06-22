import { useState, useEffect } from 'react';

/**
 * useResponsive Hook
 * 
 * Detect current breakpoint and screen size
 * Useful for conditional rendering based on screen size
 * 
 * Usage:
 * const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ResponsiveState {
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1023px
  isDesktop: boolean;     // >= 1024px
  isLargeDesktop: boolean; // >= 1536px
  breakpoint: Breakpoint;
  width: number;
}

const BREAKPOINTS = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    breakpoint: 'xs',
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      let breakpoint: Breakpoint = 'xs';
      if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
      else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
      else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
      else if (width >= BREAKPOINTS.md) breakpoint = 'md';
      else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';

      setState({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS['2xl'],
        isLargeDesktop: width >= BREAKPOINTS['2xl'],
        breakpoint,
        width,
      });
    };

    // Set initial state
    handleResize();

    // Add listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return state;
};

/**
 * useMediaQuery Hook
 * 
 * Check custom media queries
 * 
 * Usage:
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 */

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};

/**
 * useMobileMenu Hook
 * 
 * Manage mobile menu state with auto-closing on resize
 * 
 * Usage:
 * const { isOpen, toggle, close } = useMobileMenu();
 */

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDesktop } = useResponsive();

  // Auto-close menu when resizing to desktop
  useEffect(() => {
    if (isDesktop && isOpen) {
      setIsOpen(false);
    }
  }, [isDesktop, isOpen]);

  // Close menu on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return {
    isOpen,
    toggle: () => setIsOpen(!isOpen),
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
  };
};

/**
 * useReducedMotion Hook
 * 
 * Respect user's motion preferences
 * 
 * Usage:
 * const prefersReducedMotion = useReducedMotion();
 * if (!prefersReducedMotion) {
 *   // Apply animations
 * }
 */

export const useReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * useDarkMode Hook
 * 
 * Check if user prefers dark mode
 * 
 * Usage:
 * const isDarkMode = useDarkMode();
 */

export const useDarkMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

/**
 * useOrientation Hook
 * 
 * Detect device orientation
 * 
 * Usage:
 * const { isLandscape, isPortrait } = useOrientation();
 */

interface OrientationState {
  isLandscape: boolean;
  isPortrait: boolean;
}

export const useOrientation = (): OrientationState => {
  const [orientation, setOrientation] = useState<OrientationState>({
    isLandscape: typeof window !== 'undefined' && window.innerHeight < window.innerWidth,
    isPortrait: typeof window !== 'undefined' && window.innerHeight >= window.innerWidth,
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isLandscape: window.innerHeight < window.innerWidth,
        isPortrait: window.innerHeight >= window.innerWidth,
      });
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
};

/**
 * useIntersectionObserver Hook
 * 
 * Observe element visibility (for lazy loading, scroll animations)
 * 
 * Usage:
 * const ref = useRef(null);
 * const isVisible = useIntersectionObserver(ref);
 * return <div ref={ref}>{isVisible && <Content />}</div>
 */

export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, {
      threshold: 0.1,
      ...options,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isVisible;
};

/**
 * useScrollDirection Hook
 * 
 * Detect scroll direction (useful for hiding/showing navbar)
 * 
 * Usage:
 * const scrollDirection = useScrollDirection();
 * return <nav className={scrollDirection === 'down' ? 'hidden' : 'visible'} />
 */

type ScrollDirection = 'up' | 'down';

export const useScrollDirection = (): ScrollDirection => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('up');
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > prevScrollY) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setPrevScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollY]);

  return scrollDirection;
};

/**
 * useSafeAreaInsets Hook
 * 
 * Get safe area insets for notched phones
 * 
 * Usage:
 * const insets = useSafeAreaInsets();
 * return <div style={{ paddingTop: insets.top }} />
 */

interface SafeAreaInsets {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export const useSafeAreaInsets = (): SafeAreaInsets => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: '0',
    bottom: '0',
    left: '0',
    right: '0',
  });

  useEffect(() => {
    const getInset = (position: string): string => {
      if (typeof window !== 'undefined') {
        const value = getComputedStyle(document.documentElement).getPropertyValue(
          `env(safe-area-inset-${position})`
        );
        return value || '0';
      }
      return '0';
    };

    setInsets({
      top: getInset('top'),
      bottom: getInset('bottom'),
      left: getInset('left'),
      right: getInset('right'),
    });
  }, []);

  return insets;
};

/**
 * useViewportSize Hook
 * 
 * Get current viewport size
 * 
 * Usage:
 * const { width, height } = useViewportSize();
 */

interface ViewportSize {
  width: number;
  height: number;
}

export const useViewportSize = (): ViewportSize => {
  const [size, setSize] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
};
