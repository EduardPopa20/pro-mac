import { test } from '@playwright/test';

test('View complete homepage redesign', async ({ page }) => {
  console.log('🎨 Viewing the beautiful new homepage design...');
  
  // Desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5184', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'homepage-complete-redesign.png', 
    fullPage: true 
  });
  console.log('📸 Complete homepage captured');
  
  // Mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5184', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: 'homepage-mobile-redesign.png', 
    fullPage: true 
  });
  console.log('📸 Mobile version captured');
  
  console.log('✅ Homepage redesign showcase complete!');
});