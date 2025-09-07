import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { useAuthStore } from '../stores/auth'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { checkAuth } = useAuthStore()
  const [error, setError] = React.useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait for auth state to update after OAuth redirect
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check authentication status
        await checkAuth()
        
        // Redirect to home page
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Eroare la autentificare. Vă rugăm să încercați din nou.')
        
        // Redirect to auth page after a delay
        setTimeout(() => {
          navigate('/conectare', { replace: true })
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [checkAuth, navigate])

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Veți fi redirecționat automat către pagina de autentificare...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        Se procesează autentificarea...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Vă rugăm să așteptați
      </Typography>
    </Box>
  )
}

export default AuthCallback