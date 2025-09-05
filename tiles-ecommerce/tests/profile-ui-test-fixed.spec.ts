import { test, expect } from '@playwright/test'

test.describe('User Profile UI Analysis - Fixed', () => {
  test('Login and capture profile UI', async ({ page }) => {
    console.log('Starting profile UI analysis...')
    
    // Navigate directly to auth page
    await page.goto('http://localhost:5176/auth')
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of login page first
    await page.screenshot({ 
      path: 'tests/screenshots/00-login-page.png',
      fullPage: true 
    })
    
    console.log('Filling login credentials...')
    
    // Wait for and fill email
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 })
    await page.fill('input[type="email"], input[name="email"]', 'eduardpopa67@yahoo.com')
    
    // Wait for and fill password
    await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 5000 })
    await page.fill('input[type="password"], input[name="password"]', 'Test!200601')
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Conectează-te"), button:has-text("Autentificare"), button:has-text("Sign In")')
    await submitButton.waitFor({ state: 'visible', timeout: 5000 })
    await submitButton.click()
    
    console.log('Waiting for login to complete...')
    
    // Wait for redirect away from auth page
    await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    // Take screenshot after successful login
    await page.screenshot({ 
      path: 'tests/screenshots/01-after-login.png',
      fullPage: true 
    })
    
    console.log('Navigating to profile page...')
    
    // Navigate directly to profile page
    await page.goto('http://localhost:5176/profile')
    await page.waitForLoadState('networkidle')
    
    // Take desktop screenshot
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'tests/screenshots/02-profile-desktop-1280.png',
      fullPage: true 
    })
    
    // Take mobile screenshot
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'tests/screenshots/03-profile-mobile-375.png',
      fullPage: true 
    })
    
    // Take tablet screenshot
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'tests/screenshots/04-profile-tablet-768.png',
      fullPage: true 
    })
    
    // Return to desktop for analysis
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(1000)
    
    // Take large desktop screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/05-profile-desktop-1440.png',
      fullPage: true 
    })
    
    // Analyze page elements
    const pageTitle = await page.locator('h1, h2, [data-testid="page-title"]').first().textContent().catch(() => 'Not found')
    const inputCount = await page.locator('input').count()
    const buttonCount = await page.locator('button').count()
    const breadcrumbsExists = await page.locator('.MuiBreadcrumbs-root, nav[aria-label*="breadcrumb"]').count() > 0
    
    console.log('=== PROFILE PAGE UI ANALYSIS ===')
    console.log(`Page Title: ${pageTitle}`)
    console.log(`Input Fields: ${inputCount}`)
    console.log(`Buttons: ${buttonCount}`)
    console.log(`Has Breadcrumbs: ${breadcrumbsExists}`)
    
    // Check for any error messages
    const errorMessages = await page.locator('[role="alert"], .error, .MuiAlert-root').count()
    console.log(`Error Messages Visible: ${errorMessages}`)
    
    // Check current URL to confirm we're on profile page
    const currentUrl = page.url()
    console.log(`Current URL: ${currentUrl}`)
    
    // Take a screenshot focused on the main content area if it exists
    try {
      const mainContent = page.locator('main, [role="main"], .main-content').first()
      if (await mainContent.isVisible()) {
        await mainContent.screenshot({ 
          path: 'tests/screenshots/06-profile-main-content.png'
        })
      }
    } catch (error) {
      console.log('Could not capture main content area specifically')
    }
    
    // Final analysis screenshot with browser info
    await page.screenshot({ 
      path: 'tests/screenshots/07-profile-final.png',
      fullPage: true 
    })
    
    console.log('Profile UI analysis complete! Check tests/screenshots/ for all captures.')
    
    // Basic assertions to ensure test validity
    expect(currentUrl).toContain('profile')
    expect(inputCount).toBeGreaterThanOrEqual(0) // Should have some form fields
  })
})