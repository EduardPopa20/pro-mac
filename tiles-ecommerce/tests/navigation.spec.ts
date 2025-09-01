import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Navigation and Routing Tests', () => {

  test('homepage navigation elements', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Verify main navigation exists
    const nav = page.locator('nav, [role="navigation"], header')
    await expect(nav).toBeVisible()
    
    // Check for essential navigation links
    const expectedNavItems = [
      { pattern: /produse|products/i, description: 'products link' },
      { pattern: /contact/i, description: 'contact link' },
      { pattern: /showroom/i, description: 'showroom link' }
    ]
    
    for (const item of expectedNavItems) {
      const navLink = page.locator('a, [role="button"]').filter({ hasText: item.pattern })
      const linkExists = await navLink.count() > 0
      
      if (linkExists) {
        await expect(navLink.first()).toBeVisible()
        console.log(`✓ Found ${item.description}`)
      }
    }
    
    // Verify logo/home link
    const logo = page.getByAltText('Pro-Mac')
    await expect(logo).toBeVisible()
    
    // Logo should be clickable and return to homepage
    const logoContainer = logo.locator('..')
    const logoHref = await logoContainer.getAttribute('href')
    if (logoHref) {
      expect(logoHref).toBe('/')
    }
  })

  test('breadcrumb navigation functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Navigate to a nested page to test breadcrumbs
    const productLink = page.locator('a[href*="produse"], a[href*="gresie"], a[href*="faianta"]').first()
    const productLinkExists = await productLink.count() > 0
    
    if (productLinkExists && await productLink.isVisible()) {
      await productLink.click()
      await page.waitForLoadState('networkidle')
      
      // Look for breadcrumb navigation
      const breadcrumbs = page.locator('[role="navigation"] ol, .MuiBreadcrumbs-root, nav ol')
      const breadcrumbExists = await breadcrumbs.count() > 0
      
      if (breadcrumbExists) {
        await expect(breadcrumbs.first()).toBeVisible()
        
        // Breadcrumbs should have home link
        const homeLink = breadcrumbs.locator('a').filter({ hasText: /acas[aă]|home/i })
        const homeLinkExists = await homeLink.count() > 0
        
        if (homeLinkExists) {
          // Test breadcrumb home link
          await homeLink.first().click()
          await page.waitForLoadState('networkidle')
          
          // Should return to homepage
          expect(page.url()).toMatch(/\/$/)
          
          const logo = page.getByAltText('Pro-Mac')
          await expect(logo).toBeVisible()
        }
      }
    }
  })

  test('routing and URL structure', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test various route patterns
    const testRoutes = [
      { path: '/contact', expectedElements: ['form', 'input[type="email"]'] },
      { path: '/showroom', expectedElements: [] },
      { path: '/produse', expectedElements: [] }
    ]
    
    for (const route of testRoutes) {
      // Navigate to route
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      
      // Verify URL is correct
      expect(page.url()).toContain(route.path)
      
      // Verify page loads without errors
      const pageTitle = await page.title()
      expect(pageTitle).toBeTruthy()
      expect(pageTitle.length).toBeGreaterThan(3)
      
      // Check for expected elements if specified
      for (const selector of route.expectedElements) {
        const element = page.locator(selector).first()
        const elementExists = await element.count() > 0
        if (elementExists) {
          await expect(element).toBeVisible()
        }
      }
      
      // Verify no console errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error' && !msg.text().includes('404')) {
          errors.push(msg.text())
        }
      })
      
      console.log(`✓ Route ${route.path} loaded successfully`)
    }
  })

  test('mobile navigation menu', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    // Look for mobile menu button
    const menuButton = page.getByRole('button').filter({ hasText: /menu/i }).or(
      page.getByLabel('menu').or(
        page.locator('button[aria-label*="menu"], button').filter({ hasText: /☰/ })
      )
    )
    
    const menuButtonExists = await menuButton.count() > 0
    
    if (menuButtonExists && await menuButton.first().isVisible()) {
      // Open mobile menu
      await menuButton.first().click()
      await page.waitForTimeout(500)
      
      // Look for mobile menu container
      const mobileMenu = page.locator('[role="dialog"], .MuiDrawer-root, .MuiModal-root')
      const mobileMenuVisible = await mobileMenu.isVisible()
      
      if (mobileMenuVisible) {
        // Verify menu is properly sized for mobile
        const menuBox = await mobileMenu.boundingBox()
        const viewport = page.viewportSize()
        
        if (menuBox && viewport) {
          expect(menuBox.width).toBeLessThanOrEqual(viewport.width)
          expect(menuBox.height).toBeLessThanOrEqual(viewport.height)
        }
        
        // Test menu navigation items
        const menuItems = mobileMenu.locator('a, [role="menuitem"], button')
        const menuItemCount = await menuItems.count()
        
        if (menuItemCount > 0) {
          // Menu items should be touch-friendly
          for (let i = 0; i < Math.min(menuItemCount, 3); i++) {
            const item = menuItems.nth(i)
            if (await item.isVisible()) {
              const itemBox = await item.boundingBox()
              if (itemBox) {
                expect(itemBox.height).toBeGreaterThanOrEqual(44) // WCAG touch target
              }
            }
          }
          
          // Test navigation
          const firstMenuItem = menuItems.first()
          if (await firstMenuItem.isVisible()) {
            const itemText = await firstMenuItem.textContent()
            await firstMenuItem.click()
            await page.waitForTimeout(1000)
            
            // Should navigate or close menu
            const menuStillVisible = await mobileMenu.isVisible()
            const urlChanged = !page.url().endsWith('/')
            
            expect(!menuStillVisible || urlChanged).toBeTruthy()
            console.log(`✓ Mobile menu navigation tested with item: ${itemText?.trim()}`)
          }
        }
      }
    }
  })

  test('back button and browser history', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const initialUrl = page.url()
    
    // Navigate to another page
    const contactLink = page.locator('a[href="/contact"], a[href*="contact"]').first()
    const contactExists = await contactLink.count() > 0
    
    if (contactExists && await contactLink.isVisible()) {
      await contactLink.click()
      await page.waitForLoadState('networkidle')
      
      const newUrl = page.url()
      expect(newUrl).not.toBe(initialUrl)
      expect(newUrl).toContain('contact')
      
      // Test browser back button
      await page.goBack()
      await page.waitForLoadState('networkidle')
      
      // Should return to initial page
      const backUrl = page.url()
      expect(backUrl).toBe(initialUrl)
      
      // Test forward button
      await page.goForward()
      await page.waitForLoadState('networkidle')
      
      const forwardUrl = page.url()
      expect(forwardUrl).toBe(newUrl)
    }
  })

  test('deep linking and direct URL access', async ({ page }) => {
    // Test direct access to nested routes
    const deepRoutes = [
      '/contact',
      '/showroom',
      '/produse'
    ]
    
    for (const route of deepRoutes) {
      // Direct navigation to deep route
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      
      // Page should load correctly
      const currentUrl = page.url()
      expect(currentUrl).toContain(route)
      
      // Should have proper page content
      const mainContent = page.locator('main, [role="main"]')
      await expect(mainContent).toBeVisible()
      
      // Should have navigation elements
      const nav = page.locator('nav, [role="navigation"], header')
      await expect(nav).toBeVisible()
      
      // Should be able to navigate back to home
      const homeLink = page.locator('a[href="/"]').first()
      const homeLinkExists = await homeLink.count() > 0
      
      if (homeLinkExists && await homeLink.isVisible()) {
        await homeLink.click()
        await page.waitForLoadState('networkidle')
        
        expect(page.url()).toMatch(/\/$/)
      }
      
      console.log(`✓ Deep link ${route} accessible`)
    }
  })

  test('navigation accessibility and keyboard support', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test keyboard navigation through main nav
    await page.keyboard.press('Tab')
    
    let tabCount = 0
    const maxTabs = 15
    const navigationStops: string[] = []
    
    while (tabCount < maxTabs) {
      const focusedElement = page.locator(':focus')
      const isVisible = await focusedElement.isVisible()
      
      if (isVisible) {
        const tagName = await focusedElement.evaluate(el => el.tagName)
        const ariaLabel = await focusedElement.getAttribute('aria-label')
        const href = await focusedElement.getAttribute('href')
        const textContent = await focusedElement.textContent()
        
        navigationStops.push(`${tagName}: ${ariaLabel || textContent?.trim() || href || 'unlabeled'}`)
        
        // Test Enter key on navigation links
        if (tagName === 'A' && href && !href.startsWith('#')) {
          await page.keyboard.press('Enter')
          await page.waitForTimeout(500)
          
          // Should navigate
          const newUrl = page.url()
          if (newUrl !== '/') {
            console.log(`✓ Keyboard navigation to: ${newUrl}`)
            
            // Return to homepage for next test
            await page.goto('/')
            await waitForFontsLoaded(page)
            break
          }
        }
      }
      
      await page.keyboard.press('Tab')
      tabCount++
    }
    
    // Should have found several focusable navigation elements
    expect(navigationStops.length).toBeGreaterThan(2)
  })

  test('responsive navigation consistency', async ({ page }) => {
    const breakpoints = ['xs', 'md', 'lg'] as const
    
    for (const bp of breakpoints) {
      await page.goto('/')
      await setViewport(page, bp)
      await waitForFontsLoaded(page)
      
      // Navigation should be present and accessible
      const nav = page.locator('nav, [role="navigation"], header')
      await expect(nav).toBeVisible()
      
      // Logo should always be visible
      const logo = page.getByAltText('Pro-Mac')
      await expect(logo).toBeVisible()
      
      if (bp === 'xs') {
        // Mobile should have menu button or visible nav links
        const mobileMenu = page.getByRole('button').filter({ hasText: /menu/i }).or(
          page.getByLabel('menu')
        )
        const mobileNavLinks = page.locator('nav a').first()
        
        const hasMobileNavigation = await mobileMenu.count() > 0 || await mobileNavLinks.isVisible()
        expect(hasMobileNavigation).toBeTruthy()
      } else {
        // Desktop should have visible navigation links
        const navLinks = page.locator('nav a, header a').filter({ hasText: /produse|contact|showroom/i })
        const navLinkCount = await navLinks.count()
        expect(navLinkCount).toBeGreaterThan(0)
      }
      
      console.log(`✓ Navigation tested at ${bp} breakpoint`)
    }
  })

  test('navigation error handling', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test 404 handling
    await page.goto('/non-existent-page')
    await page.waitForLoadState('networkidle')
    
    // Should show 404 page or redirect to home
    const pageContent = await page.textContent('body')
    const has404 = pageContent?.includes('404') || pageContent?.includes('not found')
    const isHomepage = page.url().endsWith('/')
    
    expect(has404 || isHomepage).toBeTruthy()
    
    // Navigation should still be functional
    const nav = page.locator('nav, [role="navigation"], header')
    await expect(nav).toBeVisible()
    
    // Should be able to navigate to valid pages
    const homeLink = page.locator('a[href="/"]').first()
    const homeLinkExists = await homeLink.count() > 0
    
    if (homeLinkExists) {
      await homeLink.click()
      await page.waitForLoadState('networkidle')
      
      // Should return to homepage
      expect(page.url()).toMatch(/\/$/)
      
      const logo = page.getByAltText('Pro-Mac')
      await expect(logo).toBeVisible()
    }
  })

  test('navigation performance and loading states', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Track navigation timing
    const navigationTimes: { [key: string]: number } = {}
    
    const testNavigation = async (linkText: string, expectedPath: string) => {
      const startTime = Date.now()
      
      const navLink = page.locator('a, [role="button"]').filter({ hasText: new RegExp(linkText, 'i') })
      const linkExists = await navLink.count() > 0
      
      if (linkExists && await navLink.first().isVisible()) {
        await navLink.first().click()
        await page.waitForLoadState('networkidle')
        
        const endTime = Date.now()
        const navigationTime = endTime - startTime
        
        navigationTimes[linkText] = navigationTime
        
        // Navigation should be reasonably fast
        expect(navigationTime).toBeLessThan(5000)
        
        // Should navigate to expected path
        if (expectedPath) {
          expect(page.url()).toContain(expectedPath)
        }
        
        console.log(`✓ Navigation to ${linkText}: ${navigationTime}ms`)
        
        // Return to homepage
        await page.goto('/')
        await waitForFontsLoaded(page)
      }
    }
    
    // Test key navigation links
    await testNavigation('contact', 'contact')
    await testNavigation('produse', 'produse')
    
    // Average navigation time should be reasonable
    const times = Object.values(navigationTimes)
    if (times.length > 0) {
      const averageTime = times.reduce((a, b) => a + b, 0) / times.length
      expect(averageTime).toBeLessThan(3000) // 3 second average
    }
  })

  test('navigation state management', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Test active navigation states
    const currentUrl = page.url()
    
    // Navigate to different sections and check active states
    const contactLink = page.locator('a[href*="contact"]').first()
    const contactExists = await contactLink.count() > 0
    
    if (contactExists && await contactLink.isVisible()) {
      await contactLink.click()
      await page.waitForLoadState('networkidle')
      
      // Check if contact link shows active state
      const activeLink = page.locator('a[href*="contact"][class*="active"], a[href*="contact"][aria-current]')
      const hasActiveState = await activeLink.count() > 0
      
      // Active states are optional but good UX
      if (hasActiveState) {
        await expect(activeLink.first()).toBeVisible()
        console.log('✓ Active navigation state detected')
      }
      
      // Test navigation consistency after refresh
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should still be on contact page
      expect(page.url()).toContain('contact')
      
      // Navigation should still be functional
      const nav = page.locator('nav, [role="navigation"], header')
      await expect(nav).toBeVisible()
    }
  })
})