import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  type SelectChangeEvent,
} from '@mui/material'
import {
  FilterList,
  Clear,
  Close,
  LocalOffer
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
  icon?: React.ComponentType<any> // Optional icon component
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
  
  // Refs to track current input values without causing re-renders
  const minPriceRef = useRef<string>(minPriceInput)
  const maxPriceRef = useRef<string>(maxPriceInput)
  
  // Update refs when state changes
  useEffect(() => {
    minPriceRef.current = minPriceInput
  }, [minPriceInput])
  
  useEffect(() => {
    maxPriceRef.current = maxPriceInput  
  }, [maxPriceInput])

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

  // Initialize price range when products first load (only once)
  useEffect(() => {
    if (products.length > 0 && priceBounds.min < priceBounds.max) {
      // Only set initial values once when both filters and inputs are at default [0, 0]
      if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0 && 
          minPriceInput === '0' && maxPriceInput === '0') {
        const newMin = priceBounds.min.toString()
        const newMax = priceBounds.max.toString()
        
        setMinPriceInput(newMin)
        setMaxPriceInput(newMax)
        // Don't update filters here to prevent loops - let parent handle it
      }
    }
  }, [products.length, priceBounds.min, priceBounds.max])
  
  // Handle external filter changes (separate from initialization)
  useEffect(() => {
    // Avoid updating during user input to prevent focus loss
    if (document.activeElement?.tagName !== 'INPUT') {
      const filterMin = filters.priceRange[0].toString()
      const filterMax = filters.priceRange[1].toString()
      
      if (minPriceInput !== filterMin || maxPriceInput !== filterMax) {
        setMinPriceInput(filterMin)
        setMaxPriceInput(filterMax)
      }
      
      if (JSON.stringify(localFilters) !== JSON.stringify(filters)) {
        setLocalFilters(filters)
        setPendingFilters(filters)
      }
    }
  }, [filters])
  

  const handleMinPriceInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMinPriceInput(value)
    setPriceError(null)

    if (value.trim()) {
      const numValue = parseFloat(value)
      
      if (!isNaN(numValue)) {
        setPendingFilters(prev => {
          const maxValue = parseFloat(maxPriceRef.current) || priceBounds.max
          
          if (maxValue && numValue > maxValue) {
            setPriceError('Prețul minim nu poate fi mai mare decât prețul maxim')
          }
          
          return { ...prev, priceRange: [numValue, maxValue] }
        })
      }
    }
  }, [priceBounds.max])

  const handleMaxPriceInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxPriceInput(value)
    setPriceError(null)

    if (value.trim()) {
      const numValue = parseFloat(value)
      
      if (!isNaN(numValue)) {
        setPendingFilters(prev => {
          const minValue = parseFloat(minPriceRef.current) || priceBounds.min
          
          if (minValue && minValue > numValue) {
            setPriceError('Prețul minim nu poate fi mai mare decât prețul maxim')
          }
          
          return { ...prev, priceRange: [minValue, numValue] }
        })
      }
    }
  }, [priceBounds.min])

  const handleColorChange = useCallback((event: SelectChangeEvent<string[]>) => {
    const colors = event.target.value as string[]
    setPendingFilters(prev => ({ ...prev, colors }))
  }, [])

  const removeColor = useCallback((colorToRemove: string) => {
    setPendingFilters(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== colorToRemove)
    }))
  }, [])

  const handleCustomFilterChange = useCallback((filterId: string, value: any) => {
    setPendingFilters(prev => ({ ...prev, [filterId]: value }))
  }, [])

  const removeCustomFilterValue = useCallback((filterId: string, valueToRemove: string) => {
    setPendingFilters(prev => {
      const currentValues = prev[filterId] || []
      if (Array.isArray(currentValues)) {
        return {
          ...prev,
          [filterId]: currentValues.filter((v: string) => v !== valueToRemove)
        }
      }
      return prev
    })
  }, [])

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
      // Skip sale/discount filter - it's rendered separately at the top
      if (filter.id === 'is_on_sale') {
        return // Don't add to any group, it's rendered separately
      }
      // Core filters (dimensions, materials, finishes)
      else if (['dimensions', 'finish', 'surface_finish', 'material', 'texture', 'usage_area'].includes(filter.id)) {
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
    // Check if this is a Da/No boolean property - convert to radio group
    const isDaNoProperty = filter.options?.every(opt => 
      opt.value === 'true' || opt.value === 'false' || opt.value === '' || opt.value === 'toate'
    ) && filter.options.some(opt => opt.label === 'Da' || opt.label === 'Nu')

    if (isDaNoProperty && filter.options) {
      return (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {filter.label}
          </Typography>
          <RadioGroup
            value={pendingFilters[filter.id] || ''}
            onChange={(e) => handleCustomFilterChange(filter.id, e.target.value)}
            row
            onClick={(e) => e.stopPropagation()} // Prevent hamburger menu interference
          >
            <FormControlLabel 
              value="" 
              control={<Radio size="small" />} 
              label="Toate" 
              sx={{ mr: 2 }}
            />
            {filter.options.map((option) => (
              option.value !== '' && option.value !== 'toate' && (
                <FormControlLabel 
                  key={option.value}
                  value={option.value} 
                  control={<Radio size="small" />} 
                  label={option.label}
                  sx={{ mr: 2 }}
                />
              )
            ))}
          </RadioGroup>
        </Box>
      )
    }

    if (filter.type === 'select' && filter.options) {
      return (
        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
          <InputLabel sx={{ fontSize: '0.875rem' }}>{filter.label}</InputLabel>
          <Select
            value={pendingFilters[filter.id] || ''}
            onChange={(e) => {
              e.stopPropagation() // Prevent hamburger menu interference
              handleCustomFilterChange(filter.id, e.target.value)
            }}
            label={filter.label}
            displayEmpty
            onClick={(e) => e.stopPropagation()} // Prevent hamburger menu interference
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300, // Limit dropdown height
                },
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              disableAutoFocusItem: true, // Prevent focus issues
              keepMounted: false, // Remove from DOM when closed
            }}
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
            onChange={(e) => {
              e.stopPropagation() // Prevent hamburger menu interference
              handleCustomFilterChange(filter.id, e.target.value)
            }}
            label={filter.label}
            onClick={(e) => e.stopPropagation()} // Prevent hamburger menu interference
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300, // Limit dropdown height
                },
              },
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              disableAutoFocusItem: true, // Prevent focus issues
              keepMounted: false, // Remove from DOM when closed
            }}
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
                      onDelete={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        removeCustomFilterValue(filter.id, value)
                      }}
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

    if (filter.type === 'checkbox' && filter.options) {
      return (
        <Box sx={{ mb: 1.5 }}>
          {filter.options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={pendingFilters[filter.id] === option.value}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCustomFilterChange(filter.id, e.target.checked ? option.value : '')
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.label}
                </Typography>
              }
              sx={{
                display: 'block',
                mb: 0.5,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem'
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
        </Box>
      )
    }

    return null
  }

  // Filter content component - always visible sections
  const FilterContent: React.FC = () => {
    // Find discount filter from customFilters
    const discountFilter = customFilters.find(filter => filter.id === 'is_on_sale')

    return (
      <Stack spacing={2}>
        {/* Sale/Discount Filter - Prominent position at top */}
        {discountFilter && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'rgba(211, 47, 47, 0.04)', // Light red background
              borderColor: 'error.main',
              borderWidth: 2,
            }}
          >
            {discountFilter.options?.map((option) => (
              <Box key={option.value} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer sx={{ color: 'error.main', fontSize: '1.25rem' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'error.main',
                      fontSize: '1rem'
                    }}
                  >
                    {option.label}
                  </Typography>
                </Box>
                <Checkbox
                  checked={pendingFilters[discountFilter.id] === option.value}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleCustomFilterChange(discountFilter.id, e.target.checked ? option.value : '')
                  }}
                  color="error"
                  size="medium"
                />
              </Box>
            ))}
          </Paper>
        )}

        {/* Price Range - Always visible */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Interval preț
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <TextField
            label="Min"
            value={minPriceInput}
            onChange={handleMinPriceInputChange}
            type="number"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">RON</InputAdornment>
            }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', md: '1rem' }
              },
              '& .MuiInputAdornment-root': {
                '& .MuiTypography-root': {
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
            -
          </Typography>
          <TextField
            label="Max"
            value={maxPriceInput}
            onChange={handleMaxPriceInputChange}
            type="number"
            size="small"
            InputProps={{
              endAdornment: <InputAdornment position="end">RON</InputAdornment>
            }}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', md: '1rem' }
              },
              '& .MuiInputAdornment-root': {
                '& .MuiTypography-root': {
                  fontSize: { xs: '0.75rem', md: '0.875rem' }
                }
              }
            }}
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
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // Limit dropdown height
                  },
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                disableAutoFocusItem: true, // Prevent focus issues
                keepMounted: false, // Remove from DOM when closed
              }}
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
                      onDelete={(event) => {
                        event.stopPropagation()
                        event.preventDefault()
                        removeColor(value)
                      }}
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Proprietăți de bază
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.core.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Brand & Quality */}
      {filterGroups.brand.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Brand și calitate
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.brand.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Technical Specifications */}
      {filterGroups.technical.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Specificații tehnice
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.technical.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Technical Capabilities */}
      {filterGroups.capabilities.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Capacități tehnice
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.capabilities.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Suitability */}
      {filterGroups.suitability.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Potrivire aplicații
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.suitability.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Application Areas */}
      {filterGroups.application.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: 'primary.main' }}>
            Zone de aplicare
          </Typography>
          <Stack spacing={1} sx={{ pl: 1 }}>
            {filterGroups.application.map(filter => (
              <Box key={filter.id}>
                {renderFilter(filter)}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Action Buttons - Only show on desktop */}
      {!isMobile && (
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
      )}
    </Stack>
    )
  }

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
        <Card 
          sx={{ mb: 3 }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={2}
            >
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
            // ✅ FIXED: Content-aware height instead of fixed viewport
            height: 'fit-content',
            maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            // Safari iOS specific fixes
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            // ✅ FIXED: Proper safe area handling
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            // ✅ FIXED: Flex layout for proper sizing
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            minHeight: { xs: 72, md: 56 },
            // ✅ ENHANCED: Perfect vertical alignment
            height: { xs: 72, md: 56 },
            // ✅ FIXED: Proper flex behavior
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            backgroundColor: 'background.paper',
            zIndex: 1,
            WebkitUserSelect: 'none',
            userSelect: 'none'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              pr: 2, // Ensure space between title and close button
              flex: 1,
              minWidth: 0 // Allow text to truncate if needed
            }}
          >
            Filtrare produse
          </Typography>
          <IconButton 
            onClick={closeFilterModal}
            sx={{
              minWidth: { xs: 44, md: 40 },
              minHeight: { xs: 44, md: 40 },
              ml: 1 // Extra margin from title
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        {/* ✅ FIXED: Proper scrollable content area */}
        <DialogContent 
          sx={{ 
            pt: 3, 
            pb: 2, // Reduced to give more space to actions
            flex: '1 1 auto', // Allow growing and shrinking
            overflowY: 'auto',
            // ✅ FIXED: Dynamic max height that accounts for header and actions
            maxHeight: 'calc(100vh - 200px - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            minHeight: 0 // Important for flex children
          }}
        >
          <FilterContent />
        </DialogContent>

        {/* ✅ FIXED: Enhanced action buttons with proper spacing */}
        <DialogActions
          sx={{
            // ✅ ENHANCED: Extra padding for Safari popup visibility
            p: 3,
            pt: 2,
            // ✅ ENHANCED: Increased bottom padding to avoid Safari popup
            pb: `calc(80px + env(safe-area-inset-bottom))`,
            borderTop: '1px solid',
            borderColor: 'divider',
            gap: 1.5,
            // ✅ FIXED: Proper sticky positioning
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1000, // Increased z-index
            // ✅ ENHANCED: Increased minimum height for Safari compatibility
            minHeight: { xs: 120, md: 64 },
            boxSizing: 'border-box',
            // ✅ FIXED: Prevent shrinking to ensure buttons stay visible
            flexShrink: 0,
            // ✅ FIXED: Ensure buttons don't get clipped
            width: '100%',
            // ✅ ENHANCED: Additional Safari-specific spacing
            '@supports (-webkit-touch-callout: none)': {
              pb: `calc(100px + env(safe-area-inset-bottom))`,
              minHeight: { xs: 140, md: 64 }
            }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearAllFilters}
            sx={{
              flex: 1,
              // ✅ CONFIRMED: Already compliant with CLAUDE.md (52px ≥ 48px)
              minHeight: { xs: 52, md: 40 },
              fontSize: { xs: '1rem', md: '0.875rem' },
              // Safari iOS specific fixes
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation'
            }}
          >
            Șterge tot
          </Button>
          <Badge 
            color="error" 
            variant="dot" 
            invisible={!hasPendingChanges()}
            sx={{ flex: 1 }}
          >
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={applyFilters}
              disabled={!!priceError}
              fullWidth
              sx={{
                // ✅ CONFIRMED: Already compliant with CLAUDE.md (52px ≥ 48px)
                minHeight: { xs: 52, md: 40 },
                fontSize: { xs: '1rem', md: '0.875rem' },
                // Safari iOS specific fixes
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'manipulation'
              }}
            >
              Aplică filtrele
            </Button>
          </Badge>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProductFilter