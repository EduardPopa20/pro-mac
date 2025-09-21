import React, { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Breadcrumbs,
  Link,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  LinearProgress
} from '@mui/material'
import {
  Payment,
  CreditCard,
  AccountBalance,
  Security,
  Lock,
  LocalShipping,
  CheckCircle,
  ArrowBack,
  Phone,
  Email,
  Home,
  Person
} from '@mui/icons-material'
import { useCartStore } from '../stores/cart'

const Billing: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  
  const { items, getTotalItems, getTotalPrice } = useCartStore()
  
  // Form state with proper functional updates to prevent focus loss
  const [billingForm, setBillingForm] = useState({
    // Contact Information
    email: '',
    phone: '',
    
    // Billing Address
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    
    // Payment Method
    paymentMethod: 'card',
    
    // Card Details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    
    // Additional Options
    saveAddress: false,
    marketing: false,
    
    // Delivery Notes
    deliveryNotes: ''
  })
  
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Handle form field changes with useCallback to prevent focus loss
  const handleFieldChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBillingForm(prev => ({ ...prev, [field]: e.target.value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }, [errors])
  
  const handleRadioChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBillingForm(prev => ({ ...prev, [field]: e.target.value }))
    }, [])
  
  const handleCheckboxChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBillingForm(prev => ({ ...prev, [field]: e.target.checked }))
    }, [])

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const shippingPrice = totalPrice > 500 ? 0 : 50
  const finalPrice = totalPrice + shippingPrice

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  // Validation functions
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone: string) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/
    return re.test(phone.replace(/\s/g, ''))
  }

  const validateRequired = (value: string) => value.trim().length > 0

  // Real-time validation
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'email':
        return validateEmail(value) ? '' : 'Email invalid'
      case 'phone':
        return validatePhone(value) ? '' : 'Număr de telefon invalid'
      case 'firstName':
      case 'lastName':
      case 'address':
      case 'city':
      case 'county':
      case 'postalCode':
        return validateRequired(value) ? '' : 'Câmp obligatoriu'
      default:
        return ''
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all required fields
    const newErrors: {[key: string]: string} = {}
    const requiredFields = ['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'county', 'postalCode']
    
    requiredFields.forEach(field => {
      const error = validateField(field, billingForm[field as keyof typeof billingForm] as string)
      if (error) newErrors[field] = error
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setProcessing(true)
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Comanda a fost plasată cu succes!')
      navigate('/cart')
    } catch (error) {
      alert('A apărut o eroare. Te rugăm să încerci din nou.')
    } finally {
      setProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Link href="/cart" color="inherit" sx={{ textDecoration: 'none' }}>Coș</Link>
            <Typography color="text.primary">Finalizare comandă</Typography>
          </Breadcrumbs>
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ py: 8, textAlign: 'center' }}>
          <Payment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Coșul tău este gol
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Nu poți finaliza o comandă fără produse în coș.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/')}
            sx={{ minHeight: isMobile ? 48 : 48 }}
          >
            Începe să cumperi
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Link href="/cart" color="inherit" sx={{ textDecoration: 'none' }}>Coș</Link>
          <Typography color="text.primary">Finalizare comandă</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={() => navigate('/cart')}
          sx={{ 
            minWidth: { xs: 44, md: 40 }, 
            minHeight: { xs: 44, md: 40 } 
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h1" sx={{ fontWeight: 700 }}>
          Finalizare comandă
        </Typography>
      </Box>


      <Grid container spacing={4}>
        {/* Main Form */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>

              {/* Contact Information */}
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Informații de contact
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Adresa de email *"
                        type="email"
                        value={billingForm.email}
                        onChange={handleFieldChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Număr de telefon *"
                        type="tel"
                        value={billingForm.phone}
                        onChange={handleFieldChange('phone')}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Billing Address */}
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    <Home sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Adresa de livrare
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Prenume *"
                        value={billingForm.firstName}
                        onChange={handleFieldChange('firstName')}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Nume *"
                        value={billingForm.lastName}
                        onChange={handleFieldChange('lastName')}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Companie (opțional)"
                        value={billingForm.company}
                        onChange={handleFieldChange('company')}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Adresa *"
                        value={billingForm.address}
                        onChange={handleFieldChange('address')}
                        error={!!errors.address}
                        helperText={errors.address}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Apartament/Bloc"
                        value={billingForm.apartment}
                        onChange={handleFieldChange('apartment')}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Oraș *"
                        value={billingForm.city}
                        onChange={handleFieldChange('city')}
                        error={!!errors.city}
                        helperText={errors.city}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Județ *"
                        value={billingForm.county}
                        onChange={handleFieldChange('county')}
                        error={!!errors.county}
                        helperText={errors.county}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Cod poștal *"
                        value={billingForm.postalCode}
                        onChange={handleFieldChange('postalCode')}
                        error={!!errors.postalCode}
                        helperText={errors.postalCode}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Instrucțiuni de livrare (opțional)"
                        multiline
                        rows={3}
                        value={billingForm.deliveryNotes}
                        onChange={handleFieldChange('deliveryNotes')}
                        sx={{
                          minWidth: { xs: 80, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Metodă de plată
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mb: 3 }}>
                    <RadioGroup
                      value={billingForm.paymentMethod}
                      onChange={handleRadioChange('paymentMethod')}
                    >
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <CreditCard />
                            <Typography>Plată cu cardul (Netopia)</Typography>
                            <Stack direction="row" spacing={0.5}>
                              <Chip label="Visa" size="small" />
                              <Chip label="Mastercard" size="small" />
                            </Stack>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="cash"
                        control={<Radio />}
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocalShipping />
                            <Typography>Numerar la livrare</Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>

                  {billingForm.paymentMethod === 'card' && (
                    <Box>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Numărul cardului *"
                            value={billingForm.cardNumber}
                            onChange={handleFieldChange('cardNumber')}
                            placeholder="1234 5678 9012 3456"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: { xs: '0.875rem', md: '1rem' }
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Data expirării *"
                            value={billingForm.expiryDate}
                            onChange={handleFieldChange('expiryDate')}
                            placeholder="MM/AA"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: { xs: '0.875rem', md: '1rem' }
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="CVV *"
                            value={billingForm.cvv}
                            onChange={handleFieldChange('cvv')}
                            placeholder="123"
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: { xs: '0.875rem', md: '1rem' }
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Numele posesorului cardului *"
                            value={billingForm.cardName}
                            onChange={handleFieldChange('cardName')}
                            sx={{
                              '& .MuiInputBase-root': {
                                fontSize: { xs: '0.875rem', md: '1rem' }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {billingForm.paymentMethod === 'cash' && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Plata se va efectua în numerar la livrare. Te rugăm să ai suma exactă pregătită.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card sx={{ border: '1px solid', borderColor: 'success.light' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Security color="success" />
                    <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                      Plată securizată
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Toate datele tale sunt criptate și protejate. Nu stocăm informațiile cardului tău.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </form>
        </Grid>

        {/* Order Summary Sidebar */}
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

              {/* Order Items */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Produse comandate:
                </Typography>
                {items.map((item) => (
                  <Box key={item.id} display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                    <Box
                      component="img"
                      src={item.product.image_url}
                      alt={item.product.name}
                      sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: 1,
                        objectFit: 'cover' 
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(item.product.price)} × {item.quantity} {item.product.price_unit || 'buc'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Price Breakdown */}
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
                  <Typography 
                    variant="body1" 
                    color={shippingPrice === 0 ? 'success.main' : 'text.primary'}
                    sx={{ fontWeight: 600 }}
                  >
                    {shippingPrice === 0 ? 'GRATUIT' : formatPrice(shippingPrice)}
                  </Typography>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    {formatPrice(finalPrice)}
                  </Typography>
                </Box>
              </Stack>

              {/* Place Order Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={processing}
                onClick={handleSubmit}
                startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
                sx={{ 
                  minHeight: { xs: 48, md: 48 },
                  minWidth: { xs: 44, md: 40 },
                  mb: 2
                }}
              >
                {processing ? 'Se procesează...' : 'Finalizează comanda'}
              </Button>

              {processing && (
                <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
              )}

              {/* Trust Elements */}
              <Stack spacing={2} sx={{ mt: 3 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Security color="primary" fontSize="small" />
                  <Typography variant="body2">
                    SSL securizat și protecția datelor
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocalShipping color="primary" fontSize="small" />
                  <Typography variant="body2">
                    Livrare în 2-5 zile lucrătoare
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <CheckCircle color="primary" fontSize="small" />
                  <Typography variant="body2">
                    Returnare gratuită în 30 zile
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Billing