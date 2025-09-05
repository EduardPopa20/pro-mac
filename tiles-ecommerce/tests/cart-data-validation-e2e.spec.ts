import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'
import { ProductCatalogPage } from './page-objects/ProductCatalogPage'
import { ProductDetailPage } from './page-objects/ProductDetailPage'
import { CartPage, type CartItemData } from './page-objects/CartPage'

test.describe('E2E Cart Data Validation - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent testing
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    })
    
    await waitForFontsLoaded(page)
  })

  test.describe('Cart Data Accuracy and Integrity', () => {
    test('should display correct product information in cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Step 1: Capture product details from catalog
      await catalogPage.navigateToGresie()
      const catalogProductDetails = await catalogPage.getFirstProductDetails()
      
      // Step 2: Navigate to product detail and capture detailed information
      await catalogPage.clickFirstProduct()
      const detailProductInfo = await detailPage.getProductDetails()
      
      // Step 3: Add to cart with specific quantity
      const testQuantity = 2
      await detailPage.setQuantity(testQuantity)
      await detailPage.addToCart()
      
      // Step 4: Navigate to cart and validate all data matches
      await cartPage.navigateToCart()
      
      const cartItemData = await cartPage.getCartItemData(0)
      
      // Validate product name consistency
      expect(cartItemData.productName).toBe(detailProductInfo.name)
      expect(cartItemData.productName).toBe(catalogProductDetails.name)
      
      // Validate quantity is correct
      expect(cartItemData.quantity).toBe(testQuantity)
      
      // Validate price consistency (unit price should match)
      const detailPrice = detailProductInfo.price.replace(/[^\d.,]/g, '')
      const cartPrice = cartItemData.price.replace(/[^\d.,]/g, '')
      expect(cartPrice).toBe(detailPrice)
      
      // Validate total price calculation
      const unitPrice = parseFloat(detailPrice)
      const expectedTotal = unitPrice * testQuantity
      const cartTotalPrice = parseFloat(cartItemData.totalPrice.replace(/[^\d.,]/g, ''))
      expect(cartTotalPrice).toBeCloseTo(expectedTotal, 2)
    })

    test('should maintain data accuracy with multiple products', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      const testProducts: Array<{
        catalogInfo: any
        detailInfo: any
        quantity: number
        category: string
      }> = []

      // Add product from Gresie
      await catalogPage.navigateToGresie()
      const gresieProductCatalog = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      const gresieProductDetail = await detailPage.getProductDetails()
      await detailPage.addToCart(3)
      
      testProducts.push({
        catalogInfo: gresieProductCatalog,
        detailInfo: gresieProductDetail,
        quantity: 3,
        category: 'Gresie'
      })

      // Add product from Faianta
      await catalogPage.navigateToFaianta()
      const faiantaProductCatalog = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      const faiantaProductDetail = await detailPage.getProductDetails()
      await detailPage.addToCart(1)
      
      testProducts.push({
        catalogInfo: faiantaProductCatalog,
        detailInfo: faiantaProductDetail,
        quantity: 1,
        category: 'Faianță'
      })

      // Navigate to cart and validate all products
      await cartPage.navigateToCart()
      
      const cartItemsCount = await cartPage.getCartItemsCount()
      expect(cartItemsCount).toBe(2)
      
      // Validate each product's data integrity
      for (let i = 0; i < testProducts.length; i++) {
        const cartItemData = await cartPage.getCartItemData(i)
        const testProduct = testProducts.find(p => p.detailInfo.name === cartItemData.productName)
        
        expect(testProduct).toBeTruthy()
        if (testProduct) {
          // Name consistency
          expect(cartItemData.productName).toBe(testProduct.detailInfo.name)
          expect(cartItemData.productName).toBe(testProduct.catalogInfo.name)
          
          // Quantity accuracy
          expect(cartItemData.quantity).toBe(testProduct.quantity)
          
          // Price consistency
          const expectedPrice = testProduct.detailInfo.price.replace(/[^\d.,]/g, '')
          const actualPrice = cartItemData.price.replace(/[^\d.,]/g, '')
          expect(actualPrice).toBe(expectedPrice)
        }
      }
      
      // Validate grand total calculation
      await cartPage.validateTotalCalculation()
    })

    test('should update data correctly when quantities change', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product with initial quantity
      await catalogPage.navigateToGresie()
      const productDetails = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      const detailInfo = await detailPage.getProductDetails()
      
      const initialQuantity = 2
      await detailPage.addToCart(initialQuantity)
      
      // Navigate to cart and capture initial state
      await cartPage.navigateToCart()
      const initialCartData = await cartPage.getCartItemData(0)
      
      expect(initialCartData.quantity).toBe(initialQuantity)
      
      // Update quantity using increment
      await cartPage.incrementQuantity(0)
      const afterIncrementData = await cartPage.getCartItemData(0)
      
      expect(afterIncrementData.quantity).toBe(initialQuantity + 1)
      expect(afterIncrementData.productName).toBe(initialCartData.productName)
      
      // Validate total price updated correctly
      const unitPrice = parseFloat(initialCartData.price.replace(/[^\d.,]/g, ''))
      const expectedNewTotal = unitPrice * (initialQuantity + 1)
      const actualNewTotal = parseFloat(afterIncrementData.totalPrice.replace(/[^\d.,]/g, ''))
      expect(actualNewTotal).toBeCloseTo(expectedNewTotal, 2)
      
      // Test manual quantity update
      const newQuantity = 5
      await cartPage.updateQuantity(0, newQuantity)
      const finalCartData = await cartPage.getCartItemData(0)
      
      expect(finalCartData.quantity).toBe(newQuantity)
      expect(finalCartData.productName).toBe(initialCartData.productName)
      
      const expectedFinalTotal = unitPrice * newQuantity
      const actualFinalTotal = parseFloat(finalCartData.totalPrice.replace(/[^\d.,]/g, ''))
      expect(actualFinalTotal).toBeCloseTo(expectedFinalTotal, 2)
      
      // Validate overall cart totals are still correct
      await cartPage.validateTotalCalculation()
    })
  })

  test.describe('Price Formatting and Currency Validation', () => {
    test('should display prices in correct Romanian format', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      await detailPage.addToCart(1)
      
      await cartPage.navigateToCart()
      const cartItemData = await cartPage.getCartItemData(0)
      
      // Validate Romanian price format (should contain "RON")
      expect(cartItemData.price).toContain('RON')
      expect(cartItemData.totalPrice).toContain('RON')
      
      // Validate price is numeric and positive
      const priceMatch = cartItemData.price.match(/(\d+(?:\.\d+)?)/)
      expect(priceMatch).toBeTruthy()
      if (priceMatch) {
        const priceValue = parseFloat(priceMatch[1])
        expect(priceValue).toBeGreaterThan(0)
      }
      
      // Validate total price format
      const totalPriceMatch = cartItemData.totalPrice.match(/(\d+(?:\.\d+)?)/)
      expect(totalPriceMatch).toBeTruthy()
      
      // Get cart grand total
      const grandTotal = await cartPage.getTotalPrice()
      expect(grandTotal).toContain('RON')
      
      const grandTotalMatch = grandTotal.match(/(\d+(?:\.\d+)?)/)
      expect(grandTotalMatch).toBeTruthy()
      if (grandTotalMatch) {
        const grandTotalValue = parseFloat(grandTotalMatch[1])
        expect(grandTotalValue).toBeGreaterThan(0)
      }
    })

    test('should calculate correct totals with decimal prices', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add multiple products with different quantities to test decimal calculations
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const firstProductDetail = await detailPage.getProductDetails()
      await detailPage.addToCart(3) // 3 units of first product
      
      await catalogPage.navigateToGresie()
      const productCount = await catalogPage.getProductCount()
      if (productCount > 1) {
        await catalogPage.clickProductByIndex(1)
        const secondProductDetail = await detailPage.getProductDetails()
        await detailPage.addToCart(2) // 2 units of second product
        
        // Navigate to cart and validate calculations
        await cartPage.navigateToCart()
        const cartItems = await cartPage.getAllCartItemsData()
        
        expect(cartItems.length).toBe(2)
        
        let calculatedTotal = 0
        for (const item of cartItems) {
          const unitPrice = parseFloat(item.price.replace(/[^\d.,]/g, ''))
          const itemTotal = unitPrice * item.quantity
          calculatedTotal += itemTotal
          
          // Validate individual item total
          const actualItemTotal = parseFloat(item.totalPrice.replace(/[^\d.,]/g, ''))
          expect(actualItemTotal).toBeCloseTo(itemTotal, 2)
        }
        
        // Validate grand total
        const displayedTotal = await cartPage.getTotalPrice()
        const displayedAmount = parseFloat(displayedTotal.replace(/[^\d.,]/g, ''))
        expect(displayedAmount).toBeCloseTo(calculatedTotal, 2)
      } else {
        test.skip('Need at least 2 products for decimal calculation test')
      }
    })
  })

  test.describe('Product Information Completeness', () => {
    test('should display all required product information in cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(1)
      
      await cartPage.navigateToCart()
      
      // Validate cart item has all required elements
      const cartItem = cartPage.cartItems.first()
      
      // Product name should be visible and non-empty
      const nameElement = cartItem.locator('h6, [variant="h6"], h5, [variant="h5"]')
      await expect(nameElement).toBeVisible()
      const name = await nameElement.textContent()
      expect(name?.trim()).toBeTruthy()
      
      // Product image should be visible
      const imageElement = cartItem.locator('img')
      await expect(imageElement).toBeVisible()
      const imageSrc = await imageElement.getAttribute('src')
      expect(imageSrc).toBeTruthy()
      
      // Price should be visible and formatted correctly
      const priceElement = cartItem.locator('text=/\\d+.*RON/')
      await expect(priceElement).toBeVisible()
      
      // Quantity input should be visible and functional
      const quantityInput = cartItem.locator('input[type="number"]')
      await expect(quantityInput).toBeVisible()
      const quantityValue = await quantityInput.inputValue()
      expect(parseInt(quantityValue)).toBeGreaterThan(0)
      
      // Quantity controls should be visible
      const incrementButton = cartItem.locator('button').filter({ has: page.locator('[data-testid="AddIcon"]') })
      const decrementButton = cartItem.locator('button').filter({ has: page.locator('[data-testid="RemoveIcon"]') })
      await expect(incrementButton).toBeVisible()
      await expect(decrementButton).toBeVisible()
      
      // Remove button should be visible
      const removeButton = cartItem.locator('button').filter({ has: page.locator('[data-testid="DeleteIcon"]') })
      await expect(removeButton).toBeVisible()
    })

    test('should preserve product details during cart operations', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product and capture initial details
      await catalogPage.navigateToGresie()
      const originalCatalogDetails = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      
      const originalDetailPageInfo = await detailPage.getProductDetails()
      await detailPage.addToCart(2)
      
      await cartPage.navigateToCart()
      const initialCartData = await cartPage.getCartItemData(0)
      
      // Perform various cart operations and verify data preservation
      
      // 1. Update quantity
      await cartPage.updateQuantity(0, 4)
      const afterQuantityUpdate = await cartPage.getCartItemData(0)
      
      expect(afterQuantityUpdate.productName).toBe(initialCartData.productName)
      expect(afterQuantityUpdate.price).toBe(initialCartData.price) // Unit price should remain same
      expect(afterQuantityUpdate.quantity).toBe(4)
      
      // 2. Navigate away and back
      await catalogPage.navigateToFaianta()
      await cartPage.navigateToCart()
      const afterNavigation = await cartPage.getCartItemData(0)
      
      expect(afterNavigation.productName).toBe(originalDetailPageInfo.name)
      expect(afterNavigation.quantity).toBe(4) // Quantity should be preserved
      
      // 3. Refresh page and verify persistence
      await page.reload()
      await cartPage.waitForCartToLoad()
      const afterRefresh = await cartPage.getCartItemData(0)
      
      expect(afterRefresh.productName).toBe(originalDetailPageInfo.name)
      expect(afterRefresh.quantity).toBe(4) // Should persist through refresh
      
      // Validate all data is still consistent with original product
      expect(afterRefresh.productName).toBe(originalCatalogDetails.name)
      expect(afterRefresh.productName).toBe(originalDetailPageInfo.name)
    })
  })

  test.describe('Cart State Persistence and Storage', () => {
    test('should persist cart data across browser sessions', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add products to cart
      await catalogPage.navigateToGresie()
      const productDetails = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      const detailInfo = await detailPage.getProductDetails()
      await detailPage.addToCart(3)
      
      await cartPage.navigateToCart()
      const initialCartData = await cartPage.getCartItemData(0)
      
      // Simulate browser refresh (which clears session but not localStorage)
      await page.reload()
      await cartPage.waitForCartToLoad()
      
      // Verify cart data persisted
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      const persistedCartData = await cartPage.getCartItemData(0)
      
      expect(persistedCartData.productName).toBe(initialCartData.productName)
      expect(persistedCartData.quantity).toBe(initialCartData.quantity)
      expect(persistedCartData.price).toBe(initialCartData.price)
    })

    test('should handle cart data consistency with multiple browser tabs', async ({ context, page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product in first tab
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(2)
      
      // Open second tab
      const secondTab = await context.newPage()
      const secondCartPage = new CartPage(secondTab)
      
      await secondCartPage.navigateToCart()
      
      // Verify cart is consistent in second tab
      expect(await secondCartPage.isCartEmpty()).toBeFalsy()
      const secondTabCartData = await secondCartPage.getCartItemData(0)
      
      expect(secondTabCartData.productName).toBe(productDetails.name)
      expect(secondTabCartData.quantity).toBe(2)
      
      // Update cart in second tab
      await secondCartPage.updateQuantity(0, 5)
      
      // Switch back to first tab and verify update is reflected
      await cartPage.navigateToCart()
      await page.reload() // Refresh to get latest data
      await cartPage.waitForCartToLoad()
      
      const updatedFirstTabData = await cartPage.getCartItemData(0)
      expect(updatedFirstTabData.quantity).toBe(5)
      
      await secondTab.close()
    })
  })

  test.describe('Data Validation Under Load and Stress', () => {
    test('should maintain data accuracy with rapid quantity changes', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product to cart
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(1)
      
      await cartPage.navigateToCart()
      
      // Perform rapid quantity changes
      for (let i = 0; i < 5; i++) {
        await cartPage.incrementQuantity(0)
        await page.waitForTimeout(100) // Small delay
      }
      
      // Verify final quantity is correct (1 + 5 = 6)
      const finalData = await cartPage.getCartItemData(0)
      expect(finalData.quantity).toBe(6)
      
      // Verify product name and price integrity maintained
      expect(finalData.productName).toBe(productDetails.name)
      
      // Verify total calculation is still accurate
      await cartPage.validateTotalCalculation()
    })

    test('should handle large quantities correctly', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      
      // Add large quantity
      const largeQuantity = 99
      await detailPage.setQuantity(largeQuantity)
      await detailPage.addToCart()
      
      await cartPage.navigateToCart()
      const cartData = await cartPage.getCartItemData(0)
      
      // Verify large quantity is handled correctly
      expect(cartData.quantity).toBe(largeQuantity)
      
      // Verify price calculations are accurate with large numbers
      const unitPrice = parseFloat(cartData.price.replace(/[^\d.,]/g, ''))
      const expectedTotal = unitPrice * largeQuantity
      const actualTotal = parseFloat(cartData.totalPrice.replace(/[^\d.,]/g, ''))
      
      expect(actualTotal).toBeCloseTo(expectedTotal, 2)
      
      // Verify grand total calculation is correct
      await cartPage.validateTotalCalculation()
    })
  })
})