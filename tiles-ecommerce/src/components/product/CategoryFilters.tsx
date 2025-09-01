import type { FilterOption } from './ProductFilter'
import type { Product } from '../../types'

// Get all unique filter values from ALL products (not filtered)
const getAllFilterOptions = (
  allProducts: Product[],
  field: keyof Product,
  extractor: typeof extractFilterOptions | typeof extractBooleanOptions | typeof extractNumericRangeOptions | typeof extractArrayOptions = extractFilterOptions
): Array<{ value: string; label: string }> => {
  // Use ALL products to get options, remove counts since they're misleading when not filtered
  const options = extractor(allProducts, field)
  // Remove count from options to avoid confusion
  return options.map(opt => ({ value: opt.value, label: opt.label }))
}

// Helper function to extract unique values from products with counts
const extractFilterOptions = (
  products: Product[],
  field: keyof Product
): Array<{ value: string; label: string; count: number }> => {
  const valueCount = new Map<string, number>()
  
  products.forEach(product => {
    const value = product[field]
    if (value && typeof value === 'string' && value.trim()) {
      const trimmedValue = value.trim()
      valueCount.set(trimmedValue, (valueCount.get(trimmedValue) || 0) + 1)
    }
  })
  
  return Array.from(valueCount.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'ro'))
    .map(([value, count]) => ({
      value,
      label: value,
      count
    }))
}

// Helper function for boolean filters (technical capabilities)
const extractBooleanOptions = (
  products: Product[],
  field: keyof Product
): Array<{ value: string; label: string; count: number }> => {
  const trueCount = products.filter(p => p[field] === true).length
  const falseCount = products.filter(p => p[field] === false).length
  
  const options = []
  if (trueCount > 0) {
    options.push({ value: 'true', label: 'Da', count: trueCount })
  }
  if (falseCount > 0) {
    options.push({ value: 'false', label: 'Nu', count: falseCount })
  }
  
  return options
}

// Helper function for numeric ranges (like thickness, quality grade)
const extractNumericRangeOptions = (
  products: Product[],
  field: keyof Product
): Array<{ value: string; label: string; count: number }> => {
  const valueCount = new Map<string, number>()
  
  products.forEach(product => {
    const value = product[field]
    if (value && typeof value === 'number') {
      const stringValue = value.toString()
      valueCount.set(stringValue, (valueCount.get(stringValue) || 0) + 1)
    }
  })
  
  return Array.from(valueCount.entries())
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .map(([value, count]) => ({
      value,
      label: value,
      count
    }))
}

// Helper function for JSON array fields (like application_areas)
const extractArrayOptions = (
  products: Product[],
  field: keyof Product
): Array<{ value: string; label: string; count: number }> => {
  const valueCount = new Map<string, number>()
  
  products.forEach(product => {
    const value = product[field]
    if (value && Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'string' && item.trim()) {
          const trimmedValue = item.trim()
          valueCount.set(trimmedValue, (valueCount.get(trimmedValue) || 0) + 1)
        }
      })
    }
  })
  
  return Array.from(valueCount.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'ro'))
    .map(([value, count]) => ({
      value,
      label: value,
      count
    }))
}

