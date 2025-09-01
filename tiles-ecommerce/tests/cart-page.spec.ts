import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Cart Page - Design Standards Compliance', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure consistent rendering
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    })
  })

  test('cart page follows CLAUDE.md breadcrumb standards', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Check for breadcrumbs at top-left with proper spacing
    const breadcrumbs = page.locator('[role="navigation"], .MuiBreadcrumbs-root')
    await expect(breadcrumbs).toBeVisible()
    
    // Breadcrumbs should be separated from other UI with mb={4}
    const breadcrumbsBox = breadcrumbs.locator('xpath=..').first()
    const computedStyle = await breadcrumbsBox.evaluate(el => {
      return window.getComputedStyle(el).marginBottom
    })
    
    // mb={4} should be approximately 32px (4 * 8px theme spacing)
    expect(parseInt(computedStyle)).toBeGreaterThanOrEqual(30)
    expect(parseInt(computedStyle)).toBeLessThanOrEqual(36)
  })

  test('cart page implements proper loading and empty states', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Empty cart state should follow CLAUDE.md patterns
    const emptyState = page.locator('text=Coșul tău este gol')
    if (await emptyState.isVisible()) {
      // Should have centered layout
      const emptyContainer = emptyState.locator('xpath=ancestor::div[contains(@class, "MuiBox-root") or @data-testid]').first()
      const containerStyles = await emptyContainer.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          display: styles.display,
          flexDirection: styles.flexDirection,
          alignItems: styles.alignItems,
          textAlign: styles.textAlign
        }
      })
      
      expect(containerStyles.display).toBe('flex')
      expect(containerStyles.flexDirection).toBe('column')
      expect(containerStyles.alignItems).toBe('center')
      
      // Should have proper icon size (80px as per CLAUDE.md)
      const icon = page.locator('svg').first()
      const iconBox = await icon.boundingBox()
      if (iconBox) {
        expect(iconBox.height).toBeGreaterThanOrEqual(75)
        expect(iconBox.height).toBeLessThanOrEqual(85)
      }
      
      // Should have descriptive message and action button
      const description = page.locator('text=Nu ai adăugat încă niciun produs')
      await expect(description).toBeVisible()
      
      const actionButton = page.getByRole('button', { name: /începe să cumperi/i })
      await expect(actionButton).toBeVisible()
    }
  })

  test('cart page responsive design - mobile breakpoint', async ({ page }) => {
    await setViewport(page, 'xs')
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Should not have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })
    expect(hasHorizontalScroll).toBeFalsy()
    
    // Touch targets should be ≥44px
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox()
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })

  test('cart page responsive design - desktop breakpoints', async ({ page }) => {
    const breakpoints = ['md', 'lg', 'xl'] as const
    
    for (const bp of breakpoints) {
      await setViewport(page, bp)
      await page.goto('/cos')
      await waitForFontsLoaded(page)
      
      // Should not have horizontal scroll at any breakpoint
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBeFalsy()
      
      // Grid layout should be visible on desktop
      const gridContainer = page.locator('[class*="MuiGrid-container"]').first()
      if (await gridContainer.isVisible()) {
        const gridStyles = await gridContainer.evaluate(el => {
          return window.getComputedStyle(el).display
        })
        expect(gridStyles).toBe('flex')
      }
    }
  })

  test('cart page typography follows CLAUDE.md standards', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // H3 title should follow typography scale
    const pageTitle = page.locator('h3, [variant="h3"]').first()
    if (await pageTitle.isVisible()) {
      const titleStyles = await pageTitle.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight
        }
      })
      
      // H3 should be between 24-32px as per CLAUDE.md
      const fontSize = parseInt(titleStyles.fontSize)
      expect(fontSize).toBeGreaterThanOrEqual(24)
      expect(fontSize).toBeLessThanOrEqual(32)
      
      // Should have proper font weight (600 as per CLAUDE.md)
      expect(parseInt(titleStyles.fontWeight)).toBeGreaterThanOrEqual(600)
    }
    
    // Body text should follow standards
    const bodyText = page.locator('[variant="body1"], p').first()
    if (await bodyText.isVisible()) {
      const bodyStyles = await bodyText.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight
        }
      })
      
      // Body1 should be 16px (1rem)
      const fontSize = parseInt(bodyStyles.fontSize)
      expect(fontSize).toBe(16)
      
      // Line height should be 1.6
      const lineHeight = parseFloat(bodyStyles.lineHeight) / fontSize
      expect(lineHeight).toBeCloseTo(1.6, 1)
    }
  })

  test('cart page button sizes comply with CLAUDE.md', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Test different button sizes
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const buttonBox = await button.boundingBox()
        const buttonStyles = await button.evaluate(el => {
          const styles = window.getComputedStyle(el)
          return {
            fontSize: styles.fontSize,
            padding: styles.padding,
            minHeight: styles.minHeight
          }
        })
        
        if (buttonBox) {
          // Default buttons should be 40px height, large should be 48px
          expect(buttonBox.height).toBeGreaterThanOrEqual(40)
          
          // Font size should be appropriate (14px for small, 16px for default/large)
          const fontSize = parseInt(buttonStyles.fontSize)
          expect(fontSize).toBeGreaterThanOrEqual(14)
          expect(fontSize).toBeLessThanOrEqual(18)
        }
      }
    }
  })

  test('cart page icon sizes comply with CLAUDE.md', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Test icon sizes - should be 16px, 24px, or 32px
    const icons = page.locator('svg[data-testid$="Icon"], .MuiSvgIcon-root')
    const iconCount = await icons.count()
    
    for (let i = 0; i < Math.min(iconCount, 5); i++) {
      const icon = icons.nth(i)
      if (await icon.isVisible()) {
        const iconBox = await icon.boundingBox()
        if (iconBox) {
          const width = iconBox.width
          const height = iconBox.height
          
          // Icons should be one of the standard sizes: 16, 24, 32px
          const validSizes = [16, 24, 32]
          const isValidWidth = validSizes.some(size => Math.abs(width - size) <= 2)
          const isValidHeight = validSizes.some(size => Math.abs(height - size) <= 2)
          
          expect(isValidWidth).toBeTruthy()
          expect(isValidHeight).toBeTruthy()
        }
      }
    }
  })

  test('cart page IconButton sizes comply with CLAUDE.md on mobile', async ({ page }) => {
    await setViewport(page, 'xs')
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // IconButtons should be ≥44×44 on mobile
    const iconButtons = page.locator('button[class*="MuiIconButton"]')
    const iconButtonCount = await iconButtons.count()
    
    for (let i = 0; i < Math.min(iconButtonCount, 3); i++) {
      const iconButton = iconButtons.nth(i)
      if (await iconButton.isVisible()) {
        const buttonBox = await iconButton.boundingBox()
        if (buttonBox) {
          expect(buttonBox.width).toBeGreaterThanOrEqual(44)
          expect(buttonBox.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })

  test('cart page follows container sizing guidelines', async ({ page }) => {
    await page.goto('/cos')
    await waitForFontsLoaded(page)
    
    // Cards should use proper sizing (fit-content on desktop)
    const cards = page.locator('.MuiCard-root')
    const cardCount = await cards.count()
    
    if (cardCount > 0) {
      const firstCard = cards.first()
      const cardStyles = await firstCard.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          height: styles.height,
          maxHeight: styles.maxHeight,
          overflow: styles.overflow
        }
      })
      
      // Should not have fixed heights that create white space
      expect(cardStyles.height).not.toBe('100vh')
      expect(cardStyles.height).not.toContain('px')
    }
    
    // Container should have proper maxWidth
    const mainContainer = page.locator('[maxWidth="xl"], .MuiContainer-maxWidthXl').first()
    if (await mainContainer.isVisible()) {
      const containerStyles = await mainContainer.evaluate(el => {
        return window.getComputedStyle(el).maxWidth
      })
      
      // Should have reasonable max width
      const maxWidth = parseInt(containerStyles)
      expect(maxWidth).toBeGreaterThan(1200)
    }
  })

  test('cart popper component functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Find cart icon in navbar
    const cartIcon = page.locator('button').filter({ has: page.locator('svg[data-testid="ShoppingCartIcon"]') })
    await expect(cartIcon).toBeVisible()
    
    // Click cart icon to open popper
    await cartIcon.click()
    await page.waitForTimeout(500)
    
    // Popper should appear
    const popper = page.locator('[role="tooltip"], .MuiPopper-root').filter({ hasText: /coș de cumpărături/i })
    if (await popper.isVisible()) {
      // Popper should have proper sizing
      const popperBox = await popper.boundingBox()
      if (popperBox) {
        expect(popperBox.width).toBeGreaterThanOrEqual(350)
        expect(popperBox.width).toBeLessThanOrEqual(400)
      }
      
      // Should have proper content structure
      const emptyMessage = popper.locator('text=Coșul tău este gol')
      if (await emptyMessage.isVisible()) {
        const continueButton = popper.getByRole('button', { name: /continuă cumpărăturile/i })
        await expect(continueButton).toBeVisible()
      }
    }
  })
})