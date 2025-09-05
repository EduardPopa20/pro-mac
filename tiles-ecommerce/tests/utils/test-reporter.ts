import * as fs from 'fs'
import * as path from 'path'

export interface TestStep {
  stepNumber: number
  description: string
  action: string
  expected: string
  actual: string
  status: 'PASS' | 'FAIL' | 'SKIP'
  timestamp: string
  duration?: number
  screenshot?: string
  details?: string
}

export interface TestResult {
  testName: string
  testDescription: string
  category: string
  startTime: string
  endTime: string
  duration: number
  status: 'PASS' | 'FAIL' | 'SKIP'
  steps: TestStep[]
  environment: {
    browser: string
    viewport: string
    device: string
    url: string
  }
  summary: {
    totalSteps: number
    passedSteps: number
    failedSteps: number
    skippedSteps: number
  }
  errors?: string[]
  screenshots?: string[]
  metadata?: Record<string, any>
}

export class TestReporter {
  private testResult: TestResult
  private currentStepNumber: number = 0
  private startTime: number

  constructor(testName: string, testDescription: string, category: string) {
    this.startTime = Date.now()
    this.testResult = {
      testName,
      testDescription,
      category,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      status: 'PASS',
      steps: [],
      environment: {
        browser: '',
        viewport: '',
        device: '',
        url: ''
      },
      summary: {
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0
      }
    }
  }

  setEnvironment(browser: string, viewport: string, device: string, url: string) {
    this.testResult.environment = { browser, viewport, device, url }
  }

  addStep(description: string, action: string, expected: string): TestStepBuilder {
    this.currentStepNumber++
    const step: TestStep = {
      stepNumber: this.currentStepNumber,
      description,
      action,
      expected,
      actual: '',
      status: 'PASS',
      timestamp: new Date().toISOString()
    }
    this.testResult.steps.push(step)
    return new TestStepBuilder(step, this)
  }

  finishTest(status: 'PASS' | 'FAIL' | 'SKIP' = 'PASS') {
    this.testResult.endTime = new Date().toISOString()
    this.testResult.duration = Date.now() - this.startTime
    this.testResult.status = status

    // Calculate summary
    this.testResult.summary = {
      totalSteps: this.testResult.steps.length,
      passedSteps: this.testResult.steps.filter(s => s.status === 'PASS').length,
      failedSteps: this.testResult.steps.filter(s => s.status === 'FAIL').length,
      skippedSteps: this.testResult.steps.filter(s => s.status === 'SKIP').length
    }

    // If any step failed, mark test as failed
    if (this.testResult.summary.failedSteps > 0) {
      this.testResult.status = 'FAIL'
    }

    this.saveResults()
  }

  addError(error: string) {
    if (!this.testResult.errors) this.testResult.errors = []
    this.testResult.errors.push(error)
  }

  addScreenshot(screenshotPath: string) {
    if (!this.testResult.screenshots) this.testResult.screenshots = []
    this.testResult.screenshots.push(screenshotPath)
  }

  addMetadata(key: string, value: any) {
    if (!this.testResult.metadata) this.testResult.metadata = {}
    this.testResult.metadata[key] = value
  }

