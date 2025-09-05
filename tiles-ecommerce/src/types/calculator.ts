// Types for product calculators based on the PDF analysis
// Force module refresh

export type ProductCalculatorType = 'gresie' | 'faianta' | 'parchet' | 'riflaje'

export interface WastageOption {
  label: string
  value: number
  description: string
  recommended?: boolean
}

export interface RoomDimensions {
  length: number
  width: number
  height?: number // For wall calculations
}

export interface WallDimensions {
  walls: Array<{
    id: string
    length: number
    height: number
    openings?: Array<{
      type: 'door' | 'window'
      width: number
      height: number
    }>
  }>
}

export interface ProductSpecifications {
  // Common specs
  coveragePerBox: number // m² or linear meters per box
  piecesPerBox?: number
  
  // Tile specific
  tileWidth?: number // in cm
  tileHeight?: number // in cm
  
  // Flooring specific
  plankLength?: number // in cm
  plankWidth?: number // in cm
  
  // Trim specific
  pieceLength?: number // in meters
}

export interface CalculationInput {
  calculatorType: ProductCalculatorType
  roomDimensions?: RoomDimensions
  wallDimensions?: WallDimensions
  productSpecs: ProductSpecifications
  wastagePercentage: number
  installationType?: 'standard' | 'diagonal' | 'pattern'
  complexity?: 'simple' | 'moderate' | 'complex'
}

// Additional material interface for calculations
export interface AdditionalMaterial {
  name: string
  quantity: number
  unit: string
}

export interface CalculationResult {
  // Main calculations
  baseArea: number // Area without wastage
  totalArea: number // Area with wastage
  wastageArea: number // Amount of wastage
  boxesNeeded: number // Number of product boxes
  piecesNeeded?: number // Number of individual pieces
  
  // Additional materials
  additionalMaterials?: AdditionalMaterial[]
  
  // Metadata
  calculationType: ProductCalculatorType
  wastagePercentage: number
  timestamp: Date
  
  // Recommendations
  recommendations?: string[]
}

// Specific calculator configs
export interface GresieCalculatorConfig {
  type: 'gresie'
  defaultWastage: 10
  wastageOptions: WastageOption[]
  includeAdhesive: boolean
  includeGrout: boolean
  includeSpacers: boolean
}

export interface FaiantaCalculatorConfig {
  type: 'faianta'
  defaultWastage: 10
  wastageOptions: WastageOption[]
  includeAdhesive: boolean
  includeGrout: boolean
  includeSpacers: boolean
  includeProfiles: boolean
}

export interface ParchetCalculatorConfig {
  type: 'parchet'
  defaultWastage: 10
  wastageOptions: WastageOption[]
  includeUnderlayment: boolean
  includeSkirting: boolean // Plinte
  includeTransitionProfiles: boolean
}

export interface RiflajeCalculatorConfig {
  type: 'riflaje'
  defaultWastage: 5
  wastageOptions: WastageOption[]
  calculationMode: 'linear' | 'pieces'
}

export type CalculatorConfig = 
  | GresieCalculatorConfig 
  | FaiantaCalculatorConfig 
  | ParchetCalculatorConfig 
  | RiflajeCalculatorConfig

// Predefined wastage recommendations based on PDF
export const WASTAGE_OPTIONS: Record<ProductCalculatorType, WastageOption[]> = {
  gresie: [
    { 
      label: '10% - Camere simple', 
      value: 10, 
      description: 'Pentru camere dreptunghiulare cu montaj standard',
      recommended: true 
    },
    { 
      label: '15% - Montaj diagonal/Complex', 
      value: 15, 
      description: 'Pentru montaj diagonal sau camere cu multe colțuri' 
    }
  ],
  faianta: [
    { 
      label: '10% - Pereți simpli', 
      value: 10, 
      description: 'Pentru pereți drepți cu puține decupaje',
      recommended: true 
    },
    { 
      label: '15% - Multe decupaje', 
      value: 15, 
      description: 'Pentru zone cu multe ferestre, uși, nișe' 
    }
  ],
  parchet: [
    { 
      label: '5% - Montaj profesionist', 
      value: 5, 
      description: 'Când montajul este făcut de un specialist' 
    },
    { 
      label: '10% - Montaj DIY', 
      value: 10, 
      description: 'Pentru montaj în regie proprie',
      recommended: true 
    }
  ],
  riflaje: [
    { 
      label: '5% - Standard', 
      value: 5, 
      description: 'Pierderi minime pentru tăieturi',
      recommended: true 
    },
    { 
      label: '10% - Modele complexe', 
      value: 10, 
      description: 'Pentru modele cu îmbinări complexe' 
    }
  ]
}

// Material consumption rates (from PDF)
export const MATERIAL_CONSUMPTION_RATES = {
  adhesive: {
    name: 'Adeziv',
    unit: 'sac 25kg',
    coveragePerUnit: 5 // m² per 25kg bag (average)
  },
  grout: {
    name: 'Chit de rosturi',
    unit: 'cutie 5kg',
    coveragePerUnit: 15 // m² per 5kg box (average for 2mm joints)
  },
  spacers: {
    name: 'Distanțieri',
    unit: 'pachet 100 buc',
    piecesPerSqm: 10 // spacers per m²
  },
  underlayment: {
    name: 'Folie izolatoare',
    unit: 'rolă 10m²',
    coveragePerUnit: 10
  },
  skirting: {
    name: 'Plinte',
    unit: 'bucată 2.5m',
    lengthPerUnit: 2.5
  }
}