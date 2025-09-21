import React from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
  AlertTitle,
  Stack,
  useTheme
} from '@mui/material'
import { ErrorOutline, Home, Refresh } from '@mui/icons-material'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // In production, you might want to send this to an error reporting service
    // reportError(error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const theme = useTheme()
  
  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center" textAlign="center">
        <ErrorOutline 
          sx={{ 
            fontSize: 80, 
            color: 'error.main',
            opacity: 0.8
          }} 
        />
        
        <Box>
          <Typography variant="h3" component="h1" color="error.main" gutterBottom>
            Oops! Ceva nu a mers bine
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
            Ne pare rău, dar a apărut o problemă tehnică. Te rugăm să încerci din nou sau să ne contactezi dacă problema persistă.
          </Typography>
        </Box>

        {process.env.NODE_ENV === 'development' && (
          <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
            <AlertTitle>Detalii eroare (doar în dezvoltare)</AlertTitle>
            <Typography variant="body2" component="pre" sx={{ 
              fontSize: '0.8rem',
              overflow: 'auto',
              maxHeight: 200,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {error.message}
              {'\n\n'}
              {error.stack}
            </Typography>
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            size="large"
          >
            Încearcă din nou
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            Înapoi la pagina principală
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Dacă problema persistă, te rugăm să ne contactezi la{' '}
          <Typography component="a" href="mailto:contact@pro-mac.ro" color="primary.main">
            contact@pro-mac.ro
          </Typography>
        </Typography>
      </Stack>
    </Container>
  )
}

export default ErrorBoundary