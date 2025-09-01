import { test, expect } from '@playwright/test'
import { setViewport } from './utils'

test.describe('Product Filter Functionality', () => {
  
  // Test data setup - navigate to a category with products
  const testCategory = 'gresie' // Using gresie category for testing
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:5179/${testCategory}`)
    await page.waitForLoadState('networkidle')
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
  })

  test.describe('Filter Card Visibility and Layout', () => {
    test('should show filter card on desktop', async ({ page }) => {
      await setViewport(page, 'lg')
      
      const filterCard = page.locator('text=Filtrare produse').first()
      await expect(filterCard).toBeVisible()
    })

    test('should show filter card on mobile', async ({ page }) => {
      await setViewport(page, 'xs')
      
      const filterCard = page.locator('text=Filtrare produse').first()
      await expect(filterCard).toBeVisible()
      
      // Check if it's collapsible on mobile
      const expandButton = page.locator('[data-testid="expand-filters"], .MuiIconButton-root').last()
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await page.waitForTimeout(500) // Wait for animation
      }
    })
  })

  test.describe('Price Range Filter', () => {
    test('should display price range inputs correctly', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Wait for filter to be visible and expanded
      await page.waitForSelector('text=Interval preț', { timeout: 5000 })
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await expect(minPriceInput).toBeVisible()
      await expect(maxPriceInput).toBeVisible()
      
      // Check that inputs have proper width and are fully visible
      const minBox = await minPriceInput.boundingBox()
      const maxBox = await maxPriceInput.boundingBox()
      
      expect(minBox?.width).toBeGreaterThanOrEqual(80) // Should be at least 80px wide
      expect(maxBox?.width).toBeGreaterThanOrEqual(80) // Should be at least 80px wide
    })

    test('should validate price input ranges', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Test invalid range (min > max)
      await minPriceInput.fill('1000')
      await maxPriceInput.fill('500')
      await maxPriceInput.blur()
      
      // Should show error message
      const errorAlert = page.locator('.MuiAlert-root[severity="error"], .MuiAlert-standardError')
      await expect(errorAlert).toBeVisible({ timeout: 3000 })
    })

    test('should filter products by price range', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      // Get initial product count
      const initialProducts = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
      expect(initialProducts).toBeGreaterThan(0)
      
      // Set a specific price range
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await minPriceInput.fill('50')
      await maxPriceInput.fill('200')
      
      // Apply filters if there's a save/apply button
      const applyButton = page.locator('text=Salvează, text=Aplică').first()
      if (await applyButton.isVisible()) {
        await applyButton.click()
        await page.waitForLoadState('networkidle')
      }
      
      // Wait for products to update
      await page.waitForTimeout(1000)
      
      // Verify that products shown have prices within range
      const productPrices = await page.locator('.MuiTypography-root').filter({ hasText: /\d+.*RON/ }).allTextContents()
      
      for (const priceText of productPrices) {
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'))
        if (!isNaN(price)) {
          expect(price).toBeGreaterThanOrEqual(50)
          expect(price).toBeLessThanOrEqual(200)
        }
      }
    })

    test('should work with slider interaction', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const slider = page.locator('.MuiSlider-root').first()
      await expect(slider).toBeVisible()
      
      // Try to interact with slider (this is complex with Playwright, so we'll just verify it exists)
      const sliderThumbs = page.locator('.MuiSlider-thumb')
      expect(await sliderThumbs.count()).toBeGreaterThanOrEqual(2) // Should have min and max thumbs
    })
  })

  test.describe('Color Filter', () => {
    test('should show color filter if colors available', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Check if color filter exists
      const colorSection = page.locator('text=Culoare').first()
      
      // If color filter exists, test it
      if (await colorSection.isVisible()) {
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await expect(colorSelect).toBeVisible()
        
        // Open dropdown
        await colorSelect.click()
        
        // Should show color options
        const colorOptions = page.locator('[role="option"]')
        expect(await colorOptions.count()).toBeGreaterThan(0)
        
        // Close dropdown
        await page.keyboard.press('Escape')
      }
    })

    test('should filter products by color', async ({ page }) => {
      await setViewport(page, 'lg')
      
      const colorSection = page.locator('text=Culoare').first()
      
      if (await colorSection.isVisible()) {
        // Get initial product count
        const initialProducts = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        // Select first color option
        const firstColorOption = page.locator('[role="option"]').first()
        if (await firstColorOption.isVisible()) {
          await firstColorOption.click()
          
          // Click outside to close dropdown
          await page.click('body')
          
          // Apply filters if needed
          const applyButton = page.locator('text=Salvează').first()
          if (await applyButton.isVisible()) {
            await applyButton.click()
            await page.waitForLoadState('networkidle')
          }
          
          await page.waitForTimeout(1000)
          
          // Verify products are filtered
          const filteredProducts = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
          expect(filteredProducts).toBeLessThanOrEqual(initialProducts)
        }
      }
    })
  })

  test.describe('Filter Actions', () => {
    test('should show clear filters button when filters applied', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      // Apply a filter
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('100')
      
      // Should show clear button
      const clearButton = page.locator('text=Șterge tot').first()
      await expect(clearButton).toBeVisible({ timeout: 3000 })
    })

    test('should clear all filters when clear button clicked', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      // Apply filters
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('100')
      
      // Clear filters
      const clearButton = page.locator('text=Șterge tot').first()
      if (await clearButton.isVisible()) {
        await clearButton.click()
        await page.waitForTimeout(500)
        
        // Verify filters are cleared
        const minValue = await minPriceInput.inputValue()
        expect(parseInt(minValue)).toBeLessThan(100) // Should reset to original min value
      }
    })

    test('should show unsaved changes indicator', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      // Make a change to filters
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('150')
      
      // Should show save button
      const saveButton = page.locator('text=Salvează').first()
      await expect(saveButton).toBeVisible({ timeout: 3000 })
    })
  })

  test.describe('Filter Responsiveness', () => {
    test('should be responsive across breakpoints', async ({ page }) => {
      const breakpoints = ['xs', 'md', 'lg'] as const
      
      for (const bp of breakpoints) {
        await setViewport(page, bp)
        await page.waitForTimeout(500) // Wait for responsive changes
        
        const filterCard = page.locator('text=Filtrare produse').first()
        await expect(filterCard).toBeVisible()
        
        // Check that price inputs are properly sized
        if (bp === 'xs') {
          // On mobile, inputs should be visible but possibly with adapted layout
          const minPriceInput = page.locator('input[type="number"]').first()
          if (await minPriceInput.isVisible()) {
            const inputBox = await minPriceInput.boundingBox()
            expect(inputBox?.width).toBeGreaterThanOrEqual(60) // Minimum acceptable width on mobile
          }
        } else {
          // On larger screens, inputs should have comfortable width
          const minPriceInput = page.locator('input[type="number"]').first()
          const inputBox = await minPriceInput.boundingBox()
          expect(inputBox?.width).toBeGreaterThanOrEqual(80)
        }
      }
    })

    test('should not cause horizontal scroll', async ({ page }) => {
      const breakpoints = ['xs', 'md', 'lg'] as const
      
      for (const bp of breakpoints) {
        await setViewpoint(page, bp)
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        
        expect(hasHorizontalScroll).toBeFalsy()
      }
    })
  })

  test.describe('Filter Integration with Product Grid', () => {
    test('should update product count when filters applied', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Get initial count
      await page.waitForSelector('text=produse găsite, text=produs găsit')
      const initialCountText = await page.locator('text=/\\d+ produse?\\s+(găsite?|găsit)/')
        .first().textContent()
      
      const initialMatch = initialCountText?.match(/(\d+)/)
      const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0
      
      // Apply price filter
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('200')
      
      const applyButton = page.locator('text=Salvează').first()
      if (await applyButton.isVisible()) {
        await applyButton.click()
        await page.waitForLoadState('networkidle')
      }
      
      await page.waitForTimeout(1000)
      
      // Check if count updated
      const updatedCountText = await page.locator('text=/\\d+ produse?\\s+(găsite?|găsit)/')
        .first().textContent()
      
      const updatedMatch = updatedCountText?.match(/(\d+)/)
      const updatedCount = updatedMatch ? parseInt(updatedMatch[1]) : 0
      
      expect(updatedCount).toBeLessThanOrEqual(initialCount)
    })

    test('should show no results message when no products match filters', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Apply very restrictive filter that likely returns no results
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await minPriceInput.fill('9999')
      await maxPriceInput.fill('10000')
      
      const applyButton = page.locator('text=Salvează').first()
      if (await applyButton.isVisible()) {
        await applyButton.click()
        await page.waitForLoadState('networkidle')
      }
      
      await page.waitForTimeout(2000)
      
      // Should show no results message
      const noResultsMessage = page.locator('text=Nu au fost găsite produse, text=Nu există produse')
      await expect(noResultsMessage.first()).toBeVisible({ timeout: 5000 })
    })
  })

  // Helper function fix
  async function setViewpoint(page: any, bp: 'xs' | 'md' | 'lg') {
    await setViewport(page, bp)
  }
})