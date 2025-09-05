#!/usr/bin/env tsx

/**
 * Script pentru rularea testelor E2E cu raportare completă
 * Usage: npx tsx tests/run-tests-with-reports.ts [options]
 */

import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestRunOptions {
  testFile?: string
  browser?: 'chromium' | 'firefox' | 'webkit' | 'all'
  headed?: boolean
  workers?: number
  timeout?: number
  category?: 'gresie' | 'faianta' | 'comprehensive' | 'all'
}

class TestRunner {
  private options: TestRunOptions
  private startTime: number

  constructor(options: TestRunOptions = {}) {
    this.options = {
      browser: 'chromium',
      headed: true,
      workers: 1,
      timeout: 30000,
      category: 'all',
      ...options
    }
    this.startTime = Date.now()
  }

  async runTests(): Promise<void> {
    console.log('🚀 Pornirea testelor E2E cu raportare completă')
    console.log('=' .repeat(60))
    
    this.printConfiguration()
    
    // Verifică serverul
    if (!(await this.checkServer())) {
      console.error('❌ Serverul nu rulează pe http://localhost:5176')
      console.log('💡 Rulează: npm run dev în alt terminal')
      process.exit(1)
    }

    // Creează directoarele pentru rapoarte
    this.ensureDirectories()

    // Determină testele de rulat
    const testFiles = this.getTestFiles()
    
    console.log(`📁 Testele selectate: ${testFiles.join(', ')}`)
    console.log('')

    // Rulează testele
    for (const testFile of testFiles) {
      console.log(`🔄 Rularea testului: ${testFile}`)
      await this.runSingleTest(testFile)
    }

    // Generează raportul consolidat
    await this.generateConsolidatedReport()
    
    const duration = Math.round((Date.now() - this.startTime) / 1000)
    console.log(`✅ Toate testele completate în ${duration}s`)
    console.log('📊 Rapoartele au fost salvate în directorul test-reports/')
  }

  private printConfiguration(): void {
    console.log('⚙️  Configurație teste:')
    console.log(`   Browser: ${this.options.browser}`)
    console.log(`   Headed: ${this.options.headed ? 'Da' : 'Nu'}`)
    console.log(`   Workers: ${this.options.workers}`)
    console.log(`   Timeout: ${this.options.timeout}ms`)
    console.log(`   Category: ${this.options.category}`)
    console.log('')
  }

