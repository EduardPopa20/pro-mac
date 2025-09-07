import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Stack,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material'
import {
  Email,
  Person,
  Message,
  Send,
  Phone,
  LocationOn,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { useNavigateWithScroll } from '../hooks/useNavigateWithScroll'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  honeypot: string // Hidden field for bot detection
}

const Contact: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigateWithScroll()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuthStore()
  
  // Track form load time for bot detection
  const formLoadTimeRef = useRef<number>(Date.now())
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    honeypot: '' // Should remain empty
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)

  // Precompletez datele pentru utilizatorii autentificați
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [user])

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const handleInputChange = useCallback((field: keyof ContactFormData) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value
      }))
    }, [])

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Numele este obligatoriu')
      return false
    }
    if (!formData.email.trim()) {
      setError('Adresa de email este obligatorie')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Adresa de email nu este validă')
      return false
    }
    if (!formData.message.trim()) {
      setError('Mesajul este obligatoriu')
      return false
    }
    if (formData.message.length > 500) {
      setError('Mesajul nu poate depăși 500 de caractere')
      return false
    }
    if (formData.message.length < 10) {
      setError('Mesajul trebuie să aibă cel puțin 10 caractere')
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    // Check if still in cooldown
    if (cooldownSeconds > 0) {
      setError(`Vă rugăm să așteptați ${cooldownSeconds} secunde înainte de a trimite un alt mesaj`)
      return
    }

    setLoading(true)

    try {
      // Call the protected edge function with rate limiting
      const { data, error: functionError } = await supabase.functions.invoke('send-contact-email-prevented', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          honeypot: formData.honeypot, // Will be checked server-side
          formLoadTime: formLoadTimeRef.current // Time when form was loaded
        }
      })

      if (functionError) {
        console.error('Contact error:', functionError)
        
        // Handle rate limiting errors
        if (data?.error) {
          setError(data.error)
          
          // Set cooldown if provided
          if (data.retryAfter) {
            setCooldownSeconds(data.retryAfter)
          }
          
          // Show captcha requirement if needed
          if (data.requiresCaptcha) {
            setRequiresCaptcha(true)
          }
        } else {
          setError('A apărut o eroare. Vă rugăm să încercați mai târziu.')
        }
        
        return
      }

      // Success!
      if (data?.success) {
        setSuccess(data.message || 'Mesajul dvs. a fost trimis cu succes! Vă vom contacta în curând.')
        
        // Update remaining messages count
        if (data.remainingMessages !== undefined) {
          setRemainingMessages(data.remainingMessages)
        }
        
        // Reset form
        setFormData({ 
          name: user?.full_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          message: '',
          honeypot: ''
        })
        
        // Reset form load time
        formLoadTimeRef.current = Date.now()
        
        // Hide success message after 10 seconds
        setTimeout(() => {
          setSuccess('')
          setRemainingMessages(null)
        }, 10000)
      }
    } catch (error: any) {
      console.error('Error sending contact message:', error.message)
      setError('A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link 
          component="button"
          color="inherit" 
          onClick={() => navigate('/')}
          sx={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Acasă
        </Link>
        <Typography color="text.primary">
          Contact
        </Typography>
      </Breadcrumbs>
      
      {/* Page Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            mb: 2, 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Contactează-ne
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Suntem aici să te ajutăm! Trimite-ne un mesaj și îți vom răspunde în cel mai scurt timp.
        </Typography>
      </Box>

      {/* Contact Form */}
      <Paper 
        elevation={2}
        sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 3,
          backgroundColor: 'background.paper',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Trimite un mesaj
          </Typography>
          
          {/* Rate limit indicator */}
          {remainingMessages !== null && (
            <Chip
              icon={<Info />}
              label={`${remainingMessages} mesaje rămase astăzi`}
              color={remainingMessages > 0 ? 'success' : 'error'}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Cooldown progress */}
        {cooldownSeconds > 0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="warning" icon={<Warning />}>
              Vă rugăm să așteptați {cooldownSeconds} secunde înainte de a trimite un alt mesaj
            </Alert>
            <LinearProgress 
              variant="determinate" 
              value={100 - (cooldownSeconds / 15) * 100}
              sx={{ mt: 1, borderRadius: 1 }}
            />
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => {
              setSuccess('')
              setRemainingMessages(null)
            }}
          >
            {success}
          </Alert>
        )}

        {/* CAPTCHA requirement notice */}
        {requiresCaptcha && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Pentru siguranța dvs., vă rugăm să completați verificarea CAPTCHA de mai jos
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Hidden honeypot field for bot detection */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={handleInputChange('honeypot')}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Row 1: Name, Email, and Phone responsive layout */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                label="Numele complet"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={loading || cooldownSeconds > 0}
                InputProps={{
                  startAdornment: (
                    <Person sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Adresa de email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={loading || cooldownSeconds > 0}
                InputProps={{
                  startAdornment: (
                    <Email sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="tel"
                label="Numărul de telefon (opțional)"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={loading || cooldownSeconds > 0}
                placeholder="07XX XXX XXX"
                InputProps={{
                  startAdornment: (
                    <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Row 2: Message textarea full width */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              required
              multiline
              rows={6}
              label="Mesajul dvs."
              value={formData.message}
              onChange={handleInputChange('message')}
              disabled={loading || cooldownSeconds > 0}
              placeholder="Descrieți cererea dvs., întrebarea sau sugestia... (minim 10 caractere)"
              helperText={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formData.message.length < 10 ? `Minim 10 caractere` : ''}</span>
                  <span style={{ color: formData.message.length > 450 ? 'orange' : 'inherit' }}>
                    {formData.message.length}/500 caractere
                  </span>
                </Box>
              }
              InputProps={{
                startAdornment: (
                  <Message sx={{ color: 'text.secondary', mr: 1, alignSelf: 'flex-start', mt: 1.5 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Row 3: Submit button on the right */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Rate limit info */}
            <Typography variant="caption" color="text.secondary">
              * Maxim 3 mesaje per adresă de email în 24 de ore
            </Typography>
            
            <Tooltip title={cooldownSeconds > 0 ? `Așteptați ${cooldownSeconds} secunde` : 'Trimite mesajul către echipa noastră'}>
              <span>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || cooldownSeconds > 0}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  sx={{
                    minHeight: { xs: 44, sm: 44, md: 48 },
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                >
                  {loading ? 'Se trimite...' : 'Trimite mesajul'}
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default Contact