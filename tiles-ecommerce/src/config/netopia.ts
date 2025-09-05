/**
 * Netopia Payment Gateway Configuration
 * Documentație: https://github.com/mobilpay/NETOPIA-Payments-Nodejs
 */

interface NetopiaConfig {
  // Environment
  isProduction: boolean
  
  // URLs
  paymentUrl: string
  apiUrl: string
  
  // Merchant Credentials
  merchantId: string
  merchantKey: string
  
  // Certificates (for production)
  publicCertPath?: string
  privateCertPath?: string
  
  // Callback URLs
  confirmUrl: string
  returnUrl: string
  
  // Settings
  currency: string
  language: string
  defaultPaymentMethod: 'card' | 'bank_transfer'
  
  // Timeouts
  sessionTimeout: number // minutes
  requestTimeout: number // seconds
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback
}

const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Base URLs
const SANDBOX_PAYMENT_URL = 'https://sandboxsecure.mobilpay.ro'
const PRODUCTION_PAYMENT_URL = 'https://secure.mobilpay.ro'

const SANDBOX_API_URL = 'https://sandbox.netopia-payments.com/api'
const PRODUCTION_API_URL = 'https://secure.netopia-payments.com/api'

// Application base URL
const APP_BASE_URL = getEnvVar('VITE_APP_BASE_URL', 
  isDevelopment ? 'http://localhost:5173' : 'https://promac.ro'
)

export const netopiaConfig: NetopiaConfig = {
  // Environment
  isProduction,
  
  // URLs - Use sandbox in development, production URLs in production
  paymentUrl: isProduction ? PRODUCTION_PAYMENT_URL : SANDBOX_PAYMENT_URL,
  apiUrl: isProduction ? PRODUCTION_API_URL : SANDBOX_API_URL,
  
  // Merchant Credentials from environment
  merchantId: getEnvVar('VITE_NETOPIA_MERCHANT_ID', 'NETOPIA_TEST'),
  merchantKey: getEnvVar('VITE_NETOPIA_MERCHANT_KEY', ''),
  
  // Certificates (only for production)
  publicCertPath: isProduction ? getEnvVar('VITE_NETOPIA_PUBLIC_CERT') : undefined,
  privateCertPath: isProduction ? getEnvVar('VITE_NETOPIA_PRIVATE_CERT') : undefined,
  
  // Callback URLs
  confirmUrl: `${APP_BASE_URL}/api/payment/confirm`, // IPN URL pentru confirmare server-side
  returnUrl: `${APP_BASE_URL}/payment/return`, // URL pentru redirect client după plată
  
  // Settings
  currency: 'RON',
  language: 'RO',
  defaultPaymentMethod: 'card',
  
  // Timeouts
  sessionTimeout: 15, // 15 minutes payment session
  requestTimeout: 30, // 30 seconds API timeout
}

// Payment methods configuration
export const PAYMENT_METHODS = {
  card: {
    id: 'card',
    name: 'Card Bancar',
    description: 'Plată securizată cu cardul',
    icon: 'CreditCard',
    enabled: true,
    fee: 0, // No additional fee
  },
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Transfer Bancar',
    description: 'Transfer bancar direct',
    icon: 'AccountBalance',
    enabled: false, // Disable for now
    fee: 0,
  },
  cash_on_delivery: {
    id: 'cash_on_delivery',
    name: 'Ramburs',
    description: 'Plată la livrare',
    icon: 'LocalShipping',
    enabled: false, // Disable for now
    fee: 1500, // 15 RON fee (in bani)
  },
} as const

// Error codes mapping
export const NETOPIA_ERROR_CODES: Record<string, string> = {
  '0': 'Tranzacție aprobată',
  '16': 'Tranzacție aprobată - Actualizare',
  '17': 'Tranzacție anulată',
  '18': 'Tranzacție rambursată',
  '19': 'Tranzacție parțial rambursată',
  '20': 'Tranzacție în așteptare',
  '21': 'Tranzacție în curs de procesare',
  '34': 'Card expirat',
  '35': 'Card furat',
  '36': 'Card blocat',
  '37': 'Card invalid',
  '38': 'Fonduri insuficiente',
  '48': 'Eroare de procesare',
  '49': 'Limită depășită',
  '50': 'CVV invalid',
  '51': 'Tranzacție duplicată',
  '52': 'Sesiune expirată',
  '53': 'Tranzacție respinsă',
  '54': 'Date invalide',
  '99': 'Eroare generală',
}

// Status mapping for our system
export const mapNetopiaStatus = (netopiaCode: string): string => {
  const statusMap: Record<string, string> = {
    '0': 'confirmed',
    '16': 'confirmed',
    '17': 'cancelled',
    '18': 'refunded',
    '19': 'partially_refunded',
    '20': 'pending',
    '21': 'processing',
  }
  
  return statusMap[netopiaCode] || 'failed'
}

// Validation helpers
export const validateMerchantConfig = (): boolean => {
  // For development, allow testing without real credentials
  if (isDevelopment) {
    console.log('Netopia: Development mode - using test credentials')
    return true
  }
  
  if (!netopiaConfig.merchantId || !netopiaConfig.merchantKey) {
    console.error('Netopia: Missing merchant credentials')
    return false
  }
  
  if (isProduction && (!netopiaConfig.publicCertPath || !netopiaConfig.privateCertPath)) {
    console.error('Netopia: Missing certificates for production')
    return false
  }
  
  return true
}

// Format amount for Netopia (RON to bani)
export const formatAmountForNetopia = (amountInRon: number): number => {
  return Math.round(amountInRon * 100)
}

// Parse amount from Netopia (bani to RON)
export const parseAmountFromNetopia = (amountInBani: number): number => {
  return amountInBani / 100
}

// Generate unique order reference
export const generateOrderReference = (orderId: string): string => {
  const timestamp = Date.now().toString(36)
  return `${orderId}-${timestamp}`.toUpperCase()
}

// Sandbox test cards
export const SANDBOX_TEST_CARDS = {
  success: {
    number: '4111111111111111',
    cvv: '123',
    expiry: '12/25',
    description: 'Card de test - Plată aprobată',
  },
  insufficient_funds: {
    number: '4111111111111112',
    cvv: '123',
    expiry: '12/25',
    description: 'Card de test - Fonduri insuficiente',
  },
  expired: {
    number: '4111111111111113',
    cvv: '123',
    expiry: '12/20',
    description: 'Card de test - Card expirat',
  },
  cvv_error: {
    number: '4111111111111114',
    cvv: '999',
    expiry: '12/25',
    description: 'Card de test - CVV invalid',
  },
} as const

// Export types
export type PaymentMethodId = keyof typeof PAYMENT_METHODS
export type NetopiaErrorCode = keyof typeof NETOPIA_ERROR_CODES

// Debug logging (only in development)
if (isDevelopment) {
  console.log('Netopia Config:', {
    paymentUrl: netopiaConfig.paymentUrl,
    apiUrl: netopiaConfig.apiUrl,
    merchantId: netopiaConfig.merchantId,
    hasKey: !!netopiaConfig.merchantKey,
    confirmUrl: netopiaConfig.confirmUrl,
    returnUrl: netopiaConfig.returnUrl,
  })
}