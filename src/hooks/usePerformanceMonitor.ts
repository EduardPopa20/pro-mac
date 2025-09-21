import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentMountTime: number
  memoryUsage?: number
  renderCount: number
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean
  logToConsole?: boolean
  componentName?: string
}

/**
 * Hook for monitoring component performance metrics
 */
export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = false,
    componentName = 'Unknown Component'
  } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMountTime: 0,
    renderCount: 0
  })

  const mountTimeRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)
  const renderCountRef = useRef<number>(0)

  // Start render timing
  useEffect(() => {
    if (!enabled) return

    renderStartRef.current = performance.now()
    renderCountRef.current += 1
  })

  // Calculate render time after render
  useEffect(() => {
    if (!enabled) return

    const renderTime = performance.now() - renderStartRef.current
    const componentMountTime = mountTimeRef.current || performance.now()

    // Get memory usage if available
    const memoryUsage = 'memory' in performance
      ? (performance as any).memory?.usedJSHeapSize
      : undefined

    const newMetrics: PerformanceMetrics = {
      renderTime,
      componentMountTime,
      memoryUsage,
      renderCount: renderCountRef.current
    }

    setMetrics(newMetrics)

    if (logToConsole) {
      console.group(`🔍 Performance Metrics - ${componentName}`)
      console.log(`Render Time: ${renderTime.toFixed(2)}ms`)
      console.log(`Mount Time: ${componentMountTime.toFixed(2)}ms`)
      console.log(`Render Count: ${renderCountRef.current}`)
      if (memoryUsage) {
        console.log(`Memory Usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      }
      console.groupEnd()
    }
  })

  // Track mount time
  useEffect(() => {
    if (!enabled) return

    mountTimeRef.current = performance.now()
  }, [enabled])

  return metrics
}

/**
 * Hook for monitoring page load performance
 */
export const usePageLoadPerformance = () => {
  const [pageMetrics, setPageMetrics] = useState<{
    fcp?: number // First Contentful Paint
    lcp?: number // Largest Contentful Paint
    fid?: number // First Input Delay
    cls?: number // Cumulative Layout Shift
    ttfb?: number // Time to First Byte
  }>({})

  useEffect(() => {
    // Wait for page load
    if (document.readyState === 'complete') {
      measureMetrics()
    } else {
      window.addEventListener('load', measureMetrics)
      return () => window.removeEventListener('load', measureMetrics)
    }

    function measureMetrics() {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const ttfb = navigation?.responseStart - navigation?.requestStart

      setPageMetrics(prev => ({ ...prev, ttfb }))

      // Observe Web Vitals if available
      if ('web-vitals' in window) {
        // This would require the web-vitals library
        // For now, we'll use Performance Observer
      }

      // Use Performance Observer for modern metrics
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcp = entries[0]?.startTime
          if (fcp) {
            setPageMetrics(prev => ({ ...prev, fcp }))
          }
        })

        try {
          fcpObserver.observe({ entryTypes: ['paint'] })
        } catch (e) {
          // Fallback for older browsers
        }

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          const lcp = lastEntry?.startTime
          if (lcp) {
            setPageMetrics(prev => ({ ...prev, lcp }))
          }
        })

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        } catch (e) {
          // Fallback for older browsers
        }

        // Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let cls = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cls += (entry as any).value
            }
          }
          setPageMetrics(prev => ({ ...prev, cls }))
        })

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        } catch (e) {
          // Fallback for older browsers
        }

        // Cleanup observers after 10 seconds
        setTimeout(() => {
          fcpObserver.disconnect()
          lcpObserver.disconnect()
          clsObserver.disconnect()
        }, 10000)
      }
    }
  }, [])

  return pageMetrics
}

/**
 * Hook for monitoring API call performance
 */
export const useApiPerformanceMonitor = () => {
  const [apiMetrics, setApiMetrics] = useState<{
    totalCalls: number
    averageResponseTime: number
    slowestCall: number
    fastestCall: number
    failedCalls: number
  }>({
    totalCalls: 0,
    averageResponseTime: 0,
    slowestCall: 0,
    fastestCall: Infinity,
    failedCalls: 0
  })

  const recordApiCall = (responseTime: number, success: boolean = true) => {
    setApiMetrics(prev => {
      const newTotalCalls = prev.totalCalls + 1
      const newAverageResponseTime =
        (prev.averageResponseTime * prev.totalCalls + responseTime) / newTotalCalls

      return {
        totalCalls: newTotalCalls,
        averageResponseTime: newAverageResponseTime,
        slowestCall: Math.max(prev.slowestCall, responseTime),
        fastestCall: Math.min(prev.fastestCall, responseTime),
        failedCalls: success ? prev.failedCalls : prev.failedCalls + 1
      }
    })
  }

  return { apiMetrics, recordApiCall }
}