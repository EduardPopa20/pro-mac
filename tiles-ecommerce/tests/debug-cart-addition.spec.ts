import { test, expect } from '@playwright/test'

test('Debug cart addition step by step', async ({ page }) => {
  // Intercept console messages
  const consoleMessages: string[] = []
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
  })
  
  // Intercept network requests to see Supabase calls
  const networkCalls: string[] = []
  page.on('request', req => {
    if (req.url().includes('supabase')) {
      networkCalls.push(`${req.method()} ${req.url()}`)
    }
  })
  
  page.on('response', resp => {
    if (resp.url().includes('supabase') && !resp.ok()) {
      networkCalls.push(`FAILED: ${resp.status()} ${resp.url()}`)
    }
  })
  
  console.log('🔍 Starting debug test...')
  
  // Go to homepage
  await page.goto('http://localhost:5177')
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  
  console.log('✅ Homepage loaded')
  
  // Try to find products section and click on first product
  await page.waitForSelector('.MuiCard-root', { timeout: 10000 })
  
  const productCards = page.locator('.MuiCard-root')
  const cardCount = await productCards.count()
  console.log(`📦 Found ${cardCount} product cards`)
  
  if (cardCount > 0) {
    // Click on first product card
    await productCards.first().click()
    await page.waitForLoadState('networkidle', { timeout: 10000 })
    
    console.log('🎯 Clicked on first product, waiting for product detail page...')
    
    // Wait for product detail page and find "Adaugă în coș" button
    const addToCartButton = page.getByRole('button', { name: /adaug.*cos/i })
    await expect(addToCartButton).toBeVisible({ timeout: 10000 })
    
    console.log('🛒 Found "Adaugă în coș" button')
    
    // Check localStorage before adding to cart
    const beforeStorage = await page.evaluate(() => ({
      cartSessionId: localStorage.getItem('cart-session-id'),
      cartStorage: localStorage.getItem('cart-storage')
    }))
    console.log('📱 localStorage BEFORE:', beforeStorage)
    
    // Click add to cart
    console.log('🔄 Clicking "Adaugă în coș"...')
    await addToCartButton.click()
    
    // Wait for cart operation to complete
    await page.waitForTimeout(3000)
    
    // Check localStorage after adding to cart
    const afterStorage = await page.evaluate(() => ({
      cartSessionId: localStorage.getItem('cart-session-id'),
      cartStorage: localStorage.getItem('cart-storage')
    }))
    console.log('📱 localStorage AFTER:', afterStorage)
    
    // Check cart icon for item count
    const cartIcon = page.locator('[data-testid="cart-icon"], .MuiBadge-root').first()
    const hasItems = await cartIcon.isVisible()
    console.log('🛒 Cart icon has items:', hasItems)
    
    if (hasItems) {
      const badgeText = await cartIcon.textContent().catch(() => 'no text')
      console.log('🔢 Cart badge text:', badgeText)
    }
  }
  
  // Print all console messages and network calls
  console.log('\n📝 Console Messages:')
  consoleMessages.forEach(msg => console.log(msg))
  
  console.log('\n🌐 Network Calls:')
  networkCalls.forEach(call => console.log(call))
  
  console.log('\n✅ Debug test completed')
})