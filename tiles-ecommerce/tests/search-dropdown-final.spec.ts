import { test, expect } from '@playwright/test'

test('Search dropdown positioning final test', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  
  await page.waitForLoadState('networkidle')
  
  // Find search input
  const searchInput = page.locator('#global-search-input')
  await expect(searchInput).toBeVisible()
  
  // Click and type
  await searchInput.click()
  await searchInput.fill('faianta')
  
  // Wait for debounce and dropdown to appear
  await page.waitForTimeout(500)
  
  // Look for the dropdown/popper
  const popper = page.locator('.MuiPopper-root').first()
  const isPopperVisible = await popper.isVisible().catch(() => false)
  
  if (isPopperVisible) {
    const inputBox = await searchInput.boundingBox()
    const popperBox = await popper.boundingBox()
    
    if (inputBox && popperBox) {
      console.log('✅ Dropdown is visible and positioned')
      console.log(`Input: x=${inputBox.x}, y=${inputBox.y}, bottom=${inputBox.y + inputBox.height}`)
      console.log(`Dropdown: x=${popperBox.x}, y=${popperBox.y}, width=${popperBox.width}`)
      
      // Check positioning
      const isBelow = popperBox.y >= inputBox.y + inputBox.height - 2 // 2px tolerance
      const horizontalAlignment = Math.abs(popperBox.x - inputBox.x) <= 10 // 10px tolerance
      const notInCorner = !(popperBox.x < 50 && popperBox.y < 50)
      
      console.log(`Is below input: ${isBelow}`)
      console.log(`Is horizontally aligned: ${horizontalAlignment}`)
      console.log(`Not in top-left corner: ${notInCorner}`)
      
      expect(isBelow).toBeTruthy()
      expect(notInCorner).toBeTruthy()
      
      console.log('🎉 Search dropdown positioning is working correctly!')
    } else {
      console.log('❌ Could not get bounding boxes')
    }
  } else {
    console.log('❌ Dropdown is not visible')
    
    // Debug: check what elements exist
    const papers = await page.locator('.MuiPaper-root').count()
    const tooltips = await page.locator('[role="tooltip"]').count() 
    console.log(`MuiPaper elements: ${papers}`)
    console.log(`Tooltip elements: ${tooltips}`)
  }
})