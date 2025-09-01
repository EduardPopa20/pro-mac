import type { Page, Locator } from '@playwright/test'

export async function setViewport(page: Page, bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl') {
  const sizes = {
    xs: [360, 720],
    sm: [600, 900], 
    md: [960, 1000],
    lg: [1280, 1000],
    xl: [1920, 1080]
  }
  const [w, h] = sizes[bp]
  await page.setViewportSize({ width: w, height: h })
}

export async function computedPx(page: Page, locator: Locator, prop: string): Promise<string> {
  return await locator.evaluate((el, prop) => getComputedStyle(el as Element).getPropertyValue(prop), prop)
}

export async function computedNumber(page: Page, locator: Locator, prop: string): Promise<number> {
  const value = await computedPx(page, locator, prop)
  return parseFloat(value.replace('px', ''))
}

export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return await page.evaluate(() => 
    document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
}

export async function waitForFontsLoaded(page: Page): Promise<void> {
  try {
    // Wait for fonts with timeout to prevent hanging tests
    await Promise.race([
      page.evaluate(() => document.fonts.ready),
      page.waitForTimeout(2000) // 2 second timeout for fonts
    ])
  } catch (error) {
    console.warn('Font loading timeout or error:', error)
    // Continue anyway - fonts not being loaded shouldn't block tests
  }
}

export function pxToNumber(pxString: string): number {
  return parseFloat(pxString.replace('px', ''))
}