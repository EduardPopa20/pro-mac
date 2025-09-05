import { test, expect } from '@playwright/test';

test('Check for console errors on homepage', async ({ page }) => {
  const consoleErrors: string[] = [];
  
  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to homepage
  await page.goto('http://localhost:5184/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check for any console errors
  if (consoleErrors.length > 0) {
    console.log('Console errors found:');
    consoleErrors.forEach(error => console.log('  -', error));
  } else {
    console.log('✅ No console errors found!');
  }
  
  expect(consoleErrors).toHaveLength(0);
});

test('Check for console errors on product page', async ({ page }) => {
  const consoleErrors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to a product page
  await page.goto('http://localhost:5184/');
  await page.waitForLoadState('networkidle');
  
  // Click on first product if exists
  const firstProduct = page.locator('[data-testid="product-card"]').first();
  if (await firstProduct.count() > 0) {
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
  }
  
  if (consoleErrors.length > 0) {
    console.log('Console errors on product page:');
    consoleErrors.forEach(error => console.log('  -', error));
  } else {
    console.log('✅ No console errors on product page!');
  }
  
  expect(consoleErrors).toHaveLength(0);
});