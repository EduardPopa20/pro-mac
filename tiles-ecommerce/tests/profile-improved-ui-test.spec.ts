import { test, expect } from '@playwright/test'

test('Test improved profile UI', async ({ page }) => {
  console.log('Testing improved profile UI...')
  
  // Navigate to auth and login
  await page.goto('http://localhost:5176/auth')
  await page.waitForLoadState('networkidle')
  
  // Login
  await page.fill('input[type="email"]', 'eduardpopa67@yahoo.com')
  await page.fill('input[type="password"]', 'Test!200601')
  await page.click('button[type="submit"]')
  
  // Wait for login
  await page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 15000 })
  
  // Navigate to profile
  await page.goto('http://localhost:5176/profile')
  await page.waitForLoadState('networkidle')
  
  // Test different viewports
  const viewports = [
    { name: 'desktop-large', width: 1440, height: 900 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 }
  ]
  
  for (const viewport of viewports) {
    console.log(`Testing ${viewport.name} viewport...`)
    
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(1000)
    
    // Take screenshot
    await page.screenshot({ 
      path: `tests/screenshots/improved-profile-${viewport.name}.png`,
      fullPage: true 
    })
    
    // Test responsive behavior
    if (viewport.width >= 768) {
      // Desktop/Tablet: Check if name, email, phone are in same row
      const personalInfoGrid = page.locator('text="Informații personale"').locator('..').locator('div').first()
      const gridColumns = await personalInfoGrid.evaluate(el => 
        window.getComputedStyle(el).getPropertyValue('grid-template-columns')
      )
      console.log(`Grid columns on ${viewport.name}: ${gridColumns}`)
    }
    
    // Check for new address fields
    const addressFields = [
      'Județ',
      'Localitate', 
      'Adresă strada (Linia 1)',
      'Adresă strada (Linia 2)', 
      'Cod poștal'
    ]
    
    for (const field of addressFields) {
      const fieldExists = await page.locator(`label:has-text("${field}")`).count() > 0
      console.log(`Address field "${field}" exists: ${fieldExists}`)
      expect(fieldExists).toBe(true)
    }
  }
  
  // Test that title "Profilul meu" is removed
  const hasTitle = await page.locator('h4:has-text("Profilul meu")').count() > 0
  console.log(`Profile title exists: ${hasTitle}`)
  expect(hasTitle).toBe(false)
  
  // Test that security section is removed
  const hasSecuritySection = await page.locator('h6:has-text("Securitate")').count() > 0
  console.log(`Security section exists: ${hasSecuritySection}`)
  expect(hasSecuritySection).toBe(false)
  
  // Test that buttons are right-aligned
  const actionButtons = page.locator('text="Editează profilul"').locator('..')
  const justifyContent = await actionButtons.evaluate(el => 
    window.getComputedStyle(el).getPropertyValue('justify-content')
  )
  console.log(`Action buttons justify-content: ${justifyContent}`)
  
  // Test edit mode
  await page.click('button:has-text("Editează profilul")')
  await page.waitForTimeout(500)
  
  // Take screenshot in edit mode
  await page.screenshot({ 
    path: 'tests/screenshots/improved-profile-edit-mode.png',
    fullPage: true 
  })
  
  // Test that Save and Cancel buttons appear
  const saveButtonExists = await page.locator('button:has-text("Salvează modificările")').count() > 0
  const cancelButtonExists = await page.locator('button:has-text("Anulează")').count() > 0
  
  console.log(`Save button exists: ${saveButtonExists}`)
  console.log(`Cancel button exists: ${cancelButtonExists}`)
  
  expect(saveButtonExists).toBe(true)
  expect(cancelButtonExists).toBe(true)
  
  console.log('Profile UI improvements test completed!')
})