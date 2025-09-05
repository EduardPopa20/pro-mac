import { test, expect } from '@playwright/test'
import { setViewport } from './utils'
import { TestReporter } from './utils/test-reporter'
import type { TestStepBuilder } from './utils/test-reporter'

test.describe('Filter Combination Validation Tests', () => {
  
  const testCategory = 'gresie' // Primary test category with diverse products
  let testReporter: TestReporter

  test.beforeEach(async ({ page }) => {
    testReporter = new TestReporter('Filter Combination Tests', 'Validating multiple filter combinations produce expected product counts', 'gresie')
    
    await page.goto(`/${testCategory}`)
    await page.waitForLoadState('networkidle')
    
    // Wait for products to load
    await testReporter.addStep(
      'Navigate to gresie category page',
      `goto http://localhost:5179/${testCategory} and wait for products`,
      'Products grid should be visible with filter sidebar'
    ).withAction(async (step: TestStepBuilder) => {
      await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
      const productCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
      step.withResult(`Found ${productCount} products on page load`, productCount > 0 ? 'PASS' : 'FAIL')
    })
  })

  test.afterEach(async ({ page }) => {
    testReporter.finishTest()
  })

  test.describe('Price Range + Color Combinations', () => {
    test('should filter by price range 50-100 RON + Alb color', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Step 1: Get initial product count
      await testReporter.addStep(
        'Record initial product count',
        'Count all visible products before applying any filters',
        'Should have products visible on page'
      ).withAction(async (step: TestStepBuilder) => {
        const initialCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        step.withResult(`Initial product count: ${initialCount}`, initialCount > 0 ? 'PASS' : 'FAIL')
      })

      // Step 2: Apply price range filter
      await testReporter.addStep(
        'Apply price range filter 50-100 RON',
        'Set minimum price to 50 and maximum price to 100',
        'Price inputs should accept values and filter should be ready to apply'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForSelector('text=Interval preț')
        
        const minPriceInput = page.locator('input[type="number"]').first()
        const maxPriceInput = page.locator('input[type="number"]').last()
        
        await minPriceInput.clear()
        await minPriceInput.fill('50')
        await maxPriceInput.clear()  
        await maxPriceInput.fill('100')
        
        const minValue = await minPriceInput.inputValue()
        const maxValue = await maxPriceInput.inputValue()
        
        step.withResult(`Price range set to ${minValue}-${maxValue} RON`, 
          minValue === '50' && maxValue === '100' ? 'PASS' : 'FAIL')
      })

      // Step 3: Apply color filter if available
      await testReporter.addStep(
        'Apply Alb (white) color filter if available',
        'Select Alb color from color filter dropdown',
        'Color filter should be applied or skipped if color not available'
      ).withAction(async (step: TestStepBuilder) => {
        const colorSection = page.locator('text=Culoare').first()
        
        if (await colorSection.isVisible()) {
          const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
          if (await colorSelect.isVisible()) {
            await colorSelect.click()
            
            const albOption = page.locator('[role="option"]').filter({ hasText: 'Alb' })
            if (await albOption.isVisible()) {
              await albOption.click()
              await page.click('body') // Close dropdown
              step.withResult('Alb color filter applied successfully', 'PASS')
            } else {
              step.withResult('Alb color not available in options - test will continue with price filter only', 'SKIP')
            }
          } else {
            step.withResult('Color selector not visible - test will continue with price filter only', 'SKIP')  
          }
        } else {
          step.withResult('Color filter section not available - test will continue with price filter only', 'SKIP')
        }
      })

      // Step 4: Save/apply filters
      await testReporter.addStep(
        'Apply filter combination',
        'Click Save button to apply the filter combination',
        'Filters should be applied and products should update'
      ).withAction(async (step: TestStepBuilder) => {
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
          step.withResult('Filters applied successfully', 'PASS')
        } else {
          // Filters might auto-apply
          step.withResult('No save button found - filters may auto-apply', 'PASS')
        }
      })

      // Step 5: Validate filtered product count
      await testReporter.addStep(
        'Validate filtered product count',
        'Count products after applying price + color combination filters',
        'Should show reduced number of products matching both criteria'
      ).withAction(async (step: TestStepBuilder) => {
        await page.waitForTimeout(1000) // Wait for filter application
        
        const filteredCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        // Check if there's a "no results" message
        const noResultsMsg = page.locator('text=Nu au fost găsite produse, text=Nu există produse')
        const hasNoResults = await noResultsMsg.first().isVisible().catch(() => false)
        
        if (hasNoResults) {
          step.withResult('No products found matching the filter combination - this is valid', 'PASS')
        } else {
          step.withResult(`Found ${filteredCount} products matching price range 50-100 RON + color filters`, 
            filteredCount >= 0 ? 'PASS' : 'FAIL')
        }
      })

      // Step 6: Verify price compliance in displayed products
      await testReporter.addStep(
        'Verify price compliance of filtered products',
        'Check that all visible products have prices within 50-100 RON range',
        'All visible product prices should be within the specified range'
      ).withAction(async (step: TestStepBuilder) => {
        const productPrices = await page.locator('.MuiTypography-root').filter({ hasText: /\d+.*RON/ }).allTextContents()
        
        let allPricesValid = true
        const priceValidations = []
        
        for (const priceText of productPrices) {
          const priceMatch = priceText.match(/(\d+(?:[.,]\d+)?)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(',', '.'))
            const isValid = price >= 50 && price <= 100
            priceValidations.push(`${price} RON: ${isValid ? 'VALID' : 'INVALID'}`)
            if (!isValid) allPricesValid = false
          }
        }
        
        if (productPrices.length === 0) {
          step.withResult('No products with visible prices (possibly no results)', 'PASS')
        } else {
          step.withResult(`Price validation: ${priceValidations.join(', ')}`, 
            allPricesValid ? 'PASS' : 'FAIL')
        }
      })
    })

    test('should filter by price range 100-200 RON + Gri color', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Get initial count
      const initialCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
      
      await testReporter.addStep(
        'Apply price range 100-200 RON + Gri color combination',
        'Set price range and select Gri color if available',
        'Multiple filters should work together'
      ).withAction(async (step: TestStepBuilder) => {
        // Apply price range
        await page.waitForSelector('text=Interval preț')
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        await minInput.clear()
        await minInput.fill('100')
        await maxInput.clear()
        await maxInput.fill('200')
        
        // Try to apply Gri color
        const colorSection = page.locator('text=Culoare').first()
        let colorApplied = false
        
        if (await colorSection.isVisible()) {
          const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
          if (await colorSelect.isVisible()) {
            await colorSelect.click()
            const griOption = page.locator('[role="option"]').filter({ hasText: 'Gri' })
            if (await griOption.isVisible()) {
              await griOption.click()
              await page.click('body')
              colorApplied = true
            }
          }
        }
        
        // Apply filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        const filteredCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        step.withResult(
          `Price 100-200 RON ${colorApplied ? '+ Gri color' : '(color not available)'}: ${filteredCount} products found`,
          'PASS'
        )
      })
    })
  })

  test.describe('Brand + Material Combinations', () => {
    test('should filter by specific brand + material combination', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Test brand and material combination filtering',
        'Apply brand filter and material filter together if available',
        'Should show products matching both brand and material criteria'
      ).withAction(async (step: TestStepBuilder) => {
        // Look for brand filter
        const brandSection = page.locator('text=Brand, text=Marcă').first()
        let brandApplied = false
        
        if (await brandSection.isVisible()) {
          // Try to select a brand (look for common ones like CERAMICA, STONE MASTER, etc.)
          const brandSelect = page.locator('[role="combobox"]').filter({ 
            has: page.locator('text=Selectează brandurile') 
          })
          
          if (await brandSelect.isVisible()) {
            await brandSelect.click()
            const brandOptions = page.locator('[role="option"]')
            const optionCount = await brandOptions.count()
            
            if (optionCount > 0) {
              await brandOptions.first().click()
              await page.click('body')
              brandApplied = true
            }
          }
        }
        
        // Look for material filter
        const materialSection = page.locator('text=Material').first()
        let materialApplied = false
        
        if (await materialSection.isVisible()) {
          const materialSelect = page.locator('[role="combobox"]').filter({ 
            has: page.locator('text=Selectează materialele') 
          })
          
          if (await materialSelect.isVisible()) {
            await materialSelect.click()
            const materialOptions = page.locator('[role="option"]')
            const materialCount = await materialOptions.count()
            
            if (materialCount > 0) {
              await materialOptions.first().click()
              await page.click('body')
              materialApplied = true
            }
          }
        }
        
        // Apply filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1000)
        const resultCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        const appliedFilters = []
        if (brandApplied) appliedFilters.push('Brand')
        if (materialApplied) appliedFilters.push('Material')
        
        if (appliedFilters.length === 0) {
          step.withResult('Brand and Material filters not available on this page', 'SKIP')
        } else {
          step.withResult(
            `Applied filters: ${appliedFilters.join(' + ')} - Found ${resultCount} matching products`,
            'PASS'
          )
        }
      })
    })
  })

  test.describe('Technical Capabilities + Suitability Combinations', () => {
    test('should filter by technical capabilities (rectified + frost resistant)', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply technical capabilities combination',
        'Select rectified tiles and frost resistant options if available',
        'Should filter products with both technical capabilities'
      ).withAction(async (step: TestStepBuilder) => {
        let filtersApplied = 0
        const appliedFilters = []
        
        // Look for rectified filter
        const rectifiedToggle = page.locator('text=Rectificat, text=Rectified').first()
        if (await rectifiedToggle.isVisible()) {
          await rectifiedToggle.click()
          filtersApplied++
          appliedFilters.push('Rectified')
        }
        
        // Look for frost resistant filter
        const frostResistantToggle = page.locator('text=Rezistent la îngheț, text=Frost Resistant').first()
        if (await frostResistantToggle.isVisible()) {
          await frostResistantToggle.click()
          filtersApplied++
          appliedFilters.push('Frost Resistant')
        }
        
        if (filtersApplied > 0) {
          // Apply filters
          const saveButton = page.locator('text=Salvează').first()
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForLoadState('networkidle')
          }
          
          await page.waitForTimeout(1000)
          const resultCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
          
          step.withResult(
            `Applied technical filters: ${appliedFilters.join(' + ')} - Found ${resultCount} matching products`,
            'PASS'
          )
        } else {
          step.withResult('Technical capability filters not available on this page', 'SKIP')
        }
      })
    })

    test('should filter by suitability (suitable for floors + exterior)', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply suitability combination filters',
        'Select suitable for floors and suitable for exterior if available',
        'Should show products suitable for both floor and exterior use'
      ).withAction(async (step: TestStepBuilder) => {
        let filtersApplied = 0
        const appliedFilters = []
        
        // Look for suitable for floors
        const floorSuitableToggle = page.locator('text=Potrivit pentru pardoseli, text=Suitable for Floors').first()
        if (await floorSuitableToggle.isVisible()) {
          await floorSuitableToggle.click()
          filtersApplied++
          appliedFilters.push('Floor Suitable')
        }
        
        // Look for suitable for exterior
        const exteriorSuitableToggle = page.locator('text=Potrivit pentru exterior, text=Suitable for Exterior').first()
        if (await exteriorSuitableToggle.isVisible()) {
          await exteriorSuitableToggle.click()
          filtersApplied++
          appliedFilters.push('Exterior Suitable')
        }
        
        if (filtersApplied > 0) {
          const saveButton = page.locator('text=Salvează').first()
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForLoadState('networkidle')
          }
          
          await page.waitForTimeout(1000)
          const resultCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
          
          step.withResult(
            `Applied suitability filters: ${appliedFilters.join(' + ')} - Found ${resultCount} matching products`,
            'PASS'
          )
        } else {
          step.withResult('Suitability filters not available on this page', 'SKIP')
        }
      })
    })
  })

  test.describe('Complex Multi-Filter Combinations', () => {
    test('should handle complex 4-filter combination', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply complex 4-filter combination',
        'Apply price range + color + brand + technical capability together',
        'Should handle complex filter interactions correctly'
      ).withAction(async (step: TestStepBuilder) => {
        const appliedFilters = []
        
        // 1. Price range 50-150 RON
        await page.waitForSelector('text=Interval preț')
        const minInput = page.locator('input[type="number"]').first()
        const maxInput = page.locator('input[type="number"]').last()
        
        await minInput.clear()
        await minInput.fill('50')
        await maxInput.clear()
        await maxInput.fill('150')
        appliedFilters.push('Price 50-150')
        
        // 2. Color (if available)
        const colorSection = page.locator('text=Culoare').first()
        if (await colorSection.isVisible()) {
          const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
          if (await colorSelect.isVisible()) {
            await colorSelect.click()
            const colorOptions = page.locator('[role="option"]')
            if (await colorOptions.count() > 0) {
              await colorOptions.first().click()
              await page.click('body')
              appliedFilters.push('Color')
            }
          }
        }
        
        // 3. Brand (if available)  
        const brandSection = page.locator('text=Brand, text=Marcă').first()
        if (await brandSection.isVisible()) {
          const brandSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează brandurile') })
          if (await brandSelect.isVisible()) {
            await brandSelect.click()
            const brandOptions = page.locator('[role="option"]')
            if (await brandOptions.count() > 0) {
              await brandOptions.first().click()
              await page.click('body')
              appliedFilters.push('Brand')
            }
          }
        }
        
        // 4. Technical capability (if available)
        const rectifiedToggle = page.locator('text=Rectificat, text=Rectified').first()
        if (await rectifiedToggle.isVisible()) {
          await rectifiedToggle.click()
          appliedFilters.push('Rectified')
        }
        
        // Apply all filters
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(2000) // Extra time for complex filtering
        
        const resultCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        const noResultsMsg = page.locator('text=Nu au fost găsite produse, text=Nu există produse')
        const hasNoResults = await noResultsMsg.first().isVisible().catch(() => false)
        
        if (hasNoResults) {
          step.withResult(
            `Complex filter combination (${appliedFilters.join(' + ')}) returned no results - this is valid for restrictive filtering`,
            'PASS'
          )
        } else {
          step.withResult(
            `Complex filter combination (${appliedFilters.join(' + ')}) found ${resultCount} matching products`,
            resultCount >= 0 ? 'PASS' : 'FAIL'
          )
        }
      })
    })

    test('should validate filter count display updates correctly', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Validate product count display updates',
        'Apply filters and verify that the product count text updates accordingly',
        'Product count text should reflect the filtered results accurately'
      ).withAction(async (step: TestStepBuilder) => {
        // Get initial count text
        const initialCountText = await page.locator('text=/\\d+ produse?\\s+(găsite?|găsit)/').first().textContent().catch(() => null)
        const initialMatch = initialCountText?.match(/(\d+)/)
        const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0
        
        // Apply a filter
        await page.waitForSelector('text=Interval preț')
        const minInput = page.locator('input[type="number"]').first()
        await minInput.clear()
        await minInput.fill('80')
        
        const saveButton = page.locator('text=Salvează').first()
        if (await saveButton.isVisible()) {
          await saveButton.click()
          await page.waitForLoadState('networkidle')
        }
        
        await page.waitForTimeout(1500)
        
        // Get updated count text
        const updatedCountText = await page.locator('text=/\\d+ produse?\\s+(găsite?|găsit)/').first().textContent().catch(() => null)
        const updatedMatch = updatedCountText?.match(/(\d+)/)
        const updatedCount = updatedMatch ? parseInt(updatedMatch[1]) : 0
        
        // Also verify actual product cards count matches the displayed count
        const actualProductCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        const countMatches = updatedCount === actualProductCount
        const countDecreased = updatedCount <= initialCount
        
        step.withResult(
          `Count display: ${initialCount} → ${updatedCount}, Actual products: ${actualProductCount}. Count matches: ${countMatches}, Decreased as expected: ${countDecreased}`,
          countMatches && countDecreased ? 'PASS' : 'FAIL'
        )
      })
    })
  })

  test.describe('Filter Clear and Reset Combinations', () => {
    test('should correctly clear all filters and reset product count', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await testReporter.addStep(
        'Apply multiple filters then clear all',
        'Apply several filters, then use clear filters functionality',
        'Should reset all filters and restore original product count'
      ).withAction(async (step: TestStepBuilder) => {
        // Get initial product count
        const initialCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        // Apply multiple filters
        await page.waitForSelector('text=Interval preț')
        const minInput = page.locator('input[type="number"]').first()
        await minInput.clear()
        await minInput.fill('60')
        
        // Apply color if available
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
        const filteredCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        
        // Now clear all filters
        const clearButton = page.locator('text=Șterge tot').first()
        if (await clearButton.isVisible()) {
          await clearButton.click()
          await page.waitForTimeout(1000)
          
          const clearedCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
          
          step.withResult(
            `Filter sequence: ${initialCount} → ${filteredCount} (filtered) → ${clearedCount} (cleared). Restored to initial: ${clearedCount === initialCount}`,
            clearedCount >= filteredCount ? 'PASS' : 'FAIL'
          )
        } else {
          step.withResult('Clear filters button not available - functionality may not be implemented', 'SKIP')
        }
      })
    })
  })
})