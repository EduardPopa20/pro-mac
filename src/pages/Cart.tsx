import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  IconButton,
  Stack,
  Breadcrumbs,
  Link,
  Divider,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Alert,
  AlertTitle,
  Grid
} from '@mui/material'
import {
  Remove,
  Add,
  Delete,
  ShoppingCart,
  ArrowForward,
  LocalShipping,
  Security,
  Euro,
  Warning
} from '@mui/icons-material'
import { useCartStore } from '../stores/cart'
import type { CartItem } from '../types'

const Cart: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const { 
    items, 
    unavailableItems,
    updateQuantity, 
    removeItem, 
    getTotalItems, 
    getTotalPrice, 
    clearCart,
    validateCartAvailability,
    clearUnavailableNotifications
  } = useCartStore()

  // Check cart availability on mount
  useEffect(() => {
    validateCartAvailability()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        await removeItem(productId)
      } else {
        await updateQuantity(productId, newQuantity)
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId)
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Typography color="text.primary">Coș de cumpărături</Typography>
        </Breadcrumbs>
      </Box>

      {/* Unavailable Items Alert */}
      {unavailableItems.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          onClose={() => clearUnavailableNotifications()}
          icon={<Warning />}
        >
          <AlertTitle>Produse modificate</AlertTitle>
          <Stack spacing={1}>
            {unavailableItems.map((item, index) => (
              <Typography key={index} variant="body2">
                • <strong>{item.productName}</strong>: {item.reason}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Coș de cumpărături
        </Typography>
        {totalItems > 0 && (
          <Typography variant="body1" color="text.secondary">
            {totalItems} {totalItems === 1 ? 'produs' : 'produse'} în coș
          </Typography>
        )}
      </Box>

      {items.length === 0 ? (
        /* Empty Cart State */
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          sx={{ py: 8, textAlign: 'center' }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Coșul tău este gol
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Nu ai adăugat încă niciun produs în coș. Explorează colecția noastră și găsește produsele perfecte pentru casa ta.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/')}
            sx={{ minHeight: isMobile ? 48 : 48 }}
          >
            Începe să cumperi
          </Button>
        </Box>
      ) : (
        /* Cart Content */
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                {/* Cart Header */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Produsele tale ({totalItems})
                    </Typography>
                    {items.length > 1 && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleClearCart}
                        startIcon={<Delete />}
                      >
                        Golește coșul
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Cart Items List */}
                <Box>
                  {items.map((item: CartItem, index: number) => (
                    <Box key={item.id}>
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                          {/* Product Image */}
                          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
                            <Avatar
                              variant="rounded"
                              src={item.product.image_url}
                              sx={{ 
                                width: { xs: 80, sm: 100 }, 
                                height: { xs: 80, sm: 100 },
                                mx: 'auto'
                              }}
                            >
                              <ShoppingCart />
                            </Avatar>
                          </Grid>

                          {/* Product Details */}
                          <Grid size={{ xs: 12, sm: 9, md: 6 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                              {item.product.name}
                            </Typography>
                            
                            {/* Product attributes */}
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                              {item.product.brand && (
                                <Chip label={item.product.brand} size="small" variant="outlined" />
                              )}
                              {item.product.dimensions && (
                                <Chip label={item.product.dimensions} size="small" variant="outlined" />
                              )}
                              {item.product.material && (
                                <Chip label={item.product.material} size="small" variant="outlined" />
                              )}
                            </Stack>

                            {/* Stock status */}
                            {item.product.stock_quantity !== undefined && (
                              <Typography variant="body2" color={
                                item.product.stock_quantity > 10 
                                  ? 'success.main' 
                                  : item.product.stock_quantity > 0 
                                    ? 'warning.main' 
                                    : 'error.main'
                              }>
                                {item.product.stock_quantity > 10 
                                  ? 'În stoc' 
                                  : item.product.stock_quantity > 0 
                                    ? 'Stoc limitat' 
                                    : 'Stoc epuizat'}
                              </Typography>
                            )}
                          </Grid>

                          {/* Quantity Controls */}
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }}>
                              <IconButton
                                size={isMobile ? 'medium' : 'small'}
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Remove />
                              </IconButton>
                              
                              <Typography
                                variant="body1"
                                sx={{ 
                                  mx: 2, 
                                  minWidth: 40, 
                                  textAlign: 'center',
                                  fontWeight: 600
                                }}
                              >
                                {item.quantity}
                              </Typography>
                              
                              <IconButton
                                size={isMobile ? 'medium' : 'small'}
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                disabled={
                                  item.product.stock_quantity !== undefined && 
                                  item.quantity >= item.product.stock_quantity
                                }
                              >
                                <Add />
                              </IconButton>
                            </Box>
                          </Grid>

                          {/* Price and Remove */}
                          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <Box textAlign={{ xs: 'center', md: 'right' }}>
                              <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                                {formatPrice(item.product.price * item.quantity)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {formatPrice(item.product.price)} / {item.product.price_unit || 'buc'}
                              </Typography>
                              <IconButton
                                size={isMobile ? 'medium' : 'small'}
                                color="error"
                                onClick={() => handleRemoveItem(item.product_id)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                      
                      {index < items.length - 1 && (
                        <Divider sx={{ mx: 3 }} />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ 
              position: 'sticky', 
              top: (theme) => theme.spacing(3), // 24px
              zIndex: (theme) => theme.zIndex.sticky,
              alignSelf: 'flex-start'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Rezumatul comenzii
                </Typography>

                {/* Order Details */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">
                      Subtotal ({totalItems} {totalItems === 1 ? 'produs' : 'produse'})
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body1">Transport</Typography>
                    <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                      GRATUIT
                    </Typography>
                  </Box>

                  <Divider />

                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Box>
                </Stack>

                {/* Checkout Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleCheckout}
                  sx={{ mb: 2 }}
                  startIcon={<ArrowForward />}
                >
                  Finalizează comanda
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  onClick={() => navigate('/')}
                  sx={{ mb: 3 }}
                >
                  Continuă cumpărăturile
                </Button>

                {/* Trust Indicators */}
                <Box sx={{ mt: 3 }}>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocalShipping color="primary" fontSize="small" />
                      <Typography variant="body2">
                        Transport gratuit pentru comenzi peste 500 RON
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Security color="primary" fontSize="small" />
                      <Typography variant="body2">
                        Plată securizată și protecția datelor
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Euro color="primary" fontSize="small" />
                      <Typography variant="body2">
                        Returnare gratuită în 30 de zile
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Timp estimat de livrare:</strong> 2-5 zile lucrătoare pentru majoritatea produselor.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      )}
    </Container>
  )
}

export default Cart