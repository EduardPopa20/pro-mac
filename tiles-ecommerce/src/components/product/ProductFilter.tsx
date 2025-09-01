import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Badge,
  type SelectChangeEvent,
} from '@mui/material'
import {
  FilterList,
  Clear,
  Close
} from '@mui/icons-material'
import type { Product } from '../../types'

// Common filter interface for all product types
export interface BaseProductFilters {
  priceRange: [number, number]
  colors: string[]
}

// Extensible filter interface - can be extended by specific categories
export interface ProductFilters extends BaseProductFilters {
  [key: string]: any
}

export interface FilterOption {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'checkbox'
  options?: Array<{
    value: string
    label: string
    count?: number
  }>
  min?: number
  max?: number
  step?: number
}

export interface ProductFilterProps {
  products: Product[]
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  customFilters?: FilterOption[] // Extensible custom filters per category
  loading?: boolean
  allProducts?: Product[] // All products for showing all options
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  products,
  filters,
  onFiltersChange,
  customFilters = [],
  loading = false,
  allProducts = []
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [modalOpen, setModalOpen] = useState(false)
  
  // Local state for filters before applying them
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [pendingFilters, setPendingFilters] = useState<ProductFilters>(filters)
  
  // TextField states for price range inputs
  const [minPriceInput, setMinPriceInput] = useState<string>(filters.priceRange[0].toString())
  const [maxPriceInput, setMaxPriceInput] = useState<string>(filters.priceRange[1].toString())
  const [priceError, setPriceError] = useState<string | null>(null)

  // Calculate price bounds from ALL products
  const priceBounds = React.useMemo(() => {
    const productsToUse = allProducts.length > 0 ? allProducts : products
    if (productsToUse.length === 0) return { min: 0, max: 1000 }
    
    const prices = productsToUse.map(p => p.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [products, allProducts])

  // Extract unique colors from ALL products
  const availableColors = React.useMemo(() => {
    const productsToUse = allProducts.length > 0 ? allProducts : products
    const colorSet = new Set<string>()
    productsToUse.forEach(product => {
      if (product.color && product.color.trim()) {
        colorSet.add(product.color.trim())
      }
    })
    
    const colorArray = Array.from(colorSet).sort((a, b) => a.localeCompare(b, 'ro'))
    return colorArray.map(color => ({
      value: color,
      label: color
    }))
  }, [products, allProducts])

  // Initialize price range when products change
  useEffect(() => {
    if (products.length > 0 && filters.priceRange[0] === 0 && filters.priceRange[1] === 0) {
      const newRange: [number, number] = [priceBounds.min, priceBounds.max]
      const newFilters = { ...filters, priceRange: newRange }
      setLocalFilters(newFilters)
      setPendingFilters(newFilters)
      setMinPriceInput(newRange[0].toString())
      setMaxPriceInput(newRange[1].toString())
    }
  }, [products.length, priceBounds.min, priceBounds.max])

  // Update local state when external filters change
  useEffect(() => {
    setLocalFilters(filters)
    setPendingFilters(filters)
    setMinPriceInput(filters.priceRange[0].toString())
    setMaxPriceInput(filters.priceRange[1].toString())
  }, [filters])

  const handleMinPriceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMinPriceInput(value)
    setPriceError(null)

    if (value.trim()) {
      const numValue = parseFloat(value)
      const maxValue = parseFloat(maxPriceInput)

      if (!isNaN(numValue) && !isNaN(maxValue) && numValue > maxValue) {
        setPriceError('Prețul minim nu poate fi mai mare decât prețul maxim')
      } else if (!isNaN(numValue)) {
        setPendingFilters({ ...pendingFilters, priceRange: [numValue, parseFloat(maxPriceInput) || priceBounds.max] })
      }
    }
  }

  const handleMaxPriceInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxPriceInput(value)
    setPriceError(null)

    if (value.trim()) {
      const numValue = parseFloat(value)
      const minValue = parseFloat(minPriceInput)

      if (!isNaN(minValue) && !isNaN(numValue) && minValue > numValue) {
        setPriceError('Prețul minim nu poate fi mai mare decât prețul maxim')
      } else if (!isNaN(numValue)) {
        setPendingFilters({ ...pendingFilters, priceRange: [parseFloat(minPriceInput) || priceBounds.min, numValue] })
      }
    }
  }

  const handleColorChange = (event: SelectChangeEvent<string[]>) => {
    const colors = event.target.value as string[]
    setPendingFilters({ ...pendingFilters, colors })
  }

  const removeColor = (colorToRemove: string) => {
    const newColors = pendingFilters.colors.filter(c => c !== colorToRemove)
    setPendingFilters({ ...pendingFilters, colors: newColors })
  }

