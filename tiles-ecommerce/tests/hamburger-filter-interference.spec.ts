import { test, expect } from '@playwright/test'
import { setViewport } from './utils'

test.describe('Hamburger Menu and Filter Interference', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5179/gresie')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="product-card"], .MuiCard-root', { timeout: 10000 })
  })

  test.describe('Mobile Menu Behavior', () => {
    test('should not interfere with filter collapse on mobile', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Wait for page to stabilize
      await page.waitForTimeout(1000)
      
      // Find hamburger menu button
      const hamburgerButton = page.locator('[aria-label="menu"], button').filter({ hasText: '' }).first()
      await expect(hamburgerButton).toBeVisible()
      
      // Check initial state - hamburger should be clickable
      await hamburgerButton.click()
      
      // Should open navigation drawer
      const drawer = page.locator('.MuiDrawer-root, [role="presentation"]').first()
      await expect(drawer).toBeVisible({ timeout: 3000 })
      
      // Close drawer
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      
      // Now try to interact with filters (mobile shows button, desktop shows card)
      const filterElement = page.locator('text=Filtrare produse, text=Filtrează produsele').first()
      await expect(filterElement).toBeVisible()
      
      // Try to expand/collapse filters if there's a toggle
      const filterExpandButton = page.locator('.MuiIconButton-root').filter({ 
        has: page.locator('.MuiSvgIcon-root') 
      }).last()
      
      if (await filterExpandButton.isVisible()) {
        await filterExpandButton.click()
        await page.waitForTimeout(500)
        
        // Filter content should expand/collapse
        const filterContent = page.locator('text=Interval preț')
        const isVisible = await filterContent.isVisible()
        
        // Click again to toggle
        await filterExpandButton.click()
        await page.waitForTimeout(500)
        
        const isVisibleAfterToggle = await filterContent.isVisible()
        expect(isVisibleAfterToggle).not.toBe(isVisible) // Should have changed state
      }
    })

    test('should allow hamburger menu to open after filter interactions', async ({ page }) => {
      await setViewport(page, 'xs')
      
      await page.waitForTimeout(1000)
      
      // First interact with filters
      const priceInput = page.locator('input[type="number"]').first()
      if (await priceInput.isVisible()) {
        await priceInput.fill('100')
        await priceInput.blur()
        await page.waitForTimeout(500)
      }
      
      // Now try to open hamburger menu
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await expect(hamburgerButton).toBeVisible()
      await expect(hamburgerButton).toBeEnabled()
      
      await hamburgerButton.click()
      
      // Should successfully open drawer
      const drawer = page.locator('.MuiDrawer-root').first()
      await expect(drawer).toBeVisible({ timeout: 3000 })
      
      // Should contain navigation items
      const navItems = page.locator('.MuiDrawer-root .MuiListItemText-root')
      expect(await navItems.count()).toBeGreaterThan(0)
    })

    test('should not trigger filter actions when opening hamburger menu', async ({ page }) => {
      await setViewport(page, 'xs')
      
      await page.waitForTimeout(1000)
      
      // Get initial filter state
      const minPriceInput = page.locator('input[type="number"]').first()
      let initialMinValue = ''
      if (await minPriceInput.isVisible()) {
        initialMinValue = await minPriceInput.inputValue()
      }
      
      // Open hamburger menu
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await hamburgerButton.click()
      
      await page.waitForTimeout(500)
      
      // Close menu
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      
      // Check that filter values haven't changed
      if (await minPriceInput.isVisible()) {
        const currentMinValue = await minPriceInput.inputValue()
        expect(currentMinValue).toBe(initialMinValue)
      }
      
      // Check that no unexpected filter chips appeared
      const filterChips = page.locator('.MuiChip-root').filter({ hasText: /produse/ })
      const chipCount = await filterChips.count()
      expect(chipCount).toBeLessThanOrEqual(1) // Should only have the product count chip if any
    })
  })

  test.describe('Z-Index and Layering', () => {
    test('should have proper z-index layering between menu and filters', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Open hamburger menu
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await hamburgerButton.click()
      
      const drawer = page.locator('.MuiDrawer-root').first()
      await expect(drawer).toBeVisible()
      
      // Get z-index of drawer
      const drawerZIndex = await drawer.evaluate((el) => {
        return window.getComputedStyle(el).zIndex
      })
      
      // Get z-index of filter card
      const filterCard = page.locator('text=Filtrare produse').first()
      const filterZIndex = await filterCard.evaluate((el) => {
        return window.getComputedStyle(el).zIndex
      })
      
      // Drawer should have higher z-index than filter card
      expect(parseInt(drawerZIndex)).toBeGreaterThan(parseInt(filterZIndex))
    })

    test('should properly handle backdrop clicks', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Open hamburger menu
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await hamburgerButton.click()
      
      const drawer = page.locator('.MuiDrawer-root').first()
      await expect(drawer).toBeVisible()
      
      // Click on backdrop (outside drawer content)
      await page.click('body', { position: { x: 350, y: 200 } }) // Click somewhere in the middle-right
      
      await page.waitForTimeout(500)
      
      // Drawer should close
      await expect(drawer).not.toBeVisible()
      
      // Filter should still be accessible (mobile button or desktop card)
      const filterElement = page.locator('text=Filtrare produse, text=Filtrează produsele').first()
      await expect(filterElement).toBeVisible()
    })
  })

  test.describe('Event Propagation', () => {
    test('should not trigger menu when clicking filter controls', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Click on a filter control (price input)
      const priceInput = page.locator('input[type="number"]').first()
      if (await priceInput.isVisible()) {
        await priceInput.click()
        await page.waitForTimeout(500)
        
        // Input should be focused, menu should not open
        const drawer = page.locator('.MuiDrawer-root')
        expect(await drawer.count()).toBe(0) // Should not exist or be visible
        
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(focusedElement).toBe('INPUT')
      }
    })

    test('should not trigger filter actions when navigating menu', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Get initial product count
      const initialProductCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
      
      // Open hamburger menu
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await hamburgerButton.click()
      
      // Navigate through menu items
      const menuItems = page.locator('.MuiListItemButton-root')
      const menuItemCount = await menuItems.count()
      
      if (menuItemCount > 0) {
        // Click on a menu item (but don't navigate)
        await menuItems.first().click()
        await page.waitForTimeout(500)
        
        // Products should not be filtered unexpectedly
        const currentProductCount = await page.locator('[data-testid="product-card"], .MuiCard-root').count()
        expect(currentProductCount).toBe(initialProductCount)
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should maintain proper focus management between menu and filters', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Focus hamburger button
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      await hamburgerButton.focus()
      
      let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      expect(focusedElement).toContain('menu')
      
      // Open menu
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      
      // Focus should move to menu
      focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['DIV', 'BUTTON', 'A'].includes(focusedElement || '')).toBeTruthy()
      
      // Close menu with escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      
      // Focus should return to hamburger button
      focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      expect(focusedElement).toContain('menu')
      
      // Tab to filter controls
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Should be able to focus filter controls
      const priceInput = page.locator('input[type="number"]').first()
      if (await priceInput.isVisible()) {
        await priceInput.focus()
        focusedElement = await page.evaluate(() => document.activeElement?.tagName)
        expect(focusedElement).toBe('INPUT')
      }
    })

    test('should have proper ARIA attributes for both menu and filters', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Check hamburger button ARIA
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      const ariaLabel = await hamburgerButton.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      
      // Open menu and check ARIA
      await hamburgerButton.click()
      const drawer = page.locator('.MuiDrawer-root').first()
      
      // Drawer should have proper role
      const drawerRole = await drawer.getAttribute('role')
      expect(['presentation', 'dialog'].includes(drawerRole || '')).toBeTruthy()
      
      // Filter card should maintain its structure
      const filterCard = page.locator('text=Filtrare produse').first()
      await expect(filterCard).toBeVisible()
      
      // Price inputs should have proper labels
      const priceInputs = page.locator('input[type="number"]')
      const inputCount = await priceInputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = priceInputs.nth(i)
        const hasLabel = await input.evaluate((el) => {
          const id = el.id
          return document.querySelector(`label[for="${id}"]`) !== null ||
                 el.getAttribute('aria-label') !== null ||
                 el.getAttribute('aria-labelledby') !== null
        })
        expect(hasLabel).toBeTruthy()
      }
    })
  })

  test.describe('Performance Impact', () => {
    test('should not cause layout thrashing when toggling menu and filters', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Measure layout stability
      let layoutShifts = 0
      
      await page.addInitScript(() => {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              (window as any).layoutShifts = ((window as any).layoutShifts || 0) + (entry as any).value
            }
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
        ;(window as any).layoutShifts = 0
      })
      
      // Perform rapid menu and filter interactions
      const hamburgerButton = page.locator('[aria-label="menu"], .MuiIconButton-root').first()
      
      for (let i = 0; i < 3; i++) {
        await hamburgerButton.click()
        await page.waitForTimeout(100)
        await page.keyboard.press('Escape')
        await page.waitForTimeout(100)
        
        const priceInput = page.locator('input[type="number"]').first()
        if (await priceInput.isVisible()) {
          await priceInput.click()
          await priceInput.fill(String(100 + i * 50))
          await priceInput.blur()
          await page.waitForTimeout(100)
        }
      }
      
      // Check layout stability
      layoutShifts = await page.evaluate(() => (window as any).layoutShifts || 0)
      expect(layoutShifts).toBeLessThan(0.1) // CLS should be low
    })
  })
})