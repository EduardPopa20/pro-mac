import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Accessibility Standards (WCAG AA Compliance)', () => {
  
  test('keyboard navigation flow', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test Tab navigation through interactive elements
    const tabStops = [
      'search input',
      'favorites button', 
      'cart button',
      'mobile menu (if visible)',
      'main content links'
    ]

    // Start keyboard navigation
    await page.keyboard.press('Tab')
    
    // Verify search input receives focus
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeFocused()

    // Continue tabbing through elements
    await page.keyboard.press('Tab')
    
    // Check that focus moves to next interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Ensure focused elements have visible focus indicators
    const focusOutlineStyle = await focusedElement.evaluate(el => 
      window.getComputedStyle(el).outline
    )
    expect(focusOutlineStyle).not.toBe('none')
    expect(focusOutlineStyle).not.toBe('0px')
  })

  test('aria labels and roles', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Search input should have proper labeling
    const searchInput = page.getByPlaceholder('Caută produse...')
    const searchAriaLabel = await searchInput.getAttribute('aria-label')
    const searchPlaceholder = await searchInput.getAttribute('placeholder')
    
    // Should have either aria-label or meaningful placeholder
    expect(searchAriaLabel || searchPlaceholder).toBeTruthy()
    expect(searchPlaceholder).toBe('Caută produse...')

    // Navigation should have proper roles
    const nav = page.locator('nav, [role="navigation"], header').first()
    await expect(nav).toBeVisible()
    
    // Buttons should have accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        const hasAccessibleName = ariaLabel || (textContent && textContent.trim().length > 0)
        expect(hasAccessibleName).toBeTruthy()
      }
    }
  })

  test('color contrast compliance', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test text elements for sufficient contrast
    const textElements = page.locator('h1, h2, h3, p, button, a, span')
    const elementCount = await textElements.count()

    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          }
        })

        // Verify text is not invisible (same color as background)
        expect(styles.color).not.toBe(styles.backgroundColor)
        
        // Font size should meet minimum requirements for accessibility
        const fontSize = parseFloat(styles.fontSize)
        expect(fontSize).toBeGreaterThanOrEqual(14) // Minimum readable size
      }
    }
  })

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    if (headingCount > 0) {
      // Should have at least one h1
      const h1Elements = page.locator('h1')
      const h1Count = await h1Elements.count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
      
      // H1 should be visible and have meaningful content
      const firstH1 = h1Elements.first()
      if (await firstH1.isVisible()) {
        const h1Text = await firstH1.textContent()
        expect(h1Text?.trim()).toBeTruthy()
        expect(h1Text?.trim().length).toBeGreaterThan(3)
      }
    }

    // Images should have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const image = images.nth(i)
      if (await image.isVisible()) {
        const altText = await image.getAttribute('alt')
        expect(altText).toBeTruthy() // Should not be null/empty
      }
    }

    // Forms should have proper labels
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        const ariaLabel = await input.getAttribute('aria-label')
        const placeholder = await input.getAttribute('placeholder')
        const associatedLabel = await input.locator('xpath=//label[@for="' + await input.getAttribute('id') + '"]').count()
        
        // Should have some form of labeling
        const hasProperLabel = ariaLabel || placeholder || associatedLabel > 0
        expect(hasProperLabel).toBeTruthy()
      }
    }
  })

  test('mobile accessibility', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)

    // Touch targets should be at least 44x44px on mobile
    const interactiveElements = page.locator('button, a[href], input[type="button"], input[type="submit"]')
    const count = await interactiveElements.count()

    for (let i = 0; i < Math.min(count, 8); i++) {
      const element = interactiveElements.nth(i)
      if (await element.isVisible()) {
        const box = await element.boundingBox()
        if (box) {
          // WCAG AA requires minimum 44x44px touch targets
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    }

    // Text should be scalable and readable on mobile
    const textElements = page.locator('p, span, div, h1, h2, h3, button')
    const textCount = await textElements.count()
    
    for (let i = 0; i < Math.min(textCount, 8); i++) {
      const element = textElements.nth(i)
      if (await element.isVisible()) {
        const fontSize = await element.evaluate(el => 
          parseFloat(window.getComputedStyle(el).fontSize)
        )
        
        // Mobile text should be at least 16px to prevent zoom
        expect(fontSize).toBeGreaterThanOrEqual(16)
      }
    }
  })

  test('focus management', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Test that focus is properly managed in dynamic content
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.focus()
    await expect(searchInput).toBeFocused()

    // Type to trigger search dropdown
    await searchInput.fill('test')
    await page.waitForTimeout(500)

    // Check if dropdown appears and is accessible
    const dropdown = page.locator('[role="presentation"]')
    const isDropdownVisible = await dropdown.isVisible()
    
    if (isDropdownVisible) {
      // Dropdown should not steal focus from input
      await expect(searchInput).toBeFocused()
      
      // Arrow keys should navigate dropdown options if present
      await page.keyboard.press('ArrowDown')
      
      // Focus should remain manageable
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
  })

  test('error messaging accessibility', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    // If contact form exists, test error handling
    const contactForm = page.locator('form')
    const formExists = await contactForm.count() > 0
    
    if (formExists) {
      // Try to submit empty form to trigger validation
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        
        // Check for error messages
        const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
        const errorCount = await errorMessages.count()
        
        if (errorCount > 0) {
          // Error messages should be visible and accessible
          const firstError = errorMessages.first()
          await expect(firstError).toBeVisible()
          
          const errorText = await firstError.textContent()
          expect(errorText?.trim()).toBeTruthy()
        }
      }
    }
  })

  test('semantic html structure', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    // Check for proper semantic elements
    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()

    const header = page.locator('header, [role="banner"]')
    await expect(header).toBeVisible()

    // Navigation should use nav element or role
    const nav = page.locator('nav, [role="navigation"]')
    const navCount = await nav.count()
    expect(navCount).toBeGreaterThanOrEqual(1)

    // Lists should use proper list markup
    const lists = page.locator('ul, ol')
    const listCount = await lists.count()
    
    if (listCount > 0) {
      const firstList = lists.first()
      const listItems = firstList.locator('li')
      const itemCount = await listItems.count()
      
      if (itemCount > 0) {
        // List items should be properly nested
        await expect(listItems.first()).toBeVisible()
      }
    }
  })
})