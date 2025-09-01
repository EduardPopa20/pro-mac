import React, { useEffect, useState } from 'react'
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { 
  LocationOn, 
  AccessTime, 
  Phone, 
  Email,
  Navigation,
  Directions
} from '@mui/icons-material'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { supabase } from '../lib/supabase'
import type { Showroom } from '../types'
import RealTimeStatus from '../components/common/RealTimeStatus'

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
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
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

  const carouselSettings = {
    dots: true,
    infinite: showrooms.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: showrooms.length > 1,
    autoplaySpeed: 5000,
    arrows: false,
    dotsClass: 'slick-dots custom-dots',
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Se încarcă showroom-urile...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pregătim informațiile pentru dvs.
        </Typography>
      </Box>
    )
  }

  if (showrooms.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Showroom-urile Noastre
          </Typography>
          <Typography color="text.secondary">
            În curând vom avea showroom-uri disponibile.
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 200px)' }}>
      {/* Real-time status indicator */}
      {/* <RealTimeStatus showStatus={true} position="top-right" /> */}
      
      <Box sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant={isMobile ? 'h4' : 'h3'} 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ mb: 4, fontWeight: 700 }}
        >
          Showroom-urile Noastre
        </Typography>

        {/* Carousel Container */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          pb: 6,
          '& .custom-dots': { 
            bottom: -40,
            '& li': {
              margin: '0 8px',
            },
            '& li button': {
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s ease',
              '&:before': {
                display: 'none',
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.7)',
                transform: 'scale(1.2)',
              },
            },
            '& li.slick-active button': {
              backgroundColor: theme.palette.primary.main,
              transform: 'scale(1.3)',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
            },
          } 
        }}>
          <Slider {...carouselSettings}>
            {showrooms.map((showroom) => (
              <Box key={showroom.id} sx={{ px: isXs ? 0.5 : 2 }}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: isXs ? 'calc(85vh - 100px)' : isMobile ? 'calc(75vh - 80px)' : 'calc(65vh - 60px)',
                    maxWidth: isXs ? '95vw' : isMobile ? '100%' : 900,
                    mx: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ 
                    height: '100%', 
                    display: 'flex',
                    flexDirection: 'column',
                    p: isXs ? 2 : 3,
                  }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography 
                        variant={isXs ? 'h5' : 'h4'} 
                        component="h2" 
                        sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}
                      >
                        {showroom.name}
                      </Typography>
                      <Chip 
                        label={showroom.city} 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: isXs ? '0.8rem' : '1rem' }}
                      />
                    </Box>

                    {/* Content - Scrollable */}
                    <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
                      {/* Address */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <LocationOn sx={{ 
                          color: 'primary.main', 
                          mr: 2, 
                          mt: 0.5,
                          fontSize: isXs ? '1.2rem' : '1.5rem'
                        }} />
                        <Typography variant="body1" sx={{ flex: 1, fontSize: isXs ? '0.9rem' : '1rem' }}>
                          {showroom.address}
                        </Typography>
                      </Box>

                      {/* Phone */}
                      {showroom.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Phone sx={{ 
                            color: 'primary.main', 
                            mr: 2,
                            fontSize: isXs ? '1.2rem' : '1.5rem'
                          }} />
                          <Typography variant="body1" sx={{ fontSize: isXs ? '0.9rem' : '1rem' }}>
                            {showroom.phone}
                          </Typography>
                        </Box>
                      )}

                      {/* Email */}
                      {showroom.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Email sx={{ 
                            color: 'primary.main', 
                            mr: 2,
                            fontSize: isXs ? '1.2rem' : '1.5rem'
                          }} />
                          <Typography variant="body1" sx={{ fontSize: isXs ? '0.9rem' : '1rem' }}>
                            {showroom.email}
                          </Typography>
                        </Box>
                      )}

                      {/* Opening Hours */}
                      {showroom.opening_hours && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AccessTime sx={{ 
                            color: 'primary.main', 
                            mr: 2,
                            fontSize: isXs ? '1.2rem' : '1.5rem'
                          }} />
                          <Typography variant="body1" sx={{ fontSize: isXs ? '0.9rem' : '1rem' }}>
                            {showroom.opening_hours}
                          </Typography>
                        </Box>
                      )}

                      {/* Description */}
                      {showroom.description && (
                        <Box sx={{ mt: 2 }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontStyle: 'italic',
                              fontSize: isXs ? '0.8rem' : '0.9rem',
                              lineHeight: 1.5
                            }}
                          >
                            {showroom.description}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Navigation Buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 2, 
                      mt: 'auto',
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider'
                    }}>
                      <Tooltip title="Deschide în Waze">
                        <IconButton
                          onClick={() => handleWazeClick(showroom)}
                          sx={{ 
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            '&:hover': { backgroundColor: 'primary.main' },
                            size: isXs ? 'medium' : 'large'
                          }}
                        >
                          <Navigation />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Deschide în Google Maps">
                        <IconButton
                          onClick={() => handleMapsClick(showroom)}
                          sx={{ 
                            backgroundColor: 'secondary.light',
                            color: 'secondary.contrastText',
                            '&:hover': { backgroundColor: 'secondary.main' },
                            size: isXs ? 'medium' : 'large'
                          }}
                        >
                          <Directions />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    </Container>
  )
}

export default PublicShowrooms