import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Custom hook that wraps React Router's navigate with automatic scroll to top
 * This ensures consistent behavior across all navigation actions
 */
export const useNavigateWithScroll = () => {
  const navigate = useNavigate()

  const navigateWithScroll = useCallback((to: string | number, options?: { replace?: boolean; state?: any }) => {
    // Handle back/forward navigation with numbers
    if (typeof to === 'number') {
      navigate(to)
      // Small delay to let navigation complete before scrolling
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        })
        
        // Fallback scroll methods
        if (document.documentElement) {
          document.documentElement.scrollTop = 0
        }
        if (document.body) {
          document.body.scrollTop = 0
        }
      }, 50)
      return
    }

    // Handle regular navigation
    navigate(to, options)
    
    // Scroll to top immediately for programmatic navigation
    // The ScrollToTop component will also handle this, but this provides immediate feedback
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    })
    
    // Fallback scroll methods
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [navigate])

  return navigateWithScroll
}

export default useNavigateWithScroll