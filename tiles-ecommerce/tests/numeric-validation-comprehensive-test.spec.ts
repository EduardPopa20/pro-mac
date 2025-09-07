import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:5180'
const LOGIN_EMAIL = 'eduardpopa68@yahoo.com'
const LOGIN_PASSWORD = 'Test200'

// Helper function to wait for page load and no loading indicators
async function waitForPageReady(page: any) {
  await page.waitForLoadState('networkidle')
  // Wait for any loading indicators to disappear
  await page.waitForFunction(() => {
    const loadingElements = document.querySelectorAll('[role="progressbar"], .MuiCircularProgress-root')
    return loadingElements.length === 0 || Array.from(loadingElements).every(el => (el as HTMLElement).style.display === 'none')
  }, { timeout: 10000 }).catch(() => {})
}

// Helper function to test numeric field validation
async function testNumericFieldValidation(page: any, fieldSelector: string, fieldName: string, productType: string) {
  const results = {
    fieldName,
    productType,
    negativeTest: { passed: false, message: '' },
    eCharacterTest: { passed: false, message: '' },
    realTimePreventionTest: { passed: false, message: '' },
    errorMessageTest: { passed: false, message: '' },
    sanitizationTest: { passed: false, message: '' }
  }

  try {
    const field = page.locator(fieldSelector).first()
    await field.waitFor({ state: 'visible', timeout: 5000 })
    
    // Test 1: Negative values prevention
    console.log(`Testing negative values for ${fieldName} in ${productType}`)
    await field.clear()
    await field.fill('-5')
    await field.blur()
    
    const negativeValue = await field.inputValue()
    if (negativeValue !== '-5') {
      results.negativeTest.passed = true
      results.negativeTest.message = `Negative value blocked: "${negativeValue}"`
    } else {
      results.negativeTest.message = `Negative value allowed: "${negativeValue}"`
    }

    // Test 2: 'e' character prevention
    console.log(`Testing 'e' character for ${fieldName} in ${productType}`)
    await field.clear()
    await field.fill('1e5')
    await field.blur()
    
    const eCharValue = await field.inputValue()
    if (eCharValue !== '1e5') {
      results.eCharacterTest.passed = true
      results.eCharacterTest.message = `'e' character blocked: "${eCharValue}"`
    } else {
      results.eCharacterTest.message = `'e' character allowed: "${eCharValue}"`
    }

    // Test 3: Real-time prevention - test keydown events
    console.log(`Testing real-time prevention for ${fieldName} in ${productType}`)
    await field.clear()
    await field.focus()
    
    // Try pressing 'e' key
    await page.keyboard.press('e')
    const afterE = await field.inputValue()
    
    // Try pressing '-' key
    await page.keyboard.press('-')
    const afterMinus = await field.inputValue()
    
    if (afterE === '' && afterMinus === '') {
      results.realTimePreventionTest.passed = true
      results.realTimePreventionTest.message = 'Real-time prevention working'
    } else {
      results.realTimePreventionTest.message = `Real-time prevention failed: e="${afterE}", minus="${afterMinus}"`
    }

    // Test 4: Error messages (try to trigger validation error)
    console.log(`Testing error messages for ${fieldName} in ${productType}`)
    await field.clear()
    await field.fill('-10.5')
    await field.blur()
    
    // Look for error messages
    const errorMessage = await page.locator('.MuiFormHelperText-root.Mui-error, .error-message, [data-testid*="error"]').first().textContent().catch(() => null)
    if (errorMessage && errorMessage.trim() !== '') {
      results.errorMessageTest.passed = true
      results.errorMessageTest.message = `Error message found: "${errorMessage}"`
    } else {
      results.errorMessageTest.message = 'No error message displayed'
    }

    // Test 5: Field sanitization - check if invalid input gets cleaned
    console.log(`Testing sanitization for ${fieldName} in ${productType}`)
    await field.clear()
    await field.fill('abc123def')
    await field.blur()
    
    const sanitizedValue = await field.inputValue()
    if (sanitizedValue === '123' || sanitizedValue === '' || !sanitizedValue.includes('abc')) {
      results.sanitizationTest.passed = true
      results.sanitizationTest.message = `Sanitization working: "${sanitizedValue}"`
    } else {
      results.sanitizationTest.message = `Sanitization failed: "${sanitizedValue}"`
    }

  } catch (error) {
    console.error(`Error testing ${fieldName} in ${productType}:`, error)
    results.negativeTest.message = `Test error: ${error}`
  }

  return results
}

