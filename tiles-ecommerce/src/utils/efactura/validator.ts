// Invoice Validation for Romanian e-Factura
import Joi from 'joi'
import { 
  Invoice, 
  CompanyDetails, 
  PersonDetails, 
  InvoiceItem,
  ValidationResult,
  VAT_RATES,
  INVOICE_UNITS,
  COUNTY_CODES 
} from './types'

// CIF (CUI) validation for Romanian companies
const validateCIF = (cif: string): boolean => {
  // Remove RO prefix if present
  const cleanCIF = cif.replace(/^RO/i, '').replace(/\s/g, '')
  
  // Must be numeric and between 2-10 digits
  if (!/^\d{2,10}$/.test(cleanCIF)) return false
  
  // Checksum validation (Romanian CIF algorithm)
  const controlNumber = '753217532'
  const cifDigits = cleanCIF.slice(0, -1)
  const checkDigit = parseInt(cleanCIF.slice(-1))
  
  let sum = 0
  for (let i = 0; i < cifDigits.length; i++) {
    sum += parseInt(cifDigits[i]) * parseInt(controlNumber[i])
  }
  
  const calculatedCheck = (sum * 10) % 11
  const finalCheck = calculatedCheck === 10 ? 0 : calculatedCheck
  
  return finalCheck === checkDigit
}

// CNP validation for Romanian individuals
const validateCNP = (cnp: string): boolean => {
  if (!/^\d{13}$/.test(cnp)) return false
  
  const controlNumber = '279146358279'
  let sum = 0
  
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i]) * parseInt(controlNumber[i])
  }
  
  const checkDigit = sum % 11
  const finalCheck = checkDigit === 10 ? 1 : checkDigit
  
  return finalCheck === parseInt(cnp[12])
}

// IBAN validation
const validateIBAN = (iban: string): boolean => {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  
  // Romanian IBAN format: RO + 2 check digits + 4 bank code + 16 account
  if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(cleanIBAN)) return false
  
  // Move first 4 chars to end and convert to numbers
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, char => (char.charCodeAt(0) - 55).toString())
  
  // Modulo 97 check
  const mod = BigInt(numeric) % BigInt(97)
  return mod === BigInt(1)
}

// Company validation schema
const companySchema = Joi.object<CompanyDetails>({
  name: Joi.string().min(3).max(200).required(),
  cif: Joi.string().custom((value, helpers) => {
    if (!validateCIF(value)) {
      return helpers.error('any.invalid', { message: 'CIF invalid' })
    }
    return value
  }).required(),
  regCom: Joi.string().pattern(/^J\d{1,2}\/\d+\/\d{4}$/).optional(),
  
  address: Joi.object({
    street: Joi.string().required(),
    number: Joi.string().required(),
    city: Joi.string().required(),
    county: Joi.string().valid(...Object.values(COUNTY_CODES)).required(),
    postalCode: Joi.string().pattern(/^\d{6}$/).required(),
    country: Joi.string().default('RO')
  }).required(),
  
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^(\+40|0)[0-9]{9}$/).optional(),
  
  bankAccounts: Joi.array().items(Joi.object({
    iban: Joi.string().custom((value, helpers) => {
      if (!validateIBAN(value)) {
        return helpers.error('any.invalid', { message: 'IBAN invalid' })
      }
      return value
    }).required(),
    bankName: Joi.string().required(),
    currency: Joi.string().valid('RON', 'EUR', 'USD').required()
  })).optional(),
  
  socialCapital: Joi.number().positive().optional(),
  vatPayer: Joi.boolean().required()
})

// Person validation schema
const personSchema = Joi.object<PersonDetails>({
  name: Joi.string().min(3).max(200).required(),
  cnp: Joi.string().custom((value, helpers) => {
    if (value && !validateCNP(value)) {
      return helpers.error('any.invalid', { message: 'CNP invalid' })
    }
    return value
  }).optional(),
  
  address: Joi.object({
    street: Joi.string().required(),
    number: Joi.string().required(),
    city: Joi.string().required(),
    county: Joi.string().valid(...Object.values(COUNTY_CODES)).required(),
    postalCode: Joi.string().pattern(/^\d{6}$/).required(),
    country: Joi.string().default('RO')
  }).required(),
  
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^(\+40|0)[0-9]{9}$/).optional()
})

