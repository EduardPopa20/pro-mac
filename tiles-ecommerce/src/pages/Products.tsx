import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
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
  ListItemText
} from '@mui/material'
import {
  Category,
  Euro,
  Image,
  AspectRatio,
  Palette,
  TextureOutlined,
  LocationOn,
  ShoppingCart,
  FilterList,
  TrendingUp,
  TrendingDown,
  SortByAlpha
} from '@mui/icons-material'
import { Pagination } from '@mui/material'
import { useProductStore } from '../stores/products'
import type { Product } from '../types'
import RealTimeStatus from '../components/common/RealTimeStatus'
import ProductFilter, { type ProductFilters } from '../components/product/ProductFilter'
import { getCategoryFilters } from '../components/product/CategoryFilters'
import { applyProductFilters, sortProducts, type SortOption } from '../utils/productFilters'
import { generateProductSlug } from '../utils/slugUtils'

const Products: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const { 
    products, 
    categories, 
    allCategoryProducts,
    loading, 
    error, 
    pagination,
    fetchCategories,
    fetchProductsByCategory,
    fetchAllCategoryProducts
  } = useProductStore()
  
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    priceRange: [0, 0],
    colors: []
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (!categorySlug) {
      navigate('/')
      return
    }

    const category = categories.find(cat => cat.slug === categorySlug)
    if (category) {
      fetchProductsByCategory(category.id, currentPage, 12, filters)
      // Also fetch all products for the category (for filter options)
      fetchAllCategoryProducts(category.id)
    } else if (categories.length > 0) {
      // Category not found - redirect to home
      navigate('/')
    }
  }, [categorySlug, categories, fetchProductsByCategory, fetchAllCategoryProducts, navigate, currentPage])

  // Handle filters change
  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
    const category = categories.find(cat => cat.slug === categorySlug)
    if (category) {
      fetchProductsByCategory(category.id, 1, 12, newFilters)
    }
  }

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
    const category = categories.find(cat => cat.slug === categorySlug)
    if (category) {
      fetchProductsByCategory(category.id, page, 12, filters)
    }
  }

  const currentCategory = categories.find(cat => cat.slug === categorySlug)

  // Get category-specific filter options
  const customFilters = React.useMemo(() => {
    if (!categorySlug || allCategoryProducts.length === 0) return []
    return getCategoryFilters(categorySlug, allCategoryProducts)
  }, [categorySlug, allCategoryProducts])

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

  const ProductCard: React.FC<{ product: Product }> = React.memo(({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
          cursor: 'pointer'
        },
        borderRadius: 3,
        overflow: 'hidden'
      }}
      onClick={() => navigate(generateProductUrl(product))}
    >
        {/* Product Image */}
        <Box sx={{ position: 'relative', paddingBottom: '60%' }}>
          {product.image_url ? (
            <CardMedia
              component="img"
              image={product.image_url}
              alt={product.name}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}
            >
              <Image sx={{ fontSize: 48, color: 'grey.400' }} />
            </Box>
          )}
          
        </Box>

        {/* Product Info */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {product.name}
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            <Typography 
              variant="h5" 
              color="primary.main" 
              sx={{ fontWeight: 700 }}
            >
              {product.price.toFixed(2)} RON
            </Typography>
          </Box>

          {/* Quick specs */}
          <Stack spacing={0.5} mb={2}>
            {product.dimensions && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <AspectRatio sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {product.dimensions}
                </Typography>
              </Box>
            )}
            {product.color && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Palette sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {product.color}
                </Typography>
              </Box>
            )}
          </Stack>

        </CardContent>
      </Card>
  ))


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
          zIndex: 10
        }}
      >
        <Breadcrumbs>
          <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          {currentCategory && (
            <Typography color="text.primary">{currentCategory.name}</Typography>
          )}
        </Breadcrumbs>
      </Box>

      {/* Main content with top padding for breadcrumbs */}
      <Container maxWidth="xl" sx={{ py: 4, pt: 10 }}>
        {/* Real-time status indicator */}
        {/* <RealTimeStatus showStatus={true} position="top-right" /> */}

      {/* Header with Sort Button */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {currentCategory ? currentCategory.name : 'Produse'}
            </Typography>
          </Box>
          
          {/* Sort Button */}
          {products.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleSortClick}
              sx={{ 
                minWidth: 140,
                height: 'fit-content',
                textTransform: 'none'
              }}
            >
              Sortează
            </Button>
          )}
        </Box>
      </Box>


      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {/* Filter skeleton - only show on desktop during loading */}
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

      {/* Empty State - No products in category at all */}
      {!loading && products.length === 0 && (
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

      {/* Main Content Grid with Sidebar */}
      {!loading && products.length > 0 && (
        <Grid container spacing={3}>
          {/* Filter Sidebar - Made larger */}
          <Grid size={{ xs: 12, md: 4 }}>
            {currentCategory && (
              <ProductFilter
                products={allCategoryProducts}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                customFilters={customFilters}
                loading={loading}
              />
            )}
          </Grid>

          {/* Products Grid - Made smaller to accommodate larger filter bar */}
          <Grid size={{ xs: 12, md: 8 }}>
            {sortedProducts.length > 0 ? (
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
                  {currentCategory 
                    ? `Nu există produse în categoria "${currentCategory.name}" care să corespundă filtrelor selectate.`
                    : 'Nu au fost găsite produse pentru această căutare.'
                  }
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
        onClose={handleSortClose}
        disableScrollLock={true}
        disableRestoreFocus={true}
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