import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
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
  useMediaQuery
} from '@mui/material'
import {
  Email,
  Person,
  Message,
  Send,
  Phone,
  LocationOn,
  AccessTime
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'

interface ContactFormData {
  name: string
  email: string
  message: string
}

const Contact: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleInputChange = (field: keyof ContactFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

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
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Store contact message in database (anonymous users can't use .select())
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            message: formData.message.trim()
          }
        ])

      if (dbError) throw dbError

      // Send email notification via Edge Function (works for anonymous users)
      try {
        const emailResponse = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            message: formData.message.trim()
          }
        })

        if (emailResponse.error) {
          console.warn('Email sending failed:', emailResponse.error)
          // Don't fail the whole operation if email fails
        }
      } catch (emailError: any) {
        console.warn('Email sending failed:', emailError.message)
        // Don't fail the whole operation if email fails
      }
      
      setSuccess('Mesajul dvs. a fost trimis cu succes! Vă vom contacta în curând.')
      setFormData({ name: '', email: '', message: '' })
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (error: any) {
      console.error('Error sending contact message:', error.message)
      setError('A apărut o eroare la trimiterea mesajului. Vă rugăm să încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  const renderBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
        Acasă
      </Link>
      <Typography color="text.primary">
        Contact
      </Typography>
    </Breadcrumbs>
  )

  // Standardized loading state following CLAUDE.md guidelines
  if (loading && !success && !error && !formData.name && !formData.email && !formData.message) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {renderBreadcrumbs()}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={50} />
            <Typography color="text.secondary">Se încarcă datele...</Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {renderBreadcrumbs()}
      
      {/* Page Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 700, mb: 2 }}
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
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Trimite un mesaj
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Row 1: Name and Email side by side */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Numele complet"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={loading}
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

            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="Adresa de email"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={loading}
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
              disabled={loading}
              placeholder="Descrieți cererea dvs., întrebarea sau sugestia..."
              helperText={`${formData.message.length}/500 caractere`}
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Trimite mesajul către echipa noastră">
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                sx={{
                  minHeight: { xs: 44, md: 48 }, // CLAUDE.md compliance
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                {loading ? 'Se trimite...' : 'Trimite mesajul'}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Contact Information Cards - Below form, spanning full width */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        {/* Company Info Card */}
        <Card elevation={2} sx={{ borderRadius: 3, flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Informații de contact
            </Typography>
            
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body1">
                  0729 926 085
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body1">
                  contact@promac.ro
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="flex-start" gap={2}>
                <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Sediul principal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vezi showroom-urile noastre pentru adrese complete
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Business Hours Card */}
        <Card elevation={2} sx={{ borderRadius: 3, flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Program de lucru
            </Typography>
            
            <Stack spacing={1.5}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTime sx={{ color: 'primary.main', fontSize: 20 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Luni - Vineri
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    09:00 - 18:00
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ mx: 2 }} />
              
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ width: 20 }} /> {/* Spacer */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Sâmbătă
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    09:00 - 14:00
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ width: 20 }} /> {/* Spacer */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Duminică
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Închis
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

export default Contact