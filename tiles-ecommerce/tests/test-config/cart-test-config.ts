import { defineConfig } from '@playwright/test'

/**
 * Configurație specializată pentru testarea funcționalității de coș
 * Extinde configurația principală cu setări specifice pentru testele E2E de cart
 */
export const cartTestConfig = defineConfig({
  // Test directory specific pentru testele de cart
  testDir: '../',
  
  // Timeout-uri optimizate pentru operațiunile de cart
  timeout: 60 * 1000, // 60 secunde pentru teste complexe de cart
  expect: {
    timeout: 10 * 1000 // 10 secunde pentru assertions
  },
  
  // Configurare pentru rularea în paralel
  fullyParallel: false, // Cart tests pot avea dependențe de stare
  workers: process.env.CI ? 2 : 3,
  
  // Retry configuration pentru stabilitate
  retries: process.env.CI ? 3 : 1,
  
  // Raportare detaliată
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['json', { 
      outputFile: 'test-results/cart-results.json'
    }],
    ['junit', { 
      outputFile: 'test-results/cart-junit.xml'
    }],
    ['line'],
    // Custom reporter pentru cart metrics
    ['./test-config/cart-reporter.ts']
  ],
  
  // Configurare globală
  use: {
    // Base URL pentru toate testele
    baseURL: 'http://localhost:5176',
    
    // Browser settings
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    
    // Tracing pentru debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Network settings
    ignoreHTTPSErrors: true,
    
    // Context options pentru cart testing
    storageState: undefined, // Start fresh for each test
    
    // Custom test data
    extraHTTPHeaders: {
      'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8'
    }
  },

  // Projects pentru diferite scenarii de testare
  projects: [
    {
      name: 'cart-desktop-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      },
      testMatch: /cart.*\.spec\.ts$/,
    },
    {
      name: 'cart-mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      testMatch: /cart.*\.spec\.ts$/,
    },
    {
      name: 'cart-tablet',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
      testMatch: /cart.*\.spec\.ts$/,
    },
    {
      name: 'cart-firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /cart.*\.spec\.ts$/,
    }
  ],

  // Test patterns specifice pentru cart
  testMatch: [
    '**/cart-functionality-e2e.spec.ts',
    '**/cart-data-validation-e2e.spec.ts'
  ],

  // Global setup pentru testele de cart
  globalSetup: './test-config/cart-global-setup.ts',
  globalTeardown: './test-config/cart-global-teardown.ts',

  // Metadata pentru rapoarte
  metadata: {
    testSuite: 'Cart E2E Tests',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    timestamp: new Date().toISOString()
  }
})

export default cartTestConfig