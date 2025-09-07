import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Alert
} from '@mui/material'
import { Lock } from '@mui/icons-material'

interface PasswordProtectionProps {
  children: React.ReactNode
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('beta_access')
    if (auth === 'granted') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Set your password here or use env variable
    const BETA_PASSWORD = import.meta.env.VITE_BETA_PASSWORD || 'promac2024'
    
    if (password === BETA_PASSWORD) {
      sessionStorage.setItem('beta_access', 'granted')
      setIsAuthenticated(true)
    } else {
      setError('Parolă incorectă')
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Site în Dezvoltare
          </Typography>
          <Typography color="text.secondary">
            Acest site este în curs de dezvoltare. Vă rugăm introduceți parola pentru acces.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="password"
            label="Parolă"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
            autoFocus
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
          >
            Accesează Site-ul
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          © 2024 Pro-Mac Tiles. Toate drepturile rezervate.
        </Typography>
      </Paper>
    </Container>
  )
}

export default PasswordProtection