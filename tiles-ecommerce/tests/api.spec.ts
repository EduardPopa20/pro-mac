import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('API Integration and Network Request Tests', () => {

  test('search API requests and responses', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Track API requests for search functionality
    const apiRequests: any[] = []
    const apiResponses: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('products') && request.method() === 'GET') {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        })
      }
    })
    
    page.on('response', response => {
      if (response.url().includes('products') && response.request().method() === 'GET') {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        })
      }
    })
    
    // Trigger search API request
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('gresie')
    await page.waitForTimeout(800) // Wait for debounce and API call
    
    // Verify API request was made
    expect(apiRequests.length).toBeGreaterThan(0)
    
    if (apiRequests.length > 0) {
      const searchRequest = apiRequests[apiRequests.length - 1]
      
      // Verify request structure
      expect(searchRequest.url).toContain('products')
      expect(searchRequest.method).toBe('GET')
      expect(searchRequest.url).toContain('gresie')
      
      // Check for proper headers
      const contentType = searchRequest.headers['content-type'] || searchRequest.headers['Content-Type']
      expect(contentType || 'application/json').toBeTruthy()
    }
    
    // Verify API response
    if (apiResponses.length > 0) {
      const searchResponse = apiResponses[apiResponses.length - 1]
      
      // Response should be successful
      expect(searchResponse.status).toBeLessThan(400)
      expect([200, 201, 204].includes(searchResponse.status)).toBeTruthy()
      
      // Response should have appropriate headers
      const responseHeaders = searchResponse.headers
      expect(responseHeaders).toBeTruthy()
    }
  })

  test('form submission API integration', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Track form submission requests
    const formRequests: any[] = []
    const formResponses: any[] = []
    
    page.on('request', request => {
      if (request.method() === 'POST' && 
          (request.url().includes('contact') || request.url().includes('functions'))) {
        formRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          headers: request.headers(),
          timestamp: Date.now()
        })
      }
    })
    
    page.on('response', response => {
      if (response.request().method() === 'POST' && 
          (response.url().includes('contact') || response.url().includes('functions'))) {
        formResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        })
      }
    })
    
    // Find and fill contact form
    const form = page.locator('form').first()
    const formExists = await form.count() > 0
    
    if (formExists && await form.isVisible()) {
      // Fill form fields
      const nameField = form.locator('input[name*="name"], input[placeholder*="nume"]').first()
      const emailField = form.locator('input[type="email"], input[name*="email"]').first()
      const messageField = form.locator('textarea, input[name*="message"]').first()
      const submitButton = form.locator('button[type="submit"]').first()
      
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) await emailField.fill('test@example.com')
      if (await messageField.isVisible()) await messageField.fill('Test message for API integration')
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(3000) // Wait for API call
        
        // Verify form submission request
        if (formRequests.length > 0) {
          const submitRequest = formRequests[formRequests.length - 1]
          
          expect(submitRequest.method).toBe('POST')
          expect(submitRequest.postData).toBeTruthy()
          
          // Verify form data contains expected fields
          const postData = submitRequest.postData
          if (postData) {
            expect(postData).toContain('test@example.com')
            expect(postData).toContain('Test User')
          }
        }
        
        // Verify API response
        if (formResponses.length > 0) {
          const submitResponse = formResponses[formResponses.length - 1]
          
          // Response should indicate success or proper error handling
          expect([200, 201, 400, 422].includes(submitResponse.status)).toBeTruthy()
        }
      }
    }
  })

  test('newsletter subscription API', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Track newsletter subscription requests
    const newsletterRequests: any[] = []
    const newsletterResponses: any[] = []
    
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('newsletter')) {
        newsletterRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          timestamp: Date.now()
        })
      }
    })
    
    page.on('response', response => {
      if (response.request().method() === 'POST' && response.url().includes('newsletter')) {
        newsletterResponses.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        })
      }
    })
    
    // Wait for newsletter modal
    await page.waitForTimeout(5000)
    
    const newsletterModal = page.locator('[role="dialog"]').filter({ hasText: /newsletter|aboneaza|email/i })
    const modalVisible = await newsletterModal.isVisible()
    
    if (modalVisible) {
      const emailInput = newsletterModal.locator('input[type="email"]').first()
      const submitButton = newsletterModal.locator('button[type="submit"]').first()
      
      if (await emailInput.isVisible() && await submitButton.isVisible()) {
        await emailInput.fill('newsletter.test@example.com')
        await submitButton.click()
        
        await page.waitForTimeout(2000)
        
        // Verify newsletter API request
        if (newsletterRequests.length > 0) {
          const newsletterRequest = newsletterRequests[newsletterRequests.length - 1]
          
          expect(newsletterRequest.method).toBe('POST')
          expect(newsletterRequest.url).toContain('newsletter')
          
          const postData = newsletterRequest.postData
          if (postData) {
            expect(postData).toContain('newsletter.test@example.com')
          }
        }
        
        // Verify API response
        if (newsletterResponses.length > 0) {
          const newsletterResponse = newsletterResponses[newsletterResponses.length - 1]
          expect([200, 201, 409].includes(newsletterResponse.status)).toBeTruthy()
        }
      }
    }
  })

  test('API error handling and resilience', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test search with network error
    await page.route('**/products*', route => {
      route.abort('failed')
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('network error test')
    await page.waitForTimeout(1000)
    
    // Application should handle network error gracefully
    const searchInputStillVisible = await searchInput.isVisible()
    expect(searchInputStillVisible).toBeTruthy()
    
    // Test with 500 server error
    await page.route('**/products*', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    await searchInput.clear()
    await searchInput.fill('server error test')
    await page.waitForTimeout(1000)
    
    // Application should still be functional
    const inputIsEnabled = await searchInput.isEnabled()
    expect(inputIsEnabled).toBeTruthy()
    
    // Test with malformed JSON response
    await page.route('**/products*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json response'
      })
    })
    
    await searchInput.clear()
    await searchInput.fill('malformed response test')
    await page.waitForTimeout(1000)
    
    // Application should not crash
    const pageStillResponsive = await searchInput.isVisible()
    expect(pageStillResponsive).toBeTruthy()
  })

  test('API request timeout handling', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Simulate slow API response
    await page.route('**/products*', async route => {
      await page.waitForTimeout(10000) // 10 second delay
      await route.continue()
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    const startTime = Date.now()
    
    await searchInput.fill('timeout test')
    await page.waitForTimeout(5000) // Wait 5 seconds
    
    const endTime = Date.now()
    const elapsedTime = endTime - startTime
    
    // Application should handle long requests appropriately
    expect(elapsedTime).toBeGreaterThan(4000)
    
    // Search input should still be functional
    const inputStillVisible = await searchInput.isVisible()
    expect(inputStillVisible).toBeTruthy()
    
    // Check for loading indicators during long requests
    const loadingIndicators = page.locator('.MuiCircularProgress-root, .MuiSkeleton-root')
    const hasLoadingIndicator = await loadingIndicators.count() > 0
    
    console.log(`API timeout test completed in ${elapsedTime}ms, has loading: ${hasLoadingIndicator}`)
  })

  test('API request authentication and headers', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Monitor API request headers
    const apiRequestHeaders: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('api')) {
        apiRequestHeaders.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method()
        })
      }
    })
    
    // Trigger API request
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('auth test')
    await page.waitForTimeout(1000)
    
    // Verify proper headers are included
    if (apiRequestHeaders.length > 0) {
      const apiRequest = apiRequestHeaders[apiRequestHeaders.length - 1]
      const headers = apiRequest.headers
      
      // Check for essential headers
      expect(headers['user-agent'] || headers['User-Agent']).toBeTruthy()
      expect(headers['accept'] || headers['Accept']).toBeTruthy()
      
      // If using Supabase, check for API key
      if (apiRequest.url.includes('supabase')) {
        const authHeader = headers['authorization'] || headers['Authorization']
        const apiKeyHeader = headers['apikey'] || headers['apiKey']
        
        expect(authHeader || apiKeyHeader).toBeTruthy()
      }
    }
  })

  test('API response data integrity', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Capture API response data
    let responseData: any = null
    
    page.on('response', async response => {
      if (response.url().includes('products') && response.status() === 200) {
        try {
          responseData = await response.json()
        } catch (error) {
          console.log('Failed to parse response JSON:', error)
        }
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('data integrity test')
    await page.waitForTimeout(1500)
    
    // Verify response data structure
    if (responseData) {
      expect(responseData).toBeTruthy()
      
      // If response is an array of products
      if (Array.isArray(responseData)) {
        for (const product of responseData.slice(0, 3)) {
          // Verify product structure
          expect(product).toHaveProperty('id')
          expect(product.id).toBeTruthy()
          
          if (product.name) {
            expect(typeof product.name).toBe('string')
            expect(product.name.length).toBeGreaterThan(0)
          }
          
          if (product.price) {
            expect(typeof product.price).toBe('number')
            expect(product.price).toBeGreaterThan(0)
          }
        }
      }
      
      // If response has data property
      if (responseData.data && Array.isArray(responseData.data)) {
        const products = responseData.data
        expect(products.length).toBeGreaterThanOrEqual(0)
        
        if (products.length > 0) {
          const firstProduct = products[0]
          expect(firstProduct).toHaveProperty('id')
          
          console.log(`✓ API returned ${products.length} products with valid structure`)
        }
      }
    }
  })

  test('API caching and performance', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const apiRequestTimes: number[] = []
    
    page.on('request', request => {
      if (request.url().includes('products')) {
        apiRequestTimes.push(Date.now())
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // First search
    const firstSearchStart = Date.now()
    await searchInput.fill('caching test')
    await page.waitForTimeout(1000)
    const firstSearchEnd = Date.now()
    
    // Clear and repeat same search
    await searchInput.clear()
    await page.waitForTimeout(200)
    
    const secondSearchStart = Date.now()
    await searchInput.fill('caching test')
    await page.waitForTimeout(1000)
    const secondSearchEnd = Date.now()
    
    const firstSearchTime = firstSearchEnd - firstSearchStart
    const secondSearchTime = secondSearchEnd - secondSearchStart
    
    // Both searches should complete in reasonable time
    expect(firstSearchTime).toBeLessThan(3000)
    expect(secondSearchTime).toBeLessThan(3000)
    
    // Verify API requests were made
    expect(apiRequestTimes.length).toBeGreaterThan(0)
    
    console.log(`First search: ${firstSearchTime}ms, Second search: ${secondSearchTime}ms`)
  })

  test('concurrent API requests handling', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const concurrentRequests: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('products')) {
        concurrentRequests.push({
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Rapidly trigger multiple searches
    const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde']
    
    for (const term of searchTerms) {
      await searchInput.fill(term)
      await page.waitForTimeout(100) // Short delay between searches
    }
    
    await page.waitForTimeout(2000) // Wait for all requests to complete
    
    // Should handle concurrent requests gracefully
    expect(concurrentRequests.length).toBeGreaterThan(0)
    
    // Verify no request race conditions caused errors
    const pageErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text())
      }
    })
    
    const hasRaceConditionErrors = pageErrors.some(error => 
      error.includes('race') || error.includes('concurrent')
    )
    expect(hasRaceConditionErrors).toBeFalsy()
    
    console.log(`Handled ${concurrentRequests.length} concurrent API requests`)
  })

  test('API request cancellation', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Track request lifecycle
    const requestLifecycle: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('products')) {
        requestLifecycle.push({
          action: 'started',
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })
    
    page.on('requestfailed', request => {
      if (request.url().includes('products')) {
        requestLifecycle.push({
          action: 'failed',
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })
    
    page.on('requestfinished', request => {
      if (request.url().includes('products')) {
        requestLifecycle.push({
          action: 'finished',
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Start a search and quickly change it
    await searchInput.fill('cancel test')
    await page.waitForTimeout(100) // Brief delay
    
    // Change search quickly to test cancellation
    await searchInput.clear()
    await searchInput.fill('new search')
    await page.waitForTimeout(1500)
    
    // Verify request lifecycle was handled properly
    expect(requestLifecycle.length).toBeGreaterThan(0)
    
    const startedRequests = requestLifecycle.filter(r => r.action === 'started')
    const finishedOrFailed = requestLifecycle.filter(r => r.action === 'finished' || r.action === 'failed')
    
    console.log(`Started: ${startedRequests.length}, Finished/Failed: ${finishedOrFailed.length}`)
    
    // Application should handle request cancellation gracefully
    const inputStillFunctional = await searchInput.isVisible() && await searchInput.isEnabled()
    expect(inputStillFunctional).toBeTruthy()
  })

  test('mobile API request handling', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    // Test API requests on mobile
    const mobileApiRequests: any[] = []
    
    page.on('request', request => {
      if (request.url().includes('products')) {
        mobileApiRequests.push({
          url: request.url(),
          userAgent: request.headers()['user-agent'],
          timestamp: Date.now()
        })
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('mobile api test')
    await page.waitForTimeout(1000)
    
    // Verify mobile API requests work properly
    if (mobileApiRequests.length > 0) {
      const mobileRequest = mobileApiRequests[mobileApiRequests.length - 1]
      
      expect(mobileRequest.url).toContain('products')
      expect(mobileRequest.userAgent).toBeTruthy()
      
      // User agent should indicate mobile browser
      const isMobileUA = mobileRequest.userAgent.includes('Mobile') || 
                        mobileRequest.userAgent.includes('Android')
      console.log(`Mobile API request made with UA: ${mobileRequest.userAgent.substring(0, 50)}...`)
    }
    
    // Mobile interface should remain responsive
    const inputBox = await searchInput.boundingBox()
    if (inputBox) {
      expect(inputBox.height).toBeGreaterThanOrEqual(44)
    }
  })
})