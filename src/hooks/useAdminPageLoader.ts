import { useState, useEffect } from 'react'

interface UseAdminPageLoaderOptions {
  /** Minimum loading time in milliseconds to prevent flash */
  minLoadTime?: number
  /** Dependencies to watch for loading completion */
  dependencies?: any[]
  /** Custom loading condition */
  isLoading?: boolean
}

interface UseAdminPageLoaderReturn {
  /** Whether to show the loader */
  showLoader: boolean
  /** Function to manually set loading state */
  setLoading: (loading: boolean) => void
  /** Whether data is ready to be displayed */
  isReady: boolean
}

/**
 * Hook to manage loading states in admin pages to prevent content flashing
 * Ensures a minimum loading time and smooth transitions
 */
export const useAdminPageLoader = ({
  minLoadTime = 800, // 800ms minimum to prevent flash
  dependencies = [],
  isLoading = false
}: UseAdminPageLoaderOptions = {}): UseAdminPageLoaderReturn => {
  const [showLoader, setShowLoader] = useState(true)
  const [manualLoading, setManualLoading] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Check if all dependencies are ready (not null, undefined, empty arrays)
    const dependenciesReady = dependencies.every(dep => {
      if (Array.isArray(dep)) return dep.length >= 0 // Allow empty arrays
      if (typeof dep === 'boolean') return true // Booleans are always ready
      return dep !== null && dep !== undefined
    })

    // If still loading, show loader
    if (isLoading || manualLoading || !dependenciesReady) {
      setShowLoader(true)
      return
    }

    // Data is ready, set timer for minimum load time
    const elapsedTime = Date.now() - startTime
    const remainingTime = Math.max(0, minLoadTime - elapsedTime)

    const timeoutId = setTimeout(() => {
      setShowLoader(false)
    }, remainingTime)

    return () => clearTimeout(timeoutId)
  }, [dependencies, isLoading, manualLoading, minLoadTime, startTime])

  return {
    showLoader,
    setLoading: setManualLoading,
    isReady: !showLoader
  }
}

/**
 * Hook specifically for admin pages that load data
 * Automatically handles common loading patterns
 */
export const useAdminDataLoader = (
  loading: boolean,
  data: any,
  error?: any,
  minLoadTime: number = 800
) => {
  return useAdminPageLoader({
    minLoadTime,
    isLoading: loading,
    dependencies: [data]
  })
}

/**
 * Hook for admin edit pages that need to wait for specific product/entity data
 */
export const useAdminEditLoader = (
  loading: boolean,
  entity: any,
  formData: any,
  minLoadTime: number = 1000 // Slightly longer for edit pages
) => {
  return useAdminPageLoader({
    minLoadTime,
    isLoading: loading,
    dependencies: [entity, formData]
  })
}