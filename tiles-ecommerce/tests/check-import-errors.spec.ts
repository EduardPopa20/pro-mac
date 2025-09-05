import { test, expect, Page } from '@playwright/test';

test('Check specifically for import/export errors', async ({ page }) => {
  const importErrors: string[] = [];
  
  // Only capture import/export related errors
  page.on('pageerror', (error) => {
    const msg = error.message;
    if (msg.includes('does not provide an export') || 
        msg.includes('SyntaxError') || 
        msg.includes('import') || 
        msg.includes('export')) {
      importErrors.push(msg);
    }
  });

  // Also check console for module errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('does not provide an export') || 
          text.includes('SyntaxError') || 
          text.includes('module')) {
        importErrors.push(text);
      }
    }
  });

  // Navigate to homepage
  await page.goto('http://localhost:5184/');
  
  // Wait for any module loading
  await page.waitForTimeout(1000);
  
  // Try to navigate to a product page
  const firstProduct = page.locator('.MuiCard-root').first();
  const productExists = await firstProduct.count() > 0;
  
  if (productExists) {
    await firstProduct.click();
    await page.waitForTimeout(1000);
  }
  
  if (importErrors.length > 0) {
    console.log('❌ Import/Export errors found:');
    importErrors.forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
      
      // Try to parse the error
      const match = error.match(/module '([^']+)' does not provide an export named '([^']+)'/);
      if (match) {
        console.log(`   Fix needed: Change "import { ${match[2]} }" to "import type { ${match[2]} }" from ${match[1]}`);
      }
    });
  } else {
    console.log('✅ No import/export errors found!');
  }
  
  expect(importErrors.length).toBe(0);
});