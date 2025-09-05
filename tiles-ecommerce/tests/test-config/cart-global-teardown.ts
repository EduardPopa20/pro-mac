import { FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Teardown global pentru testele de cart E2E
 * Curăță environment-ul și generează rapoarte finale
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Teardown global pentru testele de Cart E2E...')
  
  try {
    // Citirea metadatelor setup-ului
    const setupInfoPath = path.resolve('test-results', 'setup-info.json')
    let setupInfo = {}
    
    if (fs.existsSync(setupInfoPath)) {
      setupInfo = JSON.parse(fs.readFileSync(setupInfoPath, 'utf-8'))
      console.log('📋 Setup info găsit și încărcat')
    }

    // Citirea rezultatelor testelor pentru statistici finale
    const cartResultsPath = path.resolve('test-results', 'cart-results.json')
    let testResults = null
    
    if (fs.existsSync(cartResultsPath)) {
      testResults = JSON.parse(fs.readFileSync(cartResultsPath, 'utf-8'))
      console.log('📊 Rezultatele testelor găsite și încărcate')
    }

    // Calcularea statisticilor finale
    const finalStats = {
      setupInfo,
      testResults,
      teardownTimestamp: new Date().toISOString(),
      testDuration: setupInfo && (setupInfo as any).timestamp 
        ? Date.now() - new Date((setupInfo as any).timestamp).getTime() 
        : 0,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    }

    // Salvarea statisticilor finale
    fs.writeFileSync(
      path.resolve('test-results', 'final-stats.json'),
      JSON.stringify(finalStats, null, 2)
    )

    // Generarea unui raport consolidat
    generateConsolidatedReport(finalStats)

    // Curățarea fișierelor temporare dacă este necesar
    cleanupTempFiles()

    // Afișarea rezumatului final
    printFinalSummary(finalStats)

    console.log('✅ Teardown global completat cu succes!')
    
  } catch (error) {
    console.error('❌ Eroare în teardown-ul global:', error)
    // Nu opresc procesul pentru că testele s-au terminat deja
  }
}

function generateConsolidatedReport(stats: any) {
  console.log('📝 Generarea raportului consolidat...')
  
  const reportPath = path.resolve('test-results', 'consolidated-report.md')
  
  const report = `# Cart E2E Test Execution Report

## 📊 Execution Summary
- **Start Time:** ${stats.setupInfo?.timestamp || 'N/A'}
- **End Time:** ${stats.teardownTimestamp}
- **Total Duration:** ${Math.round(stats.testDuration / 1000)}s
- **Environment:** ${stats.setupInfo?.environment || 'N/A'}
- **Platform:** ${stats.environment.platform} ${stats.environment.arch}
- **Node Version:** ${stats.environment.nodeVersion}

## 🧪 Test Results
${stats.testResults ? `
- **Total Tests:** ${stats.testResults.stats?.tests || 'N/A'}
- **Passed:** ${stats.testResults.stats?.passed || 'N/A'}
- **Failed:** ${stats.testResults.stats?.failed || 'N/A'}
- **Skipped:** ${stats.testResults.stats?.skipped || 'N/A'}
` : '- Test results not available'}

## 💾 Memory Usage
- **RSS:** ${Math.round(stats.environment.memoryUsage.rss / 1024 / 1024)} MB
- **Heap Used:** ${Math.round(stats.environment.memoryUsage.heapUsed / 1024 / 1024)} MB
- **Heap Total:** ${Math.round(stats.environment.memoryUsage.heapTotal / 1024 / 1024)} MB
- **External:** ${Math.round(stats.environment.memoryUsage.external / 1024 / 1024)} MB

## 📁 Generated Files
- \`test-results/cart-detailed-report.json\` - Detailed test metrics
- \`test-results/cart-summary.html\` - Visual HTML summary
- \`test-results/final-stats.json\` - Complete execution statistics
- \`playwright-report/index.html\` - Full Playwright HTML report

## 🎯 Recommendations
1. Review failed tests in the HTML report
2. Check performance metrics for slow tests
3. Validate responsive design test coverage
4. Ensure data validation tests are comprehensive

---
*Generated automatically by Cart E2E Test Suite*
`

  fs.writeFileSync(reportPath, report)
  console.log(`📄 Raport consolidat salvat în: ${reportPath}`)
}

function cleanupTempFiles() {
  console.log('🗑️  Curățarea fișierelor temporare...')
  
  const tempFiles = [
    'test-results/.tmp',
    'test-results/temp',
  ]
  
  tempFiles.forEach(file => {
    const fullPath = path.resolve(file)
    if (fs.existsSync(fullPath)) {
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true })
        } else {
          fs.unlinkSync(fullPath)
        }
        console.log(`🗑️  Șters: ${file}`)
      } catch (error) {
        console.warn(`⚠️  Nu s-a putut șterge ${file}:`, (error as Error).message)
      }
    }
  })
}

function printFinalSummary(stats: any) {
  console.log('\n' + '='.repeat(60))
  console.log('🎯 SUMAR FINAL - TESTE CART E2E')
  console.log('='.repeat(60))
  
  if (stats.setupInfo?.timestamp) {
    const startTime = new Date(stats.setupInfo.timestamp)
    const endTime = new Date(stats.teardownTimestamp)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000)
    
    console.log(`⏱️  Durată totală: ${duration}s`)
    console.log(`🚀 Început: ${startTime.toLocaleString('ro-RO')}`)
    console.log(`🏁 Sfârșit: ${endTime.toLocaleString('ro-RO')}`)
  }
  
  if (stats.testResults?.stats) {
    const testStats = stats.testResults.stats
    const successRate = testStats.tests > 0 
      ? ((testStats.passed / testStats.tests) * 100).toFixed(1)
      : '0'
    
    console.log(`📊 Teste rulat: ${testStats.tests}`)
    console.log(`✅ Passed: ${testStats.passed}`)
    console.log(`❌ Failed: ${testStats.failed}`)
    console.log(`⏭️  Skipped: ${testStats.skipped}`)
    console.log(`📈 Success Rate: ${successRate}%`)
  }
  
  console.log(`💾 Memorie folosită: ${Math.round(stats.environment.memoryUsage.rss / 1024 / 1024)} MB`)
  console.log(`🖥️  Platform: ${stats.environment.platform} ${stats.environment.arch}`)
  
  console.log('\n📁 Rapoarte generate:')
  console.log('   - test-results/consolidated-report.md')
  console.log('   - test-results/cart-summary.html')
  console.log('   - playwright-report/index.html')
  
  console.log('\n🎉 Testele Cart E2E completate!')
  console.log('='.repeat(60))
}

export default globalTeardown