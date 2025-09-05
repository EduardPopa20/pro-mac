import { test, expect } from '@playwright/test'

test.describe('Admin Categories Investigation', () => {
  test('Navigate to admin dashboard and take screenshots', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5177')
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true })
    
    // Navigate to admin login or directly to admin area
    try {
      await page.goto('http://localhost:5177/admin/produse')
      await page.waitForTimeout(2000)
      
      // Check if we need to login
      const loginForm = page.locator('form').first()
      if (await loginForm.isVisible({ timeout: 3000 })) {
        console.log('Login form detected, logging in...')
        
        // Fill in credentials
        const emailInput = page.getByRole('textbox', { name: /email/i }).or(page.locator('input[type="email"]')).or(page.locator('input[name="email"]'))
        const passwordInput = page.getByRole('textbox', { name: /parola/i }).or(page.locator('input[type="password"]')).or(page.locator('input[name="password"]'))
        const submitButton = page.getByRole('button', { name: /autentificare/i }).or(page.getByRole('button', { name: /conectare/i })).or(page.getByRole('button', { name: /login/i }))
        
        await emailInput.fill('eduardpopa68@yahoo.com')
        await passwordInput.fill('Test200')
        await submitButton.click()
        
        // Wait for navigation
        await page.waitForTimeout(3000)
        
        // Try to navigate to admin area again
        await page.goto('http://localhost:5177/admin/produse')
        await page.waitForTimeout(2000)
      }
      
      // Take screenshot of admin produse page
      await page.screenshot({ path: 'admin-produse-before.png', fullPage: true })
      
      // Log current URL and page title
      console.log('Current URL:', page.url())
      console.log('Page title:', await page.title())
      
      // Try to find and log elements on the page
      const pageContent = await page.locator('body').textContent()
      console.log('Page contains text:', pageContent?.substring(0, 500))
      
      // Look for specific admin elements
      const adminElements = await page.locator('[data-testid], [role="button"], .MuiButton-root').count()
      console.log('Found admin elements:', adminElements)
      
      // Check for tooltips
      const tooltips = await page.locator('[title]').count()
      console.log('Found elements with tooltips:', tooltips)
      
    } catch (error) {
      console.log('Error accessing admin area:', error)
      
      // Take screenshot of current state
      await page.screenshot({ path: 'admin-access-error.png', fullPage: true })
      
      // Try alternative paths
      await page.goto('http://localhost:5177/auth')
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'auth-page.png', fullPage: true })
    }
  })
  
  test('Investigate current admin categories structure', async ({ page }) => {
    // Navigate to admin area
    await page.goto('http://localhost:5177/admin/produse')
    await page.waitForTimeout(2000)
    
    // Handle login if needed
    const loginForm = page.locator('form').first()
    if (await loginForm.isVisible({ timeout: 3000 })) {
      const emailInput = page.getByRole('textbox', { name: /email/i }).or(page.locator('input[type="email"]'))
      const passwordInput = page.getByRole('textbox', { name: /parola/i }).or(page.locator('input[type="password"]'))
      const submitButton = page.getByRole('button', { name: /autentificare/i }).or(page.getByRole('button', { name: /conectare/i }))
      
      await emailInput.fill('eduardpopa68@yahoo.com')
      await passwordInput.fill('Test200')
      await submitButton.click()
      await page.waitForTimeout(3000)
      await page.goto('http://localhost:5177/admin/produse')
      await page.waitForTimeout(2000)
    }
    
    // Investigate page structure
    const buttons = await page.locator('button').all()
    console.log('Found buttons:', buttons.length)
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const title = await button.getAttribute('title')
      const ariaLabel = await button.getAttribute('aria-label')
      console.log(`Button ${i}: text="${text}", title="${title}", aria-label="${ariaLabel}"`)
    }
    
    // Look for eye icons specifically
    const eyeIcons = await page.locator('[data-testid*="eye"], [aria-label*="Vezi"], [title*="Vezi"]').all()
    console.log('Found eye icon elements:', eyeIcons.length)
    
    // Look for recycle bin buttons
    const deleteButtons = page.locator('[data-testid*="delete"], [aria-label*="Delete"], [title*="Delete"]')
    const recycleButtons = await deleteButtons.all()
    console.log('Found recycle/delete buttons:', recycleButtons.length)
    
    // Take final screenshot
    await page.screenshot({ path: 'admin-structure-investigation.png', fullPage: true })
  })
})