  const handleCustomFilterChange = (filterId: string, value: any) => {
    setPendingFilters({ ...pendingFilters, [filterId]: value })
  }

  const removeCustomFilterValue = (filterId: string, valueToRemove: string) => {
    const currentValues = pendingFilters[filterId] || []
    if (Array.isArray(currentValues)) {
      const newValues = currentValues.filter((v: string) => v !== valueToRemove)
      handleCustomFilterChange(filterId, newValues)
    }
  }

  // Apply filters function
  const applyFilters = () => {
    if (!priceError) {
      setLocalFilters(pendingFilters)
      onFiltersChange(pendingFilters)
      if (isMobile && modalOpen) {
        setModalOpen(false)
      }
    }
  }

  const openFilterModal = () => {
    setModalOpen(true)
  }

  const closeFilterModal = () => {
    setModalOpen(false)
    // Reset pending filters to last applied filters
    setPendingFilters(localFilters)
    setMinPriceInput(localFilters.priceRange[0].toString())
    setMaxPriceInput(localFilters.priceRange[1].toString())
    setPriceError(null)
  }

  const clearAllFilters = () => {
    const clearedFilters: ProductFilters = {
      priceRange: [priceBounds.min, priceBounds.max],
      colors: [],
      ...Object.fromEntries(customFilters.map(f => [f.id, f.type === 'multiselect' ? [] : '']))
    }
    setPendingFilters(clearedFilters)
    setMinPriceInput(priceBounds.min.toString())
    setMaxPriceInput(priceBounds.max.toString())
    setPriceError(null)
  }

  const hasActiveFilters = () => {
    return (
      localFilters.colors.length > 0 ||
      localFilters.priceRange[0] !== priceBounds.min ||
      localFilters.priceRange[1] !== priceBounds.max ||
      customFilters.some(filter => {
        const value = localFilters[filter.id]
        return Array.isArray(value) ? value.length > 0 : Boolean(value)
      })
    )
  }

  const hasPendingChanges = () => {
    return JSON.stringify(pendingFilters) !== JSON.stringify(localFilters)
  }

  // Group filters by category for better organization
  const groupFiltersByCategory = (filters: FilterOption[]) => {
    const groups: { [key: string]: FilterOption[] } = {
      core: [],
      brand: [],
      technical: [],
      capabilities: [],
      suitability: [],
      application: []
    }

    filters.forEach(filter => {
      // Core filters (dimensions, materials, finishes)
      if (['dimensions', 'finish', 'surface_finish', 'material', 'texture', 'usage_area'].includes(filter.id)) {
        groups.core.push(filter)
      }
      // Brand and quality
      else if (['brand', 'quality_grade', 'origin_country'].includes(filter.id)) {
        groups.brand.push(filter)
      }
      // Technical specifications
      else if (['thickness', 'weight_per_box', 'area_per_box', 'tiles_per_box'].includes(filter.id)) {
        groups.technical.push(filter)
      }
      // Technical capabilities (boolean flags)
      else if (['is_rectified', 'is_frost_resistant', 'is_floor_heating_compatible'].includes(filter.id)) {
        groups.capabilities.push(filter)
      }
      // Suitability flags
      else if (['suitable_for_walls', 'suitable_for_floors', 'suitable_for_exterior', 'suitable_for_commercial'].includes(filter.id)) {
        groups.suitability.push(filter)
      }
      // Application areas
      else if (['application_areas'].includes(filter.id)) {
        groups.application.push(filter)
      }
    })

    return groups
  }

  const filterGroups = groupFiltersByCategory(customFilters)

