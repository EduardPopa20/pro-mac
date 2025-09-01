/**
 * RESPONSIVE Newsletter Subscription Modal Component
 * Center-positioned modal for email subscription with validation
 * Appears after 3-4 seconds on first visit with responsive design
 * Responsive across all device breakpoints (xs, sm, md, lg, xl)
 */
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  Email as EmailIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material'

interface NewsletterModalProps {
  open: boolean
  onClose: () => void
  onSubscribe: (email: string) => Promise<{ success: boolean; message: string }>
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ open, onClose, onSubscribe }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) // < 960px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')) // < 600px

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate email
    if (!email.trim()) {
      setError('Adresa de email este obligatorie')
      return
    }

    if (!validateEmail(email.trim())) {
      setError('Vă rugăm să introduceți o adresă de email validă')
      return
    }

    setLoading(true)

    try {
      const result = await onSubscribe(email.trim().toLowerCase())
      
      if (result.success) {
        setSuccess(result.message)
        setSubmitted(true)
        setEmail('')
        
        // Auto-close after success
        setTimeout(() => {
          onClose()
          setSubmitted(false)
          setSuccess(null)
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('A apărut o eroare. Vă rugăm să încercați din nou.')
      console.error('Newsletter subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      onClose()
      // Reset form state when closing
      setTimeout(() => {
        setEmail('')
        setError(null)
        setSuccess(null)
        setSubmitted(false)
      }, 300)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: isSmallMobile ? 1 : 2,
          mx: isSmallMobile ? 2 : 'auto',
          my: isSmallMobile ? 4 : 'auto',
          maxHeight: isSmallMobile ? '90vh' : '80vh',
          // Ensure modal is centered on mobile
          position: 'relative'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
          justifyContent: 'center'
        }
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleClose}
        disabled={loading}
        sx={{
          position: 'absolute',
          right: isSmallMobile ? 8 : 16,
          top: isSmallMobile ? 8 : 16,
          color: 'grey.500',
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ 
        textAlign: 'center', 
        pt: isSmallMobile ? 4 : 5, 
        pb: 2,
        px: isSmallMobile ? 2 : 3
      }}>
        {!submitted ? (
          <>
            {/* Email Icon */}
            <Box display="flex" justifyContent="center" mb={2}>
              <EmailIcon 
                sx={{ 
                  fontSize: isSmallMobile ? 48 : 56, 
                  color: 'primary.main',
                  mb: 1
                }} 
              />
            </Box>

            {/* Title */}
            <Typography 
              variant={isSmallMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.main',
                mb: 1,
                lineHeight: 1.2
              }}
            >
              Rămâi la curent!
            </Typography>

            {/* Subtitle */}
            <Typography 
              variant={isSmallMobile ? "body2" : "body1"} 
              sx={{ 
                color: 'text.secondary', 
                lineHeight: 1.6,
                mb: 3,
                px: isSmallMobile ? 0 : 2
              }}
            >
              Abonează-te la newsletter-ul Pro-Mac și fii primul care află despre ofertele speciale, produsele noi și promoțiile exclusive pentru faianta și gresie.
            </Typography>

            {/* Email Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                type="email"
                label="Adresa ta de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                error={!!error}
                helperText={error}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: isSmallMobile ? '0.9rem' : '1rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isSmallMobile ? '0.9rem' : '1rem'
                  }
                }}
                InputProps={{
                  sx: {
                    height: isSmallMobile ? 48 : 56
                  }
                }}
              />

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
            </Box>
          </>
        ) : (
          // Success State
          <Box display="flex" flexDirection="column" alignItems="center">
            <SuccessIcon 
              sx={{ 
                fontSize: isSmallMobile ? 56 : 64, 
                color: 'success.main',
                mb: 2
              }} 
            />
            <Typography 
              variant={isSmallMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 600, 
                color: 'success.main',
                mb: 2
              }}
            >
              Mulțumim!
            </Typography>
            <Typography 
              variant={isSmallMobile ? "body2" : "body1"} 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'center',
                lineHeight: 1.6
              }}
            >
              Te-ai abonat cu succes la newsletter-ul Pro-Mac. Vei primi ofertele noastre speciale direct în email.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      {!submitted && (
        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2, 
          pb: isSmallMobile ? 2 : 3, 
          px: isSmallMobile ? 2 : 3
        }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
            sx={{ 
              minWidth: isSmallMobile ? 80 : 100,
              height: isSmallMobile ? 40 : 44,
              fontSize: isSmallMobile ? '0.875rem' : '0.9rem'
            }}
          >
            Mai târziu
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={loading || !email.trim()}
            variant="contained"
            color="primary"
            sx={{ 
              minWidth: isSmallMobile ? 100 : 120,
              height: isSmallMobile ? 40 : 44,
              fontSize: isSmallMobile ? '0.875rem' : '0.9rem'
            }}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Se procesează...' : 'Abonează-te'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default NewsletterModal