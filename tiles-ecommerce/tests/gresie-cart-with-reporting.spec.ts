import { test, expect, Page } from '@playwright/test'
import { TestReporter } from './utils/test-reporter'

test('Gresie Cart - Complete Flow with Detailed Reporting', async ({ page, browserName }) => {
  const reporter = new TestReporter(
    'Gresie Cart Complete Flow',
    'Test complet pentru adăugarea unui produs din categoria gresie în coș, navigarea la pagina de coș și verificarea corectitudinii datelor afișate',
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
    // Step 1: Navigate to gresie category
    let step = reporter.addStep(
      'Navigare la categoria gresie',
      'Accesare URL /gresie și așteptare încărcare completă',
      'Pagina se încarcă cu succes și produsele sunt vizibile'
    )

    await page.goto('http://localhost:5176/gresie')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const pageTitle = await page.title()
    const url = page.url()
    
    if (url.includes('/gresie') && pageTitle) {
      step.pass(
        `Navigare reușită la ${url}, titlu: "${pageTitle}"`,
        'Pagina gresie s-a încărcat corect'
      )
    } else {
      step.fail(
        `URL: ${url}, Titlu: ${pageTitle}`,
        'Navigarea la pagina gresie a eșuat'
      )
    }

    // Step 2: Identify and verify products
    step = reporter.addStep(
      'Identificarea produselor din categoria gresie',
      'Căutarea și numărarea cardurilor de produse cu denumiri specifice gresiei',
      'Găsirea a cel puțin unui produs de gresie cu denumire corectă'
    )

    const productTitle = page.locator('h6:has-text("Bej")')
    const productCount = await productTitle.count()
    
    if (productCount > 0) {
      const firstProductName = await productTitle.first().textContent() || ''
      step.pass(
        `Găsit ${productCount} produs(e), primul: "${firstProductName}"`,
        `Produsele sunt prezente și au denumiri corecte`
      )
      reporter.addMetadata('firstProductName', firstProductName)
      reporter.addMetadata('productsFound', productCount)
    } else {
      step.fail(
        `Nu s-au găsit produse cu "Bej" în denumire`,
        'Produsele nu sunt vizibile sau nu au denumirile corecte'
      )
    }

    // Step 3: Select and navigate to product detail
    step = reporter.addStep(
      'Selectarea primului produs',
      'Click pe primul card de produs pentru navigarea la pagina de detalii',
      'Navigarea reușită la pagina de detalii a produsului selectat'
    )

    const productName = await productTitle.first().textContent() || ''
    await productTitle.first().locator('..').click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const productUrl = page.url()
    const isProductPage = productUrl.includes('/gresie/') && productUrl !== 'http://localhost:5176/gresie'

    if (isProductPage) {
      step.pass(
        `Navigare reușită la pagina produsului: ${productUrl}`,
        `Produsul "${productName}" are pagina de detalii funcțională`
      )
      reporter.addMetadata('productUrl', productUrl)
    } else {
      step.fail(
        `URL încă: ${productUrl}`,
        'Click-ul pe produs nu a rezultat în navigarea la pagina de detalii'
      )
    }

    // Step 4: Verify product page elements
    step = reporter.addStep(
      'Verificarea elementelor de pe pagina produsului',
      'Validarea prezenței butonului "Adaugă în coș" și a informațiilor produsului',
      'Toate elementele necesare sunt prezente și funcționale'
    )

    const addToCartButton = page.locator('button:has-text("Adaugă în coș")')
    const isButtonVisible = await addToCartButton.isVisible()
    const isButtonEnabled = await addToCartButton.isEnabled()
    const productPageTitle = await page.locator('h1').first().textContent() || ''

    if (isButtonVisible && isButtonEnabled && productPageTitle) {
      step.pass(
        `Buton "Adaugă în coș": vizibil=${isButtonVisible}, activat=${isButtonEnabled}, titlu produs="${productPageTitle}"`,
        'Pagina produsului este complet funcțională'
      )
      reporter.addMetadata('productPageTitle', productPageTitle)
    } else {
      step.fail(
        `Buton vizibil: ${isButtonVisible}, activat: ${isButtonEnabled}, titlu: "${productPageTitle}"`,
        'Pagina produsului nu este complet funcțională'
      )
    }

    // Step 5: Add product to cart
    step = reporter.addStep(
      'Adăugarea produsului în coș',
      'Click pe butonul "Adaugă în coș" și procesarea comenzii',
      'Produsul este adăugat cu succes în coș'
    )

    await addToCartButton.click()
    await page.waitForTimeout(2000)

    step.pass(
      'Click pe "Adaugă în coș" executat cu succes',
      'Adăugarea în coș a fost procesată'
    )

    // Step 6: Navigate to cart page
    step = reporter.addStep(
      'Navigarea la pagina de coș',
      'Accesarea paginii /cos pentru verificarea produsului adăugat',
      'Pagina de coș se încarcă și afișează produsele adăugate'
    )

    await page.goto('http://localhost:5176/cos')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const cartUrl = page.url()
    if (cartUrl.includes('/cos')) {
      step.pass(
        `Navigare reușită la pagina de coș: ${cartUrl}`,
        'Pagina de coș este accesibilă'
      )
    } else {
      step.fail(
        `URL neașteptat: ${cartUrl}`,
        'Navigarea la pagina de coș a eșuat'
      )
    }

    // Step 7: Verify product in cart
    step = reporter.addStep(
      'Verificarea prezenței produsului în coș',
      'Căutarea produsului adăugat în lista de articole din coș',
      'Produsul este prezent în coș cu informații corecte'
    )

    const productInCart = page.locator(':has-text("Bej"), :has-text("Travertin")')
    const productInCartCount = await productInCart.count()
    const cartCards = await page.locator('.MuiCard-root').count()

    if (productInCartCount > 0 && cartCards > 0) {
      step.pass(
        `Produsul găsit în coș: ${productInCartCount} referințe, ${cartCards} carduri total`,
        'Produsul a fost adăugat cu succes în coș'
      )
      reporter.addMetadata('productInCartCount', productInCartCount)
      reporter.addMetadata('cartCards', cartCards)
    } else {
      step.fail(
        `Produsul nu a fost găsit în coș: ${productInCartCount} referințe, ${cartCards} carduri`,
        'Produsul nu apare în coșul de cumpărături'
      )
    }

    // Step 8: Verify pricing information
    step = reporter.addStep(
      'Verificarea informațiilor de preț',
      'Validarea corectitudinii prețurilor afișate în coș',
      'Prețurile sunt afișate corect în format românesc cu RON'
    )

    const priceElements = await page.locator('text=/\\d+.*RON/').allTextContents()
    const hasExpectedPrice = priceElements.some(price => 
      price.includes('72,40') || price.includes('72.40')
    )

    if (priceElements.length > 0 && hasExpectedPrice) {
      step.pass(
        `Prețuri găsite: ${priceElements.join(', ')}`,
        'Informațiile de preț sunt corecte și în format românesc'
      )
      reporter.addMetadata('pricesFound', priceElements)
    } else {
      step.fail(
        `Prețuri găsite: ${priceElements.join(', ')}`,
        'Informațiile de preț nu sunt corecte sau lipsesc'
      )
    }

    // Step 9: Final validation
    step = reporter.addStep(
      'Validarea finală a funcționalității complete',
      'Verificarea că întregul flux funcționează corect end-to-end',
      'Fluxul complet de la catalog la coș funcționează perfect'
    )

    const finalValidation = {
      productFound: productInCartCount > 0,
      correctPricing: hasExpectedPrice,
      cartAccessible: cartUrl.includes('/cos'),
      elementsPresent: cartCards > 0
    }

    const allValid = Object.values(finalValidation).every(v => v === true)

    if (allValid) {
      step.pass(
        `Toate validările trecute: ${JSON.stringify(finalValidation)}`,
        'Funcționalitatea E2E pentru gresie este complet operațională'
      )
      reporter.addMetadata('finalValidation', finalValidation)
    } else {
      step.fail(
        `Unele validări au eșuat: ${JSON.stringify(finalValidation)}`,
        'Funcționalitatea E2E are probleme care necesită atenție'
      )
    }

    reporter.finishTest('PASS')

  } catch (error) {
    console.error('Test error:', error)
    reporter.addError(`Test execution error: ${error}`)
    reporter.finishTest('FAIL')
    throw error
  }
})