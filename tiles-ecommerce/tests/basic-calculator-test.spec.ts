import { test, expect } from '@playwright/test';

test('Basic calculator workflow test', async ({ page }) => {
  console.log('🔄 Testing basic calculator workflow...');
  
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  await page.waitForTimeout(2000);
  
  // Fill form for Gresie
  console.log('📝 Filling Gresie calculator form...');
  await page.locator('input[type="number"]').first().fill('5');
  await page.locator('input[type="number"]').nth(1).fill('4');
  
  // Click calculate
  console.log('🧮 Clicking calculate button...');
  await page.locator('button:has-text("Calculează")').click();
  
  // Wait for loading to finish and results to appear
  console.log('⏳ Waiting for results...');
  await page.waitForTimeout(2000); // Wait for calculation to complete
  
  // Check if results appeared
  const materialPrincipal = page.locator('text=Material Principal');
  const hasMaterialText = await materialPrincipal.count() > 0;
  
  if (hasMaterialText) {
    console.log('✅ Results section appears after calculation');
    
    // Check if we have the boxes count
    const boxesElement = page.locator('text=Cutii necesare:');
    const hasBoxes = await boxesElement.count() > 0;
    
    if (hasBoxes) {
      const boxesText = await boxesElement.first().textContent();
      console.log(`📦 ${boxesText}`);
      console.log('✅ Calculation results displayed');
    }
    
    // Test reset functionality
    const resetButton = page.locator('button:has-text("Reset")');
    const hasResetButton = await resetButton.count() > 0;
    
    if (hasResetButton) {
      console.log('🔄 Testing reset functionality...');
      await resetButton.click();
      await page.waitForTimeout(500);
      
      // Check if form cleared
      const lengthInput = page.locator('input[type="number"]').first();
      const lengthValue = await lengthInput.inputValue();
      
      if (lengthValue === '') {
        console.log('✅ Form reset successfully');
      }
    }
  }
  
  // Test tab switching
  console.log('🔄 Testing tab switching...');
  await page.locator('[role="tab"]:has-text("Faianță")').click();
  await page.waitForTimeout(500);
  
  const faiantaTitle = page.locator('text=Calculator Faianță');
  const hasFaiantaTitle = await faiantaTitle.count() > 0;
  
  if (hasFaiantaTitle) {
    console.log('✅ Faianță tab switch works');
  }
  
  console.log('🎉 Basic calculator workflow complete!');
});