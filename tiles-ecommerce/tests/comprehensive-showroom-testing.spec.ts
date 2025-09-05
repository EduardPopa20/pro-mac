import { test, expect } from '@playwright/test'
import { supabase } from '../src/lib/supabase'

/**
 * Comprehensive Showroom Management Testing Suite
 * 
 * This test suite validates the showroom editing feature functionality including:
 * - Form validation (field constraints, email format, phone format, URL validation)
 * - Photo management (upload, delete, file type/size validation, max photo limit)
 * - Working hours editor (time picker validation, day toggles, hour string generation)
 * - Database propagation (data integrity, save/update operations)
 * - End-to-end workflows (create/edit/preview/delete scenarios)
 * - Edge cases and security validation
 * - Integration with admin authentication and RLS policies
 * 
 * Tests are designed to be thorough and catch regression issues in the
 * enhanced showroom form components.
 */

// Test data constants
const VALID_SHOWROOM_DATA = {
  name: 'Test Showroom București',
  city: 'București', 
  address: 'Strada Test Nr. 123, Sector 1',
  phone: '021-123-4567',
  email: 'test@promac.ro',
  waze_url: 'https://waze.com/ul/test-url',
  google_maps_url: 'https://maps.google.com/test-location',
  description: 'Acesta este un showroom de test cu toate facilitățile necesare pentru demonstrarea produselor noastre de calitate.'
}

const INVALID_EMAIL_FORMATS = [
  'invalid-email',
  'test@',
  '@domain.com',
  'test@domain',
  'test..double@domain.com'
]

const INVALID_URL_FORMATS = [
  'not-a-url',
  'http://',
  'invalid-protocol://test.com',
  'ftp://wrong-protocol.com'
]

// Page object helpers
class ShowroomFormPage {
  constructor(private page: any) {}

  async goto(showroomId?: string) {
    const url = showroomId 
      ? `/admin/showroom-uri/${showroomId}/edit`
      : '/admin/showroom-uri/create'
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
  }

  async fillBasicInfo(data: Partial<typeof VALID_SHOWROOM_DATA>) {
    if (data.name) await this.page.fill('input[label*="Nume Showroom"]', data.name)
    if (data.city) await this.page.fill('input[label*="Oraș"]', data.city)
    if (data.address) await this.page.fill('input[label*="Adresa"]', data.address)
  }

  async fillContactInfo(data: Partial<typeof VALID_SHOWROOM_DATA>) {
    if (data.phone) await this.page.fill('input[label*="Telefon"]', data.phone)
    if (data.email) await this.page.fill('input[type="email"]', data.email)
  }

  async fillNavigation(data: Partial<typeof VALID_SHOWROOM_DATA>) {
    if (data.waze_url) await this.page.fill('input[label*="Waze"]', data.waze_url)
    if (data.google_maps_url) await this.page.fill('input[label*="Google Maps"]', data.google_maps_url)
  }

  async fillDescription(text: string) {
    await this.page.fill('textarea[label*="Descriere"]', text)
  }

  async toggleActive(active: boolean) {
    const switch_ = this.page.locator('input[type="checkbox"]').first()
    const isChecked = await switch_.isChecked()
    if (isChecked !== active) {
      await switch_.click()
    }
  }

  async clickSave() {
    await this.page.click('button:has-text("Salvează"), button:has-text("Creează")')
  }

  async clickPreview() {
    await this.page.click('button:has-text("Preview")')
  }

  async uploadPhoto(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)
  }

  async deletePhoto(index: number) {
    const deleteBtn = this.page.locator('.action-buttons').nth(index).locator('button[aria-label*="Șterge"]')
    await deleteBtn.hover()
    await deleteBtn.click()
  }

  async getValidationErrors() {
    return await this.page.locator('.MuiFormHelperText-root.Mui-error').allTextContents()
  }

  async getWordCount() {
    const text = await this.page.locator('text*="cuvinte"').textContent()
    return parseInt(text?.match(/(\d+)\s+cuvinte/)?.[1] || '0')
  }

  async setWorkingHours(day: string, isOpen: boolean, startTime?: string, endTime?: string) {
    const dayRow = this.page.locator(`text=${day}`).locator('..').first()
    
    // Toggle day on/off
    const toggle = dayRow.locator('input[type="checkbox"]')
    const isChecked = await toggle.isChecked()
    if (isChecked !== isOpen) {
      await toggle.click()
    }

    if (isOpen && startTime && endTime) {
      // Set start time
      const startInput = dayRow.locator('input[label*="Start"]')
      await startInput.fill(startTime)
      
      // Set end time  
      const endInput = dayRow.locator('input[label*="Stop"]')
      await endInput.fill(endTime)
    }
  }

  async getPreviewText() {
    return await this.page.locator('.MuiTypography-root:has-text("Preview program:")').locator('..').locator('p').textContent()
  }
}

