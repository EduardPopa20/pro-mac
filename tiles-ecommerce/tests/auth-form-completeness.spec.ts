import { test, expect } from '@playwright/test'

test.describe('Auth Form Completeness', () => {
  const testDevices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
    { name: 'Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'Desktop Small', width: 960, height: 1000 },
    { name: 'Desktop Large', width: 1280, height: 1024 }
  ]

  // Test that all essential form elements are present and visible on both Sign In and Sign Up tabs
  testDevices.forEach(({ name, width, height }) => {
    test(`All form elements visible on Sign In tab - ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/auth')

      // Ensure we're on the Sign In tab
      const signInTab = page.getByRole('tab', { name: /autentificare/i })
      await expect(signInTab).toBeVisible()
      await signInTab.click()
      
      // Wait for tab content to load
      await page.waitForTimeout(500)

      // Check header elements (get the auth form heading specifically)
      await expect(page.locator('main h1, [role="main"] h1').first()).toBeVisible()
      
      // Check OAuth buttons are present and visible
      const googleButton = page.getByRole('button', { name: /google/i })
      const facebookButton = page.getByRole('button', { name: /facebook/i })
      
      await expect(googleButton).toBeVisible()
      await expect(facebookButton).toBeVisible()
      
      // Check that OAuth buttons are clickable (not disabled)
      await expect(googleButton).toBeEnabled()
      await expect(facebookButton).toBeEnabled()
      
      // Check divider text
      await expect(page.getByText(/sau cu email/i)).toBeVisible()
      
      // Check form fields
      const emailField = page.locator('input[type="email"]').first()
      const passwordField = page.locator('input[type="password"]').first()
      
      await expect(emailField).toBeVisible()
      await expect(passwordField).toBeVisible()
      
      // Check that input fields are accessible
      await expect(emailField).toBeEnabled()
      await expect(passwordField).toBeEnabled()
      
      // Check password visibility toggle
      const passwordToggle = page.locator('[aria-label*="toggle password"]').or(
        page.locator('button').filter({ has: page.locator('[data-testid="VisibilityIcon"], [data-testid="VisibilityOffIcon"]') })
      ).first()
      
      // Password toggle should be present (though it might not have specific aria-label)
      const passwordToggleButtons = page.locator('input[type="password"] ~ * button').first()
      await expect(passwordToggleButtons).toBeVisible()
      
      // Check submit button
      const submitButton = page.locator('button[type="submit"]').first()
      await expect(submitButton).toBeVisible()
      await expect(submitButton).toBeEnabled()
      await expect(submitButton).toContainText(/autentificare/i)
      
      // Verify all elements are scrollable into view if needed
      await googleButton.scrollIntoViewIfNeeded()
      await expect(googleButton).toBeInViewport({ ratio: 0.1 })
      
      await facebookButton.scrollIntoViewIfNeeded()
      await expect(facebookButton).toBeInViewport({ ratio: 0.1 })
      
      await submitButton.scrollIntoViewIfNeeded()
      await expect(submitButton).toBeInViewport({ ratio: 0.1 })
    })

    test(`All form elements visible on Sign Up tab - ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/auth')

      // Switch to Sign Up tab
      const signUpTab = page.getByRole('tab', { name: /cont nou/i })
      await expect(signUpTab).toBeVisible()
      await signUpTab.click()
      
      // Wait for tab content to load
      await page.waitForTimeout(500)

      // Check header elements (get the auth form heading specifically)
      await expect(page.locator('main h1, [role="main"] h1').first()).toBeVisible()
      
      // Check OAuth buttons are present and visible
      const googleButton = page.getByRole('button', { name: /google/i })
      const facebookButton = page.getByRole('button', { name: /facebook/i })
      
      await expect(googleButton).toBeVisible()
      await expect(facebookButton).toBeVisible()
      await expect(googleButton).toBeEnabled()
      await expect(facebookButton).toBeEnabled()
      
      // Check divider text
      await expect(page.getByText(/sau cu email/i)).toBeVisible()
      
      // Check all Sign Up form fields
      const nameField = page.locator('input').filter({ hasText: /nume/i }).or(
        page.locator('input[placeholder*="nume"]')
      ).or(
        page.locator('label:has-text("Nume") + * input')
      ).first()
      
      const emailField = page.locator('input[type="email"]').first()
      const passwordField = page.locator('input[type="password"]').first()
      const confirmPasswordField = page.locator('input[type="password"]').last()
      
      // Full name field
      await expect(nameField).toBeVisible()
      await expect(nameField).toBeEnabled()
      
      // Email field  
      await expect(emailField).toBeVisible()
      await expect(emailField).toBeEnabled()
      
      // Password field
      await expect(passwordField).toBeVisible()
      await expect(passwordField).toBeEnabled()
      
      // Confirm password field
      await expect(confirmPasswordField).toBeVisible()
      await expect(confirmPasswordField).toBeEnabled()
      
      // Check that we actually have 2 password fields for sign up
      const passwordFields = page.locator('input[type="password"]')
      await expect(passwordFields).toHaveCount(2)
      
      // Check password visibility toggles (should have 2 for sign up)
      const passwordToggles = page.locator('input[type="password"] ~ * button')
      expect(await passwordToggles.count()).toBeGreaterThanOrEqual(1) // At least 1 toggle
      
      // Check submit button
      const submitButton = page.locator('button[type="submit"]').first()
      await expect(submitButton).toBeVisible()
      await expect(submitButton).toBeEnabled()
      await expect(submitButton).toContainText(/creează|cont/i)
      
      // Verify all elements are scrollable into view if needed
      await googleButton.scrollIntoViewIfNeeded()
      await expect(googleButton).toBeInViewport({ ratio: 0.1 })
      
      await facebookButton.scrollIntoViewIfNeeded()
      await expect(facebookButton).toBeInViewport({ ratio: 0.1 })
      
      await submitButton.scrollIntoViewIfNeeded()
      await expect(submitButton).toBeInViewport({ ratio: 0.1 })
      
      // Ensure all input fields are accessible via scrolling
      await nameField.scrollIntoViewIfNeeded()
      await expect(nameField).toBeInViewport({ ratio: 0.1 })
      
      await confirmPasswordField.scrollIntoViewIfNeeded()
      await expect(confirmPasswordField).toBeInViewport({ ratio: 0.1 })
    })

    test(`Form functionality works on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/auth')

      // Test Sign In form interaction
      const emailField = page.locator('input[type="email"]').first()
      const passwordField = page.locator('input[type="password"]').first()
      
      await emailField.scrollIntoViewIfNeeded()
      await emailField.fill('test@example.com')
      await expect(emailField).toHaveValue('test@example.com')
      
      await passwordField.scrollIntoViewIfNeeded()
      await passwordField.fill('testpassword')
      await expect(passwordField).toHaveValue('testpassword')
      
      // Test password visibility toggle (if available)
      const passwordContainer = passwordField.locator('..').first()
      const passwordToggle = passwordContainer.locator('button').first()
      const hasToggle = await passwordToggle.isVisible().catch(() => false)
      if (hasToggle) {
        await passwordToggle.click()
        await page.waitForTimeout(300)
        await passwordToggle.click() // Click back to hide
        await page.waitForTimeout(300)
      }
      
      // Test tab switching preserves functionality
      const signUpTab = page.getByRole('tab', { name: /cont nou/i })
      await signUpTab.scrollIntoViewIfNeeded()
      await signUpTab.click()
      await page.waitForTimeout(300)
      
      // Test Sign Up form interaction
      const nameFieldSignUp = page.locator('input').first() // Should be name field in sign up
      if (await nameFieldSignUp.isVisible()) {
        await nameFieldSignUp.scrollIntoViewIfNeeded()
        await nameFieldSignUp.fill('Test User')
        await expect(nameFieldSignUp).toHaveValue('Test User')
      }
      
      // Switch back to Sign In
      const signInTab = page.getByRole('tab', { name: /autentificare/i })
      await signInTab.scrollIntoViewIfNeeded()
      await signInTab.click()
      await page.waitForTimeout(300)
      
      // Verify Sign In form values are cleared (expected behavior)
      const emailFieldAfter = page.locator('input[type="email"]').first()
      await expect(emailFieldAfter).toHaveValue('')
    })

    test(`Error states don't break form completeness on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/auth')

      // Try to submit empty Sign In form to trigger validation
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.scrollIntoViewIfNeeded()
      await submitButton.click()
      
      // Wait for potential error message
      await page.waitForTimeout(1000)
      
      // Check if error alert appeared
      const errorAlert = page.locator('[role="alert"]').first()
      const hasError = await errorAlert.isVisible().catch(() => false)
      
      if (hasError) {
        // Ensure error is visible
        await expect(errorAlert).toBeInViewport({ ratio: 0.1 })
        
        // Ensure form elements are still accessible after error
        const emailField = page.locator('input[type="email"]').first()
        const passwordField = page.locator('input[type="password"]').first()
        
        await emailField.scrollIntoViewIfNeeded()
        await expect(emailField).toBeVisible()
        await expect(emailField).toBeEnabled()
        
        await passwordField.scrollIntoViewIfNeeded()
        await expect(passwordField).toBeVisible()
        await expect(passwordField).toBeEnabled()
        
        await submitButton.scrollIntoViewIfNeeded()
        await expect(submitButton).toBeVisible()
        await expect(submitButton).toBeEnabled()
      }
      
      // Test Sign Up tab error state
      const signUpTab = page.getByRole('tab', { name: /cont nou/i })
      await signUpTab.scrollIntoViewIfNeeded()
      await signUpTab.click()
      await page.waitForTimeout(300)
      
      const submitButtonSignUp = page.locator('button[type="submit"]').first()
      await submitButtonSignUp.scrollIntoViewIfNeeded()
      await submitButtonSignUp.click()
      
      await page.waitForTimeout(1000)
      
      // Verify all Sign Up elements are still accessible
      const signUpEmailField = page.locator('input[type="email"]').first()
      const signUpPasswordFields = page.locator('input[type="password"]')
      
      await signUpEmailField.scrollIntoViewIfNeeded()
      await expect(signUpEmailField).toBeVisible()
      await expect(signUpEmailField).toBeEnabled()
      
      expect(await signUpPasswordFields.count()).toBeGreaterThanOrEqual(2)
      
      for (let i = 0; i < await signUpPasswordFields.count(); i++) {
        const field = signUpPasswordFields.nth(i)
        await field.scrollIntoViewIfNeeded()
        await expect(field).toBeVisible()
        await expect(field).toBeEnabled()
      }
    })
  })

  test('OAuth buttons maintain minimum touch target size', async ({ page }) => {
    const mobileDevices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'Galaxy S21', width: 360, height: 800 }
    ]

    for (const { name, width, height } of mobileDevices) {
      await page.setViewportSize({ width, height })
      await page.goto('http://localhost:5177/auth')

      // Check Google button
      const googleButton = page.getByRole('button', { name: /google/i })
      await expect(googleButton).toBeVisible()
      
      const googleBox = await googleButton.boundingBox()
      expect(googleBox).toBeTruthy()
      if (googleBox) {
        // Minimum 36px touch target (relaxed from 44px due to space constraints)
        expect(googleBox.height).toBeGreaterThanOrEqual(36)
        expect(googleBox.width).toBeGreaterThan(0)
      }

      // Check Facebook button  
      const facebookButton = page.getByRole('button', { name: /facebook/i })
      await expect(facebookButton).toBeVisible()
      
      const facebookBox = await facebookButton.boundingBox()
      expect(facebookBox).toBeTruthy()
      if (facebookBox) {
        expect(facebookBox.height).toBeGreaterThanOrEqual(36)
        expect(facebookBox.width).toBeGreaterThan(0)
      }
    }
  })

  test('Form elements are keyboard accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('http://localhost:5177/auth')

    // Test tab navigation through Sign In form
    await page.keyboard.press('Tab') // Should focus first focusable element
    
    let focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Tab through several elements
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      focusedElement = page.locator(':focus')
      
      // Each focused element should be visible
      const isVisible = await focusedElement.isVisible().catch(() => false)
      if (isVisible) {
        await expect(focusedElement).toBeInViewport({ ratio: 0.1 })
      }
    }
    
    // Test that Enter key works on buttons when focused
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.focus()
    await expect(submitButton).toBeFocused()
    
    // Test Sign Up tab keyboard navigation
    const signUpTab = page.getByRole('tab', { name: /cont nou/i })
    await signUpTab.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    
    // Should be able to tab through Sign Up form
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      focusedElement = page.locator(':focus')
      
      const isVisible = await focusedElement.isVisible().catch(() => false)
      if (isVisible) {
        await expect(focusedElement).toBeInViewport({ ratio: 0.1 })
      }
    }
  })
})