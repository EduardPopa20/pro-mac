import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material'
import { LocalShipping, Receipt } from '@mui/icons-material'
import type { CartItem } from '../../types'

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  discount?: number
}

export default function OrderSummary({
  items,
  subtotal,
  tax,
  shipping,
  total,
  discount = 0,
}: OrderSummaryProps) {
  return (
    <Paper sx={{ 
      p: 3, 
      position: 'sticky', 
      top: (theme) => theme.spacing(2.5), // 20px
      zIndex: (theme) => theme.zIndex.sticky,
      alignSelf: 'flex-start' // Prevents unwanted stretching
    }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Sumar comandă
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Products List */}
      <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
        {items.map((item) => (
          <ListItem key={item.product.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar
                src={item.product.image_url}
                variant="rounded"
                sx={{ width: 48, height: 48 }}
              >
                {item.product.name[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" noWrap>
                  {item.product.name}
                </Typography>
              }
              secondary={
                <React.Fragment>
                  <Typography variant="caption" color="text.secondary" component="span" display="block">
                    {item.quantity} x {item.product.price.toFixed(2)} RON
                  </Typography>
                  {item.product.in_stock < 10 && (
                    <Chip
                      label={`Stoc limitat: ${item.product.in_stock}`}
                      size="small"
                      color="warning"
                      sx={{ ml: 1, height: 16 }}
                    />
                  )}
                </React.Fragment>
              }
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {(item.quantity * item.product.price).toFixed(2)} RON
            </Typography>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Totals */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2">
            {subtotal.toFixed(2)} RON
          </Typography>
        </Box>
        
        {discount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="success.main">
              Discount
            </Typography>
            <Typography variant="body2" color="success.main">
              -{discount.toFixed(2)} RON
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            TVA (19%)
          </Typography>
          <Typography variant="body2">
            {tax.toFixed(2)} RON
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalShipping fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Transport
            </Typography>
          </Box>
          <Typography variant="body2">
            {shipping === 0 ? (
              <Chip label="GRATUIT" size="small" color="success" />
            ) : (
              `${shipping.toFixed(2)} RON`
            )}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Total
        </Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {total.toFixed(2)} RON
          </Typography>
          <Typography variant="caption" color="text.secondary">
            TVA inclus
          </Typography>
        </Box>
      </Box>
      
      {/* Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Receipt fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Informații importante
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" component="div">
          • Transport gratuit pentru comenzi peste 500 RON
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • Factură fiscală inclusă
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          • Garanție 2 ani pentru toate produsele
        </Typography>
      </Box>
    </Paper>
  )
}