import { test, expect } from '@playwright/test'

test.describe('Showroom Dashboard Design Analysis', () => {
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

  test('analyze public showroom cards design deficiencies', async ({ page, isMobile }) => {
    console.log(`\n🔍 Analyzing ${isMobile ? 'Mobile' : 'Desktop'} Public Showroom Page Design`)

    // Navigate to public showrooms page
    await page.goto('http://localhost:5179/showroomuri')
    await page.waitForTimeout(3000)

    // Wait for showrooms to load
    await page.waitForLoadState('networkidle')

    console.log('✅ Successfully accessed public showrooms page')

    // Take comprehensive screenshots for analysis
    await expect(page).toHaveScreenshot('showroom-dashboard-overview.png', {
      fullPage: true,
      animations: 'disabled'
    })

    // Analyze current card design issues
    await analyzeCardDesign(page, isMobile)
    await analyzeBreadcrumbIssues(page, isMobile)
    await analyzeScrollingIssues(page, isMobile)
    await analyzeRouting(page, isMobile)
    await analyzeCLAUDECompliance(page, isMobile)

    // Test edit page if showrooms exist
    const showroomCards = await page.locator('[class*="MuiCard"]').count()
    if (showroomCards > 0) {
      console.log(`\n📝 Found ${showroomCards} showroom cards - testing edit functionality`)
      
      // Click first edit button
      const firstEditButton = page.getByRole('button', { name: /editeaz/i }).first()
      if (await firstEditButton.isVisible()) {
        await firstEditButton.click()
        await page.waitForTimeout(1500)

        // Take edit page screenshot
        await expect(page).toHaveScreenshot('showroom-edit-page.png', {
          fullPage: true,
          animations: 'disabled'
        })

        await analyzeEditPageDesign(page, isMobile)
      }
    }
  })
})

async function analyzeCardDesign(page: any, isMobile: boolean) {
  console.log('\n🎨 === Showroom Card Design Analysis ===')

  const showroomCards = await page.locator('[class*="MuiCard"]').all()
  let cardAnalysisResults = []

  for (let i = 0; i < Math.min(showroomCards.length, 3); i++) {
    const card = showroomCards[i]
    const isVisible = await card.isVisible()
    if (!isVisible) continue

    const styles = await card.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        padding: computed.padding,
        height: computed.height
      }
    })

    const cardResult = {
      cardIndex: i + 1,
      ...styles
    }
    cardAnalysisResults.push(cardResult)

    console.log(`Card ${i + 1}:`)
    console.log(`  Border radius: ${styles.borderRadius}`)
    console.log(`  Box shadow: ${styles.boxShadow.substring(0, 50)}...`)
    console.log(`  Background: ${styles.backgroundColor}`)
    console.log(`  Border: ${styles.border}`)
    console.log(`  Height: ${styles.height}`)

    // Analyze card elevation (should have proper shadow)
    if (styles.boxShadow === 'none' || styles.boxShadow === '') {
      console.log('❌ Card lacks proper elevation/shadow')
    } else {
      console.log('✅ Card has shadow elevation')
    }

    // Analyze border radius (should be ≥8px for modern look)
    const radiusValue = parseFloat(styles.borderRadius) || 0
    if (radiusValue >= 12) {
      console.log('✅ Card has good border radius')
    } else if (radiusValue >= 8) {
      console.log('⚠️  Card border radius could be more modern')
    } else {
      console.log(`❌ Card border radius too small: ${radiusValue}px`)
    }
  }

  // Check card content typography
  const cardTitles = await page.locator('[class*="MuiCard"] h6, [class*="MuiCard"] .MuiTypography-h6').all()
  for (let i = 0; i < Math.min(cardTitles.length, 3); i++) {
    const title = cardTitles[i]
    const isVisible = await title.isVisible()
    if (!isVisible) continue

    const styles = await title.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color
      }
    })

    const text = await title.textContent()
    console.log(`Card title "${text}": ${styles.fontSize}, weight: ${styles.fontWeight}`)

    const fontWeight = parseInt(styles.fontWeight) || 400
    if (fontWeight >= 700) {
      console.log('✅ Title font weight excellent')
    } else if (fontWeight >= 600) {
      console.log('⚠️  Title font weight good but could be bolder')
    } else {
      console.log(`❌ Title font weight too light: ${fontWeight}`)
    }
  }

  // Check card layout and spacing
  const cardContents = await page.locator('[class*="MuiCardContent"]').all()
  for (const content of cardContents.slice(0, 2)) {
    const isVisible = await content.isVisible()
    if (!isVisible) continue

    const styles = await content.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        padding: computed.padding,
        display: computed.display,
        flexDirection: computed.flexDirection,
        gap: computed.gap
      }
    })

    console.log(`Card content styling:`)
    console.log(`  Padding: ${styles.padding}`)
    console.log(`  Layout: ${styles.display}`)
    console.log(`  Flex direction: ${styles.flexDirection}`)
  }

  console.log(`\n📊 Analyzed ${cardAnalysisResults.length} showroom cards`)
}

