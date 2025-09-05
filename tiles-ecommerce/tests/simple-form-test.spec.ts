import { test, expect } from '@playwright/test';

test('Simple form interface test', async ({ page }) => {
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  // Wait a bit for React to render
  await page.waitForTimeout(2000);
  
  console.log('✅ Page loaded');
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'simple-form-test.png', fullPage: true });
  
  // Check if new form layout is visible
  const formSection = page.locator('text=Dimensiuni Cameră');
  const isVisible = await formSection.isVisible();
  console.log(`Form section visible: ${isVisible}`);
  
  // Check if results section exists
  const resultsSection = page.locator('text=Rezultate');
  const resultsVisible = await resultsSection.isVisible();
  console.log(`Results section visible: ${resultsVisible}`);
  
  // Check if we have input fields
  const inputs = page.locator('input[type="number"]');
  const inputCount = await inputs.count();
  console.log(`Number inputs found: ${inputCount}`);
  
  // Check if calculate button exists
  const calculateButton = page.locator('button:has-text("Calculează")');
  const buttonVisible = await calculateButton.isVisible();
  console.log(`Calculate button visible: ${buttonVisible}`);
  
  if (inputCount >= 2 && buttonVisible) {
    console.log('🎉 New form interface is working!');
  } else {
    console.log('❌ Form interface has issues');
  }
});