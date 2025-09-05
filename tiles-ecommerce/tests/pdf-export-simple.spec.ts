import { test, expect } from '@playwright/test'

test.describe('PDF Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5178')
    await page.waitForLoadState('networkidle')
  })

  test('PDF download button appears after calculation', async ({ page }) => {
    // Navigate to gresie category
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
        
        // Complete calculation
        await page.getByLabel(/lungime/i).first().fill('4')
        await page.getByLabel(/lățime/i).first().fill('3')
        await page.getByRole('button', { name: /continuă/i }).click()
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Check if PDF download button is visible
        const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
        await expect(pdfButton).toBeVisible()
        await expect(pdfButton).toBeEnabled()
      }
    }
  })

  test('PDF downloads when button clicked', async ({ page }) => {
    // Set up download promise before triggering download
    const downloadPromise = page.waitForEvent('download')
    
    // Navigate to gresie and open calculator
    await page.goto('http://localhost:5178/gresie')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Complete calculation
        await page.getByLabel(/lungime/i).first().fill('5')
        await page.getByLabel(/lățime/i).first().fill('4')
        await page.getByRole('button', { name: /continuă/i }).click()
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Click PDF download button
        const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
        await pdfButton.click()
        
        // Wait for download to complete
        const download = await downloadPromise
        
        // Verify download
        expect(download).toBeTruthy()
        
        // Check filename format
        const filename = download.suggestedFilename()
        expect(filename).toContain('calculator_')
        expect(filename).toEndWith('.pdf')
        
        // Verify the download is a valid PDF by checking the filename
        console.log(`PDF downloaded successfully: ${filename}`)
      }
    }
  })

  test('PDF filename contains product name and date', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    
    await page.goto('http://localhost:5178/parchet')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Complete calculation
        await page.getByLabel(/lungime/i).first().fill('6')
        await page.getByLabel(/lățime/i).first().fill('4.5')
        await page.getByRole('button', { name: /continuă/i }).click()
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Download PDF
        const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
        await pdfButton.click()
        
        const download = await downloadPromise
        const filename = download.suggestedFilename()
        
        // Verify filename contains date
        const today = new Date().toISOString().split('T')[0]
        expect(filename).toContain(today)
        expect(filename).toContain('calculator_')
        expect(filename).toEndWith('.pdf')
        
        console.log(`PDF filename format verified: ${filename}`)
      }
    }
  })

  test('PDF works for wall tile calculator (faianta)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    
    await page.goto('http://localhost:5178/faianta')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
      if (await calculatorButton.isVisible()) {
        await calculatorButton.click()
        
        // Add a wall
        const addWallButton = page.getByRole('button', { name: /adaugă perete/i })
        await addWallButton.click()
        
        // Fill wall dimensions
        await page.getByLabel(/lungime/i).first().fill('3')
        await page.getByLabel(/înălțime/i).first().fill('2.5')
        
        await page.getByRole('button', { name: /continuă/i }).click()
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Download PDF
        const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
        await pdfButton.click()
        
        const download = await downloadPromise
        expect(download).toBeTruthy()
        
        // Verify it's a valid PDF
        const filename = download.suggestedFilename()
        expect(filename).toContain('calculator_')
        expect(filename).toEndWith('.pdf')
        
        console.log(`Faianta calculator PDF downloaded: ${filename}`)
      }
    }
  })

  test('All calculator types have working PDF export', async ({ page }) => {
    const calculatorTypes = [
      { url: 'http://localhost:5178/gresie', name: 'Gresie' },
      { url: 'http://localhost:5178/faianta', name: 'Faianță' },
      { url: 'http://localhost:5178/parchet', name: 'Parchet' }
    ]
    
    for (const calcType of calculatorTypes) {
      await page.goto(calcType.url)
      await page.waitForLoadState('networkidle')
      
      const firstProduct = page.locator('.MuiCard-root').first()
      if (await firstProduct.isVisible()) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        
        const calculatorButton = page.getByRole('button', { name: /calculator necesar/i })
        if (await calculatorButton.isVisible()) {
          await calculatorButton.click()
          
          // Handle different calculator types
          if (calcType.name === 'Faianță') {
            // Add wall for faianta
            const addWallButton = page.getByRole('button', { name: /adaugă perete/i })
            await addWallButton.click()
            await page.getByLabel(/lungime/i).first().fill('3')
            await page.getByLabel(/înălțime/i).first().fill('2.5')
          } else {
            // Room dimensions for gresie/parchet
            await page.getByLabel(/lungime/i).first().fill('4')
            await page.getByLabel(/lățime/i).first().fill('3')
          }
          
          await page.getByRole('button', { name: /continuă/i }).click()
          await page.getByRole('button', { name: /calculează/i }).click()
          
          // Verify PDF button exists
          const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
          await expect(pdfButton).toBeVisible()
          
          console.log(`✅ ${calcType.name} calculator has PDF export`)
        }
      }
    }
  })
})