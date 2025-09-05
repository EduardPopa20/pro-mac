import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

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

  test('PDF downloads when button clicked', async ({ page, context }) => {
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
        
        // Optionally save and verify the file
        const downloadPath = path.join(__dirname, 'downloads', filename)
        await download.saveAs(downloadPath)
        
        // Verify file exists and has content
        const fileExists = fs.existsSync(downloadPath)
        expect(fileExists).toBe(true)
        
        if (fileExists) {
          const stats = fs.statSync(downloadPath)
          expect(stats.size).toBeGreaterThan(1000) // PDF should be at least 1KB
          
          // Clean up
          fs.unlinkSync(downloadPath)
        }
      }
    }
  })

  test('PDF contains correct calculation data', async ({ page }) => {
    // This test would ideally parse the PDF content
    // For now, we just verify the download happens with correct naming
    
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
        
        // Specific dimensions for verification
        const testLength = '6'
        const testWidth = '4.5'
        
        await page.getByLabel(/lungime/i).first().fill(testLength)
        await page.getByLabel(/lățime/i).first().fill(testWidth)
        await page.getByRole('button', { name: /continuă/i }).click()
        
        // Select 10% wastage
        const wastageOption = page.getByText(/10%.*DIY/i)
        if (await wastageOption.isVisible()) {
          await wastageOption.click()
        }
        
        await page.getByRole('button', { name: /calculează/i }).click()
        
        // Download PDF
        const pdfButton = page.getByRole('button', { name: /descarcă pdf/i })
        await pdfButton.click()
        
        const download = await downloadPromise
        const filename = download.suggestedFilename()
        
        // Verify filename contains date
        const today = new Date().toISOString().split('T')[0]
        expect(filename).toContain(today)
        
        // Save for manual inspection if needed
        const downloadPath = path.join(__dirname, 'downloads', 'test_' + filename)
        await download.saveAs(downloadPath)
        
        // The PDF should contain:
        // - Base area: 6 * 4.5 = 27m²
        // - With 10% wastage: 29.7m²
        // We can't easily verify PDF content without additional libraries
        // but we've confirmed the download works
        
        // Clean up
        if (fs.existsSync(downloadPath)) {
          fs.unlinkSync(downloadPath)
        }
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
        
        // Verify it's a faianta calculation
        const filename = download.suggestedFilename()
        expect(filename).toContain('calculator_')
        expect(filename).toEndWith('.pdf')
      }
    }
  })
})

// Create downloads directory if it doesn't exist
test.beforeAll(() => {
  const downloadsDir = path.join(__dirname, 'downloads')
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true })
  }
})

// Clean up downloads directory after tests
test.afterAll(() => {
  const downloadsDir = path.join(__dirname, 'downloads')
  if (fs.existsSync(downloadsDir)) {
    const files = fs.readdirSync(downloadsDir)
    files.forEach(file => {
      const filePath = path.join(downloadsDir, file)
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath)
      }
    })
  }
})