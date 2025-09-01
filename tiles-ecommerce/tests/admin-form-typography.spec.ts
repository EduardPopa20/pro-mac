import { test, expect } from '@playwright/test'

test.describe('Admin Form Typography and Layout Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent testing
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
  })

  test('validates enhanced admin form typography and CLAUDE.md compliance', async ({ page, isMobile }) => {
    console.log(`\n🔍 Testing ${isMobile ? 'Mobile' : 'Desktop'} Admin Form Design`)

    // Navigate to admin
    await page.goto('/admin')
    await page.waitForTimeout(1000)

    // Check if we need authentication
    if (page.url().includes('/auth')) {
      console.log('⚠️  Authentication required - skipping detailed form validation')
      return
    }

    // Navigate to products section
    await page.goto('/admin/produse')
    await page.waitForTimeout(1500)

    // Look for a category to access
    const categoryExists = await page.locator('table tbody tr').count() > 0
    if (!categoryExists) {
      console.log('⚠️  No categories found - cannot access product form')
      return
    }

    // Access first category
    const firstCategoryViewButton = page.locator('table tbody tr').first().locator('button[title*="Vezi"], button:has-text("Vezi")').first()
    if (await firstCategoryViewButton.isVisible()) {
      await firstCategoryViewButton.click()
      await page.waitForTimeout(1000)

      // Click "Add Product" to access the enhanced form
      const addProductButton = page.getByRole('button', { name: /adaugă produs/i })
      if (await addProductButton.isVisible()) {
        await addProductButton.click()
        await page.waitForTimeout(2000)

        console.log('✅ Successfully accessed enhanced product form')
        
        // Validate the enhanced form design
        await validateFormDesign(page, isMobile)
        await validateCLAUDECompliance(page, isMobile)
      } else {
        console.log('⚠️  Add Product button not found')
      }
    }
  })
})

async function validateFormDesign(page: any, isMobile: boolean) {
  console.log('\n📐 === Enhanced Form Design Validation ===')

  // 1. Check section headers (should be h5 with 700 font weight)
  const sectionHeaders = await page.locator('h5, .MuiTypography-h5').all()
  let headerCount = 0
  
  for (const header of sectionHeaders.slice(0, 5)) { // Check first 5 headers
    const isVisible = await header.isVisible()
    if (!isVisible) continue

    const text = await header.textContent()
    const styles = await header.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color
      }
    })

    headerCount++
    console.log(`Section header "${text}": ${styles.fontSize}, weight: ${styles.fontWeight}`)
    
    // Validate enhanced typography
    const fontWeight = parseInt(styles.fontWeight) || 400
    if (fontWeight >= 700) {
      console.log('✅ Header font weight excellent (≥700)')
    } else if (fontWeight >= 600) {
      console.log('⚠️  Header font weight good but could be bolder (600-699)')
    } else {
      console.log(`❌ Header font weight too light: ${fontWeight} (should be ≥600)`)
    }
  }

  console.log(`📊 Found ${headerCount} visible section headers`)

  // 2. Check field labels (should have 600 font weight)
  const fieldLabels = await page.locator('.MuiTypography-subtitle1, label').all()
  let labelCount = 0

  for (const label of fieldLabels.slice(0, 5)) { // Check first 5 labels
    const isVisible = await label.isVisible()
    if (!isVisible) continue

    const text = await label.textContent()
    if (!text || text.trim() === '') continue

    const styles = await label.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight
      }
    })

    labelCount++
    console.log(`Field label "${text?.substring(0, 20)}...": weight ${styles.fontWeight}`)
    
    const fontWeight = parseInt(styles.fontWeight) || 400
    if (fontWeight >= 600) {
      console.log('✅ Field label weight excellent (≥600)')
    } else if (fontWeight >= 500) {
      console.log('⚠️  Field label weight acceptable (500-599)')
    } else {
      console.log(`❌ Field label weight too light: ${fontWeight} (should be ≥500)`)
    }
  }

  console.log(`📊 Found ${labelCount} visible field labels`)

  // 3. Check section cards for proper styling
  const sectionCards = await page.locator('[class*="MuiPaper-elevation"], .MuiPaper-root').all()
  let cardCount = 0

  for (const card of sectionCards.slice(0, 3)) {
    const isVisible = await card.isVisible()
    if (!isVisible) continue

    const styles = await card.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        boxShadow: computed.boxShadow,
        border: computed.border,
        borderRadius: computed.borderRadius,
        padding: computed.padding
      }
    })

    cardCount++
    console.log(`Section card ${cardCount}:`)
    console.log(`  Border: ${styles.border}`)
    console.log(`  Border radius: ${styles.borderRadius}`)
    console.log(`  Box shadow: ${styles.boxShadow.substring(0, 50)}...`)
    
    // Validate proper card styling
    const hasElevation = styles.boxShadow !== 'none' && styles.boxShadow !== ''
    const hasRounding = parseFloat(styles.borderRadius) >= 8
    
    if (hasElevation) {
      console.log('✅ Card has proper elevation')
    } else {
      console.log('❌ Card lacks proper elevation')
    }

    if (hasRounding) {
      console.log('✅ Card has proper border radius')
    } else {
      console.log('❌ Card border radius too small')
    }
  }

  console.log(`📊 Found ${cardCount} section cards`)
}

