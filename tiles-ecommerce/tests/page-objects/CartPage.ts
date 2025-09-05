import { Page, Locator, expect } from '@playwright/test'

export interface CartItemData {
  productName: string
  quantity: number
  price: string
  totalPrice: string
}

export class CartPage {
  readonly page: Page
  readonly cartTitle: Locator
  readonly cartItems: Locator
  readonly emptyCartMessage: Locator
  readonly emptyCartIcon: Locator
  readonly continueShoppingButton: Locator
  readonly breadcrumbs: Locator
  readonly totalItemsCount: Locator
  readonly totalPrice: Locator
  readonly clearCartButton: Locator
  readonly checkoutButton: Locator
  readonly cartSummary: Locator

  constructor(page: Page) {
    this.page = page
    
    // Page elements
    this.cartTitle = page.locator('h1, h3, [variant="h1"], [variant="h3"]').filter({ hasText: /coș|cart/i }).first()
    this.breadcrumbs = page.locator('[role="navigation"], .MuiBreadcrumbs-root')
    
    // Cart content
    this.cartItems = page.locator('[data-testid="cart-item"], .MuiCard-root').filter({ has: page.locator('img') })
    this.cartSummary = page.locator('[data-testid="cart-summary"]')
    
    // Empty state
    this.emptyCartMessage = page.locator('text=Coșul tău este gol, text=Nu ai adăugat încă niciun produs')
    this.emptyCartIcon = page.locator('svg[data-testid*="ShoppingCart"], svg').filter({ hasText: /cart|coș/i }).first()
    this.continueShoppingButton = page.locator('button').filter({ hasText: /începe să cumperi|continuă cumpărăturile|explorează produse/i })
    
    // Totals and actions
    this.totalItemsCount = page.locator('[data-testid="total-items"], text=/\\d+\\s*(produs|produse|articol)/i')
    this.totalPrice = page.locator('[data-testid="total-price"], text=/total.*\\d+.*RON/i, text=/\\d+.*RON.*total/i')
    this.clearCartButton = page.locator('button').filter({ hasText: /golește coșul|șterge tot/i })
    this.checkoutButton = page.locator('button').filter({ hasText: /finalizează comanda|checkout|continuă/i })
  }

  // Navigation methods
  async navigateToCart() {
    await this.page.goto('/cos')
    await this.waitForCartToLoad()
  }

  async navigateToCartViaIcon() {
    // Click cart icon in header
    const cartIcon = this.page.locator('button').filter({ has: this.page.locator('svg[data-testid="ShoppingCartIcon"]') })
    await expect(cartIcon).toBeVisible()
    await cartIcon.click()
    
    // If popper appears, click "Vezi coșul" button
    const viewCartButton = this.page.locator('button').filter({ hasText: /vezi coșul|go to cart/i })
    if (await viewCartButton.isVisible()) {
      await viewCartButton.click()
    }
    
    await this.waitForCartToLoad()
  }

  // Wait methods
  async waitForCartToLoad() {
    await this.page.waitForLoadState('networkidle')
    
    // Wait for either cart items or empty state to appear
    await Promise.race([
      this.cartItems.first().waitFor({ state: 'visible', timeout: 5000 }),
      this.emptyCartMessage.waitFor({ state: 'visible', timeout: 5000 })
    ])
  }

  // Cart state methods
  async isCartEmpty(): Promise<boolean> {
    await this.waitForCartToLoad()
    return await this.emptyCartMessage.isVisible()
  }

  async getCartItemsCount(): Promise<number> {
    if (await this.isCartEmpty()) {
      return 0
    }
    return await this.cartItems.count()
  }

  async getTotalItemsFromCounter(): Promise<number> {
    if (await this.totalItemsCount.isVisible()) {
      const text = await this.totalItemsCount.textContent() || '0'
      const match = text.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }
    return 0
  }

