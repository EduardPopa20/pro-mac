// Types for Romanian e-Factura (e-Invoice) System
// Based on UBL 2.1 standard and ANAF requirements

export interface CompanyDetails {
  // Identification
  name: string
  cif: string // CUI - Cod Unic de Înregistrare
  regCom?: string // J40/123/2024 format
  
  // Address
  address: {
    street: string
    number: string
    city: string
    county: string // Județ
    postalCode: string
    country: string // Default: RO
  }
  
  // Contact
  email?: string
  phone?: string
  
  // Banking
  bankAccounts?: Array<{
    iban: string
    bankName: string
    currency: string // RON, EUR
  }>
  
  // Other
  socialCapital?: number
  vatPayer: boolean // Plătitor de TVA
}

export interface InvoiceItem {
  // Product info
  name: string
  code?: string // SKU
  description?: string
  
  // Quantities
  quantity: number
  unit: string // buc, mp, ml, kg
  unitPrice: number // Without VAT
  
  // VAT
  vatRate: number // 19, 9, 5, 0
  vatAmount: number
  
  // Totals
  subtotal: number // quantity * unitPrice
  total: number // subtotal + vatAmount
  
  // Discounts
  discount?: {
    percentage?: number
    amount?: number
    reason?: string
  }
}

export interface Invoice {
  // Identification
  series: string // PMT
  number: number // Sequential
  date: Date
  dueDate: Date
  
  // Type
  type: 'FACTURA' | 'PROFORMA' | 'STORNO' | 'AVIZ'
  stornoReference?: string // For STORNO type
  
  // Parties
  supplier: CompanyDetails
  customer: CompanyDetails | PersonDetails
  
  // Items
  items: InvoiceItem[]
  
  // Totals
  currency: string // RON, EUR
  exchangeRate?: number // For non-RON
  
  subtotal: number // Sum of items without VAT
  totalDiscount?: number
  
  // VAT breakdown
  vatBreakdown: Array<{
    rate: number // 19, 9, 5, 0
    base: number // Taxable amount
    amount: number // VAT amount
  }>
  
  totalVat: number
  total: number // Final amount to pay
  
  // Payment
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OP'
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL'
  paymentReference?: string
  
  // Notes
  notes?: string
  internalNotes?: string
  
  // ANAF specific
  anafUploadId?: string
  anafStatus?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'ERROR'
  anafErrors?: string[]
  anafXml?: string
}

export interface PersonDetails {
  // Identification
  name: string
  cnp?: string // Optional for individuals
  
  // Address
  address: {
    street: string
    number: string
    city: string
    county: string
    postalCode: string
    country: string
  }
  
  // Contact
  email?: string
  phone?: string
}

export interface InvoiceSettings {
  // Company defaults
  defaultSupplier: CompanyDetails
  
  // Invoice series
  currentSeries: string
  lastInvoiceNumber: number
  
  // VAT settings
  defaultVatRate: number // 19
  reverseCharge: boolean // Taxare inversă
  
  // Text templates
  paymentTermsText?: string
  footerText?: string
  
  // ANAF Configuration
  anafEnvironment: 'TEST' | 'PRODUCTION'
  anafClientId?: string
  anafClientSecret?: string // Encrypted
  anafRefreshToken?: string // Encrypted
}

// ANAF API Response Types
export interface ANAFUploadResponse {
  uploadId: string
  status: 'OK' | 'ERROR'
  message?: string
  errors?: Array<{
    code: string
    message: string
    field?: string
  }>
  timestamp: Date
}

export interface ANAFStatusResponse {
  uploadId: string
  invoiceId: string
  status: 'PROCESSING' | 'ACCEPTED' | 'REJECTED'
  downloadUrl?: string // For accepted invoices
  errors?: Array<{
    code: string
    message: string
  }>
}

// Validation schemas
export interface ValidationResult {
  valid: boolean
  errors: Array<{
    field: string
    message: string
    code: string
  }>
  warnings?: Array<{
    field: string
    message: string
  }>
}

// Queue system types
export interface InvoiceQueueJob {
  id: string
  invoiceId: string
  orderId?: string
  action: 'GENERATE' | 'SEND' | 'STORNO' | 'RETRY' | 'CHECK_STATUS'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  
  retryCount: number
  maxRetries: number
  
  scheduledFor: Date
  processedAt?: Date
  
  lastError?: string
  result?: any
  
  createdAt: Date
  updatedAt: Date
}

// Constants
export const VAT_RATES = {
  STANDARD: 19,
  REDUCED_FOOD: 9,
  REDUCED_SERVICES: 5,
  ZERO: 0
} as const

export const INVOICE_UNITS = [
  'buc', // bucată (piece)
  'mp', // metru pătrat (square meter)
  'ml', // metru liniar (linear meter)
  'kg', // kilogram
  'l', // litru (liter)
  'ore', // hours
  'zi', // day
  'luna', // month
  'set', // set
  'pereche' // pair
] as const

export const COUNTY_CODES: Record<string, string> = {
  'AB': 'Alba',
  'AR': 'Arad',
  'AG': 'Argeș',
  'BC': 'Bacău',
  'BH': 'Bihor',
  'BN': 'Bistrița-Năsăud',
  'BT': 'Botoșani',
  'BV': 'Brașov',
  'BR': 'Brăila',
  'B': 'București',
  'BZ': 'Buzău',
  'CS': 'Caraș-Severin',
  'CL': 'Călărași',
  'CJ': 'Cluj',
  'CT': 'Constanța',
  'CV': 'Covasna',
  'DB': 'Dâmbovița',
  'DJ': 'Dolj',
  'GL': 'Galați',
  'GR': 'Giurgiu',
  'GJ': 'Gorj',
  'HR': 'Harghita',
  'HD': 'Hunedoara',
  'IL': 'Ialomița',
  'IS': 'Iași',
  'IF': 'Ilfov',
  'MM': 'Maramureș',
  'MH': 'Mehedinți',
  'MS': 'Mureș',
  'NT': 'Neamț',
  'OT': 'Olt',
  'PH': 'Prahova',
  'SM': 'Satu Mare',
  'SJ': 'Sălaj',
  'SB': 'Sibiu',
  'SV': 'Suceava',
  'TR': 'Teleorman',
  'TM': 'Timiș',
  'TL': 'Tulcea',
  'VS': 'Vaslui',
  'VL': 'Vâlcea',
  'VN': 'Vrancea'
}

// Error codes from ANAF
export const ANAF_ERROR_CODES = {
  'V001': 'CIF invalid',
  'V002': 'CNP invalid',
  'V003': 'Dată invalidă',
  'V004': 'Serie factură invalidă',
  'V005': 'Număr factură duplicat',
  'V006': 'Total incorect',
  'V007': 'TVA calculat incorect',
  'V008': 'Lipsă date obligatorii',
  'V009': 'Format XML invalid',
  'V010': 'Schemă XSD nevalidată',
  'A001': 'Autentificare eșuată',
  'A002': 'Token expirat',
  'A003': 'Permisiuni insuficiente',
  'S001': 'Serviciu indisponibil',
  'S002': 'Timeout',
  'S003': 'Rată limită depășită'
} as const