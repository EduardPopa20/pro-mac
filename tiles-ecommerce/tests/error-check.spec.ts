import { test } from '@playwright/test';

test('Check for JavaScript errors', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Capture all console messages
  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      errors.push(text);
      console.log(`❌ Error: ${text}`);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log(`⚠️  Warning: ${text}`);
    } else if (type === 'log') {
      console.log(`ℹ️  Log: ${text}`);
    }
  });
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
    console.log(`💥 Page Error: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });
  
  console.log('🔄 Navigating to calculator page...');
  
  try {
    await page.goto('http://localhost:5184/calculator', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ Navigation completed');
    
    // Wait for any async errors
    await page.waitForTimeout(3000);
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Errors: ${errors.length}`);
    console.log(`   - Warnings: ${warnings.length}`);
    
  } catch (error) {
    console.log(`💥 Navigation failed: ${error}`);
  }
});