  private async checkServer(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5176/')
      return response.ok
    } catch {
      return false
    }
  }

  private ensureDirectories(): void {
    const dirs = ['test-reports', 'screenshots', 'videos', 'traces']
    dirs.forEach(dir => {
      const fullPath = path.resolve(dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  private getTestFiles(): string[] {
    const category = this.options.category
    const baseTests = {
      'gresie': ['tests/gresie-cart-with-reporting.spec.ts'],
      'faianta': ['tests/faianta-cart-with-reporting.spec.ts'],
      'comprehensive': ['tests/comprehensive-cart-test.spec.ts'],
      'all': [
        'tests/gresie-cart-with-reporting.spec.ts',
        'tests/faianta-cart-with-reporting.spec.ts'
      ]
    }

    if (this.options.testFile) {
      return [this.options.testFile]
    }

    return baseTests[category] || baseTests['all']
  }

  private async runSingleTest(testFile: string): Promise<void> {
    const args = [
      'playwright', 'test', testFile,
      `--workers=${this.options.workers}`,
      `--timeout=${this.options.timeout}`,
      '--reporter=list,html'
    ]

    if (this.options.headed) {
      args.push('--headed')
    }

    if (this.options.browser !== 'all') {
      args.push('--project', this.options.browser)
    }

    return new Promise((resolve, reject) => {
      const child = spawn('npx', args, {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          PLAYWRIGHT_HTML_REPORT: path.resolve('playwright-report'),
          PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:5176'
        }
      })

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Test ${testFile} completat cu succes`)
          resolve()
        } else {
          console.log(`⚠️  Test ${testFile} completat cu cod: ${code}`)
          // Nu rejectăm pentru că vrem să continuăm cu celelalte teste
          resolve()
        }
      })

      child.on('error', (error) => {
        console.error(`❌ Eroare la ${testFile}:`, error)
        reject(error)
      })
    })
  }

  private async generateConsolidatedReport(): Promise<void> {
    console.log('📝 Generarea raportului consolidat...')
    
    const reportsDir = path.resolve('test-reports')
    if (!fs.existsSync(reportsDir)) {
      console.log('⚠️  Nu există directorul test-reports')
      return
    }

    // Găsește toate rapoartele JSON generate
    const jsonFiles = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json'))
      .sort()

    if (jsonFiles.length === 0) {
      console.log('⚠️  Nu s-au găsit rapoarte JSON')
      return
    }

    console.log(`📋 Procesarea a ${jsonFiles.length} rapoarte individuale...`)

    const consolidatedData = {
      generatedAt: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      configuration: this.options,
      testResults: [] as any[],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0
      }
    }

    // Procesează fiecare raport
    for (const jsonFile of jsonFiles) {
      try {
        const filePath = path.join(reportsDir, jsonFile)
        const reportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        consolidatedData.testResults.push(reportData)
        
        // Actualizează statisticile
        consolidatedData.summary.totalTests++
        if (reportData.status === 'PASS') {
          consolidatedData.summary.passedTests++
        } else {
          consolidatedData.summary.failedTests++
        }
        
        consolidatedData.summary.totalSteps += reportData.summary?.totalSteps || 0
        consolidatedData.summary.passedSteps += reportData.summary?.passedSteps || 0
        consolidatedData.summary.failedSteps += reportData.summary?.failedSteps || 0
        
      } catch (error) {
        console.warn(`⚠️  Nu s-a putut procesa ${jsonFile}:`, error)
      }
    }

    // Salvează raportul consolidat
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]
    const consolidatedPath = path.join(reportsDir, `CONSOLIDATED_REPORT_${timestamp}.json`)
    fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedData, null, 2))

    // Generează și varianta HTML
    const htmlPath = path.join(reportsDir, `CONSOLIDATED_REPORT_${timestamp}.html`)
    fs.writeFileSync(htmlPath, this.generateConsolidatedHTML(consolidatedData))

    console.log(`📊 Raport consolidat salvat:`)
    console.log(`   📄 JSON: ${consolidatedPath}`)
    console.log(`   🌐 HTML: ${htmlPath}`)
    console.log('')
    console.log('📈 Sumar final:')
    console.log(`   🧪 Total teste: ${consolidatedData.summary.totalTests}`)
    console.log(`   ✅ Trecute: ${consolidatedData.summary.passedTests}`)
    console.log(`   ❌ Eșuate: ${consolidatedData.summary.failedTests}`)
    console.log(`   📋 Total pași: ${consolidatedData.summary.totalSteps}`)
    console.log(`   📈 Success rate: ${Math.round((consolidatedData.summary.passedTests / consolidatedData.summary.totalTests) * 100)}%`)
  }

  private generateConsolidatedHTML(data: any): string {
    const successRate = Math.round((data.summary.passedTests / data.summary.totalTests) * 100)
    const statusColor = successRate >= 90 ? '#4CAF50' : successRate >= 70 ? '#FF9800' : '#F44336'
    
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raport Consolidat Teste E2E</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header p { margin: 15px 0 0 0; font-size: 1.2em; opacity: 0.9; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; color: ${statusColor}; }
        .stat-label { color: #666; text-transform: uppercase; font-size: 0.9em; }
        .tests-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px; }
        .test-card { background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
        .test-header { padding: 20px; border-bottom: 1px solid #eee; }
        .test-title { font-size: 1.3em; font-weight: bold; color: #333; margin: 0 0 5px 0; }
        .test-category { color: #667eea; font-size: 0.9em; }
        .test-status { display: inline-block; padding: 6px 12px; border-radius: 20px; color: white; font-size: 0.8em; font-weight: bold; }
        .test-status.pass { background: #4CAF50; }
        .test-status.fail { background: #F44336; }
        .test-body { padding: 20px; }
        .test-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .meta-item { font-size: 0.9em; }
        .meta-label { color: #666; font-weight: bold; }
        .meta-value { color: #333; }
        .steps-summary { background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Raport Consolidat Teste E2E</h1>
            <p>Gresie & Faianta Cart Functionality</p>
            <div style="margin-top: 20px;">
                <span style="background: ${statusColor}; padding: 10px 20px; border-radius: 25px; font-size: 1.1em;">
                    Success Rate: ${successRate}%
                </span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${data.summary.totalTests}</div>
                <div class="stat-label">Total Teste</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #4CAF50;">${data.summary.passedTests}</div>
                <div class="stat-label">Trecute</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" style="color: #F44336;">${data.summary.failedTests}</div>
                <div class="stat-label">Eșuate</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.summary.totalSteps}</div>
                <div class="stat-label">Total Pași</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round(data.totalDuration / 1000)}s</div>
                <div class="stat-label">Durată Totală</div>
            </div>
        </div>

        <div class="tests-grid">
            ${data.testResults.map((test: any) => `
                <div class="test-card">
                    <div class="test-header">
                        <div class="test-title">${test.testName}</div>
                        <div class="test-category">${test.category}</div>
                        <div style="margin-top: 10px;">
                            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
                        </div>
                    </div>
                    <div class="test-body">
                        <div class="test-meta">
                            <div class="meta-item">
                                <div class="meta-label">Browser:</div>
                                <div class="meta-value">${test.environment?.browser || 'N/A'}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Durată:</div>
                                <div class="meta-value">${Math.round((test.duration || 0) / 1000)}s</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Device:</div>
                                <div class="meta-value">${test.environment?.device || 'N/A'}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Viewport:</div>
                                <div class="meta-value">${test.environment?.viewport || 'N/A'}</div>
                            </div>
                        </div>
                        <div class="steps-summary">
                            <strong>Pași:</strong> 
                            ${test.summary?.passedSteps || 0} ✅ | 
                            ${test.summary?.failedSteps || 0} ❌ | 
                            ${test.summary?.skippedSteps || 0} ⏭️
                        </div>
                        <p style="color: #666; font-size: 0.9em; margin: 15px 0 0 0;">
                            ${test.testDescription}
                        </p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="text-align: center; margin-top: 40px; padding: 20px; background: white; border-radius: 8px;">
            <p style="color: #666; margin: 0;">
                Raport generat la: ${new Date(data.generatedAt).toLocaleString('ro-RO')}
            </p>
        </div>
    </div>
</body>
</html>
`
  }
}

// Parse command line arguments
function parseArgs(): TestRunOptions {
  const args = process.argv.slice(2)
  const options: TestRunOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--test':
        if (nextArg) {
          options.testFile = nextArg
          i++
        }
        break
      case '--browser':
        if (nextArg && ['chromium', 'firefox', 'webkit', 'all'].includes(nextArg)) {
          options.browser = nextArg as any
          i++
        }
        break
      case '--category':
        if (nextArg && ['gresie', 'faianta', 'comprehensive', 'all'].includes(nextArg)) {
          options.category = nextArg as any
          i++
        }
        break
      case '--headed':
        options.headed = true
        break
      case '--headless':
        options.headed = false
        break
      case '--workers':
        if (nextArg) {
          options.workers = parseInt(nextArg)
          i++
        }
        break
      case '--timeout':
        if (nextArg) {
          options.timeout = parseInt(nextArg)
          i++
        }
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
🧪 Test Runner cu Raportare Completă

Usage:
  npx tsx tests/run-tests-with-reports.ts [options]

Options:
  --category <gresie|faianta|comprehensive|all>  Categoria de teste (default: all)
  --test <file>                                  Test specific de rulat
  --browser <chromium|firefox|webkit|all>       Browser pentru teste (default: chromium)
  --headed                                       Rulează cu interfață vizuală (default)
  --headless                                     Rulează fără interfață vizuală
  --workers <number>                             Numărul de workers (default: 1)
  --timeout <ms>                                 Timeout pentru teste (default: 30000)
  --help, -h                                     Afișează acest mesaj

Examples:
  npx tsx tests/run-tests-with-reports.ts                           # Toate testele
  npx tsx tests/run-tests-with-reports.ts --category gresie         # Doar gresie
  npx tsx tests/run-tests-with-reports.ts --category faianta        # Doar faianta
  npx tsx tests/run-tests-with-reports.ts --headed --workers 2      # Cu interfață, 2 workers
  npx tsx tests/run-tests-with-reports.ts --browser firefox         # Pe Firefox

Rezultatele sunt salvate în:
  - test-reports/                                                    # Rapoarte individuale
  - test-reports/CONSOLIDATED_REPORT_*.html                          # Raport consolidat vizual
  - test-reports/CONSOLIDATED_REPORT_*.json                          # Date consolidate JSON
`)
}

// Main execution
async function main() {
  const options = parseArgs()
  const runner = new TestRunner(options)
  
  try {
    await runner.runTests()
  } catch (error) {
    console.error('❌ Eroare fatală:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { TestRunner }