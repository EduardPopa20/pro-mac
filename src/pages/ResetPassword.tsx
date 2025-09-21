import React, { useState, useEffect } from 'react'
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
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ResetPassword: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [checkingToken, setCheckingToken] = useState(true)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Password validation requirements
  const passwordRequirements = [
    { id: 'length', label: 'Cel puțin 8 caractere', regex: /.{8,}/ },
    { id: 'uppercase', label: 'Cel puțin o literă mare', regex: /[A-Z]/ },
    { id: 'lowercase', label: 'Cel puțin o literă mică', regex: /[a-z]/ },
    { id: 'number', label: 'Cel puțin o cifră', regex: /\d/ },
    { id: 'special', label: 'Cel puțin un caracter special (!@#$%^&*)', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ]

  // Check if we have a valid recovery token on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setError('Link-ul de resetare a expirat sau este invalid. Vă rugăm să solicitați un nou link.')
          setValidToken(false)
        } else {
          setValidToken(true)
        }
      } catch (err) {
        console.error('Session check error:', err)
        setError('A apărut o eroare la verificarea sesiunii')
        setValidToken(false)
      } finally {
        setCheckingToken(false)
      }
    }

    checkSession()
  }, [])

  const validatePassword = (password: string): boolean => {
    const errors: string[] = []
    
    passwordRequirements.forEach(req => {
      if (!req.regex.test(password)) {
        errors.push(req.id)
      }
    })
    
    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Validate password as user types
    if (field === 'password') {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setError('')
    
    // Validate password
    if (!validatePassword(formData.password)) {
      setError('Parola nu îndeplinește toate cerințele')
      return
    }
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Parolele nu se potrivesc')
      return
    }

    setLoading(true)
    
    try {
      // Update the password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        if (error.message.includes('same as the old password')) {
          setError('Parola nouă nu poate fi identică cu parola anterioară')
        } else if (error.message.includes('weak')) {
          setError('Parola este prea slabă. Vă rugăm să alegeți o parolă mai puternică')
        } else {
          setError('A apărut o eroare la resetarea parolei. Vă rugăm să încercați din nou')
        }
      } else {
        // Success
        setSuccess(true)
        
        // Sign out the user to ensure clean state
        await supabase.auth.signOut()
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/conectare')
        }, 3000)
      }
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError('A apărut o eroare neașteptată. Vă rugăm să încercați din nou')
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!validToken) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Typography color="text.primary">Resetare Parolă</Typography>
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
                backgroundColor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <Cancel sx={{ fontSize: 48, color: 'error.main' }} />
            </Box>

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Link Invalid sau Expirat
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {error || 'Link-ul de resetare a parolei este invalid sau a expirat. Vă rugăm să solicitați un nou link.'}
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/forgot-password')}
              size="large"
              sx={{ borderRadius: 2, mb: 2 }}
            >
              Solicită Link Nou
            </Button>
            
            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/conectare')}
              sx={{ textTransform: 'none' }}
            >
              Înapoi la Autentificare
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }

  if (success) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Typography color="text.primary">Resetare Parolă</Typography>
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
              Parola a fost resetată cu succes!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Parola dvs. a fost schimbată cu succes. Veți fi redirecționat către pagina de autentificare...
            </Typography>

            <CircularProgress size={24} />
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Resetare Parolă</Typography>
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
            maxWidth: 480,
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
              Resetare Parolă
            </Typography>
            <Typography 
              variant="body2"
              color="text.secondary"
            >
              Introduceți noua parolă pentru contul dvs.
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
              label="Parolă Nouă"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              margin="normal"
              required
              disabled={loading}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Confirmă Parola Nouă"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Password Requirements */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cerințe parolă:
              </Typography>
              <List dense sx={{ py: 0 }}>
                {passwordRequirements.map(req => (
                  <ListItem key={req.id} sx={{ py: 0.5, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {req.regex.test(formData.password) ? (
                        <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 18, color: passwordErrors.includes(req.id) ? 'error.main' : 'text.disabled' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={req.label}
                      primaryTypographyProps={{
                        variant: 'caption',
                        color: req.regex.test(formData.password) ? 'success.main' : 
                               passwordErrors.includes(req.id) ? 'error.main' : 'text.secondary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || passwordErrors.length > 0 || !formData.password || !formData.confirmPassword}
              sx={{
                mt: 2,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Se resetează parola...
                </>
              ) : (
                'Resetează Parola'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default ResetPassword