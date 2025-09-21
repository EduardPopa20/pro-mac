import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material'
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ForgotPassword: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  // Email validation function
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email-ul este obligatoriu')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Formatul adresei de email este invalid')
      return false
    }
    
    setEmailError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')
    
    // Validate email
    if (!validateEmail(email)) {
      return
    }

    setLoading(true)
    
    try {
      // Send password reset email through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (error) {
        // Handle specific error messages
        if (error.message.includes('User not found')) {
          setError('Nu există un cont asociat cu această adresă de email')
        } else if (error.message.includes('too many requests') || error.message.includes('rate_limit')) {
          setError('Prea multe încercări. Vă rugăm să așteptați câteva minute și să încercați din nou')
        } else {
          setError('A apărut o eroare. Vă rugăm să încercați din nou mai târziu')
        }
      } else {
        // Success
        setSuccess(true)
        setEmail('')
      }
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError('A apărut o eroare neașteptată. Vă rugăm să încercați din nou')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/conectare')
  }

  if (success) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            sx={{
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              '& .MuiBreadcrumbs-separator': {
                fontSize: { xs: '0.75rem', md: '0.875rem' },
                mx: { xs: 0.5, md: 1 }
              }
            }}
          >
            <Link
              href="/"
              color="inherit"
              sx={{
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              Acasă
            </Link>
            <Link
              href="/conectare"
              color="inherit"
              sx={{
                textDecoration: 'none',
                fontSize: { xs: '0.75rem', md: '0.875rem' }
              }}
            >
              {isMobile ? 'Login' : 'Autentificare'}
            </Link>
            <Typography
              color="text.primary"
              sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
            >
              {isMobile ? 'Reset' : 'Recuperare Parolă'}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <Box
          sx={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper
            sx={{
              width: '100%',
              maxWidth: 450,
              mx: 'auto',
              p: { xs: 3, md: 4 },
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Email trimis cu succes!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Am trimis instrucțiunile pentru resetarea parolei la adresa de email furnizată. 
              Vă rugăm să verificați inbox-ul și folder-ul de spam.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Link-ul de resetare este valabil pentru 1 oră.
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleBackToLogin}
              size={isMobile ? "medium" : "large"}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                minHeight: { xs: 44, md: 48 }
              }}
            >
              Înapoi la Autentificare
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          sx={{
            fontSize: { xs: '0.75rem', md: '0.875rem' },
            '& .MuiBreadcrumbs-separator': {
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              mx: { xs: 0.5, md: 1 }
            }
          }}
        >
          <Link
            href="/"
            color="inherit"
            sx={{
              textDecoration: 'none',
              fontSize: { xs: '0.75rem', md: '0.875rem' }
            }}
          >
            Acasă
          </Link>
          <Link
            href="/conectare"
            color="inherit"
            sx={{
              textDecoration: 'none',
              fontSize: { xs: '0.75rem', md: '0.875rem' }
            }}
          >
            {isMobile ? 'Login' : 'Autentificare'}
          </Link>
          <Typography
            color="text.primary"
            sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
          >
            {isMobile ? 'Reset' : 'Recuperare Parolă'}
          </Typography>
        </Breadcrumbs>
      </Box>
      
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            mx: 'auto',
            p: { xs: 2, md: 3 },
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography 
              variant="h4"
              component="h1" 
              color="primary.main"
              sx={{ mb: 1 }}
            >
              Pro-Mac
            </Typography>
            <Typography 
              variant="h6"
              color="text.primary"
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Recuperare Parolă
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              Introduceți adresa de email asociată contului pentru a primi instrucțiuni de resetare a parolei
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Adresa de Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) {
                  validateEmail(e.target.value)
                }
              }}
              onBlur={() => validateEmail(email)}
              error={!!emailError}
              helperText={emailError}
              margin="normal"
              required
              disabled={loading}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "medium" : "large"}
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                minHeight: { xs: 44, md: 48 },
                fontSize: { xs: '0.9375rem', md: '1rem' }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={18} sx={{ mr: 1, color: 'white' }} />
                  Se trimite...
                </>
              ) : (
                'Trimite Link'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleBackToLogin}
              disabled={loading}
              startIcon={<ArrowBack />}
              size={isMobile ? "medium" : "large"}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                minHeight: { xs: 44, md: 48 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              Înapoi la Login
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default ForgotPassword