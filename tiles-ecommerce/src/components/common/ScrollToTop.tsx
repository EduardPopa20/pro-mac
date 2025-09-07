import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' for instant scroll, 'smooth' for animated
    })
    
    // Also ensure document element is scrolled to top (fallback)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    
    // Additional fallback for body element
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [pathname])

  return null
}

export default ScrollToTop