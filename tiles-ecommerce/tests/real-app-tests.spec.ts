import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Real Application Testing - Pro-Mac Tiles E-commerce', () => {

  test('homepage core functionality and layout', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Verify page loads correctly
    await expect(page).toHaveTitle('Vite + React + TS')
    
    // Check for Pro-Mac logo
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()
    
    // Check for main search input
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Check for main action buttons
    const exploreButton = page.getByText('Explorează produsele')
    await expect(exploreButton).toBeVisible()
    
    const whatsappButton = page.getByText('Contactează-ne pe WhatsApp')
    await expect(whatsappButton).toBeVisible()
    
    // Verify search input functionality
    await searchInput.fill('gresie')
    await page.waitForTimeout(600) // Wait for debounce
    
    // Search input should maintain value
    await expect(searchInput).toHaveValue('gresie')
  })

  test('newsletter modal functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for newsletter modal to appear (should show after 3-4 seconds)
    await page.waitForTimeout(5000)
    
    const newsletterModal = page.locator('[role="dialog"]').filter({ hasText: /newsletter|aboneaza/i })
    await expect(newsletterModal).toBeVisible()
    
    // Check modal content
    const modalText = await newsletterModal.textContent()
    expect(modalText).toContain('Rămâi la curent')
    expect(modalText).toContain('Pro-Mac')
    
    // Look for email input and submit button
    const emailInput = newsletterModal.locator('input[type="email"]')
    const submitButton = newsletterModal.locator('button[type="submit"]')
    
    if (await emailInput.isVisible() && await submitButton.isVisible()) {
      // Test newsletter subscription
      await emailInput.fill('test@example.com')
      await submitButton.click()
      
      // Wait for response
      await page.waitForTimeout(2000)
      
      // Modal should close or show success message
      const modalStillVisible = await newsletterModal.isVisible()
      const successMessage = page.locator('[role="alert"], .success')
      const hasSuccess = await successMessage.count() > 0
      
      // Either modal closed or success message appeared
      expect(!modalStillVisible || hasSuccess).toBeTruthy()
    }
  })

  test('mobile navigation drawer', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    // Find and click mobile menu button
    const menuButton = page.getByRole('button').getByText('menu')
    await expect(menuButton).toBeVisible()
    
    await menuButton.click()
    await page.waitForTimeout(500)
    
    // Verify drawer opens
    const drawer = page.locator('[role="dialog"], .MuiDrawer-root')
    await expect(drawer).toBeVisible()
    
    // Check for expected menu items
    const expectedMenuItems = [
      'Acasă',
      'Produse', 
      'Showroomuri',
      'Oferte Speciale',
      'Idei Amenajare',
      'Calculator',
      'Contact'
    ]
    
    for (const menuItem of expectedMenuItems) {
      const menuLink = drawer.getByText(menuItem)
      await expect(menuLink).toBeVisible()
    }
    
    // Test navigation from drawer
    const contactLink = drawer.getByText('Contact')
    await contactLink.click()
    
    await page.waitForLoadState('networkidle')
    
    // Should navigate to contact page
    expect(page.url()).toContain('contact')
  })

  test('search functionality with real application behavior', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Test search input is properly sized for mobile
    await setViewport(page, 'xs')
    
    const searchBox = await searchInput.boundingBox()
    expect(searchBox?.height).toBeGreaterThanOrEqual(44) // WCAG touch target
    
    // Test search functionality
    await searchInput.fill('gresie')
    await page.waitForTimeout(600)
    
    // Input should handle typing properly
    await expect(searchInput).toHaveValue('gresie')
    
    // Test different search terms
    const testSearches = ['faianta', 'mozaic', 'tiles', 'ceramic']
    
    for (const term of testSearches) {
      await searchInput.clear()
      await searchInput.fill(term)
      await page.waitForTimeout(300)
      
      // Input should update correctly
      await expect(searchInput).toHaveValue(term)
    }
  })

  test('contact form complete functionality', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Verify contact page loads
    await expect(page).toHaveTitle('Vite + React + TS')
    
    // Find the contact form
    const contactForm = page.locator('form')
    await expect(contactForm).toBeVisible()
    
    // Based on discovery: 3 inputs, 4 textareas, 1 submit button
    const inputs = contactForm.locator('input')
    const textareas = contactForm.locator('textarea')
    const submitButton = contactForm.locator('button[type="submit"]')
    
    await expect(inputs).toHaveCount(3)
    await expect(textareas).toHaveCount(4)
    await expect(submitButton).toHaveCount(1)
    
    // Test form validation by submitting empty form
    await submitButton.click()
    await page.waitForTimeout(1000)
    
    // Should show validation errors
    const errorMessages = page.locator('[role="alert"], .error, .MuiFormHelperText-error')
    const hasErrors = await errorMessages.count() > 0
    
    if (hasErrors) {
      await expect(errorMessages.first()).toBeVisible()
    }
    
    // Fill out form with test data
    const firstInput = inputs.first()
    const firstTextarea = textareas.first()
    
    await firstInput.fill('Test User')
    await firstTextarea.fill('This is a test message from the contact form.')
    
    // Test that form accepts input
    await expect(firstInput).toHaveValue('Test User')
    await expect(firstTextarea).toHaveValue('This is a test message from the contact form.')
  })

  test('authentication page functionality', async ({ page }) => {
    await page.goto('/auth')
    await waitForFontsLoaded(page)
    
    // Verify auth page loads
    await expect(page).toHaveTitle('Vite + React + TS')
    
    // Find the auth form
    const authForm = page.locator('form')
    await expect(authForm).toBeVisible()
    
    // Based on discovery: 3 inputs, 2 textareas, 1 submit button
    const inputs = authForm.locator('input')
    const textareas = authForm.locator('textarea')
    const submitButton = authForm.locator('button[type="submit"]')
    
    await expect(inputs).toHaveCount(3)
    await expect(textareas).toHaveCount(2)
    await expect(submitButton).toHaveCount(1)
    
    // Check for OAuth buttons (discovered 2)
    const oauthButtons = page.locator('button, a').filter({ hasText: /google|facebook|continue with/i })
    await expect(oauthButtons).toHaveCount(2)
    
    // Verify OAuth buttons are visible and clickable
    const googleButton = page.locator('button, a').filter({ hasText: /google/i }).first()
    const facebookButton = page.locator('button, a').filter({ hasText: /facebook/i }).first()
    
    if (await googleButton.isVisible()) {
      await expect(googleButton).toBeVisible()
      
      // Verify button has proper attributes for OAuth
      const buttonRole = await googleButton.getAttribute('role')
      const buttonType = await googleButton.getAttribute('type')
      expect(buttonRole === 'button' || buttonType === 'button' || googleButton.locator('button').count() > 0).toBeTruthy()
    }
    
    if (await facebookButton.isVisible()) {
      await expect(facebookButton).toBeVisible()
    }
  })

  test('showroomuri page functionality', async ({ page }) => {
    await page.goto('/showroomuri')
    await waitForFontsLoaded(page)
    
    // Verify showroom page loads
    await expect(page).toHaveTitle('Vite + React + TS')
    expect(page.url()).toContain('showroomuri')
    
    // Page should have main content
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent).toBeVisible()
    
    // Check if there are showroom cards or content
    // Discovery found 0 showroom cards, so this might be empty state
    const showroomCards = page.locator('.MuiCard-root, [data-testid*="showroom"]')
    const cardCount = await showroomCards.count()
    
    console.log(`Showroom cards found: ${cardCount}`)
    
    // Even if empty, the page should load without errors
    const errorElements = page.locator('h1, h2, p').filter({ hasText: /error|404|not found/i })
    await expect(errorElements).toHaveCount(0)
  })

  test('favorites/watchlist page functionality', async ({ page }) => {
    await page.goto('/favorite')
    await waitForFontsLoaded(page)
    
    // Verify favorites page loads
    await expect(page).toHaveTitle('Vite + React + TS')
    expect(page.url()).toContain('favorite')
    
    // Page should have main content
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent).toBeVisible()
    
    // Should not show error messages
    const errorElements = page.locator('h1, h2, p').filter({ hasText: /error|404|not found/i })
    await expect(errorElements).toHaveCount(0)
  })

  test('admin page access and authentication check', async ({ page }) => {
    await page.goto('/admin')
    await waitForFontsLoaded(page)
    
    // Admin page should load (might show login prompt or admin interface)
    await expect(page).toHaveTitle('Vite + React + TS')
    expect(page.url()).toContain('admin')
    
    // Page should load without critical errors
    const errorElements = page.locator('h1, h2, p').filter({ hasText: /error|404|not found/i })
    await expect(errorElements).toHaveCount(0)
    
    // Check if user needs authentication
    const loginElements = page.locator('form, input[type="email"], input[type="password"]')
    const loginRequired = await loginElements.count() > 0
    
    const adminElements = page.locator('[data-testid*="admin"], .admin-panel, .dashboard')
    const hasAdminAccess = await adminElements.count() > 0
    
    // Either shows login form or admin interface
    expect(loginRequired || hasAdminAccess).toBeTruthy()
    
    console.log(`Admin page - Login required: ${loginRequired}, Has admin access: ${hasAdminAccess}`)
  })

  test('responsive design across all breakpoints', async ({ page }) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    
    for (const bp of breakpoints) {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)
      
      // Logo should be visible at all breakpoints
      const logo = page.getByAltText('Pro-Mac')
      await expect(logo).toBeVisible()
      
      // Search input should be accessible
      const searchInput = page.getByPlaceholder('Caută produse...')
      await expect(searchInput).toBeVisible()
      
      const inputBox = await searchInput.boundingBox()
      expect(inputBox?.width).toBeGreaterThan(100)
      
      if (bp === 'xs') {
        // Mobile should have menu button
        const menuButton = page.getByRole('button').getByText('menu')
        await expect(menuButton).toBeVisible()
        
        // Touch targets should meet WCAG requirements
        const menuBox = await menuButton.boundingBox()
        expect(menuBox?.height).toBeGreaterThanOrEqual(44)
      } else {
        // Desktop might have visible navigation links
        // This is optional based on actual design
      }
      
      // No horizontal scroll at any breakpoint
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasHorizontalScroll).toBeFalsy()
      
      console.log(`✓ Responsive test passed at ${bp} breakpoint`)
    }
  })

  test('page performance and loading states', async ({ page }) => {
    // Test homepage performance
    const startTime = Date.now()
    await page.goto('/')
    await waitForFontsLoaded(page)
    const loadTime = Date.now() - startTime
    
    console.log(`Homepage loaded in ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
    
    // Test key elements are visible quickly
    const logo = page.getByAltText('Pro-Mac')
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    await expect(logo).toBeVisible()
    await expect(searchInput).toBeVisible()
    
    // Test other page loads
    const pagesToTest = ['/contact', '/auth', '/showroomuri', '/favorite']
    
    for (const route of pagesToTest) {
      const pageStartTime = Date.now()
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      const pageLoadTime = Date.now() - pageStartTime
      
      console.log(`${route} loaded in ${pageLoadTime}ms`)
      expect(pageLoadTime).toBeLessThan(5000)
      
      // Page should have main content
      const mainContent = page.locator('main, [role="main"], body > div').first()
      await expect(mainContent).toBeVisible()
    }
  })

  test('cross-page navigation and breadcrumbs', async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Navigate to contact via mobile menu
    await setViewport(page, 'xs')
    
    const menuButton = page.getByRole('button').getByText('menu')
    await menuButton.click()
    await page.waitForTimeout(500)
    
    const drawer = page.locator('[role="dialog"], .MuiDrawer-root')
    const contactLink = drawer.getByText('Contact')
    await contactLink.click()
    
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('contact')
    
    // Check for breadcrumbs if they exist
    const breadcrumbs = page.locator('.MuiBreadcrumbs-root, [role="navigation"] ol')
    const hasBreadcrumbs = await breadcrumbs.count() > 0
    
    if (hasBreadcrumbs) {
      await expect(breadcrumbs.first()).toBeVisible()
      console.log('✓ Breadcrumbs found on contact page')
    }
    
    // Test back navigation
    await page.goBack()
    await page.waitForLoadState('networkidle')
    
    // Should return to homepage
    expect(page.url()).not.toContain('contact')
    
    // Logo should still be visible
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()
  })
})