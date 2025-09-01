import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Visual Regression Testing', () => {
  
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

  test('homepage desktop layout', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'lg')
    await waitForFontsLoaded(page)
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(1000)
    
    // Take screenshot of entire homepage
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('homepage mobile layout', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('navbar component consistency', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Screenshot of navigation bar only
    const navbar = page.locator('header, [role="banner"]').first()
    await expect(navbar).toHaveScreenshot('navbar.png', {
      animations: 'disabled'
    })
  })

  test('search component states', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Search input - empty state
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toHaveScreenshot('search-empty.png')

    // Search input - focused state
    await searchInput.focus()
    await expect(searchInput).toHaveScreenshot('search-focused.png')

    // Search dropdown - loading/results state
    await searchInput.fill('gresie')
    await page.waitForTimeout(500)
    
    const dropdown = page.locator('[role="presentation"]')
    if (await dropdown.isVisible()) {
      await expect(dropdown).toHaveScreenshot('search-dropdown.png', {
        animations: 'disabled'
      })
    }
  })

  test('responsive breakpoint consistency', async ({ page }) => {
    const breakpoints = [
      { name: 'xs', width: 360, height: 720 },
      { name: 'sm', width: 600, height: 900 },
      { name: 'md', width: 960, height: 1000 },
      { name: 'lg', width: 1280, height: 1000 },
      { name: 'xl', width: 1920, height: 1080 }
    ]

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.goto('/')
      await waitForFontsLoaded(page)
      await page.waitForTimeout(500)

      // Screenshot header area at each breakpoint
      const header = page.locator('header').first()
      await expect(header).toHaveScreenshot(`header-${bp.name}.png`, {
        animations: 'disabled'
      })
    }
  })

  test('button states visual consistency', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Find buttons and test their visual states
    const buttons = page.locator('button').first()
    if (await buttons.isVisible()) {
      // Normal state
      await expect(buttons).toHaveScreenshot('button-normal.png')

      // Hover state
      await buttons.hover()
      await expect(buttons).toHaveScreenshot('button-hover.png')

      // Focus state  
      await buttons.focus()
      await expect(buttons).toHaveScreenshot('button-focus.png')
    }
  })

  test('form elements visual consistency', async ({ page }) => {
    // Test on contact page if it exists
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    const contactForm = page.locator('form').first()
    if (await contactForm.isVisible()) {
      await expect(contactForm).toHaveScreenshot('contact-form.png', {
        animations: 'disabled'
      })

      // Test form input states
      const firstInput = contactForm.locator('input, textarea').first()
      if (await firstInput.isVisible()) {
        // Empty state
        await expect(firstInput).toHaveScreenshot('input-empty.png')

        // Filled state
        await firstInput.fill('Test content')
        await expect(firstInput).toHaveScreenshot('input-filled.png')

        // Focus state
        await firstInput.focus()
        await expect(firstInput).toHaveScreenshot('input-focused.png')
      }
    }
  })

  test('error states visual consistency', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Try to trigger form validation errors
    const form = page.locator('form').first()
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first()
    
    if (await form.isVisible() && await submitButton.isVisible()) {
      // Submit empty form to trigger validation
      await submitButton.click()
      await page.waitForTimeout(1000)
      
      // Screenshot any error messages
      const errorElements = page.locator('[role="alert"], .error, .MuiFormHelperText-error')
      const errorCount = await errorElements.count()
      
      if (errorCount > 0) {
        await expect(errorElements.first()).toHaveScreenshot('form-error.png')
      }
    }
  })

  test('loading states visual consistency', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test search loading state
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('test')
    
    // Capture loading state quickly
    await page.waitForTimeout(100)
    const dropdown = page.locator('[role="presentation"]')
    
    if (await dropdown.isVisible()) {
      // Look for loading indicators (spinners, skeletons)
      const loadingIndicators = page.locator('.MuiCircularProgress-root, .MuiSkeleton-root, [data-testid*="loading"]')
      const loadingCount = await loadingIndicators.count()
      
      if (loadingCount > 0) {
        await expect(loadingIndicators.first()).toHaveScreenshot('loading-indicator.png')
      }
    }
  })

  test('cross-browser visual consistency', async ({ page, browserName }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    await page.waitForTimeout(1000)
    
    // Take screenshots specific to each browser
    await expect(page).toHaveScreenshot(`homepage-${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    })
    
    // Test search component across browsers
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toHaveScreenshot(`search-input-${browserName}.png`)
  })

  test('theme consistency check', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test that theme colors and typography are consistent
    const elements = await page.locator('h1, h2, button, a').all()
    
    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const element = elements[i]
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`theme-element-${i}.png`)
      }
    }
  })

  test('component isolation screenshots', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Screenshot individual components for design system documentation
    const components = [
      { selector: 'header', name: 'header-component' },
      { selector: '.MuiContainer-root', name: 'main-container' },
      { selector: '[data-testid="search-input"]', name: 'search-component' }
    ]

    for (const component of components) {
      const element = page.locator(component.selector).first()
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`${component.name}.png`, {
          animations: 'disabled'
        })
      }
    }
  })

  test('dynamic content visual stability', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test that dynamic content doesn't cause layout shifts
    const initialScreenshot = await page.screenshot({ fullPage: true })
    
    // Wait for any dynamic content to load
    await page.waitForTimeout(2000)
    
    const finalScreenshot = await page.screenshot({ fullPage: true })
    
    // Screenshots should be identical (no layout shifts)
    expect(initialScreenshot).toEqual(finalScreenshot)
  })
})