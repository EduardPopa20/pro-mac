import { test, expect } from '@playwright/test'

/**
 * Tests for TextField focus retention and responsive sizing
 * Validates CLAUDE.md Section 8.6 TextField visibility requirements
 * Tests focus retention during typing sequences
 */

test.describe('Filter TextField Focus and Sizing', () => {
  const testRoutes = ['/gresie', '/faianta']
  const breakpoints = [
    { name: 'mobile', width: 360, height: 640, minWidth: 75, fontSize: '0.875rem' },
    { name: 'tablet', width: 800, height: 600, minWidth: 90, fontSize: '1rem' },
    { name: 'desktop', width: 1024, height: 768, minWidth: 100, fontSize: '1rem' }
  ]

  for (const route of testRoutes) {
    test.describe(`${route} page`, () => {
      for (const bp of breakpoints) {
        test(`TextField focus retention and sizing at ${bp.name} viewport`, async ({ page }) => {
          await page.setViewportSize({ width: bp.width, height: bp.height })
          await page.goto(`http://localhost:5176${route}`)
          await page.waitForLoadState('networkidle')

          // For mobile, open the filter modal
          if (bp.name === 'mobile') {
            const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
            await expect(filterButton).toBeVisible()
            await filterButton.click()
            
            const filterModal = page.locator('.MuiDialog-root')
            await expect(filterModal).toBeVisible()
          }

          // Test min price field
          const minPriceField = page.locator('input[label="Min"]').first()
          if (await minPriceField.isVisible()) {
            // Test focus retention during typing
            await minPriceField.click()
            await minPriceField.clear()
            
            // Type multiple characters in sequence
            const testValue = '12345'
            for (let i = 0; i < testValue.length; i++) {
              await minPriceField.type(testValue[i], { delay: 100 })
              
              // Verify field maintains focus after each character
              const isFocused = await minPriceField.evaluate(el => el === document.activeElement)
              expect(isFocused).toBe(true)
            }
            
            // Verify final value was typed correctly
            const finalValue = await minPriceField.inputValue()
            expect(finalValue).toBe(testValue)

            // Test responsive sizing
            const fieldBox = await minPriceField.boundingBox()
            expect(fieldBox?.width).toBeGreaterThanOrEqual(bp.minWidth)

            // Test font size compliance
            const computedFontSize = await minPriceField.evaluate(el => 
              getComputedStyle(el).fontSize
            )
            
            // Font size should meet minimum requirements
            const minFontSizePx = bp.name === 'mobile' ? 14 : bp.name === 'tablet' ? 15 : 16
            const actualFontSizePx = parseInt(computedFontSize.replace('px', ''))
            expect(actualFontSizePx).toBeGreaterThanOrEqual(minFontSizePx)
          }

          // Test max price field
          const maxPriceField = page.locator('input[label="Max"]').first()
          if (await maxPriceField.isVisible()) {
            await maxPriceField.click()
            await maxPriceField.clear()
            
            // Type sequence without losing focus
            const testValue = '98765'
            await maxPriceField.type(testValue, { delay: 50 })
            
            // Verify focus maintained throughout typing
            const isFocused = await maxPriceField.evaluate(el => el === document.activeElement)
            expect(isFocused).toBe(true)
            
            const finalValue = await maxPriceField.inputValue()
            expect(finalValue).toBe(testValue)

            // Test RON suffix visibility
            const adornment = page.locator('.MuiInputAdornment-root:has-text("RON")')
            if (await adornment.isVisible()) {
              const adornmentBox = await adornment.boundingBox()
              expect(adornmentBox?.width).toBeGreaterThan(0)
              
              // Ensure RON text is not clipped
              const adornmentText = await adornment.textContent()
              expect(adornmentText?.trim()).toBe('RON')
            }
          }

          // Test that both fields can be focused sequentially without issues
          if (await minPriceField.isVisible() && await maxPriceField.isVisible()) {
            await minPriceField.click()
            await minPriceField.type('100')
            
            await maxPriceField.click()
            await maxPriceField.type('500')
            
            // Both should retain their values
            expect(await minPriceField.inputValue()).toContain('100')
            expect(await maxPriceField.inputValue()).toContain('500')
          }

          // Close mobile modal if open
          if (bp.name === 'mobile') {
            const closeButton = page.locator('.MuiDialog-root .MuiIconButton-root:has(.MuiSvgIcon-root)')
            if (await closeButton.isVisible()) {
              await closeButton.click()
            }
          }
        })
      }

      test('TextField error states display correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')

        const minPriceField = page.locator('input[label="Min"]').first()
        const maxPriceField = page.locator('input[label="Max"]').first()

        if (await minPriceField.isVisible() && await maxPriceField.isVisible()) {
          // Set min price higher than max price to trigger error
          await minPriceField.click()
          await minPriceField.clear()
          await minPriceField.type('500')
          
          await maxPriceField.click()
          await maxPriceField.clear()
          await maxPriceField.type('100')

          // Error message should appear
          const errorAlert = page.locator('.MuiAlert-root:has-text("minim")')
          await expect(errorAlert).toBeVisible({ timeout: 5000 })

          // Error message should fit within container
          const errorBox = await errorAlert.boundingBox()
          expect(errorBox?.width).toBeGreaterThan(0)
          
          // Container should not have horizontal scroll
          const hasScroll = await page.evaluate(() =>
            document.documentElement.scrollWidth > document.documentElement.clientWidth
          )
          expect(hasScroll).toBeFalsy()
        }
      })

      test('rapid typing does not cause focus loss', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')

        const minPriceField = page.locator('input[label="Min"]').first()
        
        if (await minPriceField.isVisible()) {
          await minPriceField.click()
          await minPriceField.clear()

          // Rapid typing sequence
          const rapidSequence = ['1', '2', '3', '4', '5', '0', '0']
          
          for (const char of rapidSequence) {
            await minPriceField.type(char, { delay: 10 }) // Very fast typing
            
            // Field should maintain focus after each keystroke
            const isFocused = await minPriceField.evaluate(el => el === document.activeElement)
            expect(isFocused).toBe(true)
          }

          // Final value should be complete
          const finalValue = await minPriceField.inputValue()
          expect(finalValue).toBe('1234500')
        }
      })
    })
  }
})