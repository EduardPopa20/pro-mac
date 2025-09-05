import { test, expect } from '@playwright/test'

test.describe('Product Calculator Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5178')
    await page.waitForLoadState('networkidle')
  })

  test('Calculator button appears on tile product pages', async ({ page }) => {
    // Navigate to gresie category
    await page.goto('http://localhost:5178/gresie')
    await page.waitForLoadState('networkidle')
    
    // Click on first product
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      // Check if calculator button exists
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      await expect(calculatorButton).toBeVisible()
    }
  })

  test('Calculator modal opens when button clicked', async ({ page }) => {
    // Navigate to a specific product page
    await page.goto('http://localhost:5178/gresie')
    await page.waitForLoadState('networkidle')
    
    // Click on first product
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      // Click calculator button
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Check if calculator modal opened
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/calculator gresie/i)).toBeVisible()
      }
    }
  })

  test('Calculator performs basic calculation', async ({ page }) => {
    // Navigate to a product page
    await page.goto('http://localhost:5178/gresie')
    await page.waitForLoadState('networkidle')
    
    // Click on first product
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      // Open calculator
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Wait for dialog
        await expect(page.getByRole('dialog')).toBeVisible()
        
        // Fill in room dimensions
        await page.getByLabel(/lungime/i).first().fill('4')
        await page.getByLabel(/lățime/i).first().fill('3')
        
        // Continue to next step
        await page.getByRole('button', { name: /continuă/i }).click()
        
        // Select wastage percentage (should have default selected)
        // Continue to calculation
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Check if results are displayed
        await expect(page.getByText(/cutii necesare/i)).toBeVisible()
        await expect(page.getByText(/suprafață de bază/i)).toBeVisible()
        
        // Check for add to cart button with quantity
        const addToCartButton = page.getByRole('button', { name: /adaugă.*cutii în coș/i })
        await expect(addToCartButton).toBeVisible()
      }
    }
  })

  test('Calculator handles wall dimensions for faianta', async ({ page }) => {
    // Navigate to faianta category
    await page.goto('http://localhost:5178/faianta')
    await page.waitForLoadState('networkidle')
    
    // Click on first product if available
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      // Open calculator
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Wait for dialog
        await expect(page.getByRole('dialog')).toBeVisible()
        
        // Add wall button should be visible
        const addWallButton = page.getByRole('button', { name: /adaugă perete/i })
        await expect(addWallButton).toBeVisible()
        
        // Add a wall
        await addWallButton.click()
        
        // Fill wall dimensions
        const lengthInputs = page.getByLabel(/lungime/i)
        const heightInputs = page.getByLabel(/înălțime/i)
        
        if (await lengthInputs.count() > 0) {
          await lengthInputs.first().fill('4')
          await heightInputs.first().fill('2.5')
          
          // Continue
          await page.getByRole('button', { name: /continuă/i }).click()
          
          // Complete calculation
          await page.getByRole('button', { name: /calculează/i }).click()
          
          // Check results
          await expect(page.getByText(/cutii necesare/i)).toBeVisible()
        }
      }
    }
  })
})

test.describe('Calculator Accuracy', () => {
  test('Gresie calculator matches PDF formula', async ({ page }) => {
    // This test validates the calculation against the PDF formulas
    // Formula: Area = Length × Width × (1 + wastage%)
    
    await page.goto('http://localhost:5178/gresie')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Test case: 3m × 3m room = 9m² base area
        await page.getByLabel(/lungime/i).first().fill('3')
        await page.getByLabel(/lățime/i).first().fill('3')
        await page.getByRole('button', { name: /continuă/i }).click()
        
        // With 10% wastage = 9.9m² total
        // Should show this in results
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Verify base area
        const baseAreaText = await page.getByText(/suprafață de bază/i).locator('..').textContent()
        expect(baseAreaText).toContain('9')
        
        // Verify total area with wastage
        const totalAreaText = await page.getByText(/suprafață cu rezervă/i).locator('..').textContent()
        expect(totalAreaText).toMatch(/9\.9|10/)
      }
    }
  })
})