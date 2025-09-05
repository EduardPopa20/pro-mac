import { test, expect } from '@playwright/test'

/**
 * Specialized Photo Management Testing for Showroom Form
 * 
 * This test suite focuses specifically on the ShowroomPhotoManager component:
 * - File upload validation (type, size, count limits)
 * - Photo display and management
 * - Fullscreen preview functionality
 * - Error handling and user feedback
 * - File system interaction and cleanup
 * 
 * Tests simulate real file interactions and validate the complete
 * photo workflow from upload to deletion.
 */

// Test file generation utilities
function createTestImage(width = 100, height = 100, format = 'PNG'): Buffer {
  // Create minimal valid PNG file
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // Width (1 pixel)
    0x00, 0x00, 0x00, 0x01, // Height (1 pixel)
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, etc.
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0xE5, 0x27, 0xDE, 0xFC, // IDAT data and CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // IEND CRC
  ])
  return pngHeader
}

function createOversizedImage(sizeMB: number): Buffer {
  const baseImage = createTestImage()
  const padding = Buffer.alloc((sizeMB * 1024 * 1024) - baseImage.length, 0xFF)
  return Buffer.concat([baseImage, padding])
}

function createInvalidFile(content = 'This is not an image file'): Buffer {
  return Buffer.from(content, 'utf8')
}

// Login helper
async function loginAsAdmin(page: any) {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'admin@promac.ro')
  await page.fill('input[type="password"]', 'Admin123!')
  await page.click('button:has-text("Autentificare")')
  await page.waitForURL('/admin')
}

// Page object for photo manager
class PhotoManagerTester {
  constructor(private page: any) {}

  async navigateToForm() {
    await this.page.goto('/admin/showroom-uri/create')
    await this.page.waitForLoadState('networkidle')
  }

  async uploadFile(filename: string, fileBuffer: Buffer, mimeType: string) {
    // Create a temporary file path for testing
    const fileInput = this.page.locator('input[type="file"]')
    
    // Mock file selection
    await this.page.evaluateHandle(({ filename, buffer, mimeType }) => {
      const file = new File([buffer], filename, { type: mimeType })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      
      // Create FileList-like object
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => index === 0 ? file : null,
        [Symbol.iterator]: function* () { yield file }
      }
      
      Object.defineProperty(input, 'files', {
        value: fileList,
        configurable: true
      })
      
      // Trigger change event
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }, { filename, buffer: Array.from(fileBuffer), mimeType })
  }

  async getUploadedPhotoCount(): Promise<number> {
    return await this.page.locator('[alt*="Showroom photo"]').count()
  }

  async clickDeletePhoto(index: number) {
    const photoCard = this.page.locator('[alt*="Showroom photo"]').nth(index).locator('..')
    await photoCard.hover()
    await photoCard.locator('button[aria-label*="Șterge"]').click()
  }

  async openFullscreenPreview(index: number) {
    const photoCard = this.page.locator('[alt*="Showroom photo"]').nth(index).locator('..')
    await photoCard.hover()
    await photoCard.locator('button[aria-label*="dimensiune"]').click()
  }

  async closeFullscreenPreview() {
    await this.page.click('button[aria-label*="Închide"]')
  }

  async getErrorMessage(): Promise<string | null> {
    const errorAlert = this.page.locator('.MuiAlert-root[severity="error"]')
    return await errorAlert.isVisible() ? await errorAlert.textContent() : null
  }

  async getPhotoCounter(): Promise<string> {
    return await this.page.locator('text*="("').textContent() || ''
  }

  async isUploadButtonEnabled(): Promise<boolean> {
    const uploadBtn = this.page.locator('button:has-text("Adaugă fotografie")')
    return !(await uploadBtn.isDisabled())
  }

  async waitForUploadComplete() {
    // Wait for upload spinner to disappear
    await this.page.waitForSelector('text*="Se încarcă"', { state: 'hidden', timeout: 5000 })
  }
}

