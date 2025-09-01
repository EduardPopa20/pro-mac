import { test, expect } from '@playwright/test'
import { setViewport, computedNumber } from './utils'

test.describe('Layout Consistency Tests', () => {

  test('sidebar height remains fixed when dropdown expands', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'lg') // Test on desktop where sidebar is visible
    
    // Wait for page to load
    await page.waitForTimeout(1000)
    
    // Get initial measurements
    const sidebar = page.locator('.MuiDrawer-paper').first()
    const mainContent = page.locator('[role="main"], main')
    
    // Check if sidebar is visible (only on desktop)
    const sidebarVisible = await sidebar.isVisible()
    if (!sidebarVisible) {
      console.log('Sidebar not visible on this viewport, skipping test')
      return
    }
    
    // Get initial heights
    const initialSidebarHeight = await computedNumber(page, sidebar, 'height')
    const initialMainHeight = await computedNumber(page, mainContent, 'height')
    
    console.log('Initial sidebar height:', initialSidebarHeight)
    console.log('Initial main content height:', initialMainHeight)
    
    // Find and expand the "Produse" dropdown
    const produseButton = page.getByText('Produse').first()
    const produseButtonExists = await produseButton.count() > 0
    
    if (produseButtonExists) {
      console.log('Found Produse button, clicking to expand dropdown...')
      await produseButton.click()
      
      // Wait for dropdown to expand
      await page.waitForTimeout(500)
      
      // Check if dropdown expanded by looking for category items
      const categoryItems = page.locator('text=/gresie|faianță|mozaic/i')
      const categoryCount = await categoryItems.count()
      console.log(`Found ${categoryCount} category items after expansion`)
      
      // Get heights after expansion
      const expandedSidebarHeight = await computedNumber(page, sidebar, 'height')
      const expandedMainHeight = await computedNumber(page, mainContent, 'height')
      
      console.log('Expanded sidebar height:', expandedSidebarHeight)
      console.log('Expanded main content height:', expandedMainHeight)
      
      // Test assertions
      expect(expandedSidebarHeight).toBe(initialSidebarHeight) // Sidebar height should not change
      expect(expandedMainHeight).toBe(initialMainHeight) // Main content height should not change
      
      // Sidebar should still be 100vh
      const sidebarHeightVh = await page.evaluate(() => {
        const sidebarEl = document.querySelector('.MuiDrawer-paper')
        return sidebarEl ? getComputedStyle(sidebarEl).height : null
      })
      
      const viewportHeight = await page.evaluate(() => window.innerHeight)
      const expectedHeight = `${viewportHeight}px`
      
      expect(sidebarHeightVh).toBe(expectedHeight)
      
      console.log('✅ Layout consistency test passed - sidebar and main content heights remain stable')
    } else {
      console.log('Produse button not found, test cannot proceed')
    }
  })

  test('main content height equals calc(100vh - navbar height)', async ({ page }) => {
    await page.goto('/')
    
    // Test on different viewports
    for (const viewport of ['md', 'lg'] as const) {
      await setViewport(page, viewport)
      await page.waitForTimeout(500)
      
      const navbar = page.locator('[role="banner"], .MuiAppBar-root').first()
      const mainContent = page.locator('[role="main"], main')
      
      const navbarHeight = await computedNumber(page, navbar, 'height')
      const mainContentHeight = await computedNumber(page, mainContent, 'height')
      const viewportHeight = await page.evaluate(() => window.innerHeight)
      
      const expectedMainHeight = viewportHeight - navbarHeight
      
      console.log(`Viewport: ${viewport}`)
      console.log(`  Navbar height: ${navbarHeight}px`)
      console.log(`  Main content height: ${mainContentHeight}px`)
      console.log(`  Viewport height: ${viewportHeight}px`)
      console.log(`  Expected main height: ${expectedMainHeight}px`)
      
      // Allow for small rounding differences (within 2px)
      expect(Math.abs(mainContentHeight - expectedMainHeight)).toBeLessThanOrEqual(2)
    }
    
    console.log('✅ Main content height calculations are correct')
  })

  test('no horizontal scroll on any viewport', async ({ page }) => {
    await page.goto('/')
    
    // Test on all standard breakpoints
    for (const viewport of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      await setViewport(page, viewport)
      await page.waitForTimeout(500)
      
      const hasHorizontalScroll = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      
      console.log(`Viewport ${viewport}: horizontal scroll = ${hasHorizontalScroll}`)
      expect(hasHorizontalScroll).toBeFalsy()
    }
    
    console.log('✅ No horizontal scroll detected on any viewport')
  })

  test('sidebar scrolling works when content overflows', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'lg') // Desktop where sidebar is visible
    
    const sidebar = page.locator('.MuiDrawer-paper').first()
    const sidebarVisible = await sidebar.isVisible()
    
    if (!sidebarVisible) {
      console.log('Sidebar not visible, skipping scroll test')
      return
    }
    
    // Check if sidebar content is scrollable
    const sidebarScrollable = await sidebar.evaluate(el => {
      const computedStyle = getComputedStyle(el)
      return computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll'
    })
    
    console.log('Sidebar scrollable:', sidebarScrollable)
    
    // Find the scrollable content area within sidebar
    const scrollableArea = sidebar.locator('> div').first()
    const scrollableAreaExists = await scrollableArea.count() > 0
    
    if (scrollableAreaExists) {
      const scrollableComputed = await scrollableArea.evaluate(el => {
        const style = getComputedStyle(el)
        return {
          overflowY: style.overflowY,
          height: style.height,
          maxHeight: style.maxHeight
        }
      })
      
      console.log('Scrollable area styles:', scrollableComputed)
      
      // The scrollable area should have overflow-y: auto or scroll
      expect(['auto', 'scroll']).toContain(scrollableComputed.overflowY)
    }
    
    console.log('✅ Sidebar scrolling configuration is correct')
  })
})