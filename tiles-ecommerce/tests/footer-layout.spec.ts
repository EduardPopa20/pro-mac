import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Footer Layout and Horizontal Scroll Tests', () => {

  test('footer should not cause horizontal scroll', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test at different viewport sizes
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    
    for (const bp of breakpoints) {
      await setViewport(page, bp)
      await page.waitForTimeout(500) // Allow layout to settle
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      
      if (hasHorizontalScroll) {
        throw new Error(`Horizontal scroll detected at ${bp} breakpoint`)
      }
      expect(hasHorizontalScroll).toBe(false)
      
      // Check viewport width vs scroll width
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1) // Allow 1px tolerance
      
      console.log(`✓ ${bp}: Viewport ${viewportWidth}px, Scroll ${scrollWidth}px`)
    }
  })

  test('footer should be properly positioned and visible', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Find footer element
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    
    // Footer should be at the bottom of the page
    const footerBox = await footer.boundingBox()
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight)
    const viewportHeight = await page.evaluate(() => window.innerHeight)
    
    expect(footerBox).not.toBeNull()
    
    if (footerBox) {
      // Footer should be near the bottom of the document
      expect(footerBox.y + footerBox.height).toBeGreaterThan(viewportHeight * 0.8)
      
      // Footer should not extend beyond viewport width
      expect(footerBox.x).toBeGreaterThanOrEqual(0)
      expect(footerBox.x + footerBox.width).toBeLessThanOrEqual(page.viewportSize()!.width + 5) // 5px tolerance
    }
  })

  test('footer content should be readable and accessible', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const footer = page.locator('footer')
    
    // Check for main footer sections
    const companyInfo = footer.getByRole('heading', { name: 'Pro-Mac' })
    const productsSection = footer.getByRole('heading', { name: 'Produse' })
    const servicesSection = footer.getByRole('heading', { name: 'Servicii' })
    const contactSection = footer.getByRole('heading', { name: 'Contact' })
    
    await expect(companyInfo).toBeVisible()
    await expect(productsSection).toBeVisible()
    await expect(servicesSection).toBeVisible()
    await expect(contactSection).toBeVisible()
    
    // Check social media icons are clickable (WCAG compliance)
    const socialIcons = footer.locator('[aria-label*="social"], button').filter({ hasText: /facebook|instagram|youtube/i })
    const socialIconCount = await socialIcons.count()
    
    if (socialIconCount > 0) {
      for (let i = 0; i < socialIconCount; i++) {
        const icon = socialIcons.nth(i)
        if (await icon.isVisible()) {
          const iconBox = await icon.boundingBox()
          if (iconBox) {
            expect(iconBox.height).toBeGreaterThanOrEqual(44) // WCAG touch target
            expect(iconBox.width).toBeGreaterThanOrEqual(44)
          }
        }
      }
    }
  })

  test('footer should adapt to mobile layout properly', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    
    // On mobile, footer content should stack vertically
    const footerBox = await footer.boundingBox()
    expect(footerBox).not.toBeNull()
    
    if (footerBox) {
      // Footer should not be too wide on mobile
      expect(footerBox.width).toBeLessThanOrEqual(page.viewportSize()!.width)
      
      // Footer should not cause horizontal overflow
      expect(footerBox.x).toBeGreaterThanOrEqual(-5) // Small negative margin tolerance
    }
    
    // Check that footer links are accessible on mobile
    const footerLinks = footer.locator('a')
    const linkCount = await footerLinks.count()
    
    if (linkCount > 0) {
      // Check first few links for touch target compliance
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = footerLinks.nth(i)
        if (await link.isVisible()) {
          const linkBox = await link.boundingBox()
          if (linkBox) {
            expect(linkBox.height).toBeGreaterThanOrEqual(32) // Minimum for small text links
          }
        }
      }
    }
  })

  test('footer should not have layout shifts or overflow', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test for Cumulative Layout Shift (CLS) issues
    const initialFooterPosition = await page.locator('footer').boundingBox()
    
    // Wait for any potential layout shifts
    await page.waitForTimeout(2000)
    
    const finalFooterPosition = await page.locator('footer').boundingBox()
    
    expect(initialFooterPosition).not.toBeNull()
    expect(finalFooterPosition).not.toBeNull()
    
    if (initialFooterPosition && finalFooterPosition) {
      // Footer should not shift significantly after initial load
      const yShift = Math.abs(finalFooterPosition.y - initialFooterPosition.y)
      expect(yShift).toBeLessThan(10) // Less than 10px shift tolerance
    }
    
    // Check for content overflow beyond viewport
    const bodyOverflow = await page.evaluate(() => {
      const body = document.body
      const html = document.documentElement
      return {
        bodyScrollWidth: body.scrollWidth,
        bodyClientWidth: body.clientWidth,
        htmlScrollWidth: html.scrollWidth,
        htmlClientWidth: html.clientWidth,
        windowInnerWidth: window.innerWidth
      }
    })
    
    console.log('Overflow check:', bodyOverflow)
    
    // No element should cause horizontal scroll
    expect(bodyOverflow.htmlScrollWidth).toBeLessThanOrEqual(bodyOverflow.windowInnerWidth + 20) // 20px tolerance for scrollbar
  })

  test('footer background and styling should render correctly', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const footer = page.locator('footer')
    
    // Check footer background color (should be dark)
    const footerStyles = await footer.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        padding: styles.padding
      }
    })
    
    // Background should be dark (grey.900 equivalent)
    expect(footerStyles.backgroundColor).toMatch(/rgb\(33,\s*33,\s*33\)|rgb\(18,\s*18,\s*18\)|#212121|#121212/)
    
    // Text should be light colored
    expect(footerStyles.color).toMatch(/rgb\(255,\s*255,\s*255\)|white|#fff/)
    
    // Footer should have adequate padding
    expect(footerStyles.padding).not.toBe('0px')
  })
})