  // Helper component for rendering individual filters
  const renderFilter = (filter: FilterOption) => {
    if (filter.type === 'select' && filter.options) {
      return (
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.875rem' }}>{filter.label}</InputLabel>
          <Select
            value={pendingFilters[filter.id] || ''}
            onChange={(e) => handleCustomFilterChange(filter.id, e.target.value)}
            label={filter.label}
            displayEmpty
          >
            <MenuItem value="">
              <em>Toate</em>
            </MenuItem>
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }

    if (filter.type === 'multiselect' && filter.options) {
      return (
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.875rem' }}>{filter.label}</InputLabel>
          <Select
            multiple
            value={pendingFilters[filter.id] || []}
            onChange={(e) => handleCustomFilterChange(filter.id, e.target.value)}
            label={filter.label}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => {
                  const option = filter.options?.find(opt => opt.value === value)
                  return (
                    <Chip 
                      key={value} 
                      label={option?.label || value} 
                      size="small"
                      onMouseDown={(event) => {
                        event.stopPropagation()
                      }}
                      onDelete={() => removeCustomFilterValue(filter.id, value)}
                      sx={{
                        height: 24,
                        '& .MuiChip-deleteIcon': {
                          fontSize: 18
                        }
                      }}
                    />
                  )
                })}
              </Box>
            )}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    }

    return null
  }

  // Filter content component - always visible sections
  const FilterContent: React.FC = () => (
    <Stack spacing={2}>
      {/* Price Range - Always visible */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Interval preț
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label="Min"
            value={minPriceInput}
            onChange={handleMinPriceInputChange}
            type="number"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">RON</InputAdornment>
            }}
            sx={{ flex: 1 }}
          />
          <Typography>-</Typography>
          <TextField
            label="Max"
            value={maxPriceInput}
            onChange={handleMaxPriceInputChange}
            type="number"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">RON</InputAdornment>
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        {priceError && (
          <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
            <Typography variant="caption">{priceError}</Typography>
          </Alert>
        )}
      </Paper>

      {/* Colors - Always visible */}
      {availableColors.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Culoare
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Selectează culorile</InputLabel>
            <Select
              multiple
              value={pendingFilters.colors}
              onChange={handleColorChange}
              label="Selectează culorile"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small"
                      onMouseDown={(event) => {
                        event.stopPropagation()
                      }}
                      onDelete={() => removeColor(value)}
                      sx={{
                        height: 24,
                        '& .MuiChip-deleteIcon': {
                          fontSize: 18
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {availableColors.map((color) => (
                <MenuItem key={color.value} value={color.value}>
                  {color.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Core Properties */}
      {filterGroups.core.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Proprietăți de bază
          </Typography>
          {filterGroups.core.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Brand & Quality */}
      {filterGroups.brand.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Brand și calitate
          </Typography>
          {filterGroups.brand.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Technical Specifications */}
      {filterGroups.technical.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Specificații tehnice
          </Typography>
          {filterGroups.technical.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Technical Capabilities */}
      {filterGroups.capabilities.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Capacități tehnice
          </Typography>
          {filterGroups.capabilities.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Suitability */}
      {filterGroups.suitability.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Potrivire aplicații
          </Typography>
          {filterGroups.suitability.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Application Areas */}
      {filterGroups.application.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Zone de aplicare
          </Typography>
          {filterGroups.application.map(filter => (
            <Box key={filter.id}>{renderFilter(filter)}</Box>
          ))}
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={clearAllFilters}
          size="small"
          fullWidth
        >
          Șterge tot
        </Button>
        <Badge 
          color="error" 
          variant="dot" 
          invisible={!hasPendingChanges()}
        >
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={applyFilters}
            size="small"
            fullWidth
            disabled={!!priceError}
          >
            Aplică filtrele
          </Button>
        </Badge>
      </Box>
    </Stack>
  )

  if (loading || products.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Filtrare produse</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Se încarcă opțiunile de filtrare...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop: Standard card layout */}
      {!isMobile ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filtrare produse
              </Typography>
              {hasActiveFilters() && (
                <Chip 
                  label="Filtre active" 
                  size="small" 
                  color="primary"
                  variant="filled"
                />
              )}
            </Box>
            <FilterContent />
          </CardContent>
        </Card>
      ) : (
        /* Mobile: Button that opens modal */
        <Box sx={{ mb: 3 }}>
          <Badge 
            badgeContent={hasActiveFilters() ? "!" : 0} 
            color="primary"
            sx={{ width: '100%' }}
          >
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              fullWidth
              onClick={openFilterModal}
              sx={{
                minHeight: 48,
                textTransform: 'none',
                justifyContent: 'flex-start',
                bgcolor: hasActiveFilters() ? 'primary.light' : 'background.paper',
                color: hasActiveFilters() ? 'primary.contrastText' : 'text.primary',
                borderColor: hasActiveFilters() ? 'primary.main' : 'divider',
                '&:hover': {
                  bgcolor: hasActiveFilters() ? 'primary.main' : 'grey.50'
                }
              }}
            >
              Filtrează produsele
              {hasActiveFilters() && (
                <Chip 
                  label="Active"
                  size="small"
                  sx={{ ml: 'auto', bgcolor: 'primary.dark', color: 'white' }}
                />
              )}
            </Button>
          </Badge>
        </Box>
      )}

      {/* Mobile Modal */}
      <Dialog
        open={modalOpen}
        onClose={closeFilterModal}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            margin: 0,
            maxHeight: '100vh',
            height: '100vh'
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">
            Filtrare produse
          </Typography>
          <IconButton onClick={closeFilterModal}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <FilterContent />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductFilter