#!/usr/bin/env tsx

/**
 * Filter Testing Campaign Coordinator
 * 
 * Complete implementation of the user's requested testing campaign:
 * "vreau sa incepem o campanie de testare aprofundata care sa inceapa cu 
 * teste la nivel de subcomponente ( testam fiecare filtru in parte prin a-l 
 * manipula si a observa ca valoarea acelui camp se schimba ), dupa care testam 
 * anumite combinatii de filtare si validam prin a vedea daca numarul total de 
 * produse dupa aplicarea filtrelor este cel asteptat"
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'

interface FilterTestPhase {
  id: string
  name: string
  romanianName: string
  description: string
  testFiles: string[]
  prerequisite?: string
  critical: boolean
}

interface PhaseResult {
  phase: FilterTestPhase
  startTime: string
  endTime: string
  duration: number
  status: 'PASS' | 'FAIL' | 'SKIP' | 'BLOCKED'
  testsRun: number
  testsPassed: number
  testsFailed: number
  testsSkipped: number
  output: string
  details: string[]
  blockingIssues: string[]
}

interface CampaignMetrics {
  totalPhases: number
  phasesRun: number
  phasesPass: number
  phasesFail: number
  phasesSkip: number
  totalTestsRun: number
  totalTestsPassed: number
  totalTestsFailed: number
  totalDuration: number
  criticalPhasesStatus: 'ALL_PASS' | 'SOME_FAIL' | 'ALL_FAIL'
}

class FilterCampaignCoordinator {
  private reportsDir: string
  private timestamp: string
  private withReports: boolean
  private isHeaded: boolean
  private results: PhaseResult[] = []
  
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.reportsDir = path.join(process.cwd(), 'test-reports', 'filter-campaign', this.timestamp)
    this.withReports = process.argv.includes('--with-reports')
    this.isHeaded = process.argv.includes('--headed')
    
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  private readonly testPhases: FilterTestPhase[] = [
    {
      id: 'subcomponents',
      name: 'Subcomponent Level Testing',
      romanianName: 'Teste la Nivel de Subcomponente',
      description: 'Testam fiecare filtru in parte prin a-l manipula si a observa ca valoarea acelui camp se schimba',
      testFiles: ['tests/filter-subcomponent-tests.spec.ts'],
      critical: true
    },
    {
      id: 'combinations',
      name: 'Filter Combinations Testing', 
      romanianName: 'Testare Combinatii de Filtrare',
      description: 'Testam anumite combinatii de filtrare si validam prin a vedea daca numarul total de produse dupa aplicarea filtrelor este cel asteptat',
      testFiles: ['tests/filter-combination-tests.spec.ts'],
      prerequisite: 'subcomponents',
      critical: true
    },
    {
      id: 'persistence',
      name: 'Filter Persistence Testing',
      romanianName: 'Testare Persistenta Filtrelor', 
      description: 'Testam interactionatul cu persistenta filtrelor prin paginare, navigare si refresh',
      testFiles: ['tests/filter-persistence-tests.spec.ts'],
      prerequisite: 'combinations',
      critical: false
    },
    {
      id: 'functionality',
      name: 'Core Functionality Validation',
      romanianName: 'Validare Functionalitate Centrala',
      description: 'Verificam functionalitatea de baza a filtrelor - responsive, layout, integrare',
      testFiles: ['tests/product-filter-functionality.spec.ts'],
      critical: true
    }
  ]

  async runCampaign(): Promise<void> {
    const campaignStart = Date.now()
    
    this.printCampaignHeader()
    
    // Execute phases in sequence
    for (const phase of this.testPhases) {
      const result = await this.executePhase(phase)
      this.results.push(result)
      
      // Check if this phase blocks subsequent phases
      if (result.status === 'FAIL' && phase.critical) {
        console.log(`\n⚠️  CRITICAL PHASE FAILED: ${phase.romanianName}`)
        console.log('   Blocking issues found that may affect subsequent phases:')
        result.blockingIssues.forEach(issue => console.log(`   - ${issue}`))
        
        // Mark dependent phases as blocked
        const dependentPhases = this.testPhases.filter(p => p.prerequisite === phase.id)
        for (const dependentPhase of dependentPhases) {
          const blockedResult: PhaseResult = {
            phase: dependentPhase,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 0,
            status: 'BLOCKED',
            testsRun: 0,
            testsPassed: 0,
            testsFailed: 0,
            testsSkipped: 0,
            output: '',
            details: [`Phase blocked due to critical failure in ${phase.romanianName}`],
            blockingIssues: [`Dependency ${phase.romanianName} failed with critical issues`]
          }
          
          console.log(`\n🚫 BLOCKING DEPENDENT PHASE: ${dependentPhase.romanianName}`)
          console.log(`   Reason: Critical prerequisite ${phase.romanianName} failed`)
        }
        
        console.log('\n   Continuing with independent phases...\n')
      }
    }
    
    // Generate comprehensive report
    const campaignDuration = Date.now() - campaignStart
    const metrics = this.calculateMetrics(campaignDuration)
    
    await this.generateCampaignReport(metrics, campaignStart)
    this.printCampaignSummary(metrics)
  }

  async executePhase(phase: FilterTestPhase): Promise<PhaseResult> {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📊 FAZA ${this.testPhases.indexOf(phase) + 1}: ${phase.romanianName.toUpperCase()}`)
    console.log(`${'='.repeat(80)}`)
    console.log(`📋 ${phase.description}`)
    console.log(`📁 Test Files: ${phase.testFiles.join(', ')}`)
    console.log(`🔥 Critical: ${phase.critical ? 'DA' : 'NU'}`)
    
    const startTime = Date.now()
    const result: PhaseResult = {
      phase,
      startTime: new Date(startTime).toISOString(),
      endTime: '',
      duration: 0,
      status: 'FAIL',
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      testsSkipped: 0,
      output: '',
      details: [],
      blockingIssues: []
    }
    
    try {
      // Check prerequisites
      if (phase.prerequisite) {
        const prereqResult = this.results.find(r => r.phase.id === phase.prerequisite)
        if (prereqResult?.status === 'FAIL') {
          result.status = 'BLOCKED'
          result.details.push(`Prerequisite ${prereqResult.phase.romanianName} failed`)
          result.endTime = new Date().toISOString()
          console.log(`🚫 Phase blocked due to failed prerequisite: ${prereqResult.phase.romanianName}`)
          return result
        }
      }
      
      console.log(`\n🔄 Executing phase tests...`)
      
      // Execute all test files for this phase
      for (const testFile of phase.testFiles) {
        console.log(`   📝 Running: ${testFile}`)
        
        const args = ['npx', 'playwright', 'test', testFile]
        
        if (this.isHeaded) {
          args.push('--headed')
        }
        
        if (this.withReports) {
          args.push('--reporter=json')
          args.push(`--output=${path.join(this.reportsDir, `${phase.id}-results`)}`)
        }
        
        try {
          const output = execSync(args.join(' '), { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 300000 // 5 minute timeout per test file
          })
          
          result.output += output + '\n'
          
          // Parse output for test counts (simplified)
          const passedMatch = output.match(/(\d+) passed/)
          const failedMatch = output.match(/(\d+) failed/)
          const skippedMatch = output.match(/(\d+) skipped/)
          
          if (passedMatch) result.testsPassed += parseInt(passedMatch[1])
          if (failedMatch) result.testsFailed += parseInt(failedMatch[1])
          if (skippedMatch) result.testsSkipped += parseInt(skippedMatch[1])
          
          result.details.push(`${testFile}: Tests executed successfully`)
          
        } catch (testError: any) {
          result.testsFailed += 1
          result.output += `ERROR in ${testFile}: ${testError.message}\n`
          result.details.push(`${testFile}: FAILED - ${testError.message}`)
          
          // Identify blocking issues for critical phases
          if (phase.critical) {
            if (testError.message.includes('Timeout') || testError.message.includes('timeout')) {
              result.blockingIssues.push(`Test timeout in ${testFile} - may indicate fundamental filter issues`)
            }
            if (testError.message.includes('selector') || testError.message.includes('element not found')) {
              result.blockingIssues.push(`UI element not found in ${testFile} - filter components may be missing`)
            }
            if (testError.message.includes('price') || testError.message.includes('filter')) {
              result.blockingIssues.push(`Filter functionality issues detected in ${testFile}`)
            }
          }
        }
      }
      
      result.testsRun = result.testsPassed + result.testsFailed + result.testsSkipped
      result.status = result.testsFailed === 0 ? 'PASS' : 'FAIL'
      
      const endTime = Date.now()
      result.endTime = new Date(endTime).toISOString()
      result.duration = endTime - startTime
      
      // Log phase completion
      const icon = result.status === 'PASS' ? '✅' : '❌'
      const durationSec = (result.duration / 1000).toFixed(2)
      
      console.log(`\n${icon} ${phase.romanianName}: ${result.status}`)
      console.log(`   ⏱️  Duration: ${durationSec}s`)
      console.log(`   📊 Tests: ${result.testsPassed} passed, ${result.testsFailed} failed, ${result.testsSkipped} skipped`)
      
      if (result.status === 'FAIL' && phase.critical) {
        console.log(`   🔥 CRITICAL PHASE FAILURE DETECTED`)
        result.blockingIssues.forEach(issue => console.log(`   ⚠️  ${issue}`))
      }
      
    } catch (error: any) {
      const endTime = Date.now()
      result.endTime = new Date(endTime).toISOString()
      result.duration = endTime - startTime
      result.status = 'FAIL'
      result.testsFailed = 1
      result.testsRun = 1
      result.details.push(`Phase execution failed: ${error.message}`)
      
      if (phase.critical) {
        result.blockingIssues.push(`Critical phase failed to execute: ${error.message}`)
      }
      
      console.log(`\n❌ ${phase.romanianName}: EXECUTION FAILED`)
      console.log(`   Error: ${error.message}`)
    }
    
    return result
  }

  calculateMetrics(campaignDuration: number): CampaignMetrics {
    const metrics: CampaignMetrics = {
      totalPhases: this.testPhases.length,
      phasesRun: this.results.filter(r => r.status !== 'SKIP').length,
      phasesPass: this.results.filter(r => r.status === 'PASS').length,
      phasesFail: this.results.filter(r => r.status === 'FAIL').length,
      phasesSkip: this.results.filter(r => r.status === 'SKIP' || r.status === 'BLOCKED').length,
      totalTestsRun: this.results.reduce((sum, r) => sum + r.testsRun, 0),
      totalTestsPassed: this.results.reduce((sum, r) => sum + r.testsPassed, 0),
      totalTestsFailed: this.results.reduce((sum, r) => sum + r.testsFailed, 0),
      totalDuration: campaignDuration,
      criticalPhasesStatus: 'ALL_PASS'
    }
    
    // Determine critical phases status
    const criticalResults = this.results.filter(r => r.phase.critical)
    const criticalPassed = criticalResults.filter(r => r.status === 'PASS').length
    const criticalTotal = criticalResults.length
    
    if (criticalPassed === criticalTotal) {
      metrics.criticalPhasesStatus = 'ALL_PASS'
    } else if (criticalPassed > 0) {
      metrics.criticalPhasesStatus = 'SOME_FAIL'
    } else {
      metrics.criticalPhasesStatus = 'ALL_FAIL'
    }
    
    return metrics
  }

  async generateCampaignReport(metrics: CampaignMetrics, campaignStart: number): Promise<void> {
    const reportData = {
      campaign: {
        title: 'Campanie de Testare Aprofundata - Filtrare Produse',
        description: 'Testare comprehensiva a functionalitatului de filtrare conform specificatiilor utilizatorului',
        startTime: new Date(campaignStart).toISOString(),
        endTime: new Date().toISOString(),
        totalDuration: `${(metrics.totalDuration / 1000).toFixed(2)}s`
      },
      metrics,
      phases: this.results.map(result => ({
        id: result.phase.id,
        name: result.phase.name,
        romanianName: result.phase.romanianName,
        description: result.phase.description,
        critical: result.phase.critical,
        status: result.status,
        duration: `${(result.duration / 1000).toFixed(2)}s`,
        tests: {
          run: result.testsRun,
          passed: result.testsPassed,
          failed: result.testsFailed,
          skipped: result.testsSkipped
        },
        details: result.details,
        blockingIssues: result.blockingIssues
      })),
      recommendations: this.generateRecommendations(metrics)
    }
    
    // Save JSON report
    const jsonPath = path.join(this.reportsDir, 'filter-campaign-report.json')
    writeFileSync(jsonPath, JSON.stringify(reportData, null, 2))
    
    // Generate Romanian HTML report
    await this.generateRomanianHtmlReport(reportData)
    
    console.log(`\n📄 Rapoarte generate:`)
    console.log(`   JSON: ${jsonPath}`)
    console.log(`   HTML: ${path.join(this.reportsDir, 'raport-campanie-filtrare.html')}`)
  }

  generateRecommendations(metrics: CampaignMetrics): string[] {
    const recommendations: string[] = []
    
    if (metrics.criticalPhasesStatus === 'ALL_PASS') {
      recommendations.push('✅ Toate fazele critice au trecut - Functionalitatea de filtrare este gata pentru productie')
    } else if (metrics.criticalPhasesStatus === 'SOME_FAIL') {
      recommendations.push('⚠️ Unele faze critice au esuat - Corectati problemele critice inainte de deployment')
      recommendations.push('🔍 Concentrati-va pe rezolvarea problemelor de subcomponente si combinatii')
    } else {
      recommendations.push('❌ Toate fazele critice au esuat - Functionalitatea de filtrare nu este gata pentru utilizare')
      recommendations.push('🚨 URGENT: Revizuiti si reparati functionalitatea de baza a filtrelor')
    }
    
    // Specific recommendations based on failed phases
    this.results.forEach(result => {
      if (result.status === 'FAIL' && result.phase.critical) {
        if (result.phase.id === 'subcomponents') {
          recommendations.push('🔧 Rezolvati problemele la nivel de subcomponente - verificati input-urile de pret, selectoarele de culoare')
        } else if (result.phase.id === 'combinations') {
          recommendations.push('🔧 Corectati logica de combinare a filtrelor - verificati calculul numarului de produse')
        }
      }
    })
    
    if (metrics.totalTestsFailed === 0) {
      recommendations.push('🚀 Toate testele au trecut - Sistemul de filtrare este complet functional')
    }
    
    return recommendations
  }

  async generateRomanianHtmlReport(reportData: any): Promise<void> {
    // Implementation of Romanian HTML report would go here
    // For brevity, saving basic HTML structure
    const htmlPath = path.join(this.reportsDir, 'raport-campanie-filtrare.html')
    const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>Raport Campanie Testare Filtrare - Pro-Mac Tiles</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .phase { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 15px 0; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 ${reportData.campaign.title}</h1>
        <p>${reportData.campaign.description}</p>
        <p><strong>Durata:</strong> ${reportData.campaign.totalDuration}</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>${reportData.metrics.phasesPass}</h3>
            <p>Faze Trecute</p>
        </div>
        <div class="metric">
            <h3>${reportData.metrics.totalTestsPassed}</h3>
            <p>Teste Trecute</p>
        </div>
        <div class="metric">
            <h3>${reportData.metrics.totalTestsFailed}</h3>
            <p>Teste Esuate</p>
        </div>
    </div>
    
    ${reportData.phases.map((phase: any) => `
    <div class="phase">
        <h2>${phase.romanianName} ${phase.critical ? '(CRITICA)' : ''}</h2>
        <p><strong>Status:</strong> ${phase.status}</p>
        <p><strong>Durata:</strong> ${phase.duration}</p>
        <p><strong>Teste:</strong> ${phase.tests.passed} trecute, ${phase.tests.failed} esuate</p>
        <p><strong>Descriere:</strong> ${phase.description}</p>
    </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>📋 Recomandari</h2>
        ${reportData.recommendations.map((rec: string) => `<p>${rec}</p>`).join('')}
    </div>
</body>
</html>`
    
    writeFileSync(htmlPath, html)
  }

  printCampaignHeader(): void {
    console.log('\n' + '🔍'.repeat(30))
    console.log('🚀 CAMPANIE DE TESTARE APROFUNDATA - FILTRARE PRODUSE')
    console.log('Pro-Mac Tiles E-commerce Platform')
    console.log('🔍'.repeat(30))
    console.log(`📅 Inceput: ${new Date().toLocaleString()}`)
    console.log(`📁 Rapoarte: ${this.reportsDir}`)
    console.log(`🖥️  Mod Headed: ${this.isHeaded ? 'ACTIVAT' : 'DEZACTIVAT'}`)
    console.log(`📊 Rapoarte Detaliate: ${this.withReports ? 'ACTIVAT' : 'DEZACTIVAT'}`)
    console.log('\n📋 SECVENTA DE TESTARE:')
    this.testPhases.forEach((phase, index) => {
      console.log(`   ${index + 1}. ${phase.romanianName} ${phase.critical ? '(CRITICA)' : ''}`)
      console.log(`      ${phase.description}`)
    })
    console.log('')
  }

  printCampaignSummary(metrics: CampaignMetrics): void {
    console.log('\n' + '='.repeat(100))
    console.log('📊 SUMAR CAMPANIE TESTARE FILTRARE')
    console.log('='.repeat(100))
    
    console.log(`\n🏆 REZULTATE GENERALE:`)
    console.log(`   Total Faze: ${metrics.totalPhases}`)
    console.log(`   ✅ Faze Trecute: ${metrics.phasesPass}`)
    console.log(`   ❌ Faze Esuate: ${metrics.phasesFail}`)
    console.log(`   ⏭️  Faze Omise: ${metrics.phasesSkip}`)
    console.log(`   📊 Rata de Succes Faze: ${((metrics.phasesPass / metrics.phasesRun) * 100).toFixed(1)}%`)
    
    console.log(`\n🧪 REZULTATE TESTE:`)
    console.log(`   Total Teste: ${metrics.totalTestsRun}`)
    console.log(`   ✅ Teste Trecute: ${metrics.totalTestsPassed}`)
    console.log(`   ❌ Teste Esuate: ${metrics.totalTestsFailed}`)
    console.log(`   📊 Rata de Succes Teste: ${((metrics.totalTestsPassed / metrics.totalTestsRun) * 100).toFixed(1)}%`)
    
    console.log(`\n⏱️  PERFORMANTA:`)
    console.log(`   Durata Totala: ${(metrics.totalDuration / 1000).toFixed(2)}s`)
    console.log(`   Durata Medie per Faza: ${(metrics.totalDuration / metrics.phasesRun / 1000).toFixed(2)}s`)
    
    console.log(`\n🔥 STATUS FAZE CRITICE: ${metrics.criticalPhasesStatus}`)
    
    const overallStatus = metrics.criticalPhasesStatus === 'ALL_PASS' ? 'SUCCES COMPLET' :
                          metrics.criticalPhasesStatus === 'SOME_FAIL' ? 'SUCCES PARTIAL' : 'ESEC CRITIC'
                          
    console.log(`\n🏁 STATUS GENERAL CAMPANIE: ${overallStatus}`)
    
    if (metrics.criticalPhasesStatus === 'ALL_PASS') {
      console.log('✅ GATA PENTRU PRODUCTIE: Toate fazele critice au trecut cu succes!')
    } else {
      console.log('⚠️ ACTIUNE NECESARA: Revizuiti si corectati fazele critice esuate')
    }
    
    console.log('='.repeat(100))
  }
}

// Main execution
async function main() {
  const coordinator = new FilterCampaignCoordinator()
  
  try {
    await coordinator.runCampaign()
    process.exit(0)
  } catch (error) {
    console.error('❌ Campania de testare a esuat:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}