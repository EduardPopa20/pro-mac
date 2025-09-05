#!/usr/bin/env node

/**
 * Script pentru rularea testelor E2E de cart cu configurații multiple
 * Utilizare: npm run test:cart [options]
 */

import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface TestOptions {
  browser?: 'chromium' | 'firefox' | 'webkit' | 'all'
  device?: 'desktop' | 'mobile' | 'tablet' | 'all'
  headed?: boolean
  debug?: boolean
  trace?: boolean
  record?: boolean
  project?: string
  grep?: string
  timeout?: number
}

class CartTestRunner {
  private options: TestOptions
  
  constructor(options: TestOptions = {}) {
    this.options = {
      browser: 'chromium',
      device: 'desktop',
      headed: false,
      debug: false,
      trace: false,
      record: false,
      timeout: 60000,
      ...options
    }
  }

  async run(): Promise<void> {
    console.log('🛒 Începerea testelor E2E pentru funcționalitatea de Coș')
    console.log('=' .repeat(60))
    
    this.printConfiguration()
    
    // Verificarea că serverul rulează
    if (!(await this.checkServer())) {
      console.error('❌ Serverul nu rulează pe http://localhost:5176')
      console.log('💡 Rulează: npm run dev în alt terminal')
      process.exit(1)
    }

    // Crearea directoarelor pentru rezultate
    this.ensureDirectories()

    // Rularea testelor
    await this.executeTests()
  }

  private printConfiguration(): void {
    console.log('⚙️  Configurație teste:')
    console.log(`   Browser: ${this.options.browser}`)
    console.log(`   Device: ${this.options.device}`)
    console.log(`   Headed: ${this.options.headed ? 'Da' : 'Nu'}`)
    console.log(`   Debug: ${this.options.debug ? 'Da' : 'Nu'}`)
    console.log(`   Trace: ${this.options.trace ? 'Da' : 'Nu'}`)
    console.log(`   Record: ${this.options.record ? 'Da' : 'Nu'}`)
    if (this.options.grep) {
      console.log(`   Filter: ${this.options.grep}`)
    }
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
    const dirs = ['test-results', 'screenshots', 'videos', 'traces']
    dirs.forEach(dir => {
      const fullPath = path.resolve(dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    })
  }

  private async executeTests(): Promise<void> {
    const args = this.buildPlaywrightArgs()
    
    console.log('🚀 Executând testele...')
    console.log(`📝 Comandă: npx playwright test ${args.join(' ')}`)
    console.log('')

    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['playwright', 'test', ...args], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          FORCE_COLOR: '1', // Menține colorarea în output
          PLAYWRIGHT_HTML_REPORT: path.resolve('playwright-report'),
          PLAYWRIGHT_TEST_BASE_URL: 'http://localhost:5176'
        }
      })

      child.on('close', (code) => {
        console.log('')
        if (code === 0) {
          console.log('✅ Testele s-au terminat cu succes!')
          this.showReports()
          resolve()
        } else {
          console.log(`❌ Testele s-au terminat cu cod de eroare: ${code}`)
          this.showReports()
          reject(new Error(`Tests failed with code ${code}`))
        }
      })

      child.on('error', (error) => {
        console.error('❌ Eroare la executarea testelor:', error)
        reject(error)
      })
    })
  }

  private buildPlaywrightArgs(): string[] {
    const args: string[] = []

    // Test files specifice pentru cart
    args.push('tests/cart-functionality-e2e.spec.ts')
    args.push('tests/cart-data-validation-e2e.spec.ts')

    // Project selection bazat pe browser și device
    if (this.options.project) {
      args.push('--project', this.options.project)
    } else {
      const project = this.getProjectName()
      if (project) {
        args.push('--project', project)
      }
    }

    // Browser selection
    if (this.options.browser && this.options.browser !== 'all') {
      // Project selection handled above
    }

    // Headed/headless
    if (this.options.headed) {
      args.push('--headed')
    }

    // Debug mode
    if (this.options.debug) {
      args.push('--debug')
      args.push('--timeout=0') // No timeout in debug mode
    } else if (this.options.timeout) {
      args.push('--timeout', this.options.timeout.toString())
    }

    // Trace
    if (this.options.trace) {
      args.push('--trace', 'on')
    }

    // Recording
    if (this.options.record) {
      args.push('--video', 'on')
      args.push('--screenshot', 'on')
    }

    // Grep filter
    if (this.options.grep) {
      args.push('--grep', this.options.grep)
    }

    // Reporter configuration
    args.push('--reporter=html,line')

    return args
  }

  private getProjectName(): string | null {
    if (this.options.browser === 'all' || this.options.device === 'all') {
      return null // Run all projects
    }

    const browser = this.options.browser || 'chromium'
    const device = this.options.device || 'desktop'

    if (browser === 'chromium') {
      switch (device) {
        case 'mobile': return 'cart-mobile-chrome'
        case 'tablet': return 'cart-tablet'
        case 'desktop': 
        default: return 'cart-desktop-chrome'
      }
    } else if (browser === 'firefox') {
      return 'cart-firefox'
    }

    return 'cart-desktop-chrome'
  }

  private showReports(): void {
    console.log('')
    console.log('📊 Rapoarte generate:')
    console.log('   🌐 HTML Report: playwright-report/index.html')
    console.log('   📄 Cart Summary: test-results/cart-summary.html')
    console.log('   📋 Detailed JSON: test-results/cart-detailed-report.json')
    console.log('   📝 Consolidated: test-results/consolidated-report.md')
    
    if (fs.existsSync('test-results/cart-summary.html')) {
      console.log('')
      console.log('💡 Pentru a vedea rezumatul vizual:')
      console.log('   open test-results/cart-summary.html')
    }
  }
}

