// Feature flags for enabling/disabling e-commerce functionality
// Set VITE_ECOMMERCE_ENABLED=false in .env to convert to presentation-only site

export const FEATURES = {
  // Main e-commerce toggle
  ECOMMERCE_ENABLED: import.meta.env.VITE_ECOMMERCE_ENABLED !== 'false',

  // Individual feature controls
  SHOW_PRICES: import.meta.env.VITE_SHOW_PRICES !== 'false',
  SHOW_STOCK: import.meta.env.VITE_SHOW_STOCK !== 'false',
  SHOW_CART: import.meta.env.VITE_SHOW_CART !== 'false',
  ENABLE_CHECKOUT: import.meta.env.VITE_ENABLE_CHECKOUT !== 'false',

  // Alternative CTA when e-commerce is disabled
  QUOTE_REQUEST_ENABLED: import.meta.env.VITE_QUOTE_REQUEST_ENABLED === 'true'
} as const

// Helper to check if we're in presentation mode
export const isPresentationMode = () => !FEATURES.ECOMMERCE_ENABLED

// Default messages for presentation mode
export const PRESENTATION_MESSAGES = {
  PRICE_REQUEST: '', // Removed price request text as requested
  STOCK_REQUEST: 'Disponibilitate la cerere',
  ADD_TO_CART_ALTERNATIVE: 'Solicită ofertă',
  COMING_SOON: 'Funcționalitate disponibilă în curând',
  CONTACT_FOR_ORDER: 'Pentru comenzi, contactați-ne direct'
} as const