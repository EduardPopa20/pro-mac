import { test, expect } from '@playwright/test'

test('Test search input interaction', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  
  await page.waitForLoadState('networkidle')
  
  // Find the input
  const searchInput = page.locator('#global-search-input')
  
  // Check initial state
  const isDisabled = await searchInput.isDisabled()
  const isEditable = await searchInput.isEditable()
  const isVisible = await searchInput.isVisible()
  const isReadonly = await searchInput.getAttribute('readonly')
  
  console.log('Input state:')
  console.log('- Disabled:', isDisabled)
  console.log('- Editable:', isEditable)
  console.log('- Visible:', isVisible)
  console.log('- Readonly:', isReadonly)
  
  // Check computed styles that might block interaction
  const styles = await searchInput.evaluate((el) => {
    const computed = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      pointerEvents: computed.pointerEvents,
      userSelect: computed.userSelect,
      cursor: computed.cursor,
      zIndex: computed.zIndex,
      position: computed.position,
      opacity: computed.opacity,
      display: computed.display,
      visibility: computed.visibility,
      disabled: el.disabled,
      readOnly: el.readOnly,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    }
  })
  
  console.log('Computed styles:', JSON.stringify(styles, null, 2))
  
  // Check if there's an element overlapping
  const centerX = styles.rect.left + styles.rect.width / 2
  const centerY = styles.rect.top + styles.rect.height / 2
  
  const elementAtPoint = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y)
    if (!el) return null
    
    // Get the path from the element to the root
    const path = []
    let current = el
    while (current && path.length < 5) {
      path.push({
        tagName: current.tagName,
        id: current.id,
        className: current.className,
        type: (current as any).type
      })
      current = current.parentElement
    }
    return path
  }, { x: centerX, y: centerY })
  
  console.log('Element at center point:', JSON.stringify(elementAtPoint, null, 2))
  
  // Try different interaction methods
  console.log('\nTrying different interaction methods:')
  
  // Method 1: Direct click
  try {
    await searchInput.click({ timeout: 1000 })
    console.log('✓ Direct click succeeded')
  } catch (e) {
    console.log('✗ Direct click failed:', e.message)
  }
  
  // Method 2: Force click
  try {
    await searchInput.click({ force: true, timeout: 1000 })
    console.log('✓ Force click succeeded')
  } catch (e) {
    console.log('✗ Force click failed:', e.message)
  }
  
  // Method 3: Focus
  try {
    await searchInput.focus()
    console.log('✓ Focus succeeded')
    const isFocused = await searchInput.evaluate(el => el === document.activeElement)
    console.log('  Is focused:', isFocused)
  } catch (e) {
    console.log('✗ Focus failed:', e.message)
  }
  
  // Method 4: Fill
  try {
    await searchInput.fill('test', { timeout: 1000 })
    const value = await searchInput.inputValue()
    console.log('✓ Fill succeeded, value:', value)
  } catch (e) {
    console.log('✗ Fill failed:', e.message)
  }
  
  // Method 5: Type
  try {
    await searchInput.clear()
    await searchInput.type('typed', { timeout: 1000 })
    const value = await searchInput.inputValue()
    console.log('✓ Type succeeded, value:', value)
  } catch (e) {
    console.log('✗ Type failed:', e.message)
  }
})