/**
 * Newsletter Unsubscribe Page
 * Public page for users to unsubscribe from newsletter via email links
 */
import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Container
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Email as EmailIcon
} from '@mui/icons-material'
import { useNewsletterStore } from '../stores/newsletter'

const Unsubscribe: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { unsubscribe, loading } = useNewsletterStore()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
  const [message, setMessage] = useState('')
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  useEffect(() => {
    // Validate parameters
    if (!email || !token) {
      setStatus('invalid')
      setMessage('Link-ul de dezabonare este invalid sau incomplet.')
      return
    }

    // TODO: In a real implementation, you would verify the token here
    // For now, we'll just proceed with the unsubscribe
    handleUnsubscribe(email)
  }, [email, token])

  const handleUnsubscribe = async (emailAddress: string) => {
    try {
      const result = await unsubscribe(emailAddress)
      
      if (result.success) {
        setStatus('success')
        setMessage(result.message)
      } else {
        setStatus('error')
        setMessage(result.message)
      }
    } catch (error) {
      setStatus('error')
      setMessage('A apărut o eroare la dezabonare. Vă rugăm să încercați din nou.')
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box textAlign="center" py={4}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Se procesează dezabonarea...
            </Typography>
            <Typography color="text.secondary">
              Vă rugăm așteptați câteva momente.
            </Typography>
          </Box>
        )

      case 'success':
        return (
          <Box textAlign="center" py={4}>
            <SuccessIcon 
              sx={{ 
                fontSize: 80, 
                color: 'success.main', 
                mb: 3 
              }} 
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Dezabonare reușită!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Ne pare rău să te vezi plecând! Dacă îți schimbi părerea, te poți abona din nou oricând de pe site-ul nostru.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoHome}
              sx={{ minWidth: 200 }}
            >
              Înapoi la site
            </Button>
          </Box>
        )

      case 'error':
        return (
          <Box textAlign="center" py={4}>
            <ErrorIcon 
              sx={{ 
                fontSize: 80, 
                color: 'error.main', 
                mb: 3 
              }} 
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Eroare la dezabonare
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            <Alert severity="info" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Dacă problema persistă, ne poți contacta direct la adresa de email: contact@promac.ro
            </Alert>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Încearcă din nou
              </Button>
              <Button
                variant="contained"
                onClick={handleGoHome}
              >
                Înapoi la site
              </Button>
            </Box>
          </Box>
        )

      case 'invalid':
      default:
        return (
          <Box textAlign="center" py={4}>
            <ErrorIcon 
              sx={{ 
                fontSize: 80, 
                color: 'warning.main', 
                mb: 3 
              }} 
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Link invalid
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              {message}
            </Typography>
            <Alert severity="info" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              Dacă ai primit acest link într-un email de la Pro-Mac, te rugăm să verifici că link-ul este complet și să încerci din nou.
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={handleGoHome}
              sx={{ minWidth: 200 }}
            >
              Înapoi la site
            </Button>
          </Box>
        )
    }
  }

  return (
    <Container maxWidth="md">
      <Box py={8}>
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <EmailIcon 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Newsletter Pro-Mac
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Gestionarea abonamentului
          </Typography>
        </Box>

        {/* Content */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {renderContent()}
        </Paper>

        {/* Footer Info */}
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            Pro-Mac - Magazin de faianta și gresie
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pentru întrebări, ne poți contacta la: contact@promac.ro
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Unsubscribe