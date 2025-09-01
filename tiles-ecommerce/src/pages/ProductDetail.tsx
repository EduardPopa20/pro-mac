import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Container,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  Backdrop,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  ShoppingCart,
  Share,
  Favorite,
  FavoriteBorder,
  Fullscreen,
  Euro,
  AspectRatio,
  Palette,
  TextureOutlined,
  LocationOn,
  Close,
  CheckCircle,
  Cancel,
  Info,
  LocalShipping,
  BuildCircle,
  CleanHands,
  Straighten,
  Scale,
  Public,
  Grade,
  Layers,
  Home,
  Business,
  AcUnit,
  Whatshot,
  Remove,
  Add
} from '@mui/icons-material'
import { useProductStore } from '../stores/products'
import type { Product } from '../types'
import { generateProductSlug } from '../utils/slugUtils'
import { useWatchlistStore } from '../stores/watchlist'
import { useCartStore } from '../stores/cart'
import { useGlobalAlertStore } from '../stores/globalAlert'

const ProductDetail: React.FC = () => {
  const { productSlug, productId } = useParams<{ productSlug: string; productId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const { products, categories, loading, fetchProducts, fetchCategories } = useProductStore()
  const { toggleWatchlist, isInWatchlist } = useWatchlistStore()
  const { addItem } = useCartStore()
  const { showAlert } = useGlobalAlertStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [fullScreenImage, setFullScreenImage] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [fetchCategories, fetchProducts])

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
    } else if (!loading) {
      // Product not found
      navigate('/', { replace: true })
    }
  }, [productId, productSlug, products, categories, loading, navigate])

  const handleBack = () => {
    if (product?.category_id) {
      const category = categories.find(c => c.id === product.category_id)
      if (category) {
        navigate(`/${category.slug}`)
        return
      }
    }
    navigate('/')
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `${product.name} - Pro-Mac`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product) return
    
    addItem(product, quantity)
    showAlert({
      type: 'success',
      message: `${product.name} a fost adăugat în coș!`,
      duration: 3000
    })
    setQuantity(1) // Reset quantity after adding
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

      {/* Main content with top padding for breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 3, pt: 8 }}>

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
                  <Tooltip title={product && isInWatchlist(product.id) ? 'Elimină din favorite' : 'Adaugă la favorite'}>
                    <IconButton 
                      onClick={() => product && toggleWatchlist(product)}
                      color={product && isInWatchlist(product.id) ? 'error' : 'default'}
                    >
                      {product && isInWatchlist(product.id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Distribuie produs">
                    <IconButton onClick={handleShare}>
                      <Share />
                    </IconButton>
                  </Tooltip>
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
                {product.quality_grade && (
                  <Chip 
                    icon={<Grade />} 
                    label={`Calitate ${product.quality_grade}`} 
                    color="success" 
                    size="small" 
                  />
                )}
              </Stack>

              {/* Pricing */}
              <Stack spacing={1}>
                {product.special_price && product.special_price < product.price ? (
                  <>
                    <Typography 
                      variant="h4" 
                      color="error" 
                      sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Euro />
                      {formatPrice(product.special_price)}
                      <Chip label="OFERTĂ" color="error" size="small" />
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      Preț normal: {formatPrice(product.price)}
                    </Typography>
                  </>
                ) : (
                  <Typography 
                    variant="h4" 
                    color="primary" 
                    sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Euro />
                    {formatPrice(product.price)}
                  </Typography>
                )}
                
                {product.price_unit && (
                  <Typography variant="body2" color="text.secondary">
                    Preț per {product.price_unit}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Enhanced Specifications Table */}
            <TableContainer component={Paper} sx={{ mb: 3, maxHeight: 'none' }}>
              <Table size="small" aria-label="specificații produs">
                <TableBody>
                  {/* Basic Properties */}
                  {product.dimensions && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Straighten fontSize="small" color="action" />
                        Dimensiuni
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.dimensions}</TableCell>
                    </TableRow>
                  )}
                  
                  {product.thickness && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Layers fontSize="small" color="action" />
                        Grosime
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.thickness} mm</TableCell>
                    </TableRow>
                  )}

                  {product.material && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <TextureOutlined fontSize="small" color="action" />
                        Material
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.material}</TableCell>
                    </TableRow>
                  )}

                  {product.surface_finish && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <TextureOutlined fontSize="small" color="action" />
                        Finisaj
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.surface_finish}</TableCell>
                    </TableRow>
                  )}

                  {product.texture && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Palette fontSize="small" color="action" />
                        Textură
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.texture}</TableCell>
                    </TableRow>
                  )}

                  {product.color && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Palette fontSize="small" color="action" />
                        Culoare
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.color}</TableCell>
                    </TableRow>
                  )}

                  {product.origin_country && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Public fontSize="small" color="action" />
                        Origine
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.origin_country}</TableCell>
                    </TableRow>
                  )}

                  {/* Physical Properties */}
                  {product.weight_per_box && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Scale fontSize="small" color="action" />
                        Greutate cutie
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.weight_per_box} kg</TableCell>
                    </TableRow>
                  )}

                  {product.area_per_box && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <AspectRatio fontSize="small" color="action" />
                        Suprafață cutie
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.area_per_box} m²</TableCell>
                    </TableRow>
                  )}

                  {product.tiles_per_box && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Info fontSize="small" color="action" />
                        Plăci per cutie
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.tiles_per_box}</TableCell>
                    </TableRow>
                  )}

                  {/* Technical Capabilities */}
                  {product.is_rectified !== undefined && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <BuildCircle fontSize="small" color="action" />
                        Rectificat
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {product.is_rectified ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <Cancel fontSize="small" color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {product.is_frost_resistant !== undefined && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <AcUnit fontSize="small" color="action" />
                        Rezistent îngheț
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {product.is_frost_resistant ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <Cancel fontSize="small" color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {product.is_floor_heating_compatible !== undefined && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Whatshot fontSize="small" color="action" />
                        Compatibil pardoseala caldă
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        {product.is_floor_heating_compatible ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <Cancel fontSize="small" color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Suitability */}
                  {(product.suitable_for_walls !== undefined || product.suitable_for_floors !== undefined) && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Home fontSize="small" color="action" />
                        Utilizare
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        <Stack direction="row" spacing={1}>
                          {product.suitable_for_walls && <Chip label="Pereți" size="small" />}
                          {product.suitable_for_floors && <Chip label="Podea" size="small" />}
                          {product.suitable_for_exterior && <Chip label="Exterior" size="small" />}
                          {product.suitable_for_commercial && <Chip label="Comercial" size="small" />}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Application Areas */}
                  {product.application_areas && product.application_areas.length > 0 && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <LocationOn fontSize="small" color="action" />
                        Zone aplicare
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {product.application_areas.map((area, index) => (
                            <Chip key={index} label={area} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Delivery and Stock */}
                  {product.estimated_delivery_days && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <LocalShipping fontSize="small" color="action" />
                        Livrare estimată
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>{product.estimated_delivery_days} zile</TableCell>
                    </TableRow>
                  )}

                  {product.stock_quantity !== undefined && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, border: 0 }}>
                        <Info fontSize="small" color="action" />
                        Stoc disponibil
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {product.stock_quantity} m²
                          <Chip 
                            label={
                              product.stock_quantity > 10 
                                ? 'În stoc' 
                                : product.stock_quantity > 0 
                                  ? 'Stoc limitat' 
                                  : 'Stoc epuizat'
                            }
                            color={
                              product.stock_quantity > 10 
                                ? 'success' 
                                : product.stock_quantity > 0 
                                  ? 'warning' 
                                  : 'error'
                            }
                            size="small"
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Description */}
            {product.description && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Descriere
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
              </Paper>
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

            {/* Quantity Selector */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Cantitate
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" border="1px solid" borderColor="divider" borderRadius={1}>
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
                      product.stock_quantity !== undefined && 
                      quantity >= product.stock_quantity
                    }
                    sx={{ borderRadius: 0 }}
                  >
                    <Add />
                  </IconButton>
                </Box>
                
                {product.price_unit && (
                  <Typography variant="body2" color="text.secondary">
                    {product.price_unit}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Stack spacing={2} direction={isMobile ? 'column' : 'row'}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  fullWidth={isMobile}
                  sx={{ flex: 1 }}
                  disabled={product.stock_quantity === 0}
                  onClick={handleAddToCart}
                >
                  {product.stock_quantity === 0 ? 'Stoc epuizat' : 'Adaugă în coș'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth={isMobile}
                  href="/contact"
                >
                  Contactează-ne
                </Button>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
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