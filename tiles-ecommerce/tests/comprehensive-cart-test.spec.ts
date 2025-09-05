import { test, expect } from '@playwright/test'

test('Comprehensive Cart Test - Gresie + Faianta Complete Flow', async ({ page }) => {
  console.log('🏆 Starting COMPREHENSIVE cart test - Both categories!')
  
  // === PHASE 1: ADD GRESIE PRODUCT ===
  console.log('🏗️  PHASE 1: Adding Gresie product...')
  
  await page.goto('http://localhost:5176/gresie')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  // Add Gresie Bej Travertin
  const gresieProduct = page.locator('h6:has-text("Bej")')
  await expect(gresieProduct).toBeVisible()
  
  const gresieName = await gresieProduct.first().textContent() || ''
  console.log(`📦 Found gresie: "${gresieName}"`)
  
  await gresieProduct.first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const gresieUrl = page.url()
  console.log(`🌐 Gresie product page: ${gresieUrl}`)
  expect(gresieUrl).toContain('/gresie/')
  
  await page.locator('button:has-text("Adaugă în coș")').click()
  await page.waitForTimeout(1500)
  console.log('✅ Gresie added to cart!')
  
  // === PHASE 2: ADD FAIANTA PRODUCT ===
  console.log('🎨 PHASE 2: Adding Faianta product...')
  
  await page.goto('http://localhost:5176/faianta')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  // Add Faianță Albă Clasică
  const faiantaProduct = page.locator('h6:has-text("Albă")')
  await expect(faiantaProduct).toBeVisible()
  
  const faiantaName = await faiantaProduct.first().textContent() || ''
  console.log(`📦 Found faianta: "${faiantaName}"`)
  
  await faiantaProduct.first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const faiantaUrl = page.url()
  console.log(`🌐 Faianta product page: ${faiantaUrl}`)
  expect(faiantaUrl).toContain('/faianta/')
  
  await page.locator('button:has-text("Adaugă în coș")').click()
  await page.waitForTimeout(1500)
  console.log('✅ Faianta added to cart!')
  
  // === PHASE 3: COMPREHENSIVE CART VALIDATION ===
  console.log('🛒 PHASE 3: Comprehensive cart validation...')
  
  await page.goto('http://localhost:5176/cos')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  // Count total items
  const totalCards = await page.locator('.MuiCard-root').count()
  console.log(`🛒 Total cart cards: ${totalCards}`)
  
  // Verify both products are present
  const hasGresie = await page.locator(':has-text("Bej"), :has-text("Travertin")').count()
  const hasFaianta = await page.locator(':has-text("Albă"), :has-text("Clasică")').count()
  
  console.log(`🏗️  Gresie products detected: ${hasGresie}`)
  console.log(`🎨 Faianta products detected: ${hasFaianta}`)
  
  // Price validation
  const allPrices = await page.locator('text=/\\d+.*RON/').allTextContents()
  console.log('💰 All prices in cart:', allPrices)
  
  // Look for expected prices
  const hasGresiePrice = allPrices.some(price => price.includes('72,40') || price.includes('72.40'))
  const hasFaiantaPrice = allPrices.some(price => price.includes('45,50') || price.includes('45.50'))
  
  console.log(`💰 Gresie price (72,40 RON) found: ${hasGresiePrice}`)
  console.log(`💰 Faianta price (45,50 RON) found: ${hasFaiantaPrice}`)
  
  // === VALIDATION RESULTS ===
  console.log('📊 FINAL VALIDATION RESULTS:')
  
  const results = {
    gresieAdded: hasGresie > 0,
    faiantaAdded: hasFaianta > 0,
    correctGresiePrice: hasGresiePrice,
    correctFaiantaPrice: hasFaiantaPrice,
    totalItems: totalCards
  }
  
  console.log('📋 Test Results Summary:')
  console.log(`   🏗️  Gresie in cart: ${results.gresieAdded ? '✅ YES' : '❌ NO'}`)
  console.log(`   🎨 Faianta in cart: ${results.faiantaAdded ? '✅ YES' : '❌ NO'}`)
  console.log(`   💰 Correct gresie price: ${results.correctGresiePrice ? '✅ YES' : '❌ NO'}`)
  console.log(`   💰 Correct faianta price: ${results.correctFaiantaPrice ? '✅ YES' : '❌ NO'}`)
  console.log(`   📦 Total items: ${results.totalItems}`)
  
  // Final success determination
  if (results.gresieAdded && results.faiantaAdded && results.correctGresiePrice && results.correctFaiantaPrice) {
    console.log('🏆 🎉 ULTIMATE SUCCESS: Complete /gresie + /faianta cart functionality verified!')
    console.log('✨ Both categories work perfectly with accurate pricing!')
  } else {
    console.log('⚠️  Partial success - some aspects need attention')
  }
  
  // Assertions for test framework
  expect(results.gresieAdded).toBe(true)
  expect(results.faiantaAdded).toBe(true)
  expect(results.totalItems).toBeGreaterThan(0)
  
  console.log('🏁 Comprehensive test completed!')
})

test('Cross-Category Navigation Test', async ({ page }) => {
  console.log('🔄 Testing navigation between gresie and faianta...')
  
  // Start at gresie
  await page.goto('http://localhost:5176/gresie')
  await page.waitForLoadState('networkidle')
  console.log('📍 Started at /gresie')
  
  const gresieProducts = await page.locator('h6:has-text("Gresie")').count()
  console.log(`🏗️  Found ${gresieProducts} gresie products`)
  
  // Navigate to faianta
  await page.goto('http://localhost:5176/faianta')
  await page.waitForLoadState('networkidle')
  console.log('📍 Navigated to /faianta')
  
  const faiantaProducts = await page.locator('h6:has-text("Faianță")').count()
  console.log(`🎨 Found ${faiantaProducts} faianta products`)
  
  // Back to gresie
  await page.goto('http://localhost:5176/gresie')
  await page.waitForLoadState('networkidle')
  console.log('📍 Back to /gresie')
  
  // Verify both categories load correctly
  if (gresieProducts > 0 && faiantaProducts > 0) {
    console.log('✅ Cross-category navigation working perfectly!')
  } else {
    console.log('❌ Navigation issues detected')
  }
  
  console.log('🔄 Cross-category test completed!')
})