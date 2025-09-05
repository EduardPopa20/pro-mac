import { test, expect } from '@playwright/test'

test.describe('Admin Categories Investigation - Fixed', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page and login
    await page.goto('http://localhost:5177/auth')
    await page.waitForTimeout(1000)
    
    // Fill in credentials
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await emailInput.fill('eduardpopa68@yahoo.com')
    await passwordInput.fill('Test200')
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /autentificare/i })
    await loginButton.click()
    
    // Wait for navigation and auth to complete
    await page.waitForTimeout(3000)
  })

  test('Access admin produse page and take screenshot', async ({ page }) => {
    // Navigate to admin produse page
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Take screenshot of the current admin produse page
    await page.screenshot({ path: 'admin-produse-current.png', fullPage: true })
    
    // Log current URL
    console.log('Current URL:', page.url())
    console.log('Page title:', await page.title())
    
    // Get page content
    const pageContent = await page.textContent('body')
    console.log('Page text preview:', pageContent?.substring(0, 1000))
  })
  
  test('Investigate eye icon tooltips', async ({ page }) => {
    // Navigate to admin produse page
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Look for all buttons with tooltips or titles
    const buttonsWithTooltips = await page.locator('button[title], [data-testid*="view"], [aria-label*="Vezi"]').all()
    console.log(`Found ${buttonsWithTooltips.length} buttons with tooltips`)
    
    for (let i = 0; i < buttonsWithTooltips.length; i++) {
      const button = buttonsWithTooltips[i]
      const title = await button.getAttribute('title')
      const ariaLabel = await button.getAttribute('aria-label')
      const testId = await button.getAttribute('data-testid')
      const text = await button.textContent()
      
      console.log(`Button ${i + 1}:`, {
        title,
        ariaLabel,
        testId,
        text: text?.trim()
      })
    }
    
    // Look specifically for visibility icons
    const visibilityIcons = await page.locator('[data-testid="VisibilityIcon"], svg[data-testid="VisibilityIcon"]').count()
    console.log(`Found ${visibilityIcons} visibility (eye) icons`)
    
    // Look for any elements containing "Vezi"
    const veziElements = await page.locator('*:has-text("Vezi")').all()
    console.log(`Found ${veziElements.length} elements containing "Vezi"`)
    
    for (let i = 0; i < Math.min(veziElements.length, 10); i++) {
      const element = veziElements[i]
      const text = await element.textContent()
      console.log(`Vezi element ${i + 1}: ${text?.trim()}`)
    }
  })
  
  test('Investigate delete/recycle buttons', async ({ page }) => {
    // Navigate to admin produse page
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Look for delete/recycle icons
    const deleteButtons = await page.locator('[data-testid="DeleteIcon"], [data-testid*="delete"], button:has(svg[data-testid="DeleteIcon"])').all()
    console.log(`Found ${deleteButtons.length} delete buttons`)
    
    for (let i = 0; i < deleteButtons.length; i++) {
      const button = deleteButtons[i]
      const title = await button.getAttribute('title')
      const ariaLabel = await button.getAttribute('aria-label')
      const text = await button.textContent()
      
      console.log(`Delete button ${i + 1}:`, {
        title,
        ariaLabel,
        text: text?.trim()
      })
    }
  })
  
  test('Investigate product counters', async ({ page }) => {
    // Navigate to admin produse page
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Look for any numeric counters or badges
    const possibleCounters = await page.locator('span, div, td').filter({ hasText: /^\d+$/ }).all()
    console.log(`Found ${possibleCounters.length} possible numeric counters`)
    
    for (let i = 0; i < Math.min(possibleCounters.length, 20); i++) {
      const counter = possibleCounters[i]
      const text = await counter.textContent()
      const classList = await counter.getAttribute('class')
      
      console.log(`Counter ${i + 1}: "${text}" with classes: ${classList}`)
    }
    
    // Look for table cells containing numbers (likely product counts)
    const tableCells = await page.locator('td, th').all()
    console.log(`Found ${tableCells.length} table cells`)
    
    for (let i = 0; i < Math.min(tableCells.length, 30); i++) {
      const cell = tableCells[i]
      const text = await cell.textContent()
      if (text && /\d/.test(text)) {
        console.log(`Table cell ${i + 1}: "${text?.trim()}"`)
      }
    }
  })
  
  test('Investigate page structure and status columns', async ({ page }) => {
    // Navigate to admin produse page
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Look for table headers to understand structure
    const tableHeaders = await page.locator('th, .MuiTableHead-root th').all()
    console.log(`Found ${tableHeaders.length} table headers`)
    
    for (let i = 0; i < tableHeaders.length; i++) {
      const header = tableHeaders[i]
      const text = await header.textContent()
      console.log(`Header ${i + 1}: "${text?.trim()}"`)
    }
    
    // Look for status-related elements
    const statusElements = await page.locator('*:has-text("status"), *:has-text("Status"), *:has-text("stare"), *:has-text("Stare")').all()
    console.log(`Found ${statusElements.length} status-related elements`)
    
    for (let i = 0; i < statusElements.length; i++) {
      const element = statusElements[i]
      const text = await element.textContent()
      console.log(`Status element ${i + 1}: "${text?.trim()}"`)
    }
    
    // Take detailed screenshot for analysis
    await page.screenshot({ path: 'admin-produse-detailed.png', fullPage: true })
  })
})