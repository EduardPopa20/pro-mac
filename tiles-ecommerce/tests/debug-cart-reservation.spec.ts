import { test, expect } from '@playwright/test'

test('Debug cart reservation issue', async ({ page }) => {
  // Navigate to homepage
  await page.goto('http://localhost:5177')
  
  // Wait for page load
  await page.waitForLoadState('networkidle', { timeout: 10000 })
  
  // Take a screenshot to see the current state
  await page.screenshot({ path: 'tests/screenshots/homepage-debug.png', fullPage: true })
  
  // Check if there are any console errors
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  // Check if the site loads properly
  console.log('Current URL:', page.url())
  console.log('Page title:', await page.title())
  
  // Wait a bit more to catch any delayed errors
  await page.waitForTimeout(3000)
  
  if (errors.length > 0) {
    console.log('Console errors found:', errors)
  } else {
    console.log('No console errors detected')
  }
  
  // Check if we can find any navigation elements
  const homeLink = page.getByRole('link', { name: /acasa|home/i }).first()
  const productsLink = page.getByRole('link', { name: /produse|categorii/i }).first()
  const cartButton = page.getByRole('button', { name: /cos|cart/i }).first()
  
  console.log('Home link visible:', await homeLink.isVisible().catch(() => false))
  console.log('Products link visible:', await productsLink.isVisible().catch(() => false))
  console.log('Cart button visible:', await cartButton.isVisible().catch(() => false))
  
  // Check localStorage for any cart session
  const sessionId = await page.evaluate(() => {
    return {
      cartSessionOld: localStorage.getItem('cart-session-id'),
      cartSessionNew: localStorage.getItem('cart_session_id'),
      cartStorage: localStorage.getItem('cart-storage')
    }
  })
  
  console.log('LocalStorage data:', sessionId)
})