async function analyzeBreadcrumbIssues(page: any, isMobile: boolean) {
  console.log('\n🍞 === Breadcrumb Analysis ===')

  const breadcrumbs = await page.locator('[class*="MuiBreadcrumbs"] a, [class*="MuiBreadcrumbs"] span').all()
  
  console.log(`Found ${breadcrumbs.length} breadcrumb elements`)

  for (let i = 0; i < breadcrumbs.length; i++) {
    const crumb = breadcrumbs[i]
    const isVisible = await crumb.isVisible()
    if (!isVisible) continue

    const text = await crumb.textContent()
    const href = await crumb.getAttribute('href')
    const tagName = await crumb.evaluate(el => el.tagName.toLowerCase())

    console.log(`Breadcrumb ${i + 1}: "${text}" (${tagName})`)
    if (href) {
      console.log(`  Link: ${href}`)
      
      // Check for problematic routing
      if (href.includes('/admin/showrooms') && !href.includes('/admin/showroom-uri')) {
        console.log(`❌ Breadcrumb has wrong route: ${href} (should be /admin/showroom-uri)`)
      } else {
        console.log('✅ Breadcrumb routing appears correct')
      }
    }

    // Check if breadcrumb text is in Romanian
    if (text === 'Showrooms') {
      console.log('❌ Breadcrumb should be in Romanian: "Showroom-uri"')
    } else if (text === 'Editare' || text === 'Editează') {
      console.log('❌ Breadcrumb should show showroom name, not "Editează"')
    } else {
      console.log('✅ Breadcrumb text appears correct')
    }
  }
}

async function analyzeScrollingIssues(page: any, isMobile: boolean) {
  console.log('\n📜 === Scrolling Issues Analysis ===')

  // Check page-level scroll
  const pageHasScroll = await page.evaluate(() => 
    document.documentElement.scrollHeight > document.documentElement.clientHeight
  )
  console.log(`Page vertical scroll: ${pageHasScroll ? '✅ Present (acceptable)' : 'None'}`)

  // Check for horizontal scroll (should not exist)
  const hasHorizontalScroll = await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  console.log(`Page horizontal scroll: ${hasHorizontalScroll ? '❌ PRESENT (problem!)' : '✅ None'}`)

  // Check cards for internal scrolling
  const scrollableElements = await page.locator('[style*="overflow"], [style*="scroll"]').all()
  
  for (let i = 0; i < scrollableElements.length; i++) {
    const element = scrollableElements[i]
    const isVisible = await element.isVisible()
    if (!isVisible) continue

    const styles = await element.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        overflow: computed.overflow,
        overflowY: computed.overflowY,
        overflowX: computed.overflowX,
        height: computed.height,
        maxHeight: computed.maxHeight
      }
    })

    const classList = await element.getAttribute('class') || ''
    console.log(`Scrollable element ${i + 1} (${classList.substring(0, 30)}...):`)
    console.log(`  Overflow: ${styles.overflow}`)
    console.log(`  OverflowY: ${styles.overflowY}`)
    console.log(`  Height: ${styles.height}`)
    console.log(`  MaxHeight: ${styles.maxHeight}`)

    // Check if this is a problematic card/component scroll
    if ((styles.overflowY === 'auto' || styles.overflowY === 'scroll') && 
        (classList.includes('Card') || classList.includes('Paper'))) {
      console.log('❌ Card/component has vertical scroll - should be eliminated')
    }
  }

  // Check sidebar for scrolling issues
  const sidebar = page.locator('[role="navigation"], nav').first()
  if (await sidebar.isVisible()) {
    const sidebarStyles = await sidebar.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        overflow: computed.overflow,
        overflowY: computed.overflowY,
        height: computed.height,
        maxHeight: computed.maxHeight
      }
    })

    console.log(`Sidebar overflow styles:`)
    console.log(`  OverflowY: ${sidebarStyles.overflowY}`)
    console.log(`  Height: ${sidebarStyles.height}`)

    if (sidebarStyles.overflowY === 'auto' || sidebarStyles.overflowY === 'scroll') {
      console.log('❌ Sidebar has vertical scroll - should be eliminated')
    } else {
      console.log('✅ Sidebar scroll appears correct')
    }
  }
}

