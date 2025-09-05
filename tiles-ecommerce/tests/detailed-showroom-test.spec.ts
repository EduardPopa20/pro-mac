import { test, expect } from '@playwright/test';

test('Detailed Showroom Investigation', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Authenticate first
  await page.goto('http://localhost:5177/auth');
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', 'eduardpopa68@yahoo.com');
  await page.fill('input[type="password"]', 'Test200');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Navigate to showroom management
  await page.goto('http://localhost:5177/admin/showroom-uri');
  
  // Wait longer for the page to fully load
  await page.waitForTimeout(5000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'detailed-showroom-initial.png', fullPage: true });
  
  // Check various elements that might be present
  const loadingSpinner = page.locator('.MuiCircularProgress-root');
  const addButton = page.getByRole('button', { name: /adaugă showroom/i });
  const errorAlert = page.locator('.MuiAlert-root');
  const breadcrumbs = page.locator('nav[aria-label="breadcrumb"]');
  const title = page.getByText(/management showrooms/i);
  
  console.log('=== ELEMENT VISIBILITY ===');
  console.log('Loading spinner visible:', await loadingSpinner.isVisible());
  console.log('Add button visible:', await addButton.isVisible());
  console.log('Error alert visible:', await errorAlert.isVisible());
  console.log('Breadcrumbs visible:', await breadcrumbs.isVisible());
  console.log('Title visible:', await title.isVisible());
  
  // Count all visible elements
  const allButtons = page.locator('button');
  const allInputs = page.locator('input');
  const allCards = page.locator('.MuiCard-root');
  
  console.log('Total buttons found:', await allButtons.count());
  console.log('Total inputs found:', await allInputs.count());
  console.log('Total cards found:', await allCards.count());
  
  // If there are any error messages, log them
  if (await errorAlert.isVisible()) {
    const errorText = await errorAlert.textContent();
    console.log('Error message:', errorText);
  }
  
  // Wait longer and check if loading spinner disappears
  await page.waitForTimeout(10000);
  
  console.log('=== AFTER EXTENDED WAIT ===');
  console.log('Loading spinner still visible:', await loadingSpinner.isVisible());
  console.log('Add button now visible:', await addButton.isVisible());
  
  // Take screenshot after waiting
  await page.screenshot({ path: 'detailed-showroom-after-wait.png', fullPage: true });
  
  // Try to click add button if it becomes visible
  if (await addButton.isVisible()) {
    console.log('Clicking add showroom button...');
    await addButton.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot of form
    await page.screenshot({ path: 'detailed-showroom-form.png', fullPage: true });
    
    // Test text input fields for focus issues
    const textInputs = page.locator('input[type="text"], input[type="email"], input:not([type])');
    const inputCount = await textInputs.count();
    console.log(`Found ${inputCount} text inputs to test`);
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = textInputs.nth(i);
      const placeholder = await input.getAttribute('placeholder') || `Input ${i}`;
      
      console.log(`Testing input: ${placeholder}`);
      
      await input.click();
      await page.waitForTimeout(100);
      
      // Type one character
      await input.type('T', { delay: 50 });
      
      // Check if still focused
      const isFocused = await input.evaluate(el => el === document.activeElement);
      console.log(`${placeholder} - Focused after 1 char: ${isFocused}`);
      
      if (isFocused) {
        // Type more characters
        await input.type('est', { delay: 50 });
        const finalValue = await input.inputValue();
        console.log(`${placeholder} - Final value: "${finalValue}"`);
      } else {
        console.log(`${placeholder} - FOCUS LOST AFTER 1 CHARACTER!`);
      }
      
      // Clear for next test
      await input.clear();
    }
  } else {
    console.log('Add button never became visible, checking for other interactive elements...');
    
    // Look for any clickable elements
    const allClickable = page.locator('button, [role="button"], a, input');
    const clickableCount = await allClickable.count();
    console.log(`Found ${clickableCount} potentially clickable elements`);
    
    for (let i = 0; i < Math.min(clickableCount, 10); i++) {
      const element = allClickable.nth(i);
      const text = (await element.textContent() || '').trim();
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      console.log(`Clickable ${i}: ${tagName} - "${text}"`);
    }
  }
});