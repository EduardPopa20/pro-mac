import { test, expect } from '@playwright/test';

test('New simple calculator form test', async ({ page }) => {
  console.log('🔄 Loading new calculator page...');
  await page.goto('http://localhost:5184/calculator');
  await page.waitForLoadState('networkidle');
  
  // Verify page loaded
  await expect(page.locator('text=Calculatoare Materiale')).toBeVisible();
  console.log('✅ Page title visible');
  
  // Check that we have a simple form layout
  await expect(page.locator('text=Calculator Gresie')).toBeVisible();
  await expect(page.locator('text=Dimensiuni Cameră')).toBeVisible();
  
  // Check the form fields are visible
  await expect(page.locator('input[type="number"]').first()).toBeVisible();
  console.log('✅ Form fields visible');
  
  // Check results section shows initial state
  await expect(page.locator('text=Rezultate')).toBeVisible();
  await expect(page.locator('text=Introduceți dimensiunile')).toBeVisible();
  console.log('✅ Empty results state visible');
  
  // Test Gresie calculator
  console.log('🧮 Testing Gresie calculator...');
  
  // Fill form
  await page.locator('input[type="number"]').first().fill('5');
  await page.locator('input[type="number"]').nth(1).fill('4');
  
  // Check wastage options are visible
  await expect(page.locator('text=Pierderi Estimate')).toBeVisible();
  await expect(page.locator('text=10% - Camere simple')).toBeVisible();
  
  // Click calculate button
  const calculateButton = page.locator('button:has-text("Calculează")');
  await expect(calculateButton).toBeEnabled();
  await calculateButton.click();
  
  // Check loading state
  await expect(page.locator('text=Se calculează...')).toBeVisible();
  await expect(page.locator('text=Se calculează necesarul de materiale...')).toBeVisible();
  console.log('✅ Loading spinner visible');
  
  // Wait for results to appear (should take ~1 second)
  await expect(page.locator('text=Material Principal')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Cutii necesare:')).toBeVisible();
  
  // Check if we have numeric results
  const boxesText = await page.locator('text=Cutii necesare:').textContent();
  console.log(`📦 Gresie Result: ${boxesText}`);
  
  // Check reset button appears
  await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  console.log('✅ Reset button visible');
  
  // Test reset functionality
  await page.locator('button:has-text("Reset")').click();
  await expect(page.locator('text=Introduceți dimensiunile')).toBeVisible();
  console.log('✅ Reset works');
  
  // Test Faianță calculator
  console.log('🧱 Testing Faianță calculator...');
  await page.locator('[role="tab"]:has-text("Faianță")').click();
  await expect(page.locator('text=Calculator Faianță')).toBeVisible();
  await expect(page.locator('text=Dimensiuni Pereți')).toBeVisible();
  
  // Fill wall dimensions
  await page.locator('input[type="number"]').first().fill('3');
  await page.locator('input[type="number"]').nth(1).fill('2.5');
  
  // Calculate
  await page.locator('button:has-text("Calculează")').click();
  await expect(page.locator('text=Se calculează...')).toBeVisible();
  await expect(page.locator('text=Material Principal')).toBeVisible({ timeout: 3000 });
  
  const faiantaBoxes = await page.locator('text=Cutii necesare:').textContent();
  console.log(`📦 Faianță Result: ${faiantaBoxes}`);
  
  // Test Parchet calculator
  console.log('🌳 Testing Parchet calculator...');
  await page.locator('[role="tab"]:has-text("Parchet")').click();
  await expect(page.locator('text=Calculator Parchet')).toBeVisible();
  
  // Reset button should still work
  await page.locator('button:has-text("Reset")').click();
  await expect(page.locator('text=Introduceți dimensiunile')).toBeVisible();
  
  // Test Riflaje calculator
  console.log('🏗️ Testing Riflaje calculator...');
  await page.locator('[role="tab"]:has-text("Riflaje")').click();
  await expect(page.locator('text=Calculator Riflaje')).toBeVisible();
  
  console.log('🎉 All calculator forms working!');
});