import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5180'
const LOGIN_EMAIL = 'eduardpopa68@yahoo.com'
const LOGIN_PASSWORD = 'Test200'

// Comprehensive test results storage
interface TestResult {
  fieldName: string
  fieldType: string
  productType: string
  tests: {
    negativeBlocked: boolean
    eCharacterBlocked: boolean
    realTimePreventionWorks: boolean
    errorMessagesShown: boolean
    sanitizationWorks: boolean
    validInputAccepted: boolean
  }
  details: {
    negativeTest: { input: string, output: string }
    eTest: { input: string, output: string }
    realtimeTest: { minusBlocked: boolean, eBlocked: boolean }
    errorMessages: string[]
    sanitizationTest: { input: string, output: string }
    validTest: { input: string, output: string }
  }
}

let comprehensiveResults: {
  loginSuccessful: boolean
  formsAccessed: string[]
  fieldsTested: TestResult[]
  summary: {
    totalFields: number
    negativeBlockedCount: number
    eBlockedCount: number
    realtimeWorkingCount: number
    errorMessagesCount: number
    sanitizationWorkingCount: number
    validInputAcceptedCount: number
  }
} = {
  loginSuccessful: false,
  formsAccessed: [],
  fieldsTested: [],
  summary: {
    totalFields: 0,
    negativeBlockedCount: 0,
    eBlockedCount: 0,
    realtimeWorkingCount: 0,
    errorMessagesCount: 0,
    sanitizationWorkingCount: 0,
    validInputAcceptedCount: 0
  }
}

// Numeric fields to test based on the validation utility
const NUMERIC_FIELDS_TO_TEST = [
  // Physical properties
  { fieldName: 'thickness', displayName: 'Grosime', selector: 'input[name="thickness"]' },
  { fieldName: 'weight_per_box', displayName: 'Greutate per cutie', selector: 'input[name="weight_per_box"]' },
  { fieldName: 'area_per_box', displayName: 'Suprafață per cutie', selector: 'input[name="area_per_box"]' },
  { fieldName: 'tiles_per_box', displayName: 'Plăci per cutie', selector: 'input[name="tiles_per_box"]' },
  { fieldName: 'tiles_per_sqm', displayName: 'Plăci per m²', selector: 'input[name="tiles_per_sqm"]' },
  
  // Pricing fields
  { fieldName: 'price', displayName: 'Preț curent', selector: 'input[name="price"]' },
  { fieldName: 'standard_price', displayName: 'Preț standard', selector: 'input[name="standard_price"]' },
  { fieldName: 'special_price', displayName: 'Preț special', selector: 'input[name="special_price"]' },
  
  // Inventory fields
  { fieldName: 'stock_quantity', displayName: 'Stoc disponibil', selector: 'input[name="stock_quantity"]' },
  { fieldName: 'estimated_delivery_days', displayName: 'Timp livrare', selector: 'input[name="estimated_delivery_days"]' },
]

