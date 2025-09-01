import React, { useState, useEffect, useCallback } from 'react'
import {
  TextField,
  Popper,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Skeleton,
  ClickAwayListener,
  Fade,
  Divider,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Search, Close } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'
import type { Product, Category } from '../../types'

interface SearchResult {
  id: number
  name: string
  slug: string
  price: number
  image_url?: string
  category?: {
    id: number
    name: string
    slug: string
  }
  description?: string
  dimensions?: string
  material?: string
}

interface SearchComponentProps {
  onProductSelect?: (product: SearchResult) => void
  placeholder?: string
  size?: 'small' | 'medium'
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onProductSelect,
  placeholder = "Caută produse...",
  size = 'small'
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // Debounced search function
  const searchProducts = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([])
        setCategories([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Search products by name and description
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            image_url,
            description,
            dimensions,
            material,
            category:categories(
              id,
              name,
              slug
            )
          `)
          .eq('is_active', true)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(8)
          .order('name')

        if (productsError) throw productsError

        // Search categories
        const { data: categoryResults, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .ilike('name', `%${searchQuery}%`)
          .limit(3)
          .order('name')

        if (categoryError) throw categoryError

        setResults(products || [])
        setCategories(categoryResults || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchProducts])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setQuery(value)
    
    if (value.length > 0 && !open) {
      setOpen(true)
    }
  }

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget)
    if (query.length > 0) {
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleProductSelect = (product: SearchResult) => {
    setQuery('')
    setOpen(false)
    if (onProductSelect) {
      onProductSelect(product)
    } else {
      // Default navigation - redirect to product page
      window.location.href = `/${product.category?.slug || 'produse'}/${product.slug}/${product.id}`
    }
  }

  const handleCategorySelect = (category: Category) => {
    setQuery('')
    setOpen(false)
    // Navigate to category page
    window.location.href = `/${category.slug}`
  }

  const clearSearch = () => {
    setQuery('')
    setOpen(false)
  }

  const renderSkeletons = () => (
    <Box sx={{ p: 2 }}>
      {[1, 2, 3].map((index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="rectangular" width={60} height={60} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
        </Box>
      ))}
    </Box>
  )

  const renderResults = () => {
    const hasResults = results.length > 0 || categories.length > 0

    if (loading) {
      return renderSkeletons()
    }

    if (!hasResults && query.length >= 2) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nu s-au găsit produse pentru "{query}"
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Încearcă alte cuvinte cheie
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {/* Categories section */}
        {categories.length > 0 && (
          <>
            <Box sx={{ p: 2, pb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Categorii
              </Typography>
            </Box>
            {categories.map((category) => (
              <Box
                key={`category-${category.id}`}
                onClick={() => handleCategorySelect(category)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'grey.50' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: theme.palette.primary.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Search sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vezi toate produsele din această categorie
                  </Typography>
                </Box>
              </Box>
            ))}
            {results.length > 0 && <Divider />}
          </>
        )}

        {/* Products section */}
        {results.length > 0 && (
          <>
            {categories.length > 0 && (
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Produse
                </Typography>
              </Box>
            )}
            {results.map((product) => (
              <Box
                key={`product-${product.id}`}
                onClick={() => handleProductSelect(product)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { backgroundColor: 'grey.50' },
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {product.image_url ? (
                    <Box
                      component="img"
                      src={product.image_url}
                      alt={product.name}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        objectFit: 'cover',
                        backgroundColor: 'grey.100'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 1,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Search sx={{ color: 'text.disabled', fontSize: 24 }} />
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                      {product.price.toFixed(2)} RON
                    </Typography>
                    {product.category && (
                      <Typography variant="caption" color="text.secondary">
                        {product.category.name}
                      </Typography>
                    )}
                    {product.dimensions && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        • {product.dimensions}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </>
        )}

        {/* View all results footer */}
        {hasResults && query.length >= 2 && (
          <Box
            sx={{
              p: 2,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ 
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => {
                setQuery('')
                setOpen(false)
                window.location.href = `/produse?search=${encodeURIComponent(query)}`
              }}
            >
              Vezi toate rezultatele pentru "{query}"
            </Typography>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          size={size}
          variant="outlined"
          data-testid="search-input"
          id="global-search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ p: 0.5 }}
                >
                  <Close sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: 1
              }
            }
          }}
          sx={{
            width: {
              xs: 180, // Mobile
              sm: 220, // Small tablet  
              md: 260, // Medium screens
              lg: 300, // Desktop
              xl: 320  // Large desktop
            },
            // Force WCAG AA compliance: 44px minimum touch target on mobile with highest specificity
            '&.MuiTextField-root': {
              '@media (max-width: 959px)': { // Direct media query for mobile/tablet
                '& .MuiOutlinedInput-root': {
                  minHeight: '44px !important',
                  height: '44px !important',
                  '& .MuiInputBase-input': {
                    minHeight: '20px',
                    py: 0.9, // Adjusted padding for 44px total
                    fontSize: 'max(0.875rem, 14px)'
                  }
                }
              },
              '@media (min-width: 960px)': { // Desktop
                '& .MuiOutlinedInput-root': {
                  minHeight: 36,
                  height: 'auto',
                  '& .MuiInputBase-input': {
                    py: size === 'small' ? 0.75 : 1.5,
                    fontSize: size === 'small' ? 'max(0.875rem, 14px)' : 'max(1rem, 16px)'
                  }
                }
              }
            }
          }}
        />

        <Popper
          open={open && query.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          sx={{ 
            zIndex: theme.zIndex.modal + 1,
            width: {
              xs: 180,
              sm: 220,
              md: 260,
              lg: 300,
              xl: 320
            }
          }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                sx={{
                  mt: 1,
                  boxShadow: theme.shadows[8],
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  width: {
                    xs: 180,
                    sm: 220,
                    md: 260,
                    lg: 300,
                    xl: 320
                  }
                }}
              >
                {renderResults()}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  )
}

export default SearchComponent