async function analyzeRouting(page: any, isMobile: boolean) {
  console.log('\n🛣️  === Routing Analysis ===')

  const currentUrl = page.url()
  console.log(`Current URL: ${currentUrl}`)

  // Check if current route matches expected pattern
  if (currentUrl.includes('/admin/showroom-uri')) {
    console.log('✅ Current route is correct: /admin/showroom-uri')
  } else if (currentUrl.includes('/admin/showrooms')) {
    console.log('❌ Using old route pattern: /admin/showrooms')
  }

  // Test navigation links
  const navigationLinks = await page.locator('a[href*="showroom"]').all()
  for (const link of navigationLinks.slice(0, 3)) {
    const href = await link.getAttribute('href')
    const text = await link.textContent()
    
    console.log(`Navigation link: "${text}" -> ${href}`)
    
    if (href && href.includes('/admin/showrooms') && !href.includes('/admin/showroom-uri')) {
      console.log('❌ Link uses incorrect route pattern')
    }
  }
}

async function analyzeCLAUDECompliance(page: any, isMobile: boolean) {
  console.log('\n📋 === CLAUDE.md Compliance Analysis ===')

  // Check button sizes and touch targets
  const buttons = await page.locator('button').all()
  let buttonCount = 0

  for (const button of buttons.slice(0, 5)) {
    const isVisible = await button.isVisible()
    if (!isVisible) continue

    const box = await button.boundingBox()
    if (!box) continue

    const text = await button.textContent()
    buttonCount++
    
    console.log(`Button "${text?.substring(0, 20)}...": ${box.width}x${box.height}px`)
    
    const minHeight = isMobile ? 44 : 32
    if (box.height >= minHeight) {
      console.log(`✅ Button height compliant: ${box.height}px`)
    } else {
      console.log(`❌ Button height non-compliant: ${box.height}px (should be ≥${minHeight}px)`)
    }
  }

  // Check typography compliance
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
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight
      }
    })

    const text = await heading.textContent()
    headingCount++
    
    console.log(`${tagName.toUpperCase()} "${text?.substring(0, 30)}...":`)
    console.log(`  Font: ${styles.fontSize}, weight: ${styles.fontWeight}`)
    
    const fontWeight = parseInt(styles.fontWeight) || 400
    if (tagName === 'h4' && fontWeight < 600) {
      console.log(`❌ ${tagName} font weight too light: ${fontWeight}`)
    } else if ((tagName === 'h1' || tagName === 'h2') && fontWeight < 700) {
      console.log(`❌ ${tagName} font weight should be ≥700: ${fontWeight}`)
    } else {
      console.log(`✅ ${tagName} font weight appropriate`)
    }
  }

  console.log(`\n📊 CLAUDE.md Compliance Summary:`)
  console.log(`  - ${buttonCount} buttons analyzed`)
  console.log(`  - ${headingCount} headings analyzed`)
}

async function analyzeEditPageDesign(page: any, isMobile: boolean) {
  console.log('\n✏️  === Edit Page Design Analysis ===')

  // Check for the problematic scrollable container
  const editContainer = page.locator('[style*="overflowY"], [style*="overflow-y"]')
  const editContainerCount = await editContainer.count()
  
  if (editContainerCount > 0) {
    console.log(`❌ Found ${editContainerCount} elements with vertical scroll on edit page`)
    
    for (let i = 0; i < editContainerCount; i++) {
      const container = editContainer.nth(i)
      const styles = await container.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          overflowY: computed.overflowY,
          maxHeight: computed.maxHeight,
          height: computed.height
        }
      })
      
      console.log(`Scrollable container ${i + 1}:`)
      console.log(`  OverflowY: ${styles.overflowY}`)
      console.log(`  MaxHeight: ${styles.maxHeight}`)
      console.log(`  Height: ${styles.height}`)
      
      if (styles.maxHeight.includes('75vh')) {
        console.log('❌ Found problematic 75vh maxHeight with scroll - should be removed')
      }
    }
  } else {
    console.log('✅ No problematic scrollable containers found on edit page')
  }

  // Check form sections for proper styling
  const formSections = await page.locator('h6, .MuiTypography-h6').all()
  for (let i = 0; i < Math.min(formSections.length, 3); i++) {
    const section = formSections[i]
    const isVisible = await section.isVisible()
    if (!isVisible) continue

    const text = await section.textContent()
    const styles = await section.evaluate(el => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        color: computed.color
      }
    })

    console.log(`Form section "${text}":`)
    console.log(`  Font: ${styles.fontSize}, weight: ${styles.fontWeight}`)
    
    const fontWeight = parseInt(styles.fontWeight) || 400
    if (fontWeight < 600) {
      console.log(`❌ Section header font weight too light: ${fontWeight}`)
    } else {
      console.log(`✅ Section header font weight good: ${fontWeight}`)
    }
  }

  // Check if edit page uses enhanced card-based design
  const sectionCards = await page.locator('[class*="MuiPaper-elevation"], .MuiCard-root').count()
  console.log(`Edit page sections using card design: ${sectionCards}`)
  
  if (sectionCards < 3) {
    console.log('❌ Edit page lacks enhanced card-based section design')
  } else {
    console.log('✅ Edit page uses card-based section design')
  }

  console.log('\n=== Edit Page Design Analysis Complete ===')
}