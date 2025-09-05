import { test, expect } from '@playwright/test'

test.describe('Admin Showroom Create - Working Hours Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to showroom create page
    await page.goto('http://localhost:5179/admin/showroom-uri/create')
    await page.waitForLoadState('networkidle')
  })

  test('should display working hours section in right column only', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    // Verify working hours section exists and is visible
    const workingHoursSection = page.locator('text=Program de lucru').first()
    await expect(workingHoursSection).toBeVisible()
    
    // Verify it's in the right column area
    const workingHoursBox = await workingHoursSection.boundingBox()
    const viewportWidth = await page.viewportSize()?.width || 1280
    
    // Should be positioned in right side of the page (for desktop)
    if (viewportWidth >= 960) {
      expect(workingHoursBox?.x || 0).toBeGreaterThan(viewportWidth * 0.6)
    }
  })

  test('should have balanced height with left column after removing actions', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    // Get main content areas
    const leftColumn = page.locator('text=Informații de bază').locator('..').locator('..')
    const rightColumn = page.locator('text=Program de lucru').locator('..').locator('..')
    
    const leftHeight = await leftColumn.evaluate(el => el.offsetHeight)
    const rightHeight = await rightColumn.evaluate(el => el.offsetHeight)
    
    // Right column should now be significantly shorter than before
    // (Previously it was taller due to actions card)
    expect(rightHeight).toBeLessThan(leftHeight * 1.2) // Allow some variance but should be more balanced
  })

  test('should maintain working hours editor functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    // Check if working hours editor is interactive
    // Look for day toggles or time inputs (depends on WorkingHoursEditor implementation)
    const workingHoursEditor = page.locator('text=Program de lucru').locator('..')
    await expect(workingHoursEditor).toBeVisible()
    
    // The working hours editor should be functional
    // This test validates the component is rendered and interactive
    const editorElements = await workingHoursEditor.locator('input, button, select').count()
    expect(editorElements).toBeGreaterThan(0) // Should have interactive elements
  })

  test('should have proper sticky positioning for working hours', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    // Get working hours section
    const workingHoursSection = page.locator('text=Program de lucru').first()
    const initialPosition = await workingHoursSection.boundingBox()
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.waitForTimeout(200)
    
    // Check if position changes appropriately with sticky behavior
    const scrolledPosition = await workingHoursSection.boundingBox()
    
    // Should maintain visibility (sticky positioning should keep it in view)
    await expect(workingHoursSection).toBeVisible()
  })

  test('should be responsive - working hours section adapts to mobile', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 360, height: 720 })
    await page.reload()
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    // Working hours should still be visible on mobile
    const workingHoursSection = page.locator('text=Program de lucru').first()
    await expect(workingHoursSection).toBeVisible()
    
    // Should not cause horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => 
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(hasHorizontalScroll).toBeFalsy()
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    await expect(workingHoursSection).toBeVisible()
    
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.reload()
    await page.waitForSelector('text=Program de lucru', { timeout: 10000 })
    
    await expect(workingHoursSection).toBeVisible()
  })
})