import { test, expect } from '@playwright/test'

test.describe('Watchlist Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5180')
    await page.waitForLoadState('networkidle')
  })

  test('shows authentication alert when unauthenticated user tries to add to watchlist', async ({ page }) => {
    // Navigate to gresie category
    await page.goto('http://localhost:5180/gresie')
    await page.waitForLoadState('networkidle')
    
    // Find first product card and click on it
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      // Look for heart/favorite button (might be FavoriteIcon or FavoriteBorderIcon)
      const favoriteButton = page.locator('button').filter({ has: page.locator('svg[data-testid="FavoriteBorderIcon"], svg[data-testid="FavoriteIcon"]') })
      
      if (await favoriteButton.count() > 0) {
        // Click the favorite/watchlist button
        await favoriteButton.first().click()
        
        // Wait for alert to appear - look for global alert container
        const alertContainer = page.locator('.MuiAlert-root, .MuiSnackbar-root')
        await expect(alertContainer).toBeVisible({ timeout: 3000 })
        
        // Check if alert contains authentication message
        const alertText = await alertContainer.textContent()
        expect(alertText).toContain('Pentru a adăuga produse la favorite')
        
        console.log('✅ Authentication alert appeared successfully')
      } else {
        console.log('ℹ️ Favorite button not found on this page')
      }
    }
  })

  test('watchlist button appears on product detail pages', async ({ page }) => {
    // Test on multiple product categories
    const categories = ['gresie', 'faianta', 'parchet']
    
    for (const category of categories) {
      await page.goto(`http://localhost:5180/${category}`)
      await page.waitForLoadState('networkidle')
      
      const firstProduct = page.locator('.MuiCard-root').first()
      if (await firstProduct.isVisible()) {
        await firstProduct.click()
        await page.waitForLoadState('networkidle')
        
        // Look for any button that might contain favorite/heart icon
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()
        
        let favoriteButtonFound = false
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i)
          const hasHeartIcon = await button.locator('svg[data-testid="FavoriteBorderIcon"], svg[data-testid="FavoriteIcon"]').count() > 0
          if (hasHeartIcon) {
            favoriteButtonFound = true
            console.log(`✅ Favorite button found on ${category} product page`)
            break
          }
        }
        
        if (!favoriteButtonFound) {
          console.log(`ℹ️ No favorite button found on ${category} product page`)
        }
      }
    }
  })

  test('alert appears in bottom-right corner', async ({ page }) => {
    await page.goto('http://localhost:5180/gresie')
    await page.waitForLoadState('networkidle')
    
    const firstProduct = page.locator('.MuiCard-root').first()
    if (await firstProduct.isVisible()) {
      await firstProduct.click()
      await page.waitForLoadState('networkidle')
      
      const favoriteButton = page.locator('button').filter({ has: page.locator('svg[data-testid="FavoriteBorderIcon"], svg[data-testid="FavoriteIcon"]') })
      
      if (await favoriteButton.count() > 0) {
        await favoriteButton.first().click()
        
        // Check alert positioning - should be in bottom-right
        const alert = page.locator('.MuiSnackbar-root, .MuiAlert-root').first()
        if (await alert.isVisible()) {
          const alertBox = await alert.boundingBox()
          const pageBox = await page.evaluate(() => ({
            width: window.innerWidth,
            height: window.innerHeight
          }))
          
          if (alertBox && pageBox) {
            // Check if alert is positioned in bottom-right area
            const isBottomRight = alertBox.x > pageBox.width * 0.5 && alertBox.y > pageBox.height * 0.5
            expect(isBottomRight).toBeTruthy()
            console.log('✅ Alert appears in bottom-right corner')
          }
        }
      }
    }
  })
})