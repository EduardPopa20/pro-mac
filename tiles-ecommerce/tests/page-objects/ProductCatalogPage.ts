import { Page, Locator, expect } from '@playwright/test'

export class ProductCatalogPage {
  readonly page: Page
  readonly productCards: Locator
  readonly firstProduct: Locator
  readonly filterCard: Locator
  readonly priceRangeInputs: Locator
  readonly colorFilters: Locator
  readonly sortDropdown: Locator
  readonly breadcrumbs: Locator
  readonly loadingSpinner: Locator
  readonly emptyState: Locator
  readonly categoryTitle: Locator
  readonly productGrid: Locator

  constructor(page: Page) {
    this.page = page
    
    // Product elements - target cards with product names we know exist
    this.productCards = page.locator('.MuiCard-root').filter({ 
      has: page.locator('h6:has-text("Gresie"), h6:has-text("Faianță")') 
    })
    this.firstProduct = this.productCards.first()
    this.productGrid = page.locator('[class*="MuiGrid-container"]')
    
    // Filter elements
    this.filterCard = page.locator('text=Filtrare produse').first()
    this.priceRangeInputs = page.locator('input[type="number"]')
    this.colorFilters = page.locator('[data-testid="color-filter"]')
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]')
    
    // Navigation elements
    this.breadcrumbs = page.locator('[role="navigation"], .MuiBreadcrumbs-root')
    this.categoryTitle = page.locator('h1, [variant="h1"]').first()
    
    // State elements
    this.loadingSpinner = page.locator('.MuiCircularProgress-root')
    this.emptyState = page.locator('text=Nu au fost găsite produse')
  }

  // Navigation methods
  async navigateToGresie() {
    await this.page.goto('/gresie')
    await this.waitForProductsToLoad()
  }

  async navigateToFaianta() {
    await this.page.goto('/faianta')
    await this.waitForProductsToLoad()
  }

  async navigateToCategory(categorySlug: string) {
    await this.page.goto(`/${categorySlug}`)
    await this.waitForProductsToLoad()
  }

  // Wait methods
  async waitForProductsToLoad() {
    await this.page.waitForLoadState('networkidle')
    
    // Wait for either products to load or empty state to show
    try {
      await Promise.race([
        this.productCards.first().waitFor({ state: 'visible', timeout: 10000 }),
        this.emptyState.waitFor({ state: 'visible', timeout: 10000 })
      ])
    } catch {
      // If neither appears, continue - might be loading state
      console.warn('Products or empty state not visible within timeout')
    }
  }

  // Product interaction methods
  async clickFirstProduct() {
    await this.firstProduct.click()
  }

  async clickProductByIndex(index: number) {
    await this.productCards.nth(index).click()
  }

  async clickProductByName(productName: string) {
    const product = this.productCards.filter({ hasText: productName })
    await product.first().click()
  }

  async getProductCount(): Promise<number> {
    await this.waitForProductsToLoad()
    return await this.productCards.count()
  }

  async getFirstProductDetails(): Promise<{
    name: string
    price: string
    imageUrl: string
  }> {
    await this.waitForProductsToLoad()
    
    const name = await this.firstProduct.locator('h6').textContent() || ''
    const priceElement = this.firstProduct.locator('text=/\\d+.*RON/')
    const price = await priceElement.textContent() || ''
    const image = this.firstProduct.locator('img')
    const imageUrl = await image.getAttribute('src') || ''

    return { name: name.trim(), price: price.trim(), imageUrl }
  }

  async getAllVisibleProductNames(): Promise<string[]> {
    await this.waitForProductsToLoad()
    const names: string[] = []
    const count = await this.productCards.count()
    
    for (let i = 0; i < count; i++) {
      const nameElement = this.productCards.nth(i).locator('h6')
      const name = await nameElement.textContent()
      if (name) {
        names.push(name.trim())
      }
    }
    
    return names
  }

  // Filter methods
  async expandFiltersOnMobile() {
    const viewport = this.page.viewportSize()
    if (viewport && viewport.width < 960) {
      const expandButton = this.page.locator('[data-testid="expand-filters"], .MuiIconButton-root')
      if (await expandButton.isVisible()) {
        await expandButton.click()
        await this.page.waitForTimeout(500)
      }
    }
  }

  async setPriceRange(min: number, max: number) {
    await this.expandFiltersOnMobile()
    
    const minInput = this.priceRangeInputs.first()
    const maxInput = this.priceRangeInputs.last()
    
    await minInput.clear()
    await minInput.fill(min.toString())
    
    await maxInput.clear()  
    await maxInput.fill(max.toString())
    
    // Wait for filtering to apply
    await this.page.waitForTimeout(1000)
  }

  async clearAllFilters() {
    const clearButton = this.page.locator('text=Șterge tot', 'button[aria-label*="clear"]')
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await this.page.waitForTimeout(1000)
    }
  }

  // Validation methods
  async validateBreadcrumbs(expectedPath: string[]) {
    await expect(this.breadcrumbs).toBeVisible()
    
    for (const pathItem of expectedPath) {
      await expect(this.breadcrumbs).toContainText(pathItem)
    }
  }

  async validateNoHorizontalScroll() {
    const hasScroll = await this.page.evaluate(() => 
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
    expect(hasScroll).toBeFalsy()
  }

  async validateProductCardStructure() {
    await this.waitForProductsToLoad()
    
    if (await this.productCards.first().isVisible()) {
      // Each product should have image, name, and price
      await expect(this.firstProduct.locator('img')).toBeVisible()
      await expect(this.firstProduct.locator('h6, [variant="h6"]')).toBeVisible()
      await expect(this.firstProduct.locator('text=/\\d+.*RON/')).toBeVisible()
    }
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
      await this.waitForProductsToLoad()
      await this.validateNoHorizontalScroll()
      
      // Check product grid adapts properly
      if (await this.productGrid.isVisible()) {
        const gridStyles = await this.productGrid.evaluate(el => 
          window.getComputedStyle(el).display
        )
        expect(gridStyles).toBe('flex')
      }
    }
  }
}