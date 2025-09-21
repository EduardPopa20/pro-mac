import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigateWithScroll } from '../hooks/useNavigateWithScroll'
import { FEATURES, PRESENTATION_MESSAGES } from '../config/features'
import {
  Box,
  Typography,
  Card,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Container,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  Backdrop,
  Tooltip,
  Grid
} from '@mui/material'
import {
  ShoppingCart,
  Share,
  Favorite,
  FavoriteBorder,
  Fullscreen,
  AspectRatio,
  Close,
  Info,
  BuildCircle,
  CleanHands,
  Grade,
  Remove,
  Add
} from '@mui/icons-material'
import { useProductStore } from '../stores/products'
import type { Product } from '../types'
import { generateProductSlug } from '../utils/slugUtils'
import { useWatchlistStore } from '../stores/watchlist'
import { useCartStore } from '../stores/cart'
import { useGlobalAlertStore } from '../stores/globalAlert'
import { useAuthStore } from '../stores/auth'
import ProductSpecs from '../components/product/ProductSpecs'

const ProductDetail: React.FC = () => {
  const { productSlug, productId } = useParams<{ productSlug: string; productId: string }>()
  const navigate = useNavigateWithScroll()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const { products, categories, loading, fetchProducts, fetchCategories } = useProductStore()
  const { toggleWatchlist, isInWatchlist } = useWatchlistStore()
  const { addItem } = useCartStore()
  const { showAlert } = useGlobalAlertStore()
  const { user } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [fullScreenImage, setFullScreenImage] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    
    // Immediately scroll to top on mobile when component mounts
    if (isMobile) {
      window.scrollTo(0, 0)
    }
  }, [fetchCategories, fetchProducts, isMobile])

  useEffect(() => {
    if (!productId || !products.length) return
    
    const foundProduct = products.find(p => p.id === parseInt(productId))
    
    if (foundProduct) {
      // Verify the slug matches the product name
      const expectedSlug = generateProductSlug(foundProduct.name)
      
      if (productSlug !== expectedSlug) {
        // Redirect to correct URL
        const category = categories.find(c => c.id === foundProduct.category_id)
        if (category) {
          navigate(`/${category.slug}/${expectedSlug}/${foundProduct.id}`, { replace: true })
        }
        return
      }
      
      setProduct(foundProduct)
      
      // Update document title for SEO
      document.title = `${foundProduct.name} | Pro-Mac`
      
      // Scroll to top on mobile to prevent auto-scroll to specs
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } else if (!loading) {
      // Product not found
      navigate('/', { replace: true })
    }
  }, [productId, productSlug, products, categories, loading, navigate, isMobile])


  const handleShare = async () => {
    if (!product) return

    // Prepare share data
    const shareData = {
      title: product.name,
      text: product.description || `${product.name} - Pro-Mac`,
      url: window.location.href,
    }

    // Check if native sharing is available
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        // Native sharing succeeded - no alerts needed
      } catch (error) {
        // Handle errors - only fallback on real errors, not user cancellation
        if ((error as Error).name !== 'AbortError') {
          // Real error occurred - fallback to clipboard
          try {
            await navigator.clipboard.writeText(window.location.href)
            showAlert({ 
              message: 'Link copiat în clipboard!', 
              severity: 'success' 
            })
          } catch {
            // Even clipboard failed - silent failure
          }
        }
        // If AbortError (user cancelled), do nothing
      }
    } else {
      // Browser doesn't support native sharing - use clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        showAlert({ 
          message: 'Link copiat în clipboard!', 
          severity: 'success' 
        })
      } catch {
        // Clipboard failed - silent failure
      }
    }
  }



  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      await addItem(product, quantity)
      showAlert({
        type: 'success',
        message: `${product.name} a fost adăugat în coș!`,
        duration: 3000
      })
      setQuantity(1) // Reset quantity after adding
    } catch (error) {
      showAlert({
        type: 'error',
        message: 'Eroare la adăugarea în coș. Încercați din nou.',
        duration: 3000
      })
      console.error('Error adding to cart:', error)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (product?.stock_quantity && newQuantity > product.stock_quantity) return
    setQuantity(newQuantity)
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 200px)' }}>
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h6">Se încarcă...</Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 200px)' }}>
          <Stack alignItems="center" spacing={2}>
            <Typography variant="h6">Produsul nu a fost găsit</Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  const category = categories.find(c => c.id === product.category_id)

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      {/* Breadcrumbs - Responsive positioning */}
      <Box 
        sx={{ 
          position: { xs: 'relative', md: 'absolute' }, // Relative on mobile, absolute on desktop
          top: { xs: 0, md: 16 },
          left: { xs: 0, md: 24 },
          right: { xs: 0, md: 'auto' },
          zIndex: (theme) => theme.zIndex.overlay,
          px: { xs: 2, md: 0 }, // Padding on mobile
          py: { xs: 2, md: 0 },
          backgroundColor: { xs: 'background.paper', md: 'transparent' }, // Background on mobile for readability
          borderRadius: { xs: 1, md: 0 }
        }}
      >
        <Breadcrumbs
          maxItems={3}
          sx={{
            '& .MuiBreadcrumbs-ol': {
              flexWrap: { xs: 'nowrap', md: 'wrap' }
            },
            '& .MuiBreadcrumbs-li': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: '120px', sm: '200px', md: 'none' }
            }
          }}
        >
          <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          {category && (
            <Link 
              color="inherit" 
              href={`/${category.slug}`} 
              sx={{ textDecoration: 'none' }}
            >
              {category.name}
            </Link>
          )}
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main content with responsive padding */}
      <Container maxWidth="lg" sx={{ py: 3, pt: { xs: 1, md: 8 } }}>

      {/* Product Content */}
      <Grid container spacing={3}>
        {/* Product Image - Left side on desktop, top on mobile */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ 
            position: 'relative', 
            aspectRatio: '1/1', 
            maxHeight: { 
              xs: '400px', 
              md: 'min(400px, calc(100vh - 300px))' 
            } 
          }}>
            {product.image_url ? (
              <Box
                component="img"
                src={product.image_url}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => setFullScreenImage(true)}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                  cursor: 'pointer'
                }}
                onClick={() => setFullScreenImage(true)}
              >
                <Stack alignItems="center" spacing={2}>
                  <AspectRatio sx={{ fontSize: 80, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary">
                    Imagine indisponibilă
                  </Typography>
                </Stack>
              </Box>
            )}
            
            {/* Fullscreen Button */}
            <IconButton
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'white' }
              }}
              onClick={() => setFullScreenImage(true)}
            >
              <Fullscreen />
            </IconButton>
          </Card>
        </Grid>

        {/* Product Details Table - Right side on desktop, bottom on mobile */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ 
            height: 'fit-content', 
            maxHeight: { 
              xs: 'none', 
              md: 'min(500px, calc(100vh - 300px))' 
            },
            display: 'flex', 
            flexDirection: 'column'
          }}>
            {/* Product Title and Actions */}
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h3" sx={{ fontWeight: 700, flex: 1, mr: 2 }}>
                  {product.name}
                </Typography>
                
                <Box display="flex" gap={1}>
                  {/* Hide watchlist functionality in presentation mode */}
                  {FEATURES.ECOMMERCE_ENABLED && (
                    <Tooltip title={product && isInWatchlist(product.id) ? 'Elimină din favorite' : 'Adaugă la favorite'}>
                      <IconButton
                        onClick={() => product && toggleWatchlist(product, !!user)}
                        color={product && isInWatchlist(product.id) ? 'error' : 'default'}
                      >
                        {product && isInWatchlist(product.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Tooltip>
                  )}
                  {/* Share Button - Only show on mobile/tablet */}
                  {isMobile && (
                    <Tooltip title="Distribuie produs">
                      <IconButton onClick={handleShare}>
                        <Share />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {/* Brand and Product Code */}
              <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                {product.brand && (
                  <Chip label={product.brand} color="primary" variant="outlined" size="small" />
                )}
                {product.product_code && (
                  <Chip label={`Cod: ${product.product_code}`} variant="outlined" size="small" />
                )}
              </Stack>

              {/* Pricing */}
              <Stack spacing={1}>
                {FEATURES.SHOW_PRICES ? (
                  product.special_price && product.special_price < product.price ? (
                    <>
                      <Typography
                        variant="h4"
                        color="error"
                        sx={{ fontWeight: 700 }}
                      >
                        {product.special_price.toFixed(0)} RON / m²
                        <Chip label="OFERTĂ" color="error" size="small" sx={{ ml: 2 }} />
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        Preț normal: {product.price.toFixed(0)} RON / m²
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      {product.price.toFixed(0)} RON / m²
                    </Typography>
                  )
                ) : (
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  >
                    {PRESENTATION_MESSAGES.PRICE_REQUEST}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Description */}
            {product.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Descriere
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
              </Box>
            )}

            {/* Care Instructions and Installation Notes */}
            {(product.installation_notes || product.care_instructions) && (
              <Paper sx={{ p: 2, mb: 3 }}>
                {product.installation_notes && (
                  <Box mb={2}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildCircle fontSize="small" color="primary" />
                      Instrucțiuni montaj
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.installation_notes}
                    </Typography>
                  </Box>
                )}
                
                {product.care_instructions && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CleanHands fontSize="small" color="primary" />
                      Instrucțiuni îngrijire
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.care_instructions}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

            {/* Price and Actions Section */}
            <Box sx={{ mt: 2, mb: 3 }}>
              {/* Price Display - Always show */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Preț
                </Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                  {FEATURES.SHOW_PRICES && product.price ? `${product.price.toFixed(2)} RON` : PRESENTATION_MESSAGES.PRICE_REQUEST || 'Preț la cerere'}
                </Typography>
              </Box>
              {/* Single row layout with proper spacing */}
              <Box
                display="flex"
                alignItems="center"
                gap={{ xs: 1, sm: 2 }}
                sx={{
                  flexWrap: 'nowrap', // Prevent wrapping - keep on same row
                  width: '100%'
                }}
              >
                {FEATURES.ECOMMERCE_ENABLED ? (
                  <>
                    {/* Quantity Selector - Fixed width */}
                    <Box
                      display="flex"
                      alignItems="center"
                      border="1px solid"
                      borderColor="divider"
                      borderRadius={1}
                      sx={{ flexShrink: 0 }} // Don't shrink
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        sx={{ borderRadius: 0 }}
                      >
                        <Remove />
                      </IconButton>

                      <Typography
                        variant="body1"
                        sx={{
                          px: 2,
                          py: 1,
                          minWidth: 60,
                          textAlign: 'center',
                          fontWeight: 600,
                          borderLeft: '1px solid',
                          borderRight: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {quantity}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={
                          product.stock_quantity && quantity >= product.stock_quantity
                        }
                        sx={{ borderRadius: 0 }}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    {/* Add to Cart Button - Fill remaining space */}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ShoppingCart />}
                      disabled={
                        !product.stock_quantity || product.stock_quantity <= 0
                      }
                      onClick={handleAddToCart}
                      sx={{
                        flex: 1, // Take remaining space
                        minWidth: { xs: 140, sm: 160 }, // Responsive min width
                        fontSize: { xs: '0.875rem', sm: '1rem' } // Smaller text on mobile if needed
                      }}
                    >
                      {(!product.stock_quantity || product.stock_quantity <= 0)
                        ? 'Stoc epuizat' : 'Adaugă în coș'}
                    </Button>
                  </>
                ) : (
                  /* Presentation mode - Request Quote button */
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Info />}
                    onClick={() => navigate('/contact')}
                    sx={{
                      flex: 1,
                      minWidth: { xs: 140, sm: 200 },
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {PRESENTATION_MESSAGES.ADD_TO_CART_ALTERNATIVE}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Product Specifications - Full width below main content */}
      <Box sx={{ mt: 4 }}>
        <ProductSpecs product={product} categorySlug={category?.slug} />
      </Box>
      
      {/* Full Screen Image Dialog */}
      <Dialog
        open={fullScreenImage}
        onClose={() => setFullScreenImage(false)}
        maxWidth={false}
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
        }}
      >
        <DialogContent sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          padding: 0,
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setFullScreenImage(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
          >
            <Close />
          </IconButton>
          
          {/* Full Screen Image */}
          {product?.image_url ? (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 2
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                width: '100%',
                height: '100%',
                minHeight: '50vh'
              }}
            >
              <Stack alignItems="center" spacing={2}>
                <AspectRatio sx={{ fontSize: 120, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ opacity: 0.7 }}>
                  Imagine indisponibilă
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      
      </Container>
    </Box>
  )
}

export default ProductDetail