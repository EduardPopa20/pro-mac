import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  EmailOutlined,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material'
import { useAuthStore } from '../stores/auth'

const VerifyEmail: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  
  const { verifyEmail, resendConfirmation, emailConfirmationPending } = useAuthStore()
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check for verification token in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const token = urlParams.get('token')
    const type = urlParams.get('type')
    
    if (token) {
      handleEmailVerification(token, type || undefined)
    }
  }, [location])

  const handleEmailVerification = async (token: string, type?: string) => {
    setStatus('verifying')
    setError('')
    
    try {
      await verifyEmail(token, type)
      setStatus('success')
      
      // Redirect to home after successful verification
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 3000)
      
    } catch (err: any) {
      setStatus('error')
      setError(err.message)
    }
  }

  const handleResendConfirmation = async () => {
    if (!emailConfirmationPending) {
      setError('Nu există nicio adresă de email în așteptarea confirmării')
      return
    }

    setResendLoading(true)
    setError('')
    setResendSuccess(false)
    
    try {
      await resendConfirmation(emailConfirmationPending)
      setResendSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setResendLoading(false)
    }
  }

  const renderVerifyingState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <CircularProgress size={60} />
      <Typography variant="h5" textAlign="center">
        Se verifică adresa de email...
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        Vă rugăm să așteptați în timp ce verificăm adresa dvs. de email.
      </Typography>
    </Box>
  )

  const renderSuccessState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <CheckCircle sx={{ fontSize: '4rem', color: 'success.main' }} />
      <Typography variant="h4" textAlign="center" color="success.main">
        Email verificat cu succes!
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        Contul dvs. a fost activat. Veți fi redirecționat în curând...
      </Typography>
      <CircularProgress size={30} />
    </Box>
  )

  const renderErrorState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <Error sx={{ fontSize: '4rem', color: 'error.main' }} />
      <Typography variant="h5" textAlign="center" color="error.main">
        Eroare la verificarea email-ului
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {error}
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/conectare')}
        sx={{ mt: 2 }}
      >
        Înapoi la autentificare
      </Button>
    </Box>
  )

  const renderPendingState = () => (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <EmailOutlined sx={{ fontSize: '4rem', color: theme.palette.primary.main }} />
      <Typography variant="h4" textAlign="center">
        Verificați-vă email-ul
      </Typography>
      
      {emailConfirmationPending ? (
        <>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
            Am trimis un email de confirmare la adresa{' '}
            <strong>{emailConfirmationPending}</strong>. Vă rugăm să faceți clic pe link-ul din email pentru a vă activa contul.
          </Typography>
          
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Nu ați primit email-ul?
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={resendLoading ? <CircularProgress size={20} /> : <Refresh />}
              onClick={handleResendConfirmation}
              disabled={resendLoading}
            >
              {resendLoading ? 'Se retrimite...' : 'Retrimite email-ul'}
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
            Pentru a vă activa contul, vă rugăm să accesați link-ul de verificare trimis pe email.
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/conectare')}
            sx={{ mt: 2 }}
          >
            Înapoi la autentificare
          </Button>
        </>
      )}
    </Box>
  )

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return renderVerifyingState()
      case 'success':
        return renderSuccessState()
      case 'error':
        return renderErrorState()
      default:
        return renderPendingState()
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
      <Card
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.05) 100%)'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            py: 3,
            px: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Pro-Mac
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Verificare adresă de email
          </Typography>
        </Box>

        <CardContent sx={{ p: isMobile ? 3 : 5 }}>
          {/* Error Alert */}
          {error && status !== 'error' && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Success Alert for Resend */}
          {resendSuccess && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Email-ul de confirmare a fost retrimis cu succes!
            </Alert>
          )}

          {renderContent()}
        </CardContent>
      </Card>
    </Container>
  )
}

export default VerifyEmail