test.describe('Showroom Photo Manager - Specialized Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test.describe('📁 File Upload Validation', () => {
    
    test('should accept valid image formats', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Test PNG
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      expect(await photoManager.getUploadedPhotoCount()).toBe(1)
      
      // Test JPG
      await photoManager.uploadFile('test.jpg', createTestImage(), 'image/jpeg')
      await photoManager.waitForUploadComplete()
      expect(await photoManager.getUploadedPhotoCount()).toBe(2)
      
      // Test WebP
      await photoManager.uploadFile('test.webp', createTestImage(), 'image/webp')
      await photoManager.waitForUploadComplete()
      expect(await photoManager.getUploadedPhotoCount()).toBe(3)
    })

    test('should reject invalid file types', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Test text file
      await photoManager.uploadFile('document.txt', createInvalidFile(), 'text/plain')
      
      const error = await photoManager.getErrorMessage()
      expect(error).toContain('fișiere imagine')
      expect(await photoManager.getUploadedPhotoCount()).toBe(0)
    })

    test('should enforce 5MB file size limit', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload oversized file (6MB)
      const largeFile = createOversizedImage(6)
      await photoManager.uploadFile('large.png', largeFile, 'image/png')
      
      const error = await photoManager.getErrorMessage()
      expect(error).toContain('5MB')
      expect(await photoManager.getUploadedPhotoCount()).toBe(0)
    })

    test('should enforce maximum 3 photos limit', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload 3 valid photos
      for (let i = 0; i < 3; i++) {
        await photoManager.uploadFile(`photo${i}.png`, createTestImage(), 'image/png')
        await photoManager.waitForUploadComplete()
      }
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(3)
      expect(await photoManager.getPhotoCounter()).toContain('(3/3)')
      
      // Try to upload 4th photo
      await photoManager.uploadFile('photo4.png', createTestImage(), 'image/png')
      
      const error = await photoManager.getErrorMessage()
      expect(error).toContain('maximum 3')
      expect(await photoManager.getUploadedPhotoCount()).toBe(3)
    })

    test('should disable upload button when limit reached', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload 3 photos to reach limit
      for (let i = 0; i < 3; i++) {
        expect(await photoManager.isUploadButtonEnabled()).toBe(true)
        await photoManager.uploadFile(`photo${i}.png`, createTestImage(), 'image/png')
        await photoManager.waitForUploadComplete()
      }
      
      // Upload button should be disabled/hidden
      expect(await photoManager.isUploadButtonEnabled()).toBe(false)
    })
  })

  test.describe('🖼️ Photo Display and Management', () => {
    
    test('should display uploaded photos correctly', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      // Check photo is displayed
      const photo = page.locator('[alt*="Showroom photo"]')
      await expect(photo).toBeVisible()
      
      // Check photo has correct attributes
      const src = await photo.getAttribute('src')
      expect(src).toBeTruthy()
      expect(src).toContain('data:image') // Base64 data URL
    })

    test('should show hover actions on photo cards', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      const photoCard = page.locator('[alt*="Showroom photo"]').locator('..')
      
      // Actions should be hidden initially
      const actionButtons = photoCard.locator('.action-buttons')
      await expect(actionButtons).toHaveCSS('opacity', '0')
      
      // Actions should appear on hover
      await photoCard.hover()
      await expect(actionButtons).toHaveCSS('opacity', '1')
      
      // Should have fullscreen and delete buttons
      await expect(photoCard.locator('button[aria-label*="dimensiune"]')).toBeVisible()
      await expect(photoCard.locator('button[aria-label*="Șterge"]')).toBeVisible()
    })

    test('should delete photos correctly', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload 2 photos
      await photoManager.uploadFile('photo1.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      await photoManager.uploadFile('photo2.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(2)
      
      // Delete first photo
      await photoManager.clickDeletePhoto(0)
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(1)
      expect(await photoManager.getPhotoCounter()).toContain('(1/3)')
      
      // Upload button should be re-enabled
      expect(await photoManager.isUploadButtonEnabled()).toBe(true)
    })

    test('should handle photo deletion edge cases', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload 3 photos to reach limit
      for (let i = 0; i < 3; i++) {
        await photoManager.uploadFile(`photo${i}.png`, createTestImage(), 'image/png')
        await photoManager.waitForUploadComplete()
      }
      
      // Delete middle photo
      await photoManager.clickDeletePhoto(1)
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(2)
      
      // Delete all remaining photos
      await photoManager.clickDeletePhoto(0)
      await photoManager.clickDeletePhoto(0) // Index shifts after deletion
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(0)
      
      // Should show empty state
      const emptyState = page.locator('text*="Nu există fotografii"')
      await expect(emptyState).toBeVisible()
    })
  })

  test.describe('🔍 Fullscreen Preview Functionality', () => {
    
    test('should open fullscreen preview', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      // Open fullscreen
      await photoManager.openFullscreenPreview(0)
      
      // Check fullscreen dialog is visible
      const dialog = page.locator('.MuiDialog-root')
      await expect(dialog).toBeVisible()
      
      // Check fullscreen image
      const fullscreenImage = dialog.locator('img')
      await expect(fullscreenImage).toBeVisible()
      
      // Check close button
      const closeBtn = dialog.locator('button[aria-label*="Închide"]')
      await expect(closeBtn).toBeVisible()
    })

    test('should close fullscreen preview', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      await photoManager.openFullscreenPreview(0)
      
      const dialog = page.locator('.MuiDialog-root')
      await expect(dialog).toBeVisible()
      
      // Close via close button
      await photoManager.closeFullscreenPreview()
      await expect(dialog).toBeHidden()
    })

    test('should close fullscreen on backdrop click', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      await photoManager.openFullscreenPreview(0)
      
      const dialog = page.locator('.MuiDialog-root')
      await expect(dialog).toBeVisible()
      
      // Click backdrop to close
      await page.click('.MuiBackdrop-root', { position: { x: 10, y: 10 } })
      await expect(dialog).toBeHidden()
    })

    test('should show correct photo info in fullscreen', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload multiple photos
      for (let i = 0; i < 3; i++) {
        await photoManager.uploadFile(`photo${i}.png`, createTestImage(), 'image/png')
        await photoManager.waitForUploadComplete()
      }
      
      // Open fullscreen for second photo (index 1)
      await photoManager.openFullscreenPreview(1)
      
      const dialog = page.locator('.MuiDialog-root')
      const photoInfo = dialog.locator('text*="Fotografie"')
      
      const infoText = await photoInfo.textContent()
      expect(infoText).toContain('Fotografie 2 din 3')
    })
  })

  test.describe('⚠️ Error Handling and User Feedback', () => {
    
    test('should show clear error messages', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Test invalid file type error
      await photoManager.uploadFile('document.pdf', createInvalidFile(), 'application/pdf')
      
      let error = await photoManager.getErrorMessage()
      expect(error).toBeTruthy()
      expect(error).toContain('JPG, PNG, WebP')
      
      // Clear error and test size limit
      await page.click('.MuiAlert-closeButton')
      await photoManager.uploadFile('large.png', createOversizedImage(6), 'image/png')
      
      error = await photoManager.getErrorMessage()
      expect(error).toContain('5MB')
    })

    test('should clear error messages automatically', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Trigger error
      await photoManager.uploadFile('invalid.txt', createInvalidFile(), 'text/plain')
      
      const errorAlert = page.locator('.MuiAlert-root[severity="error"]')
      await expect(errorAlert).toBeVisible()
      
      // Upload valid file - error should clear
      await photoManager.uploadFile('valid.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      await expect(errorAlert).toBeHidden()
    })

    test('should handle upload progress indication', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload file and check for progress indicator
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      
      // Check for loading state (if implemented)
      const uploadBtn = page.locator('button:has-text("Se încarcă")')
      await expect(uploadBtn).toBeVisible({ timeout: 1000 })
      
      await photoManager.waitForUploadComplete()
      
      // Loading state should be gone
      await expect(uploadBtn).toBeHidden()
    })

    test('should prevent interactions during upload', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Start upload
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      
      // Try to upload another file immediately
      const fileInput = page.locator('input[type="file"]')
      const isDisabled = await fileInput.isDisabled()
      
      // File input should be disabled during upload
      expect(isDisabled).toBe(true)
      
      await photoManager.waitForUploadComplete()
      
      // Should be enabled again after upload
      const isEnabledAfter = await fileInput.isDisabled()
      expect(isEnabledAfter).toBe(false)
    })
  })

  test.describe('📱 Responsive Behavior', () => {
    
    test('should handle mobile layout correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
      
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      await photoManager.uploadFile('test.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      // Check photo card layout on mobile
      const photoCard = page.locator('[alt*="Showroom photo"]').locator('..')
      const cardHeight = await photoCard.evaluate(el => el.offsetHeight)
      
      // Should have appropriate height for mobile
      expect(cardHeight).toBeGreaterThan(200)
      expect(cardHeight).toBeLessThan(300)
    })

    test('should handle tablet layout correctly', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload multiple photos to test grid layout
      for (let i = 0; i < 2; i++) {
        await photoManager.uploadFile(`photo${i}.png`, createTestImage(), 'image/png')
        await photoManager.waitForUploadComplete()
      }
      
      const photoCards = page.locator('[alt*="Showroom photo"]')
      const cardCount = await photoCards.count()
      expect(cardCount).toBe(2)
      
      // Photos should be arranged in grid
      const firstCard = photoCards.first()
      const secondCard = photoCards.last()
      
      const firstBox = await firstCard.boundingBox()
      const secondBox = await secondCard.boundingBox()
      
      // On tablet, photos might be side by side
      expect(firstBox).toBeTruthy()
      expect(secondBox).toBeTruthy()
    })
  })

  test.describe('🔧 Integration with Parent Form', () => {
    
    test('should integrate with form save process', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Fill required form fields
      await page.fill('input[label*="Nume"]', 'Test Showroom')
      await page.fill('input[label*="Oraș"]', 'Test City')
      await page.fill('input[label*="Adresa"]', 'Test Address')
      
      // Upload photos
      await photoManager.uploadFile('photo1.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      // Save form
      await page.click('button:has-text("Creează")')
      
      // Should save without errors
      await page.waitForSelector('text*="salvat"', { timeout: 10000 })
      
      // Navigate back to verify photos persisted
      // This would require actual database integration
      console.log('Photo persistence test - requires database integration')
    })

    test('should reset on form reset', async ({ page }) => {
      const photoManager = new PhotoManagerTester(page)
      await photoManager.navigateToForm()
      
      // Upload photos
      await photoManager.uploadFile('photo1.png', createTestImage(), 'image/png')
      await photoManager.waitForUploadComplete()
      
      expect(await photoManager.getUploadedPhotoCount()).toBe(1)
      
      // Simulate form reset (navigate away and back)
      await page.goto('/admin/dashboard')
      await page.goto('/admin/showroom-uri/create')
      
      // Photos should be reset
      expect(await photoManager.getUploadedPhotoCount()).toBe(0)
      
      const emptyState = page.locator('text*="Nu există fotografii"')
      await expect(emptyState).toBeVisible()
    })
  })
})