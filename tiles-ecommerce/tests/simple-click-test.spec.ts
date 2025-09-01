import { test, expect } from '@playwright/test'
import { waitForFontsLoaded } from './utils'

test.describe('Simple Click Test', () => {

  test('verify main button can be clicked', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait a bit for any potential modals
    await page.waitForTimeout(1000)
    
    // Find the main button
    const exploreButton = page.getByText('Explorează produsele')
    await expect(exploreButton).toBeVisible()
    
    console.log('Button found and visible')
    
    // Simple click test
    try {
      await exploreButton.click({ timeout: 5000 })
      console.log('✅ Button click succeeded!')
    } catch (error) {
      console.log('❌ Button click failed:', error.message)
      throw error
    }
  })

  test('verify search input can be used', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait a bit for any potential modals
    await page.waitForTimeout(1000)
    
    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()
    
    console.log('Search input found and visible')
    
    try {
      await searchInput.click()
      await searchInput.fill('test search')
      const value = await searchInput.inputValue()
      expect(value).toBe('test search')
      console.log('✅ Search input works!', value)
    } catch (error) {
      console.log('❌ Search input failed:', error.message)
      throw error
    }
  })

  test('check for blocking modals', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for potential newsletter modal
    await page.waitForTimeout(5000)
    
    // Check if any modal is blocking
    const modals = await page.locator('[role="dialog"]').all()
    console.log(`Found ${modals.length} modal(s)`)
    
    for (let i = 0; i < modals.length; i++) {
      const modal = modals[i]
      const isVisible = await modal.isVisible()
      if (isVisible) {
        const text = await modal.textContent()
        console.log(`Modal ${i + 1} is visible:`, text?.slice(0, 100))
      } else {
        console.log(`Modal ${i + 1} is not visible`)
      }
    }
    
    // Should not have visible modals if we disabled auto-show
    const visibleModals = await page.locator('[role="dialog"]:visible').count()
    expect(visibleModals).toBe(0)
    console.log('✅ No blocking modals found')
  })
})