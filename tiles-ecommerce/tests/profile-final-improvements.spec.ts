import { test, expect } from '@playwright/test'

test('Profile UI - Final Improvements', async ({ page }) => {
  console.log('Testing final profile improvements...')
  
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
  
  // Test different viewports
  const viewports = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 }
  ]
  
  for (const viewport of viewports) {
    console.log(`Testing ${viewport.name} viewport...`)
    
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(1000)
    
    // Take screenshot of final improvements
    await page.screenshot({ 
      path: `tests/screenshots/final-profile-${viewport.name}.png`,
      fullPage: true 
    })
    
    // Test 1: Check that user name is NOT displayed next to avatar
    const userNameNextToAvatar = await page.locator('h5:has-text("Edi")').count()
    console.log(`User name next to avatar exists: ${userNameNextToAvatar > 0}`)
    expect(userNameNextToAvatar).toBe(0)
    
    // Test 2: Check that Client chip is NOT displayed
    const clientChip = await page.locator('text="Client"').count()
    console.log(`Client chip exists: ${clientChip > 0}`)
    expect(clientChip).toBe(0)
    
    // Test 3: Check avatar is centered (large size)
    const avatar = page.locator('svg[data-testid="PersonIcon"]').first()
    if (await avatar.isVisible()) {
      const avatarBox = await avatar.boundingBox()
      console.log(`Avatar size: ${avatarBox?.width}x${avatarBox?.height}`)
      // Should be larger than before (4rem = ~64px)
      expect(avatarBox?.width).toBeGreaterThan(50)
    }
    
    // Test 4: Check email helper text is NOT displayed
    const emailHelperText = await page.locator('text="Email-ul nu poate fi modificat"').count()
    console.log(`Email helper text exists: ${emailHelperText > 0}`)
    expect(emailHelperText).toBe(0)
    
    // Test 5: Check counties dropdown exists
    await page.click('button:has-text("Editează profilul")')
    await page.waitForTimeout(500)
    
    const countyField = page.locator('label:has-text("Județ")').locator('..')
    const isSelect = await countyField.locator('[role="button"]').count() > 0
    console.log(`County field is dropdown: ${isSelect}`)
    expect(isSelect).toBe(true)
    
    // Test 6: Check placeholders are removed
    const cityField = page.locator('input[aria-label*="Localitate"], label:has-text("Localitate") ~ div input')
    const cityPlaceholder = await cityField.getAttribute('placeholder')
    console.log(`City placeholder: "${cityPlaceholder}"`)
    expect(cityPlaceholder || '').toBe('')
    
    const postalField = page.locator('input[aria-label*="Cod poștal"], label:has-text("Cod poștal") ~ div input')
    const postalPlaceholder = await postalField.getAttribute('placeholder')
    console.log(`Postal placeholder: "${postalPlaceholder}"`)
    expect(postalPlaceholder || '').toBe('')
    
    // Test 7: Check disconnect button is NOT displayed
    const disconnectButton = await page.locator('button:has-text("Deconectează-te")').count()
    console.log(`Disconnect button exists: ${disconnectButton > 0}`)
    expect(disconnectButton).toBe(0)
    
    // Test 8: Check button layout on mobile
    if (viewport.width <= 768) {
      const saveButton = page.locator('button:has-text("Salvează")')
      const cancelButton = page.locator('button:has-text("Anulează")')
      
      const saveExists = await saveButton.count() > 0
      const cancelExists = await cancelButton.count() > 0
      
      console.log(`Mobile save button exists: ${saveExists}`)
      console.log(`Mobile cancel button exists: ${cancelExists}`)
      
      if (saveExists && cancelExists) {
        const saveBox = await saveButton.boundingBox()
        const cancelBox = await cancelButton.boundingBox()
        
        // Buttons should be on same row (similar Y coordinates)
        const yDiff = Math.abs((saveBox?.y || 0) - (cancelBox?.y || 0))
        console.log(`Buttons Y difference: ${yDiff}px`)
        expect(yDiff).toBeLessThan(50) // Should be on same row
      }
    }
    
    // Test counties dropdown content
    if (viewport.name === 'desktop') {
      await countyField.click()
      await page.waitForTimeout(500)
      
      const bucharestOption = await page.locator('li:has-text("București")').count()
      const clujOption = await page.locator('li:has-text("Cluj")').count()
      const ilfovOption = await page.locator('li:has-text("Ilfov")').count()
      
      console.log(`București county option: ${bucharestOption > 0}`)
      console.log(`Cluj county option: ${clujOption > 0}`)
      console.log(`Ilfov county option: ${ilfovOption > 0}`)
      
      expect(bucharestOption).toBeGreaterThan(0)
      expect(clujOption).toBeGreaterThan(0)
      expect(ilfovOption).toBeGreaterThan(0)
      
      // Close dropdown
      await page.keyboard.press('Escape')
    }
    
    // Cancel edit mode for next iteration
    await page.click('button:has-text("Anulează")')
    await page.waitForTimeout(500)
  }
  
  // Final comprehensive screenshot
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.screenshot({ 
    path: 'tests/screenshots/final-profile-comprehensive.png',
    fullPage: true 
  })
  
  console.log('Final profile improvements test completed!')
})