// Mobile-responsive utilities and hooks for improved mobile UX

/**
 * Hook to check if the device is mobile
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

/**
 * Utility to create mobile-friendly breakpoint classes
 */
export const mobileBreakpoints = {
  sm: '@media (max-width: 640px)',   // Small screens
  md: '@media (max-width: 768px)',   // Medium screens
  lg: '@media (max-width: 1024px)',  // Large screens
  xl: '@media (max-width: 1280px)',  // Extra large screens
}

/**
 * Mobile-optimized form input styling
 */
export const mobileFormStyles = {
  input: 'w-full px-4 py-3 sm:py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
  label: 'block text-sm font-medium mb-2',
  textarea: 'w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-vertical min-h-24',
  select: 'w-full px-4 py-3 sm:py-2 text-base sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
}

/**
 * Mobile-optimized button sizing
 */
export const mobileButtonSizes = {
  xs: 'px-3 py-2 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 sm:py-2 text-base sm:text-sm', // 44px min height on mobile
  lg: 'px-8 py-4 sm:py-3 text-lg sm:text-base',
}

/**
 * Utility for responsive spacing
 */
export const responsiveSpacing = {
  xs: 'p-2 sm:p-4',
  sm: 'p-3 sm:p-5',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}

/**
 * Mobile-friendly table wrapper component styling
 */
export const mobileTableContainer = 'overflow-x-auto [-webkit-overflow-scrolling:touch] rounded-lg border'

/**
 * Utility for touch-friendly spacing (minimum 44x44px)
 */
export const touchTarget = 'min-h-11 min-w-11' // 44x44 pixels

/**
 * Viewport height utilities for notch support
 */
export const safeViewportHeight = 'h-[100dvh]' // Dynamic viewport height
