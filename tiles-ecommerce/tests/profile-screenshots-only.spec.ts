import { test } from '@playwright/test'

test('Profile screenshots only', async ({ page }) => {
  console.log('Taking final profile screenshots...')
  
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
  
  // Desktop view mode
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.waitForTimeout(1000)
  
  await page.screenshot({ 
    path: 'tests/screenshots/final-profile-view-mode.png',
    fullPage: true 
  })
  
  // Switch to edit mode
  await page.click('button:has-text("Editează profilul")')
  await page.waitForTimeout(1000)
  
  await page.screenshot({ 
    path: 'tests/screenshots/final-profile-edit-mode.png',
    fullPage: true 
  })
  
  // Mobile edit mode
  await page.setViewportSize({ width: 375, height: 812 })
  await page.waitForTimeout(1000)
  
  await page.screenshot({ 
    path: 'tests/screenshots/final-profile-mobile-edit.png',
    fullPage: true 
  })
  
  // Tablet edit mode
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.waitForTimeout(1000)
  
  await page.screenshot({ 
    path: 'tests/screenshots/final-profile-tablet-edit.png',
    fullPage: true 
  })
  
  console.log('All final screenshots captured successfully!')
})