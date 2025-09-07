import { test, expect } from '@playwright/test'

test('Validate search dropdown appears below input', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  
  await page.waitForLoadState('networkidle')
  
  const searchInput = page.locator('#global-search-input')
  await searchInput.click()
  await searchInput.fill('faianta')
  await page.waitForTimeout(400)
  
  // Get both positions
  const inputBox = await searchInput.boundingBox()
  const dropdown = page.locator('.MuiPopper-root').first()
  const dropdownBox = await dropdown.boundingBox()
  
  console.log('Input position:', inputBox)
  console.log('Dropdown position:', dropdownBox)
  
  if (inputBox && dropdownBox) {
    const inputBottom = inputBox.y + inputBox.height
    const dropdownTop = dropdownBox.y
    
    console.log('Input bottom edge:', inputBottom)
    console.log('Dropdown top edge:', dropdownTop)
    
    const isBelow = dropdownTop >= inputBottom
    console.log('Is dropdown below input?', isBelow)
    
    if (!isBelow) {
      console.log('❌ ISSUE: Dropdown appears to be above or overlapping input!')
      console.log('Gap (negative = overlap):', dropdownTop - inputBottom)
    } else {
      console.log('✅ Dropdown is correctly positioned below input')
      console.log('Gap below input:', dropdownTop - inputBottom, 'px')
    }
    
    expect(isBelow).toBeTruthy()
  }
})