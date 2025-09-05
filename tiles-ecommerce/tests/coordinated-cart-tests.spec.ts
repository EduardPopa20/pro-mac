import { test, expect } from '@playwright/test'
import { TestReporter } from './utils/test-reporter'

/**
 * Coordinated Cart Tests - Validates filters BEFORE running cart flow
 * This ensures cart tests only run if filter components are working properly
 */

test.describe('Coordinated E2E Testing - Filters → Cart Flow', () => {
  
  // Global flag to track filter validation results
  let gresieFiltersValid = false
  let faiantaFiltersValid = false

  test('Pre-requisite: Validate Gresie Filters', async ({ page, browserName }) => {
    const reporter = new TestReporter(
      'Gresie Filter Prerequisites Check',
      'Verificarea validității componentei de filtrare înainte de testarea cart-ului pentru gresie',
      'Prerequisites Validation'
    )

    const viewport = page.viewportSize()
    reporter.setEnvironment(browserName, viewport ? `${viewport.width}x${viewport.height}` : 'unknown', 'Desktop', 'http://localhost:5176')

    try {
      let step = reporter.addStep(
        'Verificarea rapidă a filtrelor gresie',
        'Validarea că componentele de filtrare pentru gresie sunt funcționale',
        'Toate filtrele gresie sunt operaționale'
      )

      await page.goto('http://localhost:5176/gresie')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Quick filter validation
      const filterPresent = await page.locator('text="Filtrare produse"').isVisible()
      const priceInputs = await page.locator('input[type="number"]').count()
      const hasColorFilter = await page.locator('text="Culoare"').isVisible()

      if (filterPresent && priceInputs >= 2 && hasColorFilter) {
        gresieFiltersValid = true
        step.pass(
          'Filtre gresie validate cu succes',
          '✅ Cart tests pentru gresie pot proceda'
        )
        reporter.addMetadata('filtersValid', true)
        reporter.finishTest('PASS')
      } else {
        gresieFiltersValid = false
        step.fail(
          `Filtre gresie invalide: present=${filterPresent}, priceInputs=${priceInputs}, color=${hasColorFilter}`,
          '❌ Cart tests pentru gresie sunt BLOCATE'
        )
        reporter.addMetadata('filtersValid', false)
        reporter.finishTest('FAIL')
      }

    } catch (error) {
      gresieFiltersValid = false
      reporter.addError(`Filter validation failed: ${error}`)
      reporter.finishTest('FAIL')
      throw error
    }
  })

  test('Pre-requisite: Validate Faianta Filters', async ({ page, browserName }) => {
    const reporter = new TestReporter(
      'Faianta Filter Prerequisites Check',
      'Verificarea validității componentei de filtrare înainte de testarea cart-ului pentru faianta',
      'Prerequisites Validation'
    )

    const viewport = page.viewportSize()
    reporter.setEnvironment(browserName, viewport ? `${viewport.width}x${viewport.height}` : 'unknown', 'Desktop', 'http://localhost:5176')

    try {
      let step = reporter.addStep(
        'Verificarea rapidă a filtrelor faianta',
        'Validarea că componentele de filtrare pentru faianta sunt funcționale',
        'Toate filtrele faianta sunt operaționale'
      )

      await page.goto('http://localhost:5176/faianta')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const filterPresent = await page.locator('text="Filtrare produse"').isVisible()
      const priceInputs = await page.locator('input[type="number"]').count()
      const hasColorFilter = await page.locator('text="Culoare"').isVisible()

      if (filterPresent && priceInputs >= 2 && hasColorFilter) {
        faiantaFiltersValid = true
        step.pass(
          'Filtre faianta validate cu succes',
          '✅ Cart tests pentru faianta pot proceda'
        )
        reporter.addMetadata('filtersValid', true)
        reporter.finishTest('PASS')
      } else {
        faiantaFiltersValid = false
        step.fail(
          `Filtre faianta invalide: present=${filterPresent}, priceInputs=${priceInputs}, color=${hasColorFilter}`,
          '❌ Cart tests pentru faianta sunt BLOCATE'
        )
        reporter.addMetadata('filtersValid', false)
        reporter.finishTest('FAIL')
      }

    } catch (error) {
      faiantaFiltersValid = false
      reporter.addError(`Filter validation failed: ${error}`)
      reporter.finishTest('FAIL')
      throw error
    }
  })

  test('Coordinated: Gresie Filter Interaction → Cart Flow', async ({ page, browserName }) => {
    // Skip if filter validation failed
    test.skip(!gresieFiltersValid, 'Gresie filters validation failed - cart test blocked')

    const reporter = new TestReporter(
      'Coordinated Gresie Filter + Cart Flow',
      'Test complet care folosește filtrele pentru a găsi produse și apoi le adaugă în coș',
      'Coordinated E2E Flow'
    )

    const viewport = page.viewportSize()
    reporter.setEnvironment(browserName, viewport ? `${viewport.width}x${viewport.height}` : 'unknown', 'Desktop', 'http://localhost:5176')

    try {
      // Step 1: Use filters to find products
      let step = reporter.addStep(
        'Folosirea filtrelor pentru găsirea produselor de gresie',
        'Aplicarea filtrelor de preț și caracteristici pentru a identifica produse relevante',
        'Filtrele returnează produse potrivite pentru adăugarea în coș'
      )

      await page.goto('http://localhost:5176/gresie')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Apply price filter to narrow down products
      const minPriceInput = page.locator('input[type="number"]').first()
      await minPriceInput.fill('60')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(1500)

      // Count products after filtering
      const filteredProducts = await page.locator('h6').filter({ hasText: /Gresie/ }).count()

      if (filteredProducts > 0) {
        step.pass(
          `Filtrele au returnat ${filteredProducts} produse relevante`,
          'Filtrarea funcționează și produsele sunt disponibile pentru selecție'
        )
        reporter.addMetadata('filteredProductsCount', filteredProducts)
      } else {
        step.fail(
          'Nu s-au găsit produse după aplicarea filtrelor',
          'Filtrarea nu returnează rezultate - cart flow nu poate continua'
        )
        reporter.finishTest('FAIL')
        return
      }

      // Step 2: Select product from filtered results
      step = reporter.addStep(
        'Selectarea unui produs din rezultatele filtrate',
        'Click pe primul produs din lista filtrată pentru a accesa pagina de detalii',
        'Navigarea reușită la pagina produsului filtrat'
      )

      const firstFilteredProduct = page.locator('h6').filter({ hasText: /Gresie/ }).first()
      const productName = await firstFilteredProduct.textContent() || ''
      
      await firstFilteredProduct.locator('..').click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const productUrl = page.url()
      const isProductPage = productUrl.includes('/gresie/') && productUrl !== 'http://localhost:5176/gresie'

      if (isProductPage) {
        step.pass(
          `Produs filtrat selectat cu succes: "${productName}" → ${productUrl}`,
          'Navigarea de la rezultate filtrate la pagina produsului funcționează'
        )
        reporter.addMetadata('selectedFilteredProduct', productName)
        reporter.addMetadata('productUrl', productUrl)
      } else {
        step.fail(
          'Selectarea produsului din rezultatele filtrate nu a funcționat',
          'Link-ul către pagina produsului nu funcționează'
        )
        reporter.finishTest('FAIL')
        return
      }

      // Step 3: Add filtered product to cart
      step = reporter.addStep(
        'Adăugarea produsului filtrat în coș',
        'Utilizarea butonului "Adaugă în coș" pentru produsul găsit prin filtrare',
        'Produsul filtrat este adăugat cu succes în coș'
      )

      const addToCartButton = page.locator('button:has-text("Adaugă în coș")')
      const buttonVisible = await addToCartButton.isVisible()
      const buttonEnabled = await addToCartButton.isEnabled()

      if (buttonVisible && buttonEnabled) {
        await addToCartButton.click()
        await page.waitForTimeout(2000)
        
        step.pass(
          'Produsul filtrat adăugat în coș cu succes',
          'Flow-ul de la filtrare la adăugarea în coș este complet funcțional'
        )
      } else {
        step.fail(
          `Butonul adăugare în coș nu este disponibil: vizibil=${buttonVisible}, enabled=${buttonEnabled}`,
          'Nu se poate finaliza adăugarea în coș'
        )
        reporter.finishTest('FAIL')
        return
      }

      // Step 4: Verify in cart with filter context
      step = reporter.addStep(
        'Verificarea în coș a produsului filtrat',
        'Validarea că produsul găsit prin filtrare apare corect în coșul de cumpărături',
        'Produsul filtrat este prezent în coș cu informații complete'
      )

      await page.goto('http://localhost:5176/cos')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const productInCart = page.locator(`:has-text("${productName.replace('Gresie ', '')}")`)
      const productInCartCount = await productInCart.count()

      if (productInCartCount > 0) {
        step.pass(
          `Produsul filtrat "${productName}" găsit în coș`,
          '✅ COORDINATED FLOW SUCCESS: Filtrare → Selecție → Cart funcționează perfect'
        )
        reporter.addMetadata('coordinatedFlowSuccess', true)
        reporter.finishTest('PASS')
      } else {
        step.fail(
          `Produsul filtrat nu a fost găsit în coș`,
          'Coordinated flow nu este complet - produsul nu ajunge în coș'
        )
        reporter.finishTest('FAIL')
      }

    } catch (error) {
      console.error('Coordinated gresie test error:', error)
      reporter.addError(`Coordinated test error: ${error}`)
      reporter.finishTest('FAIL')
      throw error
    }
  })

  test('Coordinated: Faianta Filter Interaction → Cart Flow', async ({ page, browserName }) => {
    // Skip if filter validation failed
    test.skip(!faiantaFiltersValid, 'Faianta filters validation failed - cart test blocked')

    const reporter = new TestReporter(
      'Coordinated Faianta Filter + Cart Flow',
      'Test complet care folosește filtrele pentru a găsi produse de faianta și apoi le adaugă în coș',
      'Coordinated E2E Flow'
    )

    const viewport = page.viewportSize()
    reporter.setEnvironment(browserName, viewport ? `${viewport.width}x${viewport.height}` : 'unknown', 'Desktop', 'http://localhost:5176')

    try {
      let step = reporter.addStep(
        'Folosirea filtrelor pentru produse faianta',
        'Aplicarea filtrelor pentru a găsi produse de faianta potrivite',
        'Filtrele faianta returnează produse relevante'
      )

      await page.goto('http://localhost:5176/faianta')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Apply a different filter strategy for faianta
      const maxPriceInput = page.locator('input[type="number"]').last()
      await maxPriceInput.fill('50')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(1500)

      const filteredProducts = await page.locator('h6').filter({ hasText: /Faianță/ }).count()

      if (filteredProducts > 0) {
        step.pass(
          `Filtrele faianta au returnat ${filteredProducts} produse`,
          'Filtrarea pentru faianta funcționează corect'
        )
      } else {
        step.fail(
          'Nu s-au găsit produse faianta după filtrare',
          'Filtrarea faianta nu returnează rezultate'
        )
        reporter.finishTest('FAIL')
        return
      }

      // Quick flow for faianta similar to gresie
      const firstProduct = page.locator('h6').filter({ hasText: /Faianță/ }).first()
      const productName = await firstProduct.textContent() || ''
      
      await firstProduct.locator('..').click()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const addToCartButton = page.locator('button:has-text("Adaugă în coș")')
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click()
        await page.waitForTimeout(2000)
      }

      await page.goto('http://localhost:5176/cos')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      const productInCart = page.locator(`:has-text("${productName.replace('Faianță ', '')}")`)
      const inCartCount = await productInCart.count()

      step = reporter.addStep(
        'Validarea finală coordinated flow faianta',
        'Verificarea că întregul proces de la filtrare la cart funcționează pentru faianta',
        'Coordinated flow pentru faianta este complet funcțional'
      )

      if (inCartCount > 0) {
        step.pass(
          `✅ COORDINATED FAIANTA SUCCESS: "${productName}" în coș`,
          'Filtrare → Selecție → Cart pentru faianta funcționează perfect'
        )
        reporter.addMetadata('coordinatedFaiantaSuccess', true)
        reporter.finishTest('PASS')
      } else {
        step.fail(
          'Produsul faianta filtrat nu ajunge în coș',
          'Coordinated flow pentru faianta nu este complet'
        )
        reporter.finishTest('FAIL')
      }

    } catch (error) {
      console.error('Coordinated faianta test error:', error)
      reporter.addError(`Coordinated faianta test error: ${error}`)
      reporter.finishTest('FAIL')
      throw error
    }
  })
})