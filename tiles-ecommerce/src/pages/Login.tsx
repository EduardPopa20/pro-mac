import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock
} from '@mui/icons-material'
import GoogleIcon from '../components/icons/GoogleIcon'
import FacebookIcon from '../components/icons/FacebookIcon'
import { useAuthStore } from '../stores/auth'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })
  
  const { signIn, signInWithGoogle, signInWithFacebook } = useAuthStore()

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email.trim()) {
      return { isValid: false, error: 'Email-ul este obligatoriu' }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formatul adresei de email este invalid' }
    }
    
    return { isValid: true }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInData.email || !signInData.password) {
      setError('Vă rugăm să completați toate câmpurile')
      return
    }

    // Validate email format for sign in as well
    const emailValidation = validateEmail(signInData.email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error!)
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await signIn(signInData.email, signInData.password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Eroare la autentificare')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Eroare la conectarea cu Google')
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setLoading(true)
    setError('')
    
    try {
      await signInWithFacebook()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Eroare la conectarea cu Facebook')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToSignUp = () => {
    navigate('/signup')
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Autentificare</Typography>
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
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="h4"
              component="h1" 
              color="primary.main"
              sx={{ mb: 0 }}
            >
              Pro-Mac
            </Typography>
            {!isMobile && (
              <Typography 
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Magazinul tău de încredere pentru faianță și gresie
              </Typography>
            )}
          </Box>

          {/* OAuth Login Buttons */}
          <Box sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon size={18} />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              size="medium"
              sx={{
                mb: 1,
                borderColor: '#db4437',
                color: '#db4437',
                '&:hover': {
                  borderColor: '#db4437',
                  backgroundColor: '#db4437',
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                },
                '&:disabled': {
                  borderColor: '#db4437',
                  color: '#db4437'
                }
              }}
            >
              Conectează-te cu Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon size={18} />}
              onClick={handleFacebookSignIn}
              disabled={loading}
              size="medium"
              sx={{
                borderColor: '#1877F2',
                color: '#1877F2',
                '&:hover': {
                  borderColor: '#1877F2',
                  backgroundColor: '#1877F2',
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                },
                '&:disabled': {
                  borderColor: '#1877F2',
                  color: '#1877F2'
                }
              }}
            >
              Conectează-te cu Facebook
            </Button>
            <Divider sx={{ my: 2 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
              >
                sau cu email
              </Typography>
            </Divider>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Sign In Form */}
          <Box component="form" onSubmit={handleSignIn} noValidate>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signInData.email}
              onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Parola"
              type={showPassword ? 'text' : 'password'}
              value={signInData.password}
              onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Se autentifică...
                </>
              ) : (
                'Autentificare'
              )}
            </Button>
          </Box>

          {/* Sign Up Link */}
          <Divider sx={{ my: 2 }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
            >
              Nu ai cont?
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="text"
            onClick={handleNavigateToSignUp}
            disabled={loading}
            size="medium"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.dark
              }
            }}
          >
            Creează cont nou
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Login