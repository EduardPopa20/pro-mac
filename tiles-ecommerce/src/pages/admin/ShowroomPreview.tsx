import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Stack,
  Breadcrumbs,
  Link,
  useTheme,
  Paper
} from '@mui/material'
import {
  LocationOn,
  Phone,
  AccessTime,
  Business as BusinessIcon
} from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'
import type { Showroom } from '../../types'

const ShowroomPreview: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { showrooms, fetchShowrooms } = useSettingsStore()
  
  const [previewShowroom, setPreviewShowroom] = useState<Showroom | null>(null)

  useEffect(() => {
    if (id) {
      // Edit mode preview - load from existing showroom
      fetchShowrooms().then(() => {
        const showroom = showrooms.find(s => s.id === parseInt(id))
        if (showroom) {
          setPreviewShowroom(showroom)
        }
      })
    } else {
      // Create mode preview - use query params
      const formData = {
        name: searchParams.get('name') || '',
        city: searchParams.get('city') || '',
        address: searchParams.get('address') || '',
        phone: searchParams.get('phone') || '',
        email: searchParams.get('email') || '',
        waze_url: searchParams.get('waze_url') || '',
        google_maps_url: searchParams.get('google_maps_url') || '',
        description: searchParams.get('description') || '',
        opening_hours: searchParams.get('opening_hours') || '',
        is_active: searchParams.get('is_active') === 'true'
      }
      
      setPreviewShowroom({
        id: 0,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }, [id, searchParams, showrooms, fetchShowrooms])

  const theme = useTheme()

  // Parse working hours into structured format - Same as PublicShowrooms
  const parseWorkingHours = (workingHours: string | null) => {
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

  if (!previewShowroom) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/admin" color="inherit" sx={{ textDecoration: 'none' }}>Admin</Link>
            <Link href="/admin/showroom-uri" color="inherit" sx={{ textDecoration: 'none' }}>Showroom-uri</Link>
            <Typography color="text.primary">Preview</Typography>
          </Breadcrumbs>
        </Box>
        <Typography>Se încarcă preview-ul...</Typography>
      </Container>
    )
  }

  const schedule = parseWorkingHours(previewShowroom.opening_hours)

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/admin" color="inherit" sx={{ textDecoration: 'none' }}>Admin</Link>
            <Link href="/admin/showroom-uri" color="inherit" sx={{ textDecoration: 'none' }}>Showroom-uri</Link>
            <Typography color="text.primary">Preview</Typography>
          </Breadcrumbs>
        </Box>
      </Container>
      
      {/* Showroom Preview - Full Width Background - Same as PublicShowrooms */}
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
            overflow: 'hidden',
            width: '100%',
            px: { xs: 2, md: 4 }
          }}>
            <Box sx={{ px: { xs: 1, md: 2 } }}>
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
                    {/* Row 1: Title centered */}
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
                      {previewShowroom.name}
                    </Typography>

                    {/* Row 2: Address + Phone centered */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {previewShowroom.address}
                        </Typography>
                      </Box>
                      
                      {previewShowroom.phone && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {previewShowroom.phone}
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

                    {/* Row 3: Photo + Schedule */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 3, width: '100%', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
                      {/* Photo */}
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
                      </Box>

                      {/* Working schedule */}
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
                    
                    {/* Row 4: Google Maps and Waze buttons centered */}
                    <Box sx={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                      <Box
                        component="a"
                        href={previewShowroom.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(previewShowroom.address)}`}
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
                          src="/google-map-icon.png"
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
                        href={previewShowroom.waze_url || `https://waze.com/ul?q=${encodeURIComponent(previewShowroom.address)}`}
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
                          src="/waze.png"
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
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default ShowroomPreview