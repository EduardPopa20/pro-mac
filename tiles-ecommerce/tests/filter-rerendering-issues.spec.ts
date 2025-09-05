import { test, expect } from '@playwright/test'

/**
 * Tests for filter rerendering and price field reset issues
 * Validates that price fields don't reset to 0,0 after initial load
 * Tests for race conditions and unnecessary rerenders
 */

test.describe('Filter Rerendering and State Issues', () => {
  const testRoutes = ['/gresie', '/faianta']
  
  for (const route of testRoutes) {
    test.describe(`${route} page`, () => {
      test('price fields initialize correctly and do not reset to 0,0', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Monitor network requests to understand loading sequence
        const responses: string[] = []
        page.on('response', response => {
          if (response.url().includes('products') || response.url().includes('categories')) {
            responses.push(response.url())
          }
        })
        
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Wait for filters to fully load
        await page.waitForSelector('input[label="Min"], input[label="Max"]', { timeout: 10000 })
        
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        // Record initial values immediately after they appear
        const initialMinValue = await minPriceInput.inputValue()
        const initialMaxValue = await maxPriceInput.inputValue()
        
        console.log(`Initial values: Min=${initialMinValue}, Max=${initialMaxValue}`)
        
        // Wait for potential rerenders/updates
        await page.waitForTimeout(3000)
        
        // Check values after waiting - they should not have changed to 0,0
        const finalMinValue = await minPriceInput.inputValue()
        const finalMaxValue = await maxPriceInput.inputValue()
        
        console.log(`Final values: Min=${finalMinValue}, Max=${finalMaxValue}`)
        
        // Values should not be 0,0 (unless there are truly no products)
        const hasProducts = await page.locator('.product-card, [data-testid="product-card"]').count() > 0
        
        if (hasProducts) {
          expect(finalMinValue).not.toBe('0')
          expect(finalMaxValue).not.toBe('0')
          
          // Values should not have reset
          expect(finalMinValue).toBe(initialMinValue)
          expect(finalMaxValue).toBe(initialMaxValue)
        }
        
        // Verify the fields are actually functional
        await minPriceInput.click()
        await minPriceInput.clear()
        await minPriceInput.fill('123')
        
        const testValue = await minPriceInput.inputValue()
        expect(testValue).toBe('123')
      })

      test('price fields maintain values during filter interactions', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        // Wait for initial values to load
        await page.waitForTimeout(2000)
        
        const initialMinValue = await minPriceInput.inputValue()
        const initialMaxValue = await maxPriceInput.inputValue()
        
        // Interact with other filters to trigger potential rerenders
        const selectElements = page.locator('.MuiSelect-root')
        const selectCount = await selectElements.count()
        
        if (selectCount > 0) {
          const firstSelect = selectElements.first()
          await firstSelect.click()
          
          const menuItems = page.locator('.MuiMenuItem-root')
          const menuCount = await menuItems.count()
          
          if (menuCount > 0) {
            await menuItems.first().click()
          }
        }
        
        // Check if price values remained stable
        await page.waitForTimeout(1000)
        
        const afterInteractionMinValue = await minPriceInput.inputValue()
        const afterInteractionMaxValue = await maxPriceInput.inputValue()
        
        // Values should not have changed due to other filter interactions
        expect(afterInteractionMinValue).toBe(initialMinValue)
        expect(afterInteractionMaxValue).toBe(initialMaxValue)
      })

      test('no excessive rerenders during filter initialization', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Track component rerenders by monitoring value changes
        const valueChanges: { time: number; minValue: string; maxValue: string }[] = []
        
        await page.goto(`http://localhost:5176${route}`)
        
        // Monitor price field changes
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        // Wait for fields to appear
        await page.waitForSelector('input[label="Min"], input[label="Max"]', { timeout: 10000 })
        
        // Monitor value changes over time
        const startTime = Date.now()
        for (let i = 0; i < 10; i++) {
          await page.waitForTimeout(300)
          
          const minValue = await minPriceInput.inputValue().catch(() => '')
          const maxValue = await maxPriceInput.inputValue().catch(() => '')
          
          valueChanges.push({
            time: Date.now() - startTime,
            minValue,
            maxValue
          })
        }
        
        // Analyze the changes
        const uniqueStates = new Set(valueChanges.map(change => 
          `${change.minValue}-${change.maxValue}`
        ))
        
        console.log('Value changes over time:', valueChanges)
        console.log('Unique states:', Array.from(uniqueStates))
        
        // Should not have excessive state changes (more than 3 different states suggests issues)
        expect(uniqueStates.size).toBeLessThanOrEqual(3)
        
        // Final state should not be 0,0 if there are products
        const hasProducts = await page.locator('.product-card, [data-testid="product-card"]').count() > 0
        const finalState = valueChanges[valueChanges.length - 1]
        
        if (hasProducts) {
          expect(finalState.minValue).not.toBe('0')
          expect(finalState.maxValue).not.toBe('0')
        }
      })

      test('mobile modal price fields initialize correctly', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Open filter modal
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Price fields should initialize with proper values
        const minPriceInput = filterModal.locator('input[label="Min"]').first()
        const maxPriceInput = filterModal.locator('input[label="Max"]').first()
        
        await page.waitForTimeout(1000)
        
        const minValue = await minPriceInput.inputValue()
        const maxValue = await maxPriceInput.inputValue()
        
        console.log(`Mobile modal values: Min=${minValue}, Max=${maxValue}`)
        
        // Check if there are products
        await page.keyboard.press('Escape') // Close modal to check for products
        await expect(filterModal).not.toBeVisible()
        
        const hasProducts = await page.locator('.product-card, [data-testid="product-card"]').count() > 0
        
        if (hasProducts) {
          expect(minValue).not.toBe('0')
          expect(maxValue).not.toBe('0')
          expect(parseInt(minValue) || 0).toBeLessThan(parseInt(maxValue) || 0)
        }
      })

      test('filter state synchronization between components', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        // Wait for initialization
        await page.waitForTimeout(2000)
        
        // Set custom price range
        await minPriceInput.click()
        await minPriceInput.clear()
        await minPriceInput.fill('50')
        
        await maxPriceInput.click()
        await maxPriceInput.clear()
        await maxPriceInput.fill('200')
        
        // Apply filters
        const applyButton = page.getByRole('button', { name: /aplică filtrele/i })
        if (await applyButton.isVisible()) {
          await applyButton.click()
          await page.waitForTimeout(2000)
        }
        
        // Verify values are maintained after apply
        const appliedMinValue = await minPriceInput.inputValue()
        const appliedMaxValue = await maxPriceInput.inputValue()
        
        expect(appliedMinValue).toBe('50')
        expect(appliedMaxValue).toBe('200')
        
        // Switch to mobile view and back to test consistency
        await page.setViewportSize({ width: 360, height: 640 })
        await page.waitForTimeout(1000)
        
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.waitForTimeout(1000)
        
        // Values should still be preserved
        const preservedMinValue = await minPriceInput.inputValue()
        const preservedMaxValue = await maxPriceInput.inputValue()
        
        expect(preservedMinValue).toBe('50')
        expect(preservedMaxValue).toBe('200')
      })

      test('no console errors during filter interactions', async ({ page }) => {
        const consoleErrors: string[] = []
        
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text())
          }
        })
        
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Perform various filter interactions
        const minPriceInput = page.locator('input[label="Min"]').first()
        const maxPriceInput = page.locator('input[label="Max"]').first()
        
        if (await minPriceInput.isVisible()) {
          await minPriceInput.click()
          await minPriceInput.clear()
          await minPriceInput.fill('100')
        }
        
        if (await maxPriceInput.isVisible()) {
          await maxPriceInput.click()
          await maxPriceInput.clear()
          await maxPriceInput.fill('500')
        }
        
        // Try to interact with other filter elements
        const selectElements = page.locator('.MuiSelect-root')
        const selectCount = await selectElements.count()
        
        if (selectCount > 0) {
          const firstSelect = selectElements.first()
          await firstSelect.click()
          await page.keyboard.press('Escape')
        }
        
        const radioButtons = page.locator('.MuiRadio-root')
        const radioCount = await radioButtons.count()
        
        if (radioCount > 0) {
          await radioButtons.first().click()
        }
        
        // Apply filters
        const applyButton = page.getByRole('button', { name: /aplică filtrele/i })
        if (await applyButton.isVisible()) {
          await applyButton.click()
          await page.waitForTimeout(2000)
        }
        
        // Filter console errors to ignore non-critical warnings
        const criticalErrors = consoleErrors.filter(error => 
          !error.includes('Warning:') && 
          !error.includes('deprecated') &&
          !error.includes('ReactDOM.render')
        )
        
        console.log('Console errors during test:', criticalErrors)
        
        // Should have no critical console errors
        expect(criticalErrors.length).toBe(0)
      })
    })
  }
})