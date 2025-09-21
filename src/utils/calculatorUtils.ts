import type {
  CalculationInput,
  CalculationResult,
  RoomDimensions,
  WallDimensions,
  ProductCalculatorType,
  AdditionalMaterial
} from '../types/calculator'

import { MATERIAL_CONSUMPTION_RATES } from '../types/calculator'

// Force module refresh
/**
 * Calculate floor area for tiles or flooring
 */
export function calculateFloorArea(dimensions: RoomDimensions): number {
  return dimensions.length * dimensions.width
}

/**
 * Calculate wall area for wall tiles
 */
export function calculateWallArea(wallDimensions: WallDimensions): number {
  let totalArea = 0
  
  for (const wall of wallDimensions.walls) {
    let wallArea = wall.length * wall.height
    
    // Subtract openings (doors, windows)
    if (wall.openings) {
      for (const opening of wall.openings) {
        wallArea -= opening.width * opening.height
      }
    }
    
    totalArea += wallArea
  }
  
  return totalArea
}

/**
 * Apply wastage percentage to base area
 */
export function applyWastage(baseArea: number, wastagePercentage: number): number {
  return baseArea * (1 + wastagePercentage / 100)
}

/**
 * Calculate number of boxes needed
 */
export function calculateBoxesNeeded(
  totalArea: number, 
  coveragePerBox: number
): number {
  return Math.ceil(totalArea / coveragePerBox)
}

/**
 * Calculate number of pieces needed (for tiles)
 */
export function calculatePiecesNeeded(
  totalArea: number,
  tileWidth: number, // in cm
  tileHeight: number // in cm
): number {
  const tileAreaInM2 = (tileWidth * tileHeight) / 10000 // Convert cm² to m²
  return Math.ceil(totalArea / tileAreaInM2)
}

/**
 * Calculate perimeter for skirting/plinte
 */
export function calculatePerimeter(dimensions: RoomDimensions): number {
  return 2 * (dimensions.length + dimensions.width)
}

/**
 * Calculate skirting needed with doors subtracted
 */
export function calculateSkirtingLength(
  perimeter: number,
  doorWidths: number[] = [],
  wastagePercentage: number = 5
): number {
  const totalDoorWidth = doorWidths.reduce((sum, width) => sum + width, 0)
  const netPerimeter = perimeter - totalDoorWidth
  return netPerimeter * (1 + wastagePercentage / 100)
}

/**
 * Calculate adhesive bags needed
 */
export function calculateAdhesive(area: number): AdditionalMaterial {
  const { coveragePerUnit } = MATERIAL_CONSUMPTION_RATES.adhesive
  const bagsNeeded = Math.ceil(area / coveragePerUnit)
  
  return {
    name: MATERIAL_CONSUMPTION_RATES.adhesive.name,
    quantity: bagsNeeded,
    unit: MATERIAL_CONSUMPTION_RATES.adhesive.unit
  }
}

/**
 * Calculate grout needed
 */
export function calculateGrout(area: number): AdditionalMaterial {
  const { coveragePerUnit } = MATERIAL_CONSUMPTION_RATES.grout
  const boxesNeeded = Math.ceil(area / coveragePerUnit)
  
  return {
    name: MATERIAL_CONSUMPTION_RATES.grout.name,
    quantity: boxesNeeded,
    unit: MATERIAL_CONSUMPTION_RATES.grout.unit
  }
}

/**
 * Calculate spacers needed
 */
export function calculateSpacers(area: number): AdditionalMaterial {
  const { piecesPerSqm } = MATERIAL_CONSUMPTION_RATES.spacers
  const totalSpacers = area * piecesPerSqm
  const packetsNeeded = Math.ceil(totalSpacers / 100) // 100 pieces per packet
  
  return {
    name: MATERIAL_CONSUMPTION_RATES.spacers.name,
    quantity: packetsNeeded,
    unit: MATERIAL_CONSUMPTION_RATES.spacers.unit
  }
}

/**
 * Calculate underlayment for flooring
 */
