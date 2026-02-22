/**
 * Responsive utilities for detecting device type and screen size
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Check if screen size matches a breakpoint
 */
export const useBreakpoint = (breakpoint) => {
  const [isMatch, setIsMatch] = React.useState(false);

  React.useEffect(() => {
    const breakpointValue = BREAKPOINTS[breakpoint];

    const mediaQuery = window.matchMedia(`(min-width: ${breakpointValue}px)`);
    setIsMatch(mediaQuery.matches);

    const handler = (e) => setIsMatch(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMatch;
};

/**
 * Detect if device is mobile
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    (typeof window.ontouchstart !== 'undefined') ||
    (typeof navigator.maxTouchPoints !== 'undefined' && navigator.maxTouchPoints > 0) ||
    (typeof navigator.msMaxTouchPoints !== 'undefined' && navigator.msMaxTouchPoints > 0)
  );
};

/**
 * Get viewport dimensions
 */
export const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight),
  };
};

/**
 * Check if viewport is landscape
 */
export const isLandscape = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > window.innerHeight;
};

/**
 * Mobile-friendly utility classes
 */
export const responsiveClasses = {
  // Touch targets (minimum 44x44px on mobile)
  touchTarget: 'min-h-11 min-w-11',

  // Padding utilities
  mobilePadding: 'p-2 sm:p-3 lg:p-4',
  mobileVerticalPadding: 'py-2 sm:py-3 lg:py-4',
  mobileHorizontalPadding: 'px-2 sm:px-3 lg:px-4',

  // Spacing utilities
  mobileGap: 'gap-2 sm:gap-3 lg:gap-4',
  mobileSpaceY: 'space-y-2 sm:space-y-3 lg:space-y-4',

  // Text utilities
  mobileText: 'text-xs sm:text-sm lg:text-base',
  mobileHeading: 'text-sm sm:text-lg lg:text-2xl',

  // Container utilities
  responsiveContainer: 'w-full p-2 sm:p-3 lg:p-4',
  responsiveWidth: 'w-full lg:w-96 xl:w-[420px]',
};

/**
 * Prevent default mobile behaviors
 */
export const preventMobileZoom = () => {
  if (typeof window === 'undefined') return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
};

/**
 * Handle orientation changes
 */
export const useOrientation = (callback) => {
  React.useEffect(() => {
    const handleOrientationChange = () => {
      const isLand = window.innerWidth > window.innerHeight;
      callback(isLand ? 'landscape' : 'portrait');
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [callback]);
};

export default {
  BREAKPOINTS,
  useBreakpoint,
  isMobileDevice,
  isTouchDevice,
  getViewportSize,
  isLandscape,
  responsiveClasses,
  preventMobileZoom,
  useOrientation,
};

