import { test, expect } from '@playwright/test'

test('Debug search functionality', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  // Listen to console logs to debug
  page.on('console', msg => console.log('Console:', msg.text()))
  page.on('pageerror', error => console.log('Page error:', error.message))
  
  try {
    await page.goto('http://localhost:5178', { timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    console.log('✅ Page loaded successfully')
    
    // Test desktop search input
    const searchInput = page.locator('#global-search-input')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    
    console.log('✅ Search input is visible')
    
    // Click and focus
    await searchInput.click()
    await searchInput.focus()
    console.log('✅ Search input focused')
    
    // Type search query character by character to trigger onChange
    await searchInput.fill('')
    await searchInput.type('fa', { delay: 100 })
    console.log('✅ Text "fa" typed')
    
    // Check if console shows handleInputChange
    await page.waitForTimeout(1000)
    
    // Continue typing
    await searchInput.type('ianta', { delay: 100 })
    console.log('✅ Text "faianta" completed')
    
    // Wait longer for API call
    await page.waitForTimeout(2000)
    
    // Check if popper exists at all (even if hidden)
    const popperExists = await page.locator('.MuiPopper-root').count()
    console.log('🔍 Number of poppers found:', popperExists)
    
    // Check search component states
    const inputValue = await searchInput.inputValue()
    console.log('🔍 Input value:', inputValue)
    
    // Check if there are any network requests
    await page.waitForTimeout(1000)
    
    // Try to find any dropdown-like elements
    const allDropdowns = await page.locator('[role="tooltip"], [role="dialog"], [role="listbox"], .MuiPopper-root, .MuiPaper-root').count()
    console.log('🔍 Total dropdown-like elements:', allDropdowns)
    
    // Check if search results container exists
    const resultsContainer = await page.locator('[data-testid*="search"], [class*="search-results"], [class*="MuiPopper"]').count()
    console.log('🔍 Search result containers:', resultsContainer)
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
})