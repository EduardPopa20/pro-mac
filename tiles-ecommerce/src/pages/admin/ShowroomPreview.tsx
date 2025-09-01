import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Navigation,
  Directions
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

  const handleBackToEdit = () => {
    if (id) {
      navigate(`/admin/showroom-uri/${id}/edit`)
    } else {
      navigate('/admin/showroom-uri/create')
    }
  }

  if (!previewShowroom) {
    return (
      <Box>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
            Showroom-uri
          </Link>
          <Typography color="text.primary">Preview</Typography>
        </Breadcrumbs>
        
        <Typography>Se încarcă preview-ul...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
          Admin
        </Link>
        <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
          Showroom-uri
        </Link>
        <Typography color="text.primary">Preview</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Tooltip title="Înapoi la editare">
          <IconButton 
            onClick={handleBackToEdit}
            size="large"
            sx={{ backgroundColor: 'action.hover' }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Preview Showroom
          </Typography>
        </Box>
      </Box>

      {/* Preview Card - exactly like in public site */}
      <Box maxWidth="500px" mx="auto">
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {previewShowroom.name}
            </Typography>
            
            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {previewShowroom.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {previewShowroom.address}
                  </Typography>
                </Box>
              </Box>

              {previewShowroom.phone && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body1">{previewShowroom.phone}</Typography>
                </Box>
              )}

              {previewShowroom.email && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body1">{previewShowroom.email}</Typography>
                </Box>
              )}

              {previewShowroom.opening_hours && (
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body1">{previewShowroom.opening_hours}</Typography>
                </Box>
              )}
            </Stack>

            {previewShowroom.description && (
              <Box mt={3}>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {previewShowroom.description}
                </Typography>
              </Box>
            )}

            {(previewShowroom.waze_url || previewShowroom.google_maps_url) && (
              <Stack direction="row" spacing={2} mt={3}>
                {previewShowroom.waze_url && (
                  <Button
                    variant="contained"
                    startIcon={<Navigation />}
                    href={previewShowroom.waze_url}
                    target="_blank"
                    size="small"
                  >
                    Waze
                  </Button>
                )}
                {previewShowroom.google_maps_url && (
                  <Button
                    variant="outlined"
                    startIcon={<Directions />}
                    href={previewShowroom.google_maps_url}
                    target="_blank"
                    size="small"
                  >
                    Google Maps
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Tooltip title="Înapoi la editare">
          <Button
            variant="contained"
            size="large"
            onClick={handleBackToEdit}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Înapoi la editare
          </Button>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default ShowroomPreview