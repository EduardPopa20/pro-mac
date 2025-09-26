import React, { useEffect } from 'react'
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
import { useSettingsStore } from '../../stores/settings'

const Footer: React.FC = () => {
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])
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
        {/* Centered footer layout with 4 rows */}
        <Box sx={{ textAlign: 'center' }}>

          {/* Row 1: Products and Contact sections side by side, centered */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            mb: 4,
            flexWrap: 'wrap'
          }}>
            {/* Products */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Produse
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" color="grey.300" underline="hover">Gresie</Link>
                <Link href="#" color="grey.300" underline="hover">Faianta</Link>
                <Link href="#" color="grey.300" underline="hover">Parchet</Link>
                <Link href="#" color="grey.300" underline="hover">Riflaje</Link>
              </Box>
            </Box>

            {/* Contact */}
            <Box>
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
            </Box>
          </Box>

          {/* Row 2: Company name centered */}
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
            Pro-Mac
          </Typography>

          {/* Row 3: Presentation text centered */}
          <Typography variant="body1" color="grey.300" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Magazinul tău de încredere pentru faianta și gresie de calitate superioară.
            Peste 10 ani de experiență în amenajări interioare și exterioare.
          </Typography>

          {/* Row 4: Social media buttons centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
            {settings.social_facebook_url && (
              <IconButton
                component="a"
                href={settings.social_facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                size="medium"
                sx={{ color: 'grey.300', '&:hover': { color: '#1877F2' } }}
              >
                <Facebook />
              </IconButton>
            )}
            {settings.social_instagram_url && (
              <IconButton
                component="a"
                href={settings.social_instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                size="medium"
                sx={{ color: 'grey.300', '&:hover': { color: '#E4405F' } }}
              >
                <Instagram />
              </IconButton>
            )}
            {settings.social_tiktok_url && (
              <IconButton
                component="a"
                href={settings.social_tiktok_url}
                target="_blank"
                rel="noopener noreferrer"
                size="medium"
                sx={{ color: 'grey.300', '&:hover': { color: '#000000' } }}
              >
                <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </IconButton>
            )}
            {settings.social_youtube_url && (
              <IconButton
                component="a"
                href={settings.social_youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                size="medium"
                sx={{ color: 'grey.300', '&:hover': { color: '#FF0000' } }}
              >
                <YouTube />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="grey.400">
            © 2025 Pro-Mac. Toate drepturile rezervate.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="/termeni-conditii" color="grey.400" underline="hover" variant="body2">
              Termeni și Condiții
            </Link>
            <Link href="/politica-confidentialitate" color="grey.400" underline="hover" variant="body2">
              Politica de Confidențialitate
            </Link>
            <Link href="/politica-confidentialitate#drepturi" color="grey.400" underline="hover" variant="body2">
              GDPR
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer