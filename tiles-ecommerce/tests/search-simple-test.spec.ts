import { test, expect } from '@playwright/test'

test.describe('Simple Search Test', () => {
  test('Can type in search field on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find the search input
    const searchInput = page.locator('#global-search-input')
    
    // Check if it's visible
    const isVisible = await searchInput.isVisible()
    console.log('Search input visible:', isVisible)
    
    // Try to type directly without clicking
    await searchInput.fill('test')
    
    // Check the value
    const value = await searchInput.inputValue()
    console.log('Input value:', value)
    
    expect(value).toBe('test')
  })
  
  test('Can click and type in search field', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Try to click on the parent container first
    const searchContainer = page.locator('#global-search-input').locator('..')
    await searchContainer.click()
    
    // Now try to type
    await page.keyboard.type('hello')
    
    // Check if the text was entered
    const searchInput = page.locator('#global-search-input')
    const value = await searchInput.inputValue()
    console.log('Value after typing:', value)
    
    expect(value).toBe('hello')
  })
  
  test('Force click on input element', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Force click directly on the input element
    await page.locator('#global-search-input').click({ force: true })
    
    // Type something
    await page.keyboard.type('forced')
    
    // Check the value
    const value = await page.locator('#global-search-input').inputValue()
    console.log('Value after force click:', value)
    
    expect(value).toBe('forced')
  })
})