/**
 * Simplified Newsletter Modal Hook
 * Handles first-visit detection and modal display timing
 * Simplified version to avoid React.StrictMode issues
 */
import { useState, useEffect } from 'react'

interface UseNewsletterModalReturn {
  showModal: boolean
  setShowModal: (show: boolean, subscribed?: boolean) => void
  shouldShowModal: boolean
}

const NEWSLETTER_STORAGE_KEY = 'promac_newsletter_status'
const VISIT_STORAGE_KEY = 'promac_first_visit'
const MODAL_DELAY = 4000 // 4 seconds delay

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

// Global state to prevent multiple timers
let globalTimer: NodeJS.Timeout | null = null
let hasGloballyInitialized = false

export const useNewsletterModalSimple = (): UseNewsletterModalReturn => {
  const [showModal, setShowModalState] = useState(false)
  const [shouldShowModal, setShouldShowModal] = useState(false)

  // Get newsletter status from localStorage
  const getNewsletterStatus = (): NewsletterStatus => {
    try {
      const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY)
      if (stored) {
        return { ...getDefaultStatus(), ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error('Newsletter: Error reading status from localStorage:', error)
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
      console.error('Newsletter: Error saving status to localStorage:', error)
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
      console.error('Newsletter: Error checking first visit status:', error)
      return false
    }
  }

  // Check if we should show the modal
  const checkShouldShowModal = (): boolean => {
    console.log('Newsletter: Checking if should show modal...')
    
    // TEMPORARILY DISABLE AUTO-SHOW TO FIX CLICKABILITY ISSUES
    // TODO: Re-enable after testing
    console.log('Newsletter: Auto-show temporarily disabled to fix page interaction issues')
    return false
    
    /* ORIGINAL CODE - COMMENTED OUT TEMPORARILY
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
    */
  }

  // Initialize modal logic
  useEffect(() => {
    // Prevent double initialization globally
    if (hasGloballyInitialized) {
      console.log('Newsletter: Already globally initialized, skipping...')
      return
    }

    console.log('Newsletter: Starting initialization...')
    
    const shouldShow = checkShouldShowModal()
    console.log('Newsletter: Should show modal:', shouldShow)
    setShouldShowModal(shouldShow)

    if (shouldShow) {
      console.log(`Newsletter: Setting global timer for ${MODAL_DELAY}ms`)
      
      // Clear any existing timer
      if (globalTimer) {
        clearTimeout(globalTimer)
      }
      
      // Set global timer
      globalTimer = setTimeout(() => {
        console.log('Newsletter: Global timer fired, showing modal')
        setShowModalState(true)
        saveNewsletterStatus({
          lastShown: new Date().toISOString()
        })
        globalTimer = null
      }, MODAL_DELAY)
      
      hasGloballyInitialized = true
    } else {
      console.log('Newsletter: Not showing modal due to conditions')
    }

    // Cleanup function
    return () => {
      console.log('Newsletter: useEffect cleanup called')
    }
  }, []) // Run only once

  // Handle modal close
  const handleCloseModal = (subscribed: boolean = false) => {
    setShowModalState(false)
    
    if (subscribed) {
      console.log('Newsletter: User subscribed, marking as subscribed')
      saveNewsletterStatus({
        hasSubscribed: true,
        hasSeenModal: true,
        lastShown: new Date().toISOString()
      })
    } else {
      console.log('Newsletter: User dismissed modal, incrementing dismiss count')
      const status = getNewsletterStatus()
      saveNewsletterStatus({
        hasSeenModal: true,
        lastShown: new Date().toISOString(),
        dismissCount: status.dismissCount + 1
      })
    }
  }

  // Enhanced setShowModal function
  const setShowModal = (show: boolean, subscribed?: boolean) => {
    if (!show && subscribed !== undefined) {
      handleCloseModal(subscribed)
    } else {
      setShowModalState(show)
      if (!show) {
        handleCloseModal(false)
      }
    }
  }

  return {
    showModal,
    setShowModal,
    shouldShowModal
  }
}

// Helper function to reset newsletter modal status (for testing/development)
export const resetNewsletterModalStatusSimple = () => {
  try {
    localStorage.removeItem(NEWSLETTER_STORAGE_KEY)
    localStorage.removeItem(VISIT_STORAGE_KEY)
    hasGloballyInitialized = false
    if (globalTimer) {
      clearTimeout(globalTimer)
      globalTimer = null
    }
    console.log('Newsletter: Modal status reset globally - refresh page to see modal')
  } catch (error) {
    console.error('Error resetting newsletter modal status:', error)
  }
}

// Make the reset function globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).resetNewsletterModalSimple = resetNewsletterModalStatusSimple
}