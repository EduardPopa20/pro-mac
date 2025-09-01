import { test, expect } from '@playwright/test'
import { waitForFontsLoaded } from './utils'

test.describe('Clickability Debug Tests', () => {

  test('verify basic button clickability on homepage', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Check if main explore button is clickable
    const exploreButton = page.getByText('Explorează produsele')
    await expect(exploreButton).toBeVisible()
    
    console.log('Button found, checking if it\'s clickable...')
    
    // Check if button is enabled
    const isEnabled = await exploreButton.isEnabled()
    console.log('Button enabled:', isEnabled)
    
    // Check for any overlaying elements
    const buttonBox = await exploreButton.boundingBox()
    if (buttonBox) {
      console.log('Button position:', buttonBox)
      
      // Check what element is at the button's center
      const elementAtCenter = await page.locator(`xpath=//*[contains(@class, '') or @role or @aria-label]`)
        .evaluate((elements, coords) => {
          const el = document.elementFromPoint(coords.x + coords.width/2, coords.y + coords.height/2)
          return {
            tagName: el?.tagName,
            className: el?.className,
            id: el?.id,
            textContent: el?.textContent?.slice(0, 50)
          }
        }, buttonBox)
      
      console.log('Element at button center:', elementAtCenter)
    }
    
    // Try to click the button
    try {
      await exploreButton.click({ timeout: 5000 })
      console.log('✓ Button click succeeded')
    } catch (error) {
      console.log('✗ Button click failed:', error.message)
      
      // Check for potential blockers
      const overlayElements = await page.locator('div').filter({ 
        hasText: '' 
      }).evaluate((elements) => {
        return Array.from(document.querySelectorAll('*')).filter(el => {
          const styles = getComputedStyle(el)
          return styles.position === 'fixed' && 
                 (parseInt(styles.zIndex) > 1000 || styles.zIndex === 'auto')
        }).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          zIndex: getComputedStyle(el).zIndex,
          position: getComputedStyle(el).position
        }))
      })
      
      console.log('High z-index elements:', overlayElements)
    }
  })

  test('verify search input functionality', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    console.log('Search input found, testing interaction...')
    
    // Check if input is enabled
    const isEnabled = await searchInput.isEnabled()
    console.log('Search input enabled:', isEnabled)
    
    // Try to focus and type
    try {
      await searchInput.focus()
      await searchInput.fill('test')
      const value = await searchInput.inputValue()
      console.log('Search input value after typing:', value)
      expect(value).toBe('test')
      console.log('✓ Search input works correctly')
    } catch (error) {
      console.log('✗ Search input failed:', error.message)
    }
  })

  test('verify mobile menu button', async ({ page }) => {
    await page.goto('/')
    await page.setViewportSize({ width: 360, height: 720 }) // Mobile viewport
    await waitForFontsLoaded(page)
    
    const menuButton = page.getByRole('button', { name: 'menu' })
    const menuButtonExists = await menuButton.count() > 0
    
    if (menuButtonExists) {
      await expect(menuButton).toBeVisible()
      console.log('Mobile menu button found')
      
      // Check if enabled
      const isEnabled = await menuButton.isEnabled()
      console.log('Menu button enabled:', isEnabled)
      
      // Try to click
      try {
        await menuButton.click()
        console.log('✓ Mobile menu button click succeeded')
        
        // Wait for drawer to open
        await page.waitForTimeout(1000)
        
        const drawer = page.locator('[role="dialog"], .MuiDrawer-root')
        const drawerVisible = await drawer.isVisible()
        console.log('Drawer opened after click:', drawerVisible)
      } catch (error) {
        console.log('✗ Mobile menu button click failed:', error.message)
      }
    } else {
      console.log('Mobile menu button not found on mobile viewport')
    }
  })

  test('check for global overlays or modal blockage', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for newsletter modal or other overlays
    await page.waitForTimeout(6000)
    
    // Check for any blocking modals
    const modals = await page.locator('[role="dialog"], .MuiModal-root, .MuiDialog-root').all()
    console.log(`Found ${modals.length} modal(s) on page`)
    
    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i]
      const isVisible = await modal.isVisible()
      if (isVisible) {
        const modalText = await modal.textContent()
        console.log(`Modal ${i + 1} visible with content:`, modalText?.slice(0, 100))
        
        // Check if modal has backdrop that might block clicks
        const backdrop = modal.locator('.MuiBackdrop-root, [data-testid="backdrop"]')
        const backdropExists = await backdrop.count() > 0
        console.log(`Modal ${i + 1} has backdrop:`, backdropExists)
        
        // Try to close modal if it has a close button
        const closeButton = modal.locator('button').filter({ hasText: /close|×|închide/i })
        const closeButtonExists = await closeButton.count() > 0
        if (closeButtonExists) {
          try {
            await closeButton.click()
            console.log(`✓ Closed modal ${i + 1}`)
          } catch (error) {
            console.log(`✗ Failed to close modal ${i + 1}:`, error.message)
          }
        }
      }
    }
  })

  test('check CSS pointer-events and z-index issues', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Check for elements with pointer-events: none
    const pointerEventsNone = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      return elements.filter(el => {
        const styles = getComputedStyle(el)
        return styles.pointerEvents === 'none'
      }).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent?.slice(0, 50)
      }))
    })
    
    console.log('Elements with pointer-events: none:', pointerEventsNone)
    
    // Check for high z-index overlays
    const highZIndexElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      return elements.filter(el => {
        const styles = getComputedStyle(el)
        const zIndex = parseInt(styles.zIndex)
        return !isNaN(zIndex) && zIndex > 1000
      }).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        zIndex: getComputedStyle(el).zIndex,
        position: getComputedStyle(el).position,
        visibility: getComputedStyle(el).visibility,
        display: getComputedStyle(el).display
      }))
    })
    
    console.log('High z-index elements (>1000):', highZIndexElements)
  })
})