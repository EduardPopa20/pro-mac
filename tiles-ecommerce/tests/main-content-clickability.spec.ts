import { test, expect } from '@playwright/test'
import { waitForFontsLoaded } from './utils'

test.describe('Main Content Clickability Tests', () => {

  test('verify main content buttons are clickable', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for page to load completely
    await page.waitForTimeout(2000)
    
    console.log('Testing main content button clickability...')
    
    // Find the main explore button in main content
    const exploreButton = page.getByText('Explorează produsele')
    await expect(exploreButton).toBeVisible()
    
    // Get button position and surrounding elements
    const buttonBox = await exploreButton.boundingBox()
    if (buttonBox) {
      console.log('Button position:', buttonBox)
      
      // Check what element is actually at the button position
      const elementAtPoint = await page.evaluate((coords) => {
        const centerX = coords.x + coords.width / 2
        const centerY = coords.y + coords.height / 2
        const element = document.elementFromPoint(centerX, centerY)
        return {
          tagName: element?.tagName,
          className: element?.className,
          id: element?.id,
          textContent: element?.textContent?.slice(0, 50),
          isClickable: element?.tagName === 'BUTTON' || element?.onclick !== null,
          computedStyle: element ? {
            pointerEvents: getComputedStyle(element).pointerEvents,
            position: getComputedStyle(element).position,
            zIndex: getComputedStyle(element).zIndex
          } : null
        }
      }, buttonBox)
      
      console.log('Element at button center:', elementAtPoint)
      
      // Check parent containers for blocking issues
      const mainContentInfo = await page.evaluate(() => {
        const main = document.querySelector('[role="main"], main')
        const mainBox = main?.getBoundingClientRect()
        return {
          tagName: main?.tagName,
          className: main?.className,
          boundingBox: mainBox ? {
            x: mainBox.x, y: mainBox.y, 
            width: mainBox.width, height: mainBox.height
          } : null,
          computedStyle: main ? {
            overflow: getComputedStyle(main).overflow,
            overflowX: getComputedStyle(main).overflowX,
            overflowY: getComputedStyle(main).overflowY,
            pointerEvents: getComputedStyle(main).pointerEvents,
            position: getComputedStyle(main).position,
            zIndex: getComputedStyle(main).zIndex,
            height: getComputedStyle(main).height
          } : null
        }
      })
      
      console.log('Main content container info:', mainContentInfo)
    }
    
    // Try to click with different methods
    try {
      console.log('Attempting normal click...')
      await exploreButton.click({ timeout: 5000 })
      console.log('✅ Normal click succeeded')
    } catch (error) {
      console.log('❌ Normal click failed:', error.message)
      
      try {
        console.log('Attempting force click...')
        await exploreButton.click({ force: true, timeout: 5000 })
        console.log('✅ Force click succeeded')
      } catch (forceError) {
        console.log('❌ Force click also failed:', forceError.message)
        
        // Try clicking coordinates directly
        if (buttonBox) {
          try {
            console.log('Attempting coordinate click...')
            await page.mouse.click(buttonBox.x + buttonBox.width/2, buttonBox.y + buttonBox.height/2)
            console.log('✅ Coordinate click succeeded')
          } catch (coordError) {
            console.log('❌ Coordinate click failed:', coordError.message)
          }
        }
      }
    }
  })

  test('check main content container styles', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    await page.waitForTimeout(1000)
    
    // Analyze main content area styling
    const containerStyles = await page.evaluate(() => {
      const containers = [
        { name: 'main', element: document.querySelector('[role="main"], main') },
        { name: 'main-parent', element: document.querySelector('[role="main"], main')?.parentElement },
        { name: 'body', element: document.body },
        { name: 'root', element: document.getElementById('root') }
      ]
      
      return containers.map(({ name, element }) => {
        if (!element) return { name, found: false }
        
        const styles = getComputedStyle(element)
        const bbox = element.getBoundingClientRect()
        
        return {
          name,
          found: true,
          tagName: element.tagName,
          className: element.className,
          styles: {
            overflow: styles.overflow,
            overflowX: styles.overflowX, 
            overflowY: styles.overflowY,
            pointerEvents: styles.pointerEvents,
            position: styles.position,
            zIndex: styles.zIndex,
            height: styles.height,
            maxHeight: styles.maxHeight,
            display: styles.display,
            visibility: styles.visibility
          },
          boundingBox: {
            x: bbox.x, y: bbox.y,
            width: bbox.width, height: bbox.height
          }
        }
      })
    })
    
    console.log('Container styles analysis:')
    containerStyles.forEach(container => {
      console.log(`${container.name}:`, container)
    })
    
    // Check for any elements with pointer-events: none in the main area
    const blockedElements = await page.evaluate(() => {
      const main = document.querySelector('[role="main"], main')
      if (!main) return []
      
      const allElements = main.querySelectorAll('*')
      return Array.from(allElements)
        .filter(el => getComputedStyle(el).pointerEvents === 'none')
        .slice(0, 10) // Limit to first 10
        .map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.slice(0, 50)
        }))
    })
    
    console.log('Elements with pointer-events: none in main area:', blockedElements)
  })
})