  private saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0]
    const sanitizedTestName = this.testResult.testName.replace(/[^a-zA-Z0-9-_]/g, '-')
    
    // Create reports directory
    const reportsDir = path.resolve('test-reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    // Save detailed JSON report
    const jsonFileName = `${sanitizedTestName}_${timestamp}.json`
    const jsonFilePath = path.join(reportsDir, jsonFileName)
    fs.writeFileSync(jsonFilePath, JSON.stringify(this.testResult, null, 2))

    // Save human-readable report
    const txtFileName = `${sanitizedTestName}_${timestamp}.txt`
    const txtFilePath = path.join(reportsDir, txtFileName)
    fs.writeFileSync(txtFilePath, this.generateHumanReadableReport())

    // Save HTML report
    const htmlFileName = `${sanitizedTestName}_${timestamp}.html`
    const htmlFilePath = path.join(reportsDir, htmlFileName)
    fs.writeFileSync(htmlFilePath, this.generateHTMLReport())

    console.log(`📊 Test reports saved:`)
    console.log(`   📄 JSON: ${jsonFilePath}`)
    console.log(`   📝 Text: ${txtFilePath}`)
    console.log(`   🌐 HTML: ${htmlFilePath}`)
  }

  private generateHumanReadableReport(): string {
    const { testResult: r } = this
    
    let report = `
╔══════════════════════════════════════════════════════════════╗
║                        TEST REPORT                          ║
╠══════════════════════════════════════════════════════════════╣
║ Test Name: ${r.testName.padEnd(47)} ║
║ Category:  ${r.category.padEnd(47)} ║
║ Status:    ${r.status.padEnd(47)} ║
║ Duration:  ${Math.round(r.duration / 1000)}s${String(Math.round(r.duration / 1000) + 's').padEnd(46)} ║
╠══════════════════════════════════════════════════════════════╣
║ DESCRIPTION                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ ${r.testDescription.padEnd(60)} ║
╠══════════════════════════════════════════════════════════════╣
║ ENVIRONMENT                                                  ║
╠══════════════════════════════════════════════════════════════╣
║ Browser:   ${r.environment.browser.padEnd(47)} ║
║ Device:    ${r.environment.device.padEnd(47)} ║
║ Viewport:  ${r.environment.viewport.padEnd(47)} ║
║ Base URL:  ${r.environment.url.padEnd(47)} ║
╠══════════════════════════════════════════════════════════════╣
║ SUMMARY                                                      ║
╠══════════════════════════════════════════════════════════════╣
║ Total Steps:  ${String(r.summary.totalSteps).padEnd(43)} ║
║ Passed:       ${String(r.summary.passedSteps).padEnd(43)} ║
║ Failed:       ${String(r.summary.failedSteps).padEnd(43)} ║
║ Skipped:      ${String(r.summary.skippedSteps).padEnd(43)} ║
╚══════════════════════════════════════════════════════════════╝

DETAILED STEPS:
===============
`

    r.steps.forEach((step, index) => {
      const statusIcon = step.status === 'PASS' ? '✅' : step.status === 'FAIL' ? '❌' : '⏭️'
      report += `
${statusIcon} Step ${step.stepNumber}: ${step.description}
   Action:   ${step.action}
   Expected: ${step.expected}
   Actual:   ${step.actual}
   Status:   ${step.status}
   Time:     ${new Date(step.timestamp).toLocaleTimeString('ro-RO')}
   ${step.details ? `Details:  ${step.details}` : ''}
   ${step.duration ? `Duration: ${step.duration}ms` : ''}
   -----------------------------------------------------------
`
    })

    if (r.errors && r.errors.length > 0) {
      report += `
ERRORS:
=======
`
      r.errors.forEach(error => {
        report += `❌ ${error}\n`
      })
    }

    if (r.screenshots && r.screenshots.length > 0) {
      report += `
SCREENSHOTS:
============
`
      r.screenshots.forEach(screenshot => {
        report += `📸 ${screenshot}\n`
      })
    }

    report += `
Generated: ${new Date().toLocaleString('ro-RO')}
`

    return report
  }

  private generateHTMLReport(): string {
    const { testResult: r } = this
    const statusColor = r.status === 'PASS' ? '#4CAF50' : r.status === 'FAIL' ? '#F44336' : '#FF9800'
    
    return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${r.testName}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 2em; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; background-color: ${statusColor}; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; }
        .info-card h3 { margin: 0 0 10px 0; color: #667eea; }
        .summary-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; border-radius: 6px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #333; }
        .stat-label { color: #666; text-transform: uppercase; font-size: 0.8em; }
        .steps-list { list-style: none; padding: 0; }
        .step-item { background: #f8f9fa; margin-bottom: 15px; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745; }
        .step-item.fail { border-left-color: #dc3545; }
        .step-item.skip { border-left-color: #ffc107; }
        .step-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .step-title { font-weight: bold; color: #333; }
        .step-status { padding: 4px 12px; border-radius: 12px; color: white; font-size: 0.8em; }
        .step-status.pass { background-color: #28a745; }
        .step-status.fail { background-color: #dc3545; }
        .step-status.skip { background-color: #ffc107; }
        .step-details { color: #666; font-size: 0.9em; }
        .step-details strong { color: #333; }
        .timestamp { color: #999; font-size: 0.8em; }
        .error-list { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; }
        .error-item { color: #721c24; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${r.testName}</h1>
            <p>${r.testDescription}</p>
            <div style="margin-top: 20px;">
                <span class="status-badge">${r.status}</span>
                <span style="margin-left: 20px; opacity: 0.8;">Durată: ${Math.round(r.duration / 1000)}s</span>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Informații Test</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Environment</h3>
                        <p><strong>Browser:</strong> ${r.environment.browser}</p>
                        <p><strong>Device:</strong> ${r.environment.device}</p>
                        <p><strong>Viewport:</strong> ${r.environment.viewport}</p>
                        <p><strong>URL:</strong> ${r.environment.url}</p>
                    </div>
                    <div class="info-card">
                        <h3>Execution Details</h3>
                        <p><strong>Start:</strong> ${new Date(r.startTime).toLocaleString('ro-RO')}</p>
                        <p><strong>End:</strong> ${new Date(r.endTime).toLocaleString('ro-RO')}</p>
                        <p><strong>Category:</strong> ${r.category}</p>
                        <p><strong>Duration:</strong> ${Math.round(r.duration / 1000)}s</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Sumar Rezultate</h2>
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-number">${r.summary.totalSteps}</div>
                        <div class="stat-label">Total Steps</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #28a745;">${r.summary.passedSteps}</div>
                        <div class="stat-label">Passed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #dc3545;">${r.summary.failedSteps}</div>
                        <div class="stat-label">Failed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="color: #ffc107;">${r.summary.skippedSteps}</div>
                        <div class="stat-label">Skipped</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Pași Detaliat</h2>
                <ul class="steps-list">
                    ${r.steps.map(step => `
                        <li class="step-item ${step.status.toLowerCase()}">
                            <div class="step-header">
                                <span class="step-title">Step ${step.stepNumber}: ${step.description}</span>
                                <span class="step-status ${step.status.toLowerCase()}">${step.status}</span>
                            </div>
                            <div class="step-details">
                                <p><strong>Acțiune:</strong> ${step.action}</p>
                                <p><strong>Expectat:</strong> ${step.expected}</p>
                                <p><strong>Rezultat:</strong> ${step.actual}</p>
                                ${step.details ? `<p><strong>Detalii:</strong> ${step.details}</p>` : ''}
                                <p class="timestamp">Timestamp: ${new Date(step.timestamp).toLocaleString('ro-RO')} ${step.duration ? `| Durată: ${step.duration}ms` : ''}</p>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>

            ${r.errors && r.errors.length > 0 ? `
            <div class="section">
                <h2>Erori</h2>
                <div class="error-list">
                    ${r.errors.map(error => `<div class="error-item">❌ ${error}</div>`).join('')}
                </div>
            </div>
            ` : ''}

            ${r.screenshots && r.screenshots.length > 0 ? `
            <div class="section">
                <h2>Screenshots</h2>
                ${r.screenshots.map(screenshot => `<p>📸 ${screenshot}</p>`).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
`
  }
}

export class TestStepBuilder {
  constructor(private step: TestStep, private reporter: TestReporter) {}

  setActual(actual: string): TestStepBuilder {
    this.step.actual = actual
    return this
  }

  setStatus(status: 'PASS' | 'FAIL' | 'SKIP'): TestStepBuilder {
    this.step.status = status
    return this
  }

  setDuration(duration: number): TestStepBuilder {
    this.step.duration = duration
    return this
  }

  addDetails(details: string): TestStepBuilder {
    this.step.details = details
    return this
  }

  async withAction(actionFunction: (step: TestStepBuilder) => Promise<void>): Promise<void> {
    try {
      await actionFunction(this)
    } catch (error: any) {
      this.step.status = 'FAIL'
      this.step.actual = `Error: ${error.message}`
    }
  }

  withResult(result: string, status: 'PASS' | 'FAIL' | 'SKIP' = 'PASS'): void {
    this.step.actual = result
    this.step.status = status
  }

  addScreenshot(screenshotPath: string): TestStepBuilder {
    this.step.screenshot = screenshotPath
    this.reporter.addScreenshot(screenshotPath)
    return this
  }

  pass(actual?: string, details?: string): TestStepBuilder {
    if (actual) this.setActual(actual)
    if (details) this.addDetails(details)
    return this.setStatus('PASS')
  }

  fail(actual?: string, details?: string): TestStepBuilder {
    if (actual) this.setActual(actual)
    if (details) this.addDetails(details)
    return this.setStatus('FAIL')
  }

  skip(reason?: string): TestStepBuilder {
    if (reason) this.addDetails(reason)
    return this.setStatus('SKIP')
  }
}