import { test, expect } from '@playwright/test';

test('Calculator page loads', async ({ page }) => {
  await page.goto('http://localhost:5184/calculator');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'calculator-page.png' });
  
  // Check if page title exists
  const title = page.locator('h1');
  const titleText = await title.textContent();
  console.log(`Page title: ${titleText}`);
  
  // Check what tabs exist
  const tabs = page.locator('.MuiTab-root');
  const tabCount = await tabs.count();
  console.log(`Tab count: ${tabCount}`);
  
  // List all tab text
  for (let i = 0; i < tabCount; i++) {
    const tabText = await tabs.nth(i).textContent();
    console.log(`Tab ${i}: ${tabText}`);
  }
  
  // Check if SimpleCalculatorForm loaded
  const calculatorTitle = page.locator('text=Calculator Gresie');
  const isVisible = await calculatorTitle.isVisible();
  console.log(`Calculator form visible: ${isVisible}`);
});