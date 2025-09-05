import { test, expect } from '@playwright/test';

test('Calculator functionality test', async ({ page }) => {
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  await page.waitForTimeout(2000);
  console.log('✅ Page loaded');
  
  // Check form layout
  await expect(page.locator('text=Dimensiuni Cameră')).toBeVisible();
  const resultsHeading = page.locator('h6:has-text("Rezultate")');
  await expect(resultsHeading).toBeVisible();
  console.log('✅ Form and results sections visible');
  
  // Check initial empty state
  await expect(page.locator('text=Introduceți dimensiunile')).toBeVisible();
  console.log('✅ Empty state message visible');
  
  // Fill form
  await page.locator('input[type="number"]').first().fill('5');
  await page.locator('input[type="number"]').nth(1).fill('4');
  console.log('✅ Form filled with 5x4 dimensions');
  
  // Check calculate button is enabled
  const calculateButton = page.locator('button:has-text("Calculează")');
  await expect(calculateButton).toBeEnabled();
  console.log('✅ Calculate button enabled');
  
  // Click calculate
  await calculateButton.click();
  
  // Check loading state
  await expect(page.locator('button:has-text("Se calculează...")')).toBeVisible();
  console.log('✅ Loading state visible');
  
  // Wait for results
  await expect(page.locator('text=Material Principal')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Cutii necesare:')).toBeVisible();
  console.log('✅ Results displayed');
  
  // Check if we have the reset button
  await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  console.log('✅ Reset button appears after calculation');
  
  // Test reset
  await page.locator('button:has-text("Reset")').click();
  await expect(page.locator('text=Introduceți dimensiunile')).toBeVisible();
  console.log('✅ Reset functionality works');
  
  // Test tab switching
  await page.locator('[role="tab"]:has-text("Faianță")').click();
  await expect(page.locator('text=Calculator Faianță')).toBeVisible();
  await expect(page.locator('text=Dimensiuni Pereți')).toBeVisible();
  console.log('✅ Tab switching works - Faianță');
  
  // Test Parchet tab
  await page.locator('[role="tab"]:has-text("Parchet")').click();
  await expect(page.locator('text=Calculator Parchet')).toBeVisible();
  console.log('✅ Tab switching works - Parchet');
  
  // Test Riflaje tab
  await page.locator('[role="tab"]:has-text("Riflaje")').click();
  await expect(page.locator('text=Calculator Riflaje')).toBeVisible();
  console.log('✅ Tab switching works - Riflaje');
  
  console.log('🎉 All calculator functionality working!');
});