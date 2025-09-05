import { test } from '@playwright/test';

test('Layout analysis for all calculators', async ({ page }) => {
  console.log('📐 Starting layout analysis for all calculators...');
  
  // Test different viewport sizes
  const viewports = [
    { name: 'desktop-wide', width: 1920, height: 1080 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];
  
  const calculators = ['Gresie', 'Faianță', 'Parchet', 'Riflaje'];
  
  await page.goto('http://localhost:5184/calculator', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });
  
  for (const viewport of viewports) {
    console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(1000);
    
    for (const calculator of calculators) {
      console.log(`🧮 Testing ${calculator} calculator at ${viewport.name}...`);
      
      // Switch to calculator tab
      if (calculator !== 'Gresie') { // Gresie is default
        await page.locator(`[role="tab"]:has-text("${calculator}")`).click();
        await page.waitForTimeout(500);
      }
      
      // Screenshot before filling data
      await page.screenshot({ 
        path: `layout-${calculator.toLowerCase()}-${viewport.name}-empty.png`,
        fullPage: true 
      });
      console.log(`📸 Empty state: ${calculator} at ${viewport.name}`);
      
      // Fill form data
      if (calculator === 'Faianță') {
        // Wall dimensions for Faianță
        await page.locator('input[type="number"]').first().fill('4');
        await page.locator('input[type="number"]').nth(1).fill('3');
      } else {
        // Room dimensions for others
        await page.locator('input[type="number"]').first().fill('5');
        await page.locator('input[type="number"]').nth(1).fill('4');
      }
      
      // Screenshot after filling data
      await page.screenshot({ 
        path: `layout-${calculator.toLowerCase()}-${viewport.name}-filled.png`,
        fullPage: true 
      });
      console.log(`📸 Filled state: ${calculator} at ${viewport.name}`);
      
      // Start calculation and screenshot loading
      await page.locator('button:has-text("Calculează")').click();
      await page.waitForTimeout(200); // Catch loading state
      
      await page.screenshot({ 
        path: `layout-${calculator.toLowerCase()}-${viewport.name}-loading.png`,
        fullPage: true 
      });
      console.log(`📸 Loading state: ${calculator} at ${viewport.name}`);
      
      // Wait for results
      await page.waitForTimeout(1500);
      
      // Screenshot with results
      await page.screenshot({ 
        path: `layout-${calculator.toLowerCase()}-${viewport.name}-results.png`,
        fullPage: true 
      });
      console.log(`📸 Results state: ${calculator} at ${viewport.name}`);
      
      // Reset for next test
      await page.locator('button:has-text("Reset")').click();
      await page.waitForTimeout(500);
    }
    
    console.log(`✅ Completed ${viewport.name} viewport`);
  }
  
  console.log('🎉 Layout analysis complete! Check all generated screenshots.');
});