import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Grid,
  Breadcrumbs,
  Link,
  Stack,
  Chip,
  Divider,
  Paper
} from '@mui/material'
import { 
  LocationOn, 
  AccessTime, 
  Phone, 
  Email,
  Navigation,
  Directions,
  Store,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'
import type { Showroom } from '../types'

const PublicShowrooms: React.FC = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchShowrooms = async () => {
      try {
        // Fetch only active showrooms for public users
        const { data, error } = await supabase
          .from('showrooms')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error
        setShowrooms(data || [])
      } catch (error: any) {
        console.error('Error fetching showrooms:', error.message)
        setShowrooms([])
      } finally {
        setLoading(false)
      }
    }

    fetchShowrooms()
  }, [])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleMapsClick = (showroom: Showroom) => {
    if (showroom.google_maps_url) {
      window.open(showroom.google_maps_url, '_blank')
    } else {
      const encodedAddress = encodeURIComponent(showroom.address)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(mapsUrl, '_blank')
    }
  }

  const handleWazeClick = (showroom: Showroom) => {
    if (showroom.waze_url) {
      window.open(showroom.waze_url, '_blank')
    } else {
      const encodedAddress = encodeURIComponent(showroom.address)
      const wazeUrl = `https://www.waze.com/ul?q=${encodedAddress}`
      window.open(wazeUrl, '_blank')
    }
  }


  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Typography color="text.primary">Showroom-uri</Typography>
          </Breadcrumbs>
        </Box>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          sx={{ minHeight: 'calc(100vh - 200px)', width: '100%' }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={50} />
            <Typography color="text.secondary">Se încarcă showroom-urile...</Typography>
          </Stack>
        </Box>
      </Container>
    )
  }

  if (showrooms.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Typography color="text.primary">Showroom-uri</Typography>
          </Breadcrumbs>
        </Box>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: 'grey.50'
          }}
        >
          <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Nu sunt showroom-uri active momentan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vă rugăm să reveniți mai târziu sau să ne contactați pentru informații
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Showroom-uri</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Showroom-urile noastre
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vizitează-ne pentru a vedea și atinge produsele noastre de calitate
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {showrooms.map((showroom) => (
          <Grid item xs={12} md={6} xl={4} key={showroom.id}>
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                border: `1px solid`,
                borderColor: 'success.light',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'success.main',
                  boxShadow: theme.shadows[6],
                  transform: 'translateY(-2px)'
                },
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {/* Status Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: 16,
                  zIndex: 1
                }}
              >
                <Chip
                  icon={<CheckCircle />}
                  label="Deschis"
                  color="success"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    boxShadow: theme.shadows[2]
                  }}
                />
              </Box>

              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header Section */}
                <Box
                  sx={{
                    p: 3,
                    pb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Store sx={{ fontSize: 24, color: 'inherit' }} />
                    </Box>
                    <Box flex={1}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700, 
                          mb: 0.5,
                          lineHeight: 1.2,
                          letterSpacing: '-0.02em'
                        }}
                      >
                        {showroom.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          opacity: 0.9,
                          fontWeight: 500
                        }}
                      >
                        {showroom.city}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: 3, pt: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Location */}
                  <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
                    <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.1 }} />
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          lineHeight: 1.4,
                          color: 'text.primary'
                        }}
                      >
                        {showroom.address}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Contact Info */}
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {showroom.phone && (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Phone sx={{ color: 'info.main', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {showroom.phone}
                        </Typography>
                      </Box>
                    )}
                    
                    {showroom.email && (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Email sx={{ color: 'warning.main', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {showroom.email}
                        </Typography>
                      </Box>
                    )}

                    {showroom.opening_hours && (
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <AccessTime sx={{ color: 'secondary.main', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {showroom.opening_hours}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Description */}
                  {showroom.description && (
                    <Box sx={{ mb: 2, flex: 1 }}>
                      <Divider sx={{ mb: 2, borderColor: 'divider' }} />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.5,
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        "{showroom.description}"
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<Directions />}
                        onClick={() => handleMapsClick(showroom)}
                        sx={{ 
                          flex: 1, 
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          minHeight: 40,
                          bgcolor: '#4285F4',
                          '&:hover': { 
                            bgcolor: '#3367D6',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Google Maps
                      </Button>
                      
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<Navigation />}
                        onClick={() => handleWazeClick(showroom)}
                        sx={{ 
                          flex: 1, 
                          borderRadius: 2,
                          fontWeight: 600,
                          textTransform: 'none',
                          minHeight: 40,
                          bgcolor: '#00D4FF',
                          '&:hover': { 
                            bgcolor: '#00B8E6',
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        Waze
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default PublicShowrooms