import { test, expect } from '@playwright/test';

test('Check for actual console errors with detailed reporting', async ({ page }) => {
  const errors: Array<{ text: string, location?: string }> = [];
  
  // Capture console errors with more details
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const location = msg.location();
      errors.push({
        text: msg.text(),
        location: location ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : undefined
      });
    }
  });

  page.on('pageerror', (error) => {
    errors.push({
      text: error.message,
      location: error.stack?.split('\n')[1]?.trim()
    });
  });

  // Navigate to homepage
  await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit for any async errors
  await page.waitForTimeout(2000);
  
  if (errors.length > 0) {
    console.log('❌ Console errors found:');
    errors.forEach((error, i) => {
      console.log(`\n${i + 1}. ${error.text}`);
      if (error.location) {
        console.log(`   Location: ${error.location}`);
      }
    });
    
    // Try to identify which imports are problematic
    const importErrors = errors.filter(e => e.text.includes('does not provide an export'));
    if (importErrors.length > 0) {
      console.log('\n📦 Import errors detected:');
      importErrors.forEach(e => {
        const match = e.text.match(/module '([^']+)' does not provide an export named '([^']+)'/);
        if (match) {
          console.log(`   - Module: ${match[1]}`);
          console.log(`     Missing export: ${match[2]}`);
        }
      });
    }
  } else {
    console.log('✅ No console errors found!');
  }
  
  // Fail the test if there are errors
  expect(errors.length).toBe(0);
});