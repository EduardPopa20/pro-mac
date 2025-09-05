import { test, expect } from '@playwright/test';

test('Validate FaiantaEdit page layout changes', async ({ page }) => {
  // Navigate to login page first
  await page.goto('http://localhost:5176/auth');
  
  // Wait for auth form
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });
  
  // Fill login form
  await page.fill('input[type="email"]', 'eduardpopa68@yahoo.com');
  await page.fill('input[type="password"]', 'Test200');
  
  // Click submit
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForTimeout(2000);
  
  // Navigate to product management
  await page.goto('http://localhost:5176/admin/categorii_produse');
  await page.waitForTimeout(1000);
  
  // Take screenshot of categories page
  await page.screenshot({ 
    path: 'faianta-categories-page.png', 
    fullPage: true 
  });
  
  // Look for Faianta edit link/button
  const faiantaViewButton = page.locator('a[href*="faianta"]').first();
  if (await faiantaViewButton.isVisible()) {
    await faiantaViewButton.click();
    await page.waitForTimeout(1000);
  } else {
    // Direct navigation to a faianta product edit page
    await page.goto('http://localhost:5176/admin/produse/faianta/editare/1');
  }
  
  await page.waitForTimeout(2000);
  
  // Take screenshot of the updated FaiantaEdit page
  await page.screenshot({ 
    path: 'faianta-edit-updated.png', 
    fullPage: true 
  });
  
  console.log('Final URL:', page.url());
});