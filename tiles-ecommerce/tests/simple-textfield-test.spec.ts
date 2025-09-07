import { test, expect } from '@playwright/test'

test('Test simple TextField onChange functionality', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  // Listen to console logs
  page.on('console', msg => console.log('Console:', msg.text()))
  
  // Navigate to page
  await page.goto('http://localhost:5178')
  await page.waitForLoadState('networkidle')
  
  console.log('✅ Page loaded')
  
  // Try to interact with any other TextField on the page to see if onChange works
  const anyInput = page.locator('input[type="text"], input[type="search"], textarea').first()
  const inputExists = await anyInput.count()
  
  if (inputExists > 0) {
    console.log('📍 Found input element')
    
    // Try to type into it
    await anyInput.click()
    await anyInput.fill('test')
    
    const value = await anyInput.inputValue()
    console.log('📍 Input value after typing:', value)
    
    if (value === 'test') {
      console.log('✅ Basic TextField onChange is working')
    } else {
      console.log('❌ Basic TextField onChange is NOT working')
    }
  } else {
    console.log('❌ No input elements found')
  }
  
  // Now test the search input specifically
  const searchInput = page.locator('#global-search-input')
  const searchExists = await searchInput.isVisible().catch(() => false)
  
  if (searchExists) {
    console.log('📍 Search input exists and is visible')
    
    // Check if it has the right event handlers
    const hasOnChange = await page.evaluate(() => {
      const input = document.getElementById('global-search-input')
      return input ? input.onchange !== null : false
    })
    
    console.log('📍 Search input has onChange handler:', hasOnChange)
    
    // Try manual event triggering
    await page.evaluate(() => {
      const input = document.getElementById('global-search-input') as HTMLInputElement
      if (input) {
        input.value = 'manual-test'
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    
    await page.waitForTimeout(500)
    const manualValue = await searchInput.inputValue()
    console.log('📍 Manual event test value:', manualValue)
    
  } else {
    console.log('❌ Search input not visible')
  }
})