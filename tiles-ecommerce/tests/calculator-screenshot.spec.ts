import { test, expect } from '@playwright/test';

test.describe('Calculator Screenshot', () => {
  test('take screenshot of calculator page showing improvements', async ({ page }) => {
    // Set large desktop resolution
    await page.setViewportSize({ width: 1400, height: 1000 });
    
    // Navigate to calculator page
    await page.goto('http://localhost:5176/calculator');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot showing equal height cards
    await page.screenshot({ 
      path: 'calculator-equal-height-initial.png', 
      fullPage: true 
    });
    
    // Fill in form data properly to enable the calculate button
    const lengthInput = page.locator('input[type="number"]').first();
    const widthInput = page.locator('input[type="number"]').nth(1);
    
    // Fill in room dimensions
    await lengthInput.fill('5');
    await widthInput.fill('4');
    
    // Wait a moment for form validation
    await page.waitForTimeout(500);
    
    // Look for calculate button and make sure it's enabled
    const calculateButton = page.locator('button').filter({ hasText: /calculeaz/i });
    await calculateButton.waitFor({ state: 'visible' });
    
    // Click calculate and wait for results
    await calculateButton.click();
    
    // Wait for calculation to complete
    await page.waitForTimeout(2000);
    
    // Take screenshot after calculation showing the full width recommendations
    await page.screenshot({ 
      path: 'calculator-full-width-recommendations.png', 
      fullPage: true 
    });
    
    console.log('Screenshots saved: calculator-equal-height-initial.png and calculator-full-width-recommendations.png');
  });
});