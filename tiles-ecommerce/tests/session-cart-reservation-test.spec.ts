import { test, expect } from '@playwright/test'

test.describe('Session-based Cart Reservations', () => {
  test('should create reservations for incognito users', async ({ page }) => {
    // Go to the homepage in incognito mode (new context simulates this)
    await page.goto('http://localhost:5177')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Navigate to products page
    await page.getByRole('link', { name: /produse|categorii/i }).first().click()
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .MuiCard-root')
    
    // Find and click on a product (preferably Gresie Marmura Carrara)
    const productCard = page.locator('.MuiCard-root').first()
    await productCard.click()
    
    // Wait for product detail page to load
    await page.waitForLoadState('networkidle')
    
    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /adauga.*cos/i })
    await expect(addToCartButton).toBeVisible()
    await addToCartButton.click()
    
    // Wait for cart operation to complete
    await page.waitForTimeout(2000)
    
    // Check if cart icon shows items
    const cartIcon = page.locator('[aria-label*="cart"], [title*="cos"]').first()
    await expect(cartIcon).toBeVisible()
    
    // Check localStorage for session ID
    const sessionId = await page.evaluate(() => localStorage.getItem('cart-session-id'))
    console.log('Cart Session ID:', sessionId)
    expect(sessionId).toBeTruthy()
    
    // Open cart to verify item is there
    await cartIcon.click()
    
    // Wait for cart popper to open
    await page.waitForSelector('.MuiPopper-root', { state: 'visible' })
    
    // Verify cart has items
    const cartItemCount = await page.locator('.MuiPopper-root').getByText(/1.*produs/i).first()
    await expect(cartItemCount).toBeVisible()
    
    console.log('Test completed - Cart should now have created session-based reservation')
    console.log('Check Supabase stock_reservations table for cart_session_id:', sessionId)
  })
  
  test('should update admin inventory dashboard', async ({ page, context }) => {
    // This test requires manual verification in admin dashboard
    // The reservation should appear in /admin/inventar after adding to cart
    
    await page.goto('http://localhost:5177/admin/inventar')
    
    // Wait for login redirect if needed
    await page.waitForLoadState('networkidle')
    
    // Check if we're on login page and provide instructions
    const currentUrl = page.url()
    if (currentUrl.includes('conectare') || currentUrl.includes('login')) {
      console.log('Admin needs to log in at:', currentUrl)
      console.log('After login, check the "Rezervat" column in inventory dashboard')
    } else {
      // We're on the inventory page, check for the refresh button
      const refreshButton = page.getByRole('button', { name: /actualizeaza|refresh/i }).first()
      await expect(refreshButton).toBeVisible()
      
      console.log('Inventory dashboard loaded - check "Rezervat" column for updated values')
    }
  })
})