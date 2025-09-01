import { test, expect } from '@playwright/test'

test.describe('Admin Product Form Analysis', () => {
  test('admin product form screenshot and analysis', async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    })

    // Navigate to admin (this will redirect to admin login if needed)
    await page.goto('/admin')
    await page.waitForTimeout(2000)

    // Check if we're on admin page, if not, we might need authentication
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)

    // If we're on auth page, we need to handle login or create a mock admin session
    if (currentUrl.includes('/auth')) {
      console.log('Need admin authentication - taking screenshot of auth page for reference')
      await expect(page).toHaveScreenshot('admin-auth-page.png', {
        fullPage: true,
        animations: 'disabled'
      })
      return
    }

    // Try to navigate to product management
    // First try navigation link in sidebar
    const sidebarProductLink = page.locator('li').filter({ hasText: 'Produse' }).locator('div').first()
    if (await sidebarProductLink.isVisible()) {
      await sidebarProductLink.click()
      await page.waitForTimeout(1000)
    } else {
      // Try direct navigation
      await page.goto('/admin/produse')
      await page.waitForTimeout(2000)
    }

    // Take screenshot of product management page
    await expect(page).toHaveScreenshot('admin-product-management.png', {
      fullPage: true,
      animations: 'disabled'
    })

    // Try to find and click add product button
    const addButton = page.getByRole('button', { name: /adaugă produs|add product/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(1000)

      // Take screenshot of add product form
      await expect(page).toHaveScreenshot('admin-product-form.png', {
        fullPage: true,
        animations: 'disabled'
      })

      // Analyze form typography and layout
      const formElements = await page.locator('form input, form textarea, form button, form label').all()
      console.log(`Found ${formElements.length} form elements`)

      // Analyze font weights and sizes
      for (let i = 0; i < Math.min(formElements.length, 10); i++) {
        const element = formElements[i]
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            fontFamily: computed.fontFamily,
            tagName: el.tagName
          }
        })
        console.log(`Element ${i} (${styles.tagName}):`, styles)
      }

      // Check section headers
      const sectionHeaders = await page.locator('h6, [variant="h6"], .MuiTypography-h6').all()
      for (const header of sectionHeaders) {
        const text = await header.textContent()
        const styles = await header.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          }
        })
        console.log(`Section header "${text}":`, styles)
      }
    } else {
      console.log('Add product button not found - taking current page screenshot')
      await expect(page).toHaveScreenshot('admin-current-page.png', {
        fullPage: true,
        animations: 'disabled'
      })
    }
  })
})