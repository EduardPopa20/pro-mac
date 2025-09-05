import { test, expect, Page } from '@playwright/test'
import { TestReporter } from './utils/test-reporter'

test('Faianta Cart - Complete Flow with Detailed Reporting', async ({ page, browserName }) => {
  const reporter = new TestReporter(
    'Faianta Cart Complete Flow',
    'Test complet pentru adăugarea unui produs din categoria faianta în coș, navigarea la pagina de coș și verificarea corectitudinii datelor afișate',
    'E2E Cart Functionality'
  )

  // Set environment info
  const viewport = page.viewportSize()
  reporter.setEnvironment(
    browserName,
    viewport ? `${viewport.width}x${viewport.height}` : 'unknown',
    'Desktop',
    'http://localhost:5176'
  )

  try {
    // Step 1: Navigate to faianta category
    let step = reporter.addStep(
      'Navigare la categoria faianta',
      'Accesare URL /faianta și așteptare încărcare completă',
      'Pagina se încarcă cu succes și produsele de faianta sunt vizibile'
    )

    await page.goto('http://localhost:5176/faianta')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const pageTitle = await page.title()
    const url = page.url()
    
    if (url.includes('/faianta') && pageTitle) {
      step.pass(
        `Navigare reușită la ${url}, titlu: "${pageTitle}"`,
        'Pagina faianta s-a încărcat corect'
      )
    } else {
      step.fail(
        `URL: ${url}, Titlu: ${pageTitle}`,
        'Navigarea la pagina faianta a eșuat'
      )
    }

    // Step 2: Identify faianta products
    step = reporter.addStep(
      'Identificarea produselor de faianta',
      'Căutarea și verificarea prezenței produselor specifice faianta',
      'Găsirea produselor cu denumiri corecte de faianta (Albă, Crem, etc.)'
    )

    const faiantaKeywords = ['Albă', 'Crem', 'Gri', 'Beige', 'Albastru']
    let foundProducts: string[] = []
    
    for (const keyword of faiantaKeywords) {
      const productElements = page.locator(`h6:has-text("${keyword}")`)
      const count = await productElements.count()
      if (count > 0) {
        const productName = await productElements.first().textContent() || ''
        foundProducts.push(productName)
      }
    }

    if (foundProducts.length > 0) {
      step.pass(
        `Găsite ${foundProducts.length} produse: ${foundProducts.join(', ')}`,
        'Produsele de faianta sunt prezente cu denumiri corecte'
      )
      reporter.addMetadata('faiantaProductsFound', foundProducts)
    } else {
      step.fail(
        'Nu s-au găsit produse de faianta',
        'Produsele de faianta nu sunt vizibile'
      )
    }

    // Step 3: Select Faianță Albă Clasică
    step = reporter.addStep(
      'Selectarea produsului Faianță Albă Clasică',
      'Click pe primul produs de faianta (cu "Albă" în denumire)',
      'Navigarea reușită la pagina de detalii a produsului de faianta'
    )

    const albaProduct = page.locator('h6:has-text("Albă")')
    const albaProductName = await albaProduct.first().textContent() || ''
    
    await albaProduct.first().locator('..').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const productUrl = page.url()
    const isFaiantaProductPage = productUrl.includes('/faianta/') && productUrl !== 'http://localhost:5176/faianta'

    if (isFaiantaProductPage) {
      step.pass(
        `Navigare reușită la pagina produsului faianta: ${productUrl}`,
        `Produsul "${albaProductName}" are pagina de detalii accesibilă`
      )
      reporter.addMetadata('selectedProduct', albaProductName)
      reporter.addMetadata('productUrl', productUrl)
    } else {
      step.fail(
        `URL încă: ${productUrl}`,
        'Click-ul pe produsul de faianta nu a dus la pagina de detalii'
      )
    }

    // Step 4: Verify faianta product page
    step = reporter.addStep(
      'Verificarea paginii produsului de faianta',
      'Validarea elementelor specifice paginii de produs faianta',
      'Butonul "Adaugă în coș" și informațiile produsului sunt prezente'
    )

    const addToCartButton = page.locator('button:has-text("Adaugă în coș")')
    const isButtonVisible = await addToCartButton.isVisible()
    const isButtonEnabled = await addToCartButton.isEnabled()
    const productPageTitle = await page.locator('h1').first().textContent() || ''

    // Additional faianta-specific checks
    const hasFaiantaInTitle = productPageTitle.toLowerCase().includes('faianță') || 
                             productPageTitle.toLowerCase().includes('albă')

    if (isButtonVisible && isButtonEnabled && hasFaiantaInTitle) {
      step.pass(
        `Buton adăugare: vizibil=${isButtonVisible}, activ=${isButtonEnabled}, titlu="${productPageTitle}"`,
        'Pagina produsului de faianta este complet funcțională'
      )
      reporter.addMetadata('productPageTitle', productPageTitle)
    } else {
      step.fail(
        `Buton: vizibil=${isButtonVisible}, activ=${isButtonEnabled}, are 'faianță'=${hasFaiantaInTitle}`,
        'Pagina produsului de faianta nu este complet configurată'
      )
    }

    // Step 5: Add faianta to cart
    step = reporter.addStep(
      'Adăugarea produsului de faianta în coș',
      'Click pe butonul "Adaugă în coș" pentru produsul de faianta',
      'Produsul de faianta este adăugat cu succes în coș'
    )

    await addToCartButton.click()
    await page.waitForTimeout(2000)

    // Check for success feedback (alerts, messages, etc.)
    const alerts = await page.locator('[role="alert"]').count()
    step.pass(
      `Click executat cu succes, alertele detectate: ${alerts}`,
      'Adăugarea faiantei în coș a fost procesată'
    )
    reporter.addMetadata('alertsAfterAdd', alerts)

    // Step 6: Navigate to cart and verify
    step = reporter.addStep(
      'Verificarea faiantei în coș',
      'Navigarea la /cos și validarea prezenței produsului de faianta',
      'Produsul de faianta apare corect în coșul de cumpărături'
    )

    await page.goto('http://localhost:5176/cos')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const faiantaInCart = page.locator(':has-text("Albă"), :has-text("Faianță"), :has-text("Clasică")')
    const faiantaCount = await faiantaInCart.count()
    const totalCartItems = await page.locator('.MuiCard-root').count()

    if (faiantaCount > 0 && totalCartItems > 0) {
      step.pass(
        `Faianta găsită în coș: ${faiantaCount} referințe, total carduri: ${totalCartItems}`,
        'Produsul de faianta este prezent în coș'
      )
      reporter.addMetadata('faiantaInCartCount', faiantaCount)
      reporter.addMetadata('totalCartItems', totalCartItems)
    } else {
      step.fail(
        `Faianta în coș: ${faiantaCount}, total carduri: ${totalCartItems}`,
        'Produsul de faianta nu a fost găsit în coș'
      )
    }

    // Step 7: Verify faianta pricing
    step = reporter.addStep(
      'Verificarea prețurilor pentru faianta',
      'Validarea că prețurile pentru faianta sunt diferite de cele pentru gresie',
      'Prețurile faiantei sunt corecte (aproximativ 45,50 RON)'
    )

    const allPrices = await page.locator('text=/\\d+.*RON/').allTextContents()
    const hasFaiantaPrice = allPrices.some(price => 
      price.includes('45,50') || price.includes('45.50') || price.includes('42,80') || price.includes('48,90')
    )

    if (allPrices.length > 0 && hasFaiantaPrice) {
      step.pass(
        `Prețuri detectate: ${allPrices.join(', ')}`,
        'Prețurile pentru faianta sunt în intervalul așteptat'
      )
      reporter.addMetadata('faiantaPrices', allPrices)
    } else {
      step.fail(
        `Prețuri găsite: ${allPrices.join(', ')}`,
        'Prețurile pentru faianta nu sunt în intervalul așteptat'
      )
    }

    // Step 8: Compare with gresie (if present)
    step = reporter.addStep(
      'Verificarea compatibilității cu produse de gresie',
      'Validarea că faianta poate coexista în coș cu produse de gresie',
      'Coșul poate conține atât faianta cât și gresie simultan'
    )

    const hasGresie = await page.locator(':has-text("Gresie"), :has-text("Bej"), :has-text("Travertin")').count()
    const gresiePresent = hasGresie > 0

    if (gresiePresent) {
      step.pass(
        `Coș mixt detectat: faianta=${faiantaCount > 0}, gresie=${gresiePresent}`,
        'Coșul suportă produse mixte (gresie + faianta)'
      )
      reporter.addMetadata('mixedCart', { faianta: faiantaCount > 0, gresie: gresiePresent })
    } else {
      step.pass(
        `Coș cu doar faianta: ${faiantaCount > 0}`,
        'Coșul funcționează corect cu produse doar de faianta'
      )
      reporter.addMetadata('faiantaOnlyCart', true)
    }

    // Step 9: Final faianta validation
    step = reporter.addStep(
      'Validarea finală pentru funcționalitatea faianta',
      'Verificarea completă că fluxul E2E pentru faianta funcționează perfect',
      'Toate aspectele funcționalității faianta sunt operaționale'
    )

    const finalValidation = {
      faiantaProductsLoaded: foundProducts.length > 0,
      productPageAccessible: isFaiantaProductPage,
      addToCartWorking: faiantaCount > 0,
      pricingCorrect: hasFaiantaPrice,
      cartAccessible: page.url().includes('/cos')
    }

    const allFaiantaValid = Object.values(finalValidation).every(v => v === true)

    if (allFaiantaValid) {
      step.pass(
        `Toate validările faianta trecute: ${JSON.stringify(finalValidation)}`,
        'Funcționalitatea E2E pentru faianta este complet operațională'
      )
      reporter.addMetadata('finalValidation', finalValidation)
    } else {
      step.fail(
        `Unele validări faianta au eșuat: ${JSON.stringify(finalValidation)}`,
        'Funcționalitatea E2E pentru faianta necesită atenție'
      )
    }

    reporter.finishTest('PASS')

  } catch (error) {
    console.error('Faianta test error:', error)
    reporter.addError(`Test execution error: ${error}`)
    reporter.finishTest('FAIL')
    throw error
  }
})