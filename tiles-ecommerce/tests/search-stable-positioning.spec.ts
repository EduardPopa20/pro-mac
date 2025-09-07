import { test, expect } from '@playwright/test'

test('Search dropdown stable positioning test', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  
  await page.waitForLoadState('networkidle')
  
  const searchInput = page.locator('#global-search-input')
  await expect(searchInput).toBeVisible()
  
  // Initial click and type
  await searchInput.click()
  await searchInput.fill('fa')
  
  // Wait for dropdown to appear
  await page.waitForTimeout(400)
  
  const dropdown = page.locator('.MuiPopper-root').first()
  const isVisible = await dropdown.isVisible().catch(() => false)
  
  if (isVisible) {
    // Get initial position
    const initialPosition = await dropdown.boundingBox()
    console.log('Initial dropdown position:', initialPosition)
    
    // Type more text
    await searchInput.fill('faianta')
    await page.waitForTimeout(200)
    
    // Check position after typing
    const afterTypingPosition = await dropdown.boundingBox()
    console.log('After typing position:', afterTypingPosition)
    
    // Click on the dropdown area (should not cause movement)
    if (afterTypingPosition) {
      await page.mouse.move(
        afterTypingPosition.x + 50, 
        afterTypingPosition.y + 50
      )
      await page.waitForTimeout(100)
      
      const afterMousePosition = await dropdown.boundingBox()
      console.log('After mouse interaction position:', afterMousePosition)
      
      // Check stability
      if (initialPosition && afterTypingPosition && afterMousePosition) {
        const typingDrift = Math.abs(afterTypingPosition.x - initialPosition.x) + Math.abs(afterTypingPosition.y - initialPosition.y)
        const mouseDrift = Math.abs(afterMousePosition.x - afterTypingPosition.x) + Math.abs(afterMousePosition.y - afterTypingPosition.y)
        
        console.log('Position drift after typing:', typingDrift, 'px')
        console.log('Position drift after mouse:', mouseDrift, 'px')
        
        // Allow small drift (< 2px) due to text content changes
        expect(typingDrift).toBeLessThan(3)
        expect(mouseDrift).toBeLessThan(1)
        
        console.log('✅ Dropdown position is stable!')
      }
    }
    
    // Test multiple interactions
    for (let i = 0; i < 5; i++) {
      await searchInput.fill(`test${i}`)
      await page.waitForTimeout(100)
    }
    
    const finalPosition = await dropdown.boundingBox()
    if (initialPosition && finalPosition) {
      const totalDrift = Math.abs(finalPosition.x - initialPosition.x) + Math.abs(finalPosition.y - initialPosition.y)
      console.log('Total drift after multiple interactions:', totalDrift, 'px')
      expect(totalDrift).toBeLessThan(5)
    }
    
  } else {
    console.log('❌ Dropdown not visible - cannot test positioning')
  }
})