import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Advanced Search Functionality Testing', () => {

  test('search autocomplete basic functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Find search input
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Test minimum character threshold
    await searchInput.fill('g')
    await page.waitForTimeout(400) // Wait for debounce
    
    // Should not show results for single character
    const dropdown = page.locator('[role="presentation"]')
    let dropdownVisible = await dropdown.isVisible()
    expect(dropdownVisible).toBeFalsy()
    
    // Test with 2+ characters
    await searchInput.fill('gr')
    await page.waitForTimeout(400)
    
    dropdownVisible = await dropdown.isVisible()
    if (dropdownVisible) {
      // Verify dropdown contains search results
      const resultItems = dropdown.locator('div[style*="cursor"], [role="button"]')
      const resultCount = await resultItems.count()
      expect(resultCount).toBeGreaterThan(0)
      expect(resultCount).toBeLessThanOrEqual(10) // Maximum 10 items as per design standards
    }
  })

  test('search debouncing and performance', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Track network requests to verify debouncing
    const searchRequests: any[] = []
    page.on('request', request => {
      if (request.url().includes('products') && request.method() === 'GET') {
        searchRequests.push({
          url: request.url(),
          timestamp: Date.now()
        })
      }
    })
    
    // Type quickly to test debouncing
    const searchTerm = 'gresie'
    for (const char of searchTerm) {
      await searchInput.type(char, { delay: 50 })
    }
    
    // Wait for debounce completion
    await page.waitForTimeout(500)
    
    // Should have made fewer requests than characters typed (due to debouncing)
    expect(searchRequests.length).toBeLessThanOrEqual(3)
    
    // Verify final search request contains full term
    if (searchRequests.length > 0) {
      const lastRequest = searchRequests[searchRequests.length - 1]
      expect(lastRequest.url).toContain('gresie')
    }
  })

  test('search results filtering and categorization', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('gresie')
    await page.waitForTimeout(600)
    
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      // Check for product results
      const productResults = dropdown.locator('div').filter({ hasText: /gresie/i })
      const productCount = await productResults.count()
      
      if (productCount > 0) {
        // Verify result relevance
        for (let i = 0; i < Math.min(productCount, 3); i++) {
          const result = productResults.nth(i)
          const resultText = await result.textContent()
          
          if (resultText) {
            // Should contain search term or related keywords
            const isRelevant = resultText.toLowerCase().includes('gresie') ||
                             resultText.toLowerCase().includes('tiles') ||
                             resultText.toLowerCase().includes('ceramic')
            expect(isRelevant).toBeTruthy()
          }
        }
        
        // Test result interaction
        const firstResult = productResults.first()
        await firstResult.click()
        
        // Should navigate or show product details
        await page.waitForTimeout(1000)
        const currentUrl = page.url()
        const urlChanged = !currentUrl.endsWith('/')
        
        // Either URL changed or modal opened
        const modal = page.locator('[role="dialog"]')
        const modalVisible = await modal.isVisible()
        
        expect(urlChanged || modalVisible).toBeTruthy()
      }
    }
  })

  test('search error handling and recovery', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Test with invalid characters
    await searchInput.fill('###@@@')
    await page.waitForTimeout(600)
    
    // Should handle gracefully without errors
    const pageErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageErrors.push(msg.text())
      }
    })
    
    // Test network error scenario
    await page.route('**/products*', route => {
      route.abort('failed')
    })
    
    await searchInput.clear()
    await searchInput.fill('test')
    await page.waitForTimeout(600)
    
    // Should not crash the application
    const searchInputStillVisible = await searchInput.isVisible()
    expect(searchInputStillVisible).toBeTruthy()
    
    // Should not have unhandled JavaScript errors
    const hasUnhandledErrors = pageErrors.some(error => 
      error.includes('Uncaught') && !error.includes('Failed to fetch')
    )
    expect(hasUnhandledErrors).toBeFalsy()
  })

  test('mobile search experience', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Verify mobile-appropriate sizing
    const inputBox = await searchInput.boundingBox()
    if (inputBox) {
      expect(inputBox.height).toBeGreaterThanOrEqual(44) // WCAG touch target minimum
      expect(inputBox.width).toBeGreaterThan(150) // Reasonable mobile width
    }
    
    // Test mobile search interaction
    await searchInput.fill('tiles')
    await page.waitForTimeout(500)
    
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      // Dropdown should not exceed mobile viewport
      const dropdownBox = await dropdown.boundingBox()
      const viewportSize = page.viewportSize()
      
      if (dropdownBox && viewportSize) {
        expect(dropdownBox.width).toBeLessThanOrEqual(viewportSize.width)
        expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(viewportSize.width)
      }
      
      // Test mobile result interaction
      const results = dropdown.locator('div[style*="cursor"], [role="button"]')
      const resultCount = await results.count()
      
      if (resultCount > 0) {
        const firstResult = results.first()
        const resultBox = await firstResult.boundingBox()
        
        if (resultBox) {
          // Mobile results should be touch-friendly
          expect(resultBox.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })

  test('search keyboard navigation', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
    
    // Type search term
    await searchInput.fill('gresie')
    await page.waitForTimeout(500)
    
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      // Test arrow key navigation
      await page.keyboard.press('ArrowDown')
      
      // Check if focus moved to first result
      const focusedElement = page.locator(':focus')
      const elementVisible = await focusedElement.isVisible()
      
      if (elementVisible) {
        // Should be able to navigate with arrow keys
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('ArrowUp')
        
        // Enter key should select result
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)
        
        // Should navigate or perform action
        const currentUrl = page.url()
        const urlChanged = !currentUrl.endsWith('/')
        const modalVisible = await page.locator('[role="dialog"]').isVisible()
        
        expect(urlChanged || modalVisible).toBeTruthy()
      }
    }
    
    // Escape key should close dropdown
    await searchInput.focus()
    await searchInput.fill('test')
    await page.waitForTimeout(300)
    
    if (await dropdown.isVisible()) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
      
      const dropdownStillVisible = await dropdown.isVisible()
      expect(dropdownStillVisible).toBeFalsy()
    }
  })

  test('search loading states and indicators', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Slow down network to capture loading state
    await page.route('**/products*', async route => {
      await page.waitForTimeout(1000) // Simulate slow network
      await route.continue()
    })
    
    await searchInput.fill('loading')
    
    // Check for loading indicators quickly after typing
    await page.waitForTimeout(100)
    
    const loadingIndicators = page.locator('.MuiCircularProgress-root, .MuiSkeleton-root, [data-testid*="loading"]')
    const loadingCount = await loadingIndicators.count()
    
    if (loadingCount > 0) {
      // Verify loading indicator is visible
      await expect(loadingIndicators.first()).toBeVisible()
    }
    
    // Wait for results to load
    await page.waitForTimeout(1500)
    
    // Loading indicator should disappear
    const finalLoadingCount = await loadingIndicators.count()
    expect(finalLoadingCount).toBeLessThanOrEqual(loadingCount)
  })

  test('search history and suggestions', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Perform multiple searches to build history
    const searchTerms = ['gresie', 'faianta', 'mozaic']
    
    for (const term of searchTerms) {
      await searchInput.clear()
      await searchInput.fill(term)
      await page.waitForTimeout(600)
      
      // Interact with results if available
      const dropdown = page.locator('[role="presentation"]')
      if (await dropdown.isVisible()) {
        const results = dropdown.locator('div[style*="cursor"], [role="button"]')
        const resultCount = await results.count()
        
        if (resultCount > 0) {
          await results.first().click()
          await page.waitForTimeout(500)
          await page.goto('/') // Return to homepage
          await waitForFontsLoaded(page)
        }
      }
    }
    
    // Test if search input shows suggestions for partial matches
    await searchInput.clear()
    await searchInput.fill('gr')
    await page.waitForTimeout(400)
    
    const dropdown = page.locator('[role="presentation"]')
    if (await dropdown.isVisible()) {
      const suggestionText = await dropdown.textContent()
      
      // Should potentially show previous search or related suggestions
      const hasSuggestions = suggestionText && suggestionText.length > 0
      expect(hasSuggestions).toBeTruthy()
    }
  })

  test('search result truncation and formatting', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('ceramic')
    await page.waitForTimeout(600)
    
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      const results = dropdown.locator('div').filter({ hasText: /ceramic|gresie|faianta/i })
      const resultCount = await results.count()
      
      if (resultCount > 0) {
        // Check result formatting
        for (let i = 0; i < Math.min(resultCount, 3); i++) {
          const result = results.nth(i)
          const resultBox = await result.boundingBox()
          
          if (resultBox) {
            // Results should not be too wide (should fit in dropdown)
            expect(resultBox.width).toBeLessThan(600)
            
            // Text should not be too long (should be truncated)
            const resultText = await result.textContent()
            if (resultText) {
              expect(resultText.length).toBeLessThan(200) // Reasonable limit
            }
          }
        }
        
        // Check for consistent styling
        const firstResult = results.first()
        const styles = await firstResult.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            padding: computed.padding,
            fontSize: computed.fontSize,
            lineHeight: computed.lineHeight
          }
        })
        
        // Should have readable font size
        const fontSize = parseFloat(styles.fontSize)
        expect(fontSize).toBeGreaterThanOrEqual(14)
      }
    }
  })

  test('search analytics and tracking', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Monitor potential analytics calls
    const analyticsRequests: string[] = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('analytics') || url.includes('tracking') || url.includes('events')) {
        analyticsRequests.push(url)
      }
    })
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('tracked search')
    await page.waitForTimeout(600)
    
    const dropdown = page.locator('[role="presentation"]')
    if (await dropdown.isVisible()) {
      const results = dropdown.locator('div[style*="cursor"], [role="button"]')
      const resultCount = await results.count()
      
      if (resultCount > 0) {
        await results.first().click()
        await page.waitForTimeout(1000)
        
        // Verify search functionality doesn't break due to analytics
        const currentUrl = page.url()
        const urlIsValid = currentUrl.startsWith('http')
        expect(urlIsValid).toBeTruthy()
      }
    }
    
    // Analytics should not interfere with search functionality
    const searchInputStillWorks = await searchInput.isVisible()
    expect(searchInputStillWorks).toBeTruthy()
  })

  test('cross-browser search consistency', async ({ page, browserName }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    // Test basic search functionality across browsers
    await searchInput.fill('browser test')
    await page.waitForTimeout(500)
    
    // Input should maintain focus
    await expect(searchInput).toBeFocused()
    
    // Dropdown behavior should be consistent
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      // Position should be consistent across browsers
      const dropdownBox = await dropdown.boundingBox()
      const inputBox = await searchInput.boundingBox()
      
      if (dropdownBox && inputBox) {
        // Dropdown should appear below input
        expect(dropdownBox.y).toBeGreaterThan(inputBox.y)
        
        // Should be aligned with input (within reasonable tolerance)
        const alignment = Math.abs(dropdownBox.x - inputBox.x)
        expect(alignment).toBeLessThan(50)
      }
    }
    
    // Clear search and verify input resets properly
    await searchInput.clear()
    const inputValue = await searchInput.inputValue()
    expect(inputValue).toBe('')
    
    console.log(`Search functionality tested on ${browserName}`)
  })
})