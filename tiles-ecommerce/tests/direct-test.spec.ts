import { test, expect } from '@playwright/test';

test('Direct calculator page test', async ({ page }) => {
  console.log('Navigating to calculator page...');
  
  // Navigate to calculator page with a longer timeout
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // Wait a bit for React to render
  await page.waitForTimeout(3000);
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'calculator-debug.png', fullPage: true });
  
  // Get page content
  const content = await page.content();
  console.log('Page loaded, content length:', content.length);
  
  // Check if we have any React errors
  const errorMessage = page.locator('text=Error');
  const hasError = await errorMessage.count() > 0;
  console.log('Has error message:', hasError);
  
  // Check if calculator content is present
  const tabContainer = page.locator('.MuiTabs-root');
  const hasTabContainer = await tabContainer.count() > 0;
  console.log('Has tab container:', hasTabContainer);
  
  // Check if page loaded at all
  const bodyText = await page.locator('body').textContent();
  console.log('Body text preview:', bodyText?.substring(0, 200));
});