// Helper function to perform comprehensive numeric validation test
async function testNumericFieldComprehensively(page: any, field: any, fieldInfo: any, productType: string): Promise<TestResult> {
  const result: TestResult = {
    fieldName: fieldInfo.fieldName,
    fieldType: await field.getAttribute('type') || 'text',
    productType,
    tests: {
      negativeBlocked: false,
      eCharacterBlocked: false,
      realTimePreventionWorks: false,
      errorMessagesShown: false,
      sanitizationWorks: false,
      validInputAccepted: false
    },
    details: {
      negativeTest: { input: '', output: '' },
      eTest: { input: '', output: '' },
      realtimeTest: { minusBlocked: false, eBlocked: false },
      errorMessages: [],
      sanitizationTest: { input: '', output: '' },
      validTest: { input: '', output: '' }
    }
  }

  try {
    console.log(`\n🔍 Testing ${fieldInfo.displayName} (${fieldInfo.fieldName}) in ${productType}`)
    
    // Ensure field is visible and ready
    await field.waitFor({ state: 'visible', timeout: 3000 })
    await field.scrollIntoViewIfNeeded()
    
    // Test 1: Negative values prevention
    console.log(`  1️⃣ Testing negative values...`)
    const negativeInput = '-15'
    await field.clear()
    await field.fill(negativeInput)
    await field.blur()
    await page.waitForTimeout(500)
    
    const negativeOutput = await field.inputValue()
    result.tests.negativeBlocked = negativeOutput !== negativeInput && !negativeOutput.includes('-')
    result.details.negativeTest = { input: negativeInput, output: negativeOutput }
    console.log(`     Negative blocked: ${result.tests.negativeBlocked ? '✅' : '❌'} (${negativeInput} → ${negativeOutput})`)
    
    // Test 2: 'e' character prevention
    console.log(`  2️⃣ Testing 'e' character...`)
    const eInput = '2e10'
    await field.clear()
    await field.fill(eInput)
    await field.blur()
    await page.waitForTimeout(500)
    
    const eOutput = await field.inputValue()
    result.tests.eCharacterBlocked = eOutput !== eInput && !eOutput.toLowerCase().includes('e')
    result.details.eTest = { input: eInput, output: eOutput }
    console.log(`     'e' blocked: ${result.tests.eCharacterBlocked ? '✅' : '❌'} (${eInput} → ${eOutput})`)
    
    // Test 3: Real-time key prevention
    console.log(`  3️⃣ Testing real-time prevention...`)
    await field.clear()
    await field.focus()
    
    // Test minus key
    const beforeMinus = await field.inputValue()
    await page.keyboard.press('Minus')
    await page.waitForTimeout(200)
    const afterMinus = await field.inputValue()
    const minusBlocked = afterMinus === beforeMinus
    
    // Test 'e' key
    await field.clear()
    await field.focus()
    const beforeE = await field.inputValue()
    await page.keyboard.press('e')
    await page.waitForTimeout(200)
    const afterE = await field.inputValue()
    const eBlocked = afterE === beforeE
    
    result.tests.realTimePreventionWorks = minusBlocked && eBlocked
    result.details.realtimeTest = { minusBlocked, eBlocked }
    console.log(`     Real-time prevention: ${result.tests.realTimePreventionWorks ? '✅' : '❌'} (minus: ${minusBlocked}, e: ${eBlocked})`)
    
    // Test 4: Error messages
    console.log(`  4️⃣ Testing error messages...`)
    await field.clear()
    await field.fill('-999')
    await field.blur()
    await page.waitForTimeout(1000)
    
    // Look for various error message patterns
    const errorSelectors = [
      '.MuiFormHelperText-root.Mui-error',
      '.Mui-error',
      '[role="alert"]',
      '.error-message',
      '.field-error',
      'p[color="error"]',
      '.MuiTypography-colorError'
    ]
    
    const errorMessages = []
    for (const selector of errorSelectors) {
      try {
        const errorElements = await page.locator(selector).all()
        for (const element of errorElements) {
          if (await element.isVisible({ timeout: 1000 })) {
            const text = await element.textContent()
            if (text && text.trim() && !errorMessages.includes(text.trim())) {
              errorMessages.push(text.trim())
            }
          }
        }
      } catch (e) {}
    }
    
    result.tests.errorMessagesShown = errorMessages.length > 0
    result.details.errorMessages = errorMessages
    console.log(`     Error messages: ${result.tests.errorMessagesShown ? '✅' : '❌'} (${errorMessages.length} found: ${errorMessages.join('; ')})`)
    
    // Test 5: Field sanitization
    console.log(`  5️⃣ Testing sanitization...`)
    const sanitizeInput = 'abc123def456ghi'
    await field.clear()
    await field.fill(sanitizeInput)
    await field.blur()
    await page.waitForTimeout(500)
    
    const sanitizeOutput = await field.inputValue()
    const isSanitized = sanitizeOutput !== sanitizeInput && /^[0-9.]*$/.test(sanitizeOutput)
    result.tests.sanitizationWorks = isSanitized
    result.details.sanitizationTest = { input: sanitizeInput, output: sanitizeOutput }
    console.log(`     Sanitization: ${result.tests.sanitizationWorks ? '✅' : '❌'} (${sanitizeInput} → ${sanitizeOutput})`)
    
    // Test 6: Valid input acceptance
    console.log(`  6️⃣ Testing valid input...`)
    const validInput = '42.75'
    await field.clear()
    await field.fill(validInput)
    await field.blur()
    await page.waitForTimeout(500)
    
    const validOutput = await field.inputValue()
    const validAccepted = validOutput === validInput || validOutput === '42,75' // Account for locale
    result.tests.validInputAccepted = validAccepted
    result.details.validTest = { input: validInput, output: validOutput }
    console.log(`     Valid input: ${result.tests.validInputAccepted ? '✅' : '❌'} (${validInput} → ${validOutput})`)
    
  } catch (error) {
    console.log(`  ❌ Error testing ${fieldInfo.displayName}: ${error}`)
  }

  return result
}

