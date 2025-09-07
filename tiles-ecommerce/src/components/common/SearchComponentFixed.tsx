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
  IconButton,
  Modal,
  AppBar,
  Toolbar
} from '@mui/material'
import { Search, Close, ArrowBack } from '@mui/icons-material'
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
  const [mobileModalOpen, setMobileModalOpen] = useState(false)

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
          .gt('stock_quantity', 0)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(8)
          .order('name')

        if (productsError) throw productsError

        // Search categories
        const { data: categoryResults, error: categoryError } = await supabase
          .from('categories')
          .select('*')
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
    
    if (value.length > 0) {
      setOpen(true)
    } else {
      setOpen(false)
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
    setAnchorEl(null)
  }

  const handleProductSelect = (product: SearchResult) => {
    setQuery('')
    setOpen(false)
    setMobileModalOpen(false)
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
    setMobileModalOpen(false)
    // Navigate to category page
    window.location.href = `/${category.slug}`
  }

  const clearSearch = () => {
    setQuery('')
    setOpen(false)
    setAnchorEl(null)
    setResults([])
    setCategories([])
  }

  const openMobileModal = () => {
    setMobileModalOpen(true)
  }

  const closeMobileModal = () => {
    setMobileModalOpen(false)
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

  // Desktop version - show textfield with popper
  const DesktopSearch = () => (
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
              md: 260, // Medium screens
              lg: 300, // Desktop
              xl: 320  // Large desktop
            }
          }}
        />

        <Popper
          open={open && query.length > 0}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          sx={{ 
            zIndex: 1400, // Higher than AppBar and other navbar elements
            width: {
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

  // Mobile version - show icon button that opens modal
  const MobileSearchIcon = () => (
    <IconButton 
      onClick={openMobileModal}
      sx={{ 
        minWidth: 44,
        minHeight: 44,
        p: 1.5,
        color: 'text.primary'
      }}
      aria-label="Căutare produse"
    >
      <Search />
    </IconButton>
  )

  // Full-screen search modal for mobile
  const MobileSearchModal = () => (
    <Modal
      open={mobileModalOpen}
      onClose={closeMobileModal}
      sx={{
        zIndex: 1400 // Ensure mobile search modal is above everything
      }}
    >
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <AppBar 
          position="static" 
          elevation={1}
          sx={{ 
            backgroundColor: 'white', 
            color: 'black' 
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={closeMobileModal}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Căutare produse
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Search Input */}
        <Box sx={{ p: 2 }}>
          <TextField
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            size="medium"
            variant="outlined"
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 24 }} />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={clearSearch}
                    sx={{ p: 1 }}
                  >
                    <Close sx={{ fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'background.paper',
                borderRadius: 2,
                minHeight: 48,
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
          />
        </Box>

        {/* Search Results */}
        <Box 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#f5f5f5'
          }}
        >
          {query.length > 0 ? (
            <Paper sx={{ m: 2, borderRadius: 2 }}>
              {renderResults()}
            </Paper>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Search sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Caută prin produsele noastre
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Introdu cel puțin 2 caractere pentru a începe căutarea
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  )

  return (
    <>
      {/* Show textfield on desktop, icon on mobile */}
      {isMobile ? <MobileSearchIcon /> : <DesktopSearch />}
      
      {/* Mobile search modal */}
      <MobileSearchModal />
    </>
  )
}

export default SearchComponent