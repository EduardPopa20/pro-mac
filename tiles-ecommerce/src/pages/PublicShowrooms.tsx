import React, { useEffect, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
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
  Paper,
  IconButton
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
  Business as BusinessIcon
} from '@mui/icons-material'
import { supabase } from '../lib/supabase'
import type { Showroom } from '../types'

const PublicShowrooms: React.FC = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([])
  const [loading, setLoading] = useState(true)

  // Parse working hours into structured format - Hardcoded realistic schedule
  const parseWorkingHours = (workingHours: string | null) => {
    const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă']
    
    // Hardcoded realistic business hours - in proper week order
    const schedule = [
      { day: 'Luni', hours: '08:30 - 18:00' },
      { day: 'Marți', hours: '08:30 - 18:00' },
      { day: 'Miercuri', hours: '08:30 - 18:00' },
      { day: 'Joi', hours: '08:30 - 18:00' },
      { day: 'Vineri', hours: '08:30 - 18:00' },
      { day: 'Sâmbătă', hours: '09:00 - 16:00' },
      { day: 'Duminică', hours: 'Închis' }
    ]
    
    return schedule
  }

  // Check if showroom is open now
  const isShowroomOpen = (workingHours: string) => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    
    // Simple logic - can be enhanced based on actual hours format
    if (day === 0) return false // Sunday closed
    if (day === 6 && hour >= 9 && hour < 16) return true // Saturday 9-16
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) return true // Weekdays 9-18
    return false
  }
  
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
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ py: 8, textAlign: 'center' }}>
          <Store sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>Nu există showroom-uri active</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Nu sunt showroom-uri disponibile momentan. Vă rugăm să reveniți mai târziu.
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
            <Typography color="text.primary">Showroom-uri</Typography>
          </Breadcrumbs>
        </Box>
      </Container>
      
      {/* Showroom Carousel - Full Width Background */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'text.primary',
          py: 4,
          mx: -3
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            '.slick-track': { display: 'flex', alignItems: 'stretch' },
            '.slick-slide': { padding: '0 4px' },
            '.slick-slide > div': { height: '100%' },
            overflow: 'hidden',
            width: '100%',
            px: { xs: 2, md: 4 }
          }}>
            <Slider
              dots={true}
              infinite={showrooms.length > 1}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              autoplay={showrooms.length > 1}
              autoplaySpeed={5000}
              pauseOnHover={true}
              arrows={!isMobile}
              centerMode={false}
              variableWidth={false}
            >
              {showrooms.map((showroom) => {
                const schedule = parseWorkingHours(showroom.opening_hours)
                const isOpen = isShowroomOpen(showroom.opening_hours || '')
                
                return (
                  <Box key={showroom.id} sx={{ px: { xs: 1, md: 2 } }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                  <Box
                    sx={{
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: theme.shadows[4],
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      {/* Rand 1: Titlul centrat */}
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary', 
                          mb: 2,
                          fontSize: { xs: '1.5rem', md: '2rem' },
                          textAlign: 'center'
                        }}
                      >
                        {showroom.name}
                      </Typography>

                      {/* Rand 2: Adresa + Telefon centrate */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {showroom.address}
                          </Typography>
                        </Box>
                        
                        {showroom.phone && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {showroom.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Separator 1 */}
                      <Box sx={{ 
                        width: '100%', 
                        height: '1px', 
                        backgroundColor: 'black', 
                        mb: 3 
                      }} />

                      {/* Rand 3: Poza + Program */}
                      <Box sx={{ display: 'flex', gap: 3, mb: 3, width: '100%', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
                        {/* Poza */}
                        <Box
                          sx={{
                            width: { xs: '100%', md: 250 },
                            height: 200,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 2,
                            flexShrink: 0
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 60, color: 'white', opacity: 0.3 }} />
                          {showroom.photos && showroom.photos.length > 0 && (
                            <Box
                              component="img"
                              src={showroom.photos[0]}
                              alt={showroom.name}
                              sx={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 2
                              }}
                            />
                          )}
                        </Box>

                        {/* Program de lucru */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, justifyContent: 'center' }}>
                            <AccessTime sx={{ fontSize: 20, color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              Program de lucru
                            </Typography>
                          </Box>
                          <Paper 
                            elevation={0}
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              backgroundColor: 'grey.50',
                              borderRadius: 2,
                              p: 1.5
                            }}
                          >
                            {schedule.map((item, index) => (
                              <Box key={index}>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 1,
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                      backgroundColor: 'action.hover'
                                    }
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 80, color: 'text.primary' }}>
                                    {item.day}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color={item.hours === 'Închis' ? 'error.main' : 'text.primary'}
                                    sx={{ 
                                      fontWeight: item.hours === 'Închis' ? 600 : 500,
                                      textAlign: 'right'
                                    }}
                                  >
                                    {item.hours}
                                  </Typography>
                                </Box>
                                {index < schedule.length - 1 && (
                                  <Box sx={{ 
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    my: 0.5,
                                    width: '100%',
                                    opacity: 0.5
                                  }} />
                                )}
                              </Box>
                            ))}
                          </Paper>
                        </Box>
                      </Box>

                      {/* Separator 2 */}
                      <Box sx={{ 
                        width: '100%', 
                        height: '1px', 
                        backgroundColor: 'black', 
                        mb: 3 
                      }} />
                      
                      {/* Rand 4: Butoanele Google Maps si Waze centrate */}
                      <Box sx={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                        <Box
                          component="a"
                          href={showroom.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(showroom.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'block',
                            width: { xs: 44, md: 50 },
                            height: { xs: 44, md: 50 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            },
                            cursor: 'pointer'
                          }}
                        >
                          <Box
                            component="img"
                            src="google-map-icon.png"
                            alt="Google Maps"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>

                        <Box
                          component="a"
                          href={showroom.waze_url || `https://waze.com/ul?q=${encodeURIComponent(showroom.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'block',
                            width: { xs: 56, md: 64 },
                            height: { xs: 56, md: 64 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            },
                            cursor: 'pointer'
                          }}
                        >
                          <Box
                            component="img"
                            src="download.png"
                            alt="Waze"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                        </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
                )
              })}
            </Slider>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default PublicShowrooms