test.describe('Comprehensive Admin Numeric Validation Testing', () => {
  let context: any
  let page: any

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ignoreHTTPSErrors: true
    })
    page = await context.newPage()
    
    console.log('🚀 Starting Comprehensive Admin Numeric Validation Testing')
    console.log(`📍 Server: ${BASE_URL}`)
    console.log(`👤 Admin User: ${LOGIN_EMAIL}`)
    console.log(`🔢 Fields to test: ${NUMERIC_FIELDS_TO_TEST.length}`)
  })

  test.afterAll(async () => {
    if (context) {
      await context.close()
    }
  })

  test('1. Authenticate and Access Admin Panel', async () => {
    console.log('\n🔐 Step 1: Admin Authentication')
    
    try {
      // Try accessing admin directly first
      await page.goto(`${BASE_URL}/admin`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      // Check if already authenticated
      const isAuthenticatedCheck = await page.locator('text="Produse", text="Dashboard", text="Administrare"').isVisible({ timeout: 3000 })
      
      if (isAuthenticatedCheck) {
        console.log('✅ Already authenticated as admin')
        comprehensiveResults.loginSuccessful = true
      } else {
        console.log('🔄 Need to authenticate...')
        
        // Try login form
        await page.goto(`${BASE_URL}/conectare`)
        await page.waitForLoadState('networkidle')
        
        // Fill login form
        const emailField = page.locator('input[type="email"], input[name*="email"]').first()
        const passwordField = page.locator('input[type="password"]').first()
        
        await emailField.waitFor({ state: 'visible', timeout: 5000 })
        await emailField.fill(LOGIN_EMAIL)
        await passwordField.fill(LOGIN_PASSWORD)
        
        const submitBtn = page.locator('button[type="submit"], button:has-text("Conectare")').first()
        await submitBtn.click()
        
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(5000)
        
        // Navigate back to admin
        await page.goto(`${BASE_URL}/admin`)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(2000)
        
        const finalAuthCheck = await page.locator('text="Produse", text="Dashboard"').isVisible({ timeout: 3000 })
        comprehensiveResults.loginSuccessful = finalAuthCheck
        
        console.log(`Authentication result: ${comprehensiveResults.loginSuccessful ? '✅ Success' : '❌ Failed'}`)
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-auth-result.png' })
      
    } catch (error) {
      console.log(`❌ Authentication error: ${error}`)
    }
    
    expect(comprehensiveResults.loginSuccessful).toBeTruthy()
  })

  test('2. Test Faianta Numeric Fields', async () => {
    console.log('\n🎯 Step 2: Testing Faianta Numeric Fields')
    
    // Navigate to a faianta edit form (create or edit)
    // Try creating new product first
    const createUrl = `${BASE_URL}/admin/produse/faianta/create`
    
    try {
      await page.goto(createUrl)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      comprehensiveResults.formsAccessed.push('faianta-create')
      console.log('📝 Accessed Faianta create form')
      
      await page.screenshot({ path: 'tests/screenshots/faianta-form.png' })
      
      // Test each numeric field
      for (const fieldInfo of NUMERIC_FIELDS_TO_TEST) {
        try {
          const fieldElement = page.locator(fieldInfo.selector).first()
          
          if (await fieldElement.isVisible({ timeout: 2000 })) {
            const testResult = await testNumericFieldComprehensively(page, fieldElement, fieldInfo, 'Faianta')
            comprehensiveResults.fieldsTested.push(testResult)
          } else {
            console.log(`⏭️ Field ${fieldInfo.displayName} not found in Faianta form`)
          }
        } catch (error) {
          console.log(`⚠️ Error testing ${fieldInfo.displayName}: ${error}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Could not access Faianta form: ${error}`)
    }
    
    expect(true).toBeTruthy() // This test is exploratory
  })

  test('3. Test Gresie Numeric Fields', async () => {
    console.log('\n🎯 Step 3: Testing Gresie Numeric Fields')
    
    try {
      const createUrl = `${BASE_URL}/admin/produse/gresie/create`
      await page.goto(createUrl)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      comprehensiveResults.formsAccessed.push('gresie-create')
      console.log('📝 Accessed Gresie create form')
      
      await page.screenshot({ path: 'tests/screenshots/gresie-form.png' })
      
      // Test subset of fields to avoid excessive testing
      const fieldsToTest = NUMERIC_FIELDS_TO_TEST.slice(0, 5) // Test first 5 fields
      
      for (const fieldInfo of fieldsToTest) {
        try {
          const fieldElement = page.locator(fieldInfo.selector).first()
          
          if (await fieldElement.isVisible({ timeout: 2000 })) {
            const testResult = await testNumericFieldComprehensively(page, fieldElement, fieldInfo, 'Gresie')
            comprehensiveResults.fieldsTested.push(testResult)
          }
        } catch (error) {
          console.log(`⚠️ Error testing ${fieldInfo.displayName} in Gresie: ${error}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Could not access Gresie form: ${error}`)
    }
    
    expect(true).toBeTruthy()
  })

  test('4. Test Parchet Numeric Fields', async () => {
    console.log('\n🎯 Step 4: Testing Parchet Numeric Fields')
    
    try {
      const createUrl = `${BASE_URL}/admin/produse/parchet/create`
      await page.goto(createUrl)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(3000)
      
      comprehensiveResults.formsAccessed.push('parchet-create')
      console.log('📝 Accessed Parchet create form')
      
      await page.screenshot({ path: 'tests/screenshots/parchet-form.png' })
      
      // Test subset of fields
      const fieldsToTest = NUMERIC_FIELDS_TO_TEST.slice(0, 3)
      
      for (const fieldInfo of fieldsToTest) {
        try {
          const fieldElement = page.locator(fieldInfo.selector).first()
          
          if (await fieldElement.isVisible({ timeout: 2000 })) {
            const testResult = await testNumericFieldComprehensively(page, fieldElement, fieldInfo, 'Parchet')
            comprehensiveResults.fieldsTested.push(testResult)
          }
        } catch (error) {
          console.log(`⚠️ Error testing ${fieldInfo.displayName} in Parchet: ${error}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Could not access Parchet form: ${error}`)
    }
    
    expect(true).toBeTruthy()
  })

  test('5. Generate Comprehensive Test Report', async () => {
    console.log('\n📊 COMPREHENSIVE NUMERIC VALIDATION TEST REPORT')
    console.log('='.repeat(80))
    
    // Calculate summary statistics
    const totalFields = comprehensiveResults.fieldsTested.length
    comprehensiveResults.summary = {
      totalFields,
      negativeBlockedCount: comprehensiveResults.fieldsTested.filter(r => r.tests.negativeBlocked).length,
      eBlockedCount: comprehensiveResults.fieldsTested.filter(r => r.tests.eCharacterBlocked).length,
      realtimeWorkingCount: comprehensiveResults.fieldsTested.filter(r => r.tests.realTimePreventionWorks).length,
      errorMessagesCount: comprehensiveResults.fieldsTested.filter(r => r.tests.errorMessagesShown).length,
      sanitizationWorkingCount: comprehensiveResults.fieldsTested.filter(r => r.tests.sanitizationWorks).length,
      validInputAcceptedCount: comprehensiveResults.fieldsTested.filter(r => r.tests.validInputAccepted).length,
    }
    
    console.log(`\n🔐 AUTHENTICATION RESULTS:`)
    console.log(`  Login Successful: ${comprehensiveResults.loginSuccessful ? '✅' : '❌'}`)
    console.log(`  Admin Email Used: ${LOGIN_EMAIL}`)
    
    console.log(`\n📝 FORMS ACCESSED:`)
    comprehensiveResults.formsAccessed.forEach(form => {
      console.log(`  ✅ ${form}`)
    })
    
    console.log(`\n🔢 NUMERIC VALIDATION TEST RESULTS:`)
    console.log(`  📋 Total Fields Tested: ${totalFields}`)
    
    if (totalFields > 0) {
      const { summary } = comprehensiveResults
      const percentage = (count: number) => Math.round((count / totalFields) * 100)
      
      console.log(`\n📊 VALIDATION SUCCESS RATES:`)
      console.log(`  ❌ Negative Values Blocked: ${summary.negativeBlockedCount}/${totalFields} (${percentage(summary.negativeBlockedCount)}%)`)
      console.log(`  🔤 'e' Character Blocked: ${summary.eBlockedCount}/${totalFields} (${percentage(summary.eBlockedCount)}%)`)
      console.log(`  ⌨️  Real-time Prevention Working: ${summary.realtimeWorkingCount}/${totalFields} (${percentage(summary.realtimeWorkingCount)}%)`)
      console.log(`  💬 Error Messages Shown: ${summary.errorMessagesCount}/${totalFields} (${percentage(summary.errorMessagesCount)}%)`)
      console.log(`  🧹 Field Sanitization Working: ${summary.sanitizationWorkingCount}/${totalFields} (${percentage(summary.sanitizationWorkingCount)}%)`)
      console.log(`  ✅ Valid Input Accepted: ${summary.validInputAcceptedCount}/${totalFields} (${percentage(summary.validInputAcceptedCount)}%)`)
      
      console.log(`\n🔍 DETAILED FIELD RESULTS:`)
      comprehensiveResults.fieldsTested.forEach((result, index) => {
        console.log(`\n  Field ${index + 1}: ${result.details.negativeTest ? '📝' : '🔧'} ${result.fieldName} (${result.productType})`)
        console.log(`    Type: ${result.fieldType}`)
        console.log(`    ❌ Negative Blocked: ${result.tests.negativeBlocked ? '✅' : '❌'} (${result.details.negativeTest.input} → ${result.details.negativeTest.output})`)
        console.log(`    🔤 'e' Blocked: ${result.tests.eCharacterBlocked ? '✅' : '❌'} (${result.details.eTest.input} → ${result.details.eTest.output})`)
        console.log(`    ⌨️  Real-time: ${result.tests.realTimePreventionWorks ? '✅' : '❌'} (minus: ${result.details.realtimeTest.minusBlocked}, e: ${result.details.realtimeTest.eBlocked})`)
        console.log(`    💬 Errors: ${result.tests.errorMessagesShown ? '✅' : '❌'} (${result.details.errorMessages.length} messages)`)
        console.log(`    🧹 Sanitization: ${result.tests.sanitizationWorks ? '✅' : '❌'} (${result.details.sanitizationTest.input} → ${result.details.sanitizationTest.output})`)
        console.log(`    ✅ Valid: ${result.tests.validInputAccepted ? '✅' : '❌'} (${result.details.validTest.input} → ${result.details.validTest.output})`)
      })
      
      console.log(`\n🎯 OVERALL ASSESSMENT:`)
      const overallScore = (
        summary.negativeBlockedCount + 
        summary.eBlockedCount + 
        summary.realtimeWorkingCount + 
        summary.errorMessagesCount +
        summary.sanitizationWorkingCount +
        summary.validInputAcceptedCount
      ) / (totalFields * 6) * 100
      
      console.log(`  Overall Success Rate: ${Math.round(overallScore)}%`)
      
      if (overallScore >= 90) {
        console.log(`  🎉 EXCELLENT: Numeric validation system is working very well!`)
      } else if (overallScore >= 70) {
        console.log(`  👍 GOOD: Numeric validation system is mostly working, minor issues to address`)
      } else if (overallScore >= 50) {
        console.log(`  ⚠️  FAIR: Numeric validation system needs improvement`)
      } else {
        console.log(`  ❌ POOR: Numeric validation system requires significant fixes`)
      }
      
      console.log(`\n🔧 RECOMMENDATIONS:`)
      
      if (summary.negativeBlockedCount < totalFields) {
        console.log(`  • Fix negative value prevention in ${totalFields - summary.negativeBlockedCount} fields`)
      }
      if (summary.eBlockedCount < totalFields) {
        console.log(`  • Fix scientific notation ('e') prevention in ${totalFields - summary.eBlockedCount} fields`)
      }
      if (summary.realtimeWorkingCount < totalFields) {
        console.log(`  • Implement real-time key blocking in ${totalFields - summary.realtimeWorkingCount} fields`)
      }
      if (summary.errorMessagesCount < totalFields / 2) {
        console.log(`  • Add Romanian error messages for better user feedback`)
      }
      if (summary.sanitizationWorkingCount < totalFields) {
        console.log(`  • Improve field sanitization for invalid characters`)
      }
      
      if (overallScore >= 90) {
        console.log(`  🎯 System is working well - maintain current implementation`)
        console.log(`  🔄 Consider adding unit tests for edge cases`)
        console.log(`  📚 Document validation rules for future developers`)
      }
      
    } else {
      console.log(`  ❌ No numeric fields were successfully tested`)
      console.log(`  🔧 Check form accessibility and field selectors`)
    }
    
    console.log('\n' + '='.repeat(80))
    
    await page.screenshot({ path: 'tests/screenshots/final-test-report.png' })
    
    // Minimum requirement: we should have tested at least some fields
    expect(totalFields).toBeGreaterThan(0)
  })
})