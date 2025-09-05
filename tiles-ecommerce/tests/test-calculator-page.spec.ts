import { test, expect } from '@playwright/test';

test('Calculator page loads without errors', async ({ page }) => {
  const errors: string[] = [];
  
  // Capture any JavaScript errors
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Filter out non-critical errors
      if (!text.includes('cannot be a descendant') && 
          !text.includes('cannot contain a nested')) {
        errors.push(text);
      }
    }
  });

  // Navigate to calculator page
  await page.goto('http://localhost:5184/calculator');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check if page loaded successfully
  const title = await page.locator('h1:has-text("Calculatoare")').textContent();
  expect(title).toContain('Calculatoare');
  
  // Check if calculator cards are present
  const calculatorCards = page.locator('.MuiCard-root');
  const cardCount = await calculatorCards.count();
  expect(cardCount).toBeGreaterThanOrEqual(4); // Should have at least 4 calculator types
  
  // Try clicking on a calculator
  await calculatorCards.first().click();
  
  // Check if modal opens
  await page.waitForTimeout(500);
  const modal = page.locator('[role="dialog"]');
  const modalVisible = await modal.isVisible();
  
  console.log(`✅ Calculator page loaded successfully`);
  console.log(`   - Found ${cardCount} calculator cards`);
  console.log(`   - Modal ${modalVisible ? 'opens' : 'does not open'} when clicked`);
  
  if (errors.length > 0) {
    console.log('❌ JavaScript errors found:');
    errors.forEach(e => console.log(`   - ${e}`));
  }
  
  expect(errors).toHaveLength(0);
});