// Invoice item validation
const invoiceItemSchema = Joi.object<InvoiceItem>({
  name: Joi.string().min(1).max(500).required(),
  code: Joi.string().optional(),
  description: Joi.string().max(1000).optional(),
  
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid(...INVOICE_UNITS).required(),
  unitPrice: Joi.number().min(0).required(),
  
  vatRate: Joi.number().valid(...Object.values(VAT_RATES)).required(),
  vatAmount: Joi.number().min(0).required(),
  
  subtotal: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  
  discount: Joi.object({
    percentage: Joi.number().min(0).max(100).optional(),
    amount: Joi.number().min(0).optional(),
    reason: Joi.string().optional()
  }).optional()
})

// Main invoice validation schema
const invoiceSchema = Joi.object<Invoice>({
  series: Joi.string().alphanum().min(1).max(10).required(),
  number: Joi.number().integer().positive().required(),
  date: Joi.date().max('now').required(),
  dueDate: Joi.date().min(Joi.ref('date')).required(),
  
  type: Joi.string().valid('FACTURA', 'PROFORMA', 'STORNO', 'AVIZ').required(),
  stornoReference: Joi.when('type', {
    is: 'STORNO',
    then: Joi.string().required(),
    otherwise: Joi.optional()
  }),
  
  supplier: companySchema.required(),
  customer: Joi.alternatives().try(companySchema, personSchema).required(),
  
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  
  currency: Joi.string().valid('RON', 'EUR', 'USD').required(),
  exchangeRate: Joi.when('currency', {
    is: Joi.not('RON'),
    then: Joi.number().positive().required(),
    otherwise: Joi.optional()
  }),
  
  subtotal: Joi.number().min(0).required(),
  totalDiscount: Joi.number().min(0).optional(),
  
  vatBreakdown: Joi.array().items(Joi.object({
    rate: Joi.number().valid(...Object.values(VAT_RATES)).required(),
    base: Joi.number().min(0).required(),
    amount: Joi.number().min(0).required()
  })).required(),
  
  totalVat: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  
  paymentMethod: Joi.string().valid('CASH', 'BANK_TRANSFER', 'CARD', 'OP').optional(),
  paymentStatus: Joi.string().valid('PAID', 'UNPAID', 'PARTIAL').optional(),
  paymentReference: Joi.string().optional(),
  
  notes: Joi.string().max(2000).optional(),
  internalNotes: Joi.string().max(2000).optional(),
  
  anafUploadId: Joi.string().optional(),
  anafStatus: Joi.string().valid('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'ERROR').optional(),
  anafErrors: Joi.array().items(Joi.string()).optional(),
  anafXml: Joi.string().optional()
})

// Business rules validation
export function validateBusinessRules(invoice: Invoice): ValidationResult {
  const errors: ValidationResult['errors'] = []
  const warnings: ValidationResult['warnings'] = []
  
  // Check VAT calculations
  const calculatedVatBreakdown = new Map<number, { base: number, amount: number }>()
  
  invoice.items.forEach(item => {
    const currentBreakdown = calculatedVatBreakdown.get(item.vatRate) || { base: 0, amount: 0 }
    currentBreakdown.base += item.subtotal
    currentBreakdown.amount += item.vatAmount
    calculatedVatBreakdown.set(item.vatRate, currentBreakdown)
    
    // Verify item calculations
    const expectedSubtotal = item.quantity * item.unitPrice
    if (Math.abs(expectedSubtotal - item.subtotal) > 0.01) {
      errors.push({
        field: `items.${invoice.items.indexOf(item)}.subtotal`,
        message: `Subtotal incorect. Așteptat: ${expectedSubtotal}, Primit: ${item.subtotal}`,
        code: 'CALC_ERROR'
      })
    }
    
    const expectedVat = item.subtotal * (item.vatRate / 100)
    if (Math.abs(expectedVat - item.vatAmount) > 0.01) {
      errors.push({
        field: `items.${invoice.items.indexOf(item)}.vatAmount`,
        message: `TVA incorect. Așteptat: ${expectedVat}, Primit: ${item.vatAmount}`,
        code: 'VAT_CALC_ERROR'
      })
    }
  })
  
  // Verify VAT breakdown matches
  invoice.vatBreakdown.forEach(breakdown => {
    const calculated = calculatedVatBreakdown.get(breakdown.rate)
    if (!calculated) {
      errors.push({
        field: 'vatBreakdown',
        message: `Rată TVA ${breakdown.rate}% nu se găsește în articole`,
        code: 'VAT_MISMATCH'
      })
    } else {
      if (Math.abs(calculated.base - breakdown.base) > 0.01) {
        errors.push({
          field: 'vatBreakdown',
          message: `Bază TVA incorectă pentru rata ${breakdown.rate}%`,
          code: 'VAT_BASE_ERROR'
        })
      }
      if (Math.abs(calculated.amount - breakdown.amount) > 0.01) {
        errors.push({
          field: 'vatBreakdown',
          message: `Sumă TVA incorectă pentru rata ${breakdown.rate}%`,
          code: 'VAT_AMOUNT_ERROR'
        })
      }
    }
  })
  
  // Check totals
  const calculatedSubtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0)
  if (Math.abs(calculatedSubtotal - invoice.subtotal) > 0.01) {
    errors.push({
      field: 'subtotal',
      message: `Subtotal factură incorect`,
      code: 'SUBTOTAL_ERROR'
    })
  }
  
  const calculatedVat = invoice.items.reduce((sum, item) => sum + item.vatAmount, 0)
  if (Math.abs(calculatedVat - invoice.totalVat) > 0.01) {
    errors.push({
      field: 'totalVat',
      message: `Total TVA incorect`,
      code: 'TOTAL_VAT_ERROR'
    })
  }
  
  const calculatedTotal = invoice.subtotal + invoice.totalVat - (invoice.totalDiscount || 0)
  if (Math.abs(calculatedTotal - invoice.total) > 0.01) {
    errors.push({
      field: 'total',
      message: `Total factură incorect`,
      code: 'TOTAL_ERROR'
    })
  }
  
  // Business rule warnings
  if (invoice.type === 'FACTURA' && !invoice.paymentMethod) {
    warnings.push({
      field: 'paymentMethod',
      message: 'Metoda de plată nu este specificată'
    })
  }
  
  if (invoice.total > 10000 && invoice.customer && 'cnp' in invoice.customer) {
    warnings.push({
      field: 'customer',
      message: 'Factură mare pentru persoană fizică - verificați datele'
    })
  }
  
  if (invoice.dueDate > new Date(invoice.date.getTime() + 90 * 24 * 60 * 60 * 1000)) {
    warnings.push({
      field: 'dueDate',
      message: 'Termen de plată mai mare de 90 zile'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Main validation function
export async function validateInvoice(invoice: Invoice): Promise<ValidationResult> {
  try {
    // Schema validation
    const { error } = invoiceSchema.validate(invoice, { 
      abortEarly: false,
      allowUnknown: false 
    })
    
    if (error) {
      return {
        valid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: detail.type
        }))
      }
    }
    
    // Business rules validation
    return validateBusinessRules(invoice)
    
  } catch (err) {
    return {
      valid: false,
      errors: [{
        field: 'general',
        message: err instanceof Error ? err.message : 'Eroare necunoscută',
        code: 'VALIDATION_ERROR'
      }]
    }
  }
}

// Utility functions
export function isCompany(customer: CompanyDetails | PersonDetails): customer is CompanyDetails {
  return 'cif' in customer
}

export function isPerson(customer: CompanyDetails | PersonDetails): customer is PersonDetails {
  return !('cif' in customer)
}

export function formatInvoiceNumber(series: string, number: number): string {
  return `${series}${number.toString().padStart(6, '0')}`
}

export function parseInvoiceNumber(invoiceNumber: string): { series: string, number: number } {
  const match = invoiceNumber.match(/^([A-Z]+)(\d+)$/)
  if (!match) {
    throw new Error('Format număr factură invalid')
  }
  return {
    series: match[1],
    number: parseInt(match[2])
  }
}