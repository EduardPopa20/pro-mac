import { test } from '@playwright/test'

test('Quick position test', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  try {
    await page.goto('http://localhost:5176', { timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    const searchInput = page.locator('#global-search-input')
    const isVisible = await searchInput.isVisible().catch(() => false)
    
    if (isVisible) {
      await searchInput.click()
      await searchInput.fill('fa')
      await page.waitForTimeout(500)
      
      const dropdown = page.locator('.MuiPopper-root').first()
      const dropdownVisible = await dropdown.isVisible().catch(() => false)
      
      if (dropdownVisible) {
        const inputBox = await searchInput.boundingBox()
        const dropdownBox = await dropdown.boundingBox()
        
        if (inputBox && dropdownBox) {
          console.log('Input Y:', inputBox.y, 'Bottom:', inputBox.y + inputBox.height)
          console.log('Dropdown Y:', dropdownBox.y)
          console.log('Is below?', dropdownBox.y > inputBox.y + inputBox.height)
        }
      } else {
        console.log('Dropdown not visible')
      }
    } else {
      console.log('Search input not visible')
    }
  } catch (error) {
    console.log('Error:', error.message)
  }
})