// Parse command line arguments
function parseArgs(): TestOptions {
  const args = process.argv.slice(2)
  const options: TestOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--browser':
        if (nextArg && ['chromium', 'firefox', 'webkit', 'all'].includes(nextArg)) {
          options.browser = nextArg as any
          i++
        }
        break
      case '--device':
        if (nextArg && ['desktop', 'mobile', 'tablet', 'all'].includes(nextArg)) {
          options.device = nextArg as any
          i++
        }
        break
      case '--headed':
        options.headed = true
        break
      case '--debug':
        options.debug = true
        break
      case '--trace':
        options.trace = true
        break
      case '--record':
        options.record = true
        break
      case '--project':
        if (nextArg) {
          options.project = nextArg
          i++
        }
        break
      case '--grep':
        if (nextArg) {
          options.grep = nextArg
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
🛒 Cart E2E Test Runner

Utilizare:
  npm run test:cart [options]
  node tests/run-cart-tests.js [options]

Opțiuni:
  --browser <chromium|firefox|webkit|all>   Browser pentru teste (default: chromium)
  --device <desktop|mobile|tablet|all>      Device type (default: desktop)  
  --headed                                   Rulează cu interfață vizuală
  --debug                                    Mod debug (pas cu pas)
  --trace                                    Activează tracing pentru debugging
  --record                                   Înregistrează video și screenshot-uri
  --project <project-name>                   Specifică proiectul exact
  --grep <pattern>                           Filtrează testele după pattern
  --timeout <ms>                             Timeout pentru teste (default: 60000)
  --help, -h                                 Afișează acest mesaj

Exemple:
  npm run test:cart                          Teste basic pe desktop Chrome
  npm run test:cart -- --headed             Teste cu interfață vizuală  
  npm run test:cart -- --device mobile      Teste pe mobile
  npm run test:cart -- --browser firefox    Teste pe Firefox
  npm run test:cart -- --debug              Mod debug pentru dezvoltare
  npm run test:cart -- --grep "gresie"      Doar testele care conțin "gresie"
  npm run test:cart -- --record --trace     Înregistrează totul pentru debugging

Proiecte disponibile:
  - cart-desktop-chrome    Chrome Desktop (default)
  - cart-mobile-chrome     Chrome Mobile
  - cart-tablet            Chrome Tablet
  - cart-firefox           Firefox Desktop
`)
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs()
  const runner = new CartTestRunner(options)
  
  runner.run().catch((error) => {
    console.error('❌ Eroare fatală:', error)
    process.exit(1)
  })
}

export { CartTestRunner, TestOptions }