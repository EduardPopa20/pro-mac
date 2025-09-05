import { test, expect } from '@playwright/test'

test('Profile UI - Visual Check', async ({ page }) => {
  console.log('Visual check of final profile UI...')
  
  // Login
  await page.goto('http://localhost:5176/auth')
  await page.waitForLoadState('networkidle')
  
  await page.fill('input[type="email"]', 'eduardpopa67@yahoo.com')
  await page.fill('input[type="password"]', 'Test!200601')
  await page.click('button[type="submit"]')
  
  await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 15000 })
  
  // Navigate to profile
  await page.goto('http://localhost:5176/profile')
  await page.waitForLoadState('networkidle')
  
  // Take screenshot in view mode
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.screenshot({ 
    path: 'tests/screenshots/profile-final-view-mode.png',
    fullPage: true 
  })
  
  // Switch to edit mode
  await page.click('button:has-text("Editează profilul")')
  await page.waitForTimeout(1000)
  
  // Take screenshot in edit mode
  await page.screenshot({ 
    path: 'tests/screenshots/profile-final-edit-mode.png',
    fullPage: true 
  })
  
  // Test counties dropdown
  const countyDropdown = page.locator('label:has-text("Județ")').locator('..').locator('input')
  await countyDropdown.click()
  await page.waitForTimeout(500)
  
  // Take screenshot with dropdown open
  await page.screenshot({ 
    path: 'tests/screenshots/profile-counties-dropdown.png',
    fullPage: true 
  })
  
  // Select a county
  await page.click('li:has-text("București")')
  await page.waitForTimeout(500)
  
  // Mobile test
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(1000)
  
  // Take mobile screenshot
  await page.screenshot({ 
    path: 'tests/screenshots/profile-final-mobile-edit.png',
    fullPage: true 
  })
  
  console.log('Visual check completed! Screenshots saved.')
})