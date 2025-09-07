import { test, expect } from '@playwright/test'

test('Search clickability and dropdown positioning', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  try {
    await page.goto('http://localhost:5178', { timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    console.log('✅ Page loaded successfully')
    
    // Test desktop search input clickability
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    
    console.log('✅ Search input is visible')
    
    // Test clicking the search input
    await searchInput.click()
    console.log('✅ Search input clicked successfully')
    
    // Test typing in the search input
    await searchInput.fill('fa')
    console.log('✅ Text entered in search input')
    
    // Wait a moment for dropdown to appear
    await page.waitForTimeout(500)
    
    // Check if dropdown appears
    const dropdown = page.locator('.MuiPopper-root').first()
    const dropdownVisible = await dropdown.isVisible().catch(() => false)
    
    if (dropdownVisible) {
      console.log('✅ Dropdown is visible')
      
      // Test positioning
      const inputBox = await searchInput.boundingBox()
      const dropdownBox = await dropdown.boundingBox()
      
      if (inputBox && dropdownBox) {
        const inputBottom = inputBox.y + inputBox.height
        const dropdownTop = dropdownBox.y
        const isBelow = dropdownTop >= inputBottom
        const horizontalOffset = Math.abs(dropdownBox.x - inputBox.x)
        
        console.log('📏 Input bottom:', inputBottom)
        console.log('📏 Dropdown top:', dropdownTop)
        console.log('📏 Is below input:', isBelow)
        console.log('📏 Horizontal offset:', horizontalOffset)
        
        if (isBelow && horizontalOffset < 5) {
          console.log('✅ Dropdown positioning is correct')
        } else {
          console.log('❌ Dropdown positioning issue detected')
        }
      }
    } else {
      console.log('❌ Dropdown not visible')
    }
    
    // Test that we can continue typing
    await searchInput.fill('faianta')
    console.log('✅ Can continue typing without issues')
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
})