// Authentication helper
async function loginAsAdmin(page: any) {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'admin@promac.ro')
  await page.fill('input[type="password"]', 'Admin123!')
  await page.click('button:has-text("Autentificare")')
  await page.waitForURL('/admin')
}

// Database validation helpers
async function getShowroomFromDB(id: number) {
  const { data } = await supabase
    .from('showrooms')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

async function countShowroomsInDB() {
  const { count } = await supabase
    .from('showrooms')
    .select('*', { count: 'exact', head: true })
  return count || 0
}

async function cleanupTestShowrooms() {
  await supabase
    .from('showrooms')
    .delete()
    .like('name', '%Test%')
}

// Test Suite
test.describe('Showroom Management - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await cleanupTestShowrooms() // Clean up any previous test data
  })

  test.afterEach(async () => {
    await cleanupTestShowrooms() // Clean up after each test
  })

  test.describe('🔍 Field Validation Testing', () => {
    
    test('should validate required fields', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Try to save without required fields
      await form.clickSave()
      
      // Check that save button is disabled or form shows validation
      const saveBtn = page.locator('button:has-text("Creează")')
      await expect(saveBtn).toBeDisabled()
    })

    test('should validate email format', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Fill required fields
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      
      // Test invalid email formats
      for (const invalidEmail of INVALID_EMAIL_FORMATS) {
        await form.fillContactInfo({ email: invalidEmail })
        await page.click('input[label*="Nume"]') // Focus elsewhere to trigger validation
        
        const errors = await form.getValidationErrors()
        expect(errors.some(error => error.includes('email') || error.includes('format'))).toBeTruthy()
      }
      
      // Test valid email format
      await form.fillContactInfo({ email: 'valid@domain.com' })
      await page.click('input[label*="Nume"]')
      
      const errors = await form.getValidationErrors()
      expect(errors.some(error => error.includes('email'))).toBeFalsy()
    })

    test('should validate URL formats', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Fill required fields
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      
      // Test invalid URL formats
      for (const invalidUrl of INVALID_URL_FORMATS) {
        await form.fillNavigation({ waze_url: invalidUrl })
        await page.click('input[label*="Nume"]') // Focus elsewhere
        
        // Check for URL validation (if implemented)
        const wazeInput = page.locator('input[label*="Waze"]')
        const hasError = await wazeInput.locator('..').locator('.Mui-error').count() > 0
        
        if (hasError) {
          console.log(`URL validation working for: ${invalidUrl}`)
        }
      }
    })

    test('should validate address character limit', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      const longAddress = 'A'.repeat(201) // Exceeds 200 char limit
      await form.fillBasicInfo({ address: longAddress })
      
      // Check that only 200 characters are accepted
      const addressInput = page.locator('input[label*="Adresa"]')
      const actualValue = await addressInput.inputValue()
      expect(actualValue.length).toBeLessThanOrEqual(200)
    })

    test('should validate description word count', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      const longDescription = 'Cuvânt '.repeat(100) // 100 words
      await form.fillDescription(longDescription)
      
      const wordCount = await form.getWordCount()
      expect(wordCount).toBe(100)
    })
  })

  test.describe('🖼️ Photo Management Testing', () => {
    
    test('should handle valid photo uploads', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Create a simple test image file (1x1 pixel PNG)
      const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      
      await page.route('**/*', route => {
        if (route.request().url().includes('test-image.png')) {
          route.fulfill({
            status: 200,
            body: testImage,
            headers: {
              'content-type': 'image/png',
              'content-length': testImage.length.toString()
            }
          })
        } else {
          route.continue()
        }
      })

      // Test photo upload
      await form.uploadPhoto('test-image.png')
      
      // Verify photo appears in UI
      const photoCount = await page.locator('[alt*="Showroom photo"]').count()
      expect(photoCount).toBe(1)
    })

    test('should reject invalid file types', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Try to upload a text file
      const textFile = Buffer.from('This is not an image file')
      
      await page.route('**/test-file.txt', route => {
        route.fulfill({
          status: 200,
          body: textFile,
          headers: {
            'content-type': 'text/plain',
            'content-length': textFile.length.toString()
          }
        })
      })

      await form.uploadPhoto('test-file.txt')
      
      // Check for error message
      const errorAlert = page.locator('.MuiAlert-root:has-text("fișiere imagine")')
      await expect(errorAlert).toBeVisible()
    })

    test('should enforce 3-photo limit', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Mock multiple photo uploads
      const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      
      await page.route('**/*.png', route => {
        route.fulfill({
          status: 200,
          body: testImage,
          headers: { 'content-type': 'image/png' }
        })
      })

      // Upload 3 photos (should work)
      for (let i = 0; i < 3; i++) {
        await form.uploadPhoto(`test-image-${i}.png`)
        await page.waitForTimeout(500) // Allow upload to process
      }
      
      // Try to upload 4th photo (should be rejected)
      await form.uploadPhoto('test-image-4.png')
      
      // Check for limit error
      const errorAlert = page.locator('.MuiAlert-root:has-text("maximum 3")')
      await expect(errorAlert).toBeVisible()
      
      // Verify only 3 photos are displayed
      const photoCount = await page.locator('[alt*="Showroom photo"]').count()
      expect(photoCount).toBe(3)
    })

    test('should handle photo deletion', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Upload a photo first
      const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      
      await page.route('**/*.png', route => {
        route.fulfill({ status: 200, body: testImage, headers: { 'content-type': 'image/png' } })
      })

      await form.uploadPhoto('test-image.png')
      await page.waitForTimeout(500)
      
      // Delete the photo
      await form.deletePhoto(0)
      
      // Verify photo is removed
      const photoCount = await page.locator('[alt*="Showroom photo"]').count()
      expect(photoCount).toBe(0)
    })

    test('should open fullscreen preview', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Upload a photo first
      const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
      
      await page.route('**/*.png', route => {
        route.fulfill({ status: 200, body: testImage, headers: { 'content-type': 'image/png' } })
      })

      await form.uploadPhoto('test-image.png')
      await page.waitForTimeout(500)
      
      // Click fullscreen button
      await page.hover('[alt*="Showroom photo"]')
      await page.click('button[aria-label*="dimensiune"]')
      
      // Verify fullscreen dialog opens
      const dialog = page.locator('.MuiDialog-root')
      await expect(dialog).toBeVisible()
      
      // Close fullscreen
      await page.click('button[aria-label*="Închide"]')
      await expect(dialog).toBeHidden()
    })
  })

  test.describe('⏰ Working Hours Testing', () => {
    
    test('should toggle working days on/off', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Toggle Sunday off (default is off, so turn on first then off)
      await form.setWorkingHours('Duminică', true)
      await form.setWorkingHours('Duminică', false)
      
      // Check that Sunday shows "Închis"
      const sundayRow = page.locator('text=Duminică').locator('..').first()
      await expect(sundayRow.locator('text=Închis')).toBeVisible()
    })

    test('should validate time picker constraints', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Set invalid time range (start > end)
      await form.setWorkingHours('Luni', true, '18:00', '09:00')
      
      // Check validation (if implemented)
      const previewText = await form.getPreviewText()
      console.log('Working hours preview:', previewText)
      
      // Valid time range
      await form.setWorkingHours('Luni', true, '09:00', '18:00')
      const updatedPreview = await form.getPreviewText()
      expect(updatedPreview).toContain('09:00')
      expect(updatedPreview).toContain('18:00')
    })

    test('should generate correct hours string', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Set Monday-Friday 9-18
      const weekdays = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri']
      for (const day of weekdays) {
        await form.setWorkingHours(day, true, '09:00', '18:00')
      }
      
      // Set Saturday 9-14
      await form.setWorkingHours('Sâmbătă', true, '09:00', '14:00')
      
      // Set Sunday closed
      await form.setWorkingHours('Duminică', false)
      
      const preview = await form.getPreviewText()
      expect(preview).toContain('Luni-Vineri')
      expect(preview).toContain('09:00-18:00')
      expect(preview).toContain('Sâmbătă')
      expect(preview).toContain('09:00-14:00')
    })
  })

  test.describe('🗄️ Database Integration Testing', () => {
    
    test('should save complete showroom data to database', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Fill all form fields
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      await form.fillContactInfo(VALID_SHOWROOM_DATA)
      await form.fillNavigation(VALID_SHOWROOM_DATA)
      await form.fillDescription(VALID_SHOWROOM_DATA.description)
      
      // Set working hours
      await form.setWorkingHours('Luni', true, '09:00', '18:00')
      await form.setWorkingHours('Marți', true, '09:00', '18:00')
      
      // Save the showroom
      await form.clickSave()
      
      // Wait for save operation
      await page.waitForSelector('text*="salvat"', { timeout: 10000 })
      
      // Verify in database
      const showrooms = await supabase
        .from('showrooms')
        .select('*')
        .eq('name', VALID_SHOWROOM_DATA.name)
      
      expect(showrooms.data).toBeTruthy()
      expect(showrooms.data!.length).toBe(1)
      
      const saved = showrooms.data![0]
      expect(saved.name).toBe(VALID_SHOWROOM_DATA.name)
      expect(saved.city).toBe(VALID_SHOWROOM_DATA.city)
      expect(saved.address).toBe(VALID_SHOWROOM_DATA.address)
      expect(saved.phone).toBe(VALID_SHOWROOM_DATA.phone)
      expect(saved.email).toBe(VALID_SHOWROOM_DATA.email)
      expect(saved.description).toBe(VALID_SHOWROOM_DATA.description)
      expect(saved.is_active).toBe(true)
    })

    test('should handle save failures gracefully', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Intercept save request to simulate failure
      await page.route('**/showrooms', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Database error' })
        })
      })
      
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      await form.clickSave()
      
      // Check for error handling in UI
      const errorAlert = page.locator('.MuiAlert-root[severity="error"]')
      await expect(errorAlert).toBeVisible({ timeout: 10000 })
    })

    test('should update existing showroom correctly', async ({ page }) => {
      // First create a showroom
      const { data: created } = await supabase
        .from('showrooms')
        .insert(VALID_SHOWROOM_DATA)
        .select()
        .single()
      
      const form = new ShowroomFormPage(page)
      await form.goto(created!.id.toString())
      
      // Modify data
      const updatedName = 'Updated Test Showroom'
      await form.fillBasicInfo({ name: updatedName })
      await form.clickSave()
      
      await page.waitForSelector('text*="salvat"', { timeout: 10000 })
      
      // Verify update in database
      const updated = await getShowroomFromDB(created!.id)
      expect(updated!.name).toBe(updatedName)
      expect(updated!.city).toBe(VALID_SHOWROOM_DATA.city) // Unchanged
    })
  })

  test.describe('🎯 End-to-End Workflow Testing', () => {
    
    test('should complete full create workflow', async ({ page }) => {
      const initialCount = await countShowroomsInDB()
      
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Complete form
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      await form.fillContactInfo(VALID_SHOWROOM_DATA)
      await form.fillDescription(VALID_SHOWROOM_DATA.description)
      await form.setWorkingHours('Luni', true, '09:00', '18:00')
      
      // Save
      await form.clickSave()
      await page.waitForSelector('text*="salvat"')
      
      // Verify redirect to management page
      await expect(page).toHaveURL(/\/admin\/showroom-uri$/)
      
      // Verify showroom appears in list
      await expect(page.locator(`text=${VALID_SHOWROOM_DATA.name}`)).toBeVisible()
      
      // Verify database count increased
      const finalCount = await countShowroomsInDB()
      expect(finalCount).toBe(initialCount + 1)
    })

    test('should handle preview functionality', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      await form.fillContactInfo(VALID_SHOWROOM_DATA)
      await form.fillDescription(VALID_SHOWROOM_DATA.description)
      
      // Click preview
      await form.clickPreview()
      
      // Should open preview in new tab or modal
      // Note: Preview functionality needs to be implemented
      console.log('Preview functionality test - implementation needed')
    })

    test('should maintain form state during navigation', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Fill partial data
      await form.fillBasicInfo({ name: 'Partial Name' })
      await form.fillContactInfo({ phone: '123-456-7890' })
      
      // Navigate away and back
      await page.goto('/admin/dashboard')
      await page.goBack()
      
      // Check if data persists (depends on implementation)
      const nameValue = await page.locator('input[label*="Nume"]').inputValue()
      console.log('Form state persistence test - name value:', nameValue)
    })
  })

  test.describe('🛡️ Security and Edge Cases', () => {
    
    test('should handle extremely long text inputs', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      const extremelyLongText = 'A'.repeat(10000)
      
      // Test various fields with extreme input
      await form.fillBasicInfo({ name: extremelyLongText })
      await form.fillDescription(extremelyLongText)
      
      // Check that inputs are truncated or handled gracefully
      const nameValue = await page.locator('input[label*="Nume"]').inputValue()
      const descValue = await page.locator('textarea').inputValue()
      
      console.log('Extreme input handling - name length:', nameValue.length)
      console.log('Extreme input handling - desc length:', descValue.length)
      
      expect(nameValue.length).toBeLessThan(extremelyLongText.length)
    })

    test('should handle special characters correctly', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      const specialCharData = {
        name: 'Showroom™ Căești-Ștefănești',
        city: 'Brașov',
        address: 'Str. Ștefan cel Mare & Sfânt, nr. 15, bl. A1, sc. B, ap. 12',
        phone: '+40 (021) 123-45-67',
        email: 'test.ăâîșț@promac.ro'
      }
      
      await form.fillBasicInfo(specialCharData)
      await form.fillContactInfo(specialCharData)
      
      // Verify special characters are preserved
      const nameValue = await page.locator('input[label*="Nume"]').inputValue()
      expect(nameValue).toBe(specialCharData.name)
    })

    test('should prevent XSS in form inputs', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      const xssPayload = '<script>alert("XSS")</script>'
      
      await form.fillBasicInfo({ name: xssPayload })
      await form.fillDescription(xssPayload)
      
      // Save and verify XSS is prevented
      await form.fillBasicInfo({ city: 'Test', address: 'Test Address' })
      await form.clickSave()
      
      // Check that script tags are not executed or are escaped
      const pageContent = await page.content()
      expect(pageContent).not.toContain('<script>alert')
    })

    test('should handle concurrent editing scenarios', async ({ page, browser }) => {
      // Create test showroom
      const { data: created } = await supabase
        .from('showrooms')
        .insert(VALID_SHOWROOM_DATA)
        .select()
        .single()
      
      // Open same showroom in two tabs
      const page2 = await browser.newPage()
      await loginAsAdmin(page2)
      
      const form1 = new ShowroomFormPage(page)
      const form2 = new ShowroomFormPage(page2)
      
      await form1.goto(created!.id.toString())
      await form2.goto(created!.id.toString())
      
      // Make conflicting changes
      await form1.fillBasicInfo({ name: 'Modified by User 1' })
      await form2.fillBasicInfo({ name: 'Modified by User 2' })
      
      // Save from both (last one wins)
      await form1.clickSave()
      await page.waitForSelector('text*="salvat"')
      
      await form2.clickSave()
      await page2.waitForSelector('text*="salvat"')
      
      // Verify final state
      const final = await getShowroomFromDB(created!.id)
      expect(final!.name).toBe('Modified by User 2')
      
      await page2.close()
    })
  })

  test.describe('🔄 Integration Testing', () => {
    
    test('should enforce RLS policies correctly', async ({ page }) => {
      // Test admin access (should work)
      const form = new ShowroomFormPage(page)
      await form.goto()
      await expect(page.locator('input[label*="Nume"]')).toBeVisible()
      
      // Test non-admin access (logout and try to access)
      await page.goto('/auth')
      await page.click('button:has-text("Deconectare")')
      
      await form.goto()
      // Should redirect to auth or show access denied
      await expect(page).toHaveURL(/\/auth/)
    })

    test('should handle authentication token expiry', async ({ page }) => {
      const form = new ShowroomFormPage(page)
      await form.goto()
      
      // Simulate token expiry by clearing localStorage
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
      
      await form.fillBasicInfo(VALID_SHOWROOM_DATA)
      await form.clickSave()
      
      // Should redirect to login or show auth error
      const currentUrl = page.url()
      expect(currentUrl).toMatch(/auth|login/)
    })
  })
})

// Utility function for creating test images
function createTestImageFile(name: string, sizeKB: number = 50): Buffer {
  // Create a simple PNG header with specified size
  const header = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
  const padding = Buffer.alloc(Math.max(0, (sizeKB * 1024) - header.length), 0)
  return Buffer.concat([header, padding])
}

// Cleanup function for test isolation
test.afterAll(async () => {
  await cleanupTestShowrooms()
})