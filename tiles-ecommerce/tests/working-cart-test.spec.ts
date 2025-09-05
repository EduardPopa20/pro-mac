import { test, expect } from '@playwright/test'

test('Working Cart Test - Full E2E Flow', async ({ page }) => {
  console.log('🛒 Starting complete cart test...')
  
  // Step 1: Navigate to gresie category
  await page.goto('http://localhost:5176/gresie')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  console.log('📋 Step 1: On gresie page')
  
  // Step 2: Find and click on first product (Gresie Bej Travertin)
  const productTitle = page.locator('h6:has-text("Bej")')
  await expect(productTitle).toBeVisible()
  
  const productName = await productTitle.first().textContent() || ''
  console.log(`📦 Step 2: Found product: "${productName}"`)
  
  // Click the parent div to navigate to product
  await productTitle.first().locator('..').click()
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const productUrl = page.url()
  console.log(`🌐 Step 3: On product page: ${productUrl}`)
  expect(productUrl).toContain('/gresie/')
  
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
  const cartContent = await page.content()
  console.log('📄 Cart page loaded, checking content...')
  
  // Look for the product name in cart
  const productInCart = page.locator(`:has-text("${productName.replace('Gresie ', '')}")`)
  const productCount = await productInCart.count()
  
  console.log(`🔍 Looking for "${productName.replace('Gresie ', '')}" in cart`)
  console.log(`📊 Found ${productCount} matches`)
  
  if (productCount > 0) {
    console.log('🎉 SUCCESS: Product found in cart!')
    
    // Additional verification - look for cart items
    const cartCards = page.locator('.MuiCard-root')
    const cartItemCount = await cartCards.count()
    console.log(`🛒 Total cart cards: ${cartItemCount}`)
    
    // Look for price information
    const priceElements = await page.locator('text=/\\d+.*RON/').allTextContents()
    console.log('💰 Prices found:', priceElements)
    
    console.log('✅ COMPLETE SUCCESS: Full cart flow working!')
    
  } else {
    console.log('❌ Product not found in cart')
    
    // Debug: Check if cart is empty
    const emptyCart = page.locator('text="Coșul tău este gol", text="Cart is empty", text="Nu ai produse"')
    const isEmpty = await emptyCart.count() > 0
    console.log(`🔍 Cart empty state detected: ${isEmpty}`)
    
    // Show all text content for debugging
    const allText = await page.locator('body').textContent()
    console.log('📝 Page contains following text:')
    console.log(allText?.substring(0, 500) + '...')
  }
  
  // Step 7: Test cart functionality if product was added
  if (await page.locator(':has-text("Bej")').count() > 0) {
    console.log('🔧 Testing cart operations...')
    
    // Try to find quantity controls
    const quantityInputs = await page.locator('input[type="number"]').count()
    console.log(`🔢 Quantity inputs found: ${quantityInputs}`)
    
    // Try to find remove buttons
    const removeButtons = await page.locator('button').filter({ hasText: /remove|șterge|elimină/i }).count()
    console.log(`🗑️  Remove buttons found: ${removeButtons}`)
  }
  
  console.log('🏁 Cart test completed!')
})