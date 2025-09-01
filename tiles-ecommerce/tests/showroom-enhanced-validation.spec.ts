import { test, expect } from '@playwright/test'

test.describe('Enhanced Showroom Dashboard Validation', () => {
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

  test('validate enhanced showroom dashboard improvements', async ({ page, isMobile }) => {
    console.log(`\n✨ Validating ${isMobile ? 'Mobile' : 'Desktop'} Enhanced Showroom Dashboard`)

    // Navigate to admin showrooms with correct route
    await page.goto('/admin/showroom-uri')
    await page.waitForTimeout(2000)

    // Skip if authentication required
    if (page.url().includes('/auth')) {
      console.log('⚠️  Authentication required - skipping validation')
      return
    }

    console.log('✅ Successfully accessed enhanced showroom dashboard')

    // Take updated screenshots
    await expect(page).toHaveScreenshot('enhanced-showroom-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    })

    await validateEnhancedDesign(page, isMobile)
    await validateRoutingFixes(page)
    await validateResponsiveDesign(page, isMobile)
    await validateCLAUDECompliance(page, isMobile)

    // Test enhanced form if we can create a new showroom
    const addButton = page.getByRole('button', { name: /adaugă showroom/i })
    if (await addButton.isVisible()) {
      await addButton.click()
      await page.waitForTimeout(1500)

      await expect(page).toHaveScreenshot('enhanced-showroom-form.png', {
        fullPage: true,
        animations: 'disabled'
      })

      await validateEnhancedForm(page, isMobile)
    }
  })
})

async function validateEnhancedDesign(page: any, isMobile: boolean) {
  console.log('\n🎨 === Enhanced Design Validation ===')

  // Check for enhanced card styling
  const enhancedCards = await page.locator('[class*="MuiCard"]').all()
  console.log(`Found ${enhancedCards.length} showroom cards`)

  for (let i = 0; i < Math.min(enhancedCards.length, 2); i++) {
    const card = enhancedCards[i]
    const isVisible = await card.isVisible()
    if (!isVisible) continue

    const styles = await card.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        borderRadius: computed.borderRadius,
        border: computed.border,
        boxShadow: computed.boxShadow,
        transform: computed.transform,
        position: computed.position
      }
    })

    console.log(`Enhanced card ${i + 1}:`)
    console.log(`  Border radius: ${styles.borderRadius}`)
    console.log(`  Border: ${styles.border}`)
    console.log(`  Box shadow: ${styles.boxShadow.substring(0, 40)}...`)

    // Check for enhanced features
    const radiusValue = parseFloat(styles.borderRadius) || 0
    if (radiusValue >= 12) {
      console.log('✅ Enhanced border radius (≥12px)')
    } else {
      console.log(`⚠️  Border radius could be more enhanced: ${radiusValue}px`)
    }

    // Check for proper borders
    if (styles.border && styles.border !== 'none') {
      console.log('✅ Enhanced border styling')
    } else {
      console.log('⚠️  Missing enhanced border styling')
    }

    // Check for proper elevation
    if (styles.boxShadow && styles.boxShadow !== 'none') {
      console.log('✅ Proper card elevation')
    } else {
      console.log('❌ Missing card elevation')
    }
  }

  // Check for status badges
  const statusBadges = await page.locator('[class*="MuiChip"]').all()
  console.log(`Status badges found: ${statusBadges.length}`)

  for (const badge of statusBadges.slice(0, 2)) {
    const isVisible = await badge.isVisible()
    if (!isVisible) continue

    const styles = await badge.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        position: computed.position,
        zIndex: computed.zIndex,
        boxShadow: computed.boxShadow
      }
    })

    if (styles.position === 'absolute') {
      console.log('✅ Enhanced status badge positioning')
    } else {
      console.log('⚠️  Status badge positioning could be enhanced')
    }
  }

  // Check for gradient headers in cards
  const cardHeaders = await page.locator('[style*="gradient"], [style*="linear-gradient"]').count()
  if (cardHeaders > 0) {
    console.log('✅ Enhanced gradient card headers found')
  } else {
    console.log('⚠️  Could add gradient card headers for enhancement')
  }
}

async function validateRoutingFixes(page: any) {
  console.log('\n🛣️  === Routing & Breadcrumb Fixes Validation ===')

  const currentUrl = page.url()
  console.log(`Current URL: ${currentUrl}`)

  if (currentUrl.includes('/admin/showroom-uri')) {
    console.log('✅ Correct route being used: /admin/showroom-uri')
  } else {
    console.log('❌ Incorrect route pattern detected')
  }

  // Check breadcrumbs
  const breadcrumbs = await page.locator('[class*="MuiBreadcrumbs"] a, [class*="MuiBreadcrumbs"] span').all()
  
  for (const crumb of breadcrumbs) {
    const isVisible = await crumb.isVisible()
    if (!isVisible) continue

    const text = await crumb.textContent()
    const href = await crumb.getAttribute('href')

    if (text === 'Showroom-uri') {
      console.log('✅ Breadcrumb text corrected to Romanian: "Showroom-uri"')
    }

    if (href && href.includes('/admin/showroom-uri')) {
      console.log('✅ Breadcrumb routing fixed: /admin/showroom-uri')
    } else if (href && href.includes('/admin/showrooms')) {
      console.log('❌ Breadcrumb still uses old route: /admin/showrooms')
    }
  }
}

