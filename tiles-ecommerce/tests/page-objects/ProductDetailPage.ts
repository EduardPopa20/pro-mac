import { Page, Locator, expect } from '@playwright/test'

export class ProductDetailPage {
  readonly page: Page
  readonly productImage: Locator
  readonly productName: Locator
  readonly productPrice: Locator
  readonly productDescription: Locator
  readonly quantityInput: Locator
  readonly quantityIncrement: Locator
  readonly quantityDecrement: Locator
  readonly addToCartButton: Locator
  readonly contactButton: Locator
  readonly breadcrumbs: Locator
  readonly specificationsTables: Locator
  readonly fullScreenImageButton: Locator
  readonly fullScreenDialog: Locator
  readonly successAlert: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page
    
    // Product information elements
    this.productImage = page.locator('img[alt*=""], .MuiCardMedia-img').first()
    this.productName = page.locator('h1, [variant="h1"]').first()
    this.productPrice = page.locator('text=/\\d+.*RON/').first()
    this.productDescription = page.locator('[data-testid="product-description"], p').filter({ hasText: /\w+/ }).first()
    
    // Quantity controls
    this.quantityInput = page.locator('input[type="number"]')
    this.quantityIncrement = page.locator('button').filter({ has: page.locator('[data-testid="AddIcon"]') })
    this.quantityDecrement = page.locator('button').filter({ has: page.locator('[data-testid="RemoveIcon"]') })
    
    // Action buttons - more robust selectors
    this.addToCartButton = page.locator('button:has-text("Adaugă în coș"), button:has-text("Adauga in cos"), button[aria-label*="coș"], button[aria-label*="cart"]').first()
    this.contactButton = page.locator('button:has-text("Contactează-ne"), button:has-text("Contact"), button[aria-label*="contact"]').first()
    
    // Navigation elements
    this.breadcrumbs = page.locator('[role="navigation"], .MuiBreadcrumbs-root')
    this.backButton = page.locator('button').filter({ hasText: 'Înapoi' })
    
    // Product details
    this.specificationsTables = page.locator('table, [data-testid="specifications"]')
    
    // Image interactions
    this.fullScreenImageButton = page.locator('img[alt*=""], .MuiCardMedia-img')
    this.fullScreenDialog = page.locator('[role="dialog"]').filter({ hasText: /img|image/i })
    
