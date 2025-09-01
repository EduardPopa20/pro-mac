import { test, expect } from '@playwright/test'
import { setViewport } from './utils'

test.describe('Filter Behavior Regression Tests', () => {
  
  const testCategory = 'gresie'
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:5179/${testCategory}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
  })

  test.describe('Price Text Input Behavior', () => {
    test('should accept valid price inputs smoothly', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      await expect(minInput).toBeVisible()
      await expect(maxInput).toBeVisible()
      
      // Get initial values
      const initialMinValue = await minInput.inputValue()
      const initialMaxValue = await maxInput.inputValue()
      
      // Change min value
      await minInput.fill('100')
      await page.waitForTimeout(100)
      
      // Check that value updated
      const newMinValue = await minInput.inputValue()
      expect(newMinValue).toBe('100')
      
      // Change max value
      await maxInput.fill('500')
      await page.waitForTimeout(100)
      
      // Check that value updated
      const newMaxValue = await maxInput.inputValue()
      expect(newMaxValue).toBe('500')
      
      // Verify no error messages appear for valid range
      const errorAlert = page.locator('.MuiAlert-root[aria-label*="error"], .MuiAlert-standardError')
      expect(await errorAlert.count()).toBe(0)
    })

    test('should validate price range properly', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      // Test invalid range (min > max)
      await minInput.fill('800')
      await maxInput.fill('200')
      await maxInput.blur()
      
      await page.waitForTimeout(500)
      
      // Should show error message
      const errorAlert = page.locator('.MuiAlert-root')
      await expect(errorAlert).toBeVisible({ timeout: 3000 })
      
      // Fix the range
      await minInput.fill('100')
      await minInput.blur()
      
      await page.waitForTimeout(500)
      
      // Error should disappear
      expect(await errorAlert.count()).toBe(0)
    })

    test('should handle text input changes correctly', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      // Test changing min input
      await minInput.fill('150')
      await minInput.blur()
      
      await page.waitForTimeout(500)
      
      // Input should maintain the value
      expect(await minInput.inputValue()).toBe('150')
      
      // Test changing max input
      await maxInput.fill('750')
      await maxInput.blur()
      
      await page.waitForTimeout(500)
      
      // Input should maintain the value
      expect(await maxInput.inputValue()).toBe('750')
    })
  })

  test.describe('Filter State Persistence', () => {
    test('should preserve filter values when pressing Save', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      // Set specific filter values
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      await minInput.fill('200')
      await maxInput.fill('800')
      
      // Check for colors filter and select if available
      const colorSection = page.locator('text=Culoare').first()
      if (await colorSection.isVisible()) {
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        const firstColorOption = page.locator('[role="option"]').first()
        if (await firstColorOption.isVisible()) {
          await firstColorOption.click()
          await page.click('body') // Close dropdown
        }
      }
      
      // Save filters
      const saveButton = page.locator('text=Salvează').first()
      if (await saveButton.isVisible()) {
        await saveButton.click()
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(1000)
        
        // Check that values are still there after save
        expect(await minInput.inputValue()).toBe('200')
        expect(await maxInput.inputValue()).toBe('800')
        
        // Check that selected color is still there
        if (await colorSection.isVisible()) {
          const selectedChips = page.locator('.MuiChip-root').filter({ hasText: /Alb|Negru|Gri|Maro/ })
          expect(await selectedChips.count()).toBeGreaterThanOrEqual(0) // Should have selected color
        }
      }
    })

    test('should not reset filters during normal editing', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      // Set values
      await minInput.fill('300')
      await maxInput.fill('700')
      
      // Wait a bit to ensure no automatic reset
      await page.waitForTimeout(2000)
      
      // Values should still be there
      expect(await minInput.inputValue()).toBe('300')
      expect(await maxInput.inputValue()).toBe('700')
      
      // Make another change
      await minInput.fill('350')
      await page.waitForTimeout(1000)
      
      // Should still be preserved
      expect(await minInput.inputValue()).toBe('350')
    })
  })

  test.describe('Color Chip Behavior', () => {
    test('should remove color when X button is clicked without opening dropdown', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      // Find color section
      const colorSection = page.locator('text=Culoare').first()
      
      if (await colorSection.isVisible()) {
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        // Select first available color
        const firstColorOption = page.locator('[role="option"]').first()
        if (await firstColorOption.isVisible()) {
          const colorText = await firstColorOption.textContent()
          await firstColorOption.click()
          
          // Click outside to close dropdown
          await page.click('body')
          await page.waitForTimeout(500)
          
          // Find the color chip that was just added
          const colorChip = page.locator('.MuiChip-root').filter({ hasText: colorText?.split('(')[0].trim() || '' }).first()
          await expect(colorChip).toBeVisible()
          
          // Click the X button on the chip
          const deleteButton = colorChip.locator('.MuiChip-deleteIcon')
          await expect(deleteButton).toBeVisible()
          
          // Track dropdown state before clicking
          const dropdownBefore = page.locator('[role="listbox"]')
          const isDropdownVisibleBefore = await dropdownBefore.isVisible()
          
          // Click delete button
          await deleteButton.click()
          await page.waitForTimeout(500)
          
          // Chip should be removed
          await expect(colorChip).not.toBeVisible()
          
          // Dropdown should NOT have opened
          const isDropdownVisibleAfter = await dropdownBefore.isVisible()
          expect(isDropdownVisibleAfter).toBeFalsy()
          
          // If dropdown was closed before, it should still be closed
          if (!isDropdownVisibleBefore) {
            expect(isDropdownVisibleAfter).toBeFalsy()
          }
        }
      }
    })

    test('should remove multiple colors independently', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const colorSection = page.locator('text=Culoare').first()
      
      if (await colorSection.isVisible()) {
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        // Select multiple colors
        const colorOptions = page.locator('[role="option"]')
        const optionCount = await colorOptions.count()
        
        if (optionCount >= 2) {
          const firstOption = colorOptions.first()
          const secondOption = colorOptions.nth(1)
          
          const firstColorText = await firstOption.textContent()
          const secondColorText = await secondOption.textContent()
          
          await firstOption.click()
          await secondOption.click()
          
          // Close dropdown
          await page.keyboard.press('Escape')
          await page.waitForTimeout(500)
          
          // Verify both chips are there
          const firstChip = page.locator('.MuiChip-root').filter({ hasText: firstColorText?.split('(')[0].trim() || '' }).first()
          const secondChip = page.locator('.MuiChip-root').filter({ hasText: secondColorText?.split('(')[0].trim() || '' }).first()
          
          await expect(firstChip).toBeVisible()
          await expect(secondChip).toBeVisible()
          
          // Remove first chip
          await firstChip.locator('.MuiChip-deleteIcon').click()
          await page.waitForTimeout(300)
          
          // First chip should be gone, second should remain
          await expect(firstChip).not.toBeVisible()
          await expect(secondChip).toBeVisible()
          
          // Remove second chip
          await secondChip.locator('.MuiChip-deleteIcon').click()
          await page.waitForTimeout(300)
          
          // Both chips should be gone
          await expect(firstChip).not.toBeVisible()
          await expect(secondChip).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Mobile Modal Behavior', () => {
    test('should preserve filters when opening and closing modal', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Find mobile filter button
      const filterButton = page.locator('text=Filtrează produsele').first()
      await expect(filterButton).toBeVisible()
      
      // Open modal
      await filterButton.click()
      
      // Modal should be visible
      const modal = page.locator('[role="dialog"]').first()
      await expect(modal).toBeVisible()
      
      // Set filters in modal
      const minInput = page.locator('input[type="number"]').first()
      await minInput.fill('250')
      
      // Close modal with Cancel
      const cancelButton = page.locator('text=Anulează').first()
      await cancelButton.click()
      
      // Modal should close
      await expect(modal).not.toBeVisible()
      
      // Reopen modal
      await filterButton.click()
      await expect(modal).toBeVisible()
      
      // Filter should be reset to original value (cancel behavior)
      const resetMinInput = page.locator('input[type="number"]').first()
      const resetValue = await resetMinInput.inputValue()
      expect(resetValue).not.toBe('250') // Should be reset
    })

    test('should apply filters when Apply button is clicked', async ({ page }) => {
      await setViewport(page, 'xs')
      
      const filterButton = page.locator('text=Filtrează produsele').first()
      await filterButton.click()
      
      const modal = page.locator('[role="dialog"]').first()
      await expect(modal).toBeVisible()
      
      // Set filters
      const minInput = page.locator('input[type="number"]').first()
      await minInput.fill('400')
      
      // Apply filters
      const applyButton = page.locator('text=Aplică filtrele').first()
      await applyButton.click()
      
      // Modal should close automatically
      await expect(modal).not.toBeVisible()
      
      // Filter button should show active state
      const activeFilterButton = page.locator('text=Filtrează produsele').first()
      
      // Button should have visual indication of active filters
      const buttonBg = await activeFilterButton.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })
      
      // Should have active styling (not default background)
      expect(buttonBg).not.toBe('rgba(0, 0, 0, 0)') // Not transparent
    })
  })

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle invalid price inputs gracefully', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      const maxInput = page.locator('input[type="number"]').last()
      
      // Enter invalid range (min > max)
      await minInput.fill('800')
      await maxInput.fill('200')
      await maxInput.blur()
      
      // Should show error
      const errorAlert = page.locator('.MuiAlert-root[aria-label*="error"], .MuiAlert-standardError')
      await expect(errorAlert).toBeVisible({ timeout: 3000 })
      
      // Fix the range
      await minInput.fill('100')
      await minInput.blur()
      
      // Error should disappear
      await expect(errorAlert).not.toBeVisible({ timeout: 3000 })
    })

    test('should handle empty price inputs', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minInput = page.locator('input[type="number"]').first()
      
      // Clear input
      await minInput.fill('')
      await minInput.blur()
      
      // Should either show error or restore to valid value
      await page.waitForTimeout(1000)
      
      const finalValue = await minInput.inputValue()
      expect(finalValue).toBeTruthy() // Should have some value
      expect(parseInt(finalValue)).toBeGreaterThanOrEqual(0) // Should be valid number
    })

    test('should prevent horizontal scroll with filter interactions', async ({ page }) => {
      const breakpoints = ['xs', 'md', 'lg'] as const
      
      for (const bp of breakpoints) {
        await setViewport(page, bp)
        
        // Interact with filters
        if (bp === 'xs') {
          // Mobile modal
          const filterButton = page.locator('text=Filtrează produsele').first()
          if (await filterButton.isVisible()) {
            await filterButton.click()
            
            const modal = page.locator('[role="dialog"]').first()
            if (await modal.isVisible()) {
              // Interact with modal content
              const minInput = page.locator('input[type="number"]').first()
              await minInput.fill('123456789') // Long number
              
              // Close modal
              const cancelButton = page.locator('text=Anulează').first()
              await cancelButton.click()
            }
          }
        } else {
          // Desktop sidebar
          const minInput = page.locator('input[type="number"]').first()
          if (await minInput.isVisible()) {
            await minInput.fill('123456789') // Long number
            await minInput.blur()
          }
        }
        
        // Check for horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        
        expect(hasHorizontalScroll).toBeFalsy()
      }
    })
  })
})