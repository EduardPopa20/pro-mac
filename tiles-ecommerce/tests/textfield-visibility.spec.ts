import { test, expect } from '@playwright/test'
import { setViewport } from './utils'

test.describe('TextField Visibility and Sizing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5179/gresie')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
  })

  test.describe('Price Range TextField Visibility', () => {
    test('should have fully visible price textfields on desktop', async ({ page }) => {
      await setViewport(page, 'lg')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Check visibility
      await expect(minPriceInput).toBeVisible()
      await expect(maxPriceInput).toBeVisible()
      
      // Check dimensions
      const minBox = await minPriceInput.boundingBox()
      const maxBox = await maxPriceInput.boundingBox()
      
      expect(minBox).toBeTruthy()
      expect(maxBox).toBeTruthy()
      
      // Should have adequate width (at least 100px as updated in code)
      expect(minBox!.width).toBeGreaterThanOrEqual(100)
      expect(maxBox!.width).toBeGreaterThanOrEqual(100)
      
      // Should not be clipped (height should be reasonable)
      expect(minBox!.height).toBeGreaterThanOrEqual(30)
      expect(maxBox!.height).toBeGreaterThanOrEqual(30)
    })

    test('should have fully visible price textfields on tablet', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await expect(minPriceInput).toBeVisible()
      await expect(maxPriceInput).toBeVisible()
      
      const minBox = await minPriceInput.boundingBox()
      const maxBox = await maxPriceInput.boundingBox()
      
      expect(minBox!.width).toBeGreaterThanOrEqual(90) // Slightly smaller on tablet is acceptable
      expect(maxBox!.width).toBeGreaterThanOrEqual(90)
    })

    test('should have visible price textfields on mobile', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // May need to expand filter on mobile
      const filterExpandButton = page.locator('.MuiIconButton-root').filter({ 
        has: page.locator('.MuiSvgIcon-root') 
      }).last()
      
      if (await filterExpandButton.isVisible()) {
        await filterExpandButton.click()
        await page.waitForTimeout(500)
      }
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await expect(minPriceInput).toBeVisible()
      await expect(maxPriceInput).toBeVisible()
      
      const minBox = await minPriceInput.boundingBox()
      const maxBox = await maxPriceInput.boundingBox()
      
      // On mobile, inputs should still be usable (minimum 75px width)
      expect(minBox!.width).toBeGreaterThanOrEqual(75)
      expect(maxBox!.width).toBeGreaterThanOrEqual(75)
      
      // Check that they're not hidden by overflow
      expect(minBox!.x).toBeGreaterThanOrEqual(0)
      expect(maxBox!.x).toBeGreaterThanOrEqual(0)
      
      // Should fit within viewport
      const viewport = page.viewportSize()
      expect(minBox!.x + minBox!.width).toBeLessThanOrEqual(viewport!.width)
      expect(maxBox!.x + maxBox!.width).toBeLessThanOrEqual(viewport!.width)
    })
  })

  test.describe('TextField Content and Interaction', () => {
    test('should display full text content in textfields', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Type longer values to test text visibility
      await minPriceInput.fill('12345')
      await maxPriceInput.fill('67890')
      
      // Check that the full values are visible and editable
      expect(await minPriceInput.inputValue()).toBe('12345')
      expect(await maxPriceInput.inputValue()).toBe('67890')
      
      // Check that cursor is positioned correctly (text not clipped)
      await minPriceInput.focus()
      await page.keyboard.press('End')
      
      // Type additional character
      await page.keyboard.type('6')
      expect(await minPriceInput.inputValue()).toBe('123456')
    })

    test('should show currency suffix without clipping', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Check for RON suffix visibility
      const minAdornment = page.locator('text=RON').first()
      const maxAdornment = page.locator('text=RON').last()
      
      await expect(minAdornment).toBeVisible()
      await expect(maxAdornment).toBeVisible()
      
      // RON text should not be clipped
      const minAdornmentBox = await minAdornment.boundingBox()
      const maxAdornmentBox = await maxAdornment.boundingBox()
      
      expect(minAdornmentBox!.width).toBeGreaterThan(20) // RON should be fully visible
      expect(maxAdornmentBox!.width).toBeGreaterThan(20)
    })

    test('should handle long numbers without layout breaking', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      
      // Test with very long number
      const longNumber = '123456789'
      await minPriceInput.fill(longNumber)
      
      // Input should handle the long number
      expect(await minPriceInput.inputValue()).toBe(longNumber)
      
      // Layout should not break
      const inputBox = await minPriceInput.boundingBox()
      const viewport = page.viewportSize()
      
      // Input should not overflow viewport
      expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(viewport!.width)
      
      // Check that parent container didn't break
      const filterCard = page.locator('text=Filtrare produse').first()
      const cardBox = await filterCard.boundingBox()
      expect(cardBox!.width).toBeLessThanOrEqual(viewport!.width)
    })
  })

  test.describe('Layout Responsiveness', () => {
    test('should adapt textfield layout across breakpoints', async ({ page }) => {
      const breakpoints: Array<{ name: 'xs' | 'sm' | 'md' | 'lg' | 'xl', width: number }> = [
        { name: 'xs', width: 360 },
        { name: 'md', width: 960 },
        { name: 'lg', width: 1280 }
      ]
      
      for (const bp of breakpoints) {
        await page.setViewportSize({ width: bp.width, height: 720 })
        await page.waitForTimeout(500)
        
        // Expand filter if on mobile
        if (bp.name === 'xs') {
          const filterExpandButton = page.locator('.MuiIconButton-root').filter({ 
            has: page.locator('.MuiSvgIcon-root') 
          }).last()
          
          if (await filterExpandButton.isVisible()) {
            await filterExpandButton.click()
            await page.waitForTimeout(500)
          }
        }
        
        await page.waitForSelector('text=Interval preț')
        
        const minPriceInput = page.locator('input[type="number"]').first()
        const maxPriceInput = page.locator('input[type="number"]').last()
        
        // Both inputs should be visible
        await expect(minPriceInput).toBeVisible()
        await expect(maxPriceInput).toBeVisible()
        
        const minBox = await minPriceInput.boundingBox()
        const maxBox = await maxPriceInput.boundingBox()
        
        // Inputs should be properly sized for the breakpoint
        const expectedMinWidth = bp.name === 'xs' ? 75 : bp.name === 'md' ? 90 : 100
        expect(minBox!.width).toBeGreaterThanOrEqual(expectedMinWidth)
        expect(maxBox!.width).toBeGreaterThanOrEqual(expectedMinWidth)
        
        // Should not cause horizontal scrolling
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        expect(hasHorizontalScroll).toBeFalsy()
        
        console.log(`✓ ${bp.name} (${bp.width}px): Min input width: ${minBox!.width}px, Max input width: ${maxBox!.width}px`)
      }
    })

    test('should maintain proper spacing between inputs and slider', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      const slider = page.locator('.MuiSlider-root').first()
      
      const minBox = await minPriceInput.boundingBox()
      const maxBox = await maxPriceInput.boundingBox()
      const sliderBox = await slider.boundingBox()
      
      // Slider should be positioned between inputs horizontally
      expect(sliderBox!.x).toBeGreaterThan(minBox!.x + minBox!.width)
      expect(sliderBox!.x + sliderBox!.width).toBeLessThan(maxBox!.x)
      
      // Should have reasonable spacing (at least 8px)
      const minToSliderGap = sliderBox!.x - (minBox!.x + minBox!.width)
      const sliderToMaxGap = maxBox!.x - (sliderBox!.x + sliderBox!.width)
      
      expect(minToSliderGap).toBeGreaterThanOrEqual(8)
      expect(sliderToMaxGap).toBeGreaterThanOrEqual(8)
    })
  })

  test.describe('Error State Visibility', () => {
    test('should display error messages without text clipping', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Create error state by setting invalid range
      await minPriceInput.fill('1000')
      await maxPriceInput.fill('500')
      await maxPriceInput.blur()
      
      // Error should be visible
      const errorAlert = page.locator('.MuiAlert-root')
      await expect(errorAlert).toBeVisible({ timeout: 3000 })
      
      // Error text should be fully readable
      const errorBox = await errorAlert.boundingBox()
      expect(errorBox!.width).toBeGreaterThan(100) // Should have reasonable width
      expect(errorBox!.height).toBeGreaterThan(20) // Should not be collapsed
      
      // Error should not cause horizontal scroll
      const viewport = page.viewportSize()
      expect(errorBox!.x + errorBox!.width).toBeLessThanOrEqual(viewport!.width)
    })

    test('should display error messages on mobile without clipping', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Expand filter on mobile
      const filterExpandButton = page.locator('.MuiIconButton-root').filter({ 
        has: page.locator('.MuiSvgIcon-root') 
      }).last()
      
      if (await filterExpandButton.isVisible()) {
        await filterExpandButton.click()
        await page.waitForTimeout(500)
      }
      
      await page.waitForSelector('text=Interval preț')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Create error state
      await minPriceInput.fill('2000')
      await maxPriceInput.fill('100')
      await maxPriceInput.blur()
      
      // Error should be visible on mobile
      const errorAlert = page.locator('.MuiAlert-root')
      await expect(errorAlert).toBeVisible({ timeout: 3000 })
      
      const errorBox = await errorAlert.boundingBox()
      const viewport = page.viewportSize()
      
      // Error should fit within mobile viewport
      expect(errorBox!.x + errorBox!.width).toBeLessThanOrEqual(viewport!.width)
      expect(errorBox!.width).toBeLessThanOrEqual(viewport!.width - 40) // Account for margins
    })
  })

  test.describe('Visual Regression Protection', () => {
    test('should maintain consistent textfield appearance', async ({ page }) => {
      await setViewport(page, 'md')
      
      await page.waitForSelector('text=Interval preț')
      
      // Take screenshot of filter area
      const filterCard = page.locator('text=Filtrare produse').first().locator('..')
      
      // Fill inputs to show content
      const minPriceInput = page.locator('input[type="number"]').first()
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      await minPriceInput.fill('150')
      await maxPriceInput.fill('750')
      
      // Visual validation - inputs should look properly sized and aligned
      const screenshot = await filterCard.screenshot()
      expect(screenshot).toBeTruthy()
      
      // Test different input lengths
      await minPriceInput.fill('12')
      await maxPriceInput.fill('99999')
      
      const screenshot2 = await filterCard.screenshot()
      expect(screenshot2).toBeTruthy()
      
      // Layout should remain stable regardless of input length
      const minBox1 = await minPriceInput.boundingBox()
      await minPriceInput.fill('123456')
      const minBox2 = await minPriceInput.boundingBox()
      
      // Input position and size should remain consistent
      expect(Math.abs(minBox1!.x - minBox2!.x)).toBeLessThan(5)
      expect(Math.abs(minBox1!.width - minBox2!.width)).toBeLessThan(5)
    })
  })
})