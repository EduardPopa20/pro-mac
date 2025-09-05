import React, { useState, useCallback, useEffect } from 'react'
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
} from '@mui/material'
import {
  Email,
  Person,
  Message,
  Send,
  Phone,
  LocationOn,
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

const Contact: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

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
            message: formData.message.trim(),
            // Add phone if provided - will be stored as admin_notes for now since column doesn't exist yet
            admin_notes: formData.phone.trim() ? `Telefon: ${formData.phone.trim()}` : null
          }
        ])

      if (dbError) throw dbError

      // Send email notification via Edge Function (works for anonymous users)
      try {
        const emailResponse = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
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
      setFormData({ name: '', email: '', phone: '', message: '' })
      
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
  if (loading && !success && !error && !formData.name && !formData.email && !formData.phone && !formData.message) {
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
          {/* Row 1: Name, Email, and Phone responsive layout */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
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

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                type="tel"
                label="Numărul de telefon"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={loading}
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
                  minHeight: { xs: 44, sm: 44, md: 48 }, // CLAUDE.md compliance with sm breakpoint
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
    </Container>
  )
}

export default Contact