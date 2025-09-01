import { test, expect } from '@playwright/test'
import { setViewport } from './utils'

test.describe('Redesigned Filter System', () => {
  // Test data setup - navigate to a category with products
  const testCategory = 'gresie'
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:5178/${testCategory}`)
    await page.waitForLoadState('networkidle')
    
    // Wait for products to load (be more flexible about the selector)
    await page.waitForSelector('.MuiCard-root', { timeout: 15000 })
  })

  test.describe('New Filter Interface', () => {
    test('should show filter card with redesigned layout on desktop', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Look for filter card header
      const filterCard = page.locator('text=Filtrare produse').first()
      await expect(filterCard).toBeVisible()
      
      // Verify always-visible sections (no accordions)
      const priceSection = page.locator('text=Interval preț')
      await expect(priceSection).toBeVisible()
      
      // Check for Paper-based sections instead of accordions
      const paperSections = page.locator('.MuiPaper-root').filter({ has: page.locator('text=Interval preț') })
      await expect(paperSections.first()).toBeVisible()
    })

    test('should show mobile filter modal button', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Look for mobile filter trigger button
      const filterButton = page.locator('button').filter({ hasText: 'Filtrează produsele' })
      await expect(filterButton).toBeVisible()
      
      // Click to open modal
      await filterButton.click()
      
      // Should open full-screen modal
      const modal = page.locator('[role="dialog"]')
      await expect(modal).toBeVisible({ timeout: 3000 })
      
      // Should have close button in header
      const closeButton = page.locator('[role="dialog"] button').filter({ has: page.locator('svg') }).first()
      await expect(closeButton).toBeVisible()
      
      // Close modal
      await closeButton.click()
      await expect(modal).not.toBeVisible()
    })
  })

  test.describe('Always-Visible Filter Options', () => {
    test('should show all available filter options without conditionals', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Price section should always be visible
      const priceSection = page.locator('text=Interval preț')
      await expect(priceSection).toBeVisible()
      
      // Color section should be visible if colors exist in category
      const colorSection = page.locator('text=Culoare')
      if (await colorSection.isVisible()) {
        // Open color dropdown to see all options
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        // Should show all available colors from the category
        const colorOptions = page.locator('[role="listbox"] [role="option"]')
        const optionCount = await colorOptions.count()
        expect(optionCount).toBeGreaterThan(0)
        
        // Close dropdown
        await page.keyboard.press('Escape')
      }
      
      // Other sections should be visible if they have data
      const filterSections = page.locator('.MuiPaper-root').filter({ has: page.locator('.MuiTypography-subtitle2') })
      const sectionCount = await filterSections.count()
      expect(sectionCount).toBeGreaterThanOrEqual(1) // At least price section
    })

    test('should not conditionally hide filter options based on current selection', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Apply a price filter
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('100')
      
      // Apply the filter
      const applyButton = page.locator('text=Aplică filtrele').first()
      await applyButton.click()
      await page.waitForLoadState('networkidle')
      
      // All filter options should still be visible
      const colorSection = page.locator('text=Culoare')
      if (await colorSection.isVisible()) {
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        // Should still show ALL available colors, not just those in filtered results
        const colorOptions = page.locator('[role="listbox"] [role="option"]')
        const optionCount = await colorOptions.count()
        expect(optionCount).toBeGreaterThan(0)
        
        await page.keyboard.press('Escape')
      }
    })
  })

  test.describe('Chip Deletion Functionality', () => {
    test('should properly delete color chips with X button', async ({ page }) => {
      await setViewport(page, 'lg')
      
      const colorSection = page.locator('text=Culoare')
      if (await colorSection.isVisible()) {
        // Select a color
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        const firstColorOption = page.locator('[role="listbox"] [role="option"]').first()
        if (await firstColorOption.isVisible()) {
          const colorText = await firstColorOption.textContent()
          await firstColorOption.click()
          
          // Click outside to close dropdown
          await page.click('body')
          
          // Should show selected color as chip
          const selectedChip = page.locator('.MuiChip-root').filter({ hasText: colorText || '' })
          await expect(selectedChip).toBeVisible()
          
          // Click X button to delete chip
          const deleteButton = selectedChip.locator('.MuiChip-deleteIcon')
          await deleteButton.click()
          
          // Chip should be removed
          await expect(selectedChip).not.toBeVisible()
        }
      }
    })

    test('should prevent dropdown from opening when deleting chips', async ({ page }) => {
      await setViewport(page, 'md')
      
      const colorSection = page.locator('text=Culoare')
      if (await colorSection.isVisible()) {
        // Select multiple colors
        const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
        await colorSelect.click()
        
        const colorOptions = page.locator('[role="listbox"] [role="option"]')
        const optionCount = await colorOptions.count()
        
        if (optionCount > 1) {
          // Select first two colors
          await colorOptions.nth(0).click()
          await colorOptions.nth(1).click()
          
          // Close dropdown
          await page.click('body')
          
          // Get all chips
          const chips = page.locator('.MuiChip-root').filter({ has: page.locator('.MuiChip-deleteIcon') })
          const chipCount = await chips.count()
          
          if (chipCount > 0) {
            // Click delete button on first chip
            const firstChip = chips.first()
            const deleteButton = firstChip.locator('.MuiChip-deleteIcon')
            await deleteButton.click()
            
            // Dropdown should NOT open
            const dropdown = page.locator('[role="listbox"]')
            await expect(dropdown).not.toBeVisible()
            
            // Chip should be removed
            const remainingChips = page.locator('.MuiChip-root').filter({ has: page.locator('.MuiChip-deleteIcon') })
            const remainingCount = await remainingChips.count()
            expect(remainingCount).toBe(chipCount - 1)
          }
        }
      }
    })
  })

  test.describe('Manual Filter Application', () => {
    test('should show "Aplică filtrele" button with pending changes indicator', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Make a change to filters
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('150')
      
      // Should show apply button with badge for pending changes
      const applyButton = page.locator('text=Aplică filtrele').first()
      await expect(applyButton).toBeVisible()
      
      // Look for badge indicating pending changes
      const badge = page.locator('.MuiBadge-dot, .MuiBadge-standard')
      await expect(badge).toBeVisible()
    })

    test('should not auto-apply filters until button is clicked', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Get initial product count
      const initialProductCards = await page.locator('.MuiCard-root').count()
      
      // Change price filter but don't apply
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('500') // High price to reduce results
      
      await page.waitForTimeout(1000) // Wait to see if products auto-update
      
      // Products should NOT change yet
      const unchangedProductCards = await page.locator('.MuiCard-root').count()
      expect(unchangedProductCards).toBe(initialProductCards)
      
      // Now apply filters
      const applyButton = page.locator('text=Aplică filtrele').first()
      await applyButton.click()
      await page.waitForLoadState('networkidle')
      
      // Products should now be filtered
      const filteredProductCards = await page.locator('.MuiCard-root').count()
      expect(filteredProductCards).toBeLessThanOrEqual(initialProductCards)
    })

    test('should show clear filters button when active', async ({ page }) => {
      await setViewport(page, 'md')
      
      // Apply a filter
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('100')
      
      const applyButton = page.locator('text=Aplică filtrele').first()
      await applyButton.click()
      await page.waitForLoadState('networkidle')
      
      // Should show clear button
      const clearButton = page.locator('text=Șterge tot').first()
      await expect(clearButton).toBeVisible()
      
      // Click clear button
      await clearButton.click()
      
      // Filters should reset
      const resetMinValue = await minPriceInput.inputValue()
      expect(parseInt(resetMinValue)).toBeLessThan(100)
    })
  })

  test.describe('Always-Visible Sections (No Accordions)', () => {
    test('should show all filter sections as always-visible Paper containers', async ({ page }) => {
      await setViewport(page, 'lg')
      
      // Price section should be in Paper container
      const priceSection = page.locator('.MuiPaper-root').filter({ has: page.locator('text=Interval preț') })
      await expect(priceSection).toBeVisible()
      
      // Color section should be in Paper container if colors exist
      const colorSection = page.locator('.MuiPaper-root').filter({ has: page.locator('text=Culoare') })
      if (await colorSection.isVisible()) {
        await expect(colorSection).toBeVisible()
      }
      
      // Should NOT have accordion collapse/expand buttons
      const accordionButtons = page.locator('.MuiAccordionSummary-root, [aria-expanded]')
      const accordionCount = await accordionButtons.count()
      expect(accordionCount).toBe(0)
    })

    test('should keep all sections expanded and accessible', async ({ page }) => {
      await setViewport(page, 'md')
      
      // All filter controls should be immediately accessible
      const priceInputs = page.locator('input[type="number"]')
      await expect(priceInputs.first()).toBeVisible()
      await expect(priceInputs.last()).toBeVisible()
      
      // Color dropdown should be immediately accessible if present
      const colorSelect = page.locator('[role="combobox"]').filter({ has: page.locator('text=Selectează culorile') })
      if (await colorSelect.isVisible()) {
        await expect(colorSelect).toBeVisible()
        
        // Should be clickable without expanding anything
        await colorSelect.click()
        const dropdown = page.locator('[role="listbox"]')
        await expect(dropdown).toBeVisible()
        await page.keyboard.press('Escape')
      }
    })
  })

  test.describe('Price Input Focus Retention', () => {
    test('should maintain focus when typing in price inputs', async ({ page }) => {
      await setViewport(page, 'lg')
      
      const minPriceInput = page.locator('input[type="number"]').first()
      
      // Click and type in input
      await minPriceInput.click()
      await minPriceInput.fill('123')
      
      // Input should still be focused
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBe(minPriceInput)
      
      // Value should be preserved
      const value = await minPriceInput.inputValue()
      expect(value).toBe('123')
    })

    test('should handle continuous typing without losing focus', async ({ page }) => {
      await setViewport(page, 'md')
      
      const maxPriceInput = page.locator('input[type="number"]').last()
      
      // Focus and type character by character
      await maxPriceInput.click()
      await maxPriceInput.type('456', { delay: 100 })
      
      // Should preserve all characters
      const finalValue = await maxPriceInput.inputValue()
      expect(finalValue).toBe('456')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should show sidebar on desktop and modal on mobile', async ({ page }) => {
      // Desktop: sidebar
      await setViewport(page, 'lg')
      
      const desktopFilterCard = page.locator('.MuiCard-root').filter({ has: page.locator('text=Filtrare produse') })
      await expect(desktopFilterCard).toBeVisible()
      
      // Mobile: button + modal
      await setViewport(page, 'xs')
      await page.waitForTimeout(500) // Wait for responsive changes
      
      const mobileButton = page.locator('button').filter({ hasText: 'Filtrează produsele' })
      await expect(mobileButton).toBeVisible()
      
      // Click to open modal
      await mobileButton.click()
      const modal = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(modal).toBeVisible()
      
      // Modal should be full screen
      const modalPaper = modal.locator('.MuiDialog-paper')
      const modalBox = await modalPaper.boundingBox()
      const viewport = page.viewportSize()
      
      if (modalBox && viewport) {
        expect(modalBox.width).toBeGreaterThanOrEqual(viewport.width * 0.9) // Nearly full width
        expect(modalBox.height).toBeGreaterThanOrEqual(viewport.height * 0.9) // Nearly full height
      }
    })

    test('should adapt TextField widths for mobile visibility', async ({ page }) => {
      await setViewport(page, 'xs')
      
      // Open mobile modal
      const mobileButton = page.locator('button').filter({ hasText: 'Filtrează produsele' })
      await mobileButton.click()
      
      // Check price input widths in modal
      const priceInputs = page.locator('[role="dialog"] input[type="number"]')
      const inputCount = await priceInputs.count()
      
      for (let i = 0; i < inputCount; i++) {
        const input = priceInputs.nth(i)
        const inputBox = await input.boundingBox()
        
        // Should meet minimum mobile width requirements
        expect(inputBox?.width).toBeGreaterThanOrEqual(75) // Per CLAUDE.md requirements
      }
      
      // Check that "RON" suffix is visible
      const ronSuffixes = page.locator('[role="dialog"] .MuiInputAdornment-root').filter({ hasText: 'RON' })
      if (await ronSuffixes.count() > 0) {
        await expect(ronSuffixes.first()).toBeVisible()
      }
    })
  })
})