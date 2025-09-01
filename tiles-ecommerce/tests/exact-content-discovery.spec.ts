import { test, expect } from '@playwright/test'
import { setViewport, waitForFontsLoaded } from './utils'

test.describe('Exact Content Discovery for Accurate Testing', () => {

  test('discover exact button texts and selectors', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    console.log('=== EXACT BUTTON CONTENT ===')
    
    const allButtons = await page.locator('button').all()
    console.log(`Found ${allButtons.length} buttons`)
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i]
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const className = await button.getAttribute('class')
      const type = await button.getAttribute('type')
      const isVisible = await button.isVisible()
      
      console.log(`Button ${i+1}:`)
      console.log(`  Text: "${text?.trim()}"`)
      console.log(`  AriaLabel: "${ariaLabel}"`)
      console.log(`  Type: ${type}`)
      console.log(`  Visible: ${isVisible}`)
      console.log(`  Classes: ${className}`)
      console.log('---')
    }
    
    // Also check for clickable text elements that might not be buttons
    console.log('\n=== CLICKABLE TEXT ELEMENTS ===')
    const clickableElements = await page.locator('a, [role="button"], [onclick]').all()
    
    for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
      const element = clickableElements[i]
      const text = await element.textContent()
      const href = await element.getAttribute('href')
      const tagName = await element.evaluate(el => el.tagName)
      const isVisible = await element.isVisible()
      
      if (text?.includes('WhatsApp') || text?.includes('Explorează') || text?.includes('Contact')) {
        console.log(`${tagName}: "${text?.trim()}" (href: ${href}) - Visible: ${isVisible}`)
      }
    }
  })

  test('discover exact mobile menu structure', async ({ page }) => {
    await page.goto('/')
    await setViewport(page, 'xs')
    await waitForFontsLoaded(page)
    
    console.log('=== MOBILE MENU DISCOVERY ===')
    
    // Find all possible menu button candidates
    const menuCandidates = await page.locator('button').all()
    
    for (let i = 0; i < menuCandidates.length; i++) {
      const button = menuCandidates[i]
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const isVisible = await button.isVisible()
      
      if (isVisible && (text?.includes('menu') || ariaLabel?.includes('menu') || text?.trim() === '')) {
        console.log(`Menu candidate ${i+1}:`)
        console.log(`  Text: "${text?.trim()}"`)
        console.log(`  AriaLabel: "${ariaLabel}"`)
        
        // Try clicking this button
        try {
          await button.click()
          await page.waitForTimeout(500)
          
          const drawer = page.locator('[role="dialog"], .MuiDrawer-root, .MuiModal-root')
          const drawerVisible = await drawer.isVisible()
          
          if (drawerVisible) {
            const drawerContent = await drawer.textContent()
            console.log(`  Opens drawer with content: "${drawerContent?.substring(0, 100)}..."`)
            
            // Get all menu items
            const menuItems = await drawer.locator('a, [role="button"], button').all()
            console.log(`  Menu items: ${menuItems.length}`)
            
            for (let j = 0; j < menuItems.length; j++) {
              const menuItem = menuItems[j]
              const menuText = await menuItem.textContent()
              const menuHref = await menuItem.getAttribute('href')
              const menuVisible = await menuItem.isVisible()
              
              if (menuVisible && menuText?.trim()) {
                console.log(`    ${j+1}. "${menuText.trim()}" (${menuHref})`)
              }
            }
            
            // Close the drawer
            await page.keyboard.press('Escape')
            await page.waitForTimeout(300)
            break
          }
        } catch (error) {
          console.log(`  Failed to click: ${error}`)
        }
      }
    }
  })

  test('discover exact form field structures', async ({ page }) => {
    console.log('=== CONTACT FORM STRUCTURE ===')
    
    await page.goto('/contact')
    await waitForFontsLoaded(page)
    
    const forms = await page.locator('form').all()
    console.log(`Contact page has ${forms.length} forms`)
    
    for (let f = 0; f < forms.length; f++) {
      const form = forms[f]
      console.log(`\nForm ${f+1}:`)
      
      const inputs = await form.locator('input').all()
      const textareas = await form.locator('textarea').all()
      const selects = await form.locator('select').all()
      const buttons = await form.locator('button').all()
      
      console.log(`  Inputs: ${inputs.length}`)
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        const placeholder = await input.getAttribute('placeholder')
        const name = await input.getAttribute('name')
        const type = await input.getAttribute('type')
        const required = await input.getAttribute('required')
        const label = await input.getAttribute('aria-label')
        
        console.log(`    Input ${i+1}: type="${type}" name="${name}" placeholder="${placeholder}" required="${required}" aria-label="${label}"`)
      }
      
      console.log(`  Textareas: ${textareas.length}`)
      for (let i = 0; i < textareas.length; i++) {
        const textarea = textareas[i]
        const placeholder = await textarea.getAttribute('placeholder')
        const name = await textarea.getAttribute('name')
        const required = await textarea.getAttribute('required')
        
        console.log(`    Textarea ${i+1}: name="${name}" placeholder="${placeholder}" required="${required}"`)
      }
      
      console.log(`  Buttons: ${buttons.length}`)
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        const text = await button.textContent()
        const type = await button.getAttribute('type')
        const disabled = await button.getAttribute('disabled')
        
        console.log(`    Button ${i+1}: "${text?.trim()}" type="${type}" disabled="${disabled}"`)
      }
    }
    
    console.log('\n=== AUTH FORM STRUCTURE ===')
    
    await page.goto('/auth')
    await waitForFontsLoaded(page)
    
    const authForms = await page.locator('form').all()
    console.log(`Auth page has ${authForms.length} forms`)
    
    for (let f = 0; f < authForms.length; f++) {
      const form = authForms[f]
      console.log(`\nAuth Form ${f+1}:`)
      
      const inputs = await form.locator('input').all()
      const buttons = await form.locator('button').all()
      
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        const placeholder = await input.getAttribute('placeholder')
        const type = await input.getAttribute('type')
        const name = await input.getAttribute('name')
        
        console.log(`    Auth Input ${i+1}: type="${type}" name="${name}" placeholder="${placeholder}"`)
      }
      
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i]
        const text = await button.textContent()
        const type = await button.getAttribute('type')
        
        console.log(`    Auth Button ${i+1}: "${text?.trim()}" type="${type}"`)
      }
    }
    
    // Check for OAuth buttons outside forms
    const oauthButtons = await page.locator('button, a').filter({ hasText: /google|facebook/i }).all()
    console.log(`\nOAuth buttons found: ${oauthButtons.length}`)
    
    for (let i = 0; i < oauthButtons.length; i++) {
      const button = oauthButtons[i]
      const text = await button.textContent()
      const className = await button.getAttribute('class')
      
      console.log(`  OAuth ${i+1}: "${text?.trim()}" class="${className}"`)
    }
  })

  test('discover exact search behavior', async ({ page }) => {
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    console.log('=== SEARCH BEHAVIOR DISCOVERY ===')
    
    const searchInputs = await page.locator('input').all()
    
    for (let i = 0; i < searchInputs.length; i++) {
      const input = searchInputs[i]
      const placeholder = await input.getAttribute('placeholder')
      const type = await input.getAttribute('type')
      const name = await input.getAttribute('name')
      const isVisible = await input.isVisible()
      
      if (placeholder?.toLowerCase().includes('caută') || type === 'search') {
        console.log(`Search Input ${i+1}:`)
        console.log(`  Placeholder: "${placeholder}"`)
        console.log(`  Type: ${type}`)
        console.log(`  Name: ${name}`)
        console.log(`  Visible: ${isVisible}`)
        
        if (isVisible) {
          // Test search behavior
          await input.fill('test search')
          await page.waitForTimeout(1000)
          
          // Look for any dropdowns or results
          const possibleDropdowns = await page.locator('[role="presentation"], .MuiPopper-root, .MuiPopover-root, [data-testid*="search"]').all()
          
          console.log(`  Possible dropdowns after search: ${possibleDropdowns.length}`)
          
          for (let j = 0; j < possibleDropdowns.length; j++) {
            const dropdown = possibleDropdowns[j]
            const dropdownVisible = await dropdown.isVisible()
            
            if (dropdownVisible) {
              const content = await dropdown.textContent()
              console.log(`    Dropdown ${j+1}: "${content?.substring(0, 100)}..."`)
            }
          }
          
          await input.clear()
        }
      }
    }
  })

  test('exact page navigation structure', async ({ page }) => {
    console.log('=== NAVIGATION STRUCTURE ===')
    
    await page.goto('/')
    await waitForFontsLoaded(page)
    
    // Find header/navigation area
    const headers = await page.locator('header, [role="banner"], nav').all()
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      const isVisible = await header.isVisible()
      
      if (isVisible) {
        console.log(`\nNavigation area ${i+1}:`)
        
        // Find all links in this navigation area
        const links = await header.locator('a').all()
        console.log(`  Links: ${links.length}`)
        
        for (let j = 0; j < links.length; j++) {
          const link = links[j]
          const text = await link.textContent()
          const href = await link.getAttribute('href')
          const isLinkVisible = await link.isVisible()
          
          if (isLinkVisible && text?.trim()) {
            console.log(`    ${j+1}. "${text.trim()}" -> ${href}`)
          }
        }
        
        // Find all buttons in navigation
        const navButtons = await header.locator('button').all()
        console.log(`  Buttons: ${navButtons.length}`)
        
        for (let j = 0; j < navButtons.length; j++) {
          const button = navButtons[j]
          const text = await button.textContent()
          const ariaLabel = await button.getAttribute('aria-label')
          const isButtonVisible = await button.isVisible()
          
          if (isButtonVisible) {
            console.log(`    Button ${j+1}. "${text?.trim() || ariaLabel}"`)
          }
        }
      }
    }
  })
})