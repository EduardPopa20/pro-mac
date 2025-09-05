import { test, expect } from '@playwright/test'

test.describe('User Profile UI Analysis', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh
    await page.context().clearCookies()
    await page.goto('http://localhost:5176')
  })

  test('Login and analyze profile page UI', async ({ page }) => {
    // Navigate to login page
    console.log('Navigating to login...')
    await page.click('[data-testid="user-profile-button"], button[aria-label*="profil"], button:has-text("Autentificare")', { timeout: 10000 })
    
    // Wait for auth page to load
    await page.waitForURL(/.*auth.*/, { timeout: 10000 })
    
    // Fill login form
    console.log('Filling login form...')
    await page.fill('input[type="email"]', 'eduardpopa67@yahoo.com')
    await page.fill('input[type="password"]', 'Test!200601')
    
    // Submit login
    await page.click('button[type="submit"], button:has-text("Autentificare")')
    
    // Wait for login to complete and redirect
    await page.waitForURL(/^(?!.*auth).*/, { timeout: 15000 })
    
    // Take screenshot after login
    await page.screenshot({ 
      path: 'tests/screenshots/01-after-login.png',
      fullPage: true 
    })
    
    // Navigate to profile page
    console.log('Navigating to profile page...')
    
    // Try different methods to access profile
    try {
      // Method 1: Look for user profile button/menu
      await page.click('[data-testid="user-profile-button"], button[aria-label*="profil"]', { timeout: 5000 })
      await page.waitForTimeout(1000)
    } catch (error) {
      console.log('Method 1 failed, trying hamburger menu...')
      
      // Method 2: Use hamburger menu
      try {
        await page.click('button[aria-label="menu"], button:has([data-testid="MenuIcon"])', { timeout: 5000 })
        await page.waitForTimeout(1000)
        await page.click('text="Profilul meu", a[href="/profile"]', { timeout: 5000 })
      } catch (error2) {
        console.log('Method 2 failed, trying direct navigation...')
        
        // Method 3: Direct navigation
        await page.goto('http://localhost:5176/profile')
      }
    }
    
    // Wait for profile page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    // Take screenshots of profile page
    await page.screenshot({ 
      path: 'tests/screenshots/02-profile-desktop.png',
      fullPage: true 
    })
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'tests/screenshots/03-profile-mobile.png',
      fullPage: true 
    })
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'tests/screenshots/04-profile-tablet.png',
      fullPage: true 
    })
    
    // Back to desktop for detailed analysis
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)
    
    // Take screenshot of specific sections
    try {
      const profileForm = page.locator('form, [data-testid="profile-form"]').first()
      if (await profileForm.isVisible()) {
        await profileForm.screenshot({ 
          path: 'tests/screenshots/05-profile-form-section.png'
        })
      }
    } catch (error) {
      console.log('Could not capture form section specifically')
    }
    
    // Analyze page structure
    const pageTitle = await page.locator('h1, h2, [data-testid="page-title"]').first().textContent()
    const formFields = await page.locator('input, textarea, select').count()
    const buttons = await page.locator('button').count()
    
    console.log('=== PROFILE PAGE ANALYSIS ===')
    console.log(`Page Title: ${pageTitle}`)
    console.log(`Form Fields Count: ${formFields}`)
    console.log(`Buttons Count: ${buttons}`)
    
    // Check for common UI elements
    const hasBreadcrumbs = await page.locator('nav[aria-label="breadcrumb"], .MuiBreadcrumbs-root').count() > 0
    const hasBackButton = await page.locator('button:has-text("Înapoi"), button[aria-label*="back"]').count() > 0
    const hasProfilePicture = await page.locator('img[alt*="profile"], img[alt*="profil"], .avatar').count() > 0
    
    console.log(`Has Breadcrumbs: ${hasBreadcrumbs}`)
    console.log(`Has Back Button: ${hasBackButton}`)
    console.log(`Has Profile Picture: ${hasProfilePicture}`)
    
    // Check responsive behavior
    const isMobileResponsive = await page.evaluate(() => {
      return window.innerWidth <= 768 ? 
        !document.documentElement.scrollWidth > document.documentElement.clientWidth :
        true
    })
    
    console.log(`Mobile Responsive (no horizontal scroll): ${isMobileResponsive}`)
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/06-profile-final-analysis.png',
      fullPage: true 
    })
    
    console.log('Screenshots saved to tests/screenshots/ directory')
    console.log('Profile page analysis complete!')
    
    // Ensure we have at least basic profile functionality
    expect(pageTitle).toBeTruthy()
    expect(formFields).toBeGreaterThan(0)
  })
})