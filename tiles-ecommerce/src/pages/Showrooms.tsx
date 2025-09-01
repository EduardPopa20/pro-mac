import React, { useEffect } from 'react'
/**
 * IMPORTANT: This component is fully responsive across all device breakpoints.
 * When developing new features, always ensure responsive design using MUI breakpoints:
 * - xs (0px+): Mobile phones
 * - sm (600px+): Small tablets
 * - md (960px+): Large tablets/small laptops  
 * - lg (1280px+): Desktop
 * - xl (1920px+): Large desktop
 * 
 * Test all breakpoints: isMobile = useMediaQuery(theme.breakpoints.down('md'))
 */
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  IconButton,
  useTheme,
  useMediaQuery
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
import { useSettingsStore } from '../stores/settings'
import type { Showroom } from '../types'

const Showrooms: React.FC = () => {
  const { showrooms, fetchShowrooms } = useSettingsStore()
  
  useEffect(() => {
    fetchShowrooms()
  }, [fetchShowrooms])
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))      // Phone: < 600px (S20 Ultra: 412px)
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))  // Mobile & Tablet: < 960px

  const handleMapsClick = (showroom: Showroom) => {
    if (showroom.google_maps_url) {
      window.open(showroom.google_maps_url, '_blank')
    } else {
      // Fallback to search by address
      const encodedAddress = encodeURIComponent(showroom.address)
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      window.open(mapsUrl, '_blank')
    }
  }

  const handleWazeClick = (showroom: Showroom) => {
    if (showroom.waze_url) {
      window.open(showroom.waze_url, '_blank')
    } else {
      // Fallback to search by address
      const encodedAddress = encodeURIComponent(showroom.address)
      const wazeUrl = `https://www.waze.com/ul?q=${encodedAddress}`
      window.open(wazeUrl, '_blank')
    }
  }

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    dotsClass: 'slick-dots custom-dots',
  }

  return (
    <Container maxWidth="xl" sx={{ height: 'calc(100vh - 200px)' }}>
      <Box sx={{ py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Carousel Container */}
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          pb: 6, // Add padding bottom for dots spacing
          '& .custom-dots': { 
            bottom: -40, // Move dots further down
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
            {showrooms.filter(showroom => showroom.is_active).map((showroom) => (
              <Box key={showroom.id} sx={{ px: isXs ? 0.5 : 2 }}>
                <Card 
                  elevation={4}
                  sx={{ 
                    height: isXs ? 'calc(85vh - 100px)' : isMobile ? 'calc(75vh - 80px)' : 'calc(65vh - 60px)',  // Account for dots space
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
                    p: isXs ? 1.5 : isMobile ? 2 : 4,  // Much smaller padding on phones
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    {/* Showroom Name */}
                    <Typography 
                      variant="h4"
                      component="h2" 
                      gutterBottom 
                      sx={{ 
                        color: theme.palette.primary.main, 
                        textAlign: 'center', 
                        mb: isXs ? 2 : 3
                      }}
                    >
                      {showroom.name}
                    </Typography>

                    <Box display="flex" sx={{ 
                      flex: 1, 
                      gap: isXs ? 1 : isMobile ? 2 : 4,  // Much smaller gap on phones
                      flexDirection: isMobile ? 'column' : 'row' 
                    }}>
                      {/* Left Column */}
                      <Box sx={{ flex: 1 }}>
                        {/* Address */}
                        <Box display="flex" alignItems="flex-start" gap={isXs ? 1 : 2} sx={{ mb: isXs ? 2 : 3 }}>
                          <LocationOn sx={{ 
                            color: theme.palette.primary.main,
                            mt: 0.5,
                            flexShrink: 0
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>Adresa:</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {showroom.address}
                            </Typography>
                            {showroom.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                {showroom.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        {/* Contact Info */}
                        <Box display="flex" alignItems="flex-start" gap={isXs ? 1 : 2} sx={{ mb: isXs ? 1.5 : 2 }}>
                          <Phone sx={{ 
                            color: theme.palette.primary.main,
                            mt: 0.5,
                            flexShrink: 0
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">Telefon:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              {showroom.phone}
                            </Typography>
                          </Box>
                        </Box>

                        {showroom.email && (
                          <Box display="flex" alignItems="flex-start" gap={isXs ? 1 : 2} sx={{ mb: isXs ? 2 : 3 }}>
                            <Email sx={{ 
                              color: theme.palette.primary.main,
                              mt: 0.5,
                              flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">Email:</Typography>
                              <Typography variant="body1" color="text.secondary">
                                {showroom.email}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {/* Right Column */}
                      <Box sx={{ flex: 1 }}>
                        {/* Schedule */}
                        {showroom.opening_hours && (
                          <Box display="flex" alignItems="flex-start" gap={isXs ? 1 : 2} sx={{ mb: isXs ? 2 : 3 }}>
                            <AccessTime sx={{ 
                              color: theme.palette.primary.main, 
                              mt: 0.5,
                              flexShrink: 0
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>Program:</Typography>
                              <Typography variant="body1" color="text.secondary">
                                {showroom.opening_hours}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {/* Description */}
                        {showroom.description && (
                          <Box sx={{ mb: isXs ? 2 : 3 }}>
                            <Typography variant="h6" gutterBottom>Descriere:</Typography>
                            <Typography variant="body1" color="text.secondary">
                              {showroom.description}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    {/* Navigation Buttons */}
                    <Box display="flex" justifyContent="center" gap={isXs ? 2 : 3} sx={{ mt: isXs ? 2 : 3 }}>
                      <IconButton
                        onClick={() => handleMapsClick(showroom)}
                        sx={{
                          bgcolor: '#4285F4',
                          color: 'white',
                          '&:hover': { bgcolor: '#3367D6', transform: 'scale(1.05)' },
                          width: isXs ? 50 : isMobile ? 60 : 80,
                          height: isXs ? 50 : isMobile ? 60 : 80,
                          transition: 'all 0.2s ease'
                        }}
                        title="Deschide în Google Maps"
                      >
                        <Directions />
                      </IconButton>
                      <IconButton
                        onClick={() => handleWazeClick(showroom)}
                        sx={{
                          bgcolor: '#00D4FF',
                          color: 'white',
                          '&:hover': { bgcolor: '#00B8E6', transform: 'scale(1.05)' },
                          width: isXs ? 50 : isMobile ? 60 : 80,
                          height: isXs ? 50 : isMobile ? 60 : 80,
                          transition: 'all 0.2s ease'
                        }}
                        title="Deschide în Waze"
                      >
                        <Navigation />
                      </IconButton>
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

export default Showrooms