async function validateResponsiveDesign(page: any, isMobile: boolean) {
  console.log('\n📱 === Responsive Design Validation ===')

  // Check horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  
  console.log(`Horizontal scroll: ${hasHorizontalScroll ? '❌ PRESENT' : '✅ None'}`)

  // Check card grid responsiveness
  const cardGrid = page.locator('[class*="MuiGrid-container"]').first()
  if (await cardGrid.isVisible()) {
    const styles = await cardGrid.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        display: computed.display,
        gap: computed.gap
      }
    })

    if (styles.display === 'flex') {
      console.log('✅ Cards use proper responsive grid')
    } else {
      console.log('⚠️  Card grid could be improved')
    }
  }

  // Check card spacing and sizing
  const cards = await page.locator('[class*="MuiCard"]').all()
  for (const card of cards.slice(0, 1)) {
    const isVisible = await card.isVisible()
    if (!isVisible) continue

    const box = await card.boundingBox()
    if (box) {
      console.log(`Card dimensions: ${box.width}x${box.height}px`)
      
      if (isMobile && box.width < 300) {
        console.log('⚠️  Card might be too narrow on mobile')
      } else if (!isMobile && box.width > 500) {
        console.log('⚠️  Card might be too wide on desktop')
      } else {
        console.log('✅ Card dimensions appropriate')
      }
    }
  }
}

async function validateCLAUDECompliance(page: any, isMobile: boolean) {
  console.log('\n📋 === CLAUDE.md Compliance Validation ===')

  // Check horizontal scroll first
  const hasHorizontalScroll = await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )

  // Check button touch targets
  const buttons = await page.locator('button').all()
  let compliantButtons = 0
  let totalButtons = 0

  for (const button of buttons.slice(0, 5)) {
    const isVisible = await button.isVisible()
    if (!isVisible) continue

    const box = await button.boundingBox()
    if (!box) continue

    totalButtons++
    const minHeight = isMobile ? 44 : 32

    if (box.height >= minHeight) {
      compliantButtons++
      console.log(`✅ Button ${totalButtons}: ${box.height}px (compliant)`)
    } else {
      console.log(`❌ Button ${totalButtons}: ${box.height}px (non-compliant)`)
    }
  }

  const complianceRate = totalButtons > 0 ? (compliantButtons / totalButtons * 100).toFixed(1) : 0
  console.log(`Button compliance rate: ${complianceRate}% (${compliantButtons}/${totalButtons})`)

  // Check typography weights
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
  let properHeadings = 0

  for (const heading of headings.slice(0, 3)) {
    const isVisible = await heading.isVisible()
    if (!isVisible) continue

    const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
    const styles = await heading.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return { fontWeight: computed.fontWeight }
    })

    const fontWeight = parseInt(styles.fontWeight) || 400
    const text = await heading.textContent()

    console.log(`${tagName.toUpperCase()} "${text?.substring(0, 20)}...": weight ${fontWeight}`)

    if ((tagName === 'h4' && fontWeight >= 600) || 
        ((tagName === 'h1' || tagName === 'h2' || tagName === 'h5') && fontWeight >= 700)) {
      properHeadings++
      console.log('✅ Typography weight compliant')
    } else {
      console.log('❌ Typography weight needs improvement')
    }
  }

  console.log(`\n📊 Enhanced Showroom Validation Summary:`)
  console.log(`  - Button compliance: ${complianceRate}%`)
  console.log(`  - Typography: ${properHeadings} proper headings`)
  console.log(`  - Horizontal scroll: ${hasHorizontalScroll ? '❌' : '✅'}`)
}

async function validateEnhancedForm(page: any, isMobile: boolean) {
  console.log('\n📝 === Enhanced Form Validation ===')

  // Check for card-based sections
  const formSections = await page.locator('[class*="MuiPaper-elevation"]').count()
  console.log(`Form sections with card styling: ${formSections}`)

  if (formSections >= 4) {
    console.log('✅ Enhanced card-based form sections implemented')
  } else {
    console.log('⚠️  Form could benefit from more card-based sections')
  }

  // Check for enhanced section headers
  const sectionHeaders = await page.locator('h5, .MuiTypography-h5').all()
  let enhancedHeaders = 0

  for (const header of sectionHeaders.slice(0, 3)) {
    const isVisible = await header.isVisible()
    if (!isVisible) continue

    const styles = await header.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontWeight: computed.fontWeight,
        color: computed.color
      }
    })

    const fontWeight = parseInt(styles.fontWeight) || 400
    if (fontWeight >= 700) {
      enhancedHeaders++
      console.log('✅ Enhanced section header typography')
    } else {
      console.log(`⚠️  Section header font weight: ${fontWeight}`)
    }
  }

  // Check for enhanced icons in sections
  const sectionIcons = await page.locator('[class*="MuiSvgIcon"]').count()
  console.log(`Section icons found: ${sectionIcons}`)

  if (sectionIcons >= 4) {
    console.log('✅ Enhanced form has proper iconography')
  } else {
    console.log('⚠️  Could add more section icons for better UX')
  }

  // Check sticky sidebar
  const sidebar = page.locator('[style*="sticky"], [style*="position: sticky"]')
  const sidebarCount = await sidebar.count()
  
  if (sidebarCount > 0) {
    console.log('✅ Enhanced form has sticky sidebar')
  } else {
    console.log('⚠️  Form could benefit from sticky sidebar')
  }

  console.log('\n=== Enhanced Form Validation Complete ===')
}