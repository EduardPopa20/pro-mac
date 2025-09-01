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
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton
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

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: { xs: 0.5, md: 1 } }}>{children}</Box>}
    </div>
  )
}

const Auth: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { executeRecaptcha, isAvailable } = useOptionalReCaptcha()
  const [recaptchaAvailable, setRecaptchaAvailable] = useState(false)
  
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Sign In form state
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })
  
  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuthStore()

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setError('')
    setSuccess('')
    setSignInData({ email: '', password: '' })
    setSignUpData({ fullName: '', email: '', password: '', confirmPassword: '' })
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
    setSuccess('')
    
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
        setSuccess('Cont creat și activat cu succes! Vă puteți autentifica acum.')
        setActiveTab(0) // Switch to sign in tab
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la crearea contului')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: 2,
        minHeight: 'calc(100vh - 64px)',
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
          boxShadow: 3,
          my: 2
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            variant="h5"
            component="h1" 
            color="primary.main"
            sx={{ mb: 0, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}
          >
            Pro-Mac
          </Typography>
          {!isMobile && (
            <Typography 
              variant="body2"
              color="text.secondary"
              sx={{ 
                fontSize: '0.8125rem',
                lineHeight: 1.2,
                mt: 0.5
              }}
            >
              Magazinul tău de încredere pentru faianță și gresie
            </Typography>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            mb: 2,
            minHeight: { xs: 36, md: 48 },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
              height: 3,
              borderRadius: 1.5
            }
          }}
        >
          <Tab
            label="Autentificare"
            sx={{
              fontWeight: 600,
              minHeight: { xs: 40, md: 48 },
              textTransform: 'none',
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          />
          <Tab
            label="Cont nou"
            sx={{
              fontWeight: 600,
              minHeight: { xs: 40, md: 48 },
              textTransform: 'none',
              fontSize: { xs: '0.875rem', md: '1rem' }
            }}
          />
        </Tabs>

        <Divider sx={{ mb: { xs: 0.25, md: 0.5 } }} />

        {/* OAuth Login Buttons */}
        <Box sx={{ mb: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon size={18} />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                mb: { xs: 0.125, md: 0.25 },
                py: { xs: 0.375, md: 0.5 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                minHeight: { xs: 32, md: 36 },
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
              {activeTab === 0 ? 'Conectează-te cu Google' : 'Inscrie-te cu Google'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FacebookIcon size={18} />}
              onClick={handleFacebookSignIn}
              disabled={loading}
              sx={{
                py: { xs: 0.375, md: 0.5 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.6875rem', md: '0.75rem' },
                minHeight: { xs: 32, md: 36 },
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
              {activeTab === 0 ? 'Conectează-te cu Facebook' : 'Inscrie-te cu Facebook'}
            </Button>
            <Divider sx={{ my: { xs: 0.25, md: 0.5 } }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.5625rem', md: '0.625rem' } }}
              >
                sau cu email
              </Typography>
            </Divider>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: { xs: 0.75, md: 1 }, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: { xs: 0.75, md: 1 }, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* Sign In Tab */}
        <TabPanel value={activeTab} index={0}>
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
                      <Email sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                      <Lock sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', md: '1rem' },
                  minHeight: { xs: 44, md: 48 },
                  borderRadius: 2,
                  textTransform: 'none',
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
          </TabPanel>

          {/* Sign Up Tab */}
          <TabPanel value={activeTab} index={1}>
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
                      <Person sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                      <Email sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                      <Lock sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                      <Lock sx={{ color: '#000', fontSize: '1.2rem' }} />
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
                  py: { xs: 1, md: 1.25 },
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', md: '1rem' },
                  minHeight: { xs: 44, md: 48 },
                  borderRadius: 2,
                  textTransform: 'none',
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
        </TabPanel>
      </Box>
    </Container>
  )
}

export default Auth