  async getTotalPrice(): Promise<string> {
    if (await this.totalPrice.isVisible()) {
      const text = await this.totalPrice.textContent() || '0 RON'
      return text.trim()
    }
    return '0 RON'
  }

  // Cart item interaction methods
  async getCartItemData(itemIndex: number): Promise<CartItemData> {
    const item = this.cartItems.nth(itemIndex)
    await expect(item).toBeVisible()
    
    // Extract product name
    const nameElement = item.locator('h6, [variant="h6"], h5, [variant="h5"]').first()
    const productName = await nameElement.textContent() || ''
    
    // Extract quantity
    const quantityInput = item.locator('input[type="number"]')
    const quantityValue = await quantityInput.inputValue()
    const quantity = parseInt(quantityValue) || 1
    
    // Extract unit price
    const priceElement = item.locator('text=/\\d+.*RON/').first()
    const price = await priceElement.textContent() || '0 RON'
    
    // Calculate total price for this item
    const priceMatch = price.match(/(\d+(?:\.\d+)?)/)
    const unitPrice = priceMatch ? parseFloat(priceMatch[1]) : 0
    const totalPrice = `${(unitPrice * quantity).toFixed(2)} RON`
    
    return {
      productName: productName.trim(),
      quantity,
      price: price.trim(),
      totalPrice
    }
  }

  async getAllCartItemsData(): Promise<CartItemData[]> {
    const items: CartItemData[] = []
    const count = await this.getCartItemsCount()
    
    for (let i = 0; i < count; i++) {
      const itemData = await this.getCartItemData(i)
      items.push(itemData)
    }
    
    return items
  }

  async findCartItemByName(productName: string): Promise<number> {
    const count = await this.getCartItemsCount()
    
    for (let i = 0; i < count; i++) {
      const itemData = await this.getCartItemData(i)
      if (itemData.productName === productName) {
        return i
      }
    }
    
    throw new Error(`Cart item with name "${productName}" not found`)
  }

  // Quantity manipulation methods
  async updateQuantity(itemIndex: number, newQuantity: number) {
    const item = this.cartItems.nth(itemIndex)
    const quantityInput = item.locator('input[type="number"]')
    
    await quantityInput.clear()
    await quantityInput.fill(newQuantity.toString())
    await quantityInput.blur() // Trigger update
    
    // Wait for UI to update
    await this.page.waitForTimeout(1000)
  }

  async incrementQuantity(itemIndex: number) {
    const item = this.cartItems.nth(itemIndex)
    const incrementButton = item.locator('button').filter({ has: this.page.locator('[data-testid="AddIcon"]') })
    
    await incrementButton.click()
    await this.page.waitForTimeout(500)
  }

  async decrementQuantity(itemIndex: number) {
    const item = this.cartItems.nth(itemIndex)
    const decrementButton = item.locator('button').filter({ has: this.page.locator('[data-testid="RemoveIcon"]') })
    
    await decrementButton.click()
    await this.page.waitForTimeout(500)
  }

  async removeCartItem(itemIndex: number) {
    const item = this.cartItems.nth(itemIndex)
    const removeButton = item.locator('button').filter({ has: this.page.locator('[data-testid="DeleteIcon"]') })
    
    await removeButton.click()
    await this.page.waitForTimeout(1000)
  }

  async removeCartItemByName(productName: string) {
    const itemIndex = await this.findCartItemByName(productName)
    await this.removeCartItem(itemIndex)
  }

