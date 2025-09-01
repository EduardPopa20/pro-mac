import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Application Structure and Feature Discovery', () => {

  test('discover homepage structure and available features', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    console.log('=== HOMEPAGE STRUCTURE DISCOVERY ===')
    
    // Check page title
    const title = await page.title()
    console.log(`Page title: ${title}`)
    
    // Find the main navigation elements
    console.log('\n--- NAVIGATION ELEMENTS ---')
    const header = page.locator('header').first()
    if (await header.isVisible()) {
      const headerText = await header.textContent()
      console.log(`Header content: ${headerText?.substring(0, 200)}...`)
    }
    
    // Look for logo
    const logo = page.locator('img[alt*="Pro-Mac"], img[alt*="logo"]').first()
    if (await logo.isVisible()) {
      const logoAlt = await logo.getAttribute('alt')
      console.log(`Logo found: ${logoAlt}`)
    }
    
    // Find navigation links
    const navLinks = await page.locator('a[href]').all()
    console.log(`Found ${navLinks.length} links on homepage`)
    
    const uniqueHrefs = new Set()
    for (let i = 0; i < Math.min(navLinks.length, 20); i++) {
      const href = await navLinks[i].getAttribute('href')
      const text = await navLinks[i].textContent()
      if (href && !href.startsWith('#') && !uniqueHrefs.has(href)) {
        uniqueHrefs.add(href)
        console.log(`  - ${href}: "${text?.trim()}"`)
      }
    }
    
    // Find buttons
    console.log('\n--- BUTTONS AND INTERACTIVE ELEMENTS ---')
    const buttons = await page.locator('button').all()
    console.log(`Found ${buttons.length} buttons`)
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const buttonText = await buttons[i].textContent()
      const ariaLabel = await buttons[i].getAttribute('aria-label')
      if (buttonText?.trim() || ariaLabel) {
        console.log(`  Button: "${buttonText?.trim() || ariaLabel}"`)
      }
    }
    
    // Find form elements
    console.log('\n--- FORM ELEMENTS ---')
    const inputs = await page.locator('input').all()
    console.log(`Found ${inputs.length} input elements`)
    
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const placeholder = await inputs[i].getAttribute('placeholder')
      const type = await inputs[i].getAttribute('type')
      const name = await inputs[i].getAttribute('name')
      if (placeholder || type || name) {
        console.log(`  Input: type="${type}" placeholder="${placeholder}" name="${name}"`)
      }
    }
    
    // Check for modals/dialogs
    console.log('\n--- MODALS AND DIALOGS ---')
    await page.waitForTimeout(6000) // Wait for newsletter modal
    
    const modals = await page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').all()
    console.log(`Found ${modals.length} modal/dialog elements`)
    
    for (let i = 0; i < modals.length; i++) {
      const modalVisible = await modals[i].isVisible()
      const modalText = await modals[i].textContent()
      if (modalVisible && modalText) {
        console.log(`  Modal ${i+1}: "${modalText.substring(0, 100)}..."`)
      }
    }
    
    // Basic assertions
    expect(title).toBeTruthy()
    expect(uniqueHrefs.size).toBeGreaterThan(0)
  })

  test('test all discovered routes', async ({ page }) => {
    const routesToTest = [
      '/',
      '/contact', 
      '/auth',
      '/showroomuri',
      '/favorite',
      '/admin',
      '/admin/produse',
      '/admin/setari'
    ]
    
    console.log('=== ROUTE TESTING ===')
    
    for (const route of routesToTest) {
      try {
        console.log(`\n--- Testing route: ${route} ---`)
        
        await page.goto(route)
        await page.waitForLoadState('networkidle')
        
        const url = page.url()
        const title = await page.title()
        
        console.log(`  URL: ${url}`)
        console.log(`  Title: ${title}`)
        
        // Check if page loaded without major errors
        const hasMainContent = await page.locator('main, [role="main"], body > div').first().isVisible()
        console.log(`  Has main content: ${hasMainContent}`)
        
        // Check for error indicators
        const errorElements = await page.locator('h1, h2, p').filter({ hasText: /error|404|not found|unauthorized/i }).count()
        console.log(`  Error indicators: ${errorElements}`)
        
        // Check for forms on this page
        const forms = await page.locator('form').count()
        if (forms > 0) {
          console.log(`  Forms found: ${forms}`)
          
          const inputs = await page.locator('input').count()
          const textareas = await page.locator('textarea').count()
          const buttons = await page.locator('button[type="submit"]').count()
          
          console.log(`    - Inputs: ${inputs}`)
          console.log(`    - Textareas: ${textareas}`)
          console.log(`    - Submit buttons: ${buttons}`)
        }
        
        // Check for data tables (admin pages might have these)
        const tables = await page.locator('table, [role="table"]').count()
        if (tables > 0) {
          console.log(`  Data tables: ${tables}`)
        }
        
      } catch (error) {
        console.log(`  ERROR accessing ${route}: ${error}`)
      }
    }
  })

  test('discover searchable content and categories', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    console.log('=== SEARCH AND CATEGORY DISCOVERY ===')
    
    // Find search functionality
    const searchInputs = await page.locator('input[placeholder*="caută"], input[placeholder*="search"], input[type="search"]').all()
    console.log(`Found ${searchInputs.length} search inputs`)
    
    if (searchInputs.length > 0) {
      const searchInput = searchInputs[0]
      const placeholder = await searchInput.getAttribute('placeholder')
      console.log(`Primary search placeholder: "${placeholder}"`)
      
      // Test search functionality
      await searchInput.fill('gresie')
      await page.waitForTimeout(1000)
      
      // Look for search results
      const dropdown = page.locator('[role="presentation"], .MuiPopper-root, [data-testid*="search"]')
      const dropdownVisible = await dropdown.isVisible()
      console.log(`Search dropdown appeared: ${dropdownVisible}`)
      
      if (dropdownVisible) {
        const searchResults = await dropdown.textContent()
        console.log(`Search results preview: "${searchResults?.substring(0, 200)}..."`)
      }
    }
    
    // Look for category navigation
    console.log('\n--- CATEGORY NAVIGATION ---')
    const categoryLinks = await page.locator('a[href*="gresie"], a[href*="faianta"], a[href*="produse"]').all()
    console.log(`Found ${categoryLinks.length} category-related links`)
    
    for (let i = 0; i < Math.min(categoryLinks.length, 5); i++) {
      const href = await categoryLinks[i].getAttribute('href')
      const text = await categoryLinks[i].textContent()
      console.log(`  Category: ${href} - "${text?.trim()}"`)
    }
  })

  test('discover mobile-specific features', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    console.log('=== MOBILE FEATURES DISCOVERY ===')
    
    // Look for mobile menu button
    const mobileMenuButtons = await page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [data-testid*="menu"]').all()
    console.log(`Found ${mobileMenuButtons.length} potential mobile menu buttons`)
    
    if (mobileMenuButtons.length > 0) {
      const menuButton = mobileMenuButtons[0]
      const ariaLabel = await menuButton.getAttribute('aria-label')
      console.log(`Mobile menu button: "${ariaLabel}"`)
      
      // Try to open mobile menu
      await menuButton.click()
      await page.waitForTimeout(500)
      
      const drawer = page.locator('[role="dialog"], .MuiDrawer-root, .MuiModal-root')
      const drawerVisible = await drawer.isVisible()
      console.log(`Mobile menu drawer opened: ${drawerVisible}`)
      
      if (drawerVisible) {
        const drawerContent = await drawer.textContent()
        console.log(`Mobile menu content: "${drawerContent?.substring(0, 200)}..."`)
      }
    }
    
    // Check for mobile-optimized elements
    const mobileOptimized = await page.locator('[data-testid*="mobile"], .mobile-only, .MuiDrawer-root').count()
    console.log(`Mobile-optimized elements: ${mobileOptimized}`)
  })

  test('discover authentication and user features', async ({ page }) => {
    console.log('=== AUTHENTICATION DISCOVERY ===')
    
    // Test auth page
    await page.goto('/auth')
    await waitForFontsLoaded(page)
    
    const authForms = await page.locator('form').count()
    console.log(`Auth forms found: ${authForms}`)
    
    // Look for login/register tabs or sections
    const authTabs = await page.locator('[role="tab"], button').filter({ hasText: /login|register|conectare|inregistrare/i }).all()
    console.log(`Auth tabs/buttons: ${authTabs.length}`)
    
    for (let i = 0; i < authTabs.length; i++) {
      const tabText = await authTabs[i].textContent()
      console.log(`  Auth tab: "${tabText?.trim()}"`)
    }
    
    // Look for OAuth buttons
    const oauthButtons = await page.locator('button, a').filter({ hasText: /google|facebook|continue with/i }).all()
    console.log(`OAuth buttons: ${oauthButtons.length}`)
    
    // Check for reCAPTCHA
    const recaptcha = await page.locator('[data-sitekey], .recaptcha, #recaptcha').count()
    console.log(`reCAPTCHA elements: ${recaptcha}`)
    
    // Try accessing admin area (should redirect or show login)
    await page.goto('/admin')
    await page.waitForTimeout(1000)
    
    const currentUrl = page.url()
    console.log(`Admin access redirected to: ${currentUrl}`)
    
    const adminContent = await page.textContent('body')
    const hasAdminAccess = adminContent?.includes('admin') || adminContent?.includes('dashboard')
    console.log(`Has admin access: ${hasAdminAccess}`)
  })

  test('discover available data and content', async ({ page }) => {
    console.log('=== DATA AND CONTENT DISCOVERY ===')
    
    // Check homepage for product previews or featured content
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const productCards = await page.locator('[data-testid*="product"], .product-card, .MuiCard-root').count()
    console.log(`Product cards on homepage: ${productCards}`)
    
    const images = await page.locator('img').count()
    console.log(`Images on homepage: ${images}`)
    
    // Check if we have sample data by searching
    const searchInput = page.locator('input[placeholder*="caută"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await page.waitForTimeout(1000)
      
      const dropdown = page.locator('[role="presentation"]')
      const hasResults = await dropdown.isVisible()
      console.log(`Search returns results: ${hasResults}`)
      
      if (hasResults) {
        const resultCount = await dropdown.locator('div').count()
        console.log(`Approximate search result count: ${resultCount}`)
      }
    }
    
    // Check contact page for form functionality
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    const contactForm = await page.locator('form').count()
    console.log(`Contact forms: ${contactForm}`)
    
    // Check showroom page
    await page.goto('/showroomuri')
    await waitForFontsLoaded(page)
    
    const showroomCards = await page.locator('.MuiCard-root, [data-testid*="showroom"]').count()
    console.log(`Showroom cards: ${showroomCards}`)
    
    console.log('=== DISCOVERY COMPLETE ===')
  })
})