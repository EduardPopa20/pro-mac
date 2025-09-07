import { test, expect } from '@playwright/test'

test('Direct search input clickability test', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  
  await page.goto('http://localhost:5178')
  await page.waitForLoadState('networkidle')
  
  // Wait for the search input to be fully rendered
  await page.waitForTimeout(3000)
  
  // Find the search input
  const searchInput = page.locator('#global-search-input')
  await expect(searchInput).toBeVisible({ timeout: 10000 })
  
  console.log('✅ Search input is visible')
  
  // Test 1: Can we click it?
  try {
    await searchInput.click({ timeout: 5000 })
    console.log('✅ Search input clicked successfully')
  } catch (error) {
    console.log('❌ Cannot click search input:', error.message)
    return
  }
  
  // Test 2: Can we focus it?
  try {
    await searchInput.focus({ timeout: 5000 })
    console.log('✅ Search input focused successfully')
  } catch (error) {
    console.log('❌ Cannot focus search input:', error.message)
    return
  }
  
  // Test 3: Can we type in it?
  try {
    await searchInput.fill('test')
    const value = await searchInput.inputValue()
    console.log('✅ Text entered successfully, value:', value)
    
    if (value === 'test') {
      console.log('🎉 SEARCH INPUT IS FULLY FUNCTIONAL!')
    } else {
      console.log('❌ Text not captured properly')
    }
  } catch (error) {
    console.log('❌ Cannot type in search input:', error.message)
  }
  
  // Test 4: Check if it's actually an input element
  const isInput = await searchInput.evaluate(el => el.tagName.toLowerCase() === 'input')
  console.log('📍 Is input element:', isInput)
  
  // Test 5: Check if it's disabled or readonly
  const isDisabled = await searchInput.isDisabled()
  const isReadonly = await searchInput.getAttribute('readonly')
  console.log('📍 Is disabled:', isDisabled)
  console.log('📍 Is readonly:', isReadonly !== null)
})