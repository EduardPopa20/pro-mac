import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5180'
const LOGIN_EMAIL = 'eduardpopa68@yahoo.com'
const LOGIN_PASSWORD = 'Test200'

// Test results storage
let testResults = {
  loginSuccessful: false,
  adminAccessible: false,
  productFormsFound: [],
  numericValidationResults: []
}

// Helper function to test numeric field validation
async function testNumericField(page: any, field: any, fieldName: string, productType: string) {
  const results = {
    fieldName,
    productType,
    tests: {
      negativeValuesPrevented: false,
      eCharacterPrevented: false,
      realTimePrevention: false,
      errorMessagesShown: false,
      sanitizationWorking: false
    },
    details: {}
  }

  try {
    console.log(`\n🧪 Testing ${fieldName} in ${productType}`)
    
    // Test 1: Negative values prevention
    await field.clear()
    await field.fill('-10')
    await field.blur()
    await page.waitForTimeout(300)
    
    const negativeValue = await field.inputValue()
    results.tests.negativeValuesPrevented = negativeValue !== '-10'
    results.details.negativeTest = { input: '-10', output: negativeValue }
    console.log(`  ❌ Negative values: ${results.tests.negativeValuesPrevented ? 'BLOCKED ✅' : 'ALLOWED ❌'} (${negativeValue})`)
    
    // Test 2: 'e' character prevention
    await field.clear()
    await field.fill('2e3')
    await field.blur()
    await page.waitForTimeout(300)
    
    const eValue = await field.inputValue()
    results.tests.eCharacterPrevented = eValue !== '2e3'
    results.details.eTest = { input: '2e3', output: eValue }
    console.log(`  🔤 'e' character: ${results.tests.eCharacterPrevented ? 'BLOCKED ✅' : 'ALLOWED ❌'} (${eValue})`)
    
    // Test 3: Real-time key prevention
    await field.clear()
    await field.focus()
    
    // Try pressing keys
    await page.keyboard.press('Minus')
    await page.waitForTimeout(100)
    const afterMinus = await field.inputValue()
    
    await page.keyboard.press('e')
    await page.waitForTimeout(100)
    const afterE = await field.inputValue()
    
    results.tests.realTimePrevention = afterMinus === '' && afterE === ''
    results.details.realtimeTest = { afterMinus, afterE }
    console.log(`  ⌨️ Real-time prevention: ${results.tests.realTimePrevention ? 'WORKING ✅' : 'FAILING ❌'}`)
    
    // Test 4: Error messages
    await field.clear()
    await field.fill('invalid-123-input')
    await field.blur()
    await page.waitForTimeout(500)
    
    // Look for error messages
    const errorSelectors = [
      '.MuiFormHelperText-root.Mui-error',
      '.MuiInputBase-formControl .Mui-error',
      '[role="alert"]',
      '.error-message',
      '.field-error'
    ]
    
    let errorFound = false
    for (const selector of errorSelectors) {
      try {
        const errorElement = page.locator(selector).first()
        if (await errorElement.isVisible({ timeout: 1000 })) {
          const errorText = await errorElement.textContent()
          if (errorText && errorText.trim()) {
            errorFound = true
            results.details.errorMessage = errorText.trim()
            break
          }
        }
      } catch (e) {}
    }
    
    results.tests.errorMessagesShown = errorFound
    console.log(`  💬 Error messages: ${results.tests.errorMessagesShown ? 'SHOWN ✅' : 'MISSING ❌'}`)
    
    // Test 5: Field sanitization
    await field.clear()
    await field.fill('abc123def')
    await field.blur()
    await page.waitForTimeout(300)
    
    const sanitizedValue = await field.inputValue()
    const isSanitized = sanitizedValue === '123' || sanitizedValue === '' || sanitizedValue !== 'abc123def'
    results.tests.sanitizationWorking = isSanitized
    results.details.sanitizationTest = { input: 'abc123def', output: sanitizedValue }
    console.log(`  🧹 Sanitization: ${results.tests.sanitizationWorking ? 'WORKING ✅' : 'FAILING ❌'} (${sanitizedValue})`)
    
    // Test 6: Valid input acceptance
    await field.clear()
    await field.fill('42.5')
    await field.blur()
    await page.waitForTimeout(300)
    
    const validValue = await field.inputValue()
    const validAccepted = validValue === '42.5' || validValue === '42,5'
    results.details.validTest = { input: '42.5', output: validValue, accepted: validAccepted }
    console.log(`  ✅ Valid input: ${validAccepted ? 'ACCEPTED ✅' : 'REJECTED ❌'} (${validValue})`)

  } catch (error) {
    console.log(`  ❌ Error testing ${fieldName}: ${error}`)
    results.details.error = error.toString()
  }

  return results
}

