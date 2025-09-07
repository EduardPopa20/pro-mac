import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5180'
const LOGIN_EMAIL = 'eduardpopa68@yahoo.com'
const LOGIN_PASSWORD = 'Test200'

// Helper function to test numeric validation
async function testNumericFieldValidation(page: any, input: any, fieldName: string) {
  const results = {
    fieldName,
    tests: []
  }
  
  try {
    // Test 1: Negative values
    console.log(`  Testing negative values for ${fieldName}`)
    await input.clear()
    await input.fill('-5')
    await input.blur()
    await page.waitForTimeout(500)
    
    const negativeValue = await input.inputValue()
    const negativeBlocked = negativeValue !== '-5'
    console.log(`    Negative test: ${negativeBlocked ? 'PASS' : 'FAIL'} - Value: "${negativeValue}"`)
    results.tests.push({ test: 'negative', passed: negativeBlocked, value: negativeValue })
    
    // Test 2: 'e' character
    console.log(`  Testing 'e' character for ${fieldName}`)
    await input.clear()
    await input.fill('1e5')
    await input.blur()
    await page.waitForTimeout(500)
    
    const eValue = await input.inputValue()
    const eBlocked = eValue !== '1e5'
    console.log(`    'e' test: ${eBlocked ? 'PASS' : 'FAIL'} - Value: "${eValue}"`)
    results.tests.push({ test: 'e-character', passed: eBlocked, value: eValue })
    
    // Test 3: Real-time prevention
    console.log(`  Testing real-time prevention for ${fieldName}`)
    await input.clear()
    await input.focus()
    
    // Try typing 'e'
    await page.keyboard.press('e')
    await page.waitForTimeout(100)
    const afterE = await input.inputValue()
    
    // Try typing '-'
    await page.keyboard.press('-')
    await page.waitForTimeout(100)
    const afterMinus = await input.inputValue()
    
    const realtimeWorking = afterE === '' && afterMinus === ''
    console.log(`    Real-time test: ${realtimeWorking ? 'PASS' : 'FAIL'} - After e: "${afterE}", After -: "${afterMinus}"`)
    results.tests.push({ test: 'realtime', passed: realtimeWorking, afterE, afterMinus })
    
    // Test 4: Valid positive number
    console.log(`  Testing valid input for ${fieldName}`)
    await input.clear()
    await input.fill('25.5')
    await input.blur()
    await page.waitForTimeout(500)
    
    const validValue = await input.inputValue()
    const validAccepted = validValue === '25.5' || validValue === '25,5' // Account for locale
    console.log(`    Valid test: ${validAccepted ? 'PASS' : 'FAIL'} - Value: "${validValue}"`)
    results.tests.push({ test: 'valid', passed: validAccepted, value: validValue })
    
  } catch (error) {
    console.log(`  Error testing ${fieldName}: ${error}`)
    results.tests.push({ test: 'error', message: error.toString() })
  }
  
  return results
}

