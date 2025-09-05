import { test, expect } from '@playwright/test';

test('New calculator interface works correctly', async ({ page }) => {
  const errors: string[] = [];
  
  // Capture any JavaScript errors
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('cannot be a descendant') && 
          !text.includes('cannot contain a nested')) {
        errors.push(text);
      }
    }
  });

  // Navigate to calculator page
  await page.goto('http://localhost:5184/calculator');
  await page.waitForLoadState('networkidle');
  
  // Check if tabs are present
  const tabs = page.locator('[role="tab"]');
  const tabCount = await tabs.count();
  expect(tabCount).toBe(4); // Should have 4 calculator tabs
  
  // Check tab labels
  await expect(page.locator('text=Gresie')).toBeVisible();
  await expect(page.locator('text=Faianță')).toBeVisible();
  await expect(page.locator('text=Parchet')).toBeVisible();
  await expect(page.locator('text=Riflaje')).toBeVisible();
  
  // Check if calculator form is visible
  await expect(page.locator('text=Calculator Gresie')).toBeVisible();
  await expect(page.locator('text=Dimensiuni cameră')).toBeVisible();
  
  // Test switching tabs
  await page.locator('text=Faianță').click();
  await expect(page.locator('text=Calculator Faianță')).toBeVisible();
  await expect(page.locator('text=Dimensiuni pereți')).toBeVisible();
  
  // Test basic calculation for Gresie
  await page.locator('text=Gresie').click();
  
  // Fill in room dimensions
  await page.locator('[label="Lungime cameră (m)"]').fill('5');
  await page.locator('[label="Lățime cameră (m)"]').fill('4');
  
  // Click continue
  await page.locator('button:has-text("Continuă")').click();
  
  // Wait for wastage step
  await expect(page.locator('text=Pierderi estimate')).toBeVisible();
  
  // Click calculate
  await page.locator('button:has-text("Calculează")').click();
  
  // Wait for results
  await expect(page.locator('text=Rezultate')).toBeVisible();
  await expect(page.locator('text=Material Principal')).toBeVisible();
  await expect(page.locator('text=Cutii necesare:')).toBeVisible();
  
  console.log('✅ Calculator interface working correctly');
  console.log(`   - Found ${tabCount} calculator tabs`);
  console.log('   - Tab switching works');
  console.log('   - Calculation flow completed');
  
  if (errors.length > 0) {
    console.log('❌ JavaScript errors found:');
    errors.forEach(e => console.log(`   - ${e}`));
  }
  
  expect(errors).toHaveLength(0);
});