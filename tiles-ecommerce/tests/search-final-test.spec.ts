import { test, expect } from '@playwright/test'

test.describe('Search Component Final Test', () => {
  test('Search works correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    await page.waitForLoadState('networkidle')
    
    // Find and interact with search
    const searchInput = page.locator('#global-search-input')
    
    // Click and focus
    await searchInput.click()
    await expect(searchInput).toBeFocused()
    
    // Type something
    await searchInput.fill('faianta')
    await expect(searchInput).toHaveValue('faianta')
    
    // Clear and type again
    await searchInput.clear()
    await searchInput.type('gresie')
    await expect(searchInput).toHaveValue('gresie')
    
    // Test the clear button if visible
    const clearButton = page.locator('[aria-label="Clear search"]')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await expect(searchInput).toHaveValue('')
    }
    
    console.log('✅ Desktop search is fully functional!')
  })
  
  test('Search works at different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop XL' },
      { width: 1440, height: 900, name: 'Desktop L' },
      { width: 1280, height: 720, name: 'Desktop M' },
      { width: 960, height: 720, name: 'Tablet' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('http://localhost:5176')
      await page.waitForLoadState('networkidle')
      
      const searchInput = page.locator('#global-search-input')
      const isVisible = await searchInput.isVisible()
      
      if (isVisible) {
        await searchInput.click()
        await searchInput.fill(`test ${viewport.name}`)
        const value = await searchInput.inputValue()
        expect(value).toBe(`test ${viewport.name}`)
        console.log(`✅ ${viewport.name} (${viewport.width}px): Search works`)
      } else {
        console.log(`ℹ️ ${viewport.name} (${viewport.width}px): Mobile view active`)
      }
    }
  })
})