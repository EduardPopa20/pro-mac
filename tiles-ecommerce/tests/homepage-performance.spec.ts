import { test, expect } from '@playwright/test';

test.describe('Homepage Performance Tests', () => {
  test('Measure homepage load time and performance metrics', async ({ page }) => {
    console.log('🚀 Starting homepage performance test...');
    
    // Start measuring performance
    const startTime = Date.now();
    
    // Navigate and wait for full load
    await page.goto('http://localhost:5184', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Initial page load time: ${loadTime}ms`);
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let fcp = 0;
        let lcp = 0;
        let cls = 0;
        let fid = 0;
        
        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              fcp = entry.startTime;
            }
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Wait for metrics to be collected
        setTimeout(() => {
          resolve({
            firstContentfulPaint: fcp,
            largestContentfulPaint: lcp,
            cumulativeLayoutShift: cls,
            timeToInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
            windowLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
          });
        }, 3000);
      });
    });
    
    console.log('📊 Performance Metrics:');
    console.log(`   FCP (First Contentful Paint): ${metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log(`   LCP (Largest Contentful Paint): ${metrics.largestContentfulPaint.toFixed(2)}ms`);
    console.log(`   CLS (Cumulative Layout Shift): ${metrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`   TTI (Time to Interactive): ${metrics.timeToInteractive}ms`);
    console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`   Window Load: ${metrics.windowLoad}ms`);
    
    // Performance thresholds
    const thresholds = {
      fcp: 1800,  // Good: < 1.8s
      lcp: 2500,  // Good: < 2.5s
      cls: 0.1,   // Good: < 0.1
      tti: 3800   // Good: < 3.8s
    };
    
    // Check performance against thresholds
    console.log('\n📈 Performance Analysis:');
    
    if (metrics.firstContentfulPaint <= thresholds.fcp) {
      console.log(`   ✅ FCP is GOOD (${metrics.firstContentfulPaint.toFixed(0)}ms <= ${thresholds.fcp}ms)`);
    } else {
      console.log(`   ⚠️ FCP needs improvement (${metrics.firstContentfulPaint.toFixed(0)}ms > ${thresholds.fcp}ms)`);
    }
    
    if (metrics.largestContentfulPaint <= thresholds.lcp) {
      console.log(`   ✅ LCP is GOOD (${metrics.largestContentfulPaint.toFixed(0)}ms <= ${thresholds.lcp}ms)`);
    } else {
      console.log(`   ⚠️ LCP needs improvement (${metrics.largestContentfulPaint.toFixed(0)}ms > ${thresholds.lcp}ms)`);
    }
    
    if (metrics.cumulativeLayoutShift <= thresholds.cls) {
      console.log(`   ✅ CLS is GOOD (${metrics.cumulativeLayoutShift.toFixed(3)} <= ${thresholds.cls})`);
    } else {
      console.log(`   ⚠️ CLS needs improvement (${metrics.cumulativeLayoutShift.toFixed(3)} > ${thresholds.cls})`);
    }
    
    if (metrics.timeToInteractive <= thresholds.tti) {
      console.log(`   ✅ TTI is GOOD (${metrics.timeToInteractive}ms <= ${thresholds.tti}ms)`);
    } else {
      console.log(`   ⚠️ TTI needs improvement (${metrics.timeToInteractive}ms > ${thresholds.tti}ms)`);
    }
    
    // Test scroll performance
    console.log('\n📜 Testing scroll performance...');
    const scrollStartTime = Date.now();
    
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(2000);
    
    const scrollTime = Date.now() - scrollStartTime;
    console.log(`   Scroll to bottom took: ${scrollTime}ms`);
    
    // Count images and check lazy loading
    const imageStats = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return {
        total: images.length,
        lazy: images.filter(img => img.loading === 'lazy').length,
        loaded: images.filter(img => img.complete && img.naturalHeight !== 0).length
      };
    });
    
    console.log('\n🖼️ Image Optimization:');
    console.log(`   Total images: ${imageStats.total}`);
    console.log(`   Lazy loaded: ${imageStats.lazy}`);
    console.log(`   Currently loaded: ${imageStats.loaded}`);
    
    // Check bundle size (approximate)
    const resourceStats = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      let jsSize = 0;
      let cssSize = 0;
      let imageSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js')) {
          jsSize += resource.transferSize || 0;
        } else if (resource.name.includes('.css')) {
          cssSize += resource.transferSize || 0;
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) {
          imageSize += resource.transferSize || 0;
        }
      });
      
      return {
        totalResources: resources.length,
        jsSize: (jsSize / 1024).toFixed(2),
        cssSize: (cssSize / 1024).toFixed(2),
        imageSize: (imageSize / 1024).toFixed(2),
        totalSize: ((jsSize + cssSize + imageSize) / 1024).toFixed(2)
      };
    });
    
    console.log('\n📦 Resource Stats:');
    console.log(`   Total resources: ${resourceStats.totalResources}`);
    console.log(`   JavaScript: ${resourceStats.jsSize} KB`);
    console.log(`   CSS: ${resourceStats.cssSize} KB`);
    console.log(`   Images: ${resourceStats.imageSize} KB`);
    console.log(`   Total transferred: ${resourceStats.totalSize} KB`);
    
    // Memory usage
    const memoryStats = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(2),
          totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(2)
        };
      }
      return null;
    });
    
    if (memoryStats) {
      console.log('\n💾 Memory Usage:');
      console.log(`   Used JS Heap: ${memoryStats.usedJSHeapSize} MB`);
      console.log(`   Total JS Heap: ${memoryStats.totalJSHeapSize} MB`);
    }
    
    // Final recommendations
    console.log('\n🎯 Performance Recommendations:');
    
    if (metrics.largestContentfulPaint > 2500) {
      console.log('   • Optimize hero carousel images (use WebP format)');
      console.log('   • Implement image preloading for above-fold content');
    }
    
    if (imageStats.lazy < imageStats.total * 0.8) {
      console.log('   • Add lazy loading to more images');
    }
    
    if (parseFloat(resourceStats.jsSize) > 500) {
      console.log('   • Consider code splitting to reduce JS bundle size');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      console.log('   • Add explicit dimensions to images and containers');
      console.log('   • Avoid inserting content above existing content');
    }
    
    console.log('\n✅ Performance test complete!');
  });
  
  test('Test mobile performance', async ({ browser }) => {
    console.log('📱 Testing mobile performance...');
    
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    const startTime = Date.now();
    await page.goto('http://localhost:5184', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`   Mobile load time: ${loadTime}ms`);
    
    // Check if carousels are working
    const carouselCount = await page.locator('.slick-slider').count();
    console.log(`   Carousels found: ${carouselCount}`);
    
    // Check touch interactions
    await page.locator('.slick-slider').first().evaluate(el => {
      const event = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 200 } as Touch]
      });
      el.dispatchEvent(event);
    });
    
    await context.close();
    console.log('✅ Mobile performance test complete!');
  });
});