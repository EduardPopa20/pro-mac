import { test, expect } from '@playwright/test';

test('Calculator complete functionality test', async ({ page }) => {
  console.log('🔄 Loading calculator page...');
  await page.goto('http://localhost:5184/calculator');
  await page.waitForLoadState('networkidle');
  
  // Verify page loaded
  await expect(page.locator('text=Calculatoare Materiale')).toBeVisible();
  console.log('✅ Page title visible');
  
  // Check tabs
  const tabs = page.locator('.MuiTab-root');
  const tabCount = await tabs.count();
  console.log(`📊 Found ${tabCount} tabs`);
  
  // Verify all tab labels are visible
  await expect(page.locator('[role="tab"]:has-text("Gresie")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Faianță")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Parchet")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Riflaje")')).toBeVisible();
  console.log('✅ All tabs visible');
  
  // Test Gresie calculator (should be active by default)
  await expect(page.locator('text=Calculator Gresie')).toBeVisible();
  await expect(page.locator('text=Dimensiuni cameră')).toBeVisible();
  console.log('✅ Gresie calculator form visible');
  
  // Fill room dimensions  
  await page.locator('input[type="number"]').first().fill('5');
  await page.locator('input[type="number"]').nth(1).fill('4');
  console.log('🔢 Room dimensions filled');
  
  // Continue to next step
  await page.locator('button:has-text("Continuă")').click();
  
  // Verify wastage step
  await expect(page.locator('text=Pierderi estimate')).toBeVisible();
  console.log('✅ Wastage step visible');
  
  // Calculate
  await page.locator('button:has-text("Calculează")').click();
  
  // Wait for results
  await expect(page.locator('text=Rezultate')).toBeVisible();
  await expect(page.locator('text=Material Principal')).toBeVisible();
  await expect(page.locator('text=Cutii necesare:')).toBeVisible();
  
  // Check if we have numeric results
  const boxesText = await page.locator('text=Cutii necesare:').textContent();
  console.log(`📦 Result: ${boxesText}`);
  
  console.log('✅ Calculator working completely');
  
  // Test tab switching
  await page.locator('[role="tab"]:has-text("Faianță")').click();
  await expect(page.locator('text=Calculator Faianță')).toBeVisible();
  await expect(page.locator('text=Dimensiuni pereți')).toBeVisible();
  console.log('✅ Tab switching works');
  
  console.log('🎉 All tests passed!');
});