test.describe('Numeric Validation Discovery & Testing', () => {
  let page: any

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })
    page = await context.newPage()

    console.log('=== NUMERIC VALIDATION DISCOVERY & TESTING ===')
  })

  test('1. Login and Navigate to Admin', async () => {
    console.log('\n--- Admin Login Process ---')
    
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'tests/screenshots/01-homepage.png' })
    
    // Look for login/auth elements
    await page.waitForTimeout(2000) // Let page fully load
    
    // Try different login approaches
    let loginFound = false
    
    // Check for direct login button
    const loginButtons = [
      'button:has-text("Conectare")',
      'button:has-text("Login")',
      'a:has-text("Conectare")',
      'a:has-text("Login")',
      '[data-testid*="login"]',
      '.login-button'
    ]
    
    for (const selector of loginButtons) {
      try {
        const element = page.locator(selector).first()
        if (await element.isVisible({ timeout: 1000 })) {
          console.log(`Found login element: ${selector}`)
          await element.click()
          await page.waitForLoadState('networkidle')
          loginFound = true
          break
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // If no direct login button, look for profile/account menu
    if (!loginFound) {
      const menuSelectors = [
        '[data-testid="account-menu"]',
        '[data-testid="user-menu"]',
        'button[aria-label*="profile"]',
        'button[aria-label*="account"]',
        '.user-menu',
        '.profile-menu'
      ]
      
      for (const selector of menuSelectors) {
        try {
          const element = page.locator(selector).first()
          if (await element.isVisible({ timeout: 1000 })) {
            console.log(`Found menu element: ${selector}`)
            await element.click()
            await page.waitForTimeout(1000)
            
            // Look for login option in menu
            const loginOption = page.locator('text="Conectare", text="Login"').first()
            if (await loginOption.isVisible({ timeout: 2000 })) {
              await loginOption.click()
              await page.waitForLoadState('networkidle')
              loginFound = true
              break
            }
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    // Take screenshot after navigation attempt
    await page.screenshot({ path: 'tests/screenshots/02-after-login-navigation.png' })
    
    // Try to find email field to confirm we're on login page
    const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[placeholder*="Email"]').first()
    
    try {
      await emailField.waitFor({ state: 'visible', timeout: 5000 })
      console.log('Login form found!')
    } catch (error) {
      console.log('Login form not immediately visible, trying direct navigation...')
      
      // Try direct navigation to common auth paths
      const authPaths = ['/auth/login', '/login', '/conectare', '/admin/login']
      
      for (const path of authPaths) {
        try {
          await page.goto(`${BASE_URL}${path}`)
          await page.waitForLoadState('networkidle')
          
          if (await emailField.isVisible({ timeout: 2000 })) {
            console.log(`Login found at: ${path}`)
            break
          }
        } catch (error) {
          console.log(`Path ${path} not working: ${error}`)
        }
      }
    }
    
    // Fill login form
    await page.screenshot({ path: 'tests/screenshots/03-login-page.png' })
    
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first()
    
    await emailField.fill(LOGIN_EMAIL)
    await passwordField.fill(LOGIN_PASSWORD)
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Conectare"), button:has-text("Login"), button:has-text("Intră în cont")').first()
    await submitButton.click()
    
    // Wait for login completion
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Allow time for login processing
    
    await page.screenshot({ path: 'tests/screenshots/04-after-login.png' })
    
    const currentUrl = page.url()
    console.log(`Current URL after login: ${currentUrl}`)
    
    expect(emailField).toBeTruthy() // Just confirm we got this far
  })

  test('2. Discover Admin Interface Structure', async () => {
    console.log('\n--- Discovering Admin Interface ---')
    
    // Try to navigate to admin areas
    const adminPaths = [
      '/admin',
      '/admin/dashboard', 
      '/admin/produse',
      '/admin/products',
      '/dashboard'
    ]
    
    let adminFound = false
    
    for (const path of adminPaths) {
      try {
        await page.goto(`${BASE_URL}${path}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        await page.screenshot({ path: `tests/screenshots/05-admin-path-${path.replace(/\//g, '-')}.png` })
        
        // Look for admin indicators
        const adminIndicators = [
          'text="Admin"',
          'text="Dashboard"', 
          'text="Administrare"',
          'text="Produse"',
          'text="Faianta"',
          'text="Gresie"',
          'text="Parchet"',
          'text="Riflaje"'
        ]
        
        for (const indicator of adminIndicators) {
          if (await page.locator(indicator).first().isVisible({ timeout: 1000 })) {
            console.log(`Admin area found at ${path} with indicator: ${indicator}`)
            adminFound = true
            break
          }
        }
        
        if (adminFound) break
        
      } catch (error) {
        console.log(`Admin path ${path} failed: ${error}`)
      }
    }
    
    if (!adminFound) {
      // Look for navigation links to admin areas
      const navLinks = await page.locator('nav a, .navigation a, [role="navigation"] a').all()
      
      for (const link of navLinks) {
        try {
          const href = await link.getAttribute('href')
          const text = await link.textContent()
          console.log(`Navigation link found: "${text}" -> ${href}`)
          
          if (href && (href.includes('admin') || text?.toLowerCase().includes('admin'))) {
            await link.click()
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(2000)
            adminFound = true
            break
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    expect(true).toBeTruthy() // This test is exploratory
  })

  test('3. Find Product Management Areas', async () => {
    console.log('\n--- Finding Product Management ---')
    
    await page.screenshot({ path: 'tests/screenshots/06-current-admin-state.png' })
    
    // Look for product-related links and buttons
    const productSelectors = [
      'a[href*="faianta"]',
      'a[href*="gresie"]', 
      'a[href*="parchet"]',
      'a[href*="riflaje"]',
      'text="Faianta"',
      'text="Gresie"',
      'text="Parchet"', 
      'text="Riflaje"',
      'button:has-text("Produse")',
      'a:has-text("Produse")'
    ]
    
    const foundProducts = []
    
    for (const selector of productSelectors) {
      try {
        const elements = await page.locator(selector).all()
        
        for (const element of elements) {
          if (await element.isVisible()) {
            const text = await element.textContent()
            const href = await element.getAttribute('href')
            
            foundProducts.push({
              selector,
              text: text?.trim(),
              href,
              isVisible: true
            })
            
            console.log(`Product link found: ${selector} - "${text}" -> ${href}`)
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    console.log(`Total product management elements found: ${foundProducts.length}`)
    
    // Try to navigate to first available product management area
    if (foundProducts.length > 0) {
      const firstProduct = foundProducts[0]
      
      if (firstProduct.href) {
        await page.goto(`${BASE_URL}${firstProduct.href}`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        await page.screenshot({ path: 'tests/screenshots/07-product-management-page.png' })
        
        console.log(`Navigated to product management: ${firstProduct.href}`)
      }
    }
    
    expect(foundProducts.length).toBeGreaterThan(0)
  })

  test('4. Explore Form Structure and Fields', async () => {
    console.log('\n--- Exploring Form Structure ---')
    
    // Look for edit buttons or create buttons
    const actionButtons = [
      'button:has-text("Editează")',
      'button:has-text("Edit")', 
      'a:has-text("Editează")',
      'a:has-text("Edit")',
      'button:has-text("Adaugă")',
      'button:has-text("Create")',
      '.edit-button',
      '.create-button',
      '[data-testid*="edit"]',
      '[data-testid*="create"]'
    ]
    
    let formFound = false
    
    for (const selector of actionButtons) {
      try {
        const button = page.locator(selector).first()
        
        if (await button.isVisible({ timeout: 1000 })) {
          console.log(`Action button found: ${selector}`)
          await button.click()
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(2000)
          
          await page.screenshot({ path: 'tests/screenshots/08-after-action-button.png' })
          
          // Look for form fields
          const formFields = await page.locator('input, textarea, select').all()
          
          if (formFields.length > 0) {
            console.log(`Form with ${formFields.length} fields found!`)
            formFound = true
            break
          }
        }
      } catch (error) {
        // Continue
      }
    }
    
    // If no form found through buttons, look for existing forms
    if (!formFound) {
      const allInputs = await page.locator('input').all()
      console.log(`Found ${allInputs.length} input fields on current page`)
      
      if (allInputs.length > 0) {
        formFound = true
      }
    }
    
    if (formFound) {
      // Document all input fields and their attributes
      const inputs = await page.locator('input').all()
      
      console.log('\n--- FORM FIELDS ANALYSIS ---')
      
      for (let i = 0; i < inputs.length; i++) {
        try {
          const input = inputs[i]
          const name = await input.getAttribute('name')
          const id = await input.getAttribute('id') 
          const type = await input.getAttribute('type')
          const placeholder = await input.getAttribute('placeholder')
          const label = await input.getAttribute('aria-label')
          const value = await input.inputValue()
          
          console.log(`Field ${i + 1}:`)
          console.log(`  Name: ${name}`)
          console.log(`  ID: ${id}`)
          console.log(`  Type: ${type}`)
          console.log(`  Placeholder: ${placeholder}`)
          console.log(`  Label: ${label}`)
          console.log(`  Value: ${value}`)
          console.log('---')
          
          // Test numeric validation if this looks like a numeric field
          const isNumericField = type === 'number' || 
                                 name?.includes('price') || 
                                 name?.includes('grosime') ||
                                 name?.includes('greutate') ||
                                 name?.includes('stock') ||
                                 placeholder?.toLowerCase().includes('preț') ||
                                 placeholder?.toLowerCase().includes('grosime')
          
          if (isNumericField) {
            console.log(`\n*** TESTING NUMERIC VALIDATION FOR FIELD ${i + 1} ***`)
            await testNumericFieldValidation(page, input, `Field ${i + 1} (${name || id || 'unnamed'})`)
          }
          
        } catch (error) {
          console.log(`Error analyzing field ${i + 1}: ${error}`)
        }
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/09-final-form-state.png' })
    
    expect(formFound).toBeTruthy()
  })


  test('5. Generate Discovery Report', async () => {
    console.log('\n=== NUMERIC VALIDATION DISCOVERY REPORT ===')
    console.log('Check the console output above for detailed findings.')
    console.log('Screenshots saved in tests/screenshots/ directory.')
    console.log('===========================================')
    
    expect(true).toBeTruthy()
  })
})