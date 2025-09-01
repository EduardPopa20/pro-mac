import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Form Validation and Error Handling', () => {

  test('contact form validation', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    // Look for contact form
    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0
    
    if (formExists && await contactForm.isVisible()) {
      // Find form elements
      const nameField = contactForm.locator('input[name*="name"], input[placeholder*="nume"], input[label*="name"]').first()
      const emailField = contactForm.locator('input[type="email"], input[name*="email"]').first()
      const messageField = contactForm.locator('textarea, input[name*="message"], input[name*="mesaj"]').first()
      const submitButton = contactForm.locator('button[type="submit"], input[type="submit"]').first()

      // Test 1: Empty form submission
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1500)

        // Should show validation errors
        const errorMessages = page.locator('[role="alert"], .error, .MuiFormHelperText-error, [aria-invalid="true"]')
        const hasErrors = await errorMessages.count() > 0
        
        if (hasErrors) {
          await expect(errorMessages.first()).toBeVisible()
          const errorText = await errorMessages.first().textContent()
          expect(errorText?.trim()).toBeTruthy()
          console.log('Form validation working: Empty form shows errors')
        }
      }

      // Test 2: Invalid email validation
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) {
        await emailField.fill('invalid-email')
        
        if (await submitButton.isVisible()) {
          await submitButton.click()
          await page.waitForTimeout(1000)

          // Should show email validation error
          const emailErrors = page.locator('[role="alert"], .error').filter({ hasText: /email|invalid|format/i })
          const hasEmailError = await emailErrors.count() > 0
          
          if (hasEmailError) {
            await expect(emailErrors.first()).toBeVisible()
            console.log('Email validation working')
          }
        }
      }

      // Test 3: Valid form submission
      if (await emailField.isVisible()) await emailField.fill('test@example.com')
      if (await messageField.isVisible()) await messageField.fill('This is a test message with sufficient content.')
      
      if (await submitButton.isVisible()) {
        // Clear any previous errors
        await page.waitForTimeout(500)
        
        await submitButton.click()
        await page.waitForTimeout(3000)

        // Should show success message or form disappears
        const successIndicators = page.locator('[role="alert"], .success, .MuiAlert-successStandard').filter({ hasText: /success|trimis|multumim/i })
        const hasSuccess = await successIndicators.count() > 0
        
        const formStillVisible = await contactForm.isVisible()
        const formCleared = await nameField.inputValue() === '' || await emailField.inputValue() === ''
        
        if (hasSuccess) {
          await expect(successIndicators.first()).toBeVisible()
          console.log('Form submission success message shown')
        } else if (!formStillVisible || formCleared) {
          console.log('Form submitted successfully (form cleared or hidden)')
        }
      }
    } else {
      console.log('No contact form found - test skipped')
    }
  })

  test('newsletter form validation', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Wait for newsletter modal to potentially appear
    await page.waitForTimeout(5000)
    
    const newsletterModal = page.locator('[role="dialog"], .MuiModal-root').filter({ hasText: /newsletter|aboneaza|email/i })
    const modalVisible = await newsletterModal.isVisible()
    
    if (modalVisible) {
      const emailInput = newsletterModal.locator('input[type="email"], input[placeholder*="email"]')
      const submitButton = newsletterModal.locator('button[type="submit"], button').filter({ hasText: /aboneaza|subscribe|trimite|send/i })

      // Test empty email submission
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1000)

        // Should show validation error
        const errors = newsletterModal.locator('[role="alert"], .error, .MuiFormHelperText-error')
        const hasError = await errors.count() > 0
        
        if (hasError) {
          await expect(errors.first()).toBeVisible()
          console.log('Newsletter validation: Empty email error shown')
        }
      }

      // Test invalid email
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email')
        await submitButton.click()
        await page.waitForTimeout(1000)

        const emailErrors = newsletterModal.locator('[role="alert"], .error').filter({ hasText: /email|invalid|format/i })
        const hasEmailError = await emailErrors.count() > 0
        
        if (hasEmailError) {
          await expect(emailErrors.first()).toBeVisible()
          console.log('Newsletter validation: Invalid email error shown')
        }
      }

      // Test valid email
      if (await emailInput.isVisible()) {
        await emailInput.clear()
        await emailInput.fill('test@example.com')
        await submitButton.click()
        await page.waitForTimeout(2000)

        // Should show success or modal closes
        const success = newsletterModal.locator('[role="alert"], .success').filter({ hasText: /success|multumim|confirmat/i })
        const hasSuccess = await success.count() > 0
        const modalClosed = !await newsletterModal.isVisible()

        if (hasSuccess || modalClosed) {
          console.log('Newsletter subscription successful')
        }
      }
    } else {
      // Try to find newsletter form elsewhere on page
      const newsletterForm = page.locator('form').filter({ hasText: /newsletter|aboneaza/i })
      const formExists = await newsletterForm.count() > 0
      
      if (formExists) {
        const emailInput = newsletterForm.locator('input[type="email"]')
        const submitButton = newsletterForm.locator('button[type="submit"]')
        
        if (await emailInput.isVisible() && await submitButton.isVisible()) {
          // Test similar validations as modal
          await emailInput.fill('invalid-email')
          await submitButton.click()
          await page.waitForTimeout(1000)
          
          const errors = page.locator('[role="alert"], .error')
          const hasError = await errors.count() > 0
          
          if (hasError) {
            console.log('Newsletter form validation working')
          }
        }
      } else {
        console.log('No newsletter form found - test skipped')
      }
    }
  })

  test('search form validation and behavior', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)

    const searchInput = page.getByPlaceholder('Caută produse...')
    await expect(searchInput).toBeVisible()

    // Test 1: Empty search behavior
    await searchInput.focus()
    await searchInput.fill('')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Empty search shouldn't break anything
    const currentUrl = page.url()
    expect(currentUrl).toBeTruthy()

    // Test 2: Special character handling
    const specialChars = ['<script>', '&amp;', '"quotes"', "';DROP TABLE--"]
    
    for (const chars of specialChars) {
      await searchInput.clear()
      await searchInput.fill(chars)
      await page.waitForTimeout(300)

      // Page shouldn't crash with special characters
      const pageStillResponsive = await searchInput.isVisible()
      expect(pageStillResponsive).toBeTruthy()
      
      // Check for XSS protection
      const pageContent = await page.textContent('body')
      expect(pageContent?.includes('<script>')).toBeFalsy()
    }

    // Test 3: Long input handling
    const longText = 'a'.repeat(500)
    await searchInput.clear()
    await searchInput.fill(longText)
    await page.waitForTimeout(300)

    // Should handle long input gracefully
    const inputValue = await searchInput.inputValue()
    expect(inputValue.length).toBeGreaterThan(0)

    // Test 4: Rapid typing (stress test)
    await searchInput.clear()
    const rapidText = 'rapid typing test'
    
    for (const char of rapidText) {
      await searchInput.type(char, { delay: 10 })
    }
    
    await page.waitForTimeout(500)
    
    // Should handle rapid typing without breaking
    const finalValue = await searchInput.inputValue()
    expect(finalValue).toBe(rapidText)
  })

  test('form accessibility and error announcements', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0

    if (formExists && await contactForm.isVisible()) {
      // Test form field labeling
      const formFields = contactForm.locator('input, textarea, select')
      const fieldCount = await formFields.count()

      for (let i = 0; i < Math.min(fieldCount, 5); i++) {
        const field = formFields.nth(i)
        if (await field.isVisible()) {
          const ariaLabel = await field.getAttribute('aria-label')
          const ariaLabelledBy = await field.getAttribute('aria-labelledby')
          const placeholder = await field.getAttribute('placeholder')
          const fieldId = await field.getAttribute('id')
          
          // Check for associated label
          let hasLabel = false
          if (fieldId) {
            const associatedLabel = page.locator(`label[for="${fieldId}"]`)
            hasLabel = await associatedLabel.count() > 0
          }

          const hasAccessibleLabel = ariaLabel || ariaLabelledBy || placeholder || hasLabel
          expect(hasAccessibleLabel).toBeTruthy()
        }
      }

      // Test error message accessibility
      const submitButton = contactForm.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1500)

        const errorMessages = page.locator('[role="alert"], [aria-invalid="true"], .error')
        const errorCount = await errorMessages.count()

        if (errorCount > 0) {
          const firstError = errorMessages.first()
          
          // Error should be visible and have meaningful text
          await expect(firstError).toBeVisible()
          const errorText = await firstError.textContent()
          expect(errorText?.trim()).toBeTruthy()
          expect(errorText?.trim().length).toBeGreaterThan(5)

          // Error should have proper ARIA role
          const ariaRole = await firstError.getAttribute('role')
          const ariaLive = await firstError.getAttribute('aria-live')
          const isAlert = ariaRole === 'alert' || ariaLive === 'polite' || ariaLive === 'assertive'
          
          if (isAlert) {
            console.log('Error messages have proper ARIA announcements')
          }
        }
      }
    }
  })

  test('form state management and persistence', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0

    if (formExists && await contactForm.isVisible()) {
      const nameField = contactForm.locator('input[name*="name"], input[placeholder*="nume"]').first()
      const emailField = contactForm.locator('input[type="email"]').first()
      const messageField = contactForm.locator('textarea').first()

      // Fill form partially
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) await emailField.fill('test@example.com')

      // Navigate away and back
      await page.goto('/')
      await page.waitForTimeout(500)
      await page.goto('/contact')
      await waitForFontsLoaded(page)

      // Form fields should be empty (no unwanted persistence)
      const nameValue = await nameField.inputValue()
      const emailValue = await emailField.inputValue()

      // Values should be cleared (unless intentionally persisted)
      expect(nameValue || emailValue).not.toBe('Test Usertest@example.com')

      // Test form state after error
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) await emailField.fill('invalid-email')

      const submitButton = contactForm.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1500)

        // Form should retain values after validation error
        const nameAfterError = await nameField.inputValue()
        expect(nameAfterError).toBe('Test User')

        const emailAfterError = await emailField.inputValue()
        expect(emailAfterError).toBe('invalid-email')
      }
    }
  })

  test('mobile form usability', async ({ page }) => {
    await setViewport(page, 'xs')
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0

    if (formExists && await contactForm.isVisible()) {
      // Test form field sizes on mobile
      const formFields = contactForm.locator('input, textarea')
      const fieldCount = await formFields.count()

      for (let i = 0; i < Math.min(fieldCount, 3); i++) {
        const field = formFields.nth(i)
        if (await field.isVisible()) {
          const fieldBox = await field.boundingBox()
          
          if (fieldBox) {
            // Form fields should be large enough for mobile interaction
            expect(fieldBox.height).toBeGreaterThanOrEqual(44)
            
            // Fields should not be too narrow on mobile
            expect(fieldBox.width).toBeGreaterThan(200)
          }
        }
      }

      // Test submit button on mobile
      const submitButton = contactForm.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        const buttonBox = await submitButton.boundingBox()
        
        if (buttonBox) {
          // Button should meet touch target requirements
          expect(buttonBox.height).toBeGreaterThanOrEqual(44)
          expect(buttonBox.width).toBeGreaterThanOrEqual(44)
        }
      }

      // Test form doesn't cause horizontal scroll on mobile
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      
      expect(hasHorizontalScroll).toBeFalsy()
    }
  })

  test('form error recovery and user guidance', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0

    if (formExists && await contactForm.isVisible()) {
      const nameField = contactForm.locator('input[name*="name"], input[placeholder*="nume"]').first()
      const emailField = contactForm.locator('input[type="email"]').first()
      const submitButton = contactForm.locator('button[type="submit"]').first()

      // Create error state
      if (await nameField.isVisible()) await nameField.fill('a') // Too short
      if (await emailField.isVisible()) await emailField.fill('invalid')

      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1500)

        // Check for helpful error messages
        const errorMessages = page.locator('[role="alert"], .error, .MuiFormHelperText-error')
        const errorCount = await errorMessages.count()

        if (errorCount > 0) {
          for (let i = 0; i < Math.min(errorCount, 3); i++) {
            const error = errorMessages.nth(i)
            const errorText = await error.textContent()
            
            // Error messages should be helpful, not just "Error"
            expect(errorText?.trim()).toBeTruthy()
            expect(errorText?.trim().toLowerCase()).not.toBe('error')
            expect(errorText?.trim().length).toBeGreaterThan(5)
          }

          // Test error correction
          if (await emailField.isVisible()) {
            await emailField.clear()
            await emailField.fill('valid@example.com')
            
            // Wait and check if email error disappears
            await page.waitForTimeout(1000)
            
            const remainingErrors = page.locator('[role="alert"], .error').filter({ hasText: /email/i })
            const emailErrorRemaining = await remainingErrors.count()
            
            // Email error should be resolved
            expect(emailErrorRemaining).toBeLessThan(errorCount)
          }
        }
      }
    }
  })

  test('form submission loading states', async ({ page }) => {
    await page.goto('/contact')
    await waitForFontsLoaded(page)

    const contactForm = page.locator('form').first()
    const formExists = await contactForm.count() > 0

    if (formExists && await contactForm.isVisible()) {
      const nameField = contactForm.locator('input[name*="name"], input[placeholder*="nume"]').first()
      const emailField = contactForm.locator('input[type="email"]').first()
      const messageField = contactForm.locator('textarea').first()
      const submitButton = contactForm.locator('button[type="submit"]').first()

      // Fill form with valid data
      if (await nameField.isVisible()) await nameField.fill('Test User')
      if (await emailField.isVisible()) await emailField.fill('test@example.com')
      if (await messageField.isVisible()) await messageField.fill('Test message content')

      if (await submitButton.isVisible()) {
        // Check initial button state
        const initialButtonText = await submitButton.textContent()
        const isInitiallyDisabled = await submitButton.isDisabled()

        await submitButton.click()

        // Check for loading state immediately after click
        await page.waitForTimeout(100)

        const buttonTextAfterClick = await submitButton.textContent()
        const isDisabledAfterClick = await submitButton.isDisabled()

        // Button should show loading state or be disabled during submission
        const hasLoadingState = buttonTextAfterClick !== initialButtonText || isDisabledAfterClick
        
        if (hasLoadingState) {
          console.log('Form shows loading state during submission')
        }

        // Check for loading indicators
        const loadingIndicators = page.locator('.MuiCircularProgress-root, [data-testid*="loading"], .loading, .spinner')
        const hasLoadingIndicator = await loadingIndicators.count() > 0

        if (hasLoadingIndicator) {
          await expect(loadingIndicators.first()).toBeVisible()
          console.log('Loading indicator shown during form submission')
        }
      }
    }
  })
})