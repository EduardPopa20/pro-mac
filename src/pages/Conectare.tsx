import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
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

const Conectare: React.FC = () => {
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
      // Ensure we never show technical error details to users
      let userMessage = 'Eroare la autentificare. Încercați din nou.'
      
      if (err?.message && typeof err.message === 'string') {
        // Only show the error if it seems like a user-friendly message (in Romanian)
        if (err.message.includes('Email sau') || 
            err.message.includes('parolă') ||
            err.message.includes('confirmați') ||
            err.message.includes('multe încercări') ||
            err.message.includes('conexiune')) {
          userMessage = err.message
        }
      }
      
      setError(userMessage)
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
      setError('Eroare la conectarea cu Google. Încercați din nou.')
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
      setError('Eroare la conectarea cu Facebook. Încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToSignUp = () => {
    navigate('/creeaza-cont')
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Conectare</Typography>
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

          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontWeight: 600
            }}
          >
            Conectare
          </Typography>

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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate('/forgot-password')}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Ai uitat parola?
              </Link>
            </Box>

            {/* Custom Error Message - Positioned above login button */}
            {error && (
              <Box
                sx={{
                  mt: 2,
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.3s ease-out',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: 'linear-gradient(to bottom, #f44336, #d32f2f)',
                    borderRadius: '0 2px 2px 0'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        lineHeight: 1
                      }}
                    >
                      !
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#d32f2f',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {error}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 2,
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
                'Conectare'
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

export default Conectare