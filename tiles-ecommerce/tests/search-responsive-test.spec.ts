import { test } from '@playwright/test'

test('Debug responsive search rendering', async ({ page }) => {
  const viewports = [
    { width: 1920, height: 1080, name: 'XL' },
    { width: 1280, height: 720, name: 'L' },
    { width: 960, height: 720, name: 'MD' },
    { width: 959, height: 720, name: 'SM' }
  ]
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('http://localhost:5176')
    await page.waitForLoadState('networkidle')
    
    // Check for desktop input
    const desktopInput = await page.locator('#global-search-input').count()
    
    // Check for mobile icon  
    const mobileIcon = await page.locator('[aria-label="Căutare produse"]').count()
    
    // Check total search-related elements
    const searchElements = await page.locator('input[placeholder*="Caută"], [aria-label*="Căutare"]').count()
    
    console.log(`${viewport.name} (${viewport.width}px):`)
    console.log(`  Desktop input: ${desktopInput}`)
    console.log(`  Mobile icon: ${mobileIcon}`) 
    console.log(`  Total search elements: ${searchElements}`)
    console.log('')
  }
})