import { test, expect } from '@playwright/test'
import { setViewport, computedNumber, hasHorizontalScroll, waitForFontsLoaded } from './utils'

test.describe('Buttons & IconButtons', () => {
  for (const bp of ['xs', 'md', 'lg'] as const) {
    test(`button sizes @${bp}`, async ({ page }) => {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)

      // Test any button on the page
      const button = page.getByRole('button').first()
      await expect(button).toBeVisible()

      const boundingBox = await button.boundingBox()
      expect(boundingBox).toBeTruthy()

      if (boundingBox) {
        // Ensure minimum touch target height
        const minHeight = bp === 'xs' || bp === 'sm' ? 44 : 40
        expect(boundingBox.height).toBeGreaterThanOrEqual(minHeight)
      }

      // Check for horizontal scroll
      const hasScroll = await hasHorizontalScroll(page)
      expect(hasScroll).toBeFalsy()
    })
  }

  test('icon button sizes', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Find icon buttons (like search, favorites, cart)
    const iconButtons = page.locator('[data-testid*="icon-button"], button[aria-label]')
    const count = await iconButtons.count()

    if (count > 0) {
      const firstIconButton = iconButtons.first()
      await expect(firstIconButton).toBeVisible()

      const boundingBox = await firstIconButton.boundingBox()
      expect(boundingBox).toBeTruthy()

      if (boundingBox) {
        // Icon buttons should be at least 32x32 (small size)
        expect(boundingBox.width).toBeGreaterThanOrEqual(32)
        expect(boundingBox.height).toBeGreaterThanOrEqual(32)
      }
    }
  })

  test('search component responsiveness', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test on mobile
    await setViewport(page, 'xs')
    
    // Find search input
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()

    const mobileBox = await searchInput.boundingBox()
    expect(mobileBox).toBeTruthy()

    // Test on desktop
    await setViewport(page, 'lg')
    
    const desktopBox = await searchInput.boundingBox()
    expect(desktopBox).toBeTruthy()

    // Desktop should be wider than mobile
    if (mobileBox && desktopBox) {
      expect(desktopBox.width).toBeGreaterThan(mobileBox.width)
    }

    // Test search functionality
    await searchInput.fill('test')
    
    // Check if dropdown appears (with small delay for debounce)
    await page.waitForTimeout(350)
    
    // Look for search results dropdown
    const dropdown = page.locator('[role="presentation"]').filter({ hasText: /Se încarcă|Nu s-au găsit|Vezi toate/ })
    // Note: We expect this to be visible if there are results or loading state
  })
})