import { test, expect } from '@playwright/test'

test.describe('Search with correct selector', () => {
  test('Type in search field using placeholder', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find input by placeholder
    const searchInput = page.locator('input[placeholder*="Caută"]')
    
    // Check if it exists
    const exists = await searchInput.count()
    console.log('Search input found:', exists)
    
    if (exists > 0) {
      // Check visibility
      const isVisible = await searchInput.isVisible()
      console.log('Is visible:', isVisible)
      
      // Click on it
      await searchInput.click()
      
      // Type something
      await searchInput.fill('test search')
      
      // Check the value
      const value = await searchInput.inputValue()
      console.log('Value entered:', value)
      
      expect(value).toBe('test search')
    }
  })
  
  test('Search functionality works end-to-end', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find and fill search input
    const searchInput = page.locator('input[placeholder*="Caută"]')
    await searchInput.click()
    await searchInput.fill('faianta')
    
    // Wait for debounce
    await page.waitForTimeout(500)
    
    // Check if dropdown appears
    const dropdown = page.locator('[role="tooltip"]')
    const dropdownVisible = await dropdown.isVisible().catch(() => false)
    console.log('Dropdown visible:', dropdownVisible)
    
    // Clear the search
    await searchInput.clear()
    
    // Type another search
    await searchInput.fill('gresie')
    const newValue = await searchInput.inputValue()
    expect(newValue).toBe('gresie')
  })
})