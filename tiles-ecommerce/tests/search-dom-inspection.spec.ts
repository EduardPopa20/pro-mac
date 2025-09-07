import { test } from '@playwright/test'

test('Inspect DOM for search elements', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('http://localhost:5176')
  
  await page.waitForLoadState('networkidle')
  
  // Get the entire HTML of the AppBar/Toolbar area
  const toolbarHTML = await page.locator('header').innerHTML().catch(() => 'No header found')
  console.log('Header HTML:', toolbarHTML.substring(0, 500))
  
  // Check if SearchComponent exists in any form
  const searchComponentExists = await page.locator('text=/Caută/i').count()
  console.log('Elements with "Caută" text:', searchComponentExists)
  
  // Look for any input elements
  const allInputs = await page.locator('input').all()
  console.log('Total input elements:', allInputs.length)
  
  for (let i = 0; i < allInputs.length; i++) {
    const input = allInputs[i]
    const type = await input.getAttribute('type')
    const placeholder = await input.getAttribute('placeholder')
    const id = await input.getAttribute('id')
    const isVisible = await input.isVisible()
    console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, id=${id}, visible=${isVisible}`)
  }
  
  // Check for MUI TextField components
  const muiTextFields = await page.locator('.MuiTextField-root').count()
  console.log('MUI TextField components:', muiTextFields)
  
  // Check for MUI OutlinedInput
  const muiInputs = await page.locator('.MuiOutlinedInput-root').count()
  console.log('MUI OutlinedInput components:', muiInputs)
  
  // Check what's in the navbar area specifically
  const navbarContent = await page.locator('[role="banner"], header, .MuiAppBar-root').first().textContent()
  console.log('Navbar text content:', navbarContent)
  
  // Look for SearchComponent by checking for its container
  const searchContainers = await page.locator('[data-testid="search-input"]').count()
  console.log('Search containers with data-testid:', searchContainers)
})