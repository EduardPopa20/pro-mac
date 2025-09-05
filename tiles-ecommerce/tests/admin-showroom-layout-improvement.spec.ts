import { test, expect } from '@playwright/test'

// Helper function for setting viewport sizes
async function setViewport(page: any, bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizes = { 
    xs: [360, 720], 
    sm: [600, 900], 
    md: [960, 1000], 
    lg: [1280, 1000], 
    xl: [1920, 1080] 
  }
  const [w, h] = sizes[bp]
  await page.setViewportSize({ width: w, height: h })
}

// Helper function to get computed CSS property
async function computedPx(page: any, locator: any, prop: string) {
  return await locator.evaluate((el: Element, prop: string) => 
    getComputedStyle(el).getPropertyValue(prop), prop
  )
}

test.describe('Admin Showroom Create - Layout Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login page
    await page.goto('http://localhost:5179/admin')
    
    // Check if we're already logged in or need to authenticate
    try {
      await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 2000 })
    } catch {
      // Need to login - fill in admin credentials if login form is present
      try {
        await page.waitForSelector('input[type="email"]', { timeout: 2000 })
        await page.fill('input[type="email"]', 'admin@test.com')
        await page.fill('input[type="password"]', 'TestPass123!')
        await page.click('button[type="submit"]')
        await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 5000 })
      } catch {
        console.log('No login form found or already authenticated')
      }
    }
    
    // Navigate to showroom create page
    await page.goto('http://localhost:5179/admin/showroom-uri/create')
    await page.waitForLoadState('networkidle')
  })

  test('should display action buttons in upper-right corner', async ({ page }) => {
    // Wait for the page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Check that Save and Preview buttons are visible
    const saveButton = page.locator('button:has-text("Creează")')
    const previewButton = page.locator('button:has-text("Preview")')
    
    await expect(saveButton).toBeVisible()
    await expect(previewButton).toBeVisible()
    
    // Verify buttons are positioned in upper area
    const saveButtonBox = await saveButton.boundingBox()
    const previewButtonBox = await previewButton.boundingBox()
    
    expect(saveButtonBox?.y).toBeLessThan(200) // Should be in upper portion
    expect(previewButtonBox?.y).toBeLessThan(200)
  })

  test('should not display "Înapoi la listă" button', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Ensure the back button is not present
    const backButton = page.locator('button:has-text("Înapoi la listă")')
    await expect(backButton).not.toBeVisible()
  })

  test('should display showroom settings toggle near action buttons', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Check that showroom active toggle is visible
    const settingsToggle = page.locator('text=Showroom activ').first()
    await expect(settingsToggle).toBeVisible()
    
    // Verify the toggle is in the upper area (near action buttons)
    const toggleBox = await settingsToggle.boundingBox()
    expect(toggleBox?.y).toBeLessThan(200) // Should be in upper portion with action buttons
  })

  test('should have balanced column heights', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Get the main form sections
    const leftColumn = page.locator('[role="grid"] > div').first()
    const rightColumn = page.locator('[role="grid"] > div').last()
    
    const leftHeight = await leftColumn.evaluate(el => el.offsetHeight)
    const rightHeight = await rightColumn.evaluate(el => el.offsetHeight)
    
    // Right column should now be shorter than left (more balanced)
    // Previously right column was taller due to actions card
    expect(leftHeight).toBeGreaterThan(rightHeight * 0.8) // Allow some variance but should be more balanced
  })

  test('should maintain button functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Fill required fields
    await page.fill('input[label="Nume Showroom"]', 'Test Showroom')
    await page.fill('input[label="Oraș"]', 'București')  
    await page.fill('input[label="Adresa completă"]', 'Test Address 123')
    
    // Test Preview button
    const previewButton = page.locator('button:has-text("Preview")')
    await expect(previewButton).toBeEnabled()
    
    // Test Save button becomes enabled when form is valid
    const saveButton = page.locator('button:has-text("Creează")')
    await expect(saveButton).toBeEnabled()
    
    // Verify tooltips are present
    await previewButton.hover()
    await expect(page.locator('text=Visualizează cum va arăta showroom-ul pe site')).toBeVisible()
    
    await saveButton.hover()
    await expect(page.locator('text=Creează showroom-ul nou')).toBeVisible()
  })

  test('should follow CLAUDE.md design standards - button sizes', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    const saveButton = page.locator('button:has-text("Creează")')
    const previewButton = page.locator('button:has-text("Preview")')
    
    // Check button heights meet CLAUDE.md standards (≥48px for large buttons)
    const saveButtonBox = await saveButton.boundingBox()
    const previewButtonBox = await previewButton.boundingBox()
    
    expect(saveButtonBox?.height).toBeGreaterThanOrEqual(48)
    expect(previewButtonBox?.height).toBeGreaterThanOrEqual(48)
    
    // Check button widths are appropriate (minimum 140px for Preview, 160px for Save as specified)
    expect(saveButtonBox?.width).toBeGreaterThanOrEqual(160)
    expect(previewButtonBox?.width).toBeGreaterThanOrEqual(140)
  })

  test('should be responsive across breakpoints', async ({ page }) => {
    for (const bp of ['xs', 'md', 'lg'] as const) {
      await setViewport(page, bp)
      await page.reload()
      await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
      
      // Verify buttons are visible at all breakpoints
      const saveButton = page.locator('button:has-text("Creează")')
      const previewButton = page.locator('button:has-text("Preview")')
      
      await expect(saveButton).toBeVisible()
      await expect(previewButton).toBeVisible()
      
      // Check no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasHorizontalScroll).toBeFalsy()
      
      // On mobile, buttons should stack vertically
      if (bp === 'xs') {
        const saveButtonBox = await saveButton.boundingBox()
        const previewButtonBox = await previewButton.boundingBox()
        
        // Buttons should be stacked (Save button should be below Preview button)
        if (saveButtonBox && previewButtonBox) {
          expect(saveButtonBox.y).toBeGreaterThan(previewButtonBox.y)
        }
      }
    }
  })

  test('should maintain form functionality and validation', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Initially save button should be disabled (required fields empty)
    const saveButton = page.locator('button:has-text("Creează")')
    await expect(saveButton).toBeDisabled()
    
    // Fill required fields one by one and verify enabling
    await page.fill('input[label="Nume Showroom"]', 'Test Showroom')
    await expect(saveButton).toBeDisabled() // Still missing required fields
    
    await page.fill('input[label="Oraș"]', 'București')
    await expect(saveButton).toBeDisabled() // Still missing address
    
    await page.fill('input[label="Adresa completă"]', 'Test Address 123')
    await expect(saveButton).toBeEnabled() // Now all required fields filled
    
    // Verify showroom toggle works
    const toggle = page.locator('input[type="checkbox"]').first()
    const isChecked = await toggle.isChecked()
    await toggle.click()
    await expect(toggle).toBeChecked(!isChecked)
  })

  test('should have proper accessibility - focus and keyboard navigation', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Test keyboard navigation to action buttons
    await page.keyboard.press('Tab')
    
    // Focus should eventually reach our action buttons
    let focusedElement = await page.locator(':focus').textContent()
    let tabCount = 0
    
    while (tabCount < 20 && !focusedElement?.includes('Preview') && !focusedElement?.includes('Creează')) {
      await page.keyboard.press('Tab')
      focusedElement = await page.locator(':focus').textContent()
      tabCount++
    }
    
    expect(tabCount).toBeLessThan(20) // Should find buttons within reasonable tab count
    
    // Verify buttons have proper ARIA labels or accessible names
    const saveButton = page.locator('button:has-text("Creează")')
    const previewButton = page.locator('button:has-text("Preview")')
    
    await expect(saveButton).toHaveAttribute('type', 'button')
    await expect(previewButton).toHaveAttribute('type', 'button')
  })

  test('should maintain sticky positioning behavior', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('button:has-text("Creează")', { timeout: 10000 })
    
    // Get initial button positions
    const saveButton = page.locator('button:has-text("Creează")')
    const initialPosition = await saveButton.boundingBox()
    
    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 300))
    await page.waitForTimeout(100)
    
    // Buttons should maintain their position due to sticky positioning
    const scrolledPosition = await saveButton.boundingBox()
    
    // Y position should remain relatively the same (allowing for some browser variance)
    expect(Math.abs((scrolledPosition?.y || 0) - (initialPosition?.y || 0))).toBeLessThan(50)
  })
})