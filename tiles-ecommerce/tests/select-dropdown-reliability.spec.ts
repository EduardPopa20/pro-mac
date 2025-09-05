import { test, expect } from '@playwright/test'

test.describe('Select Dropdown Reliability Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for app to load
    await page.goto('http://localhost:5178')
    await page.waitForLoadState('networkidle')
  })

  test('BillingForm county select works reliably', async ({ page }) => {
    // Navigate to checkout
    await page.goto('http://localhost:5178/checkout')
    await page.waitForLoadState('networkidle')

    // Find the county select in billing form
    const countySelect = page.getByRole('combobox', { name: /județ/i }).first()
    await expect(countySelect).toBeVisible()

    // Click to open dropdown
    await countySelect.click()
    
    // Wait for dropdown options to appear
    await expect(page.getByRole('option', { name: 'Alba' })).toBeVisible()
    
    // Select Alba county
    await page.getByRole('option', { name: 'Alba' }).click()
    
    // Verify selection
    await expect(countySelect).toHaveValue('Alba')

    // Test multiple rapid clicks don't cause issues
    await countySelect.click()
    await expect(page.getByRole('option', { name: 'Cluj' })).toBeVisible()
    await page.getByRole('option', { name: 'Cluj' }).click()
    await expect(countySelect).toHaveValue('Cluj')
  })

  test('ShippingForm county select works reliably', async ({ page }) => {
    // Navigate to checkout
    await page.goto('http://localhost:5178/checkout')
    await page.waitForLoadState('networkidle')

    // Uncheck "same as billing" to show shipping form
    const sameAsBillingCheckbox = page.getByRole('checkbox', { name: /folosește adresa de facturare/i })
    if (await sameAsBillingCheckbox.isChecked()) {
      await sameAsBillingCheckbox.click()
    }

    // Find the county select in shipping form
    const shippingCountySelect = page.getByRole('combobox', { name: /județ/i }).last()
    await expect(shippingCountySelect).toBeVisible()

    // Click to open dropdown
    await shippingCountySelect.click()
    
    // Wait for dropdown options to appear
    await expect(page.getByRole('option', { name: 'Brașov' })).toBeVisible()
    
    // Select Brașov county
    await page.getByRole('option', { name: 'Brașov' }).click()
    
    // Verify selection
    await expect(shippingCountySelect).toHaveValue('Brașov')
  })

  test('Admin product form selects work reliably', async ({ page }) => {
    // Try to access admin (might require auth)
    await page.goto('http://localhost:5178/admin/products')
    await page.waitForLoadState('networkidle')

    // If redirected to auth, skip this test
    if (page.url().includes('/auth')) {
      test.skip('Admin access requires authentication')
      return
    }

    // Look for category select
    const categorySelects = page.getByRole('combobox')
    
    if (await categorySelects.count() > 0) {
      const firstSelect = categorySelects.first()
      await firstSelect.click()
      
      // Check if dropdown opens (wait a bit for animation)
      await page.waitForTimeout(300)
      
      // Look for any visible options
      const options = page.getByRole('option')
      if (await options.count() > 0) {
        await options.first().click()
        // Verify the dropdown closes after selection
        await expect(options.first()).not.toBeVisible()
      }
    }
  })

  test('Newsletter management status filter works reliably', async ({ page }) => {
    // Try to access newsletter management
    await page.goto('http://localhost:5178/admin/newsletter')
    await page.waitForLoadState('networkidle')

    // If redirected to auth, skip this test
    if (page.url().includes('/auth')) {
      test.skip('Admin access requires authentication')
      return
    }

    // Find status filter select
    const statusSelect = page.getByRole('combobox', { name: /status/i })
    
    if (await statusSelect.isVisible()) {
      // Click to open
      await statusSelect.click()
      
      // Wait for options
      await expect(page.getByRole('option', { name: 'Active' })).toBeVisible()
      
      // Select Active
      await page.getByRole('option', { name: 'Active' }).click()
      
      // Verify selection
      await expect(statusSelect).toHaveValue('active')

      // Test changing selection
      await statusSelect.click()
      await page.getByRole('option', { name: 'All Status' }).click()
      await expect(statusSelect).toHaveValue('all')
    }
  })

  test('Select dropdowns do not interfere with each other', async ({ page }) => {
    // Navigate to checkout with multiple forms
    await page.goto('http://localhost:5178/checkout')
    await page.waitForLoadState('networkidle')

    // Get both county selects
    const billingCounty = page.getByRole('combobox', { name: /județ/i }).first()
    
    // Uncheck same as billing to get shipping form
    const sameAsBillingCheckbox = page.getByRole('checkbox', { name: /folosește adresa de facturare/i })
    if (await sameAsBillingCheckbox.isChecked()) {
      await sameAsBillingCheckbox.click()
    }

    const shippingCounty = page.getByRole('combobox', { name: /județ/i }).last()

    // Test that opening one doesn't affect the other
    await billingCounty.click()
    await expect(page.getByRole('option', { name: 'Alba' })).toBeVisible()
    
    // Click elsewhere to close
    await page.click('body')
    await expect(page.getByRole('option', { name: 'Alba' })).not.toBeVisible()

    // Now test shipping county
    await shippingCounty.click()
    await expect(page.getByRole('option', { name: 'Brașov' })).toBeVisible()
    await page.getByRole('option', { name: 'Brașov' }).click()
    
    // Verify that billing county is unaffected
    await expect(billingCounty).not.toHaveValue('Brașov')
  })

  test('Select dropdowns have proper z-index layering', async ({ page }) => {
    // Navigate to a page with overlapping elements
    await page.goto('http://localhost:5178/checkout')
    await page.waitForLoadState('networkidle')

    const countySelect = page.getByRole('combobox', { name: /județ/i }).first()
    
    // Open the dropdown
    await countySelect.click()
    
    // Check that the dropdown appears above other elements
    const dropdown = page.locator('.MuiPaper-root').filter({ hasText: 'Alba' })
    await expect(dropdown).toBeVisible()
    
    // Get computed z-index (this is a visual test)
    const zIndex = await dropdown.evaluate((el) => {
      return window.getComputedStyle(el).zIndex
    })
    
    // Should be a high z-index value
    expect(parseInt(zIndex)).toBeGreaterThan(1000)
  })
})