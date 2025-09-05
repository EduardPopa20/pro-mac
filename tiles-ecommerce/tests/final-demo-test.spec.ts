import { test } from '@playwright/test';

test('Final demo of new calculator interface', async ({ page }) => {
  console.log('🎬 Creating final demo of new calculator interface...');
  
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ 
    path: 'calculator-new-interface-initial.png', 
    fullPage: true 
  });
  console.log('📸 Initial state screenshot taken');
  
  // Fill form
  await page.locator('input[type="number"]').first().fill('6');
  await page.locator('input[type="number"]').nth(1).fill('5');
  
  // Take form filled screenshot
  await page.screenshot({ 
    path: 'calculator-new-interface-filled.png', 
    fullPage: true 
  });
  console.log('📸 Form filled screenshot taken');
  
  // Start calculation
  await page.locator('button:has-text("Calculează")').click();
  
  // Take loading screenshot
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'calculator-new-interface-loading.png', 
    fullPage: true 
  });
  console.log('📸 Loading state screenshot taken');
  
  // Wait for results
  await page.waitForTimeout(2000);
  
  // Take final results screenshot
  await page.screenshot({ 
    path: 'calculator-new-interface-results.png', 
    fullPage: true 
  });
  console.log('📸 Results screenshot taken');
  
  // Test Faianță tab
  await page.locator('[role="tab"]:has-text("Faianță")').click();
  await page.waitForTimeout(500);
  
  await page.screenshot({ 
    path: 'calculator-new-interface-faianta.png', 
    fullPage: true 
  });
  console.log('📸 Faianță tab screenshot taken');
  
  console.log('🎉 Demo complete! All screenshots saved.');
});