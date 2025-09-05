import { test, expect } from '@playwright/test'

/**
 * Tests for Da/No boolean properties converted to radio groups
 * Validates that boolean properties display as radio groups instead of dropdowns
 * and function correctly without losing focus or triggering menu issues
 */

test.describe('Filter Da/No Radio Groups', () => {
  const testRoutes = ['/gresie', '/faianta']

  for (const route of testRoutes) {
    test.describe(`${route} page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Wait for filters to load
        await page.waitForSelector('[data-testid="filter-section"], .filter-content', { timeout: 10000 })
      })

      test('boolean properties display as radio groups on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Look for boolean properties that should be radio groups
        // These typically include: is_rectified, is_frost_resistant, is_floor_heating_compatible,
        // suitable_for_walls, suitable_for_floors, suitable_for_exterior, suitable_for_commercial
        
        const booleanProperties = [
          'rectificat', 'rezistent', 'incalzire', 'pereti', 'pardosea', 'exterior', 'comercial'
        ]
        
        let foundRadioGroups = false
        
        for (const property of booleanProperties) {
          // Look for radio groups containing Da/Nu options
          const radioGroup = page.locator(`[role="radiogroup"]:has-text("${property}"), .MuiRadioGroup-root:near(:text("${property}"))`)
          
          if (await radioGroup.count() > 0) {
            foundRadioGroups = true
            
            // Verify it contains Da/Nu options
            const daOption = radioGroup.locator('input[value="true"], input[value="da"], :text("Da")')
            const nuOption = radioGroup.locator('input[value="false"], input[value="nu"], :text("Nu")')
            const toateOption = radioGroup.locator('input[value=""], :text("Toate")')
            
            // At minimum should have "Toate" option
            await expect(toateOption.first()).toBeVisible()
            
            if (await daOption.count() > 0) {
              await expect(daOption.first()).toBeVisible()
            }
            
            if (await nuOption.count() > 0) {
              await expect(nuOption.first()).toBeVisible()
            }
            
            // Verify it's NOT a select dropdown
            const selectDropdown = page.locator(`select:near(:text("${property}")), .MuiSelect-root:near(:text("${property}"))`).first()
            if (await selectDropdown.count() > 0) {
              // If there's a select, it should not contain boolean Da/Nu options
              await selectDropdown.click()
              const hasBoolean = await page.locator('.MuiMenuItem-root:text("Da"), .MuiMenuItem-root:text("Nu")').count()
              expect(hasBoolean).toBe(0)
              
              // Close the dropdown
              await page.keyboard.press('Escape')
            }
          }
        }
        
        // If we found any boolean properties, they should be radio groups
        if (foundRadioGroups) {
          console.log('✓ Found boolean properties displayed as radio groups')
        }
      })

      test('boolean properties display as radio groups on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        
        // Open mobile filter modal
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await expect(filterButton).toBeVisible()
        await filterButton.click()
        
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()
        
        // Look for radio groups within the modal
        const radioGroups = filterModal.locator('.MuiRadioGroup-root')
        const radioGroupCount = await radioGroups.count()
        
        if (radioGroupCount > 0) {
          for (let i = 0; i < radioGroupCount; i++) {
            const radioGroup = radioGroups.nth(i)
            
            // Each radio group should have at least "Toate" option
            const toateOption = radioGroup.locator('input[value=""], :text("Toate")')
            if (await toateOption.count() > 0) {
              await expect(toateOption.first()).toBeVisible()
            }
            
            // Verify radio buttons are properly sized for mobile (≥44px touch target)
            const radioButtons = radioGroup.locator('.MuiRadio-root')
            const radioButtonCount = await radioButtons.count()
            
            if (radioButtonCount > 0) {
              const firstRadio = radioButtons.first()
              const radioBox = await firstRadio.boundingBox()
              
              if (radioBox) {
                expect(radioBox.width).toBeGreaterThanOrEqual(44)
                expect(radioBox.height).toBeGreaterThanOrEqual(44)
              }
            }
          }
        }
        
        // Close modal
        const closeButton = filterModal.getByRole('button', { name: /close/i })
        await closeButton.click()
      })

      test('radio group interactions work correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Find a radio group
        const radioGroups = page.locator('.MuiRadioGroup-root')
        const radioGroupCount = await radioGroups.count()
        
        if (radioGroupCount > 0) {
          const firstRadioGroup = radioGroups.first()
          
          // Get all radio options in this group
          const radioOptions = firstRadioGroup.locator('input[type="radio"]')
          const optionCount = await radioOptions.count()
          
          if (optionCount > 1) {
            // Test selecting different options
            for (let i = 0; i < Math.min(optionCount, 3); i++) {
              const option = radioOptions.nth(i)
              
              if (await option.isVisible()) {
                await option.click()
                
                // Verify option is selected
                const isChecked = await option.isChecked()
                expect(isChecked).toBe(true)
                
                // Verify clicking doesn't interfere with hamburger menu
                const drawer = page.locator('.MuiDrawer-root')
                const isDrawerVisible = await drawer.isVisible()
                expect(isDrawerVisible).toBe(false)
              }
            }
          }
        }
      })

      test('radio groups do not interfere with hamburger menu', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        const hamburgerButton = page.getByRole('button', { name: /menu/i })
        const drawer = page.locator('.MuiDrawer-root')
        
        // Ensure drawer is initially closed
        await expect(drawer).not.toBeVisible()
        
        // Interact with radio groups
        const radioButtons = page.locator('.MuiRadio-root')
        const radioCount = await radioButtons.count()
        
        if (radioCount > 0) {
          // Click a few radio buttons
          for (let i = 0; i < Math.min(radioCount, 3); i++) {
            const radio = radioButtons.nth(i)
            if (await radio.isVisible()) {
              await radio.click()
              
              // Drawer should remain closed
              await expect(drawer).not.toBeVisible()
            }
          }
        }
        
        // Hamburger menu should still work normally
        await hamburgerButton.click()
        await expect(drawer).toBeVisible()
      })

      test('radio group labels are properly accessible', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Find radio groups
        const radioGroups = page.locator('.MuiRadioGroup-root')
        const radioGroupCount = await radioGroups.count()
        
        if (radioGroupCount > 0) {
          const firstRadioGroup = radioGroups.first()
          
          // Check for form control labels
          const labels = firstRadioGroup.locator('.MuiFormControlLabel-root')
          const labelCount = await labels.count()
          
          if (labelCount > 0) {
            for (let i = 0; i < labelCount; i++) {
              const label = labels.nth(i)
              const labelText = await label.textContent()
              
              // Labels should not be empty
              expect(labelText?.trim().length).toBeGreaterThan(0)
              
              // Common Romanian boolean options
              if (labelText) {
                const isCommonOption = ['Toate', 'Da', 'Nu'].some(option => 
                  labelText.includes(option)
                )
                if (isCommonOption) {
                  // Verify the label is properly associated with a radio input
                  const radioInput = label.locator('input[type="radio"]')
                  await expect(radioInput).toBeVisible()
                }
              }
            }
          }
        }
      })

      test('radio group selection applies filters correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Find a radio group and select a non-default option
        const radioGroups = page.locator('.MuiRadioGroup-root')
        const radioGroupCount = await radioGroups.count()
        
        if (radioGroupCount > 0) {
          const firstRadioGroup = radioGroups.first()
          
          // Look for "Da" option (true value)
          const daOption = firstRadioGroup.locator('input[value="true"], :text("Da") input')
          
          if (await daOption.count() > 0 && await daOption.first().isVisible()) {
            await daOption.first().click()
            
            // Apply filters
            const applyButton = page.getByRole('button', { name: /aplică filtrele/i })
            if (await applyButton.isVisible()) {
              await applyButton.click()
              
              // Wait for potential filter application
              await page.waitForTimeout(1000)
              
              // The page should still have the filter section visible
              // and the radio selection should be maintained
              const isStillChecked = await daOption.first().isChecked()
              expect(isStillChecked).toBe(true)
            }
          }
        }
      })
    })
  }
})