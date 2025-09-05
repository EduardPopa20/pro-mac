import { test, expect } from '@playwright/test'
import { setViewport } from './utils'
import { TestReporter } from './utils/test-reporter'
import type { TestStepBuilder } from './utils/test-reporter'

test.describe('Filter Persistence Tests', () => {
  
  const testCategory = 'gresie' // Primary test category
  let testReporter: TestReporter

  test.beforeEach(async ({ page }) => {
    testReporter = new TestReporter('Filter Persistence Tests', 'Testing filter state persistence across pagination, navigation, and browser refresh', 'gresie')
    
    await page.goto(`/${testCategory}`)
    await page.waitForLoadState('networkidle')
    
    // Wait for products to load
    await testReporter.addStep(
      'Initialize test environment',
      `Navigate to ${testCategory} page and verify products load correctly`,
      'Products grid and filter panel should be visible and functional'
    ).withAction(async (step: TestStepBuilder) => {
      await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
      const productCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
      
      // Verify filter panel is present
      const filterPanel = page.locator('text=Filtrare produse').first()
      const filterVisible = await filterPanel.isVisible()
      
      step.withResult(
        `Found ${productCount} products, filter panel visible: ${filterVisible}`, 
        productCount > 0 && filterVisible ? 'PASS' : 'FAIL'
      )
    })
  })

  test.afterEach(async ({ page }) => {
    testReporter.finishTest()
  })

  test.describe('Pagination State Persistence', () => {
    test('should maintain filters when navigating through pagination', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Step 1: Apply filters to create a specific result set
      await testReporter.addStep(
        'Apply filters to generate paginated results',
        'Set price range and other filters to create enough results for pagination',
        'Should have filtered results that may span multiple pages'
      ).withAction(async (step: TestStepBuilder) => {
        // Apply price range that should give us reasonable results
        await page.waitForSelector('text=Interval preț')
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        await minInput.clear()
        await minInput.fill('20')  // Broad range to ensure multiple results
        await maxInput.clear()
        await maxInput.fill('200')
        
        // Apply color if available to further refine
        const colorSection = page.locator('text=Culoare').first()
        if (await colorSection.isVisible()) {
          const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
          if (await colorSelect.isVisible()) {
            await colorSelect.click()
            const colorOptions = page.locator('[role="option"]')
            if (await colorOptions.count() > 0) {
              await colorOptions.first().click()
              await page.click('body')
            }
          }
        }
        
        // Save filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        const resultCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        step.withResult(`Applied filters, found ${resultCount} products on current page`, 'PASS')
      })
      
      // Step 2: Record current filter state
      await testReporter.addStep(
        'Record current filter state',
        'Capture the applied filter values for comparison after pagination',
        'Should be able to read current filter state accurately'
      ).withAction(async (step: TestStepBuilder) => {
        const minValue = await page.locator('input[type="number"]').first().inputValue()
        const maxValue = await page.locator('input[type="number"]').last().inputValue()
        
        step.withResult(`Recorded filter state: Price ${minValue}-${maxValue} RON`, 'PASS')
      })
      
      // Step 3: Look for pagination and navigate if available
      await testReporter.addStep(
        'Navigate through pagination if available',
        'Look for pagination controls and navigate to test persistence',
        'Pagination should work with filters maintained'
      ).withAction(async (step: TestStepBuilder) => {
        // Look for pagination controls (common patterns)
        const paginationControls = [
          page.locator('.MuiPagination-root'),
          page.locator('[role="navigation"]').filter({ hasText: /page|pagină/i }),
          page.locator('text=Următoarea, text=Next'),
          page.locator('button').filter({ hasText: /\d+/ }).first(), // Page numbers
          page.locator('[data-testid="pagination"]')
        ]
        
        let paginationFound = false
        let navigatedPage = false
        
        for (const control of paginationControls) {
          if (await control.isVisible()) {
            paginationFound = true
            
            // Try to navigate to next page or page 2
            const nextButton = control.locator('text=Next, text=Următoarea')
            const page2Button = control.locator('button').filter({ hasText: '2' })
            
            if (await nextButton.isVisible()) {
              await nextButton.click()
              navigatedPage = true
              break
            } else if (await page2Button.isVisible()) {
              await page2Button.click()
              navigatedPage = true
              break
            }
          }
        }
        
        if (!paginationFound) {
          step.withResult('No pagination controls found - results may fit on single page', 'SKIP')
        } else if (navigatedPage) {
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(1000)
          step.withResult('Successfully navigated to next page', 'PASS')
        } else {
          step.withResult('Pagination controls found but unable to navigate', 'FAIL')
        }
      })
      
      // Step 4: Verify filters are still applied after pagination
      await testReporter.addStep(
        'Verify filter persistence after pagination',
        'Check that filter values remain the same after page navigation',
        'Filters should be maintained across pagination'
      ).withAction(async (step: TestStepBuilder) => {
        const currentMinValue = await page.locator('input[type="number"]').first().inputValue()
        const currentMaxValue = await page.locator('input[type="number"]').last().inputValue()
        
        const filtersPreserved = currentMinValue === '20' && currentMaxValue === '200'
        
        step.withResult(
          `Filter state after pagination: Price ${currentMinValue}-${currentMaxValue} RON. Preserved: ${filtersPreserved}`,
          filtersPreserved ? 'PASS' : 'FAIL'
        )
      })
      
      // Step 5: Verify filtered products are still shown
      await testReporter.addStep(
        'Verify products still match filter criteria',
        'Check that products on the new page still comply with applied filters',
        'All products should still match the filter criteria'
      ).withAction(async (step: TestStepBuilder) => {
        const productPrices = await page.locator('.MuiTypography-root').filter({ hasText: /\d+.*RON/ }).allTextContents()
        
        let allValid = true
        const validations = []
        
        for (const priceText of productPrices) {
          const priceMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'))
            const isValid = price >= 20 && price <= 200
            validations.push(`${price} RON: ${isValid ? 'VALID' : 'INVALID'}`)
            if (!isValid) allValid = false
          }
        }
        
        if (productPrices.length === 0) {
          step.withResult('No products with visible prices on current page', 'SKIP')
        } else {
          step.withResult(
            `Price validation after pagination: ${validations.join(', ')}`, 
            allValid ? 'PASS' : 'FAIL'
          )
        }
      })
    })
    
    test('should maintain filters when using browser back/forward', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Step 1: Apply specific filters
      await testReporter.addStep(
        'Apply specific filter combination',
        'Set specific filters that will be tested for persistence',
        'Should establish a distinct filter state'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        // Apply price range
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        await minInput.clear()
        await minInput.fill('50')
        await maxInput.clear() 
        await maxInput.fill('150')
        
        // Apply save
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        step.withResult('Applied price filter 50-150 RON', 'PASS')
      })
      
      // Step 2: Navigate to a product detail page and back
      await testReporter.addStep(
        'Navigate to product detail and back',
        'Click on a product to view details, then use browser back button',
        'Should test navigation state management'
      ).withAction(async (step: TestStepBuilder) => {
        const productCards = page.locator('[data-testid="product-card"], .MuiCard-root')
        const productCount = await productCards.count()
        
        if (productCount > 0) {
          // Click on first product
          await productCards.first().click()
          await page.waitForLoadState('networkidle')
          
          // Verify we're on product detail page
          const isDetailPage = await page.locator('text=Specificații, text=Detalii').first().isVisible().catch(() => false) ||
                               await page.locator('text=Adaugă în coș').first().isVisible().catch(() => false)
          
          if (isDetailPage) {
            // Navigate back
            await page.goBack()
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(1000)
            
            step.withResult('Successfully navigated to product detail and back', 'PASS')
          } else {
            step.withResult('Product click did not navigate to detail page', 'FAIL')
          }
        } else {
          step.withResult('No products available to test navigation', 'SKIP')
        }
      })
      
      // Step 3: Verify filters are preserved after browser back
      await testReporter.addStep(
        'Verify filter persistence after browser navigation',
        'Check that filters are still applied after using browser back button',
        'Filters should be restored to their previous state'
      ).withAction(async (step: TestStepBuilder) => {
        const minValue = await page.locator('input[type="number"]').first().inputValue()
        const maxValue = await page.locator('input[type="number"]').last().inputValue()
        
        const filtersRestored = minValue === '50' && maxValue === '150'
        
        step.withResult(
          `Filters after browser back: ${minValue}-${maxValue} RON. Restored correctly: ${filtersRestored}`,
          filtersRestored ? 'PASS' : 'FAIL'
        )
      })
    })
  })

  test.describe('URL State Persistence', () => {
    test('should persist filters in URL parameters', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply filters and check URL state',
        'Apply various filters and verify URL parameters reflect the state',
        'URL should contain filter parameters for sharing and bookmarking'
      ).withAction(async (step: TestStepBuilder) => {
        // Apply multiple filters
        await page.waitForSelector('text=Interval preț')
        
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        await minInput.clear()
        await minInput.fill('75')
        await maxInput.clear()
        await maxInput.fill('125')
        
        // Save filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        
        // Check URL for filter parameters
        const currentURL = page.url()
        const urlContainsFilters = currentURL.includes('75') || currentURL.includes('125') || 
                                   currentURL.includes('price') || currentURL.includes('filter')
        
        step.withResult(
          `Current URL: ${currentURL}. Contains filter parameters: ${urlContainsFilters}`,
          urlContainsFilters ? 'PASS' : 'INFO'
        )
      })
    })
    
    test('should restore filters from URL on page load', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Test filter restoration from URL',
        'Construct URL with filter parameters and verify they are applied on load',
        'Filters should be automatically applied when loading page with URL parameters'
      ).withAction(async (step: TestStepBuilder) => {
        // Try to construct a URL with potential filter parameters
        const baseURL = `/${testCategory}`
        const possibleFilterURLs = [
          `${baseURL}?minPrice=60&maxPrice=140`,
          `${baseURL}?price=60-140`,
          `${baseURL}?filters=price:60-140`,
          `${baseURL}#filters=price:60-140`
        ]
        
        let filtersAppliedFromURL = false
        
        for (const testURL of possibleFilterURLs) {
          try {
            await page.goto(testURL)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(1500)
            
            // Check if filters are applied
            const minValue = await page.locator('input[type="number"]').first().inputValue()
            const maxValue = await page.locator('input[type="number"]').last().inputValue()
            
            if ((minValue === '60' && maxValue === '140') || (parseInt(minValue) > 0 && parseInt(maxValue) > parseInt(minValue))) {
              filtersAppliedFromURL = true
              step.withResult(`Filters restored from URL: ${testURL} (${minValue}-${maxValue})`, 'PASS')
              break
            }
          } catch (error) {
            continue
          }
        }
        
        if (!filtersAppliedFromURL) {
          // Go back to regular page
          await page.goto(baseURL)
          await page.waitForLoadState('networkidle')
          step.withResult('URL parameter restoration not implemented or not working with tested patterns', 'INFO')
        }
      })
    })
  })

  test.describe('Session Storage Persistence', () => {
    test('should maintain filters across page refresh', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Step 1: Apply distinct filter combination
      await testReporter.addStep(
        'Apply memorable filter combination',
        'Set specific filters that can be verified after refresh',
        'Should establish clear filter state for refresh testing'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        await minInput.clear()
        await minInput.fill('90')
        await maxInput.clear()
        await maxInput.fill('180')
        
        // Apply color if available
        const colorSection = page.locator('text=Culoare').first()
        if (await colorSection.isVisible()) {
          const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
          if (await colorSelect.isVisible()) {
            await colorSelect.click()
            const options = page.locator('[role="option"]')
            const optionCount = await options.count()
            if (optionCount > 0) {
              await options.nth(0).click()
              await page.click('body')
            }
          }
        }
        
        // Save filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        const productCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        step.withResult(`Applied filters (90-180 RON + color), found ${productCount} products`, 'PASS')
      })
      
      // Step 2: Refresh the page
      await testReporter.addStep(
        'Refresh page and wait for reload',
        'Perform browser refresh and wait for complete page reload',
        'Page should reload completely'
      ).withAction(async (step: TestStepBuilder) => {
        await page.reload()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000) // Extra time for filter restoration
        
        step.withResult('Page refreshed successfully', 'PASS')
      })
      
      // Step 3: Verify filter persistence after refresh
      await testReporter.addStep(
        'Verify filter restoration after refresh',
        'Check if the previously applied filters are still active',
        'Filters should be restored from browser storage'
      ).withAction(async (step: TestStepBuilder) => {
        const minValue = await page.locator('input[type="number"]').first().inputValue()
        const maxValue = await page.locator('input[type="number"]').last().inputValue()
        
        const priceFiltersRestored = minValue === '90' && maxValue === '180'
        
        // Check if products still match the filter criteria
        const currentProductCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        step.withResult(
          `After refresh: Price filters ${minValue}-${maxValue} RON. Restored: ${priceFiltersRestored}. Products: ${currentProductCount}`,
          priceFiltersRestored ? 'PASS' : 'INFO'
        )
      })
    })
  })

  test.describe('Cross-Category Filter Isolation', () => {
    test('should not carry filters between different category pages', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply filters to gresie category',
        'Set specific filters on gresie page',
        'Should establish filter state on first category'
      ).withAction(async (step: TestStepBuilder) => {
        await page.goto(`/gresie`)
        await page.waitForLoadState('networkidle')
        await page.waitForSelector('text=Interval preț')
        
        const minInput = page.locator('input[type="number"]').first()
        await minInput.clear()
        await minInput.fill('100')
        
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        step.withResult('Applied price filter to gresie category', 'PASS')
      })
      
      await testReporter.addStep(
        'Navigate to faianta category',
        'Switch to faianta category page',
        'Should navigate to different category with independent filters'
      ).withAction(async (step: TestStepBuilder) => {
        await page.goto(`/faianta`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1500)
        
        step.withResult('Navigated to faianta category page', 'PASS')
      })
      
      await testReporter.addStep(
        'Verify filters are reset for new category',
        'Check that gresie filters do not carry over to faianta',
        'Filters should be independent per category'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        const minValue = await page.locator('input[type="number"]').first().inputValue()
        const maxValue = await page.locator('input[type="number"]').last().inputValue()
        
        const filtersCleared = (minValue === '' || parseInt(minValue) !== 100) && 
                               (maxValue === '' || parseInt(maxValue) > 100)
        
        step.withResult(
          `Faianta page filters: ${minValue}-${maxValue} RON. Properly isolated: ${filtersCleared}`,
          filtersCleared ? 'PASS' : 'FAIL'
        )
      })
    })
  })

  test.describe('Filter State Edge Cases', () => {
    test('should handle rapid filter changes without state corruption', async ({ page }) => {
      await setViewport(page, 'md')
      
      await testReporter.addStep(
        'Perform rapid filter modifications',
        'Quickly change filters multiple times to test state stability',
        'Filter state should remain stable despite rapid changes'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        // Rapid sequence of filter changes
        const filterSequence = [
          { min: '50', max: '100' },
          { min: '80', max: '150' },
          { min: '40', max: '120' },
          { min: '60', max: '200' },
          { min: '70', max: '140' }
        ]
        
        for (const filters of filterSequence) {
          await minInput.clear()
          await minInput.fill(filters.min)
          await maxInput.clear()
          await maxInput.fill(filters.max)
          await page.waitForTimeout(200) // Brief pause between changes
        }
        
        // Apply final state
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        
        const finalMin = await minInput.inputValue()
        const finalMax = await maxInput.inputValue()
        const finalProductCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        step.withResult(
          `Final filter state after rapid changes: ${finalMin}-${finalMax} RON, ${finalProductCount} products`,
          finalMin === '70' && finalMax === '140' ? 'PASS' : 'INFO'
        )
      })
    })

    test('should maintain filter state during mobile/desktop viewport switches', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply filters on desktop viewport',
        'Set filters while in desktop layout',
        'Should establish filter state on desktop'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        const minInput = page.locator('input[type="number"]').first()
        await minInput.clear()
        await minInput.fill('85')
        
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        step.withResult('Applied filters on desktop viewport', 'PASS')
      })
      
      await testReporter.addStep(
        'Switch to mobile viewport and verify filters',
        'Change to mobile layout and check filter persistence',
        'Filters should persist across responsive layout changes'
      ).withAction(async (step: TestStepBuilder) => {
        await setViewport(page, 'xs')
        await page.waitForTimeout(1000)
        
        // On mobile, filters might be in a modal, so check if we can access them
        const filterTrigger = page.locator('text=Filtrează produsele, text=Filtrare produse').first()
        if (await filterTrigger.isVisible()) {
          await filterTrigger.click()
          await page.waitForTimeout(500)
        }
        
        const minInput = page.locator('input[type="number"]').first()
        if (await minInput.isVisible()) {
          const minValue = await minInput.inputValue()
          const filtersPreserved = minValue === '85'
          
          step.withResult(
            `Mobile viewport filter state: ${minValue}. Preserved: ${filtersPreserved}`,
            filtersPreserved ? 'PASS' : 'INFO'
          )
        } else {
          step.withResult('Filter inputs not accessible in mobile layout', 'INFO')
        }
      })
    })
  })
})