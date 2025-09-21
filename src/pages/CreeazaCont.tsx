import React, { useState, useEffect } from 'react'
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
  Person,
  Email,
  Lock
} from '@mui/icons-material'
import ReCAPTCHA from 'react-google-recaptcha'
import GoogleIcon from '../components/icons/GoogleIcon'
import FacebookIcon from '../components/icons/FacebookIcon'
import { useAuthStore } from '../stores/auth'
import { useNavigate } from 'react-router-dom'
import { useReCaptchaV2 } from '../hooks/useReCaptchaV2'
import '../styles/recaptcha-fix.css'

const CreeazaCont: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { recaptchaRef, isAvailable, siteKey } = useReCaptchaV2()
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  
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

  // Enhanced reCAPTCHA z-index fix with MutationObserver
  useEffect(() => {
    const fixRecaptchaZIndex = () => {
      // Target elements with extremely high z-index
      const problematicSelectors = [
        '[style*="z-index: 2000000000"]',
        '[style*="z-index:2000000000"]',
        'div[style*="position: fixed"][style*="z-index"]'
      ]
      
      problematicSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          const el = element as HTMLElement
          const currentZIndex = parseInt(window.getComputedStyle(el).zIndex)
          
          if (currentZIndex >= 2000000000) {
            // Check if this is the challenge iframe container
            const hasRecaptchaIframe = el.querySelector('iframe[title*="recaptcha"]')
            
            if (hasRecaptchaIframe) {
              // This is the actual reCAPTCHA challenge - keep it visible but reasonable
              el.style.setProperty('z-index', '9999', 'important')
            } else {
              // This is likely an invisible overlay - make it non-blocking
              el.style.setProperty('z-index', '9998', 'important')
              el.style.setProperty('pointer-events', 'none', 'important')
            }
          }
        })
      })
    }

    // Initial fix
    fixRecaptchaZIndex()
    
    // Set up MutationObserver to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          fixRecaptchaZIndex()
        }
      })
    })
    
    // Observe changes to the entire document
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    })
    
    // Also run periodically for the first 3 seconds as a safety net
    const intervalId = setInterval(fixRecaptchaZIndex, 250)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
    }, 3000)

    return () => {
      observer.disconnect()
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [])

  // Handle reCAPTCHA completion
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
    
    // Additional fix after reCAPTCHA interaction
    if (token) {
      // Force a re-check of z-index issues after successful completion
      requestAnimationFrame(() => {
        document.querySelectorAll('[style*="z-index"]').forEach(element => {
          const el = element as HTMLElement
          const zIndex = parseInt(window.getComputedStyle(el).zIndex)
          if (zIndex >= 2000000000) {
            el.style.setProperty('z-index', '9999', 'important')
          }
        })
      })
    }
  }

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
      setError('Eroare la conectarea cu Google. Încercați din nou.')
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
      setError('Eroare la conectarea cu Facebook. Încercați din nou.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignUp()) return

    // Check reCAPTCHA v2 completion
    if (isAvailable && !recaptchaToken) {
      setError('Vă rugăm să completați verificarea reCAPTCHA')
      return
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
          navigate('/conectare')
        }, 2000)
      }
    } catch (err: any) {
      // Ensure we never show technical error details to users
      let userMessage = 'Eroare la crearea contului. Încercați din nou.'
      
      if (err?.message && typeof err.message === 'string') {
        // Only show the error if it seems like a user-friendly message (in Romanian)
        if (err.message.includes('cont cu acest') || 
            err.message.includes('email') ||
            err.message.includes('parolă') ||
            err.message.includes('cerințele') ||
            err.message.includes('conexiune')) {
          userMessage = err.message
        }
      }
      
      setError(userMessage)
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
        setRecaptchaToken(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNavigateToLogin = () => {
    navigate('/conectare')
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

          <Typography
            variant="h5"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontWeight: 600
            }}
          >
            Cont Nou
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

          {/* Success Message */}
          {success && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
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
                  background: 'linear-gradient(to bottom, #4caf50, #388e3c)',
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
                    background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
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
                    ✓
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#388e3c',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    lineHeight: 1.4,
                    letterSpacing: '0.01em'
                  }}
                >
                  {success}
                </Typography>
              </Box>
            </Box>
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

            {/* reCAPTCHA v2 Component */}
            {isAvailable && siteKey && (
              <Box 
                sx={{ 
                  mt: 2, 
                  mb: 1, 
                  display: 'flex', 
                  justifyContent: 'center',
                  position: 'relative',
                  isolation: 'isolate',
                  // Create a stacking context to contain reCAPTCHA
                  zIndex: 1,
                  // Ensure reCAPTCHA doesn't overflow its container
                  '& .g-recaptcha': {
                    position: 'relative !important',
                    zIndex: '1 !important',
                    transform: 'translateZ(0)' // Force GPU layer
                  }
                }}
              >
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={siteKey}
                  onChange={handleRecaptchaChange}
                  theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                  size={isMobile ? 'compact' : 'normal'}
                />
              </Box>
            )}

            {/* Custom Error Message - Positioned above create account button */}
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
            Conectează-te
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default CreeazaCont