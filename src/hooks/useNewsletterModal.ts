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

// Global timeout to prevent React Strict Mode issues
let globalNewsletterTimeout: NodeJS.Timeout | null = null
let globalNewsletterCallback: (() => void) | null = null

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
  const lastTimeoutStartTime = useRef<number | null>(null)

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
       
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking first visit status:', error)
      return false
    }
  }

  // Check if we should show the modal based on various conditions
  const checkShouldShowModal = (): boolean => {
    const status = getNewsletterStatus()
    const isFirst = isFirstVisit()
    
    // Don't show if user has already subscribed
    if (status.hasSubscribed) {
      return false
    }

    // Don't show if user has dismissed too many times
    if (status.dismissCount >= 3) {
      return false
    }

    // For first-time visitors, always show
    if (isFirst) {
      return true
    }

    // For returning visitors, check if enough time has passed
    if (status.lastShown) {
      const lastShown = new Date(status.lastShown)
      const now = new Date()
      const hoursDiff = (now.getTime() - lastShown.getTime()) / (1000 * 60 * 60)
      
      // Don't show again within 24 hours
      if (hoursDiff < 24) {
        return false
      }
    }

    // For returning users who haven't seen modal or it's been 24+ hours
    return !status.hasSeenModal || (status.lastShown && Date.now() - new Date(status.lastShown).getTime() >= 24 * 60 * 60 * 1000)
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
    const shouldShow = checkShouldShowModal()
    setShouldShowModal(shouldShow)

    if (shouldShow) {
      // If global timeout is already running, just register our callback
      if (globalNewsletterTimeout) {
        globalNewsletterCallback = () => {
          setShowModal(true)
          saveNewsletterStatus({
            lastShown: new Date().toISOString()
          })
        }
        return
      }

      const actualDelay = process.env.NODE_ENV === 'development' ? MODAL_DELAY + 1000 : MODAL_DELAY
      
      // Set global timeout
      globalNewsletterTimeout = setTimeout(() => {
        if (globalNewsletterCallback) {
          globalNewsletterCallback()
        } else {
          setShowModal(true)
          saveNewsletterStatus({
            lastShown: new Date().toISOString()
          })
        }
        
        // Clear global references
        globalNewsletterTimeout = null
        globalNewsletterCallback = null
      }, actualDelay)
      
      // Set local callback as fallback
      globalNewsletterCallback = () => {
        setShowModal(true)
        saveNewsletterStatus({
          lastShown: new Date().toISOString()
        })
      }
    }

    // Cleanup on unmount
    return () => {
    }
  }, []) // Empty dependency array is important

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
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
    
    // Clear global timeout
    if (globalNewsletterTimeout) {
      clearTimeout(globalNewsletterTimeout)
      globalNewsletterTimeout = null
      globalNewsletterCallback = null
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Newsletter: Modal status reset - refresh page to see modal')
    }
  } catch (error) {
    console.error('Error resetting newsletter modal status:', error)
  }
}

// Make the reset function globally available for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
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