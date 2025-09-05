# 🛒 Ghid Complet pentru Testarea E2E a Funcționalității de Coș

## 📋 Cuprins
1. [Prezentare Generală](#prezentare-generală)
2. [Configurarea Environment-ului](#configurarea-environment-ului)
3. [Rularea Testelor](#rularea-testelor)
4. [Structura Testelor](#structura-testelor)
5. [Page Objects](#page-objects)
6. [Scenarii de Testare](#scenarii-de-testare)
7. [Rapoarte și Metrici](#rapoarte-și-metrici)
8. [Debugging și Troubleshooting](#debugging-și-troubleshooting)
9. [CI/CD Integration](#cicd-integration)

## 🎯 Prezentare Generală

Această campanie de testare E2E acoperă în detaliu funcționalitatea de adăugare produse în coș din categoriile **Gresie** și **Faianță**, precum și validarea completă a datelor din pagina de coș.

### Obiectivele Principale:
- ✅ Testarea fluxului complet de la catalog la coș
- ✅ Validarea acurateții datelor produselor
- ✅ Verificarea calculelor de preț și cantitate
- ✅ Testarea responsivității pe toate device-urile
- ✅ Validarea persistenței datelor între sesiuni
- ✅ Testarea performanței și stabilității

## ⚙️ Configurarea Environment-ului

### Prerequisite
```bash
# Asigură-te că serverul de dezvoltare rulează
npm run dev

# Serverul trebuie să fie disponibil pe:
# http://localhost:5176
```

### Instalarea Dependințelor
```bash
# Toate dependințele sunt deja configurate în package.json
npm install

# Verifică că Playwright este configurat corect
npx playwright install
```

## 🚀 Rularea Testelor

### Comenzi Principale

#### Teste Basic
```bash
# Toate testele de cart pe desktop Chrome
npm run test:cart

# Teste cu interfață vizuală (recomandant pentru development)
npm run test:cart:headed

# Mod debug (pas cu pas)
npm run test:cart:debug
```

#### Teste pe Device-uri Specifice
```bash
# Teste pe mobile
npm run test:cart:mobile

# Teste pe toate device-urile (desktop, mobile, tablet)
npm run test:cart:all
```

#### Teste pe Categorii Specifice
```bash
# Doar testele pentru categoria Gresie
npm run test:cart:gresie

# Doar testele pentru categoria Faianta
npm run test:cart:faianta
```

#### Teste cu Recording și Debugging
```bash
# Înregistrează video, screenshot-uri și trace
npm run test:cart:record

# Pentru investigarea problemelor
npm run test:cart:debug
```

#### Opțiuni Avansate
```bash
# Teste cu opțiuni personalizate
npx tsx tests/run-cart-tests.ts -- --browser firefox --device tablet --headed

# Filtrează teste după pattern
npx tsx tests/run-cart-tests.ts -- --grep "price validation"

# Toate opțiunile disponibile
npx tsx tests/run-cart-tests.ts -- --help
```

## 📁 Structura Testelor

### Fișiere Principale
```
tests/
├── cart-functionality-e2e.spec.ts      # Teste funcționalitate principală
├── cart-data-validation-e2e.spec.ts    # Validare amănunțită a datelor
├── page-objects/                       # Page Object Pattern
│   ├── ProductCatalogPage.ts           # Pagini /gresie și /faianta
│   ├── ProductDetailPage.ts            # Pagina de detalii produs
│   └── CartPage.ts                     # Pagina de coș
├── test-config/                        # Configurații avansate
│   ├── cart-test-config.ts             # Config Playwright pentru cart
│   ├── cart-reporter.ts                # Reporter personalizat
│   ├── cart-global-setup.ts            # Setup global
│   └── cart-global-teardown.ts         # Cleanup global
└── run-cart-tests.ts                   # Script principal rulare
```

### Fișiere de Rezultate
```
test-results/
├── cart-detailed-report.json           # Metrici detaliate JSON
├── cart-summary.html                   # Rezumat vizual HTML
├── consolidated-report.md               # Raport consolidat Markdown
├── final-stats.json                    # Statistici finale
└── setup-info.json                     # Informații setup

playwright-report/
└── index.html                          # Raport HTML complet Playwright

screenshots/                             # Screenshot-uri automate
videos/                                  # Înregistrări video
traces/                                  # Trace files pentru debugging
```

## 🏗️ Page Objects

Testele utilizează Pattern-ul Page Object pentru mentenanță ușoară:

### ProductCatalogPage
```typescript
const catalogPage = new ProductCatalogPage(page)

// Navigare
await catalogPage.navigateToGresie()
await catalogPage.navigateToFaianta()

// Interacțiuni
await catalogPage.clickFirstProduct()
await catalogPage.clickProductByName('Gresie Premium')
const productCount = await catalogPage.getProductCount()

// Validări
await catalogPage.validateBreadcrumbs(['Acasă', 'Gresie'])
await catalogPage.validateResponsiveDesign()
```

### ProductDetailPage
```typescript
const detailPage = new ProductDetailPage(page)

// Informații produs
const details = await detailPage.getProductDetails()
const isAvailable = await detailPage.isProductAvailable()

// Operațiuni coș
await detailPage.setQuantity(3)
await detailPage.addToCart()
await detailPage.addToCartWithExpectedQuantity(5)

// Validări
await detailPage.validateProductPageStructure()
await detailPage.validateQuantityControls()
```

### CartPage
```typescript
const cartPage = new CartPage(page)

// Navigare și stare
await cartPage.navigateToCart()
const isEmpty = await cartPage.isCartEmpty()
const itemCount = await cartPage.getCartItemsCount()

// Operațiuni
await cartPage.updateQuantity(0, 5)
await cartPage.removeCartItem(0)
await cartPage.clearCart()

// Validări
await cartPage.validateCartPageStructure()
await cartPage.validateTotalCalculation()
const cartData = await cartPage.getCartItemData(0)
```

## 📋 Scenarii de Testare

### 1. Funcționalitate de Bază

#### Adăugare din Categoria Gresie
- ✅ Navigare la /gresie
- ✅ Selectarea primului produs
- ✅ Adăugare în coș cu cantitatea default (1)
- ✅ Validarea alertei de succes
- ✅ Verificarea coșului pentru produsul adăugat

#### Adăugare din Categoria Faianta
- ✅ Navigare la /faianta
- ✅ Selectarea și adăugarea produselor
- ✅ Testarea cantităților multiple
- ✅ Validarea datelor în coș

#### Produse Multiple
- ✅ Adăugarea a 2+ produse din aceeași categorie
- ✅ Adăugarea produselor din categorii diferite
- ✅ Validarea calculelor totale

### 2. Managementul Coșului

#### Actualizarea Cantităților
- ✅ Utilizarea controalelor +/-
- ✅ Input manual de cantitate
- ✅ Validarea recalculării prețurilor

#### Eliminarea Produselor
- ✅ Eliminarea produselor individuale
- ✅ Golirea completă a coșului
- ✅ Validarea stării goale

### 3. Validarea Datelor

#### Consistența Informațiilor
- ✅ Verificarea numelui produsului (catalog → detalii → coș)
- ✅ Validarea prețurilor unitare și totale
- ✅ Verificarea imaginilor produselor

#### Formatarea Prețurilor
- ✅ Format românesc cu RON
- ✅ Calculele cu zecimale
- ✅ Validarea totalului general

#### Persistența Datelor
- ✅ Menținerea coșului între refresh-uri
- ✅ Sincronizarea între tab-uri multiple
- ✅ Stocarea locală a datelor

### 4. Design Responsiv

#### Mobile (≤599px)
- ✅ Layoutul se adaptează corect
- ✅ Butoanele au dimensiunea minimă 44px
- ✅ Nu există scroll orizontal
- ✅ Touch targets sunt accessibile

#### Tablet (600-959px)
- ✅ Interfața hibridă funcționează
- ✅ Toate controalele sunt utilizabile
- ✅ Performanța este optimă

#### Desktop (≥960px)
- ✅ Layout complet funcțional
- ✅ Toate funcțiile disponibile
- ✅ Experiență optimă

### 5. Cazuri Limită și Erori

#### Produse Indisponibile
- ✅ Butonul "Adaugă în coș" este dezactivat
- ✅ Mesajul "Stoc epuizat" este afișat
- ✅ Utilizatorul nu poate adăuga produsul

#### Cantități Invalid
- ✅ Cantitatea 0 elimină produsul sau resetează la 1
- ✅ Cantități mari sunt gestionate corect
- ✅ Calculele rămân precise

## 📊 Rapoarte și Metrici

### Metrici Urmărite

#### Metrici Generale
- **Total Teste**: Numărul total de teste executate
- **Success Rate**: Procentul de teste care au trecut
- **Timp de Execuție**: Durata totală și medie per test
- **Breakdown pe Categorii**: Distribuția testelor pe funcționalități

#### Metrici Specifice Coșului
- **Produse Adăugate**: Numărul de produse testate
- **Operațiuni Cart**: Actualizări, eliminări, etc.
- **Validări Date**: Verificări de acuratețe
- **Teste Responsive**: Acoperirea device-urilor

#### Metrici de Performanță
- **Cele mai Lente Teste**: Top 5 teste cu timp mare
- **Cele mai Rapide Teste**: Top 5 teste eficiente
- **Timp Mediu pe Categorie**: Performanța pe tipuri de teste

### Tipuri de Rapoarte

#### 1. HTML Summary (`test-results/cart-summary.html`)
Raport vizual cu grafice și metrici pentru management și stakeholders.

#### 2. Detailed JSON (`test-results/cart-detailed-report.json`)
Date complete în format JSON pentru integrări și analize programatice.

#### 3. Consolidated Report (`test-results/consolidated-report.md`)
Raport în format Markdown pentru documentație și versioning.

#### 4. Playwright HTML (`playwright-report/index.html`)
Raportul standard Playwright cu screenshots, traces, și detalii complete.

## 🐛 Debugging și Troubleshooting

### Debugging Step-by-Step
```bash
# Mod debug cu pauză la fiecare pas
npm run test:cart:debug
```

### Recording pentru Analiză
```bash
# Înregistrează video + screenshot + trace
npm run test:cart:record
```

### Probleme Comune

#### 1. Serverul nu pornește
**Simptom**: Eroarea "Server not running on http://localhost:5176"
**Soluție**:
```bash
# În terminal separat
npm run dev

# Verifică că portul este corect în config
```

#### 2. Teste instabile
**Simptom**: Teste care trec/pică aleatoriu
**Soluții**:
- Crește timeout-urile pentru rețele lente
- Verifică că elementele sunt complet încărcate
- Utilizează `waitForLoadState('networkidle')`

#### 3. Page Objects nu găsesc elemente
**Simptom**: Selectori care nu funcționează
**Soluții**:
- Verifică în mod debug ce elemente există
- Actualizează selectorii după modificări UI
- Utilizează multiple strategii de selecție

#### 4. Date inconsistente
**Simptom**: Produsele nu se sincronizează corect
**Soluții**:
- Verifică localStorage între teste
- Crește wait-urile pentru actualizări UI
- Validează că store-ul Zustand funcționează

### Instrumentele de Debugging

#### Playwright Inspector
```bash
# Deschide inspector-ul pas cu pas
npm run test:cart:debug
```

#### Trace Viewer
```bash
# După test cu --trace
npx playwright show-trace traces/trace.zip
```

#### Screenshots pe Erori
Screenshots automate la orice test care pică în `screenshots/`

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Cart E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  cart-e2e:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright
      run: npx playwright install --with-deps
    
    - name: Start application
      run: |
        npm run dev &
        sleep 10
    
    - name: Run Cart E2E Tests
      run: npm run test:cart
      env:
        CI: true
    
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: cart-test-results
        path: |
          test-results/
          playwright-report/
        retention-days: 30
```

### Configurația pentru CI
Testele detectează automat environment-ul CI și se adaptează:
- **Headless mode** activat automat
- **Retry logic** mărit pentru stabilitate
- **Timeout-uri** optimizate
- **Paralelism** redus pentru resurse limitate

### Raportarea în CI
```bash
# În CI, rapoartele sunt salvate automat
# și pot fi accesate ca artifacts
```

## 🎯 Best Practices și Recomandări

### Pentru Dezvoltatori
1. **Rulează testele local** înainte de commit
2. **Utilizează debug mode** pentru dezvoltarea noilor teste
3. **Mențin selectorii actualizați** la modificările UI
4. **Test pe multiple device-uri** pentru responsivitate

### Pentru QA
1. **Configurează rulări regulate** pe toate browser-ele
2. **Monitorizează metricile** de performanță
3. **Analizează trend-urile** de failure rate
4. **Documentează bug-urile** cu trace files

### Pentru DevOps
1. **Integrează în pipeline-ul CI/CD**
2. **Configurează notificări** pentru failures
3. **Arhivează rapoartele** pentru tracking istoric
4. **Monitoring resurse** pentru execuții stabile

---

## 📝 Changelog și Versioning

### v1.0.0 (Initial Release)
- ✅ Campanie completă E2E pentru funcționalitatea de coș
- ✅ Page Objects pentru toate paginile relevante
- ✅ Teste comprehensive pentru /gresie și /faianta
- ✅ Validare amănunțită a datelor de coș
- ✅ Suport complet responsive (mobile, tablet, desktop)
- ✅ Raportare avansată cu metrici personalizate
- ✅ Configurație CI/CD ready
- ✅ Documentație completă

---

**Creat pentru Pro-Mac Tiles E-commerce Platform**  
**Powered by Playwright + TypeScript + Page Object Pattern**  
**Total Coverage: 50+ scenarii de testare** 🚀