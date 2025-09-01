import React from 'react'
import {
  Box,
  Typography,
  Button,
  Container,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { SearchOff, Home, ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} alignItems="center" textAlign="center">
        <SearchOff 
          sx={{ 
            fontSize: { xs: 80, md: 100 }, 
            color: 'primary.main',
            opacity: 0.6
          }} 
        />
        
        <Box>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h1" 
            color="primary.main" 
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            404 - Pagina nu a fost găsită
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 2, fontWeight: 400 }}
          >
            Ups! Pagina pe care o cauți nu există.
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Este posibil ca pagina să fi fost mutată, ștearsă sau să fi introdus o adresă greșită. 
            Te rugăm să verifici URL-ul sau să navighezi înapoi la pagina principală.
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
            sx={{ minWidth: 160 }}
          >
            Pagina principală
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            size="large"
            sx={{ minWidth: 160 }}
          >
            Înapoi
          </Button>
        </Stack>

        <Box sx={{ mt: 6, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Poți să încerci:
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              • Verificarea ortografiei URL-ului
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Folosirea meniului de navigație
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Căutarea produselor în bara de căutare
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Contactarea echipei noastre pentru asistență
            </Typography>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Ai întrebări? Contactează-ne la{' '}
          <Typography 
            component="a" 
            href="mailto:contact@pro-mac.ro" 
            color="primary.main"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            contact@pro-mac.ro
          </Typography>{' '}
          sau sună la{' '}
          <Typography 
            component="a" 
            href="tel:+40123456789" 
            color="primary.main"
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            +40 123 456 789
          </Typography>
        </Typography>
      </Stack>
    </Container>
  )
}

export default NotFoundPage