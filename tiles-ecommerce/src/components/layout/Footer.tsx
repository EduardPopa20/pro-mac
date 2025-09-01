import React from 'react'
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton
} from '@mui/material'
import {
  Facebook,
  Instagram,
  YouTube,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material'

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Pro-Mac
            </Typography>
            <Typography variant="body2" color="grey.300" paragraph>
              Magazinul tău de încredere pentru faianta și gresie de calitate superioară. 
              Peste 10 ani de experiență în amenajări interioare și exterioare.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }}>
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Produse
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.300" underline="hover">Gresie</Link>
              <Link href="#" color="grey.300" underline="hover">Faianta</Link>
              <Link href="#" color="grey.300" underline="hover">Parchet</Link>
              <Link href="#" color="grey.300" underline="hover">Accesorii</Link>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Servicii
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.300" underline="hover">Calculator</Link>
              <Link href="#" color="grey.300" underline="hover">Transport</Link>
              <Link href="#" color="grey.300" underline="hover">Montaj</Link>
              <Link href="#" color="grey.300" underline="hover">Consultanță</Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 16, color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">
                  +40 123 456 789
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 16, color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">
                  contact@tilestore.ro
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: 'grey.400' }} />
                <Typography variant="body2" color="grey.300">
                  București, România
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="grey.400">
            © 2024 Pro-Mac. Toate drepturile rezervate.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              Termeni și Condiții
            </Link>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              Politica de Confidențialitate
            </Link>
            <Link href="#" color="grey.400" underline="hover" variant="body2">
              GDPR
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer