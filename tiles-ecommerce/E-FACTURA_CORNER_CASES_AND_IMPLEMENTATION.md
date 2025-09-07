# 📊 e-Factura România - Ghid Complet de Implementare și Corner Cases
## Pro-Mac Tiles E-commerce Platform

---

## 📋 1. Furnizori Certificate Digitale în România

### Opțiuni Disponibile

| Furnizor | Cost Anual | Timp Livrare | Avantaje | Recomandare |
|----------|------------|--------------|----------|-------------|
| **CertSign** | 250-300 RON | 2-5 zile | Market leader (60% piață), suport excelent | ⭐⭐⭐⭐⭐ |
| **DigiSign** | 200-250 RON | 3-5 zile | Preț competitiv, bun pentru IMM | ⭐⭐⭐⭐ |
| **Trans Sped** | 280-320 RON | 3-7 zile | Specializat transportatori | ⭐⭐⭐ |
| **InfoCert** | 300-350 RON | 5-7 zile | Furnizor european | ⭐⭐⭐ |
| **AlfaTrust** | 220-270 RON | 3-5 zile | Prețuri volume | ⭐⭐⭐ |

### Recomandare pentru Pro-Mac Tiles
**DigiSign** - Cel mai bun raport calitate/preț pentru un e-commerce mediu
- ✅ Economie ~50 RON/an față de CertSign
- ✅ Proces online complet (identificare video)
- ✅ Compatibil 100% cu ANAF e-Factura
- ✅ Suport tehnic în română

---

## 🚀 2. Plan de Implementare e-Factura (Timeline)

### **Faza 1: Pregătire (Zilele 1-3)**

#### Acțiuni Client:
```
1. Comandă certificat digital (DigiSign/CertSign)
2. Pregătește documente:
   - CUI (Cod Unic Înregistrare)
   - Nr. Registru Comerț (J40/xxxx/2024)
   - Adresa completă sediu social
   - Date administrator (CNP, CI)
   - Conturi bancare
```

#### Acțiuni Developer:
```typescript
// Structură foldere (de implementat ACUM)
src/utils/efactura/
├── generator.ts        // Generator XML UBL 2.1
├── validator.ts        // Validare schemă XSD
├── templates.ts        // Template-uri per tip produs
├── calculator.ts       // Calcule TVA, totaluri
└── pdfExporter.ts     // Backup PDF local

supabase/functions/
├── efactura-generate/  // Generare factură
├── efactura-send/      // Trimitere ANAF
├── efactura-status/    // Verificare status
└── efactura-storno/    // Anulare/Stornare
```

### **Faza 2: Înregistrare ANAF (Zilele 4-5)**

```bash
# După primirea certificatului
1. Acces: https://www.anaf.ro/anaf/internet/ANAF/servicii_online/SPV
2. Login cu certificat digital
3. Activare serviciu e-Factura
4. Obținere credențiale API:
   - Client ID (OAuth2)
   - Client Secret
   - Refresh Token
```

### **Faza 3: Integrare Tehnică (Zilele 6-7)**

```sql
-- Schema Database
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_series TEXT NOT NULL,
  invoice_type TEXT CHECK (invoice_type IN ('FACTURA', 'STORNO', 'PROFORMA')),
  
  -- Date client
  client_name TEXT NOT NULL,
  client_cif TEXT,
  client_reg_com TEXT,
  client_address JSONB NOT NULL,
  client_type TEXT CHECK (client_type IN ('PERSOANA_FIZICA', 'PERSOANA_JURIDICA')),
  
  -- Conținut
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'RON',
  
  -- Status ANAF
  xml_content TEXT,
  pdf_url TEXT,
  anaf_upload_id TEXT,
  anaf_status TEXT DEFAULT 'draft',
  anaf_response JSONB,
  anaf_errors JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_anaf_at TIMESTAMPTZ,
  confirmed_by_anaf_at TIMESTAMPTZ,
  storno_reference UUID REFERENCES invoices(id),
  
  -- Indexuri
  INDEX idx_invoice_order (order_id),
  INDEX idx_invoice_status (anaf_status),
  INDEX idx_invoice_number (invoice_number)
);

-- Queue pentru procesare
CREATE TABLE invoice_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  action TEXT CHECK (action IN ('GENERATE', 'SEND', 'STORNO', 'RETRY')),
  status TEXT DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setări companie
CREATE TABLE invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  company_cif TEXT UNIQUE NOT NULL,
  company_reg_com TEXT,
  company_address JSONB NOT NULL,
  company_capital DECIMAL(10,2),
  bank_accounts JSONB,
  invoice_series TEXT DEFAULT 'PMT',
  last_invoice_number INT DEFAULT 0,
  vat_rate DECIMAL(4,2) DEFAULT 19.00,
  invoice_footer_text TEXT,
  
  -- Configurări workflow
  auto_generate_invoice BOOLEAN DEFAULT false,
  invoice_delay_minutes INT DEFAULT 30,
  require_payment_confirmation BOOLEAN DEFAULT true,
  
  -- ANAF OAuth
  anaf_client_id TEXT,
  anaf_client_secret TEXT ENCRYPTED,
  anaf_refresh_token TEXT ENCRYPTED,
  anaf_environment TEXT DEFAULT 'TEST', -- TEST sau PROD
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Faza 4: Testing (Zilele 8-9)**

```typescript
// Test flow complet
async function testInvoiceWorkflow() {
  // 1. Test generare XML
  const testOrder = await createTestOrder()
  const xml = await generateInvoiceXML(testOrder)
  
  // 2. Validare locală
  const validation = await validateAgainstXSD(xml)
  assert(validation.valid, 'XML invalid')
  
  // 3. Test ANAF sandbox
  const response = await sendToANAFTest(xml)
  assert(response.status === 'OK', 'ANAF rejected')
  
  // 4. Test stornare
  const storno = await createStorno(response.invoiceId)
  assert(storno.status === 'OK', 'Storno failed')
  
  // 5. Test PDF generation
  const pdf = await generatePDF(xml)
  assert(pdf.size > 0, 'PDF generation failed')
}
```

### **Faza 5: Go Live (Ziua 10)**

```typescript
// Checklist final
const GO_LIVE_CHECKLIST = {
  certificate_installed: true,
  spv_registered: true,
  api_keys_configured: true,
  test_invoices_sent: 5,
  storno_tested: true,
  pdf_backup_working: true,
  admin_trained: true,
  monitoring_active: true,
  fallback_ready: true
}
```

---

## ⚠️ 3. Corner Cases Critice și Soluții

### **🔴 PROBLEMA #1: Anulare Plată După Emiterea Facturii**

**Scenariul Problematic:**
```
1. Client comandă → Factura auto-generată
2. Plata eșuează/anulată → Factura deja la ANAF
3. ANAF nu permite ștergere → Necesită stornare (bătaie de cap)
```

**SOLUȚIA: Never Invoice Before Payment!**

```typescript
// ❌ GREȘIT - Nu face asta!
async function onOrderCreated(order: Order) {
  await generateInvoice(order) // NU! Plata poate fi anulată
}

// ✅ CORECT - Așteaptă confirmarea
async function onPaymentConfirmed(payment: Payment) {
  // Verificări multiple
  if (payment.status !== 'confirmed') return
  if (payment.amount < 0.01) return
  if (payment.is_test) return
  
  // Delay de siguranță (30 minute)
  await scheduleInvoice(payment.order_id, { delay: 30 * 60 * 1000 })
}

// Listener pentru Netopia IPN
async function handleNetopiaIPN(data: IPNData) {
  switch(data.action) {
    case 'confirmed':
      // Abia ACUM programăm factura
      await addToInvoiceQueue(data.order_id, {
        scheduledFor: new Date(Date.now() + 30 * 60 * 1000)
      })
      break
      
    case 'canceled':
    case 'credit':
    case 'failed':
      // Anulăm orice factură programată
      await removeFromInvoiceQueue(data.order_id)
      
      // Dacă deja emisă, facem storno
      const invoice = await getInvoice(data.order_id)
      if (invoice?.anaf_status === 'sent') {
        await createStorno(invoice.id, 'Plată anulată')
      }
      break
  }
}
```

### **📝 PROBLEMA #2: Procesul de Stornare**

```typescript
// Generator factură storno
async function generateStornoInvoice(originalInvoiceId: string, reason: string) {
  const original = await getInvoice(originalInvoiceId)
  
  if (!original) throw new Error('Factura originală nu există')
  if (original.invoice_type === 'STORNO') throw new Error('Nu poți storna o stornare')
  
  // Factură storno = valori negative
  const storno = {
    invoice_type: 'STORNO',
    invoice_number: `${original.invoice_number}-S`,
    storno_reference: originalInvoiceId,
    storno_reason: reason,
    
    // Toate valorile devin negative
    items: original.items.map(item => ({
      ...item,
      quantity: -Math.abs(item.quantity),
      unit_price: item.unit_price, // Prețul rămâne pozitiv
      total: -Math.abs(item.total),
      vat_amount: -Math.abs(item.vat_amount)
    })),
    
    subtotal: -Math.abs(original.subtotal),
    vat_amount: -Math.abs(original.vat_amount),
    total: -Math.abs(original.total)
  }
  
  // Trimite la ANAF
  const xml = await generateXML(storno)
  const response = await sendToANAF(xml)
  
  // Notifică clientul
  await sendEmail(original.client_email, {
    subject: 'Factură stornată',
    template: 'invoice_storno',
    data: { invoice_number: original.invoice_number, reason }
  })
  
  return storno
}
```

### **🚨 PROBLEMA #3: ANAF Timeout/Indisponibil**

```typescript
// Sistem robust cu retry și queue
async function sendToANAFWithRetry(
  invoice: Invoice,
  options = { maxRetries: 3, backoffMs: 1000 }
) {
  let lastError: Error
  
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      // Timeout agresiv (10 secunde)
      const response = await Promise.race([
        sendToANAF(invoice),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ANAF Timeout')), 10000)
        )
      ])
      
      // Succes
      await updateInvoiceStatus(invoice.id, 'sent', response)
      return response
      
    } catch (error) {
      lastError = error
      
      // Log pentru monitorizare
      await logError({
        invoice_id: invoice.id,
        attempt: attempt + 1,
        error: error.message,
        timestamp: new Date()
      })
      
      // Exponential backoff
      if (attempt < options.maxRetries - 1) {
        const delay = options.backoffMs * Math.pow(2, attempt)
        await sleep(delay)
      }
    }
  }
  
  // După toate încercările, salvăm în queue
  await addToQueue({
    invoice_id: invoice.id,
    action: 'RETRY_SEND',
    scheduled_for: new Date(Date.now() + 60 * 60 * 1000), // Retry în 1 oră
    error: lastError.message
  })
  
  // Notificare admin
  await notifyAdmin({
    type: 'INVOICE_FAILED',
    invoice: invoice.invoice_number,
    error: lastError.message,
    action_required: true
  })
  
  throw lastError
}
```

### **🔄 PROBLEMA #4: Retururi După Facturare**

```typescript
// Sistem pentru gestionare retururi
async function handleProductReturn(
  orderId: string,
  returnedItems: Array<{ product_id: string, quantity: number, reason: string }>
) {
  const order = await getOrder(orderId)
  const invoice = await getInvoiceByOrderId(orderId)
  
  // Cazul 1: Fără factură încă - simplu
  if (!invoice) {
    await updateOrderItems(orderId, returnedItems)
    return { status: 'updated', invoice: null }
  }
  
  // Cazul 2: Factură emisă - necesită storno parțial
  if (invoice.anaf_status === 'sent') {
    // Calculăm valorile de stornat
    const stornoItems = returnedItems.map(returnItem => {
      const originalItem = invoice.items.find(i => i.product_id === returnItem.product_id)
      return {
        ...originalItem,
        quantity: -returnItem.quantity,
        total: -(originalItem.unit_price * returnItem.quantity * 1.19), // Include TVA
        return_reason: returnItem.reason
      }
    })
    
    // Generăm storno parțial
    const partialStorno = await generateStornoInvoice(invoice.id, 'Retur produse', {
      items: stornoItems,
      partial: true
    })
    
    // Procesăm refund
    await processRefund(order.payment_id, partialStorno.total)
    
    return { status: 'storno_created', invoice: partialStorno }
  }
  
  // Cazul 3: Factură draft - doar actualizăm
  await updateInvoiceItems(invoice.id, returnedItems)
  return { status: 'draft_updated', invoice }
}
```

### **📊 PROBLEMA #5: Modificare Date Client După Facturare**

```typescript
// NU se pot modifica facturile trimise!
async function handleClientDataChange(
  invoiceId: string,
  newClientData: ClientData,
  changeType: 'minor' | 'major'
) {
  const invoice = await getInvoice(invoiceId)
  
  // Factură netrimisă - OK să modificăm
  if (invoice.anaf_status === 'draft') {
    await updateInvoice(invoiceId, { client_data: newClientData })
    return { action: 'updated' }
  }
  
  // Factură trimisă - depends on change type
  if (invoice.anaf_status === 'sent') {
    if (changeType === 'minor') {
      // Ex: doar număr telefon - salvăm intern, nu afectează ANAF
      await addInvoiceNote(invoiceId, `Date actualizate: ${JSON.stringify(newClientData)}`)
      return { action: 'note_added' }
      
    } else {
      // Schimbare majoră (CIF, nume firmă) - storno + refacturare
      const storno = await generateStornoInvoice(invoiceId, 'Date client incorecte')
      const newInvoice = await generateInvoice(invoice.order_id, newClientData)
      
      return { 
        action: 'storno_and_reissue',
        storno_id: storno.id,
        new_invoice_id: newInvoice.id
      }
    }
  }
}
```

---

## 🛡️ 4. Strategii Preventive

### **Configurație Inteligentă**

```typescript
// settings.ts
export const INVOICE_CONFIG = {
  // Timing
  trigger: 'PAYMENT_CONFIRMED', // Nu 'ORDER_CREATED'!
  delay_minutes: 30, // Buffer de siguranță
  
  // Risk Management
  high_risk_hours: [22, 23, 0, 1, 2], // Noapte = fraudă mai mare
  high_risk_amount: 5000, // RON - verificare manuală
  
  // Business Rules
  require_3ds: true, // Doar plăți 3D Secure
  require_verified_email: true,
  max_invoice_age_for_storno: 90, // zile
  
  // Backup
  always_save_pdf_locally: true,
  keep_xml_backup: true,
  
  // ANAF
  use_test_environment: process.env.NODE_ENV !== 'production',
  batch_send_hour: 9, // Trimite facturile în batch la 9 AM
}

