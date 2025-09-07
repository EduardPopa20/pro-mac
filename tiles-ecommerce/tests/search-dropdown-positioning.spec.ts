import { test, expect } from '@playwright/test'

test.describe('Search Dropdown Positioning', () => {
  test('Dropdown appears correctly positioned below input', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    await page.waitForLoadState('networkidle')
    
    // Find and interact with search
    const searchInput = page.locator('#global-search-input')
    await searchInput.click()
    
    // Type something to trigger dropdown
    await searchInput.fill('faianta')
    
    // Wait for debounce and results
    await page.waitForTimeout(500)
    
    // Check if dropdown is visible
    const dropdown = page.locator('[role="tooltip"]').first()
    
    // Wait a bit more to ensure positioning is stable
    await page.waitForTimeout(200)
    
    // Get positions
    const inputBox = await searchInput.boundingBox()
    const dropdownBox = await dropdown.boundingBox().catch(() => null)
    
    console.log('Input box:', inputBox)
    console.log('Dropdown box:', dropdownBox)
    
    if (inputBox && dropdownBox) {
      // Check that dropdown is positioned below the input
      console.log('Input bottom:', inputBox.y + inputBox.height)
      console.log('Dropdown top:', dropdownBox.y)
      
      // Dropdown should start at or below the input bottom
      const isBelow = dropdownBox.y >= inputBox.y + inputBox.height
      console.log('Is dropdown below input?', isBelow)
      
      // Should be horizontally aligned (left edges should be close)
      const horizontalOffset = Math.abs(dropdownBox.x - inputBox.x)
      console.log('Horizontal offset:', horizontalOffset)
      const isAligned = horizontalOffset <= 5 // Allow 5px tolerance
      console.log('Is horizontally aligned?', isAligned)
      
      // Check that it's not in the top-left corner (common positioning bug)
      const isInTopLeft = dropdownBox.x < 50 && dropdownBox.y < 50
      console.log('Is in top-left corner (BAD)?', isInTopLeft)
      
      // Assertions
      expect(isBelow).toBeTruthy()
      expect(isAligned).toBeTruthy()
      expect(isInTopLeft).toBeFalsy()
    } else {
      console.log('Could not get bounding boxes - dropdown might not be visible')
      
      // Check if dropdown exists at all
      const dropdownCount = await page.locator('[role="tooltip"]').count()
      console.log('Dropdown elements found:', dropdownCount)
      
      // Try different selectors
      const paperElements = await page.locator('.MuiPaper-root').count()
      console.log('Paper elements found:', paperElements)
      
      const popperElements = await page.locator('.MuiPopper-root').count()
      console.log('Popper elements found:', popperElements)
    }
  })
  
  test('Dropdown positioning at different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'XL Desktop' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 960, height: 720, name: 'Tablet' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('http://localhost:5176')
      await page.waitForLoadState('networkidle')
      
      const searchInput = page.locator('#global-search-input')
      const inputVisible = await searchInput.isVisible()
      
      if (inputVisible) {
        await searchInput.click()
        await searchInput.fill('test')
        await page.waitForTimeout(300)
        
        const dropdown = page.locator('[role="tooltip"]').first()
        const dropdownVisible = await dropdown.isVisible().catch(() => false)
        
        if (dropdownVisible) {
          const inputBox = await searchInput.boundingBox()
          const dropdownBox = await dropdown.boundingBox()
          
          if (inputBox && dropdownBox) {
            const isBelow = dropdownBox.y >= inputBox.y + inputBox.height - 5 // 5px tolerance
            console.log(`${viewport.name}: Dropdown positioned correctly: ${isBelow}`)
            expect(isBelow).toBeTruthy()
          }
        }
        
        // Clear for next test
        await searchInput.clear()
      } else {
        console.log(`${viewport.name}: Mobile view - skipping`)
      }
    }
  })
})