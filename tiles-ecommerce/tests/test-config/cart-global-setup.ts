import { chromium, FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Setup global pentru testele de cart E2E
 * Pregătește environment-ul și verifică că aplicația funcționează
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Configurarea globală pentru testele de Cart E2E...')
  
  // Crearea directoarelor pentru rapoarte
  const reportDirs = ['test-results', 'playwright-report', 'screenshots', 'videos']
  reportDirs.forEach(dir => {
    const fullPath = path.resolve(dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      console.log(`📁 Created directory: ${dir}`)
    }
  })

  // Verificarea că serverul de dezvoltare funcționează
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5176'
  console.log(`🔍 Verificarea că serverul rulează pe: ${baseURL}`)
  
  try {
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    
    // Verificarea paginii principale
    console.log('🏠 Verificarea paginii principale...')
    await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Verificarea că elementele cheie sunt prezente
    const title = await page.title()
    console.log(`📋 Page title: "${title}"`)
    
    // Verificarea că există link-uri către /gresie și /faianta
    console.log('🔗 Verificarea navigației către categoriile de produse...')
    
    // Test pentru /gresie
    try {
      await page.goto(`${baseURL}/gresie`, { waitUntil: 'networkidle', timeout: 15000 })
      console.log('✅ Categoria /gresie este accesibilă')
    } catch (error) {
      console.warn('⚠️  Categoria /gresie nu este accesibilă:', (error as Error).message)
    }
    
    // Test pentru /faianta  
    try {
      await page.goto(`${baseURL}/faianta`, { waitUntil: 'networkidle', timeout: 15000 })
      console.log('✅ Categoria /faianta este accesibilă')
    } catch (error) {
      console.warn('⚠️  Categoria /faianta nu este accesibilă:', (error as Error).message)
    }
    
    // Verificarea paginii de cart
    try {
      await page.goto(`${baseURL}/cos`, { waitUntil: 'networkidle', timeout: 15000 })
      console.log('✅ Pagina de cart (/cos) este accesibilă')
    } catch (error) {
      console.warn('⚠️  Pagina de cart nu este accesibilă:', (error as Error).message)
    }
    
    await browser.close()
    console.log('✅ Verificarea inițială completă - aplicația este funcțională')
    
  } catch (error) {
    console.error('❌ Eroare în setup-ul global:', error)
    console.error('Verificați că serverul de dezvoltare rulează pe portul corect!')
    process.exit(1)
  }

  // Salvarea metadatelor setup-ului
  const setupInfo = {
    timestamp: new Date().toISOString(),
    baseURL,
    environment: process.env.NODE_ENV || 'test',
    nodeVersion: process.version,
    platform: process.platform,
    setupStatus: 'completed'
  }
  
  fs.writeFileSync(
    path.resolve('test-results', 'setup-info.json'),
    JSON.stringify(setupInfo, null, 2)
  )

  // Configurarea variabilelor de environment pentru teste
  process.env.PLAYWRIGHT_TEST_BASE_URL = baseURL
  process.env.PLAYWRIGHT_CART_TESTS_SETUP = 'completed'

  console.log('🎯 Setup global completat cu succes!')
  console.log('📊 Metadatele setup-ului salvate în test-results/setup-info.json')
  
  return setupInfo
}

export default globalSetup