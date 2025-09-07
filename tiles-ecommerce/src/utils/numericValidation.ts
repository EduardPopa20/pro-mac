/**
 * Numeric Validation Utilities for Admin Product Forms
 * 
 * Prevents negative values and 'e' character input in numeric fields
 * Used across all product types (Faianta, Gresie, Parchet, Riflaje)
 */

export interface ValidationResult {
  isValid: boolean
  sanitizedValue: string
  errorMessage?: string
}

/**
 * List of numeric fields that require validation across all product types
 */
export const NUMERIC_FIELDS = [
  // Physical properties
  'thickness',
  'weight_per_box',
  'area_per_box',
  'tiles_per_box',
  'tiles_per_sqm',
  
  // Pricing fields
  'price',
  'standard_price',
  'special_price',
  'cost_price',
  
  // Inventory fields
  'stock_quantity',
  'estimated_delivery_days',
  'minimum_order_quantity',
  'reorder_level',
  
  // Product-specific numeric fields
  'plank_length',      // Parchet
  'plank_width',       // Parchet
  'board_thickness',   // Parchet
  'pieces_per_pack',   // Parchet
  'coverage_per_pack', // Parchet
  'installation_width', // Riflaje
  'installation_length', // Riflaje
  'linear_meters_per_box' // Riflaje
]

/**
 * Validates and sanitizes numeric input
 * 
 * Rules:
 * 1. No negative values allowed
 * 2. No 'e' character allowed (scientific notation)
 * 3. Allow decimal numbers with dot separator
 * 4. Allow empty string (for optional fields)
 * 
 * @param value - The input value to validate
 * @param fieldName - Name of the field for error messages
 * @param allowEmpty - Whether empty values are allowed (default: true)
 * @returns ValidationResult object
 */
export const validateNumericField = (
  value: string, 
  fieldName: string, 
  allowEmpty: boolean = true
): ValidationResult => {
  // Allow empty values if permitted
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: allowEmpty,
      sanitizedValue: '',
      errorMessage: allowEmpty ? undefined : `${fieldName} este obligatoriu`
    }
  }

  const stringValue = String(value).trim()

  // Check for 'e' character (scientific notation)
  if (stringValue.toLowerCase().includes('e')) {
    return {
      isValid: false,
      sanitizedValue: stringValue.replace(/[eE]/g, ''),
      errorMessage: `${fieldName} nu poate conține caracterul 'e'`
    }
  }

  // Check for negative values
  if (stringValue.startsWith('-')) {
    return {
      isValid: false,
      sanitizedValue: stringValue.replace('-', ''),
      errorMessage: `${fieldName} nu poate fi negativ`
    }
  }

  // Validate numeric format
  const numericValue = parseFloat(stringValue)
  if (isNaN(numericValue) && stringValue !== '') {
    return {
      isValid: false,
      sanitizedValue: stringValue.replace(/[^0-9.]/g, ''),
      errorMessage: `${fieldName} trebuie să fie un număr valid`
    }
  }

  // Check if the number is negative (edge case after parsing)
  if (numericValue < 0) {
    return {
      isValid: false,
      sanitizedValue: Math.abs(numericValue).toString(),
      errorMessage: `${fieldName} nu poate fi negativ`
    }
  }

  return {
    isValid: true,
    sanitizedValue: stringValue,
    errorMessage: undefined
  }
}

/**
 * Enhanced input filter for real-time validation
 * Prevents invalid characters from being typed
 * 
 * @param event - Keyboard event
 * @returns boolean - whether the key press should be allowed
 */
export const filterNumericInput = (event: KeyboardEvent): boolean => {
  const key = event.key
  const target = event.target as HTMLInputElement
  const currentValue = target.value

  // Allow control keys (backspace, delete, arrows, tab, etc.)
  if ([
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End', 'Tab', 'Escape', 'Enter'
  ].includes(key)) {
    return true
  }

  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) {
    return true
  }

  // Block 'e' and 'E' (scientific notation)
  if (key.toLowerCase() === 'e') {
    return false
  }

  // Block minus sign (negative numbers)
  if (key === '-') {
    return false
  }

  // Allow digits 0-9
  if (key >= '0' && key <= '9') {
    return true
  }

  // Allow decimal point (only one)
  if (key === '.' && !currentValue.includes('.')) {
    return true
  }

  // Block all other keys
  return false
}

/**
 * Get user-friendly field name for error messages
 */
export const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    'thickness': 'Grosime',
    'weight_per_box': 'Greutate per cutie',
    'area_per_box': 'Suprafață per cutie',
    'tiles_per_box': 'Plăci per cutie',
    'tiles_per_sqm': 'Plăci per m²',
    'price': 'Preț curent',
    'standard_price': 'Preț standard',
    'special_price': 'Preț special',
    'cost_price': 'Preț cost',
    'stock_quantity': 'Stoc disponibil',
    'estimated_delivery_days': 'Timp livrare',
    'minimum_order_quantity': 'Cantitate minimă comandă',
    'reorder_level': 'Nivel reaprovizionare',
    'plank_length': 'Lungime planșă',
    'plank_width': 'Lățime planșă',
    'board_thickness': 'Grosime planșă',
    'pieces_per_pack': 'Bucăți per pachet',
    'coverage_per_pack': 'Suprafață per pachet',
    'installation_width': 'Lățime instalare',
    'installation_length': 'Lungime instalare',
    'linear_meters_per_box': 'Metri liniari per cutie'
  }

  return fieldNames[fieldName] || fieldName
}

/**
 * Validate multiple numeric fields at once
 * Useful for form validation before submission
 */
export const validateNumericFields = (
  formData: Record<string, any>,
  requiredFields: string[] = []
): Record<string, string> => {
  const errors: Record<string, string> = {}

  Object.keys(formData).forEach(fieldName => {
    if (NUMERIC_FIELDS.includes(fieldName)) {
      const isRequired = requiredFields.includes(fieldName)
      const validation = validateNumericField(
        formData[fieldName],
        getFieldDisplayName(fieldName),
        !isRequired
      )

      if (!validation.isValid && validation.errorMessage) {
        errors[fieldName] = validation.errorMessage
      }
    }
  })

  return errors
}