import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Grid,
  Chip,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material'
import { 
  ShoppingCart, 
  CheckCircle, 
  Error,
  LocalOffer,
  Timer,
  ArrowForward,
  CelebrationOutlined
} from '@mui/icons-material'
import { cartSyncService } from '../services/cartSync'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'

interface RecoveryData {
  id: string
  email: string
  cart_items: any[]
  cart_total: number
  items_count: number
  recovery_discount_code?: string
  recovery_discount_amount?: number
  abandoned_at: string
  expires_at: string
}

interface DiscountInfo {
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  valid_until: string
}

const CartRecover: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { addItem, clearCart } = useCartStore()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'preview'>('loading')
  const [message, setMessage] = useState('')
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
  const [discount, setDiscount] = useState<DiscountInfo | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const recoverCart = async () => {
      const token = searchParams.get('token')
      const discount = searchParams.get('discount')

      if (!token) {
        setStatus('error')
        setMessage('Link-ul de recuperare este invalid. Vă rugăm să verificați email-ul.')
        return
      }

      try {
        const success = await cartSyncService.recoverCart(token)

        if (success) {
          setStatus('success')
          setMessage('Coșul dvs. a fost recuperat cu succes!')
          
          if (discount) {
            setDiscountCode(discount)
            // Store discount code in localStorage for checkout
            localStorage.setItem('cart_discount_code', discount)
          }

          // Redirect to cart after 3 seconds
          setTimeout(() => {
            navigate('/cart')
          }, 3000)
        } else {
          setStatus('error')
          setMessage('Link-ul de recuperare a expirat sau a fost deja folosit.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('A apărut o eroare la recuperarea coșului. Vă rugăm să încercați din nou.')
        console.error('Cart recovery error:', error)
      }
    }

    recoverCart()
  }, [searchParams, navigate])

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          {status === 'loading' && (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Recuperăm coșul dvs. de cumpărături...
              </Typography>
              <Typography color="text.secondary">
                Vă rugăm să așteptați câteva momente
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle color="success" sx={{ fontSize: 80, mb: 3 }} />
              <Typography variant="h4" gutterBottom color="success.main">
                Succes!
              </Typography>
              <Typography variant="h6" gutterBottom>
                {message}
              </Typography>
              
              {discountCode && (
                <Alert severity="success" sx={{ mt: 2, mb: 3, width: '100%' }}>
                  <Typography variant="body1">
                    Codul de reducere <strong>{discountCode}</strong> a fost aplicat!
                  </Typography>
                  <Typography variant="body2">
                    Veți beneficia de <strong>10% reducere</strong> la finalizarea comenzii.
                  </Typography>
                </Alert>
              )}

              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Veți fi redirecționat către coșul de cumpărături în câteva secunde...
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/cart')}
                  size="large"
                >
                  Mergi la Coș
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
                  size="large"
                >
                  Continuă Cumpărăturile
                </Button>
              </Stack>
            </>
          )}

          {status === 'error' && (
            <>
              <Error color="error" sx={{ fontSize: 80, mb: 3 }} />
              <Typography variant="h4" gutterBottom color="error">
                Eroare
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                {message}
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/products')}
                  size="large"
                >
                  Vezi Produsele
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/contact')}
                  size="large"
                >
                  Contactează-ne
                </Button>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Dacă aveți nevoie de asistență, nu ezitați să ne contactați la{' '}
                <a href="mailto:contact@promac.ro">contact@promac.ro</a> sau la
                telefon: 0722 123 456
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  )
}

export default CartRecover