  // Cart actions
  async clearCart() {
    if (await this.clearCartButton.isVisible()) {
      await this.clearCartButton.click()
      
      // Handle confirmation dialog if present
      const confirmButton = this.page.locator('button').filter({ hasText: /confirmă|da|yes/i })
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click()
      }
      
      await this.waitForCartToLoad()
    }
  }

  async continueShopping() {
    await expect(this.continueShoppingButton).toBeVisible()
    await this.continueShoppingButton.click()
  }

  // Validation methods
  async validateCartPageStructure() {
    await this.waitForCartToLoad()
    
    // Essential elements should be visible
    await expect(this.cartTitle).toBeVisible()
    await expect(this.breadcrumbs).toBeVisible()
    
    if (await this.isCartEmpty()) {
      // Empty cart validation
      await expect(this.emptyCartMessage).toBeVisible()
      await expect(this.continueShoppingButton).toBeVisible()
    } else {
      // Cart with items validation
      await expect(this.cartItems.first()).toBeVisible()
      await expect(this.totalPrice).toBeVisible()
    }
  }

  async validateCartItem(expectedItem: CartItemData, itemIndex: number = 0) {
    const actualItem = await this.getCartItemData(itemIndex)
    
    expect(actualItem.productName).toBe(expectedItem.productName)
    expect(actualItem.quantity).toBe(expectedItem.quantity)
    
    // Price validation (allowing for formatting differences)
    const expectedPrice = expectedItem.price.replace(/[^\d.,]/g, '')
    const actualPrice = actualItem.price.replace(/[^\d.,]/g, '')
    expect(actualPrice).toBe(expectedPrice)
  }

  async validateTotalCalculation() {
    if (await this.isCartEmpty()) return
    
    const items = await this.getAllCartItemsData()
    let calculatedTotal = 0
    
    for (const item of items) {
      const priceMatch = item.price.match(/(\d+(?:\.\d+)?)/)
      const unitPrice = priceMatch ? parseFloat(priceMatch[1]) : 0
      calculatedTotal += unitPrice * item.quantity
    }
    
    const displayedTotal = await this.getTotalPrice()
    const displayedAmount = displayedTotal.match(/(\d+(?:\.\d+)?)/)?.[1]
    
    expect(parseFloat(displayedAmount || '0')).toBeCloseTo(calculatedTotal, 2)
  }

  async validateBreadcrumbs() {
    await expect(this.breadcrumbs).toBeVisible()
    await expect(this.breadcrumbs).toContainText('Acasă')
    await expect(this.breadcrumbs).toContainText('Coș')
  }

  async validateResponsiveDesign() {
    const breakpoints = ['xs', 'md', 'lg'] as const
    
    for (const bp of breakpoints) {
      await this.page.setViewportSize(
        bp === 'xs' ? { width: 360, height: 720 } :
        bp === 'md' ? { width: 960, height: 1000 } :
        { width: 1280, height: 1000 }
      )
      
      await this.page.reload()
      await this.waitForCartToLoad()
      
      // Validate no horizontal scroll
      const hasScroll = await this.page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasScroll).toBeFalsy()
      
      // Validate touch targets on mobile
      if (bp === 'xs') {
        const buttons = this.page.locator('button')
        const buttonCount = await buttons.count()
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox()
            if (buttonBox) {
              expect(buttonBox.height).toBeGreaterThanOrEqual(44)
            }
          }
        }
      }
    }
  }

  // Helper methods for complex validations
  async validateCartAfterProductAddition(expectedProduct: {
    name: string
    quantity: number
    price: string
  }) {
    await this.waitForCartToLoad()
    
    // Check that cart is no longer empty
    expect(await this.isCartEmpty()).toBeFalsy()
    
    // Find the product in cart
    const itemIndex = await this.findCartItemByName(expectedProduct.name)
    const itemData = await this.getCartItemData(itemIndex)
    
    expect(itemData.productName).toBe(expectedProduct.name)
    expect(itemData.quantity).toBe(expectedProduct.quantity)
    
    // Validate totals are correct
    await this.validateTotalCalculation()
  }

  async validateCartUpdatesAfterQuantityChange(productName: string, expectedQuantity: number) {
    const itemIndex = await this.findCartItemByName(productName)
    const itemData = await this.getCartItemData(itemIndex)
    
    expect(itemData.quantity).toBe(expectedQuantity)
    
    // Validate total calculation still correct
    await this.validateTotalCalculation()
  }
}