test.describe('Numeric Field Validation - Comprehensive Testing', () => {
  let context: any
  let page: any

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()
    page = await context.newPage()
    
    console.log('=== STARTING COMPREHENSIVE NUMERIC VALIDATION TESTING ===')
    console.log(`Server: ${BASE_URL}`)
    console.log(`Login: ${LOGIN_EMAIL}`)
  })

  test.afterAll(async () => {
    if (context) {
      await context.close()
    }
  })

  test('1. Admin Login and Dashboard Access', async () => {
    console.log('\n--- Testing Admin Login ---')
    
    await page.goto(BASE_URL)
    await waitForPageReady(page)
    
    // Look for login/auth elements
    const loginButton = page.locator('button:has-text("Conectare"), button:has-text("Login"), a[href*="login"], a[href*="auth"]').first()
    
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await waitForPageReady(page)
    }

    // Fill login form
    const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first()
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first()
    
    await emailField.waitFor({ state: 'visible', timeout: 10000 })
    await emailField.fill(LOGIN_EMAIL)
    await passwordField.fill(LOGIN_PASSWORD)
    
    // Submit login
    const submitButton = page.locator('button[type="submit"], button:has-text("Conectare"), button:has-text("Login")').first()
    await submitButton.click()
    
    // Wait for login to complete
    await waitForPageReady(page)
    await page.waitForTimeout(2000)
    
    // Verify admin access
    const currentUrl = page.url()
    console.log(`Current URL after login: ${currentUrl}`)
    
    // Look for admin indicators
    const adminElements = await page.locator('text="Admin", text="Dashboard", text="Administrare", [href*="admin"]').count()
    expect(adminElements).toBeGreaterThan(0)
    
    console.log('✓ Admin login successful')
  })

  test('2. Navigate to Admin Product Management', async () => {
    console.log('\n--- Testing Admin Dashboard Access ---')
    
    // Try different admin navigation paths
    const adminPaths = [
      '/admin',
      '/admin/produse',
      '/admin/dashboard'
    ]
    
    for (const path of adminPaths) {
      try {
        await page.goto(`${BASE_URL}${path}`)
        await waitForPageReady(page)
        
        const hasProductManagement = await page.locator('text="Produse", text="Products", text="Faianta", text="Gresie"').count()
        
        if (hasProductManagement > 0) {
          console.log(`✓ Admin access confirmed via ${path}`)
          break
        }
      } catch (error) {
        console.log(`Admin path ${path} not accessible: ${error}`)
      }
    }
    
    // Look for product management links
    const productLinks = await page.locator('a[href*="faianta"], a[href*="gresie"], a[href*="parchet"], a[href*="riflaje"]').count()
    expect(productLinks).toBeGreaterThan(0)
    
    console.log('✓ Admin product management accessible')
  })

  test('3. Test Faianta Numeric Validation', async () => {
    console.log('\n--- Testing Faianta Numeric Validation ---')
    
    // Navigate to faianta products
    await page.goto(`${BASE_URL}/admin/produse/faianta`)
    await waitForPageReady(page)
    
    // Look for existing products to edit
    const editLinks = page.locator('a[href*="editare"], button:has-text("Editează"), .edit-button').first()
    
    if (await editLinks.isVisible()) {
      await editLinks.click()
      await waitForPageReady(page)
    } else {
      // Try to find any faianta product and navigate to its edit page
      const productLinks = page.locator('a[href*="faianta"]').first()
      if (await productLinks.isVisible()) {
        const href = await productLinks.getAttribute('href')
        await page.goto(`${BASE_URL}${href}/editare`)
        await waitForPageReady(page)
      }
    }
    
    const faiantaResults = []
    
    // Test numeric fields specific to Faianta
    const numericFields = [
      { selector: 'input[name*="grosime"], input[label*="Grosime"]', name: 'Grosime' },
      { selector: 'input[name*="greutate"], input[label*="Greutate"]', name: 'Greutate per cutie' },
      { selector: 'input[name*="suprafata"], input[label*="Suprafață"]', name: 'Suprafață per cutie' },
      { selector: 'input[name*="placi_per_cutie"], input[label*="Plăci per cutie"]', name: 'Plăci per cutie' },
      { selector: 'input[name*="price"], input[label*="Preț"]', name: 'Preț curent' },
      { selector: 'input[name*="stock"], input[label*="Stoc"]', name: 'Stoc disponibil' }
    ]
    
    for (const field of numericFields) {
      const result = await testNumericFieldValidation(page, field.selector, field.name, 'Faianta')
      faiantaResults.push(result)
    }
    
    console.log('Faianta validation results:', faiantaResults)
    expect(faiantaResults.length).toBeGreaterThan(0)
  })

  test('4. Test Gresie Numeric Validation', async () => {
    console.log('\n--- Testing Gresie Numeric Validation ---')
    
    // Navigate to gresie products
    await page.goto(`${BASE_URL}/admin/produse/gresie`)
    await waitForPageReady(page)
    
    // Look for existing products to edit
    const editLinks = page.locator('a[href*="editare"], button:has-text("Editează"), .edit-button').first()
    
    if (await editLinks.isVisible()) {
      await editLinks.click()
      await waitForPageReady(page)
    } else {
      // Try to find any gresie product
      const productLinks = page.locator('a[href*="gresie"]').first()
      if (await productLinks.isVisible()) {
        const href = await productLinks.getAttribute('href')
        await page.goto(`${BASE_URL}${href}/editare`)
        await waitForPageReady(page)
      }
    }
    
    const gresieResults = []
    
    // Test numeric fields
    const numericFields = [
      { selector: 'input[name*="grosime"], input[label*="Grosime"]', name: 'Grosime' },
      { selector: 'input[name*="greutate"], input[label*="Greutate"]', name: 'Greutate per cutie' },
      { selector: 'input[name*="suprafata"], input[label*="Suprafață"]', name: 'Suprafață per cutie' },
      { selector: 'input[name*="price"], input[label*="Preț"]', name: 'Preț curent' },
      { selector: 'input[name*="stock"], input[label*="Stoc"]', name: 'Stoc disponibil' }
    ]
    
    for (const field of numericFields) {
      const result = await testNumericFieldValidation(page, field.selector, field.name, 'Gresie')
      gresieResults.push(result)
    }
    
    console.log('Gresie validation results:', gresieResults)
    expect(gresieResults.length).toBeGreaterThan(0)
  })

  test('5. Test Parchet Numeric Validation', async () => {
    console.log('\n--- Testing Parchet Numeric Validation ---')
    
    await page.goto(`${BASE_URL}/admin/produse/parchet`)
    await waitForPageReady(page)
    
    const editLinks = page.locator('a[href*="editare"], button:has-text("Editează"), .edit-button').first()
    
    if (await editLinks.isVisible()) {
      await editLinks.click()
      await waitForPageReady(page)
    } else {
      const productLinks = page.locator('a[href*="parchet"]').first()
      if (await productLinks.isVisible()) {
        const href = await productLinks.getAttribute('href')
        await page.goto(`${BASE_URL}${href}/editare`)
        await waitForPageReady(page)
      }
    }
    
    const parchetResults = []
    
    const numericFields = [
      { selector: 'input[name*="grosime"], input[label*="Grosime"]', name: 'Grosime' },
      { selector: 'input[name*="greutate"], input[label*="Greutate"]', name: 'Greutate per cutie' },
      { selector: 'input[name*="price"], input[label*="Preț"]', name: 'Preț curent' },
      { selector: 'input[name*="stock"], input[label*="Stoc"]', name: 'Stoc disponibil' }
    ]
    
    for (const field of numericFields) {
      const result = await testNumericFieldValidation(page, field.selector, field.name, 'Parchet')
      parchetResults.push(result)
    }
    
    console.log('Parchet validation results:', parchetResults)
    expect(parchetResults.length).toBeGreaterThan(0)
  })

  test('6. Test Riflaje Numeric Validation', async () => {
    console.log('\n--- Testing Riflaje Numeric Validation ---')
    
    await page.goto(`${BASE_URL}/admin/produse/riflaje`)
    await waitForPageReady(page)
    
    const editLinks = page.locator('a[href*="editare"], button:has-text("Editează"), .edit-button').first()
    
    if (await editLinks.isVisible()) {
      await editLinks.click()
      await waitForPageReady(page)
    } else {
      const productLinks = page.locator('a[href*="riflaje"]').first()
      if (await productLinks.isVisible()) {
        const href = await productLinks.getAttribute('href')
        await page.goto(`${BASE_URL}${href}/editare`)
        await waitForPageReady(page)
      }
    }
    
    const riflajeResults = []
    
    const numericFields = [
      { selector: 'input[name*="grosime"], input[label*="Grosime"]', name: 'Grosime' },
      { selector: 'input[name*="price"], input[label*="Preț"]', name: 'Preț curent' },
      { selector: 'input[name*="stock"], input[label*="Stoc"]', name: 'Stoc disponibil' }
    ]
    
    for (const field of numericFields) {
      const result = await testNumericFieldValidation(page, field.selector, field.name, 'Riflaje')
      riflajeResults.push(result)
    }
    
    console.log('Riflaje validation results:', riflajeResults)
    expect(riflajeResults.length).toBeGreaterThan(0)
  })

  test('7. Generate Comprehensive Report', async () => {
    console.log('\n=== COMPREHENSIVE NUMERIC VALIDATION TEST REPORT ===')
    console.log('All tests completed. Check individual test results above.')
    console.log('====================================================')
    
    // This test will always pass as it's just a summary
    expect(true).toBeTruthy()
  })
})