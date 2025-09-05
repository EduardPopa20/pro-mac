import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import { netopiaService } from '../services/netopiaService'

// Import checkout components
import OrderSummary from '../components/checkout/OrderSummary'
import BillingForm from '../components/checkout/BillingForm'
import ShippingForm from '../components/checkout/ShippingForm'
import PaymentForm from '../components/checkout/PaymentForm'
import OrderConfirmation from '../components/checkout/OrderConfirmation'

// Types
interface CheckoutData {
  billingAddress: {
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    city: string
    county: string
    postalCode: string
    country: string
    companyName?: string
    cui?: string // CUI pentru companii
  }
  shippingAddress: {
    sameAsBilling: boolean
    firstName?: string
    lastName?: string
    phone?: string
    street?: string
    city?: string
    county?: string
    postalCode?: string
    country?: string
  }
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery'
  notes?: string
  acceptTerms: boolean
  newsletter: boolean
}

const steps = ['Date facturare', 'Date livrare', 'Plată', 'Confirmare']

export default function Checkout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  
  // Checkout data state
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    billingAddress: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      street: '',
      city: '',
      county: '',
      postalCode: '',
      country: 'România',
    },
    shippingAddress: {
      sameAsBilling: true,
    },
    paymentMethod: 'card',
    acceptTerms: false,
    newsletter: false,
  })
  
  // Calculate totals
  const subtotal = getTotalPrice()
  const taxRate = 0.19 // 19% TVA
  const taxAmount = subtotal * taxRate
  const shippingCost = subtotal > 500 ? 0 : 25 // Livrare gratuită peste 500 RON
  const total = subtotal + taxAmount + shippingCost
  
  // Check if cart is empty
  useEffect(() => {
    if (items.length === 0 && activeStep !== steps.length - 1) {
      navigate('/cart')
    }
  }, [items, activeStep, navigate])
  
  // Load user profile data if logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setCheckoutData(prev => ({
            ...prev,
            billingAddress: {
              ...prev.billingAddress,
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              email: profile.email || user.email || '',
              phone: profile.phone || '',
              street: profile.billing_address?.street || '',
              city: profile.billing_address?.city || '',
              county: profile.billing_address?.county || '',
              postalCode: profile.billing_address?.postal_code || '',
              country: profile.billing_address?.country || 'România',
            },
          }))
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      }
    }
    
    loadUserProfile()
  }, [user])
  
  // Handle step navigation
  const handleNext = useCallback(() => {
    if (activeStep === steps.length - 1) {
      // Final step - redirect to home or orders
      navigate(user ? '/profile/orders' : '/')
    } else {
      setActiveStep(prev => prev + 1)
    }
  }, [activeStep, navigate, user])
  
  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1)
  }, [])
  
  // Update checkout data
  const updateCheckoutData = useCallback((field: keyof CheckoutData, value: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [field]: value,
    }))
  }, [])
  
  // Create order and initiate payment
  const createOrder = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      // Prepare shipping address
      const shippingAddress = checkoutData.shippingAddress.sameAsBilling
        ? {
            street: checkoutData.billingAddress.street,
            city: checkoutData.billingAddress.city,
            county: checkoutData.billingAddress.county,
            postal_code: checkoutData.billingAddress.postalCode,
            country: checkoutData.billingAddress.country,
          }
        : {
            street: checkoutData.shippingAddress.street!,
            city: checkoutData.shippingAddress.city!,
            county: checkoutData.shippingAddress.county!,
            postal_code: checkoutData.shippingAddress.postalCode!,
            country: checkoutData.shippingAddress.country!,
          }
      
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          customer_email: checkoutData.billingAddress.email,
          customer_phone: checkoutData.billingAddress.phone,
          customer_name: `${checkoutData.billingAddress.firstName} ${checkoutData.billingAddress.lastName}`,
          billing_address: {
            street: checkoutData.billingAddress.street,
            city: checkoutData.billingAddress.city,
            county: checkoutData.billingAddress.county,
            postal_code: checkoutData.billingAddress.postalCode,
            country: checkoutData.billingAddress.country,
          },
          shipping_address: shippingAddress,
          subtotal: Math.round(subtotal * 100), // Convert to bani
          tax_amount: Math.round(taxAmount * 100),
          shipping_cost: Math.round(shippingCost * 100),
          discount_amount: 0,
          total_amount: Math.round(total * 100),
          status: 'pending_payment',
          payment_method: checkoutData.paymentMethod,
          notes: checkoutData.notes,
          ip_address: null, // Will be set by edge function
          user_agent: navigator.userAgent,
        })
        .select()
        .single()
      
      if (orderError || !order) {
        throw new Error(orderError?.message || 'Failed to create order')
      }
      
      // Create order items and reserve stock
      for (const item of items) {
        // Reserve stock first
        const { data: reservations } = await supabase.functions.invoke('stock-reserve', {
          body: {
            items: [{
              product_id: item.product.id,
              quantity: item.quantity,
            }],
            order_id: order.id,
            user_id: user?.id,
            duration_minutes: 30, // 30 minutes reservation for payment
          },
        })
        
        const reservation = reservations?.reservations?.[0]
        
        // Create order item
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            product_sku: item.product.sku,
            product_image_url: item.product.image_url,
            quantity: item.quantity,
            unit_price: Math.round(item.product.price * 100),
            total_price: Math.round(item.product.price * item.quantity * 100),
            stock_reservation_id: reservation?.id || null,
            attributes: {
              category: item.product.category,
              subcategory: item.product.subcategory,
            },
          })
        
        if (itemError) {
          console.error('Failed to create order item:', itemError)
        }
      }
      
      setOrderId(order.id)
      
      // Initiate payment if card payment
      if (checkoutData.paymentMethod === 'card') {
        const paymentResponse = await netopiaService.initiatePayment({
          orderId: order.id,
          amount: total,
          customerEmail: checkoutData.billingAddress.email,
          customerName: `${checkoutData.billingAddress.firstName} ${checkoutData.billingAddress.lastName}`,
          customerPhone: checkoutData.billingAddress.phone,
          billingAddress: {
            street: checkoutData.billingAddress.street,
            city: checkoutData.billingAddress.city,
            county: checkoutData.billingAddress.county,
            postalCode: checkoutData.billingAddress.postalCode,
            country: checkoutData.billingAddress.country,
          },
          description: `Comandă Pro-Mac Tiles #${order.order_number}`,
        })
        
        if (paymentResponse.success && paymentResponse.paymentUrl) {
          // Clear cart before redirect
          clearCart()
          
          // Redirect to payment gateway
          window.location.href = paymentResponse.paymentUrl
        } else {
          throw new Error(paymentResponse.error || 'Failed to initiate payment')
        }
      } else {
        // For other payment methods, mark order as processing
        await supabase
          .from('orders')
          .update({ status: 'processing' })
          .eq('id', order.id)
        
        // Clear cart
        clearCart()
        
        // Move to confirmation step
        handleNext()
      }
    } catch (err: any) {
      console.error('Order creation failed:', err)
      setError(err.message || 'A apărut o eroare la procesarea comenzii')
    } finally {
      setLoading(false)
    }
  }
  
  // Validate current step
  const validateStep = (): boolean => {
    switch (activeStep) {
      case 0: // Billing
        const billing = checkoutData.billingAddress
        return !!(
          billing.firstName &&
          billing.lastName &&
          billing.email &&
          billing.phone &&
          billing.street &&
          billing.city &&
          billing.county &&
          billing.postalCode
        )
      
      case 1: // Shipping
        if (checkoutData.shippingAddress.sameAsBilling) {
          return true
        }
        const shipping = checkoutData.shippingAddress
        return !!(
          shipping.street &&
          shipping.city &&
          shipping.county &&
          shipping.postalCode
        )
      
      case 2: // Payment
        return checkoutData.acceptTerms
      
      default:
        return true
    }
  }
  
  // Get step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BillingForm
            data={checkoutData.billingAddress}
            onChange={(data) => updateCheckoutData('billingAddress', data)}
          />
        )
      
      case 1:
        return (
          <ShippingForm
            data={checkoutData.shippingAddress}
            billingAddress={checkoutData.billingAddress}
            onChange={(data) => updateCheckoutData('shippingAddress', data)}
          />
        )
      
      case 2:
        return (
          <PaymentForm
            data={{
              paymentMethod: checkoutData.paymentMethod,
              acceptTerms: checkoutData.acceptTerms,
              newsletter: checkoutData.newsletter,
              notes: checkoutData.notes,
            }}
            onChange={(field, value) => {
              if (field === 'paymentMethod') {
                updateCheckoutData('paymentMethod', value)
              } else if (field === 'acceptTerms') {
                updateCheckoutData('acceptTerms', value)
              } else if (field === 'newsletter') {
                updateCheckoutData('newsletter', value)
              } else if (field === 'notes') {
                updateCheckoutData('notes', value)
              }
            }}
            total={total}
          />
        )
      
      case 3:
        return (
          <OrderConfirmation
            orderId={orderId}
            orderNumber={`ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orderId?.slice(-5).toUpperCase()}`}
            email={checkoutData.billingAddress.email}
          />
        )
      
      default:
        return null
    }
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Link href="/cart" color="inherit" sx={{ textDecoration: 'none' }}>
            Coș
          </Link>
          <Typography color="text.primary">Finalizare comandă</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Stepper */}
      <Paper sx={{ mb: 4, p: { xs: 2, md: 3 } }}>
        <Stepper 
          activeStep={activeStep} 
          alternativeLabel={!isMobile}
          orientation={isMobile ? 'vertical' : 'horizontal'}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={300}
              >
                <CircularProgress />
              </Box>
            ) : (
              getStepContent(activeStep)
            )}
            
            {/* Navigation Buttons */}
            {activeStep < steps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ChevronLeft />}
                  variant="outlined"
                >
                  Înapoi
                </Button>
                
                {activeStep === steps.length - 2 ? (
                  <Button
                    variant="contained"
                    onClick={createOrder}
                    disabled={!validateStep() || loading}
                    endIcon={loading ? <CircularProgress size={20} /> : <ChevronRight />}
                  >
                    Plasează comanda
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateStep()}
                    endIcon={<ChevronRight />}
                  >
                    Continuă
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Order Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <OrderSummary
            items={items}
            subtotal={subtotal}
            tax={taxAmount}
            shipping={shippingCost}
            total={total}
          />
        </Grid>
      </Grid>
    </Container>
  )
}