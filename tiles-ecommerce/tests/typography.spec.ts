import { test, expect } from '@playwright/test'
import { setViewport, computedNumber, hasHorizontalScroll, waitForFontsLoaded } from './utils'

test.describe('Typography Standards', () => {
  const breakpoints = ['xs', 'md', 'lg'] as const

  for (const bp of breakpoints) {
    test(`typography sizes @${bp}`, async ({ page }) => {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)

      // Test body text (should be readable - minimum 14px)
      const bodyText = page.locator('p, .MuiTypography-body1, .MuiTypography-body2').first()
      if (await bodyText.isVisible()) {
        const fontSize = await computedNumber(page, bodyText, 'font-size')
        expect(fontSize).toBeGreaterThanOrEqual(14) // Minimum readable size
      }

      // Test headings exist and have appropriate sizes
      const h1 = page.locator('h1, .MuiTypography-h1').first()
      if (await h1.isVisible()) {
        const h1Size = await computedNumber(page, h1, 'font-size')
        // H1 should be larger than body text
        expect(h1Size).toBeGreaterThanOrEqual(24)
        
        // On desktop, should be larger than mobile
        if (bp === 'lg') {
          expect(h1Size).toBeGreaterThanOrEqual(32)
        }
      }

      // Test no text is too small (accessibility)
      const allText = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a, label')
      const count = await allText.count()
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = allText.nth(i)
        if (await element.isVisible()) {
          const fontSize = await computedNumber(page, element, 'font-size')
          // No text should be smaller than 12px (WCAG AA)
          expect(fontSize).toBeGreaterThanOrEqual(12)
        }
      }

      // Check for horizontal scroll
      const hasScroll = await hasHorizontalScroll(page)
      expect(hasScroll).toBeFalsy()
    })
  }

  test('search component typography', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()

    // Input text should be readable
    const inputFontSize = await computedNumber(page, searchInput, 'font-size')
    expect(inputFontSize).toBeGreaterThanOrEqual(14)

    // Test placeholder visibility
    const placeholder = await searchInput.getAttribute('placeholder')
    expect(placeholder).toBe('Caută produse...')
  })

  test('responsive spacing and line height', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test mobile spacing
    await setViewport(page, 'xs')
    
    // Find main content container
    const mainContent = page.locator('main, [role="main"], .MuiContainer-root').first()
    if (await mainContent.isVisible()) {
      const mobilePadding = await computedNumber(page, mainContent, 'padding-left')
      expect(mobilePadding).toBeGreaterThanOrEqual(16) // Minimum mobile padding
    }

    // Test desktop spacing
    await setViewport(page, 'lg')
    
    if (await mainContent.isVisible()) {
      const desktopPadding = await computedNumber(page, mainContent, 'padding-left')
      expect(desktopPadding).toBeGreaterThanOrEqual(24) // More padding on desktop
    }

    // Test line heights for readability
    const paragraphs = page.locator('p, .MuiTypography-body1, .MuiTypography-body2')
    const pCount = await paragraphs.count()
    
    if (pCount > 0) {
      const firstPara = paragraphs.first()
      const lineHeight = await computedNumber(page, firstPara, 'line-height')
      const fontSize = await computedNumber(page, firstPara, 'font-size')
      
      // Line height should be at least 1.4 times font size for readability
      const ratio = lineHeight / fontSize
      expect(ratio).toBeGreaterThanOrEqual(1.4)
    }
  })
})