// Enhanced filter configuration for Faianță (ceramic wall tiles)
// Uses ALL products to show all available options
export const getFaiantaFilters = (allProducts: Product[]): FilterOption[] => {
  const filters: FilterOption[] = []

  // Core properties (always show all available options)
  const dimensionsOptions = getAllFilterOptions(allProducts, 'dimensions')
  if (dimensionsOptions.length > 0) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  const finishOptions = getAllFilterOptions(allProducts, 'finish')
  const surfaceFinishOptions = getAllFilterOptions(allProducts, 'surface_finish')
  
  // Combine finish and surface_finish options
  if (finishOptions.length > 0 || surfaceFinishOptions.length > 0) {
    const combinedFinish = [...finishOptions, ...surfaceFinishOptions]
    const uniqueFinish = Array.from(
      new Map(combinedFinish.map(item => [item.value, item])).values()
    )
    
    if (uniqueFinish.length > 0) {
      filters.push({
        id: 'finish',
        label: 'Finisaj suprafață',
        type: 'multiselect',
        options: uniqueFinish
      })
    }
  }

  // Brand & Quality
  const brandOptions = getAllFilterOptions(allProducts, 'brand')
  if (brandOptions.length > 0) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  const qualityGradeOptions = getAllFilterOptions(allProducts, 'quality_grade', extractNumericRangeOptions)
  if (qualityGradeOptions.length > 0) {
    filters.push({
      id: 'quality_grade',
      label: 'Grad calitate',
      type: 'multiselect',
      options: qualityGradeOptions.map(opt => ({
        ...opt,
        label: `Grad ${opt.value}${opt.value === '1' ? ' (Premium)' : opt.value === '2' ? ' (Standard)' : ' (Economic)'}`
      }))
    })
  }

  // Technical specifications
  const thicknessOptions = getAllFilterOptions(allProducts, 'thickness', extractNumericRangeOptions)
  if (thicknessOptions.length > 0) {
    filters.push({
      id: 'thickness',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  const textureOptions = getAllFilterOptions(allProducts, 'texture')
  if (textureOptions.length > 0) {
    filters.push({
      id: 'texture',
      label: 'Textură',
      type: 'multiselect',
      options: textureOptions
    })
  }

  const materialOptions = getAllFilterOptions(allProducts, 'material')
  if (materialOptions.length > 0) {
    filters.push({
      id: 'material',
      label: 'Material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  const originCountryOptions = getAllFilterOptions(allProducts, 'origin_country')
  if (originCountryOptions.length > 0) {
    filters.push({
      id: 'origin_country',
      label: 'Țară origine',
      type: 'multiselect',
      options: originCountryOptions
    })
  }

  // Technical capabilities (especially important for bathroom tiles)
  const frostResistantOptions = getAllFilterOptions(allProducts, 'is_frost_resistant', extractBooleanOptions)
  if (frostResistantOptions.length > 0) {
    filters.push({
      id: 'is_frost_resistant',
      label: 'Rezistent la îngheț',
      type: 'select',
      options: frostResistantOptions
    })
  }

  const rectifiedOptions = getAllFilterOptions(allProducts, 'is_rectified', extractBooleanOptions)
  if (rectifiedOptions.length > 0) {
    filters.push({
      id: 'is_rectified',
      label: 'Rectificat',
      type: 'select',
      options: rectifiedOptions
    })
  }

  // Suitability filters (walls are primary for faianta)
  const suitableWallsOptions = getAllFilterOptions(allProducts, 'suitable_for_walls', extractBooleanOptions)
  if (suitableWallsOptions.length > 0) {
    filters.push({
      id: 'suitable_for_walls',
      label: 'Potrivit pentru pereți',
      type: 'select',
      options: suitableWallsOptions
    })
  }

  const suitableCommercialOptions = getAllFilterOptions(allProducts, 'suitable_for_commercial', extractBooleanOptions)
  if (suitableCommercialOptions.length > 0) {
    filters.push({
      id: 'suitable_for_commercial',
      label: 'Uz comercial',
      type: 'select',
      options: suitableCommercialOptions
    })
  }

  // Application areas
  const applicationAreasOptions = getAllFilterOptions(allProducts, 'application_areas', extractArrayOptions)
  if (applicationAreasOptions.length > 0) {
    filters.push({
      id: 'application_areas',
      label: 'Zone de aplicare',
      type: 'multiselect',
      options: applicationAreasOptions
    })
  }

  const usageAreaOptions = getAllFilterOptions(allProducts, 'usage_area')
  if (usageAreaOptions.length > 0) {
    filters.push({
      id: 'usage_area',
      label: 'Zonă utilizare',
      type: 'multiselect',
      options: usageAreaOptions
    })
  }

  return filters
}

// Enhanced filter configuration for Gresie (floor tiles)
// Uses ALL products to show all available options
export const getGresieFilters = (allProducts: Product[]): FilterOption[] => {
  const filters: FilterOption[] = []

  // Core properties (show all available options)
  const dimensionsOptions = getAllFilterOptions(allProducts, 'dimensions')
  if (dimensionsOptions.length > 0) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  const finishOptions = getAllFilterOptions(allProducts, 'finish')
  const surfaceFinishOptions = getAllFilterOptions(allProducts, 'surface_finish')
  
  // Combine finish and surface_finish options
  if (finishOptions.length > 0 || surfaceFinishOptions.length > 0) {
    const combinedFinish = [...finishOptions, ...surfaceFinishOptions]
    const uniqueFinish = Array.from(
      new Map(combinedFinish.map(item => [item.value, item])).values()
    )
    
    if (uniqueFinish.length > 0) {
      filters.push({
        id: 'finish',
        label: 'Finisaj suprafață',
        type: 'multiselect',
        options: uniqueFinish
      })
    }
  }

  // Brand & Quality
  const brandOptions = getAllFilterOptions(allProducts, 'brand')
  if (brandOptions.length > 0) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  const qualityGradeOptions = getAllFilterOptions(allProducts, 'quality_grade', extractNumericRangeOptions)
  if (qualityGradeOptions.length > 0) {
    filters.push({
      id: 'quality_grade',
      label: 'Grad calitate',
      type: 'multiselect',
      options: qualityGradeOptions.map(opt => ({
        ...opt,
        label: `Grad ${opt.value}${opt.value === '1' ? ' (Premium)' : opt.value === '2' ? ' (Standard)' : ' (Economic)'}`
      }))
    })
  }

  // Technical specifications (more critical for floor tiles)
  const thicknessOptions = getAllFilterOptions(allProducts, 'thickness', extractNumericRangeOptions)
  if (thicknessOptions.length > 0) {
    filters.push({
      id: 'thickness',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  const textureOptions = getAllFilterOptions(allProducts, 'texture')
  if (textureOptions.length > 0) {
    filters.push({
      id: 'texture',
      label: 'Textură',
      type: 'multiselect',
      options: textureOptions
    })
  }

  const materialOptions = getAllFilterOptions(allProducts, 'material')
  if (materialOptions.length > 0) {
    filters.push({
      id: 'material',
      label: 'Tip material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  const originCountryOptions = getAllFilterOptions(allProducts, 'origin_country')
  if (originCountryOptions.length > 0) {
    filters.push({
      id: 'origin_country',
      label: 'Țară origine',
      type: 'multiselect',
      options: originCountryOptions
    })
  }

  // Technical capabilities (very important for floor applications)
  const floorHeatingOptions = getAllFilterOptions(allProducts, 'is_floor_heating_compatible', extractBooleanOptions)
  if (floorHeatingOptions.length > 0) {
    filters.push({
      id: 'is_floor_heating_compatible',
      label: 'Compatibil încălzire în pardoseală',
      type: 'select',
      options: floorHeatingOptions
    })
  }

  const frostResistantOptions = getAllFilterOptions(allProducts, 'is_frost_resistant', extractBooleanOptions)
  if (frostResistantOptions.length > 0) {
    filters.push({
      id: 'is_frost_resistant',
      label: 'Rezistent la îngheț',
      type: 'select',
      options: frostResistantOptions
    })
  }

  const rectifiedOptions = getAllFilterOptions(allProducts, 'is_rectified', extractBooleanOptions)
  if (rectifiedOptions.length > 0) {
    filters.push({
      id: 'is_rectified',
      label: 'Rectificat',
      type: 'select',
      options: rectifiedOptions
    })
  }

  // Suitability filters (floors and exterior important for gresie)
  const suitableFloorsOptions = getAllFilterOptions(allProducts, 'suitable_for_floors', extractBooleanOptions)
  if (suitableFloorsOptions.length > 0) {
    filters.push({
      id: 'suitable_for_floors',
      label: 'Potrivit pentru pardoseli',
      type: 'select',
      options: suitableFloorsOptions
    })
  }

  const suitableExteriorOptions = getAllFilterOptions(allProducts, 'suitable_for_exterior', extractBooleanOptions)
  if (suitableExteriorOptions.length > 0) {
    filters.push({
      id: 'suitable_for_exterior',
      label: 'Potrivit pentru exterior',
      type: 'select',
      options: suitableExteriorOptions
    })
  }

  const suitableCommercialOptions = getAllFilterOptions(allProducts, 'suitable_for_commercial', extractBooleanOptions)
  if (suitableCommercialOptions.length > 0) {
    filters.push({
      id: 'suitable_for_commercial',
      label: 'Uz comercial',
      type: 'select',
      options: suitableCommercialOptions
    })
  }

  // Application areas
  const applicationAreasOptions = getAllFilterOptions(allProducts, 'application_areas', extractArrayOptions)
  if (applicationAreasOptions.length > 0) {
    filters.push({
      id: 'application_areas',
      label: 'Zone de aplicare',
      type: 'multiselect',
      options: applicationAreasOptions
    })
  }

  const usageAreaOptions = getAllFilterOptions(allProducts, 'usage_area')
  if (usageAreaOptions.length > 0) {
    filters.push({
      id: 'usage_area',
      label: 'Recomandare utilizare',
      type: 'multiselect',
      options: usageAreaOptions
    })
  }

  return filters
}

// Generic filter configuration - fallback for other categories
export const getGenericFilters = (products: Product[]): FilterOption[] => {
  const dimensionsOptions = extractFilterOptions(products, 'dimensions')
  const materialOptions = getAllFilterOptions(allProducts, 'material')
  const finishOptions = extractFilterOptions(products, 'finish')

  const filters: FilterOption[] = []

  if (dimensionsOptions.length > 0) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  if (materialOptions.length > 0) {
    filters.push({
      id: 'material',
      label: 'Material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  if (finishOptions.length > 0) {
    filters.push({
      id: 'finish',
      label: 'Finisaj',
      type: 'multiselect',
      options: finishOptions
    })
  }

  return filters
}

// Main function to get category-specific filters
export const getCategoryFilters = (categorySlug: string, products: Product[]): FilterOption[] => {
  switch (categorySlug?.toLowerCase()) {
    case 'faianta':
    case 'faianță':
      return getFaiantaFilters(products)
    case 'gresie':
      return getGresieFilters(products)
    default:
      return getGenericFilters(products)
  }
}