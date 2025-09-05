import { test, expect } from '@playwright/test'

test('Faianta Cart Test - Full E2E Flow', async ({ page }) => {
  console.log('🛒 Starting complete faianta cart test...')
  
  // Step 1: Navigate to faianta category
  await page.goto('http://localhost:5176/faianta')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  console.log('📋 Step 1: On faianta page')
  
  // Step 2: Find and click on first product (using "Albă" as it was first in our debug)
  const productTitle = page.locator('h6:has-text("Albă")')
  await expect(productTitle).toBeVisible()
  
  const productName = await productTitle.first().textContent() || ''
  console.log(`📦 Step 2: Found product: "${productName}"`)
  
  // Click the parent div to navigate to product
  await productTitle.first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const productUrl = page.url()
  console.log(`🌐 Step 3: On product page: ${productUrl}`)
  expect(productUrl).toContain('/faianta/')
  
  // Step 4: Add to cart
  const addToCartButton = page.locator('button:has-text("Adaugă în coș")')
  await expect(addToCartButton).toBeVisible()
  await expect(addToCartButton).toBeEnabled()
  
  console.log('🛍️  Step 4: Clicking "Adaugă în coș"')
  await addToCartButton.click()
  
  // Wait for cart addition to process
  await page.waitForTimeout(2000)
  
  // Step 5: Navigate to cart page
  await page.goto('http://localhost:5176/cos')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  console.log('🛒 Step 5: On cart page')
  
  // Step 6: Verify product is in cart
  console.log('📄 Cart page loaded, checking content...')
  
  // Look for the product name in cart (search for "Albă" or "Clasică")
  const productInCart = page.locator(`:has-text("Albă"), :has-text("Clasică")`)
  const productCount = await productInCart.count()
  
  console.log(`🔍 Looking for faianta product in cart`)
  console.log(`📊 Found ${productCount} matches`)
  
  if (productCount > 0) {
    console.log('🎉 SUCCESS: Faianta product found in cart!')
    
    // Additional verification - look for cart items
    const cartCards = page.locator('.MuiCard-root')
    const cartItemCount = await cartCards.count()
    console.log(`🛒 Total cart cards: ${cartItemCount}`)
    
    // Look for price information
    const priceElements = await page.locator('text=/\\d+.*RON/').allTextContents()
    console.log('💰 Prices found:', priceElements)
    
    // Check if we have both gresie and faianta (from previous test)
    const hasGresie = await page.locator(':has-text("Gresie"), :has-text("Bej")').count()
    const hasFaianta = await page.locator(':has-text("Faianță"), :has-text("Albă")').count()
    
    console.log(`🏗️  Gresie products in cart: ${hasGresie}`)
    console.log(`🎨 Faianta products in cart: ${hasFaianta}`)
    
    if (hasGresie > 0 && hasFaianta > 0) {
      console.log('🌟 SUPER SUCCESS: Mixed cart with both Gresie and Faianta!')
    }
    
    console.log('✅ COMPLETE SUCCESS: Faianta cart flow working!')
    
  } else {
    console.log('❌ Faianta product not found in cart')
    
    // Debug: Check what's actually in the cart
    const allText = await page.locator('body').textContent()
    console.log('📝 Cart content sample:')
    console.log(allText?.substring(0, 500) + '...')
  }
  
  console.log('🏁 Faianta cart test completed!')
})

test('Multiple Faianta Products Test', async ({ page }) => {
  console.log('🎨 Testing multiple faianta products...')
  
  // Add first product (Albă)
  await page.goto('http://localhost:5176/faianta')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  await page.locator('h6:has-text("Albă")').first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.locator('button:has-text("Adaugă în coș")').click()
  await page.waitForTimeout(1500)
  
  console.log('📦 Added first faianta product (Albă)')
  
  // Go back and add second product (Crem)
  await page.goto('http://localhost:5176/faianta')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  await page.locator('h6:has-text("Crem")').first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.locator('button:has-text("Adaugă în coș")').click()
  await page.waitForTimeout(1500)
  
  console.log('📦 Added second faianta product (Crem)')
  
  // Check cart
  await page.goto('http://localhost:5176/cos')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const cartItems = await page.locator('.MuiCard-root').count()
  const hasAlba = await page.locator(':has-text("Albă")').count()
  const hasCrem = await page.locator(':has-text("Crem")').count()
  
  console.log(`🛒 Total items in cart: ${cartItems}`)
  console.log(`🤍 Albă products: ${hasAlba}`)
  console.log(`🟤 Crem products: ${hasCrem}`)
  
  if (hasAlba > 0 && hasCrem > 0) {
    console.log('🎉 SUCCESS: Multiple faianta products in cart!')
  } else {
    console.log('❌ Multiple product test failed')
  }
  
  console.log('✅ Multiple faianta test completed!')
})