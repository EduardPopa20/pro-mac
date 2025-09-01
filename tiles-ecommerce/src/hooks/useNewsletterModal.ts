/**
 * Newsletter Modal Hook
 * Handles first-visit detection and modal display timing
 * Shows newsletter modal 3-4 seconds after first website visit
 */
import { useState, useEffect, useRef } from 'react'

interface UseNewsletterModalReturn {
  showModal: boolean
  setShowModal: (show: boolean) => void
  shouldShowModal: boolean
}

const NEWSLETTER_STORAGE_KEY = 'promac_newsletter_status'
const VISIT_STORAGE_KEY = 'promac_first_visit'
const MODAL_DELAY = 3500 // 3.5 seconds delay

interface NewsletterStatus {
  hasSeenModal: boolean
  hasSubscribed: boolean
  lastShown: string | null
  dismissCount: number
}

const getDefaultStatus = (): NewsletterStatus => ({
  hasSeenModal: false,
  hasSubscribed: false,
  lastShown: null,
  dismissCount: 0
})

export const useNewsletterModal = (): UseNewsletterModalReturn => {
  const [showModal, setShowModal] = useState(false)
  const [shouldShowModal, setShouldShowModal] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialized = useRef(false)
  const isMountedRef = useRef(true)

  // Get newsletter status from localStorage
  const getNewsletterStatus = (): NewsletterStatus => {
    try {
      const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY)
      if (stored) {
        return { ...getDefaultStatus(), ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Error reading newsletter status from localStorage:', error)
    }
    return getDefaultStatus()
  }

  // Save newsletter status to localStorage
  const saveNewsletterStatus = (status: Partial<NewsletterStatus>) => {
    try {
      const current = getNewsletterStatus()
      const updated = { ...current, ...status }
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving newsletter status to localStorage:', error)
    }
  }

  // Check if this is the first visit to the website
  const isFirstVisit = (): boolean => {
    try {
      const hasVisited = localStorage.getItem(VISIT_STORAGE_KEY)
      if (!hasVisited) {
        localStorage.setItem(VISIT_STORAGE_KEY, new Date().toISOString())
        console.log('Newsletter: First visit detected')
        return true
      }
      console.log('Newsletter: Returning visitor detected')
      return false
    } catch (error) {
      console.error('Error checking first visit status:', error)
      return false
    }
  }

  // Check if we should show the modal based on various conditions
  const checkShouldShowModal = (): boolean => {
    console.log('Newsletter: Checking if should show modal...')
    const status = getNewsletterStatus()
    const isFirst = isFirstVisit()
    
    console.log('Newsletter Status:', status)
    console.log('Is First Visit:', isFirst)
    
    // Don't show if user has already subscribed
    if (status.hasSubscribed) {
      console.log('Newsletter: User already subscribed, not showing modal')
      return false
    }

    // Don't show if user has dismissed too many times
    if (status.dismissCount >= 3) {
      console.log('Newsletter: User dismissed too many times, not showing modal')
      return false
    }

    // For first-time visitors, always show
    if (isFirst) {
      console.log('Newsletter: First visit, showing modal')
      return true
    }

    // For returning visitors, check if enough time has passed
    if (status.lastShown) {
      const lastShown = new Date(status.lastShown)
      const now = new Date()
      const hoursDiff = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60)
      
      console.log('Newsletter: Hours since last shown:', hoursDiff)
      
      // Don't show again within 24 hours
      if (hoursDiff < 24) {
        console.log('Newsletter: Less than 24 hours since last shown, not showing modal')
        return false
      }
    }

    // For returning users who haven't seen modal or it's been 24+ hours
    const shouldShow = !status.hasSeenModal || (status.lastShown && Date.now() - new Date(status.lastShown).getTime() >= 24 * 60 * 60 * 1000)
    console.log('Newsletter: Returning user decision:', shouldShow)
    return shouldShow
  }

  // Handle modal close
  const handleCloseModal = (subscribed: boolean = false) => {
    setShowModal(false)
    
    if (subscribed) {
      saveNewsletterStatus({
        hasSubscribed: true,
        hasSeenModal: true,
        lastShown: new Date().toISOString()
      })
    } else {
      const status = getNewsletterStatus()
      saveNewsletterStatus({
        hasSeenModal: true,
        lastShown: new Date().toISOString(),
        dismissCount: status.dismissCount + 1
      })
    }
  }

  // Initialize modal logic on component mount
  useEffect(() => {
    // Prevent double initialization in React.StrictMode
    if (hasInitialized.current) {
      console.log('Newsletter: Already initialized, skipping...')
      return
    }

    console.log('Newsletter: Initializing modal logic...')
    const shouldShow = checkShouldShowModal()
    console.log('Newsletter: Should show modal:', shouldShow)
    setShouldShowModal(shouldShow)

    if (shouldShow) {
      console.log(`Newsletter: Setting timeout for ${MODAL_DELAY}ms`)
      
      // Use a longer delay to account for React.StrictMode and ensure component stability
      const actualDelay = process.env.NODE_ENV === 'development' ? MODAL_DELAY + 1000 : MODAL_DELAY
      
      timeoutRef.current = setTimeout(() => {
        console.log('Newsletter: Timeout fired, checking if component is still mounted...')
        // Double-check if component is still mounted and should show modal
        if (isMountedRef.current) {
          console.log('Newsletter: Component still mounted, showing modal')
          setShowModal(true)
          saveNewsletterStatus({
            lastShown: new Date().toISOString()
          })
        } else {
          console.log('Newsletter: Component unmounted, not showing modal')
        }
      }, actualDelay)
    } else {
      console.log('Newsletter: Not showing modal due to conditions')
    }

    // Mark as initialized after setup
    hasInitialized.current = true

    // Cleanup timeout on unmount
    return () => {
      console.log('Newsletter: Component unmounting, cleaning up...')
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      // Don't reset hasInitialized here to prevent re-initialization in StrictMode
    }
  }, []) // Empty dependency array is important

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true
    console.log('Newsletter: Component mounted/re-mounted')
    
    return () => {
      isMountedRef.current = false
      console.log('Newsletter: Component unmounted')
    }
  }, [])

  // Enhanced setShowModal that handles subscription status
  const enhancedSetShowModal = (show: boolean, subscribed?: boolean) => {
    if (!show && subscribed !== undefined) {
      handleCloseModal(subscribed)
    } else {
      setShowModal(show)
      if (!show) {
        handleCloseModal(false)
      }
    }
  }

  return {
    showModal,
    setShowModal: enhancedSetShowModal,
    shouldShowModal
  }
}

// Helper function to reset newsletter modal status (for testing/development)
export const resetNewsletterModalStatus = () => {
  try {
    localStorage.removeItem(NEWSLETTER_STORAGE_KEY)
    localStorage.removeItem(VISIT_STORAGE_KEY)
    console.log('Newsletter: Modal status reset - refresh page to see modal')
  } catch (error) {
    console.error('Error resetting newsletter modal status:', error)
  }
}

// Make the reset function globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).resetNewsletterModal = resetNewsletterModalStatus
}

// Helper function to mark user as subscribed (to be called after successful subscription)
export const markUserAsSubscribed = () => {
  try {
    const status = JSON.parse(localStorage.getItem(NEWSLETTER_STORAGE_KEY) || '{}')
    status.hasSubscribed = true
    status.hasSeenModal = true
    status.lastShown = new Date().toISOString()
    localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(status))
  } catch (error) {
    console.error('Error marking user as subscribed:', error)
  }
}