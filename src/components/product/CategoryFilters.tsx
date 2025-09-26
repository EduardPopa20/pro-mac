import { LocalOffer } from '@mui/icons-material'
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
export const getFaiantaFilters = (
  allProducts: Product[],
  isSpecVisible?: (specKey: string) => boolean,
  productsForCounts?: Product[]
): FilterOption[] => {
  const countProducts = productsForCounts || allProducts
  const filters: FilterOption[] = []

  // Add sale/discount filter at the top (most important for e-commerce)
  const saleProducts = countProducts.filter(p => p.is_on_sale === true).length
  if (saleProducts > 0) {
    filters.push({
      id: 'is_on_sale',
      label: 'Reduceri',
      type: 'checkbox',
      icon: LocalOffer,
      options: [{ value: 'true', label: `Produse la reducere (${saleProducts})` }]
    })
  }

  // Core properties (check visibility before adding filter)
  const dimensionsOptions = getAllFilterOptions(allProducts, 'dimensions')
  if (dimensionsOptions.length > 0 && (!isSpecVisible || isSpecVisible('dimensions'))) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  const finishOptions = getAllFilterOptions(allProducts, 'finish')
  const surfaceFinishOptions = getAllFilterOptions(allProducts, 'surface_finish')

  // Combine finish and surface_finish options (check visibility for both finish and surface_finish)
  if ((finishOptions.length > 0 || surfaceFinishOptions.length > 0) &&
      (!isSpecVisible || isSpecVisible('finish') || isSpecVisible('surface_finish'))) {
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
  if (brandOptions.length > 0 && (!isSpecVisible || isSpecVisible('brand'))) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  const qualityGradeOptions = getAllFilterOptions(allProducts, 'quality_grade', extractNumericRangeOptions)
  if (qualityGradeOptions.length > 0 && (!isSpecVisible || isSpecVisible('quality_grade'))) {
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
  if (thicknessOptions.length > 0 && (!isSpecVisible || isSpecVisible('thickness'))) {
    filters.push({
      id: 'thickness',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  const textureOptions = getAllFilterOptions(allProducts, 'texture')
  if (textureOptions.length > 0 && (!isSpecVisible || isSpecVisible('texture'))) {
    filters.push({
      id: 'texture',
      label: 'Textură',
      type: 'multiselect',
      options: textureOptions
    })
  }

  const materialOptions = getAllFilterOptions(allProducts, 'material')
  if (materialOptions.length > 0 && (!isSpecVisible || isSpecVisible('material'))) {
    filters.push({
      id: 'material',
      label: 'Material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  const originCountryOptions = getAllFilterOptions(allProducts, 'origin_country')
  if (originCountryOptions.length > 0 && (!isSpecVisible || isSpecVisible('origin_country'))) {
    filters.push({
      id: 'origin_country',
      label: 'Țară origine',
      type: 'multiselect',
      options: originCountryOptions
    })
  }

  // Technical capabilities (especially important for bathroom tiles)
  const frostResistantOptions = getAllFilterOptions(allProducts, 'is_frost_resistant', extractBooleanOptions)
  if (frostResistantOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_frost_resistant'))) {
    filters.push({
      id: 'is_frost_resistant',
      label: 'Rezistent la îngheț',
      type: 'select',
      options: frostResistantOptions
    })
  }

  const rectifiedOptions = getAllFilterOptions(allProducts, 'is_rectified', extractBooleanOptions)
  if (rectifiedOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_rectified'))) {
    filters.push({
      id: 'is_rectified',
      label: 'Rectificat',
      type: 'select',
      options: rectifiedOptions
    })
  }

  // Suitability filters (walls are primary for faianta)
  const suitableWallsOptions = getAllFilterOptions(allProducts, 'suitable_for_walls', extractBooleanOptions)
  if (suitableWallsOptions.length > 0 && (!isSpecVisible || isSpecVisible('suitable_for_walls'))) {
    filters.push({
      id: 'suitable_for_walls',
      label: 'Potrivit pentru pereți',
      type: 'select',
      options: suitableWallsOptions
    })
  }

  const suitableCommercialOptions = getAllFilterOptions(allProducts, 'suitable_for_commercial', extractBooleanOptions)
  if (suitableCommercialOptions.length > 0 && (!isSpecVisible || isSpecVisible('suitable_for_commercial'))) {
    filters.push({
      id: 'suitable_for_commercial',
      label: 'Uz comercial',
      type: 'select',
      options: suitableCommercialOptions
    })
  }

  // Application areas
  const applicationAreasOptions = getAllFilterOptions(allProducts, 'application_areas', extractArrayOptions)
  if (applicationAreasOptions.length > 0 && (!isSpecVisible || isSpecVisible('application_areas'))) {
    filters.push({
      id: 'application_areas',
      label: 'Zone de aplicare',
      type: 'multiselect',
      options: applicationAreasOptions
    })
  }

  const usageAreaOptions = getAllFilterOptions(allProducts, 'usage_area')
  if (usageAreaOptions.length > 0 && (!isSpecVisible || isSpecVisible('usage_area'))) {
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
export const getGresieFilters = (
  allProducts: Product[],
  isSpecVisible?: (specKey: string) => boolean,
  productsForCounts?: Product[]
): FilterOption[] => {
  const countProducts = productsForCounts || allProducts
  const filters: FilterOption[] = []

  // Add sale/discount filter at the top (most important for e-commerce)
  const saleProducts = countProducts.filter(p => p.is_on_sale === true).length
  if (saleProducts > 0) {
    filters.push({
      id: 'is_on_sale',
      label: 'Reduceri',
      type: 'checkbox',
      icon: LocalOffer,
      options: [{ value: 'true', label: `Produse la reducere (${saleProducts})` }]
    })
  }

  // Core properties (show all available options)
  const dimensionsOptions = getAllFilterOptions(allProducts, 'dimensions')
  if (dimensionsOptions.length > 0 && (!isSpecVisible || isSpecVisible('dimensions'))) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  const finishOptions = getAllFilterOptions(allProducts, 'finish')
  const surfaceFinishOptions = getAllFilterOptions(allProducts, 'surface_finish')

  // Combine finish and surface_finish options (check visibility for both finish and surface_finish)
  if ((finishOptions.length > 0 || surfaceFinishOptions.length > 0) &&
      (!isSpecVisible || isSpecVisible('finish') || isSpecVisible('surface_finish'))) {
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
  if (brandOptions.length > 0 && (!isSpecVisible || isSpecVisible('brand'))) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  const qualityGradeOptions = getAllFilterOptions(allProducts, 'quality_grade', extractNumericRangeOptions)
  if (qualityGradeOptions.length > 0 && (!isSpecVisible || isSpecVisible('quality_grade'))) {
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
  if (thicknessOptions.length > 0 && (!isSpecVisible || isSpecVisible('thickness'))) {
    filters.push({
      id: 'thickness',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  const textureOptions = getAllFilterOptions(allProducts, 'texture')
  if (textureOptions.length > 0 && (!isSpecVisible || isSpecVisible('texture'))) {
    filters.push({
      id: 'texture',
      label: 'Textură',
      type: 'multiselect',
      options: textureOptions
    })
  }

  const materialOptions = getAllFilterOptions(allProducts, 'material')
  if (materialOptions.length > 0 && (!isSpecVisible || isSpecVisible('material'))) {
    filters.push({
      id: 'material',
      label: 'Tip material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  const originCountryOptions = getAllFilterOptions(allProducts, 'origin_country')
  if (originCountryOptions.length > 0 && (!isSpecVisible || isSpecVisible('origin_country'))) {
    filters.push({
      id: 'origin_country',
      label: 'Țară origine',
      type: 'multiselect',
      options: originCountryOptions
    })
  }

  // Technical capabilities (very important for floor applications)
  const floorHeatingOptions = getAllFilterOptions(allProducts, 'is_floor_heating_compatible', extractBooleanOptions)
  if (floorHeatingOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_floor_heating_compatible'))) {
    filters.push({
      id: 'is_floor_heating_compatible',
      label: 'Compatibil încălzire în pardoseală',
      type: 'select',
      options: floorHeatingOptions
    })
  }

  const frostResistantOptions = getAllFilterOptions(allProducts, 'is_frost_resistant', extractBooleanOptions)
  if (frostResistantOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_frost_resistant'))) {
    filters.push({
      id: 'is_frost_resistant',
      label: 'Rezistent la îngheț',
      type: 'select',
      options: frostResistantOptions
    })
  }

  const rectifiedOptions = getAllFilterOptions(allProducts, 'is_rectified', extractBooleanOptions)
  if (rectifiedOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_rectified'))) {
    filters.push({
      id: 'is_rectified',
      label: 'Rectificat',
      type: 'select',
      options: rectifiedOptions
    })
  }

  // Suitability filters (floors and exterior important for gresie)
  const suitableFloorsOptions = getAllFilterOptions(allProducts, 'suitable_for_floors', extractBooleanOptions)
  if (suitableFloorsOptions.length > 0 && (!isSpecVisible || isSpecVisible('suitable_for_floors'))) {
    filters.push({
      id: 'suitable_for_floors',
      label: 'Potrivit pentru pardoseli',
      type: 'select',
      options: suitableFloorsOptions
    })
  }

  const suitableExteriorOptions = getAllFilterOptions(allProducts, 'suitable_for_exterior', extractBooleanOptions)
  if (suitableExteriorOptions.length > 0 && (!isSpecVisible || isSpecVisible('suitable_for_exterior'))) {
    filters.push({
      id: 'suitable_for_exterior',
      label: 'Potrivit pentru exterior',
      type: 'select',
      options: suitableExteriorOptions
    })
  }

  const suitableCommercialOptions = getAllFilterOptions(allProducts, 'suitable_for_commercial', extractBooleanOptions)
  if (suitableCommercialOptions.length > 0 && (!isSpecVisible || isSpecVisible('suitable_for_commercial'))) {
    filters.push({
      id: 'suitable_for_commercial',
      label: 'Uz comercial',
      type: 'select',
      options: suitableCommercialOptions
    })
  }

  // Application areas
  const applicationAreasOptions = getAllFilterOptions(allProducts, 'application_areas', extractArrayOptions)
  if (applicationAreasOptions.length > 0 && (!isSpecVisible || isSpecVisible('application_areas'))) {
    filters.push({
      id: 'application_areas',
      label: 'Zone de aplicare',
      type: 'multiselect',
      options: applicationAreasOptions
    })
  }

  const usageAreaOptions = getAllFilterOptions(allProducts, 'usage_area')
  if (usageAreaOptions.length > 0 && (!isSpecVisible || isSpecVisible('usage_area'))) {
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
export const getGenericFilters = (
  products: Product[],
  isSpecVisible?: (specKey: string) => boolean
): FilterOption[] => {
  const dimensionsOptions = extractFilterOptions(products, 'dimensions')
  const materialOptions = getAllFilterOptions(products, 'material')
  const finishOptions = extractFilterOptions(products, 'finish')

  const filters: FilterOption[] = []

  // Add sale/discount filter at the top (most important for e-commerce)
  const saleProducts = products.filter(p => p.is_on_sale === true).length
  if (saleProducts > 0) {
    filters.push({
      id: 'is_on_sale',
      label: 'Reduceri',
      type: 'checkbox',
      icon: LocalOffer,
      options: [{ value: 'true', label: `Produse la reducere (${saleProducts})` }]
    })
  }

  if (dimensionsOptions.length > 0 && (!isSpecVisible || isSpecVisible('dimensions'))) {
    filters.push({
      id: 'dimensions',
      label: 'Dimensiuni',
      type: 'multiselect',
      options: dimensionsOptions
    })
  }

  if (materialOptions.length > 0 && (!isSpecVisible || isSpecVisible('material'))) {
    filters.push({
      id: 'material',
      label: 'Material',
      type: 'multiselect',
      options: materialOptions
    })
  }

  if (finishOptions.length > 0 && (!isSpecVisible || isSpecVisible('finish'))) {
    filters.push({
      id: 'finish',
      label: 'Finisaj',
      type: 'multiselect',
      options: finishOptions
    })
  }

  return filters
}

// Enhanced filter configuration for Parchet (flooring) - Based on Dedeman specifications
export const getParchetFilters = (
  allProducts: Product[],
  isSpecVisible?: (specKey: string) => boolean,
  productsForCounts?: Product[]
): FilterOption[] => {
  const countProducts = productsForCounts || allProducts
  const filters: FilterOption[] = []

  // Add sale/discount filter at the top (most important for e-commerce)
  const saleProducts = countProducts.filter(p => p.is_on_sale === true).length
  if (saleProducts > 0) {
    filters.push({
      id: 'is_on_sale',
      label: 'Reduceri',
      type: 'checkbox',
      icon: LocalOffer,
      options: [{ value: 'true', label: `Produse la reducere (${saleProducts})` }]
    })
  }

  // Brand (most important for parchet - as requested: brand, price, material)
  const brandOptions = getAllFilterOptions(allProducts, 'brand')
  if (brandOptions.length > 0 && (!isSpecVisible || isSpecVisible('brand'))) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  // Wood essence (material characteristic for parchet)
  const woodEssenceOptions = getAllFilterOptions(allProducts, 'wood_essence' as keyof Product)
  if (woodEssenceOptions.length > 0 && (!isSpecVisible || isSpecVisible('wood_essence'))) {
    filters.push({
      id: 'wood_essence',
      label: 'Esență lemn',
      type: 'multiselect',
      options: woodEssenceOptions
    })
  }

  // Core material (requested: material)
  const coreMaterialOptions = getAllFilterOptions(allProducts, 'core_material' as keyof Product)
  if (coreMaterialOptions.length > 0 && (!isSpecVisible || isSpecVisible('core_material'))) {
    filters.push({
      id: 'core_material',
      label: 'Material miez',
      type: 'multiselect',
      options: coreMaterialOptions
    })
  }

  // Traffic class (important for flooring)
  const trafficClassOptions = getAllFilterOptions(allProducts, 'traffic_class' as keyof Product)
  if (trafficClassOptions.length > 0 && (!isSpecVisible || isSpecVisible('traffic_class'))) {
    filters.push({
      id: 'traffic_class',
      label: 'Clasa trafic',
      type: 'multiselect',
      options: trafficClassOptions
    })
  }

  // Thickness (technical specification)
  const thicknessMmOptions = getAllFilterOptions(allProducts, 'thickness_mm' as keyof Product, extractNumericRangeOptions)
  if (thicknessMmOptions.length > 0 && (!isSpecVisible || isSpecVisible('thickness_mm'))) {
    filters.push({
      id: 'thickness_mm',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessMmOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  // Floor type/style
  const floorTypeOptions = getAllFilterOptions(allProducts, 'floor_type' as keyof Product)
  if (floorTypeOptions.length > 0 && (!isSpecVisible || isSpecVisible('floor_type'))) {
    filters.push({
      id: 'floor_type',
      label: 'Tip sol',
      type: 'multiselect',
      options: floorTypeOptions
    })
  }

  // Collection name
  const collectionOptions = getAllFilterOptions(allProducts, 'collection_name' as keyof Product)
  if (collectionOptions.length > 0 && (!isSpecVisible || isSpecVisible('collection_name'))) {
    filters.push({
      id: 'collection_name',
      label: 'Colecție',
      type: 'multiselect',
      options: collectionOptions
    })
  }

  // Installation type
  const installationTypeOptions = getAllFilterOptions(allProducts, 'installation_type' as keyof Product)
  if (installationTypeOptions.length > 0 && (!isSpecVisible || isSpecVisible('installation_type'))) {
    filters.push({
      id: 'installation_type',
      label: 'Tip montaj',
      type: 'multiselect',
      options: installationTypeOptions
    })
  }

  // Underfloor heating compatibility
  const underfloorHeatingOptions = getAllFilterOptions(allProducts, 'underfloor_heating_compatible' as keyof Product)
  if (underfloorHeatingOptions.length > 0 && (!isSpecVisible || isSpecVisible('underfloor_heating_compatible'))) {
    filters.push({
      id: 'underfloor_heating_compatible',
      label: 'Compatibil încălzire pardoseală',
      type: 'select',
      options: [
        { value: 'yes', label: 'Da' },
        { value: 'no', label: 'Nu' }
      ]
    })
  }

  // Antistatic properties
  const antistaticOptions = getAllFilterOptions(allProducts, 'is_antistatic' as keyof Product, extractBooleanOptions)
  if (antistaticOptions.length > 0 && (!isSpecVisible || isSpecVisible('is_antistatic'))) {
    filters.push({
      id: 'is_antistatic',
      label: 'Antiestatic',
      type: 'select',
      options: antistaticOptions
    })
  }

  // Surface texture
  const surfaceTextureOptions = getAllFilterOptions(allProducts, 'surface_texture' as keyof Product)
  if (surfaceTextureOptions.length > 0 && (!isSpecVisible || isSpecVisible('surface_texture'))) {
    filters.push({
      id: 'surface_texture',
      label: 'Textură suprafață',
      type: 'multiselect',
      options: surfaceTextureOptions
    })
  }

  // Usage areas
  const usageAreaOptions = getAllFilterOptions(allProducts, 'usage_area')
  if (usageAreaOptions.length > 0 && (!isSpecVisible || isSpecVisible('usage_area'))) {
    filters.push({
      id: 'usage_area',
      label: 'Zone de utilizare',
      type: 'multiselect',
      options: usageAreaOptions
    })
  }

  return filters
}

// Enhanced filter configuration for Riflaje (decorative slat panels)
// Primary filters: Material, Brand, Proprietăți, Dimensiuni (based on research)
export const getRiflajFilters = (
  allProducts: Product[],
  isSpecVisible?: (specKey: string) => boolean,
  productsForCounts?: Product[]
): FilterOption[] => {
  const countProducts = productsForCounts || allProducts
  const filters: FilterOption[] = []

  // Add sale/discount filter at the top (most important for e-commerce)
  const saleProducts = countProducts.filter(p => p.is_on_sale === true).length
  if (saleProducts > 0) {
    filters.push({
      id: 'is_on_sale',
      label: 'Reduceri',
      type: 'checkbox',
      icon: LocalOffer,
      options: [{ value: 'true', label: `Produse la reducere (${saleProducts})` }]
    })
  }

  // MATERIAL (Most Important - combines panel_type + base_material)
  const panelTypeOptions = getAllFilterOptions(allProducts, 'panel_type' as keyof Product)
  const baseMaterialOptions = getAllFilterOptions(allProducts, 'base_material' as keyof Product)

  if ((panelTypeOptions.length > 0 || baseMaterialOptions.length > 0) &&
      (!isSpecVisible || isSpecVisible('panel_type') || isSpecVisible('base_material'))) {
    const combinedMaterials = [
      ...panelTypeOptions.map(opt => ({ ...opt, label: `${opt.value} (Tip)` })),
      ...baseMaterialOptions.map(opt => ({ ...opt, label: `${opt.value} (Material)` }))
    ]

    const uniqueMaterials = Array.from(
      new Map(combinedMaterials.map(item => [item.value, item])).values()
    )

    filters.push({
      id: 'panel_type',
      label: 'Material',
      type: 'multiselect',
      options: uniqueMaterials
    })
  }

  // BRAND (Second most important)
  const brandOptions = getAllFilterOptions(allProducts, 'brand')
  if (brandOptions.length > 0 && (!isSpecVisible || isSpecVisible('brand'))) {
    filters.push({
      id: 'brand',
      label: 'Brand',
      type: 'multiselect',
      options: brandOptions
    })
  }

  // ACOUSTIC PROPERTIES (Key differentiator)
  const acousticOptions = getAllFilterOptions(allProducts, 'acoustic_properties' as keyof Product)
  if (acousticOptions.length > 0 && (!isSpecVisible || isSpecVisible('acoustic_properties'))) {
    filters.push({
      id: 'acoustic_properties',
      label: 'Proprietăți Acustice',
      type: 'multiselect',
      options: acousticOptions.map(opt => ({
        ...opt,
        label: opt.value === 'decorativ' ? '🎨 Doar Decorativ' :
               opt.value === 'fonoabsorbant' ? '🔊 Fonoabsorbant' :
               opt.value === 'izolant fonix' ? '🔇 Izolant Fonic' :
               opt.value === 'mixt' ? '🎯 Decorativ + Acustic' : opt.value
      }))
    })
  }

  // THICKNESS (Important for installation)
  const thicknessOptions = getAllFilterOptions(allProducts, 'panel_thickness_mm' as keyof Product, extractNumericRangeOptions)
  if (thicknessOptions.length > 0 && (!isSpecVisible || isSpecVisible('panel_thickness_mm'))) {
    filters.push({
      id: 'panel_thickness_mm',
      label: 'Grosime (mm)',
      type: 'multiselect',
      options: thicknessOptions.map(opt => ({ ...opt, label: `${opt.value} mm` }))
    })
  }

  // WOOD SPECIES (For solid wood panels)
  const woodSpeciesOptions = getAllFilterOptions(allProducts, 'wood_species' as keyof Product)
  if (woodSpeciesOptions.length > 0 && (!isSpecVisible || isSpecVisible('wood_species'))) {
    filters.push({
      id: 'wood_species',
      label: 'Esență Lemn',
      type: 'multiselect',
      options: woodSpeciesOptions.map(opt => ({
        ...opt,
        label: opt.value === 'stejar' ? '🌳 Stejar' :
               opt.value === 'nuc' ? '🌰 Nuc' :
               opt.value === 'pin' ? '🌲 Pin' :
               opt.value === 'fag' ? '🍂 Fag' :
               opt.value === 'tec' ? '🏗️ Tec' : opt.value
      }))
    })
  }

  // PANEL PROFILE/MODEL
  const panelProfileOptions = getAllFilterOptions(allProducts, 'panel_profile' as keyof Product)
  if (panelProfileOptions.length > 0 && (!isSpecVisible || isSpecVisible('panel_profile'))) {
    filters.push({
      id: 'panel_profile',
      label: 'Model/Profil',
      type: 'multiselect',
      options: panelProfileOptions
    })
  }

  // SURFACE FINISH TYPE
  const surfaceFinishOptions = getAllFilterOptions(allProducts, 'surface_finish_type' as keyof Product)
  if (surfaceFinishOptions.length > 0 && (!isSpecVisible || isSpecVisible('surface_finish_type'))) {
    filters.push({
      id: 'surface_finish_type',
      label: 'Tip Finisaj',
      type: 'multiselect',
      options: surfaceFinishOptions
    })
  }

  // MOUNTING SYSTEM
  const mountingOptions = getAllFilterOptions(allProducts, 'mounting_system' as keyof Product)
  if (mountingOptions.length > 0 && (!isSpecVisible || isSpecVisible('mounting_system'))) {
    filters.push({
      id: 'mounting_system',
      label: 'Sistem Montaj',
      type: 'multiselect',
      options: mountingOptions.map(opt => ({
        ...opt,
        label: opt.value === 'lipire' ? '🔗 Lipire' :
               opt.value === 'înșurubare' ? '🔩 Înșurubare' :
               opt.value === 'profile montaj' ? '📐 Profile Montaj' :
               opt.value === 'kit complet' ? '📦 Kit Complet' : opt.value
      }))
    })
  }

  // PANEL ORIENTATION
  const orientationOptions = getAllFilterOptions(allProducts, 'panel_orientation' as keyof Product)
  if (orientationOptions.length > 0 && (!isSpecVisible || isSpecVisible('panel_orientation'))) {
    filters.push({
      id: 'panel_orientation',
      label: 'Orientare',
      type: 'multiselect',
      options: orientationOptions.map(opt => ({
        ...opt,
        label: opt.value === 'vertical' ? '⬆️ Vertical' :
               opt.value === 'orizontal' ? '➡️ Orizontal' :
               opt.value === 'ambele' ? '🔄 Ambele' : opt.value
      }))
    })
  }

  // INSTALLATION AREA
  const installAreaOptions = getAllFilterOptions(allProducts, 'installation_area' as keyof Product)
  if (installAreaOptions.length > 0 && (!isSpecVisible || isSpecVisible('installation_area'))) {
    filters.push({
      id: 'installation_area',
      label: 'Zonă Instalare',
      type: 'multiselect',
      options: installAreaOptions.map(opt => ({
        ...opt,
        label: opt.value === 'interior' ? '🏠 Interior' :
               opt.value === 'exterior' ? '🌤️ Exterior' :
               opt.value === 'ambele' ? '🏠🌤️ Interior + Exterior' : opt.value
      }))
    })
  }

  // UV RESISTANCE (Boolean filter)
  const uvResistantProducts = allProducts.filter(p => p.uv_resistance === true).length
  const nonUvResistantProducts = allProducts.filter(p => p.uv_resistance === false).length

  if ((uvResistantProducts > 0 || nonUvResistantProducts > 0) &&
      (!isSpecVisible || isSpecVisible('uv_resistance'))) {
    const uvOptions = []
    if (uvResistantProducts > 0) {
      uvOptions.push({ value: 'true', label: '☀️ Cu Rezistență UV' })
    }
    if (nonUvResistantProducts > 0) {
      uvOptions.push({ value: 'false', label: '🏠 Doar Interior' })
    }

    filters.push({
      id: 'uv_resistance',
      label: 'Rezistență UV',
      type: 'multiselect',
      options: uvOptions
    })
  }

  // INSTALLATION DIFFICULTY
  const difficultyOptions = getAllFilterOptions(allProducts, 'installation_difficulty' as keyof Product)
  if (difficultyOptions.length > 0 && (!isSpecVisible || isSpecVisible('installation_difficulty'))) {
    filters.push({
      id: 'installation_difficulty',
      label: 'Dificultate Instalare',
      type: 'multiselect',
      options: difficultyOptions.map(opt => ({
        ...opt,
        label: opt.value === 'ușoară' ? '😊 Ușoară (DIY)' :
               opt.value === 'medie' ? '🛠️ Medie' :
               opt.value === 'avansată' ? '👨‍🔧 Avansată' :
               opt.value === 'specializată' ? '🏗️ Specializată' : opt.value
      }))
    })
  }

  return filters
}

// Main function to get category-specific filters
export const getCategoryFilters = (
  categorySlug: string,
  allProducts: Product[],
  isSpecVisible?: (specKey: string) => boolean,
  filteredProducts?: Product[]
): FilterOption[] => {
  // Use filteredProducts for counts, allProducts for options
  const productsForCounts = filteredProducts || allProducts
  switch (categorySlug?.toLowerCase()) {
    case 'faianta':
    case 'faianță':
      return getFaiantaFilters(allProducts, isSpecVisible, productsForCounts)
    case 'gresie':
      return getGresieFilters(allProducts, isSpecVisible, productsForCounts)
    case 'parchet':
      return getParchetFilters(allProducts, isSpecVisible, productsForCounts)
    case 'riflaje':
      return getRiflajFilters(allProducts, isSpecVisible, productsForCounts)
    default:
      return getGenericFilters(allProducts, isSpecVisible, productsForCounts)
  }
}