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
  Person,
  Email,
  Lock
} from '@mui/icons-material'
import GoogleIcon from '../components/icons/GoogleIcon'
import FacebookIcon from '../components/icons/FacebookIcon'
import { useAuthStore } from '../stores/auth'
import { useNavigate } from 'react-router-dom'
import { useOptionalReCaptcha } from '../hooks/useOptionalReCaptcha'

const SignUp: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { executeRecaptcha, isAvailable } = useOptionalReCaptcha()
  const [recaptchaAvailable, setRecaptchaAvailable] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuthStore()

  // Check if reCAPTCHA is available
  React.useEffect(() => {
    setRecaptchaAvailable(isAvailable && !!import.meta.env.VITE_RECAPTCHA_SITE_KEY)
  }, [isAvailable])

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

  // Strong password validation function
  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    if (password.length < 8) {
      return { isValid: false, error: 'Parola trebuie să aibă cel puțin 8 caractere' }
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Parola trebuie să conțină cel puțin o literă mică' }
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Parola trebuie să conțină cel puțin o literă mare' }
    }
    
    if (!/\d/.test(password)) {
      return { isValid: false, error: 'Parola trebuie să conțină cel puțin o cifră' }
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, error: 'Parola trebuie să conțină cel puțin un caracter special (!@#$%^&*(),.?":{}|<>)' }
    }
    
    return { isValid: true }
  }

  const validateSignUp = () => {
    if (!signUpData.fullName.trim()) {
      setError('Numele complet este obligatoriu')
      return false
    }
    
    if (signUpData.fullName.trim().length > 10) {
      setError('Numele poate avea maxim 10 caractere')
      return false
    }
    
    // Use custom email validation
    const emailValidation = validateEmail(signUpData.email)
    if (!emailValidation.isValid) {
      setError(emailValidation.error!)
      return false
    }
    
    // Use strong password validation
    const passwordValidation = validatePassword(signUpData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!)
      return false
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Parolele nu se potrivesc')
      return false
    }
    return true
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
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
    setSuccess('')
    
    try {
      await signInWithFacebook()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Eroare la conectarea cu Facebook')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignUp()) return

    // Execute reCAPTCHA if available
    let recaptchaToken = null
    if (recaptchaAvailable && executeRecaptcha) {
      try {
        recaptchaToken = await executeRecaptcha('signup')
        if (!recaptchaToken) {
          setError('Verificarea reCAPTCHA a eșuat. Vă rugăm să încercați din nou.')
          setLoading(false)
          return
        }
      } catch (error) {
        console.warn('reCAPTCHA failed:', error)
        // Continue without reCAPTCHA if it fails
      }
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const result = await signUp(signUpData.email, signUpData.password, signUpData.fullName, recaptchaToken)
      
      if (result.needsConfirmation) {
        setSuccess('Contul a fost creat cu succes! Vă rugăm să verificați email-ul pentru a confirma adresa.')
        navigate('/auth/verify-email')
      } else {
        setSuccess('Cont creat și activat cu succes! Te poți autentifica acum.')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la crearea contului')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToLogin = () => {
    navigate('/login')
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Cont nou</Typography>
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
                Creează-ți contul pentru faianță și gresie
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
              Înscrie-te cu Google
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
              Înscrie-te cu Facebook
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

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {/* Sign Up Form */}
          <Box component="form" onSubmit={handleSignUp} noValidate>
            <TextField
              fullWidth
              label="Nume complet"
              value={signUpData.fullName}
              onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
              margin="normal"
              required
              disabled={loading}
              helperText="Maxim 10 caractere"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signUpData.email}
              onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
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
              value={signUpData.password}
              onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
              margin="normal"
              required
              disabled={loading}
              helperText="Minim 8 caractere: literă mare, mică, cifră și caracter special"
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
              label="Confirmă parola"
              type={showPassword ? 'text' : 'password'}
              value={signUpData.confirmPassword}
              onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
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
                  Se creează contul...
                </>
              ) : (
                'Creează cont'
              )}
            </Button>
          </Box>

          {/* Login Link */}
          <Divider sx={{ my: 2 }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
            >
              Ai deja cont?
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="text"
            onClick={handleNavigateToLogin}
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
            Autentifică-te
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default SignUp