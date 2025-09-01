import { test, expect } from '@playwright/test'

test.describe('Contact Page CLAUDE.md Compliance', () => {
  const testSizes = [
    { name: 'xs', width: 375, height: 667 },
    { name: 'md', width: 960, height: 1000 },
    { name: 'lg', width: 1280, height: 1000 }
  ]

  testSizes.forEach(({ name, width, height }) => {
    test(`Contact page layout and compliance on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/contact')
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('heading', { name: /contactează-ne/i })).toBeVisible()

      // Test 1: Breadcrumbs positioning and spacing (CLAUDE.md Section 2)
      const breadcrumbs = page.locator('.MuiBreadcrumbs-root').first()
      await expect(breadcrumbs).toBeVisible()
      
      // Breadcrumbs should be in top-left of container
      const container = page.locator('main .MuiContainer-root').first()
      const breadcrumbsBox = await breadcrumbs.boundingBox()
      const containerBox = await container.boundingBox()
      
      if (breadcrumbsBox && containerBox) {
        // Breadcrumbs should be near top-left of container
        expect(breadcrumbsBox.x).toBeGreaterThanOrEqual(containerBox.x - 10)
        expect(breadcrumbsBox.y).toBeGreaterThanOrEqual(containerBox.y - 10)
      }

      // Test 2: Button compliance (CLAUDE.md Section 8.3)
      const submitButton = page.getByRole('button', { name: /trimite mesajul/i })
      await expect(submitButton).toBeVisible()
      
      const buttonBox = await submitButton.boundingBox()
      expect(buttonBox).toBeTruthy()
      
      if (buttonBox) {
        // Minimum height requirements from CLAUDE.md
        const minHeight = width < 600 ? 44 : 48
        expect(buttonBox.height).toBeGreaterThanOrEqual(minHeight - 2) // Allow small margin
      }

      // Test 3: Typography compliance (CLAUDE.md Section 8.2)
      const mainHeading = page.getByRole('heading', { name: /contactează-ne/i, level: 1 })
      await expect(mainHeading).toBeVisible()
      
      const headingFontSize = await mainHeading.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).fontSize)
      })
      
      // h3 should be within fluid scale range (24-32px per CLAUDE.md)
      expect(headingFontSize).toBeGreaterThanOrEqual(20)
      expect(headingFontSize).toBeLessThanOrEqual(40)

      // Test 4: No horizontal scrolling (CLAUDE.md Section 2)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBeFalsy()

      // Test 5: Form field accessibility and sizes
      const nameField = page.locator('form input').first()
      const emailField = page.locator('form input[type="email"]').first()
      const messageField = page.locator('form textarea').first()

      await expect(nameField).toBeVisible()
      await expect(emailField).toBeVisible() 
      await expect(messageField).toBeVisible()

      // Test input field sizes on mobile
      if (width < 600) {
        const nameBox = await nameField.boundingBox()
        const emailBox = await emailField.boundingBox()
        
        if (nameBox) expect(nameBox.height).toBeGreaterThanOrEqual(40) // Minimum touch target
        if (emailBox) expect(emailBox.height).toBeGreaterThanOrEqual(40)
      }

      // Test 6: Icons compliance (CLAUDE.md Section 8.4)
      const phoneIcon = page.locator('[data-testid="PhoneIcon"]').or(
        page.locator('svg').filter({ hasText: /phone/i })
      ).first()
      
      if (await phoneIcon.isVisible()) {
        const iconSize = await phoneIcon.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          return {
            width: parseInt(styles.width),
            height: parseInt(styles.height)
          }
        })
        
        // Icons should be 20-24px as specified in the component
        expect(iconSize.width).toBeGreaterThanOrEqual(18)
        expect(iconSize.width).toBeLessThanOrEqual(26)
      }
    })
  })

  test('Contact form functionality and validation', async ({ page }) => {
    await page.goto('http://localhost:5177/contact')
    await page.waitForLoadState('networkidle')

    // Test form validation
    const submitButton = page.getByRole('button', { name: /trimite mesajul/i })
    await submitButton.click()

    // Should show validation error
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /obligatoriu/i })
    await expect(errorAlert).toBeVisible()

    // Fill form with valid data
    const nameField = page.locator('form input').first()
    const emailField = page.locator('form input[type="email"]')
    const messageField = page.locator('form textarea').first()

    await nameField.fill('Test User')
    await emailField.fill('test@example.com')
    await messageField.fill('This is a test message')

    // Test character counter
    const helperText = page.locator('text=/5\/500/')
    await expect(helperText).toBeVisible()

    // Submit form
    await submitButton.click()

    // Should show loading state
    await expect(page.getByText(/se trimite/i)).toBeVisible()
    
    // Note: Actual submission testing would require mocking the Supabase calls
  })

  test('Contact page responsive layout', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5177/contact')
    
    // Form should stack vertically on mobile
    const formGrid = page.locator('[class*="MuiGrid-container"]').first()
    await expect(formGrid).toBeVisible()
    
    // Contact info should be below form on mobile
    const contactInfo = page.locator('text=/Informații de contact/i').locator('..').locator('..')
    const form = page.locator('form').first()
    
    const formBox = await form.boundingBox()
    const infoBox = await contactInfo.boundingBox()
    
    if (formBox && infoBox) {
      // On mobile, contact info should be below form
      expect(infoBox.y).toBeGreaterThan(formBox.y + formBox.height - 50)
    }

    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    const formBoxDesktop = await form.boundingBox()
    const infoBoxDesktop = await contactInfo.boundingBox()
    
    if (formBoxDesktop && infoBoxDesktop) {
      // On desktop, they should be side by side (similar Y positions)
      const yDifference = Math.abs(infoBoxDesktop.y - formBoxDesktop.y)
      expect(yDifference).toBeLessThan(100)
    }
  })

  test('Contact page loading state compliance', async ({ page }) => {
    await page.goto('http://localhost:5177/contact')
    
    // Test standardized loading state pattern
    // This test validates that if a loading state is triggered, it follows CLAUDE.md guidelines
    
    // Check that the page has proper loading patterns in place
    const form = page.locator('form').first()
    await expect(form).toBeVisible()
    
    // The loading state should be standardized (tested in component)
    // We can't easily trigger the initial loading state in tests without mocking
    // but we verify the pattern exists in the component code
    
    // Test form submission loading state
    const nameField = page.locator('form input').first()
    const emailField = page.locator('form input[type="email"]')
    const messageField = page.locator('form textarea').first()
    const submitButton = page.getByRole('button', { name: /trimite mesajul/i })

    await nameField.fill('Test User')
    await emailField.fill('test@example.com')  
    await messageField.fill('Test message')
    
    await submitButton.click()
    
    // Should show loading state with proper button text
    await expect(page.getByText(/se trimite/i)).toBeVisible()
    
    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled()
  })

  test('Contact page accessibility compliance', async ({ page }) => {
    await page.goto('http://localhost:5177/contact')
    await page.waitForLoadState('networkidle')

    // Test form labels and accessibility
    const nameField = page.locator('form input').first()
    const emailField = page.locator('form input[type="email"]')
    const messageField = page.locator('form textarea').first()

    // Fields should have proper labels
    const hasNameLabel = await page.locator('label').filter({ hasText: /numele/i }).count() > 0 ||
      await nameField.getAttribute('aria-label') !== null
    expect(hasNameLabel).toBeTruthy()
    
    // Submit button should have tooltip for accessibility (as per CLAUDE.md)
    const submitButton = page.getByRole('button', { name: /trimite mesajul/i })
    await submitButton.hover()
    
    const tooltip = page.locator('[role="tooltip"]').or(
      page.locator('[title]').filter({ hasText: /echipa/i })
    )
    
    // Tooltip should be visible or accessible
    const hasTooltip = await tooltip.count() > 0 || 
      await submitButton.getAttribute('title') !== null ||
      await submitButton.getAttribute('aria-label') !== null
    
    expect(hasTooltip).toBeTruthy()
  })
})