import type { Product } from '../types'
import type { ProductFilters } from '../components/product/ProductFilter'

// Main function to apply all filters to products
export const applyProductFilters = (products: Product[], filters: ProductFilters): Product[] => {
  return products.filter(product => {
    // Price range filter
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange
      if (product.price < minPrice || product.price > maxPrice) {
        return false
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      if (!product.color || !filters.colors.includes(product.color.trim())) {
        return false
      }
    }

    // Dynamic custom filters (dimensions, material, finish, usage_area, boolean flags, etc.)
    for (const [filterKey, filterValue] of Object.entries(filters)) {
      // Skip base filters we already handled
      if (filterKey === 'priceRange' || filterKey === 'colors') {
        continue
      }

      // Handle array filters (multiselect) - for string fields
      if (Array.isArray(filterValue) && filterValue.length > 0) {
        const productValue = product[filterKey as keyof Product]
        
        // Handle product array fields (like application_areas)
        if (filterKey === 'application_areas' && Array.isArray(productValue)) {
          const hasMatch = filterValue.some(filterItem => 
            productValue.some(productItem => 
              typeof productItem === 'string' && 
              typeof filterItem === 'string' &&
              productItem.trim().toLowerCase() === filterItem.trim().toLowerCase()
            )
          )
          if (!hasMatch) {
            return false
          }
        }
        // Handle regular string fields
        else if (typeof productValue === 'string') {
          if (!filterValue.includes(productValue.trim())) {
            return false
          }
        }
        // Handle numeric fields (like thickness, quality_grade)
        else if (typeof productValue === 'number') {
          if (!filterValue.includes(productValue.toString())) {
            return false
          }
        }
        // If product doesn't have this field and filter expects it, exclude
        else {
          return false
        }
      }

      // Handle single value filters (select) - includes boolean filters
      if (typeof filterValue === 'string' && filterValue.trim() !== '') {
        const productValue = product[filterKey as keyof Product]
        
        // Handle boolean filters (technical capabilities, suitability)
        if (filterValue === 'true' || filterValue === 'false') {
          const expectedBoolean = filterValue === 'true'
          if (productValue !== expectedBoolean) {
            return false
          }
        }
        // Handle string filters
        else if (typeof productValue === 'string') {
          if (productValue.trim() !== filterValue.trim()) {
            return false
          }
        }
        // Handle numeric filters converted to strings
        else if (typeof productValue === 'number') {
          if (productValue.toString() !== filterValue) {
            return false
          }
        }
        // If product doesn't have this field and filter expects it, exclude
        else {
          return false
        }
      }
    }

    return true
  })
}

// Enhanced helper function to get filter counts for each option
export const getFilterCounts = (
  products: Product[], 
  currentFilters: ProductFilters,
  fieldName: keyof Product
): Map<string, number> => {
  // Create a copy of filters without the current field to see available options
  const filtersWithoutCurrent = { ...currentFilters }
  delete filtersWithoutCurrent[fieldName as string]
  
  // Apply filters excluding the current field
  const filteredProducts = applyProductFilters(products, filtersWithoutCurrent)
  
  // Count occurrences of each value for the current field
  const counts = new Map<string, number>()
  
  filteredProducts.forEach(product => {
    const value = product[fieldName]
    
    // Handle string fields
    if (value && typeof value === 'string' && value.trim()) {
      const trimmedValue = value.trim()
      counts.set(trimmedValue, (counts.get(trimmedValue) || 0) + 1)
    }
    // Handle numeric fields  
    else if (typeof value === 'number') {
      const stringValue = value.toString()
      counts.set(stringValue, (counts.get(stringValue) || 0) + 1)
    }
    // Handle boolean fields
    else if (typeof value === 'boolean') {
      const booleanValue = value.toString()
      counts.set(booleanValue, (counts.get(booleanValue) || 0) + 1)
    }
    // Handle array fields (like application_areas)
    else if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'string' && item.trim()) {
          const trimmedValue = item.trim()
          counts.set(trimmedValue, (counts.get(trimmedValue) || 0) + 1)
        }
      })
    }
  })
  
  return counts
}

// Sort options type
export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest' | 'featured'

// Sort products function
export const sortProducts = (products: Product[], sortBy: SortOption): Product[] => {
  const sortedProducts = [...products]
  
  switch (sortBy) {
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ro'))
    case 'name-desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'ro'))
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price)
    case 'newest':
      return sortedProducts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    case 'featured':
      return sortedProducts.sort((a, b) => {
        // Featured products first, then by name
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        return a.name.localeCompare(b.name, 'ro')
      })
    default:
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ro'))
  }
}