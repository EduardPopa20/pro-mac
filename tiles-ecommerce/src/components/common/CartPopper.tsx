import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Popper,
  Paper,
  ClickAwayListener,
  Fade,
  Button,
  Divider,
  Stack,
  Avatar,
  Chip
} from '@mui/material'
import {
  ShoppingCart,
  Add,
  Remove,
  Delete,
  ArrowForward
} from '@mui/icons-material'
import { theme } from '../../theme'
import { useCartStore } from '../../stores/cart'
import type { CartItem } from '../../types'

const CartPopper: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore()
  const open = Boolean(anchorEl)
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleGoToCart = () => {
    navigate('/cos')
    handleClose()
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <>
      <IconButton 
        size="medium" 
        onClick={handleClick} 
        color={totalItems > 0 ? 'primary' : 'default'}
        sx={{
          position: 'relative'
        }}
      >
        <ShoppingCart />
        {totalItems > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {totalItems > 9 ? '9+' : totalItems}
          </Box>
        )}
      </IconButton>

      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="bottom-end" 
        transition
        strategy="fixed" // Prevents lag on mobile scroll
        sx={{
          zIndex: theme.zIndex.modal + 1 // Higher than breadcrumbs and other content
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                width: { 
                  xs: '100vw', // Full screen width on mobile
                  md: 380 
                },
                maxWidth: { xs: '100vw', md: 380 },
                maxHeight: 500,
                mt: 0.5,
                mx: { xs: 0, md: 0 }, // No margins on mobile for full width
                borderRadius: { xs: 0, md: 2 }, // No border radius on mobile for full edge-to-edge
                boxShadow: theme.shadows[8],
                border: '1px solid',
                borderColor: 'divider',
                // Remove side borders on mobile for true full width
                borderLeft: { xs: 'none', md: '1px solid' },
                borderRight: { xs: 'none', md: '1px solid' },
                // Add small arrow/connector effect on mobile - positioned for full width
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'divider',
                  display: { xs: 'block', md: 'none' }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -7,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'background.paper',
                  display: { xs: 'block', md: 'none' }
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Coș de cumpărături ({totalItems})
                    </Typography>
                  </Box>

                  {items.length === 0 ? (
                    /* Empty Cart */
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Coșul tău este gol
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleClose}
                      >
                        Continuă cumpărăturile
                      </Button>
                    </Box>
                  ) : (
                    /* Cart Items */
                    <>
                      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {items.slice(0, 3).map((item: CartItem, index: number) => (
                          <Box key={item.id}>
                            <Box sx={{ p: 2 }}>
                              <Box display="flex" gap={2} alignItems="flex-start">
                                {/* Product Image */}
                                <Avatar
                                  variant="rounded"
                                  src={item.product.image_url}
                                  sx={{ width: 50, height: 50 }}
                                >
                                  <ShoppingCart fontSize="small" />
                                </Avatar>

                                {/* Product Details */}
                                <Box flex={1}>
                                  <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                      fontWeight: 600, 
                                      mb: 0.5,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical'
                                    }}
                                  >
                                    {item.product.name}
                                  </Typography>

                                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                    {item.product.brand && (
                                      <Chip 
                                        label={item.product.brand} 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 18 }}
                                      />
                                    )}
                                  </Stack>

                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    {/* Quantity Controls */}
                                    <Box display="flex" alignItems="center">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        sx={{ width: 24, height: 24 }}
                                      >
                                        <Remove fontSize="small" />
                                      </IconButton>
                                      
                                      <Typography
                                        variant="body2"
                                        sx={{ 
                                          mx: 1, 
                                          minWidth: 20, 
                                          textAlign: 'center',
                                          fontWeight: 600
                                        }}
                                      >
                                        {item.quantity}
                                      </Typography>
                                      
                                      <IconButton
                                        size="small"
                                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                        sx={{ width: 24, height: 24 }}
                                        disabled={
                                          item.product.stock_quantity !== undefined && 
                                          item.quantity >= item.product.stock_quantity
                                        }
                                      >
                                        <Add fontSize="small" />
                                      </IconButton>
                                    </Box>

                                    {/* Price and Remove */}
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                                        {formatPrice(item.product.price * item.quantity)}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveItem(item.product_id)}
                                        sx={{ width: 24, height: 24 }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                            
                            {index < Math.min(items.length, 3) - 1 && (
                              <Divider sx={{ mx: 2 }} />
                            )}
                          </Box>
                        ))}

                        {items.length > 3 && (
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              și încă {items.length - 3} {items.length - 3 === 1 ? 'produs' : 'produse'}...
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Divider />

                      {/* Footer with Total and Actions */}
                      <Box sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Total:
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            {formatPrice(totalPrice)}
                          </Typography>
                        </Box>

                        <Stack spacing={2}>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handleGoToCart}
                            startIcon={<ArrowForward />}
                          >
                            Vezi coșul complet
                          </Button>
                          
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={handleClose}
                          >
                            Continuă cumpărăturile
                          </Button>
                        </Stack>
                      </Box>
                    </>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default CartPopper