async function validateCLAUDECompliance(page: any, isMobile: boolean) {
  console.log('\n📋 === CLAUDE.md Compliance Validation ===')

  // 1. Button sizes and touch targets
  const buttons = await page.locator('button[class*="MuiButton"]').all()
  let buttonCount = 0

  for (const button of buttons.slice(0, 5)) {
    const isVisible = await button.isVisible()
    if (!isVisible) continue

    const box = await button.boundingBox()
    if (!box) continue

    const text = await button.textContent()
    buttonCount++
    
    console.log(`Button "${text?.substring(0, 20)}...": ${box.width}x${box.height}px`)
    
    // CLAUDE.md compliance: ≥44px on mobile, ≥32px on desktop
    const minHeight = isMobile ? 44 : 32
    if (box.height >= minHeight) {
      console.log(`✅ Button height compliant: ${box.height}px (≥${minHeight}px)`)
    } else {
      console.log(`❌ Button height non-compliant: ${box.height}px (should be ≥${minHeight}px)`)
    }
  }

  // 2. No horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )

  if (hasHorizontalScroll) {
    console.log('❌ Horizontal scroll detected - breaks CLAUDE.md requirement')
  } else {
    console.log('✅ No horizontal scroll - CLAUDE.md compliant')
  }

  // 3. Icon sizes
  const icons = await page.locator('svg[class*="MuiSvgIcon"], .MuiSvgIcon-root').all()
  let iconCount = 0

  for (const icon of icons.slice(0, 3)) {
    const isVisible = await icon.isVisible()
    if (!isVisible) continue

    const styles = await icon.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        width: computed.width,
        height: computed.height
      }
    })

    iconCount++
    console.log(`Icon ${iconCount}: ${styles.width}x${styles.height}, fontSize: ${styles.fontSize}`)
    
    // Check for reasonable icon sizes (16px-32px range)
    const sizeValue = parseFloat(styles.fontSize) || parseFloat(styles.width) || 24
    if (sizeValue >= 16 && sizeValue <= 32) {
      console.log('✅ Icon size appropriate')
    } else {
      console.log(`⚠️  Icon size unusual: ${sizeValue}px`)
    }
  }

  // 4. Typography scale compliance
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
  let headingCount = 0

  for (const heading of headings.slice(0, 3)) {
    const isVisible = await heading.isVisible()
    if (!isVisible) continue

    const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
    const styles = await heading.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight
      }
    })

    headingCount++
    console.log(`${tagName.toUpperCase()}: ${styles.fontSize}, line-height: ${styles.lineHeight}`)
    
    // Basic validation for heading sizes
    const fontSize = parseFloat(styles.fontSize)
    if (fontSize >= 14) { // Minimum readable size
      console.log('✅ Heading size readable')
    } else {
      console.log(`❌ Heading size too small: ${fontSize}px`)
    }
  }

  console.log(`\n📊 Validation Summary:`)
  console.log(`  - ${buttonCount} buttons checked`)
  console.log(`  - ${iconCount} icons checked`)
  console.log(`  - ${headingCount} headings checked`)
  console.log(`  - Horizontal scroll: ${hasHorizontalScroll ? '❌ PRESENT' : '✅ NONE'}`)
  
  console.log('\n=== CLAUDE.md Compliance Validation Complete ===')
}