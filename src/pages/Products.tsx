import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useNavigateWithScroll } from '../hooks/useNavigateWithScroll'
import { FEATURES, PRESENTATION_MESSAGES } from '../config/features'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Paper,
  Skeleton,
  Container,
  Breadcrumbs,
  Link,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material'
import {
  Category,
  Image,
  AspectRatio,
  Palette,
  FilterList,
  TrendingUp,
  TrendingDown,
  SortByAlpha
} from '@mui/icons-material'
import { Pagination } from '@mui/material'
import { useProductStore } from '../stores/products'
import type { Product } from '../types'
import ProductFilter, { type ProductFilters } from '../components/product/ProductFilter'
import { getCategoryFilters } from '../components/product/CategoryFilters'
import { sortProducts, type SortOption } from '../utils/productFilters'
import { generateProductSlug } from '../utils/slugUtils'
import { useCategorySpecs } from '../hooks/useCategorySpecs'
import OptimizedProductCard from '../components/product/OptimizedProductCard'

const Products: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const navigate = useNavigateWithScroll()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    products,
    categories,
    allCategoryProducts,
    loading,
    pagination,
    fetchCategories,
    fetchProductsByCategory,
    fetchAllCategoryProducts
  } = useProductStore()

  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)
  const [previousCategorySlug, setPreviousCategorySlug] = useState<string | undefined>()

  // Parse filters from URL params
  const filters: ProductFilters = React.useMemo(() => {
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const colors = searchParams.get('colors')
    const isOnSale = searchParams.get('is_on_sale')

    const parsedFilters: ProductFilters = {
      priceRange: [
        priceMin ? parseInt(priceMin) : 0,
        priceMax ? parseInt(priceMax) : 0
      ],
      colors: colors ? colors.split(',').filter(Boolean) : []
    }

    // Add any custom filters from URL params
    Object.keys(Object.fromEntries(searchParams)).forEach(key => {
      if (!['priceMin', 'priceMax', 'colors', 'page'].includes(key)) {
        (parsedFilters as any)[key] = searchParams.get(key)
      }
    })

    return parsedFilters
  }, [searchParams])

  const currentPage = parseInt(searchParams.get('page') || '1')

  // Helper to check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    return (
      (filters.priceRange[0] > 0 || filters.priceRange[1] > 0) ||
      filters.colors.length > 0 ||
      Object.keys(filters).some(key =>
        !['priceRange', 'colors'].includes(key) && (filters as any)[key]
      )
    )
  }, [filters])

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [fetchCategories])

  // Load page data when category changes or categories are loaded
  useEffect(() => {
    if (!categorySlug) {
      navigate('/')
      return
    }

    if (categories.length === 0) {
      setInitialLoading(true)
      return // Wait for categories to load
    }

    const category = categories.find(cat => cat.slug === categorySlug)
    if (!category) {
      navigate('/')
      return
    }

    const loadProducts = async () => {
      try {
        // Detect if category changed (navigation between categories)
        const categoryChanged = previousCategorySlug && previousCategorySlug !== categorySlug

        if (initialLoading) {
          setInitialLoading(true)
        } else if (categoryChanged) {
          // When navigating between categories, show skeleton for both products and filters
          setProductsLoading(true)
          setFiltersLoading(true)
        } else {
          // When applying filters or pagination, only show skeleton for products
          setProductsLoading(true)
        }

        await Promise.all([
          fetchProductsByCategory(category.id, currentPage, 12, filters),
          fetchAllCategoryProducts(category.id)
        ])

        // Update previous category for next comparison
        setPreviousCategorySlug(categorySlug)
      } finally {
        setInitialLoading(false)
        setProductsLoading(false)
        setFiltersLoading(false)
      }
    }

    loadProducts()
  }, [categorySlug, categories, currentPage, filters, navigate])

  // Handle filters change
  const handleFiltersChange = (newFilters: ProductFilters) => {
    const newSearchParams = new URLSearchParams()

    // Set price range
    if (newFilters.priceRange[0] > 0) newSearchParams.set('priceMin', newFilters.priceRange[0].toString())
    if (newFilters.priceRange[1] > 0) newSearchParams.set('priceMax', newFilters.priceRange[1].toString())

    // Set colors
    if (newFilters.colors.length > 0) newSearchParams.set('colors', newFilters.colors.join(','))

    // Set custom filters
    Object.keys(newFilters).forEach(key => {
      if (!['priceRange', 'colors'].includes(key)) {
        const value = (newFilters as any)[key]
        if (value) newSearchParams.set(key, value.toString())
      }
    })

    // Reset to first page when filters change
    newSearchParams.set('page', '1')

    setSearchParams(newSearchParams)
  }

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('page', page.toString())
    setSearchParams(newSearchParams)
  }

  const currentCategory = categories.find(cat => cat.slug === categorySlug)

  // Get visibility configuration for the category
  const { isSpecVisible } = useCategorySpecs(categorySlug)

  // Get category-specific filter options with visibility configuration
  const customFilters = React.useMemo(() => {
    if (!categorySlug || allCategoryProducts.length === 0) return []
    // Always use allCategoryProducts for filter counts since they should show total availability
    // The filtering logic handles what gets displayed, but users need to see total potential
    return getCategoryFilters(categorySlug, allCategoryProducts, isSpecVisible, allCategoryProducts)
  }, [categorySlug, allCategoryProducts, isSpecVisible])

  // Products are already filtered and paginated from backend
  // Just apply sorting on the current page results
  const sortedProducts = React.useMemo(() => {
    if (products.length === 0) return []
    return sortProducts(products, sortBy)
  }, [products, sortBy])

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget)
  }

  const handleSortClose = () => {
    setSortAnchorEl(null)
  }

  const handleSortSelect = (sortOption: SortOption) => {
    setSortBy(sortOption)
    handleSortClose()
  }

  const generateProductUrl = (product: Product) => {
    const category = categories.find(c => c.id === product.category_id)
    if (!category) return '#'
    
    const productSlug = generateProductSlug(product.name)
    return `/${category.slug}/${productSlug}/${product.id}`
  }

  // Use OptimizedProductCard with discount functionality
  const ProductCard: React.FC<{ product: Product }> = React.memo(({ product }) => {
    // Add categories property for OptimizedProductCard compatibility
    const productWithCategory = {
      ...product,
      categories: categories.find(c => c.id === product.category_id)
    }

    return <OptimizedProductCard product={productWithCategory} />
  })


  // Skeleton cards for loading state
  const SkeletonCard = () => (
    <Card sx={{ borderRadius: 3 }}>
      <Skeleton variant="rectangular" height={240} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={28} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2, borderRadius: 2 }} />
      </CardContent>
    </Card>
  )

  // Filter skeleton for loading state
  const FilterSkeleton = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        {/* Header skeleton */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Skeleton variant="text" width="140px" height={32} />
          <Skeleton variant="rectangular" width="80px" height={24} sx={{ borderRadius: 3 }} />
        </Box>
        
        {/* Price range section skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="100px" height={20} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
            <Box sx={{ flex: 1, px: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={20} sx={{ borderRadius: 10 }} />
            </Box>
            <Skeleton variant="rectangular" width={90} height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Color filter section skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="80px" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Custom filters skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="120px" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Breadcrumbs - Absolute top-left positioning */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 16,
          left: 24,
          zIndex: (theme) => theme.zIndex.overlay
        }}
      >
        <Breadcrumbs>
          <Link 
            component="button" 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Acasă
          </Link>
          {currentCategory && (
            <Typography color="text.primary">{currentCategory.name}</Typography>
          )}
        </Breadcrumbs>
      </Box>

      {/* Main content with top padding for breadcrumbs */}
      <Container maxWidth="xl" sx={{ py: 4, pt: 10 }}>

      {/* Header with Filter and Sort Buttons */}
      <Box mb={4}>
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mb={2}>
          {/* Filter Button - Mobile Only */}
          {isMobile && products.length > 0 && (
            <Button
              variant="outlined"
              onClick={() => {/* TODO: implement mobile filter */}}
              sx={{
                height: 'fit-content',
                textTransform: 'none'
              }}
            >
              Filtrează produsele
            </Button>
          )}

          {/* Sort Button */}
          {products.length > 0 && (
            <Button
              variant="outlined"
              onClick={handleSortClick}
              sx={{
                minWidth: 'auto',
                height: 'fit-content',
                textTransform: 'none',
                px: 2
              }}
            >
              <FilterList />
            </Button>
          )}
        </Box>
      </Box>


      {/* Initial Loading State - Show full skeleton */}
      {initialLoading && (
        <Grid container spacing={3}>
          {/* Filter skeleton - only show on desktop during initial loading */}
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4 }}>
              <FilterSkeleton />
            </Grid>
          )}

          {/* Products skeleton grid */}
          <Grid size={{ xs: 12, md: isMobile ? 12 : 8 }}>
            <Grid container spacing={2}>
              {[...Array(8)].map((_, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                  <SkeletonCard />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Empty State - No products in category at all (only when no filters applied) */}
      {!initialLoading && products.length === 0 && !hasActiveFilters && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ 
            minHeight: '400px',
            textAlign: 'center',
            py: 8,
            px: 4
          }}
        >
          <Category sx={{ fontSize: '5rem', color: 'text.disabled', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            {currentCategory 
              ? `Nu sunt produse în categoria ${currentCategory.name}` 
              : 'Nu sunt produse disponibile'
            }
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            Ne pare rău, momentan nu avem produse în această categorie. 
            Vă rugăm să reveniți mai târziu sau să explorați alte categorii.
          </Typography>
        </Box>
      )}

      {/* Main Content Grid with Sidebar - Always show when category exists */}
      {!initialLoading && currentCategory && (
        <Grid container spacing={3}>
          {/* Filter Sidebar - Always visible when category exists */}
          <Grid size={{ xs: 12, md: 4 }}>
            {filtersLoading ? (
              <FilterSkeleton />
            ) : (
              <ProductFilter
                products={allCategoryProducts}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                customFilters={customFilters}
                loading={false}
              />
            )}
          </Grid>

          {/* Products Grid - Show products or filtered empty state */}
          <Grid size={{ xs: 12, md: 8 }}>
            {productsLoading ? (
              /* Products loading skeleton when filters change */
              <Grid container spacing={2}>
                {[...Array(8)].map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                    <SkeletonCard />
                  </Grid>
                ))}
              </Grid>
            ) : sortedProducts.length > 0 ? (
              <>
                {/* Results count and pagination info */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {pagination.totalCount} {pagination.totalCount === 1 ? 'produs găsit' : 'produse găsite'}
                    {pagination.totalPages > 1 && (
                      <span> • Pagina {pagination.page} din {pagination.totalPages}</span>
                    )}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {sortedProducts.map((product) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.page}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? 'medium' : 'large'}
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPagination-ul': {
                          justifyContent: 'center'
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                sx={{ 
                  minHeight: '400px',
                  textAlign: 'center',
                  py: 8 
                }}
              >
                <Category sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.secondary">
                  Nu au fost găsite produse
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                  Nu există produse în categoria "{currentCategory.name}" care să corespundă filtrelor selectate.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleFiltersChange({ priceRange: [0, 0], colors: [] })}
                  size="large"
                >
                  Șterge toate filtrele
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={(event, reason) => {
          handleSortClose()
          // Force cleanup
          setTimeout(() => {
            if (document.activeElement && document.activeElement !== document.body) {
              (document.activeElement as HTMLElement).blur?.()
            }
          }, 100)
        }}
        disableScrollLock={true}
        disableRestoreFocus={true}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        // Force unmount when closed
        keepMounted={false}
        // Fast exit transition
        transitionDuration={{
          enter: 225,
          exit: 50,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            boxShadow: theme.shadows[8]
          }
        }}
        // Prevent backdrop interference
        BackdropProps={{
          invisible: true,
        }}
      >
        <MenuItem 
          onClick={() => handleSortSelect('name-asc')}
          selected={sortBy === 'name-asc'}
        >
          <ListItemIcon>
            <SortByAlpha fontSize="small" />
          </ListItemIcon>
          <ListItemText>De la A-Z</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortSelect('name-desc')}
          selected={sortBy === 'name-desc'}
        >
          <ListItemIcon>
            <SortByAlpha fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
          </ListItemIcon>
          <ListItemText>De la Z-A</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortSelect('price-asc')}
          selected={sortBy === 'price-asc'}
        >
          <ListItemIcon>
            <TrendingUp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preț crescător</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleSortSelect('price-desc')}
          selected={sortBy === 'price-desc'}
        >
          <ListItemIcon>
            <TrendingDown fontSize="small" />
          </ListItemIcon>
          <ListItemText>Preț descrescător</ListItemText>
        </MenuItem>
      </Menu>
      </Container>
    </Box>
  )
}

export default Products