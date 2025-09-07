import { test, expect } from '@playwright/test'

test('Check SearchComponent existence and rendering', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  // Listen for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text())
    } else if (msg.text().includes('Search') || msg.text().includes('search')) {
      console.log('Console (search-related):', msg.text())
    }
  })
  
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message)
  })
  
  await page.goto('http://localhost:5178')
  await page.waitForLoadState('networkidle')
  
  console.log('✅ Page loaded')
  
  // Check if SearchComponent wrapper exists in DOM
  const searchWrappers = await page.locator('[data-testid*="search"], [class*="search"], [class*="Search"]').count()
  console.log('📍 Search-related elements found:', searchWrappers)
  
  // Check for the specific search input ID
  const searchInputById = await page.locator('#global-search-input').count()
  console.log('📍 Elements with #global-search-input ID:', searchInputById)
  
  // Check for any TextField components
  const textFields = await page.locator('.MuiTextField-root, input[type="text"], input[type="search"]').count()
  console.log('📍 Total TextField/input elements:', textFields)
  
  // Check if any search-related text exists
  const searchPlaceholders = await page.locator('input[placeholder*="Caută"], input[placeholder*="caută"], input[placeholder*="Search"], input[placeholder*="search"]').count()
  console.log('📍 Inputs with search placeholder:', searchPlaceholders)
  
  // Check viewport and responsive breakpoint
  const viewportSize = await page.viewportSize()
  console.log('📍 Viewport size:', viewportSize)
  
  // Check if we're at desktop breakpoint (should show TextField, not icon)
  const isDesktop = viewportSize && viewportSize.width >= 960
  console.log('📍 Should show desktop search (≥960px):', isDesktop)
  
  // Look for mobile search icon (should NOT be visible on desktop)
  const mobileSearchIcon = await page.locator('button[aria-label*="Căutare"], button[aria-label*="search"]').count()
  console.log('📍 Mobile search icons found:', mobileSearchIcon)
  
  // Check if there are any React error boundaries or error messages
  const errorMessages = await page.locator('[class*="error"], [class*="Error"], .error-boundary, .error-fallback').count()
  console.log('📍 Error UI elements found:', errorMessages)
  
  // Wait a bit longer and check again
  await page.waitForTimeout(2000)
  
  const searchInputAfterWait = await page.locator('#global-search-input').count()
  console.log('📍 Search input count after waiting:', searchInputAfterWait)
  
  // Try to find the SearchComponent by looking at the navbar structure
  const navbarInputs = await page.locator('header input, nav input, [role="banner"] input').count()
  console.log('📍 Inputs in navbar/header area:', navbarInputs)
  
  // Check if SearchComponent is imported and used correctly
  const hasSearchFunctionality = await page.evaluate(() => {
    // Look for any elements with search-related data attributes or classes
    const searchElements = document.querySelectorAll('[data-testid="search-input"], #global-search-input, [class*="search"]')
    return searchElements.length
  })
  console.log('📍 Search elements found via JS query:', hasSearchFunctionality)
})