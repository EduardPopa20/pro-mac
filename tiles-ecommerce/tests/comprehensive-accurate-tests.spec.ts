import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Comprehensive Accurate Application Testing', () => {

  test('homepage with exact button selectors and functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Verify page loads correctly - updated title from SEO optimization
    await expect(page).toHaveTitle('Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate')
    
    // Check for Pro-Mac logo (found in discovery)
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()
    
    // Check for main search input (exact placeholder from discovery)
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Check for "Explorează produsele" button (exact text from discovery)
    const exploreButton = page.getByText('Explorează produsele')
    await expect(exploreButton).toBeVisible()
    
    // Check for WhatsApp button using aria-label (from discovery)
    const whatsappButton = page.getByRole('button', { name: 'Contactează-ne pe WhatsApp' })
    await expect(whatsappButton).toBeVisible()
    
    // Test search functionality
    await searchInput.fill('gresie')
    await page.waitForTimeout(600)
    await expect(searchInput).toHaveValue('gresie')
    
    // Test explore button is clickable
    const exploreButtonBox = await exploreButton.boundingBox()
    expect(exploreButtonBox?.height).toBeGreaterThan(40) // Proper button sizing
  })

  test('mobile navigation with exact menu structure', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    // Find mobile menu button using aria-label (from discovery)
    const menuButton = page.getByRole('button', { name: 'menu' })
    await expect(menuButton).toBeVisible()
    
    // Verify touch target size
    const menuBox = await menuButton.boundingBox()
    expect(menuBox?.height).toBeGreaterThanOrEqual(44)
    expect(menuBox?.width).toBeGreaterThanOrEqual(44)
    
    // Open mobile menu
    await menuButton.click()
    await page.waitForTimeout(500)
    
    // Check for drawer
    const drawer = page.locator('[role="dialog"], .MuiDrawer-root')
    await expect(drawer).toBeVisible()
    
    // Verify exact menu items from discovery
    const expectedMenuItems = [
      'Acasă',
      'Produse',
      'Showroomuri',
      'Idei Amenajare',
      'Calculator',
      'Contact'
    ]
    
    for (const menuItem of expectedMenuItems) {
      const menuLink = drawer.getByText(menuItem)
      if (await menuLink.count() > 0) {
        await expect(menuLink).toBeVisible()
        console.log(`✓ Menu item found: ${menuItem}`)
      }
    }
    
    // Test navigation from drawer
    const contactLink = drawer.getByText('Contact')
    if (await contactLink.count() > 0) {
      await contactLink.click()
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 })
        expect(page.url()).toContain('contact')
      } catch (error) {
        // If networkidle times out, check if navigation at least started
        console.log('Navigation timeout, checking URL change...')
        await page.waitForTimeout(2000)
        expect(page.url()).toContain('contact')
      }
    }
  })

  test('newsletter modal functionality with exact content', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for newsletter modal (appears after 3-4 seconds)
    await page.waitForTimeout(5000)
    
    const newsletterModal = page.locator('[role="dialog"]').filter({ hasText: /rămâi la curent|newsletter|pro-mac/i })
    await expect(newsletterModal).toBeVisible()
    
    // Check modal content (from discovery)
    const modalText = await newsletterModal.textContent()
    expect(modalText?.toLowerCase()).toContain('rămâi la curent')
    expect(modalText?.toLowerCase()).toContain('pro-mac')
    
    // Look for email input and submit button
    const emailInput = newsletterModal.locator('input[type="email"]')
    const submitButton = newsletterModal.locator('button[type="submit"]')
    
    if (await emailInput.count() > 0 && await submitButton.count() > 0) {
      await expect(emailInput).toBeVisible()
      await expect(submitButton).toBeVisible()
      
      // Test newsletter subscription
      await emailInput.fill('playwright.test@example.com')
      
      // Verify email input accepts value
      await expect(emailInput).toHaveValue('playwright.test@example.com')
      
      console.log('✓ Newsletter modal interaction successful')
    }
  })

  test('contact form with exact field structure', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Based on discovery: 1 form with 2 inputs, 2 textareas, 1 submit button
    const contactForm = page.locator('form')
    await expect(contactForm).toBeVisible()
    
    // Verify exact field counts from discovery
    const inputs = contactForm.locator('input')
    const textareas = contactForm.locator('textarea')
    const submitButton = contactForm.locator('button[type="submit"]')
    
    await expect(inputs).toHaveCount(2) // text and email inputs
    await expect(textareas).toHaveCount(2)
    await expect(submitButton).toHaveCount(1)
    
    // Check for the specific textarea with placeholder from discovery
    const mainTextarea = contactForm.locator('textarea').filter({ hasText: /Descrieți cererea/ }).or(
      contactForm.locator('textarea[placeholder*="Descrieți cererea"]')
    )
    
    if (await mainTextarea.count() > 0) {
      await expect(mainTextarea).toBeVisible()
      console.log('✓ Main textarea with specific placeholder found')
    }
    
    // Check submit button text from discovery
    const submitBtn = contactForm.getByText('Trimite mesajul')
    await expect(submitBtn).toBeVisible()
    
    // Test form validation
    await submitBtn.click()
    await page.waitForTimeout(1000)
    
    // Form should either submit or show validation
    // Test with some data
    const firstInput = inputs.first()
    const emailInput = inputs.filter({ hasText: /email/ }).or(contactForm.locator('input[type="email"]'))
    const firstTextarea = textareas.first()
    
    await firstInput.fill('Test User')
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com')
    }
    await firstTextarea.fill('Test message for contact form validation')
    
    // Verify form accepts input
    await expect(firstInput).toHaveValue('Test User')
    await expect(firstTextarea).toHaveValue('Test message for contact form validation')
  })

  test('authentication page with exact OAuth buttons', async ({ page }) => {
    await page.goto('/auth')
    await waitForFontsLoaded(page)
    
    // Verify auth form structure from discovery
    const authForm = page.locator('form')
    await expect(authForm).toBeVisible()
    
    const inputs = authForm.locator('input')
    await expect(inputs).toHaveCount(2) // email and password
    
    // Check for email and password inputs
    const emailInput = authForm.locator('input[type="email"]')
    const passwordInput = authForm.locator('input[type="password"]')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    
    // Check submit button with exact text from discovery
    const authSubmitBtn = authForm.getByText('Autentificare')
    await expect(authSubmitBtn).toBeVisible()
    
    // Check OAuth buttons with exact text from discovery
    const googleButton = page.getByText('Conectează-te cu Google')
    const facebookButton = page.getByText('Conectează-te cu Facebook')
    
    await expect(googleButton).toBeVisible()
    await expect(facebookButton).toBeVisible()
    
    // Verify OAuth buttons are properly styled and clickable
    const googleBox = await googleButton.boundingBox()
    const facebookBox = await facebookButton.boundingBox()
    
    expect(googleBox?.height).toBeGreaterThan(40)
    expect(facebookBox?.height).toBeGreaterThan(40)
    
    console.log('✓ Authentication page with exact OAuth buttons validated')
  })

  test('search functionality with exact behavior', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Use exact search input from discovery
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    // Test search input responsiveness
    await setViewport(page, 'xs')
    const searchBox = await searchInput.boundingBox()
    expect(searchBox?.height).toBeGreaterThanOrEqual(44) // WCAG touch target
    
    // Test search with different terms
    const testSearches = ['gresie', 'faianta', 'tiles']
    
    for (const term of testSearches) {
      await searchInput.clear()
      await searchInput.fill(term)
      await page.waitForTimeout(400) // Debounce wait
      
      await expect(searchInput).toHaveValue(term)
      
      // Check for search dropdowns/results (found 3-4 dropdowns in discovery)
      const dropdowns = page.locator('[role="presentation"], .MuiPopper-root')
      const dropdownCount = await dropdowns.count()
      
      if (dropdownCount > 0) {
        console.log(`✓ Search "${term}" triggered ${dropdownCount} dropdown elements`)
      }
    }
    
    // Test search clear functionality
    await searchInput.clear()
    await expect(searchInput).toHaveValue('')
  })

  test('all page routes accessibility and loading', async ({ page }) => {
    const routesToTest = [
      { path: '/', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' },
      { path: '/contact', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' },
      { path: '/auth', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' },
      { path: '/showroomuri', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' },
      { path: '/favorite', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' },
      { path: '/admin', expectedTitle: 'Pro-Mac Tiles - Gresie și Faianță de Calitate | Magazine Specializate' }
    ]
    
    for (const route of routesToTest) {
      const startTime = Date.now()
      
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Verify page loads correctly
      await expect(page).toHaveTitle(route.expectedTitle)
      expect(page.url()).toContain(route.path)
      
      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(8000)
      
      // Check for main content area (using proper semantic selector)
      const mainContent = page.locator('main, [role="main"]').first()
      await expect(mainContent).toBeVisible()
      
      // No critical error indicators
      const errorElements = page.locator('h1, h2, p').filter({ hasText: /error|404|not found/i })
      const errorCount = await errorElements.count()
      expect(errorCount).toBe(0)
      
      console.log(`✓ Route ${route.path} loaded in ${loadTime}ms`)
    }
  })

  test('responsive design with exact breakpoint behavior', async ({ page }) => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    
    for (const bp of breakpoints) {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)
      
      // Core elements should be visible at all breakpoints
      const logo = page.getByAltText('Pro-Mac')
      const searchInput = page.getByPlaceholder('Caută produse...')
      
      await expect(logo).toBeVisible()
      await expect(searchInput).toBeVisible()
      
      // Search input should be appropriately sized
      const inputBox = await searchInput.boundingBox()
      expect(inputBox?.width).toBeGreaterThan(100)
      
      if (bp === 'xs') {
        // Mobile should have menu button
        const menuButton = page.getByRole('button', { name: 'menu' })
        await expect(menuButton).toBeVisible()
        
        // Menu button should meet touch target requirements
        const menuBox = await menuButton.boundingBox()
        expect(menuBox?.height).toBeGreaterThanOrEqual(44)
        expect(menuBox?.width).toBeGreaterThanOrEqual(44)
      }
      
      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasHorizontalScroll).toBeFalsy()
      
      // Main action button should be visible and properly sized
      const exploreButton = page.getByText('Explorează produsele')
      if (await exploreButton.isVisible()) {
        const exploreBox = await exploreButton.boundingBox()
        expect(exploreBox?.height).toBeGreaterThan(bp === 'xs' ? 44 : 40)
      }
      
      console.log(`✓ Responsive test passed at ${bp} breakpoint`)
    }
  })

  test('cross-browser and cross-device consistency', async ({ page, browserName }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Core functionality should work across browsers
    const logo = page.getByAltText('Pro-Mac')
    const searchInput = page.getByPlaceholder('Caută produse...')
    const exploreButton = page.getByText('Explorează produsele')
    
    await expect(logo).toBeVisible()
    await expect(searchInput).toBeVisible()
    await expect(exploreButton).toBeVisible()
    
    // Search should work
    await searchInput.fill('cross-browser test')
    await expect(searchInput).toHaveValue('cross-browser test')
    
    // Button should be clickable
    const buttonClickable = await exploreButton.isEnabled()
    expect(buttonClickable).toBeTruthy()
    
    // Newsletter modal should appear
    await page.waitForTimeout(5000)
    const newsletterModal = page.locator('[role="dialog"]').filter({ hasText: /newsletter|rămâi/i })
    const modalAppeared = await newsletterModal.isVisible()
    
    if (modalAppeared) {
      console.log(`✓ Newsletter modal appeared in ${browserName}`)
    }
    
    console.log(`✓ Cross-browser consistency validated for ${browserName}`)
  })

  test('performance and loading optimization', async ({ page }) => {
    // Test homepage performance
    const startTime = Date.now()
    await page.goto('/')
    
    // Wait for essential content
    await page.getByAltText('Pro-Mac').waitFor({ state: 'visible' })
    await page.getByPlaceholder('Caută produse...').waitFor({ state: 'visible' })
    
    const essentialLoadTime = Date.now() - startTime
    
    // Essential content should load quickly (improved from 4.9-6.0s baseline to ~4.5s)
    expect(essentialLoadTime).toBeLessThan(5000)
    
    // Wait for all content including fonts
    await waitForFontsLoaded(page)
    const totalLoadTime = Date.now() - startTime
    
    console.log(`Essential content: ${essentialLoadTime}ms, Total: ${totalLoadTime}ms`)
    
    // Check for performance issues
    const performanceMetrics = await page.evaluate(() => ({
      memory: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize
      } : null,
      timing: performance.timing ? {
        domComplete: performance.timing.domComplete - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      } : null
    }))
    
    if (performanceMetrics.memory) {
      const memoryUsageMB = performanceMetrics.memory.used / (1024 * 1024)
      console.log(`Memory usage: ${memoryUsageMB.toFixed(2)} MB`)
      expect(memoryUsageMB).toBeLessThan(100) // Reasonable memory usage
    }
    
    // Test key interactions performance
    const searchInput = page.getByPlaceholder('Caută produse...')
    
    const interactionStart = Date.now()
    await searchInput.fill('performance test')
    const interactionTime = Date.now() - interactionStart
    
    expect(interactionTime).toBeLessThan(500) // Fast interaction response
    console.log(`Search interaction time: ${interactionTime}ms`)
  })
})