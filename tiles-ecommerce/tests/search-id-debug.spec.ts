import { test } from '@playwright/test'

test('Debug search input ID', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  await page.waitForLoadState('networkidle')
  
  // Find all input elements
  const allInputs = await page.locator('input').all()
  console.log(`Total inputs found: ${allInputs.length}`)
  
  for (let i = 0; i < allInputs.length; i++) {
    const input = allInputs[i]
    const id = await input.getAttribute('id')
    const placeholder = await input.getAttribute('placeholder') 
    const type = await input.getAttribute('type')
    const className = await input.getAttribute('class')
    
    console.log(`Input ${i}:`)
    console.log(`  ID: ${id}`)
    console.log(`  Placeholder: ${placeholder}`)
    console.log(`  Type: ${type}`)
    console.log(`  Class: ${className}`)
    console.log('')
  }
  
  // Try to find the search input by various selectors
  const byId = await page.locator('#global-search-input').count()
  const byPlaceholder = await page.locator('input[placeholder*="Caută"]').count()
  const byDataTestId = await page.locator('[data-testid="search-input"]').count()
  
  console.log('Selector results:')
  console.log(`  By ID (#global-search-input): ${byId}`)
  console.log(`  By Placeholder: ${byPlaceholder}`)
  console.log(`  By data-testid: ${byDataTestId}`)
})