import { test, expect } from '@playwright/test';

test('Showcase new homepage design', async ({ page }) => {
  console.log('🎨 Capturing the beautiful new homepage design...');
  
  await page.goto('http://localhost:5184', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(3000); // Wait for animations
  
  // Screenshot the full homepage
  await page.screenshot({ 
    path: 'homepage-full-redesign.png', 
    fullPage: true 
  });
  console.log('📸 Full homepage captured');
  
  // Screenshot hero section
  await page.screenshot({ 
    path: 'homepage-hero-section.png', 
    clip: { x: 0, y: 0, width: 1920, height: 850 }
  });
  console.log('📸 Hero section captured');
  
  // Scroll to promotional offers
  await page.evaluate(() => window.scrollTo(0, 850));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'homepage-promotional-offers.png', 
    clip: { x: 0, y: 850, width: 1920, height: 400 }
  });
  console.log('📸 Promotional offers captured');
  
  // Scroll to product carousels
  await page.evaluate(() => window.scrollTo(0, 1250));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'homepage-product-carousels.png', 
    clip: { x: 0, y: 1250, width: 1920, height: 600 }
  });
  console.log('📸 Product carousels captured');
  
  // Test mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:5184', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: 'homepage-mobile-view.png', 
    fullPage: true 
  });
  console.log('📸 Mobile view captured');
  
  // Test tablet view
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  
  await page.goto('http://localhost:5184', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: 'homepage-tablet-view.png', 
    fullPage: true 
  });
  console.log('📸 Tablet view captured');
  
  console.log('✅ All homepage screenshots captured successfully!');
});