export function calculateUnderlayment(area: number): AdditionalMaterial {
  const { coveragePerUnit } = MATERIAL_CONSUMPTION_RATES.underlayment
  const rollsNeeded = Math.ceil(area / coveragePerUnit)
  
  return {
    name: MATERIAL_CONSUMPTION_RATES.underlayment.name,
    quantity: rollsNeeded,
    unit: MATERIAL_CONSUMPTION_RATES.underlayment.unit
  }
}

/**
 * Calculate skirting boards
 */
export function calculateSkirtingBoards(
  length: number
): AdditionalMaterial {
  const { lengthPerUnit } = MATERIAL_CONSUMPTION_RATES.skirting
  const piecesNeeded = Math.ceil(length / lengthPerUnit)
  
  return {
    name: MATERIAL_CONSUMPTION_RATES.skirting.name,
    quantity: piecesNeeded,
    unit: MATERIAL_CONSUMPTION_RATES.skirting.unit
  }
}

/**
 * Main calculator function for GRESIE (floor tiles)
 */
export function calculateGresie(input: CalculationInput): CalculationResult {
  if (!input.roomDimensions) {
    throw new Error('Room dimensions required for gresie calculation')
  }
  
  const baseArea = calculateFloorArea(input.roomDimensions)
  const totalArea = applyWastage(baseArea, input.wastagePercentage)
  const wastageArea = totalArea - baseArea
  const boxesNeeded = calculateBoxesNeeded(totalArea, input.productSpecs.coveragePerBox)
  
  // Calculate pieces if tile dimensions provided
  let piecesNeeded: number | undefined
  if (input.productSpecs.tileWidth && input.productSpecs.tileHeight) {
    piecesNeeded = calculatePiecesNeeded(
      totalArea,
      input.productSpecs.tileWidth,
      input.productSpecs.tileHeight
    )
  }
  
  // Additional materials
  const additionalMaterials: AdditionalMaterial[] = [
    calculateAdhesive(baseArea),
    calculateGrout(baseArea),
    calculateSpacers(baseArea)
  ]
  
  return {
    baseArea,
    totalArea,
    wastageArea,
    boxesNeeded,
    piecesNeeded,
    additionalMaterials,
    calculationType: 'gresie',
    wastagePercentage: input.wastagePercentage,
    timestamp: new Date(),
    recommendations: [
      `Recomandăm păstrarea a 1-2 cutii suplimentare pentru reparații viitoare`,
      `Verificați că toate cutiile sunt din același lot pentru uniformitate`,
      input.installationType === 'diagonal' 
        ? 'Montajul diagonal necesită mai mult material de rezervă'
        : ''
    ].filter(Boolean)
  }
}

/**
 * Main calculator function for FAIANTA (wall tiles)
 */
export function calculateFaianta(input: CalculationInput): CalculationResult {
  if (!input.wallDimensions) {
    throw new Error('Wall dimensions required for faianta calculation')
  }
  
  const baseArea = calculateWallArea(input.wallDimensions)
  const totalArea = applyWastage(baseArea, input.wastagePercentage)
  const wastageArea = totalArea - baseArea
  const boxesNeeded = calculateBoxesNeeded(totalArea, input.productSpecs.coveragePerBox)
  
  // Calculate pieces if tile dimensions provided
  let piecesNeeded: number | undefined
  if (input.productSpecs.tileWidth && input.productSpecs.tileHeight) {
    piecesNeeded = calculatePiecesNeeded(
      totalArea,
      input.productSpecs.tileWidth,
      input.productSpecs.tileHeight
    )
  }
  
  // Additional materials
  const additionalMaterials: AdditionalMaterial[] = [
    calculateAdhesive(baseArea),
    calculateGrout(baseArea),
    calculateSpacers(baseArea)
  ]
  
  return {
    baseArea,
    totalArea,
    wastageArea,
    boxesNeeded,
    piecesNeeded,
    additionalMaterials,
    calculationType: 'faianta',
    wastagePercentage: input.wastagePercentage,
    timestamp: new Date(),
    recommendations: [
      `Pentru băi și bucătării, asigurați-vă că faianța este rezistentă la umiditate`,
      `Amestecați plăcile din cutii diferite pentru uniformitate`,
      input.complexity === 'complex'
        ? 'Zonele cu multe decupaje necesită material suplimentar'
        : ''
    ].filter(Boolean)
  }
}

/**
 * Main calculator function for PARCHET (laminate flooring)
 */
