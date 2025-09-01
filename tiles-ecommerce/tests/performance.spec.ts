import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Performance Testing (Core Web Vitals)', () => {

  test('page load performance', async ({ page }) => {
    // Track navigation timing
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds (reasonable for e-commerce)
    expect(loadTime).toBeLessThan(3000)
    
    // Verify content is actually loaded
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()
    
    console.log(`Homepage loaded in ${loadTime}ms`)
  })

  test('Core Web Vitals - LCP (Largest Contentful Paint)', async ({ page }) => {
    // Navigate to page and measure LCP
    await page.goto('/')
    
    // Measure LCP using Navigation API
    const lcpMetric = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })
        
        // Fallback timeout
        setTimeout(() => resolve(-1), 5000)
      })
    })
    
    if (lcpMetric > 0) {
      // LCP should be under 2.5 seconds for good user experience
      expect(lcpMetric).toBeLessThan(2500)
      console.log(`LCP: ${lcpMetric.toFixed(2)}ms`)
    }
  })

  test('Core Web Vitals - FID simulation (interaction responsiveness)', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Measure interaction delay
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    const startTime = Date.now()
    await searchInput.click()
    await searchInput.fill('t')
    const interactionTime = Date.now() - startTime
    
    // Interaction should respond within 100ms (FID threshold)
    expect(interactionTime).toBeLessThan(100)
    
    console.log(`Input interaction time: ${interactionTime}ms`)
  })

  test('Core Web Vitals - CLS (Cumulative Layout Shift)', async ({ page }) => {
    await page.goto('/')
    
    // Wait for initial layout
    await page.waitForTimeout(1000)
    
    // Measure layout shift
    const clsScore = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
        })
        
        observer.observe({ type: 'layout-shift', buffered: true })
        
        // Wait and resolve
        setTimeout(() => {
          observer.disconnect()
          resolve(clsValue)
        }, 3000)
      })
    })
    
    // CLS should be less than 0.1 for good user experience
    expect(clsScore).toBeLessThan(0.1)
    
    console.log(`CLS Score: ${clsScore.toFixed(3)}`)
  })

  test('JavaScript bundle size impact', async ({ page }) => {
    // Measure initial bundle load
    const responses: any[] = []
    
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        responses.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0')
        })
      }
    })
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Calculate total JS bundle size
    const totalBundleSize = responses.reduce((sum, response) => sum + response.size, 0)
    const bundleSizeKB = totalBundleSize / 1024
    
    // Bundle should be reasonable for e-commerce site (under 1MB)
    expect(bundleSizeKB).toBeLessThan(1024)
    
    console.log(`Total JS bundle size: ${bundleSizeKB.toFixed(2)} KB`)
    console.log(`JS files loaded: ${responses.length}`)
  })

  test('image loading performance', async ({ page }) => {
    const imageLoadTimes: number[] = []
    
    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        // Track image response times
        imageLoadTimes.push(Date.now())
      }
    })
    
    const startTime = Date.now()
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    const images = page.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      // Check that images have loaded
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const image = images.nth(i)
        if (await image.isVisible()) {
          const naturalWidth = await image.evaluate(img => (img as HTMLImageElement).naturalWidth)
          expect(naturalWidth).toBeGreaterThan(0)
        }
      }
      
      const totalLoadTime = Date.now() - startTime
      console.log(`${imageCount} images loaded in ${totalLoadTime}ms`)
      
      // Images should load within reasonable time
      expect(totalLoadTime).toBeLessThan(5000)
    }
  })

  test('search performance and debouncing', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Test search debounce performance
    const searchTerm = 'gresie'
    const startTime = Date.now()
    
    // Type quickly to test debouncing
    for (const char of searchTerm) {
      await searchInput.type(char, { delay: 50 })
    }
    
    // Wait for debounce delay
    await page.waitForTimeout(400)
    
    // Check if search results appear
    const dropdown = page.locator('[role="presentation"]')
    const dropdownAppeared = await dropdown.isVisible()
    
    if (dropdownAppeared) {
      const searchResponseTime = Date.now() - startTime
      
      // Search should respond quickly after debounce
      expect(searchResponseTime).toBeLessThan(2000)
      
      console.log(`Search results appeared in ${searchResponseTime}ms`)
    }
  })

  test('font loading performance', async ({ page }) => {
    await page.goto('/')
    
    // Measure font loading using FontFace API
    const fontMetrics = await page.evaluate(() => {
      return new Promise<{loaded: number, failed: number}>((resolve) => {
        let loaded = 0
        let failed = 0
        let total = 0
        
        // Count all font faces
        document.fonts.forEach(() => total++)
        
        if (total === 0) {
          resolve({ loaded: 0, failed: 0 })
          return
        }
        
        document.fonts.addEventListener('loadingdone', (event) => {
          event.fontfaces.forEach(fontface => {
            if (fontface.status === 'loaded') {
              loaded++
            } else {
              failed++
            }
          })
          
          if (loaded + failed >= total || loaded + failed >= 10) {
            resolve({ loaded, failed })
          }
        })
        
        // Fallback timeout
        setTimeout(() => resolve({ loaded, failed }), 3000)
      })
    })
    
    // Most fonts should load successfully
    if (fontMetrics.loaded + fontMetrics.failed > 0) {
      const successRate = fontMetrics.loaded / (fontMetrics.loaded + fontMetrics.failed)
      expect(successRate).toBeGreaterThan(0.8) // 80% success rate
      
      console.log(`Fonts loaded: ${fontMetrics.loaded}, failed: ${fontMetrics.failed}`)
    }
  })

  test('memory usage monitoring', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null
    })
    
    if (initialMemory) {
      // Perform some interactions to increase memory usage
      const searchInput = page.getByPlaceholder('Caută produse...')
      await searchInput.fill('test')
      await page.waitForTimeout(500)
      await searchInput.clear()
      
      // Get memory usage after interactions
      const finalMemory = await page.evaluate(() => {
        return {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        }
      })
      
      const memoryIncrease = finalMemory.used - initialMemory.used
      const memoryUsageMB = finalMemory.used / (1024 * 1024)
      
      console.log(`Memory usage: ${memoryUsageMB.toFixed(2)} MB`)
      console.log(`Memory increase: ${(memoryIncrease / 1024).toFixed(2)} KB`)
      
      // Memory usage should be reasonable (under 100MB for simple page)
      expect(memoryUsageMB).toBeLessThan(100)
    }
  })

  test('network request performance', async ({ page }) => {
    const requests: any[] = []
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        startTime: Date.now()
      })
    })
    
    const responses: any[] = []
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        endTime: Date.now()
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Analyze request/response performance
    const failedRequests = responses.filter(r => r.status >= 400)
    const slowRequests = responses.filter(r => {
      const matchingRequest = requests.find(req => req.url === r.url)
      return matchingRequest && (r.endTime - matchingRequest.startTime) > 2000
    })
    
    // Should have minimal failed requests
    expect(failedRequests.length).toBeLessThan(3)
    
    // Should have minimal slow requests
    expect(slowRequests.length).toBeLessThan(2)
    
    console.log(`Total requests: ${requests.length}`)
    console.log(`Failed requests: ${failedRequests.length}`)
    console.log(`Slow requests (>2s): ${slowRequests.length}`)
  })

  test('mobile performance comparison', async ({ page }) => {
    // Test performance on mobile viewport
    await setViewport(page, 'xs')
    
    const mobileStartTime = Date.now()
    await page.goto('/')
    await waitForFontsLoaded(page)
    const mobileLoadTime = Date.now() - mobileStartTime
    
    // Test performance on desktop viewport
    await setViewport(page, 'lg')
    
    const desktopStartTime = Date.now()
    await page.goto('/')
    await waitForFontsLoaded(page)
    const desktopLoadTime = Date.now() - desktopStartTime
    
    console.log(`Mobile load time: ${mobileLoadTime}ms`)
    console.log(`Desktop load time: ${desktopLoadTime}ms`)
    
    // Both should be under 3 seconds
    expect(mobileLoadTime).toBeLessThan(3000)
    expect(desktopLoadTime).toBeLessThan(3000)
    
    // Mobile shouldn't be significantly slower than desktop
    const performanceRatio = mobileLoadTime / desktopLoadTime
    expect(performanceRatio).toBeLessThan(2.0) // Mobile max 2x slower than desktop
  })

  test('third-party script performance impact', async ({ page }) => {
    const thirdPartyDomains = [
      'google',
      'facebook',
      'analytics',
      'recaptcha',
      'googleapis'
    ]
    
    const thirdPartyRequests: any[] = []
    
    page.on('request', request => {
      const url = request.url()
      if (thirdPartyDomains.some(domain => url.includes(domain))) {
        thirdPartyRequests.push({
          url,
          startTime: Date.now()
        })
      }
    })
    
    const thirdPartyResponses: any[] = []
    page.on('response', response => {
      const url = response.url()
      if (thirdPartyDomains.some(domain => url.includes(domain))) {
        thirdPartyResponses.push({
          url,
          endTime: Date.now(),
          size: parseInt(response.headers()['content-length'] || '0')
        })
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Calculate third-party impact
    const totalThirdPartySize = thirdPartyResponses.reduce((sum, response) => sum + response.size, 0)
    const thirdPartySizeKB = totalThirdPartySize / 1024
    
    console.log(`Third-party requests: ${thirdPartyRequests.length}`)
    console.log(`Third-party size: ${thirdPartySizeKB.toFixed(2)} KB`)
    
    // Third-party scripts shouldn't be excessive
    expect(thirdPartyRequests.length).toBeLessThan(20)
    expect(thirdPartySizeKB).toBeLessThan(500) // Under 500KB
  })
})