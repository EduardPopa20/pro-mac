import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter'
import * as fs from 'fs'
import * as path from 'path'

interface CartTestMetrics {
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  totalDuration: number
  averageDuration: number
  testsByCategory: Record<string, number>
  failuresByCategory: Record<string, number>
  performanceMetrics: {
    slowestTests: Array<{ name: string; duration: number }>
    fastestTests: Array<{ name: string; duration: number }>
  }
  cartSpecificMetrics: {
    productsAdded: number
    cartOperations: number
    dataValidations: number
    responsiveTests: number
  }
}

class CartTestReporter implements Reporter {
  private metrics: CartTestMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
    averageDuration: 0,
    testsByCategory: {},
    failuresByCategory: {},
    performanceMetrics: {
      slowestTests: [],
      fastestTests: []
    },
    cartSpecificMetrics: {
      productsAdded: 0,
      cartOperations: 0,
      dataValidations: 0,
      responsiveTests: 0
    }
  }

  private testResults: Array<{
    title: string
    status: string
    duration: number
    category: string
    errors: string[]
  }> = []

  onBegin(config: FullConfig, suite: Suite) {
    console.log('\n🛒 Începerea testelor E2E pentru funcționalitatea de Coș')
    console.log(`📊 Configurare: ${config.projects.length} proiecte, ${config.workers} workers`)
    console.log(`🔧 Browser: ${config.projects.map(p => p.name).join(', ')}`)
    console.log('=' .repeat(60))
  }

  onTestBegin(test: TestCase, result: TestResult) {
    const category = this.categorizeTest(test.title)
    console.log(`🧪 ${test.title} [${category}]`)
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const category = this.categorizeTest(test.title)
    const duration = result.duration
    
    // Update metrics
    this.metrics.totalTests++
    this.metrics.totalDuration += duration
    
    if (!this.metrics.testsByCategory[category]) {
      this.metrics.testsByCategory[category] = 0
    }
    this.metrics.testsByCategory[category]++
    
    // Update cart specific metrics
    this.updateCartSpecificMetrics(test.title)
    
    switch (result.status) {
      case 'passed':
        this.metrics.passedTests++
        console.log(`  ✅ Passed (${duration}ms)`)
        break
      case 'failed':
        this.metrics.failedTests++
        if (!this.metrics.failuresByCategory[category]) {
          this.metrics.failuresByCategory[category] = 0
        }
        this.metrics.failuresByCategory[category]++
        console.log(`  ❌ Failed (${duration}ms)`)
        if (result.error) {
          console.log(`     Error: ${result.error.message?.slice(0, 100)}...`)
        }
        break
      case 'skipped':
        this.metrics.skippedTests++
        console.log(`  ⏭️  Skipped`)
        break
      case 'timedOut':
        this.metrics.failedTests++
        console.log(`  ⏰ Timeout (${duration}ms)`)
        break
    }

    // Store detailed results
    this.testResults.push({
      title: test.title,
      status: result.status,
      duration,
      category,
      errors: result.errors.map(e => e.message || 'Unknown error')
    })

    // Track performance metrics
    this.updatePerformanceMetrics(test.title, duration)
  }

  onEnd(result: FullResult) {
    console.log('\n' + '='.repeat(60))
    console.log('🏁 Testele E2E pentru Coș au fost finalizate')
    
    // Calculate averages
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalTests || 0

    // Print summary
    this.printTestSummary()
    this.printCategoryBreakdown()
    this.printCartSpecificMetrics()
    this.printPerformanceMetrics()
    this.printFailureAnalysis()

    // Save detailed report
    this.saveDetailedReport()
    
    // Generate HTML report summary
    this.generateHTMLSummary()

    console.log('\n📁 Rapoarte salvate în:')
    console.log('   - test-results/cart-detailed-report.json')
    console.log('   - test-results/cart-summary.html')
    console.log('   - playwright-report/index.html')
  }

  private categorizeTest(title: string): string {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('gresie')) return 'Gresie Category'
    if (lowerTitle.includes('faianta') || lowerTitle.includes('faianță')) return 'Faianta Category'
    if (lowerTitle.includes('data') || lowerTitle.includes('validation')) return 'Data Validation'
    if (lowerTitle.includes('responsive') || lowerTitle.includes('mobile') || lowerTitle.includes('tablet')) return 'Responsive Design'
    if (lowerTitle.includes('cart') && lowerTitle.includes('management')) return 'Cart Management'
    if (lowerTitle.includes('navigation') || lowerTitle.includes('flow')) return 'User Flow'
    if (lowerTitle.includes('error') || lowerTitle.includes('edge')) return 'Error Handling'
    if (lowerTitle.includes('price') || lowerTitle.includes('currency')) return 'Pricing & Currency'
    
    return 'General Cart'
  }

  private updateCartSpecificMetrics(title: string): void {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes('add') && lowerTitle.includes('cart')) {
      this.metrics.cartSpecificMetrics.productsAdded++
    }
    if (lowerTitle.includes('update') || lowerTitle.includes('remove') || lowerTitle.includes('quantity')) {
      this.metrics.cartSpecificMetrics.cartOperations++
    }
    if (lowerTitle.includes('data') || lowerTitle.includes('validation') || lowerTitle.includes('accuracy')) {
      this.metrics.cartSpecificMetrics.dataValidations++
    }
    if (lowerTitle.includes('responsive') || lowerTitle.includes('mobile') || lowerTitle.includes('tablet')) {
      this.metrics.cartSpecificMetrics.responsiveTests++
    }
  }

  private updatePerformanceMetrics(title: string, duration: number): void {
    // Update slowest tests (top 5)
    this.metrics.performanceMetrics.slowestTests.push({ name: title, duration })
    this.metrics.performanceMetrics.slowestTests.sort((a, b) => b.duration - a.duration)
    this.metrics.performanceMetrics.slowestTests = this.metrics.performanceMetrics.slowestTests.slice(0, 5)

    // Update fastest tests (top 5)
    this.metrics.performanceMetrics.fastestTests.push({ name: title, duration })
    this.metrics.performanceMetrics.fastestTests.sort((a, b) => a.duration - b.duration)
    this.metrics.performanceMetrics.fastestTests = this.metrics.performanceMetrics.fastestTests.slice(0, 5)
  }

  private printTestSummary(): void {
    console.log('\n📊 SUMAR GENERAL:')
    console.log(`   Total teste: ${this.metrics.totalTests}`)
    console.log(`   ✅ Passed: ${this.metrics.passedTests} (${(this.metrics.passedTests / this.metrics.totalTests * 100).toFixed(1)}%)`)
    console.log(`   ❌ Failed: ${this.metrics.failedTests} (${(this.metrics.failedTests / this.metrics.totalTests * 100).toFixed(1)}%)`)
    console.log(`   ⏭️  Skipped: ${this.metrics.skippedTests}`)
    console.log(`   ⏱️  Timp total: ${(this.metrics.totalDuration / 1000).toFixed(2)}s`)
    console.log(`   📈 Timp mediu/test: ${this.metrics.averageDuration.toFixed(0)}ms`)
  }

  private printCategoryBreakdown(): void {
    console.log('\n🗂️  BREAKDOWN PE CATEGORII:')
    Object.entries(this.metrics.testsByCategory).forEach(([category, count]) => {
      const failures = this.metrics.failuresByCategory[category] || 0
      const successRate = ((count - failures) / count * 100).toFixed(1)
      console.log(`   ${category}: ${count} teste (${successRate}% success rate)`)
    })
  }

  private printCartSpecificMetrics(): void {
    console.log('\n🛒 METRICI SPECIFICE COȘULUI:')
    console.log(`   📦 Produse adăugate în teste: ${this.metrics.cartSpecificMetrics.productsAdded}`)
    console.log(`   🔄 Operațiuni de cart testate: ${this.metrics.cartSpecificMetrics.cartOperations}`)
    console.log(`   ✅ Validări de date: ${this.metrics.cartSpecificMetrics.dataValidations}`)
    console.log(`   📱 Teste responsive: ${this.metrics.cartSpecificMetrics.responsiveTests}`)
  }

  private printPerformanceMetrics(): void {
    console.log('\n⚡ METRICI DE PERFORMANȚĂ:')
    console.log('   🐌 Cele mai lente teste:')
    this.metrics.performanceMetrics.slowestTests.forEach((test, i) => {
      console.log(`     ${i + 1}. ${test.name} (${test.duration}ms)`)
    })
    
    console.log('   🚀 Cele mai rapide teste:')
    this.metrics.performanceMetrics.fastestTests.forEach((test, i) => {
      console.log(`     ${i + 1}. ${test.name} (${test.duration}ms)`)
    })
  }

  private printFailureAnalysis(): void {
    if (this.metrics.failedTests > 0) {
      console.log('\n🔍 ANALIZĂ EȘECURI:')
      const failedTests = this.testResults.filter(t => t.status === 'failed')
      
      failedTests.forEach(test => {
        console.log(`   ❌ ${test.title}`)
        test.errors.forEach(error => {
          console.log(`      └─ ${error.slice(0, 80)}...`)
        })
      })
    }
  }

  private saveDetailedReport(): void {
    const reportDir = path.resolve('test-results')
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const detailedReport = {
      summary: this.metrics,
      testResults: this.testResults,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }

    fs.writeFileSync(
      path.join(reportDir, 'cart-detailed-report.json'),
      JSON.stringify(detailedReport, null, 2)
    )
  }

  private generateHTMLSummary(): void {
    const reportDir = path.resolve('test-results')
    const successRate = (this.metrics.passedTests / this.metrics.totalTests * 100).toFixed(1)
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Cart E2E Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #e1e8ed; border-radius: 8px; padding: 15px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1da1f2; }
        .success { color: #17bf63; }
        .failure { color: #e0245e; }
        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .category { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🛒 Cart E2E Test Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString('ro-RO')}</p>
        <p><strong>Success Rate:</strong> ${successRate}%</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <div class="metric-value">${this.metrics.totalTests}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value success">${this.metrics.passedTests}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value failure">${this.metrics.failedTests}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${(this.metrics.totalDuration / 1000).toFixed(2)}s</div>
            <div>Total Duration</div>
        </div>
    </div>

    <h2>📊 Test Categories</h2>
    <div class="category-grid">
        ${Object.entries(this.metrics.testsByCategory).map(([category, count]) => {
          const failures = this.metrics.failuresByCategory[category] || 0
          const categorySuccessRate = ((count - failures) / count * 100).toFixed(1)
          return `
            <div class="category">
                <h3>${category}</h3>
                <p><strong>Tests:</strong> ${count}</p>
                <p><strong>Success Rate:</strong> ${categorySuccessRate}%</p>
            </div>
          `
        }).join('')}
    </div>

    <h2>🛒 Cart-Specific Metrics</h2>
    <div class="metrics">
        <div class="metric">
            <div class="metric-value">${this.metrics.cartSpecificMetrics.productsAdded}</div>
            <div>Products Added</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.metrics.cartSpecificMetrics.cartOperations}</div>
            <div>Cart Operations</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.metrics.cartSpecificMetrics.dataValidations}</div>
            <div>Data Validations</div>
        </div>
        <div class="metric">
            <div class="metric-value">${this.metrics.cartSpecificMetrics.responsiveTests}</div>
            <div>Responsive Tests</div>
        </div>
    </div>
</body>
</html>
    `.trim()

    fs.writeFileSync(path.join(reportDir, 'cart-summary.html'), html)
  }
}

export default CartTestReporter