// Risk Assessment
function assessInvoiceRisk(order: Order): RiskLevel {
  const score = 0
  
  // Factors that increase risk
  if (!order.customer.email_verified) score += 2
  if (order.total > INVOICE_CONFIG.high_risk_amount) score += 3
  if (isNightTime()) score += 2
  if (order.customer.orders_count === 0) score += 3 // First order
  if (order.shipping_country !== 'RO') score += 1
  
  // Factors that decrease risk
  if (order.customer.orders_count > 10) score -= 2
  if (order.payment_method === 'bank_transfer') score -= 1
  
  if (score >= 7) return 'HIGH' // Manual review
  if (score >= 4) return 'MEDIUM' // Extra delay
  return 'LOW' // Auto process
}
```

### **Queue System pentru Procesare Sigură**

```typescript
// Cron job pentru procesare facturilor (runs every 5 minutes)
export async function processInvoiceQueue() {
  // 1. Preia facturile de procesat
  const pending = await supabase
    .from('invoice_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(10) // Process max 10 at a time
  
  for (const job of pending.data) {
    try {
      // 2. Marchează ca în procesare
      await updateQueueJob(job.id, { status: 'processing' })
      
      // 3. Procesează bazat pe acțiune
      switch(job.action) {
        case 'GENERATE':
          await generateInvoice(job.order_id)
          break
        case 'SEND':
          await sendToANAFWithRetry(job.invoice_id)
          break
        case 'STORNO':
          await generateStornoInvoice(job.invoice_id, job.reason)
          break
      }
      
      // 4. Marchează ca success
      await updateQueueJob(job.id, { 
        status: 'completed',
        processed_at: new Date()
      })
      
    } catch (error) {
      // 5. Handle failure
      const newRetryCount = job.retry_count + 1
      
      if (newRetryCount >= job.max_retries) {
        // Failed permanently
        await updateQueueJob(job.id, { 
          status: 'failed',
          last_error: error.message
        })
        
        // Notify admin
        await notifyAdmin({
          type: 'INVOICE_QUEUE_FAILED',
          job_id: job.id,
          error: error.message
        })
      } else {
        // Retry later
        await updateQueueJob(job.id, {
          status: 'pending',
          retry_count: newRetryCount,
          scheduled_for: new Date(Date.now() + Math.pow(2, newRetryCount) * 60000), // Exponential backoff
          last_error: error.message
        })
      }
    }
  }
}
```

---

## 🎛️ 5. Admin Dashboard pentru Gestionare

### **Pagină Monitorizare Facturi**

```tsx
// src/pages/admin/InvoiceMonitoring.tsx
import { useState, useEffect } from 'react'
import { 
  Box, Card, Typography, Chip, Button, 
  Alert, LinearProgress, IconButton 
} from '@mui/material'
import { Refresh, Warning, CheckCircle, Error } from '@mui/icons-material'

export const InvoiceMonitoringDashboard = () => {
  const [stats, setStats] = useState({
    total_today: 0,
    sent_to_anaf: 0,
    pending_queue: 0,
    failed: 0,
    storno_required: 0
  })
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Status Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h4">{stats.total_today}</Typography>
            <Typography color="text.secondary">Facturi Azi</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: 'success.light' }}>
            <Typography variant="h4">{stats.sent_to_anaf}</Typography>
            <Typography>Trimise la ANAF</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: 'warning.light' }}>
            <Typography variant="h4">{stats.pending_queue}</Typography>
            <Typography>În Așteptare</Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, bgcolor: 'error.light' }}>
            <Typography variant="h4">{stats.failed}</Typography>
            <Typography>Eșuate</Typography>
          </Card>
        </Grid>
      </Grid>
      
      {/* Problem Invoices */}
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Facturi cu Probleme"
          action={
            <IconButton onClick={refreshData}>
              <Refresh />
            </IconButton>
          }
        />
        <CardContent>
          {problemInvoices.map(invoice => (
            <Alert 
              key={invoice.id}
              severity="warning"
              action={
                <>
                  <Button onClick={() => retryInvoice(invoice.id)}>
                    Reîncearcă
                  </Button>
                  <Button onClick={() => createStorno(invoice.id)}>
                    Stornează
                  </Button>
                  <Button onClick={() => viewDetails(invoice.id)}>
                    Detalii
                  </Button>
                </>
              }
            >
              <AlertTitle>Factură #{invoice.number}</AlertTitle>
              {invoice.error_message} - {invoice.retry_count} încercări
            </Alert>
          ))}
        </CardContent>
      </Card>
      
      {/* Queue Status */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Coadă Procesare" />
        <CardContent>
          <List>
            {queueJobs.map(job => (
              <ListItem key={job.id}>
                <ListItemIcon>
                  {job.status === 'processing' && <CircularProgress size={20} />}
                  {job.status === 'completed' && <CheckCircle color="success" />}
                  {job.status === 'failed' && <Error color="error" />}
                </ListItemIcon>
                <ListItemText 
                  primary={`${job.action} - Comandă #${job.order_id}`}
                  secondary={`Programat: ${formatDate(job.scheduled_for)}`}
                />
                <Chip 
                  label={job.status}
                  color={getStatusColor(job.status)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
```

---

## 📋 6. Checklist Complet Pre-Launch

### **Pentru Developer**
- [ ] Generator XML implementat și testat
- [ ] Validare XSD funcțională
- [ ] Edge Functions create pentru ANAF
- [ ] Queue system implementat
- [ ] Retry logic cu exponential backoff
- [ ] Stornare automată implementată
- [ ] PDF backup local funcțional
- [ ] Dashboard monitorizare creat
- [ ] Logging comprehensiv
- [ ] Error handling robust
- [ ] Test coverage >80%

### **Pentru Client**
- [ ] Certificat digital comandat
- [ ] Date firmă complete furnizate
- [ ] Înregistrare SPV efectuată
- [ ] API keys ANAF obținute
- [ ] Conturi bancare verificate
- [ ] Serie factură aleasă
- [ ] Text footer factură
- [ ] Training efectuat

### **Testare Obligatorie**
- [ ] 10 facturi test în ANAF TEST
- [ ] 3 stornări test
- [ ] 2 stornări parțiale
- [ ] Test timeout ANAF
- [ ] Test queue retry
- [ ] Test generare PDF
- [ ] Test email notifications
- [ ] Test pentru fiecare tip client (PF/PJ)
- [ ] Test calcul TVA
- [ ] Test numere factură secvențiale

---

## 🚨 7. Reguli de Business Critice

```typescript
export const CRITICAL_BUSINESS_RULES = {
  // 1. NICIODATĂ factură înainte de plată confirmată
  NEVER_INVOICE_BEFORE_PAYMENT: true,
  
  // 2. ÎNTOTDEAUNA backup PDF local
  ALWAYS_BACKUP_PDF: true,
  
  // 3. Stornare în maxim 90 zile
  MAX_DAYS_FOR_STORNO: 90,
  
  // 4. Verificare CIF pentru persoane juridice
  VALIDATE_COMPANY_CIF: true,
  
  // 5. Factură proformă pentru comenzi >10,000 RON
  PROFORMA_FOR_LARGE_ORDERS: 10000,
  
  // 6. Re-verificare stoc înainte de facturare
  RECHECK_STOCK_BEFORE_INVOICE: true,
  
  // 7. Email confirmare pentru fiecare factură
  SEND_INVOICE_EMAIL: true,
  
  // 8. Arhivare factură 10 ani
  ARCHIVE_YEARS: 10,
  
  // 9. Numere factură strict secvențiale
  STRICT_SEQUENTIAL_NUMBERS: true,
  
  // 10. Audit log pentru toate acțiunile
  COMPREHENSIVE_AUDIT_LOG: true
}
```

---

## 📞 8. Suport și Resurse

### **Contacte Esențiale**
- **ANAF e-Factura Support**: 031 403 91 60
- **ANAF Asistență Tehnică**: efactura@anaf.ro
- **DigiSign Support**: 021 310 26 91
- **CertSign Support**: 021 310 26 90

### **Documentație Tehnică**
- [ANAF e-Factura Specificații](https://www.anaf.ro/anaf/internet/ANAF/servicii_online/efactura/informatii_tehnice)
- [UBL 2.1 Schema](http://docs.oasis-open.org/ubl/UBL-2.1.html)
- [OAuth2 ANAF API](https://api.anaf.ro/documentation)
- [Ghid Dezvoltatori](https://static.anaf.ro/static/10/Anaf/Informatii_R/API/Ghid_dezvoltatori_EFactura.pdf)

### **Medii de Test**
```bash
# ANAF Test Environment
TEST_BASE_URL=https://api.anaf.ro/test/v1/
TEST_OAUTH_URL=https://logincert.anaf.ro/anaf-oauth2/v1/

# ANAF Production (după testare completă)
PROD_BASE_URL=https://api.anaf.ro/prod/v1/
PROD_OAUTH_URL=https://logincert.anaf.ro/anaf-oauth2/v1/
```

---

## 📝 Note Finale

1. **Deadline critic**: 1 Ianuarie 2025 (B2C obligatoriu)
2. **Perioadă de grație**: până 31 Martie 2025
3. **Amendă după grație**: 1,000-10,000 RON
4. **Recomandare**: Începe cu TEST environment timp de 2 săptămâni
5. **Backup plan**: Păstrează sistemul PDF clasic în paralel primele 3 luni

---

*Document actualizat: Ianuarie 2025*  
*Versiune: 1.0*  
*Status: DRAFT - În dezvoltare activă*  
*Prioritate: CRITICĂ*