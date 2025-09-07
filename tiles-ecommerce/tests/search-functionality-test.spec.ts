import { test, expect } from '@playwright/test'

test.describe('Search Component Functionality', () => {
  // Test on desktop viewport
  test('Search bar should be clickable and functional on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for the search input to be visible
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).toBeVisible()
    
    // Click on the search input
    await searchInput.click()
    
    // Verify the input is focused
    await expect(searchInput).toBeFocused()
    
    // Type in the search input
    await searchInput.fill('faianta')
    
    // Verify the value was entered
    await expect(searchInput).toHaveValue('faianta')
    
    // Wait for search results to appear (popper)
    await page.waitForTimeout(500) // Wait for debounce
    
    // Check if search results container appears
    const searchResults = page.locator('[role="tooltip"]').first()
    const isVisible = await searchResults.isVisible().catch(() => false)
    
    if (isVisible) {
      console.log('Search results dropdown is visible')
    }
    
    // Clear the search
    const clearButton = page.locator('[aria-label="Clear search"]')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await expect(searchInput).toHaveValue('')
    }
  })
  
  // Test on tablet viewport
  test('Search bar should be clickable and functional on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for the search input to be visible
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).toBeVisible()
    
    // Click on the search input
    await searchInput.click()
    
    // Verify the input is focused
    await expect(searchInput).toBeFocused()
    
    // Type in the search input
    await searchInput.fill('gresie')
    
    // Verify the value was entered
    await expect(searchInput).toHaveValue('gresie')
  })
  
  // Test on mobile viewport (should show icon instead)
  test('Search icon should be visible and functional on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5176')
    
    // On mobile, there should be a search icon button instead of a text field
    const searchIcon = page.locator('[aria-label="Căutare produse"]')
    await expect(searchIcon).toBeVisible()
    
    // The desktop search input should NOT be visible
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).not.toBeVisible()
    
    // Click the search icon to open mobile modal
    await searchIcon.click()
    
    // Wait for mobile modal to open
    await page.waitForTimeout(300)
    
    // In the modal, there should be a search input
    const modalSearchInput = page.locator('input[placeholder*="Caută"]').last()
    await expect(modalSearchInput).toBeVisible()
    
    // Type in the modal search input
    await modalSearchInput.fill('parchet')
    await expect(modalSearchInput).toHaveValue('parchet')
  })
  
  // Test that clicking directly on the TextField works
  test('Direct click on TextField should focus the input', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Get the search input field
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).toBeVisible()
    
    // Get the bounding box of the input
    const box = await searchInput.boundingBox()
    if (!box) throw new Error('Could not get search input bounding box')
    
    // Click in the middle of the search input
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    
    // Verify the input is focused
    await expect(searchInput).toBeFocused()
    
    // Type something to verify it's working
    await page.keyboard.type('test search')
    await expect(searchInput).toHaveValue('test search')
  })
  
  // Test that there's no interference from parent elements
  test('No event interference from parent elements', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    const searchInput = page.locator('#global-search-input')
    
    // Try multiple clicks to ensure consistent behavior
    for (let i = 0; i < 3; i++) {
      await searchInput.click()
      await expect(searchInput).toBeFocused()
      
      // Type and clear
      await searchInput.fill(`test ${i}`)
      await expect(searchInput).toHaveValue(`test ${i}`)
      await searchInput.clear()
    }
  })
})