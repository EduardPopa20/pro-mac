import { test, expect } from '@playwright/test'

test('Profile UI Analysis - Simple Approach', async ({ page }) => {
  console.log('Starting profile UI analysis...')
  
  // Navigate to auth page
  await page.goto('http://localhost:5176/auth')
  await page.waitForLoadState('networkidle')
  
  // Take screenshot of auth page
  await page.screenshot({ 
    path: 'tests/screenshots/00-auth-page.png',
    fullPage: true 
  })
  
  console.log('Filling credentials...')
  
  // Fill email and password
  await page.fill('input[type="email"]', 'eduardpopa67@yahoo.com')
  await page.fill('input[type="password"]', 'Test!200601')
  
  // Click the specific submit button (type=submit)
  await page.click('button[type="submit"]')
  
  console.log('Waiting for login...')
  
  // Wait for successful login (URL change)
  try {
    await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 15000 })
    console.log('Login successful, redirected!')
  } catch (error) {
    console.log('Login may have failed or timeout, taking debug screenshot...')
    await page.screenshot({ 
      path: 'tests/screenshots/debug-login-failed.png',
      fullPage: true 
    })
  }
  
  // Take screenshot after login attempt
  await page.screenshot({ 
    path: 'tests/screenshots/01-after-login-attempt.png',
    fullPage: true 
  })
  
  // Try to navigate to profile page
  console.log('Navigating to profile page...')
  await page.goto('http://localhost:5176/profile')
  await page.waitForLoadState('networkidle')
  
  // Capture profile page in different viewports
  console.log('Capturing profile page screenshots...')
  
  // Desktop view
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.waitForTimeout(1000)
  await page.screenshot({ 
    path: 'tests/screenshots/02-profile-desktop.png',
    fullPage: true 
  })
  
  // Tablet view
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.waitForTimeout(1000)
  await page.screenshot({ 
    path: 'tests/screenshots/03-profile-tablet.png',
    fullPage: true 
  })
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(1000)
  await page.screenshot({ 
    path: 'tests/screenshots/04-profile-mobile.png',
    fullPage: true 
  })
  
  // Back to desktop for analysis
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(1000)
  
  // Final screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/05-profile-final.png',
    fullPage: true 
  })
  
  // Analyze page elements
  console.log('=== PAGE ANALYSIS ===')
  console.log(`Current URL: ${page.url()}`)
  
  const pageTitle = await page.locator('h1, h2').first().textContent().catch(() => 'No title found')
  console.log(`Page Title: ${pageTitle}`)
  
  const inputCount = await page.locator('input').count()
  console.log(`Input Fields: ${inputCount}`)
  
  const buttonCount = await page.locator('button').count()
  console.log(`Buttons: ${buttonCount}`)
  
  const hasForm = await page.locator('form').count() > 0
  console.log(`Has Form: ${hasForm}`)
  
  const hasBreadcrumbs = await page.locator('.MuiBreadcrumbs-root').count() > 0
  console.log(`Has Breadcrumbs: ${hasBreadcrumbs}`)
  
  // Check for any errors
  const errorCount = await page.locator('[role="alert"], .error').count()
  console.log(`Error Messages: ${errorCount}`)
  
  console.log('Profile UI analysis complete! Screenshots saved to tests/screenshots/')
})