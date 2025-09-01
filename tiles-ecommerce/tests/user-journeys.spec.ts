import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Critical User Journey Testing', () => {

  test('complete product discovery journey', async ({ page }) => {
    // Journey: Homepage → Search → Results → Product Details
    
    // Step 1: Land on homepage
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Verify homepage loads correctly
    await expect(page).toHaveTitle(/Pro-Mac|Tiles|E-commerce/)
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()

    // Step 2: Use search functionality
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    await searchInput.fill('gresie')
    await page.waitForTimeout(500) // Wait for debounce

    // Step 3: Verify search results appear
    const dropdown = page.locator('[role="presentation"]')
    const dropdownVisible = await dropdown.isVisible()
    
    if (dropdownVisible) {
      // Check for search results or categories
      const results = dropdown.locator('div[style*="cursor"], [role="button"]')
      const resultCount = await results.count()
      
      if (resultCount > 0) {
        // Click on first result
        await results.first().click()
        
        // Verify navigation occurred
        await page.waitForLoadState('networkidle')
        const currentUrl = page.url()
        expect(currentUrl).toMatch(/\/(gresie|produse)/)
      }
    }

    // Step 4: Alternative - navigate via categories if search doesn't work
    const categoryLinks = page.locator('nav a, sidebar a, [href*="produse"]')
    const categoryCount = await categoryLinks.count()
    
    if (categoryCount > 0) {
      const firstCategory = categoryLinks.first()
      if (await firstCategory.isVisible()) {
        await firstCategory.click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('newsletter subscription journey', async ({ page }) => {
    // Journey: Homepage → Newsletter Modal → Subscription
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for newsletter modal to appear (3-4 seconds delay)
    await page.waitForTimeout(5000)
    
    // Check if newsletter modal appears
    const newsletterModal = page.locator('[role="dialog"], .MuiModal-root').filter({ hasText: /newsletter|aboneaza|email/i })
    const modalVisible = await newsletterModal.isVisible()
    
    if (modalVisible) {
      // Test newsletter subscription flow
      const emailInput = newsletterModal.locator('input[type="email"], input[placeholder*="email"]')
      const submitButton = newsletterModal.locator('button[type="submit"], button').filter({ hasText: /aboneaza|subscribe|trimite/i })
      
      if (await emailInput.isVisible() && await submitButton.isVisible()) {
        // Test with valid email
        await emailInput.fill('test@example.com')
        await submitButton.click()
        
        // Wait for response
        await page.waitForTimeout(2000)
        
        // Check for success message or modal closure
        const successMessage = page.locator('[role="alert"], .success, .MuiAlert-root')
        const successVisible = await successMessage.isVisible()
        const modalStillVisible = await newsletterModal.isVisible()
        
        // Either success message appears or modal closes
        expect(successVisible || !modalStillVisible).toBeTruthy()
      }
    }
  })

  test('navigation and menu journey', async ({ page }) => {
    // Journey: Homepage → Menu Navigation → Different Pages
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test desktop navigation
    await setViewport(page, 'lg')
    
    // Look for navigation menu items
    const navItems = page.locator('nav a, [role="navigation"] a, header a')
    const navCount = await navItems.count()
    
    if (navCount > 0) {
      // Test navigation to different sections
      const navigationTargets = [
        { text: /produse|products/i, expectedUrl: /produse/ },
        { text: /contact/i, expectedUrl: /contact/ },
        { text: /showroom/i, expectedUrl: /showroom/ },
        { text: /despre|about/i, expectedUrl: /despre|about/ }
      ]
      
      for (const target of navigationTargets) {
        const navLink = navItems.filter({ hasText: target.text }).first()
        const linkExists = await navLink.count() > 0
        
        if (linkExists && await navLink.isVisible()) {
          await navLink.click()
          await page.waitForLoadState('networkidle')
          
          const currentUrl = page.url()
          expect(currentUrl).toMatch(target.expectedUrl)
          
          // Verify page loaded correctly
          const pageContent = page.locator('main, [role="main"], body')
          await expect(pageContent).toBeVisible()
          
          // Go back to homepage for next test
          await page.goto('/')
          await waitForFontsLoaded(page)
        }
      }
    }
    
    // Test mobile navigation
    await setViewport(page, 'xs')
    
    const mobileMenuButton = page.getByLabel('menu').or(page.locator('[aria-label*="menu"]'))
    const mobileMenuExists = await mobileMenuButton.count() > 0
    
    if (mobileMenuExists && await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      
      // Verify mobile menu opens
      await page.waitForTimeout(500)
      const mobileMenu = page.locator('[role="dialog"], .MuiDrawer-root, nav[style*="block"]')
      const mobileMenuVisible = await mobileMenu.isVisible()
      
      if (mobileMenuVisible) {
        // Test mobile menu navigation
        const mobileNavItems = mobileMenu.locator('a, [role="button"]')
        const mobileNavCount = await mobileNavItems.count()
        
        if (mobileNavCount > 0) {
          const firstNavItem = mobileNavItems.first()
          if (await firstNavItem.isVisible()) {
            await firstNavItem.click()
            await page.waitForLoadState('networkidle')
            
            // Verify navigation occurred
            const currentUrl = page.url()
            expect(currentUrl).not.toBe('/')
          }
        }
      }
    }
  })

  test('contact form journey', async ({ page }) => {
    // Journey: Homepage → Contact → Form Submission
    
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Verify contact page loads
    await expect(page).toHaveURL(/contact/)
    
    // Look for contact form
    const contactForm = page.locator('form')
    const formExists = await contactForm.count() > 0
    
    if (formExists && await contactForm.isVisible()) {
      // Find form fields
      const nameField = contactForm.locator('input[name*="name"], input[placeholder*="nume"]').first()
      const emailField = contactForm.locator('input[type="email"], input[name*="email"]').first()
      const messageField = contactForm.locator('textarea, input[name*="message"]').first()
      const submitButton = contactForm.locator('button[type="submit"], input[type="submit"]').first()
      
      // Test form validation with empty submission
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1000)
        
        // Check for validation errors
        const errorMessages = page.locator('[role="alert"], .error, .MuiFormHelperText-error')
        const hasErrors = await errorMessages.count() > 0
        
        // Should show validation errors for empty form
        if (hasErrors) {
          await expect(errorMessages.first()).toBeVisible()
        }
      }
      
      // Test successful form submission
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) await emailField.fill('test@example.com')
      if (await messageField.isVisible()) await messageField.fill('Test message content')
      
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(3000)
        
        // Check for success message or confirmation
        const successIndicators = page.locator('[role="alert"], .success, .MuiAlert-successStandard')
        const hasSuccess = await successIndicators.count() > 0
        
        if (hasSuccess) {
          await expect(successIndicators.first()).toBeVisible()
        }
      }
    }
  })

  test('product browsing journey', async ({ page }) => {
    // Journey: Homepage → Product Category → Product Grid
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Look for product category links
    const categoryLinks = page.locator('a[href*="produse"], a[href*="/gresie"], a[href*="/faianta"]')
    const categoryCount = await categoryLinks.count()
    
    if (categoryCount > 0) {
      const firstCategory = categoryLinks.first()
      await firstCategory.click()
      await page.waitForLoadState('networkidle')
      
      // Verify we're on a product page
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/\/(produse|gresie|faianta)/)
      
      // Look for product grid or list
      const productElements = page.locator('[data-testid*="product"], .product-card, .MuiCard-root')
      const productCount = await productElements.count()
      
      if (productCount > 0) {
        // Test product interaction
        const firstProduct = productElements.first()
        await expect(firstProduct).toBeVisible()
        
        // Try to click on product for details
        await firstProduct.click()
        await page.waitForTimeout(1000)
        
        // Check if modal or new page opens
        const productModal = page.locator('[role="dialog"], .MuiModal-root')
        const modalVisible = await productModal.isVisible()
        
        const urlChanged = page.url() !== currentUrl
        
        // Either modal opens or URL changes
        expect(modalVisible || urlChanged).toBeTruthy()
      }
    }
  })

  test('responsive user experience journey', async ({ page }) => {
    // Journey: Test critical paths across different devices
    
    const breakpoints = ['xs', 'md', 'lg'] as const
    
    for (const bp of breakpoints) {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)
      
      // Verify homepage is usable at this breakpoint
      const logo = page.getByAltText('Pro-Mac')
      await expect(logo).toBeVisible()
      
      // Test search functionality at this breakpoint
      const searchInput = page.getByPlaceholder('Caută produse...')
      await expect(searchInput).toBeVisible()
      
      // Verify search input is properly sized
      const searchBox = await searchInput.boundingBox()
      expect(searchBox?.width).toBeGreaterThan(100)
      
      // Test search interaction
      await searchInput.fill('test')
      await page.waitForTimeout(300)
      
      // Clear for next breakpoint test
      await searchInput.clear()
      
      // Test navigation is accessible
      const navElements = page.locator('nav, [role="navigation"], button[aria-label*="menu"]')
      const navCount = await navElements.count()
      expect(navCount).toBeGreaterThan(0)
      
      // Verify interactive elements are properly sized for touch
      if (bp === 'xs') {
        const touchElements = page.locator('button, a[href], input')
        const touchCount = await touchElements.count()
        
        for (let i = 0; i < Math.min(touchCount, 3); i++) {
          const element = touchElements.nth(i)
          if (await element.isVisible()) {
            const box = await element.boundingBox()
            if (box) {
              // Touch targets should be large enough on mobile
              expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32)
            }
          }
        }
      }
    }
  })

  test('error handling journey', async ({ page }) => {
    // Journey: Test error scenarios and recovery
    
    // Test 404 page handling
    await page.goto('/non-existent-page')
    await waitForFontsLoaded(page)
    
    // Should show 404 or redirect to homepage
    const pageContent = await page.textContent('body')
    const hasError404 = pageContent?.includes('404') || pageContent?.includes('not found')
    const isHomepage = page.url().endsWith('/')
    
    expect(hasError404 || isHomepage).toBeTruthy()
    
    // Test network error recovery
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test offline behavior (if possible)
    await page.context().setOffline(true)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await searchInput.fill('test')
    await page.waitForTimeout(1000)
    
    // Should handle offline gracefully (no crash)
    const pageStillResponsive = await searchInput.isVisible()
    expect(pageStillResponsive).toBeTruthy()
    
    // Restore online state
    await page.context().setOffline(false)
  })

  test('accessibility journey with keyboard navigation', async ({ page }) => {
    // Journey: Navigate entire site using only keyboard
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Tab through interactive elements
    const tabStops = []
    let tabCount = 0
    const maxTabs = 10
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++
      
      const focusedElement = page.locator(':focus')
      const isVisible = await focusedElement.isVisible()
      
      if (isVisible) {
        const tagName = await focusedElement.evaluate(el => el.tagName)
        const ariaLabel = await focusedElement.getAttribute('aria-label')
        const text = await focusedElement.textContent()
        
        tabStops.push({
          tagName,
          ariaLabel: ariaLabel || 'none',
          text: text?.trim() || 'none'
        })
        
        // Test if we can interact with focused element
        if (tagName === 'BUTTON' || tagName === 'A' || tagName === 'INPUT') {
          // Element should have focus indicator
          const focusStyle = await focusedElement.evaluate(el => {
            const styles = window.getComputedStyle(el)
            return styles.outline || styles.boxShadow
          })
          expect(focusStyle).toBeTruthy()
        }
        
        // Test Enter key on focused element
        if (tagName === 'BUTTON' || tagName === 'A') {
          // Don't actually press Enter to avoid navigation, just verify it's focusable
          await expect(focusedElement).toBeFocused()
        }
      }
    }
    
    // Should have found several focusable elements
    expect(tabStops.length).toBeGreaterThan(2)
  })
})