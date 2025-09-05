import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'
import { ProductCatalogPage } from './page-objects/ProductCatalogPage'
import { ProductDetailPage } from './page-objects/ProductDetailPage'
import { CartPage, type CartItemData } from './page-objects/CartPage'

test.describe('E2E Cart Functionality - Gresie & Faianta', () => {
  
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

  test.describe('Add to Cart from /gresie Category', () => {
    test('should add single product to cart from gresie category', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Step 1: Navigate to gresie category
      await catalogPage.navigateToGresie()
      await catalogPage.validateBreadcrumbs(['Acasă', 'Gresie'])
      
      // Step 2: Verify products are loaded
      const productCount = await catalogPage.getProductCount()
      expect(productCount).toBeGreaterThan(0)
      
      // Step 3: Get first product details from catalog
      const catalogProductDetails = await catalogPage.getFirstProductDetails()
      expect(catalogProductDetails.name).toBeTruthy()
      
      // Step 4: Click on first product
      await catalogPage.clickFirstProduct()
      
      // Step 5: Validate product detail page
      await detailPage.validateProductPageStructure()
      await detailPage.validateBreadcrumbs(['Acasă', 'Gresie', catalogProductDetails.name])
      
      // Step 6: Get detailed product information
      const productDetails = await detailPage.getProductDetails()
      expect(productDetails.name).toBe(catalogProductDetails.name)
      
      // Step 7: Add product to cart with default quantity (1)
      await detailPage.addToCart()
      await detailPage.validateAddToCartSuccess(productDetails.name, 1)
      
      // Step 8: Navigate to cart page
      await cartPage.navigateToCart()
      
      // Step 9: Validate cart page structure and content
      await cartPage.validateCartPageStructure()
      await cartPage.validateBreadcrumbs()
      
      // Step 10: Validate cart contains the added product
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      expect(await cartPage.getCartItemsCount()).toBe(1)
      
      const cartItemData = await cartPage.getCartItemData(0)
      expect(cartItemData.productName).toBe(productDetails.name)
      expect(cartItemData.quantity).toBe(1)
      
      // Step 11: Validate total calculation
      await cartPage.validateTotalCalculation()
    })

    test('should add multiple quantities of same product from gresie', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Navigate and select product
      await catalogPage.navigateToGresie()
      const catalogProductDetails = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      
      // Add 3 units of the product
      const targetQuantity = 3
      const addedProduct = await detailPage.addToCartWithExpectedQuantity(targetQuantity)
      
      // Validate cart
      await cartPage.navigateToCart()
      await cartPage.validateCartAfterProductAddition({
        name: addedProduct.productName,
        quantity: targetQuantity,
        price: addedProduct.price
      })
    })

    test('should handle multiple different products from gresie category', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      const addedProducts: Array<{ name: string; quantity: number; price: string }> = []

      // Add first product
      await catalogPage.navigateToGresie()
      const productNames = await catalogPage.getAllVisibleProductNames()
      
      if (productNames.length >= 2) {
        // Add first product
        await catalogPage.clickProductByIndex(0)
        const firstProductDetails = await detailPage.getProductDetails()
        await detailPage.addToCart(2)
        addedProducts.push({
          name: firstProductDetails.name,
          quantity: 2,
          price: firstProductDetails.price
        })
        
        // Go back and add second product
        await catalogPage.navigateToGresie()
        await catalogPage.clickProductByIndex(1)
        const secondProductDetails = await detailPage.getProductDetails()
        await detailPage.addToCart(1)
        addedProducts.push({
          name: secondProductDetails.name,
          quantity: 1,
          price: secondProductDetails.price
        })
        
        // Validate cart contains both products
        await cartPage.navigateToCart()
        expect(await cartPage.getCartItemsCount()).toBe(2)
        
        // Validate each product in cart
        for (let i = 0; i < addedProducts.length; i++) {
          await cartPage.validateCartItem({
            productName: addedProducts[i].name,
            quantity: addedProducts[i].quantity,
            price: addedProducts[i].price,
            totalPrice: '' // Will be calculated by the validation method
          }, i)
        }
        
        await cartPage.validateTotalCalculation()
      } else {
        test.skip('Not enough products in gresie category for this test')
      }
    })
  })

  test.describe('Add to Cart from /faianta Category', () => {
    test('should add product to cart from faianta category', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Step 1: Navigate to faianta category
      await catalogPage.navigateToFaianta()
      await catalogPage.validateBreadcrumbs(['Acasă', 'Faianță'])
      
      // Step 2: Verify products are loaded and select first one
      const productCount = await catalogPage.getProductCount()
      expect(productCount).toBeGreaterThan(0)
      
      const catalogProductDetails = await catalogPage.getFirstProductDetails()
      await catalogPage.clickFirstProduct()
      
      // Step 3: Add product to cart
      const productDetails = await detailPage.getProductDetails()
      await detailPage.validateQuantityControls()
      await detailPage.addToCart(2)
      
      // Step 4: Validate cart contains the product
      await cartPage.navigateToCart()
      await cartPage.validateCartAfterProductAddition({
        name: productDetails.name,
        quantity: 2,
        price: productDetails.price
      })
    })

    test('should add products from both gresie and faianta to same cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      const addedProducts: Array<{ name: string; quantity: number; price: string; category: string }> = []

      // Add product from gresie
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const gresieProduct = await detailPage.getProductDetails()
      await detailPage.addToCart(1)
      addedProducts.push({
        name: gresieProduct.name,
        quantity: 1,
        price: gresieProduct.price,
        category: 'Gresie'
      })

      // Add product from faianta
      await catalogPage.navigateToFaianta()
      await catalogPage.clickFirstProduct()
      const faiantaProduct = await detailPage.getProductDetails()
      await detailPage.addToCart(3)
      addedProducts.push({
        name: faiantaProduct.name,
        quantity: 3,
        price: faiantaProduct.price,
        category: 'Faianță'
      })

      // Validate cart contains products from both categories
      await cartPage.navigateToCart()
      expect(await cartPage.getCartItemsCount()).toBe(2)
      
      const totalItems = await cartPage.getTotalItemsFromCounter()
      expect(totalItems).toBe(4) // 1 + 3 = 4 total items
      
      await cartPage.validateTotalCalculation()
    })
  })

  test.describe('Cart Management and Updates', () => {
    test('should update product quantities in cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add a product to cart
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(1)

      // Go to cart and update quantity
      await cartPage.navigateToCart()
      await cartPage.updateQuantity(0, 5)
      
      // Validate quantity was updated
      await cartPage.validateCartUpdatesAfterQuantityChange(productDetails.name, 5)
      
      // Test increment/decrement buttons
      await cartPage.incrementQuantity(0)
      await cartPage.validateCartUpdatesAfterQuantityChange(productDetails.name, 6)
      
      await cartPage.decrementQuantity(0)
      await cartPage.validateCartUpdatesAfterQuantityChange(productDetails.name, 5)
    })

    test('should remove individual products from cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add two different products
      await catalogPage.navigateToGresie()
      const productNames = await catalogPage.getAllVisibleProductNames()
      
      if (productNames.length >= 2) {
        // Add first product
        await catalogPage.clickProductByIndex(0)
        const firstProduct = await detailPage.getProductDetails()
        await detailPage.addToCart(1)
        
        // Add second product
        await catalogPage.navigateToGresie()
        await catalogPage.clickProductByIndex(1)
        const secondProduct = await detailPage.getProductDetails()
        await detailPage.addToCart(1)
        
        // Go to cart and verify both products
        await cartPage.navigateToCart()
        expect(await cartPage.getCartItemsCount()).toBe(2)
        
        // Remove first product
        await cartPage.removeCartItemByName(firstProduct.name)
        
        // Verify only second product remains
        expect(await cartPage.getCartItemsCount()).toBe(1)
        const remainingItem = await cartPage.getCartItemData(0)
        expect(remainingItem.productName).toBe(secondProduct.name)
      } else {
        test.skip('Not enough products for this test')
      }
    })

    test('should clear entire cart', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add multiple products to cart
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      await detailPage.addToCart(2)
      
      await catalogPage.navigateToGresie()
      if (await catalogPage.getProductCount() > 1) {
        await catalogPage.clickProductByIndex(1)
        await detailPage.addToCart(1)
      }

      // Verify cart has products
      await cartPage.navigateToCart()
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      
      // Clear cart
      await cartPage.clearCart()
      
      // Verify cart is empty
      expect(await cartPage.isCartEmpty()).toBeTruthy()
      await cartPage.validateCartPageStructure() // Should show empty state
    })
  })

  test.describe('Cart Navigation and User Flow', () => {
    test('should maintain cart state across navigation', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product to cart
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(2)

      // Navigate away and back
      await catalogPage.navigateToFaianta()
      await cartPage.navigateToCart()

      // Verify cart still contains the product
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      const cartItemData = await cartPage.getCartItemData(0)
      expect(cartItemData.productName).toBe(productDetails.name)
      expect(cartItemData.quantity).toBe(2)
    })

    test('should navigate to cart via header icon', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add product to cart
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(1)

      // Navigate to cart via header icon
      await cartPage.navigateToCartViaIcon()

      // Verify we're on cart page with correct content
      expect(page.url()).toContain('/cos')
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      
      const cartItemData = await cartPage.getCartItemData(0)
      expect(cartItemData.productName).toBe(productDetails.name)
    })

    test('should handle continue shopping from empty cart', async ({ page }) => {
      const cartPage = new CartPage(page)

      // Go to cart page (should be empty initially)
      await cartPage.navigateToCart()
      expect(await cartPage.isCartEmpty()).toBeTruthy()

      // Click continue shopping
      await cartPage.continueShopping()

      // Should navigate back to a product catalog or home page
      expect(page.url()).not.toContain('/cos')
    })
  })

  test.describe('Responsive Cart Functionality', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await setViewport(page, 'xs')
      
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Test full flow on mobile
      await catalogPage.navigateToGresie()
      await catalogPage.validateResponsiveDesign()
      
      await catalogPage.clickFirstProduct()
      await detailPage.validateResponsiveDesign()
      
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(1)

      await cartPage.navigateToCart()
      await cartPage.validateResponsiveDesign()
      
      // Verify cart functionality on mobile
      expect(await cartPage.isCartEmpty()).toBeFalsy()
      const cartItemData = await cartPage.getCartItemData(0)
      expect(cartItemData.productName).toBe(productDetails.name)
    })

    test('should work correctly on tablet devices', async ({ page }) => {
      await setViewport(page, 'md')
      
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Test full flow on tablet
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      
      const productDetails = await detailPage.getProductDetails()
      await detailPage.addToCart(3)

      await cartPage.navigateToCart()
      
      // Test quantity updates on tablet
      await cartPage.updateQuantity(0, 5)
      await cartPage.validateCartUpdatesAfterQuantityChange(productDetails.name, 5)
      
      // Ensure no horizontal scroll
      await cartPage.validateNoHorizontalScroll()
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle adding out-of-stock products', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)

      await catalogPage.navigateToGresie()
      
      // Try to find and click a product
      await catalogPage.clickFirstProduct()
      
      // Check if product is available
      const isAvailable = await detailPage.isProductAvailable()
      
      if (!isAvailable) {
        // Verify add to cart button is disabled
        await expect(detailPage.addToCartButton).toBeDisabled()
        
        // Verify stock message is shown
        await expect(detailPage.addToCartButton).toContainText('Stoc epuizat')
      } else {
        test.skip('No out-of-stock products found for this test')
      }
    })

    test('should handle invalid quantity inputs', async ({ page }) => {
      const catalogPage = new ProductCatalogPage(page)
      const detailPage = new ProductDetailPage(page)
      const cartPage = new CartPage(page)

      // Add a product to test quantity limits
      await catalogPage.navigateToGresie()
      await catalogPage.clickFirstProduct()
      await detailPage.addToCart(1)

      await cartPage.navigateToCart()
      
      // Try to set quantity to 0 (should remove item or reset to 1)
      await cartPage.updateQuantity(0, 0)
      
      // Either item should be removed or quantity should be reset
      const cartCount = await cartPage.getCartItemsCount()
      if (cartCount > 0) {
        const itemData = await cartPage.getCartItemData(0)
        expect(itemData.quantity).toBeGreaterThan(0)
      }
    })
  })
})