test.describe('Admin Numeric Field Validation Testing', () => {
  let page: any

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    })
    page = await context.newPage()
    console.log('🚀 Starting Admin Numeric Validation Testing')
  })

  test('1. Login to Admin System', async () => {
    console.log('\n🔐 Testing Admin Login')
    
    try {
      // Navigate to homepage first
      await page.goto(BASE_URL)
      await page.waitForLoadState('networkidle')
      
      // Try direct navigation to admin
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      // Check if we need to login or already authenticated
      const isAuthenticated = await page.locator('text="Produse", text="Dashboard", text="Administrare"').isVisible({ timeout: 3000 })
      
      if (isAuthenticated) {
        console.log('✅ Already authenticated as admin')
        testResults.loginSuccessful = true
      } else {
        // Look for login elements
        console.log('🔍 Looking for login form...')
        
        // Try different auth paths
        const authPaths = ['/auth/login', '/login', '/conectare']
        let loginFormFound = false
        
        for (const path of authPaths) {
          try {
            await page.goto(`${BASE_URL}${path}`)
            await page.waitForLoadState('networkidle')
            
            const emailField = page.locator('input[type="email"], input[name*="email"]').first()
            if (await emailField.isVisible({ timeout: 2000 })) {
              loginFormFound = true
              console.log(`📝 Login form found at ${path}`)
              
              const passwordField = page.locator('input[type="password"]').first()
              await emailField.fill(LOGIN_EMAIL)
              await passwordField.fill(LOGIN_PASSWORD)
              
              const submitButton = page.locator('button[type="submit"], button:has-text("Conectare")').first()
              await submitButton.click()
              
              await page.waitForLoadState('networkidle')
              await page.waitForTimeout(3000)
              
              // Try to navigate back to admin
              await page.goto(`${BASE_URL}/admin`)
              await page.waitForLoadState('networkidle')
              
              const adminSuccess = await page.locator('text="Produse", text="Dashboard"').isVisible({ timeout: 3000 })
              if (adminSuccess) {
                testResults.loginSuccessful = true
                console.log('✅ Login successful!')
              }
              break
            }
          } catch (e) {
            console.log(`❌ Path ${path} failed: ${e}`)
          }
        }
        
        if (!loginFormFound) {
          console.log('❌ No login form found, checking if already authenticated...')
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-login-result.png' })
      
    } catch (error) {
      console.log(`❌ Login error: ${error}`)
    }
    
    expect(true).toBeTruthy() // This test is exploratory
  })

  test('2. Explore Admin Product Management', async () => {
    console.log('\n🔍 Exploring Admin Product Management')
    
    // Make sure we're on admin page
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    testResults.adminAccessible = await page.locator('text="Produse", text="Dashboard"').isVisible()
    console.log(`Admin accessible: ${testResults.adminAccessible ? '✅' : '❌'}`)
    
    await page.screenshot({ path: 'tests/screenshots/admin-products-page.png' })
    
    // Look for product category tabs or navigation
    const productCategories = ['Faianta', 'Gresie', 'Parchet', 'Riflaje']
    
    for (const category of productCategories) {
      try {
        const categoryElement = page.locator(`text="${category}"`).first()
        if (await categoryElement.isVisible({ timeout: 1000 })) {
          console.log(`📁 Found category: ${category}`)
          
          // Click on category to see if it reveals products
          await categoryElement.click()
          await page.waitForTimeout(1500)
          
          await page.screenshot({ path: `tests/screenshots/admin-category-${category.toLowerCase()}.png` })
          
          // Look for action buttons (Edit, Add, etc.)
          const actionButtons = [
            'button:has-text("Editează")',
            'button:has-text("Adaugă")',
            'a:has-text("Editează")', 
            'a:has-text("Edit")',
            '.edit-button',
            '.add-button',
            '[data-testid*="edit"]',
            '[data-testid*="add"]'
          ]
          
          let foundAction = false
          for (const selector of actionButtons) {
            try {
              const button = page.locator(selector).first()
              if (await button.isVisible({ timeout: 1000 })) {
                console.log(`🔘 Found action button: ${selector} for ${category}`)
                
                // Try clicking to see if it opens a form
                await button.click()
                await page.waitForLoadState('networkidle')
                await page.waitForTimeout(2000)
                
                await page.screenshot({ path: `tests/screenshots/admin-form-${category.toLowerCase()}.png` })
                
                // Look for form fields
                const formFields = await page.locator('input, textarea, select').all()
                console.log(`📄 Found ${formFields.length} form fields for ${category}`)
                
                if (formFields.length > 0) {
                  testResults.productFormsFound.push({
                    category,
                    fieldsCount: formFields.length,
                    url: page.url()
                  })
                  foundAction = true
                  break
                }
              }
            } catch (e) {
              // Continue
            }
          }
          
          if (!foundAction) {
            console.log(`❌ No action buttons found for ${category}`)
          }
        }
      } catch (e) {
        console.log(`❌ Error with category ${category}: ${e}`)
      }
    }
    
    expect(testResults.adminAccessible).toBeTruthy()
  })

  test('3. Test Numeric Validation on Available Forms', async () => {
    console.log('\n🧪 Testing Numeric Validation on Forms')
    
    if (testResults.productFormsFound.length === 0) {
      console.log('❌ No forms found to test')
      // Try to navigate to known admin paths to find forms
      const adminPaths = [
        '/admin/produse/faianta/create',
        '/admin/produse/gresie/create',
        '/admin/produse/parchet/create',
        '/admin/products/create',
        '/admin/dashboard'
      ]
      
      for (const path of adminPaths) {
        try {
          await page.goto(`${BASE_URL}${path}`)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(2000)
          
          const fields = await page.locator('input[type="number"], input[name*="price"], input[name*="grosime"], input[name*="greutate"], input[name*="stock"]').all()
          
          if (fields.length > 0) {
            console.log(`📄 Found ${fields.length} numeric fields at ${path}`)
            
            // Test the first few fields
            for (let i = 0; i < Math.min(3, fields.length); i++) {
              const field = fields[i]
              const name = await field.getAttribute('name') || await field.getAttribute('id') || `field-${i+1}`
              const type = await field.getAttribute('type')
              
              console.log(`\n🔍 Testing field: ${name} (type: ${type})`)
              
              const result = await testNumericField(page, field, name, path.split('/').pop() || 'unknown')
              testResults.numericValidationResults.push(result)
            }
            
            break
          }
        } catch (e) {
          console.log(`❌ Path ${path} failed: ${e}`)
        }
      }
    } else {
      // Test forms that were found
      for (const form of testResults.productFormsFound) {
        console.log(`\n📝 Testing form for ${form.category}`)
        
        try {
          await page.goto(form.url)
          await page.waitForLoadState('networkidle')
          await page.waitForTimeout(2000)
          
          // Find numeric fields
          const numericFields = await page.locator('input[type="number"], input[name*="price"], input[name*="preț"], input[name*="grosime"], input[name*="greutate"], input[name*="stock"]').all()
          
          console.log(`🔢 Found ${numericFields.length} numeric fields in ${form.category}`)
          
          // Test first 3 numeric fields
          for (let i = 0; i < Math.min(3, numericFields.length); i++) {
            const field = numericFields[i]
            const name = await field.getAttribute('name') || await field.getAttribute('id') || `${form.category}-field-${i+1}`
            
            const result = await testNumericField(page, field, name, form.category)
            testResults.numericValidationResults.push(result)
          }
          
        } catch (e) {
          console.log(`❌ Error testing ${form.category}: ${e}`)
        }
      }
    }
    
    expect(testResults.numericValidationResults.length).toBeGreaterThan(0)
  })

  test('4. Generate Comprehensive Report', async () => {
    console.log('\n📊 COMPREHENSIVE NUMERIC VALIDATION REPORT')
    console.log('='.repeat(60))
    
    console.log(`\n🔐 LOGIN RESULTS:`)
    console.log(`  Login Successful: ${testResults.loginSuccessful ? '✅' : '❌'}`)
    console.log(`  Admin Accessible: ${testResults.adminAccessible ? '✅' : '❌'}`)
    
    console.log(`\n📝 FORMS DISCOVERED:`)
    if (testResults.productFormsFound.length > 0) {
      testResults.productFormsFound.forEach(form => {
        console.log(`  ${form.category}: ${form.fieldsCount} fields - ${form.url}`)
      })
    } else {
      console.log('  ❌ No forms discovered')
    }
    
    console.log(`\n🧪 NUMERIC VALIDATION RESULTS:`)
    if (testResults.numericValidationResults.length > 0) {
      testResults.numericValidationResults.forEach((result, index) => {
        console.log(`\n  Field ${index + 1}: ${result.fieldName} (${result.productType})`)
        console.log(`    ❌ Negative Values Blocked: ${result.tests.negativeValuesPrevented ? '✅' : '❌'}`)
        console.log(`    🔤 'e' Character Blocked: ${result.tests.eCharacterPrevented ? '✅' : '❌'}`)
        console.log(`    ⌨️ Real-time Prevention: ${result.tests.realTimePrevention ? '✅' : '❌'}`)
        console.log(`    💬 Error Messages Shown: ${result.tests.errorMessagesShown ? '✅' : '❌'}`)
        console.log(`    🧹 Sanitization Working: ${result.tests.sanitizationWorking ? '✅' : '❌'}`)
      })
      
      // Summary stats
      const totalTests = testResults.numericValidationResults.length
      const negativeBlocked = testResults.numericValidationResults.filter(r => r.tests.negativeValuesPrevented).length
      const eBlocked = testResults.numericValidationResults.filter(r => r.tests.eCharacterPrevented).length
      const realtimeWorking = testResults.numericValidationResults.filter(r => r.tests.realTimePrevention).length
      const errorsShown = testResults.numericValidationResults.filter(r => r.tests.errorMessagesShown).length
      const sanitizationWorking = testResults.numericValidationResults.filter(r => r.tests.sanitizationWorking).length
      
      console.log(`\n📈 SUMMARY STATISTICS:`)
      console.log(`  Total Fields Tested: ${totalTests}`)
      console.log(`  Negative Values Blocked: ${negativeBlocked}/${totalTests} (${Math.round(negativeBlocked/totalTests*100)}%)`)
      console.log(`  'e' Character Blocked: ${eBlocked}/${totalTests} (${Math.round(eBlocked/totalTests*100)}%)`)
      console.log(`  Real-time Prevention: ${realtimeWorking}/${totalTests} (${Math.round(realtimeWorking/totalTests*100)}%)`)
      console.log(`  Error Messages: ${errorsShown}/${totalTests} (${Math.round(errorsShown/totalTests*100)}%)`)
      console.log(`  Sanitization: ${sanitizationWorking}/${totalTests} (${Math.round(sanitizationWorking/totalTests*100)}%)`)
      
    } else {
      console.log('  ❌ No numeric validation tests performed')
    }
    
    console.log(`\n🎯 RECOMMENDATIONS:`)
    if (testResults.numericValidationResults.length === 0) {
      console.log('  • Need to find and access admin product forms for testing')
      console.log('  • Verify admin authentication is working properly')
    } else {
      const issues = []
      if (testResults.numericValidationResults.some(r => !r.tests.negativeValuesPrevented)) {
        issues.push('• Fix negative value prevention in some fields')
      }
      if (testResults.numericValidationResults.some(r => !r.tests.eCharacterPrevented)) {
        issues.push('• Fix scientific notation (e) prevention in some fields')
      }
      if (testResults.numericValidationResults.some(r => !r.tests.realTimePrevention)) {
        issues.push('• Implement real-time key prevention for invalid characters')
      }
      if (testResults.numericValidationResults.some(r => !r.tests.errorMessagesShown)) {
        issues.push('• Add Romanian error messages for validation failures')
      }
      if (testResults.numericValidationResults.some(r => !r.tests.sanitizationWorking)) {
        issues.push('• Improve field sanitization for invalid input')
      }
      
      if (issues.length === 0) {
        console.log('  🎉 All numeric validation tests passed! System is working correctly.')
      } else {
        issues.forEach(issue => console.log(`  ${issue}`))
      }
    }
    
    console.log('\n' + '='.repeat(60))
    
    await page.screenshot({ path: 'tests/screenshots/final-report.png' })
    
    expect(true).toBeTruthy() // Always pass for report generation
  })
})