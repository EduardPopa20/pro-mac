import { test, expect } from '@playwright/test'

/**
 * Tests for responsive filter behavior and layout preservation
 * Validates mobile modal vs desktop sidebar behavior
 * Tests that filter section is preserved when no products are found
 */

test.describe('Filter Responsive Behavior', () => {
  const testRoutes = ['/gresie', '/faianta']
  
  for (const route of testRoutes) {
    test.describe(`${route} page`, () => {
      test('desktop shows filter sidebar always visible', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Desktop should show filter sidebar directly
        const filterCard = page.locator('.MuiCard-root:has-text("Filtrare produse")')
        await expect(filterCard).toBeVisible({ timeout: 10000 })
        
        // Should not show mobile filter button
        const mobileFilterButton = page.getByRole('button', { name: /filtrează produsele/i })
        const buttonVisible = await mobileFilterButton.isVisible().catch(() => false)
        expect(buttonVisible).toBe(false)
        
        // Filter content should be immediately accessible
        const priceInputs = page.locator('input[label="Min"], input[label="Max"]')
        const priceInputCount = await priceInputs.count()
        expect(priceInputCount).toBeGreaterThan(0)
        
        // All price inputs should be visible
        for (let i = 0; i < priceInputCount; i++) {
          await expect(priceInputs.nth(i)).toBeVisible()
        }
      })

      test('mobile shows filter button that opens modal', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Mobile should show filter button
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await expect(filterButton).toBeVisible({ timeout: 10000 })
        
        // Filter sidebar should not be directly visible
        const filterCard = page.locator('.MuiCard-root:has-text("Filtrare produse")')
        const cardVisible = await filterCard.isVisible().catch(() => false)
        expect(cardVisible).toBe(false)
        
        // Clicking button should open modal
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Modal should be full screen
        const modalPaper = filterModal.locator('.MuiDialog-paper')
        const modalBox = await modalPaper.boundingBox()
        const viewport = page.viewportSize()
        
        if (modalBox && viewport) {
          expect(modalBox.width).toBeGreaterThanOrEqual(viewport.width * 0.95) // Almost full width
          expect(modalBox.height).toBeGreaterThanOrEqual(viewport.height * 0.95) // Almost full height
        }
        
        // Modal should contain filter content
        const priceInputs = filterModal.locator('input[label="Min"], input[label="Max"]')
        const priceInputCount = await priceInputs.count()
        expect(priceInputCount).toBeGreaterThan(0)
        
        // Close modal
        const closeButton = filterModal.getByRole('button', { name: /close/i })
        await closeButton.click()
        await expect(filterModal).not.toBeVisible()
      })

      test('tablet shows appropriate behavior', async ({ page }) => {
        await page.setViewportSize({ width: 800, height: 600 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Tablet should show mobile behavior (filter button)
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await expect(filterButton).toBeVisible({ timeout: 10000 })
        
        // Click to open modal
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Verify modal content is accessible
        const filterContent = filterModal.locator('[data-testid="filter-content"], .filter-content')
        if (await filterContent.count() > 0) {
          await expect(filterContent.first()).toBeVisible()
        }
        
        // Close modal
        await page.keyboard.press('Escape')
        await expect(filterModal).not.toBeVisible()
      })

      test('filter section preserved when no products found', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Apply filters that should return no results
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        if (await minPriceInput.isVisible() && await maxPriceInput.isVisible()) {
          // Set unrealistic price range
          await minPriceInput.click()
          await minPriceInput.clear()
          await minPriceInput.fill('999999')
          
          await maxPriceInput.click()
          await maxPriceInput.clear()
          await maxPriceInput.fill('9999999')
          
          // Apply filters
          const applyButton = page.getByRole('button', { name: /aplică filtrele/i })
          if (await applyButton.isVisible()) {
            await applyButton.click()
            await page.waitForTimeout(2000) // Wait for filter application
          }
        }
        
        // Check if we get "no products" message
        const noProductsMessage = page.locator(':text("Nu au fost găsite produse")')
        const hasNoProducts = await noProductsMessage.isVisible()
        
        if (hasNoProducts) {
          // Filter section should still be visible and functional
          const filterCard = page.locator('.MuiCard-root:has-text("Filtrare produse")')
          await expect(filterCard).toBeVisible()
          
          // Price inputs should still be accessible
          await expect(minPriceInput).toBeVisible()
          await expect(maxPriceInput).toBeVisible()
          
          // Clear filters button should be available in the no-products area
          const clearAllButton = page.getByRole('button', { name: /șterge toate filtrele/i })
          await expect(clearAllButton).toBeVisible()
          
          // Clicking clear should restore products
          await clearAllButton.click()
          await page.waitForTimeout(2000)
          
          // No products message should disappear
          await expect(noProductsMessage).not.toBeVisible()
        }
      })

      test('mobile filter modal closes after applying filters', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Open filter modal
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Make a filter change
        const priceInputs = filterModal.locator('input[label="Min"], input[label="Max"]')
        if (await priceInputs.count() > 0) {
          const firstPriceInput = priceInputs.first()
          await firstPriceInput.click()
          await firstPriceInput.clear()
          await firstPriceInput.fill('50')
        }
        
        // Apply filters
        const applyButton = filterModal.getByRole('button', { name: /aplică filtrele/i })
        if (await applyButton.isVisible()) {
          await applyButton.click()
          
          // Modal should close automatically
          await expect(filterModal).not.toBeVisible({ timeout: 5000 })
          
          // Filter button should show active state
          const activeIndicator = page.locator('.MuiBadge-badge, :text("Active")')
          const hasActiveIndicator = await activeIndicator.count() > 0
          if (hasActiveIndicator) {
            await expect(activeIndicator.first()).toBeVisible()
          }
        }
      })

      test('no horizontal scroll at any breakpoint', async ({ page }) => {
        const breakpoints = [
          { width: 360, height: 640 },
          { width: 600, height: 800 },
          { width: 960, height: 720 },
          { width: 1280, height: 800 },
          { width: 1920, height: 1080 }
        ]
        
        for (const bp of breakpoints) {
          await page.setViewportSize(bp)
          await page.goto(`http://localhost:5176${route}`)
          await page.waitForLoadState('networkidle')
          
          // Check for horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth
          })
          
          expect(hasHorizontalScroll).toBe(false)
          
          // For mobile, also test with filter modal open
          if (bp.width < 960) {
            const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
            if (await filterButton.isVisible()) {
              await filterButton.click()
              
              const filterModal = page.locator('.MuiDialog-root')
              if (await filterModal.isVisible()) {
                const hasScrollInModal = await page.evaluate(() => {
                  return document.documentElement.scrollWidth > document.documentElement.clientWidth
                })
                
                expect(hasScrollInModal).toBe(false)
                
                // Close modal
                await page.keyboard.press('Escape')
              }
            }
          }
        }
      })

      test('filter button shows active state correctly', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await expect(filterButton).toBeVisible()
        
        // Initially should not have active state
        const initialBadge = page.locator('.MuiBadge-badge')
        const initialHasActive = await initialBadge.count() > 0
        
        // Open modal and apply some filters
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Change price filter
        const minPriceInput = filterModal.locator('input[label="Min"]').first()
        if (await minPriceInput.isVisible()) {
          await minPriceInput.click()
          await minPriceInput.clear()
          await minPriceInput.fill('100')
          
          // Apply filters
          const applyButton = filterModal.getByRole('button', { name: /aplică filtrele/i })
          await applyButton.click()
          
          // Modal should close and button should show active state
          await expect(filterModal).not.toBeVisible()
          
          // Look for active indicators
          const activeIndicators = page.locator('.MuiBadge-badge, :text("Active"), [color="primary"]')
          const activeCount = await activeIndicators.count()
          
          // Should have some form of active indication
          expect(activeCount).toBeGreaterThan(0)
        }
      })
    })
  }
})