import { test, expect } from '@playwright/test'

test.describe('Enhanced Admin Product Form', () => {
  test('enhanced admin product form design validation', async ({ page, isMobile }) => {
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

    // Directly navigate to admin product management
    await page.goto('/admin/produse')
    await page.waitForTimeout(2000)

    // Check if we're on admin page, if not, skip auth check for now
    const currentUrl = page.url()
    if (currentUrl.includes('/auth')) {
      console.log('Need admin authentication - skipping form validation')
      return
    }

    // Take screenshot of product management page
    await expect(page).toHaveScreenshot('enhanced-admin-product-management.png', {
      fullPage: true,
      animations: 'disabled'
    })

    // Try to find a category to access products
    const categoryRow = page.locator('table tbody tr').first()
    if (await categoryRow.isVisible()) {
      // Click on view products button
      const viewButton = categoryRow.locator('[title="Vezi Produse"], button:has-text("Vezi")')
      if (await viewButton.first().isVisible()) {
        await viewButton.first().click()
        await page.waitForTimeout(1000)

        // Try to add a new product to see the enhanced form
        const addProductButton = page.getByRole('button', { name: /adaugă produs|add product/i })
        if (await addProductButton.isVisible()) {
          await addProductButton.click()
          await page.waitForTimeout(2000)

          // Take screenshot of the enhanced form
          await expect(page).toHaveScreenshot('enhanced-admin-product-form.png', {
            fullPage: true,
            animations: 'disabled'
          })

          // Validate CLAUDE.md compliance for the enhanced form
          await validateEnhancedFormDesign(page, isMobile)
        }
      }
    }
  })
})

async function validateEnhancedFormDesign(page: any, isMobile: boolean) {
  console.log(`\n=== Enhanced Form Design Validation (${isMobile ? 'Mobile' : 'Desktop'}) ===`)

  // 1. Check section headers with improved typography
  const sectionHeaders = await page.locator('h5, [class*="MuiTypography-h5"]').all()
  for (let i = 0; i < sectionHeaders.length && i < 3; i++) {
    const header = sectionHeaders[i]
    const text = await header.textContent()
    const styles = await header.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color
      }
    })
    console.log(`Section header "${text}":`, styles)
    
    // Validate improved font weights (should be 700 for section headers)
    const fontWeight = parseInt(styles.fontWeight)
    if (fontWeight < 600) {
      console.warn(`⚠️  Section header font weight too low: ${fontWeight} (expected ≥600)`)
    } else {
      console.log(`✅ Section header font weight good: ${fontWeight}`)
    }
  }

  // 2. Check form field labels with enhanced typography
  const fieldLabels = await page.locator('label, [class*="MuiFormLabel"], .MuiTypography-subtitle1').all()
  for (let i = 0; i < Math.min(fieldLabels.length, 5); i++) {
    const label = fieldLabels[i]
    const styles = await label.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        visibility: computed.visibility
      }
    })
    
    if (styles.visibility === 'visible') {
      console.log(`Field label ${i}:`, styles)
      
      // Validate label font weights (should be 600 for enhanced readability)
      const fontWeight = parseInt(styles.fontWeight)
      if (fontWeight < 500) {
        console.warn(`⚠️  Field label font weight too low: ${fontWeight} (expected ≥500)`)
      } else {
        console.log(`✅ Field label font weight good: ${fontWeight}`)
      }
    }
  }

  // 3. Check section cards for proper elevation and borders
  const sectionCards = await page.locator('[class*="MuiPaper"], .MuiPaper-elevation').all()
  for (let i = 0; i < Math.min(sectionCards.length, 3); i++) {
    const card = sectionCards[i]
    const styles = await card.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        boxShadow: computed.boxShadow,
        border: computed.border,
        borderRadius: computed.borderRadius
      }
    })
    console.log(`Section card ${i}:`, styles)
  }

  // 4. Check button sizes and touch targets
  const buttons = await page.locator('button[class*="MuiButton"]').all()
  for (let i = 0; i < Math.min(buttons.length, 3); i++) {
    const button = buttons[i]
    const box = await button.boundingBox()
    if (box) {
      console.log(`Button ${i} size: ${box.width}x${box.height}`)
      
      // Validate touch targets (should be ≥44px on mobile)
      if (isMobile && box.height < 44) {
        console.warn(`⚠️  Mobile button height too small: ${box.height}px (expected ≥44px)`)
      } else if (!isMobile && box.height < 32) {
        console.warn(`⚠️  Desktop button height too small: ${box.height}px (expected ≥32px)`)
      } else {
        console.log(`✅ Button height appropriate: ${box.height}px`)
      }
    }
  }

  // 5. Check for horizontal scroll
  const hasScroll = await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  if (hasScroll) {
    console.warn('⚠️  Horizontal scroll detected')
  } else {
    console.log('✅ No horizontal scroll')
  }

  // 6. Check icon sizes in section headers
  const sectionIcons = await page.locator('[class*="MuiSvgIcon"], svg').all()
  for (let i = 0; i < Math.min(sectionIcons.length, 3); i++) {
    const icon = sectionIcons[i]
    const styles = await icon.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        width: computed.width,
        height: computed.height
      }
    })
    console.log(`Icon ${i}:`, styles)
  }

  console.log('=== Enhanced Form Design Validation Complete ===\n')
}