export function calculateParchet(input: CalculationInput): CalculationResult {
  if (!input.roomDimensions) {
    throw new Error('Room dimensions required for parchet calculation')
  }
  
  const baseArea = calculateFloorArea(input.roomDimensions)
  const totalArea = applyWastage(baseArea, input.wastagePercentage)
  const wastageArea = totalArea - baseArea
  const boxesNeeded = calculateBoxesNeeded(totalArea, input.productSpecs.coveragePerBox)
  
  // Additional materials
  const additionalMaterials: AdditionalMaterial[] = [
    calculateUnderlayment(baseArea)
  ]
  
  // Calculate skirting if room dimensions provided
  if (input.roomDimensions) {
    const perimeter = calculatePerimeter(input.roomDimensions)
    const skirtingLength = calculateSkirtingLength(perimeter, [0.9]) // Assume 1 door of 0.9m
    additionalMaterials.push(calculateSkirtingBoards(skirtingLength))
  }
  
  return {
    baseArea,
    totalArea,
    wastageArea,
    boxesNeeded,
    additionalMaterials,
    calculationType: 'parchet',
    wastagePercentage: input.wastagePercentage,
    timestamp: new Date(),
    recommendations: [
      `Lăsați parchetul să se aclimatizeze 48h înainte de montaj`,
      `Păstrați 1 pachet pentru reparații viitoare`,
      input.wastagePercentage === 5
        ? 'Montaj profesionist - pierderi minime'
        : 'Montaj DIY - rezervă suplimentară inclusă'
    ].filter(Boolean)
  }
}

/**
 * Main calculator function for RIFLAJE (decorative trim)
 */
export function calculateRiflaje(input: CalculationInput): CalculationResult {
  // For riflaje, we typically calculate based on linear meters or pieces
  // This is a simplified version - can be expanded based on specific needs
  
  let baseArea = 0
  let totalNeeded = 0
  
  // If calculating for perimeter (most common for riflaje)
  if (input.roomDimensions) {
    const perimeter = calculatePerimeter(input.roomDimensions)
    baseArea = perimeter // Using perimeter as "area" for linear calculations
    totalNeeded = applyWastage(perimeter, input.wastagePercentage)
  }
  
  const boxesNeeded = Math.ceil(totalNeeded / input.productSpecs.coveragePerBox)
  const wastageArea = totalNeeded - baseArea
  
  return {
    baseArea,
    totalArea: totalNeeded,
    wastageArea,
    boxesNeeded,
    calculationType: 'riflaje',
    wastagePercentage: input.wastagePercentage,
    timestamp: new Date(),
    recommendations: [
      `Riflajele decorative necesită tăieturi precise`,
      `Verificați compatibilitatea cu plăcile principale`
    ]
  }
}

/**
 * Main calculator dispatcher
 */
export function calculateProductNeeds(input: CalculationInput): CalculationResult {
  switch (input.calculatorType) {
    case 'gresie':
      return calculateGresie(input)
    case 'faianta':
      return calculateFaianta(input)
    case 'parchet':
      return calculateParchet(input)
    case 'riflaje':
      return calculateRiflaje(input)
    default:
      throw new Error(`Unknown calculator type: ${input.calculatorType}`)
  }
}

/**
 * Format area for display
 */
export function formatArea(area: number): string {
  return `${area.toFixed(2)} m²`
}


/**
 * Get calculator title
 */
export function getCalculatorTitle(type: ProductCalculatorType): string {
  const titles: Record<ProductCalculatorType, string> = {
    gresie: 'Calculator Gresie',
    faianta: 'Calculator Faianță',
    parchet: 'Calculator Parchet',
    riflaje: 'Calculator Riflaje'
  }
  return titles[type]
}

/**
 * Get calculator description
 */
export function getCalculatorDescription(type: ProductCalculatorType): string {
  const descriptions: Record<ProductCalculatorType, string> = {
    gresie: 'Calculează necesarul de gresie pentru pardoseală',
    faianta: 'Calculează necesarul de faianță pentru pereți',
    parchet: 'Calculează necesarul de parchet laminat și plinte',
    riflaje: 'Calculează necesarul de riflaje decorative'
  }
  return descriptions[type]
}