import { test, expect } from '@playwright/test'

test.describe('Mobile Search Test', () => {
  test('Check mobile search icon at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5176')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Look for any button with Search text or icon
    const searchButtons = await page.locator('button').all()
    console.log('Total buttons found:', searchButtons.length)
    
    // Look for SVG icons that might be search
    const svgIcons = await page.locator('svg').all()
    console.log('Total SVG icons found:', svgIcons.length)
    
    // Try to find search icon by aria-label
    const searchIcon = page.locator('[aria-label*="search" i], [aria-label*="căutare" i], [aria-label*="caută" i]')
    const iconCount = await searchIcon.count()
    console.log('Search icons by aria-label:', iconCount)
    
    // Check for any element with Search icon class
    const muiSearchIcon = page.locator('.MuiSvgIcon-root')
    const muiIconCount = await muiSearchIcon.count()
    console.log('MUI SVG icons found:', muiIconCount)
    
    // Look for the actual Search icon component
    const searchPath = page.locator('path[d*="M15.5 14h"]') // Part of MUI Search icon path
    const searchPathCount = await searchPath.count()
    console.log('Search icon paths found:', searchPathCount)
  })
  
  test('Check at exactly 960px (md breakpoint)', async ({ page }) => {
    await page.setViewportSize({ width: 960, height: 720 })
    await page.goto('http://localhost:5176')
    
    await page.waitForLoadState('networkidle')
    
    // Check for desktop search input
    const desktopInput = page.locator('input[placeholder*="Caută"]')
    const desktopExists = await desktopInput.count()
    console.log('Desktop input at 960px:', desktopExists)
    
    // Check for mobile icon
    const mobileIcon = page.locator('[aria-label*="Căutare produse"]')
    const mobileExists = await mobileIcon.count()
    console.log('Mobile icon at 960px:', mobileExists)
  })
  
  test('Check at 959px (just below md)', async ({ page }) => {
    await page.setViewportSize({ width: 959, height: 720 })
    await page.goto('http://localhost:5176')
    
    await page.waitForLoadState('networkidle')
    
    // Check for desktop search input
    const desktopInput = page.locator('input[placeholder*="Caută"]')
    const desktopExists = await desktopInput.count()
    console.log('Desktop input at 959px:', desktopExists)
    
    // Check for mobile icon
    const mobileIcon = page.locator('[aria-label*="Căutare produse"]')
    const mobileExists = await mobileIcon.count()
    console.log('Mobile icon at 959px:', mobileExists)
  })
})