    // Feedback elements
    this.successAlert = page.locator('[role="alert"], .MuiAlert-root').filter({ hasText: /adăugat în coș|success/i })
  }

  // Navigation methods
  async navigateToProduct(categorySlug: string, productSlug: string, productId: string) {
    await this.page.goto(`/${categorySlug}/${productSlug}/${productId}`)
    await this.waitForProductToLoad()
  }

  async navigateToProductById(productId: string) {
    // This assumes we know the category and can construct the URL
    // In real tests, we'd usually come from a product catalog
    await this.page.goto(`/gresie/product-${productId}/${productId}`)
    await this.waitForProductToLoad()
  }

  // Wait methods
  async waitForProductToLoad() {
    await this.page.waitForLoadState('networkidle')
    
    // Wait for key elements to be visible
    await Promise.all([
      this.productName.waitFor({ state: 'visible', timeout: 15000 }),
      this.productPrice.waitFor({ state: 'visible', timeout: 15000 })
    ])
    
    // Separate wait for add to cart button as it might be conditional
    try {
      await this.addToCartButton.waitFor({ state: 'visible', timeout: 10000 })
    } catch {
      console.warn('Add to cart button not found - product might be out of stock')
    }
  }

  // Product information methods
  async getProductDetails(): Promise<{
    name: string
    price: string
    description: string
    quantity: number
  }> {
    await this.waitForProductToLoad()
    
    const name = await this.productName.textContent() || ''
    const price = await this.productPrice.textContent() || ''
    const description = await this.productDescription.textContent() || ''
    const quantityValue = await this.quantityInput.inputValue()
    const quantity = parseInt(quantityValue) || 1

    return {
      name: name.trim(),
      price: price.trim(),
      description: description.trim(),
      quantity
    }
  }

  async isProductAvailable(): Promise<boolean> {
    const isDisabled = await this.addToCartButton.isDisabled()
    const buttonText = await this.addToCartButton.textContent()
    
    return !isDisabled && !buttonText?.includes('Stoc epuizat')
  }

  // Quantity methods
  async setQuantity(quantity: number) {
    await this.quantityInput.clear()
    await this.quantityInput.fill(quantity.toString())
  }

  async incrementQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.quantityIncrement.click()
      await this.page.waitForTimeout(100) // Small delay between clicks
    }
  }

  async decrementQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.quantityDecrement.click()
      await this.page.waitForTimeout(100)
    }
  }

  async getCurrentQuantity(): Promise<number> {
    const value = await this.quantityInput.inputValue()
    return parseInt(value) || 1
  }

  // Cart interaction methods
  async addToCart(quantity?: number): Promise<void> {
    if (quantity) {
      await this.setQuantity(quantity)
    }
    
    const isAvailable = await this.isProductAvailable()
    expect(isAvailable).toBeTruthy()
    
    await this.addToCartButton.click()
    
    // Wait for success feedback
    await this.successAlert.waitFor({ state: 'visible', timeout: 5000 })
  }

  async addToCartWithExpectedQuantity(expectedQuantity: number): Promise<{
    productName: string
    quantity: number
    price: string
  }> {
    const productDetails = await this.getProductDetails()
    
    await this.setQuantity(expectedQuantity)
    await this.addToCartButton.click()
    
    // Wait for success message
    await this.successAlert.waitFor({ state: 'visible', timeout: 5000 })
    
    return {
      productName: productDetails.name,
      quantity: expectedQuantity,
      price: productDetails.price
    }
  }

  // Validation methods
  async validateProductPageStructure() {
    await this.waitForProductToLoad()
    
    // Essential elements should be visible
    await expect(this.productImage).toBeVisible()
    await expect(this.productName).toBeVisible()
    await expect(this.productPrice).toBeVisible()
    await expect(this.addToCartButton).toBeVisible()
    await expect(this.contactButton).toBeVisible()
    await expect(this.breadcrumbs).toBeVisible()
    
    // Quantity controls should be functional
    await expect(this.quantityInput).toBeVisible()
    await expect(this.quantityIncrement).toBeVisible()
    await expect(this.quantityDecrement).toBeVisible()
  }

  async validateBreadcrumbs(expectedPath: string[]) {
    await expect(this.breadcrumbs).toBeVisible()
    
    for (const pathItem of expectedPath) {
      await expect(this.breadcrumbs).toContainText(pathItem)
    }
  }

  async validateQuantityControls() {
    // Test increment
    const initialQuantity = await this.getCurrentQuantity()
    await this.incrementQuantity()
    const afterIncrement = await this.getCurrentQuantity()
    expect(afterIncrement).toBe(initialQuantity + 1)
    
    // Test decrement
    await this.decrementQuantity()
    const afterDecrement = await this.getCurrentQuantity()
    expect(afterDecrement).toBe(initialQuantity)
    
    // Test manual input
    await this.setQuantity(5)
    const manualQuantity = await this.getCurrentQuantity()
    expect(manualQuantity).toBe(5)
    
    // Reset to 1 for further tests
    await this.setQuantity(1)
  }

  async validateAddToCartSuccess(expectedProductName: string, expectedQuantity: number) {
    // Validate success message appears
    await expect(this.successAlert).toBeVisible()
    await expect(this.successAlert).toContainText(expectedProductName)
    await expect(this.successAlert).toContainText('adăugat în coș')
    
    // Success message should disappear after timeout
    await expect(this.successAlert).toBeHidden({ timeout: 5000 })
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
      await this.waitForProductToLoad()
      
      // Validate no horizontal scroll
      const hasScroll = await this.page.evaluate(() => 
        document.documentElement.scrollWidth > document.documentElement.clientWidth
      )
      expect(hasScroll).toBeFalsy()
      
      // Validate buttons are properly sized for mobile
      if (bp === 'xs') {
        const buttonBox = await this.addToCartButton.boundingBox()
        expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
      }
    }
  }

  // Image interaction methods
  async openFullScreenImage() {
    await this.fullScreenImageButton.first().click()
    await this.fullScreenDialog.waitFor({ state: 'visible', timeout: 3000 })
  }

  async closeFullScreenImage() {
    await this.page.keyboard.press('Escape')
    await this.fullScreenDialog.waitFor({ state: 'hidden', timeout: 3000 })
  }
}