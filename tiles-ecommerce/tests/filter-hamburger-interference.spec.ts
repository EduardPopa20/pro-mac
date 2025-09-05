import { test, expect } from '@playwright/test'

/**
 * Tests for hamburger menu interference with filter interactions
 * Validates that filter controls don't accidentally trigger menu opening
 * and that menu can be opened while filters are active
 */

test.describe('Filter Hamburger Menu Interference', () => {
  // Test on both gresie and faianta pages
  const testRoutes = ['/gresie', '/faianta']

  for (const route of testRoutes) {
    test.describe(`${route} page`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:5176${route}`)
        await page.waitForLoadState('networkidle')
        
        // Wait for filters to load
        await page.waitForSelector('.MuiCard-root:has-text("Filtrare produse"), button:has-text("Filtrează produsele")', { timeout: 10000 })
      })

      test('hamburger menu opens without filter interference on desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        // Wait for hamburger menu button
        const hamburgerButton = page.getByRole('button', { name: /menu/i })
        await expect(hamburgerButton).toBeVisible()

        // Click hamburger menu - should open without issues
        await hamburgerButton.click()
        
        // Verify menu drawer opens
        const drawer = page.locator('.MuiDrawer-root')
        await expect(drawer).toBeVisible()

        // Close drawer
        await page.keyboard.press('Escape')
        await expect(drawer).not.toBeVisible()
      })

      test('filter interactions do not trigger hamburger menu', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        const hamburgerButton = page.getByRole('button', { name: /menu/i })
        const drawer = page.locator('.MuiDrawer-root')
        
        // Ensure drawer is initially closed
        await expect(drawer).not.toBeVisible()

        // Interact with price filters
        const minPriceField = page.locator('input[label="Min"]').first()
        if (await minPriceField.isVisible()) {
          await minPriceField.click()
          await minPriceField.fill('50')
          
          // Drawer should remain closed
          await expect(drawer).not.toBeVisible()
        }

        const maxPriceField = page.locator('input[label="Max"]').first()
        if (await maxPriceField.isVisible()) {
          await maxPriceField.click()
          await maxPriceField.fill('200')
          
          // Drawer should remain closed
          await expect(drawer).not.toBeVisible()
        }

        // Try to interact with select dropdowns
        const selectElements = page.locator('.MuiSelect-root')
        const selectCount = await selectElements.count()
        
        if (selectCount > 0) {
          const firstSelect = selectElements.first()
          await firstSelect.click()
          
          // Drawer should remain closed even after select interaction
          await expect(drawer).not.toBeVisible()
          
          // Close select by clicking elsewhere
          await page.click('body')
        }

        // Hamburger menu should still work correctly
        await hamburgerButton.click()
        await expect(drawer).toBeVisible()
      })

      test('mobile filter button does not interfere with hamburger menu', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 640 })
        
        // Wait for mobile filter button
        const filterButton = page.getByRole('button', { name: /filtrează produsele/i })
        await expect(filterButton).toBeVisible()

        const hamburgerButton = page.getByRole('button', { name: /menu/i })
        const drawer = page.locator('.MuiDrawer-root')
        
        // Click filter button
        await filterButton.click()
        
        // Filter modal should open
        const filterModal = page.locator('.MuiDialog-root')
        await expect(filterModal).toBeVisible()

        // Close filter modal
        const closeButton = filterModal.getByRole('button', { name: /close/i })
        await closeButton.click()
        await expect(filterModal).not.toBeVisible()

        // Now hamburger menu should work normally
        await hamburgerButton.click()
        await expect(drawer).toBeVisible()
      })

      test('chip deletion does not trigger hamburger menu', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        const drawer = page.locator('.MuiDrawer-root')
        await expect(drawer).not.toBeVisible()

        // Try to find and interact with color selection to create chips
        const colorSelect = page.locator('[label*="culor"], [label*="Culor"]').first()
        if (await colorSelect.isVisible()) {
          await colorSelect.click()
          
          // Select a color option if available
          const firstOption = page.locator('.MuiMenuItem-root').first()
          if (await firstOption.isVisible()) {
            await firstOption.click()
            
            // Look for created chips
            const chips = page.locator('.MuiChip-root')
            const chipCount = await chips.count()
            
            if (chipCount > 0) {
              // Try to delete a chip
              const deleteButton = chips.first().locator('.MuiChip-deleteIcon')
              if (await deleteButton.isVisible()) {
                await deleteButton.click()
                
                // Drawer should remain closed after chip deletion
                await expect(drawer).not.toBeVisible()
              }
            }
          }
        }
      })

      test('event isolation prevents accidental menu triggers', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 })
        
        const drawer = page.locator('.MuiDrawer-root')
        
        // Create an array of potential filter interactions
        const interactions = [
          () => page.click('[type="number"]', { timeout: 1000 }).catch(() => {}),
          () => page.click('.MuiSelect-root', { timeout: 1000 }).catch(() => {}),
          () => page.click('.MuiRadio-root', { timeout: 1000 }).catch(() => {}),
          () => page.click('.MuiChip-deleteIcon', { timeout: 1000 }).catch(() => {}),
          () => page.click('button:has-text("Aplică")', { timeout: 1000 }).catch(() => {}),
          () => page.click('button:has-text("Șterge")', { timeout: 1000 }).catch(() => {})
        ]

        // Perform multiple filter interactions rapidly
        for (const interaction of interactions) {
          await interaction()
          
          // After each interaction, ensure drawer hasn't opened accidentally
          const isVisible = await drawer.isVisible()
          expect(isVisible).toBeFalsy()
        }

        // Finally, verify hamburger menu still works
        const hamburgerButton = page.getByRole('button', { name: /menu/i })
        await hamburgerButton.click()
        await expect(drawer).toBeVisible()
      })
    })
  }
})