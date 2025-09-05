import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Paper,
  Divider,
  Button,
  Tooltip,
  useTheme,
  IconButton
} from '@mui/material'
import {
  Store,
  Phone,
  AccessTime,
  Description,
  Navigation,
  Settings,
  Save,
  Preview,
  Info,
  PhotoLibrary,
  Add,
  Delete,
  CloudUpload
} from '@mui/icons-material'
import WorkingHoursEditor from './WorkingHoursEditor'
import ShowroomPhotoManager from './ShowroomPhotoManager'

interface ShowroomFormData {
  name: string
  city: string
  address: string
  phone: string
  email: string
  waze_url: string
  google_maps_url: string
  description: string
  opening_hours: string
  is_active: boolean
  photos: string[]
}

interface EnhancedShowroomFormProps {
  formData: ShowroomFormData
  setFormData: any // Make this flexible to avoid type issues
  onSave: (data: ShowroomFormData) => void
  onCancel: () => void
  onPreview: (data: ShowroomFormData) => void
  isCreate: boolean
  saving?: boolean
}

const FormSection: React.FC<{
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
}> = ({ icon, title, children, color = 'primary' }) => {
  const theme = useTheme()
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        border: `1px solid`,
        borderColor: `${color}.light`,
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: theme.shadows[4]
        },
        transition: theme.transitions.create(['border-color', 'box-shadow'])
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Box 
          sx={{ 
            p: 1.5, 
            borderRadius: '50%', 
            backgroundColor: `${color}.light`,
            color: `${color}.contrastText`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: `${color}.main`,
            letterSpacing: '-0.02em'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, borderColor: `${color}.light` }} />
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
    </Paper>
  )
}

const EnhancedShowroomForm: React.FC<EnhancedShowroomFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
  onPreview,
  isCreate,
  saving = false
}) => {
  // Local form state with sync from parent formData
  const [localFormData, setLocalFormData] = useState(() => ({
    name: formData.name || '',
    city: formData.city || '',
    address: formData.address || '',
    phone: formData.phone || '',
    email: formData.email || '',
    waze_url: formData.waze_url || '',
    google_maps_url: formData.google_maps_url || '',
    description: formData.description || '',
    opening_hours: formData.opening_hours || '',
    is_active: formData.is_active ?? true,
    photos: formData.photos || []
  }))


  const isFormValid = localFormData.name.trim() && localFormData.city.trim() && localFormData.address.trim()

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFormData(prev => ({ ...prev, description: e.target.value }))
  }, [])

  // Helper function to count words
  const countWords = (text: string): number => {
    if (!text || text.trim() === '') return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }


  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Action Buttons - Upper Right */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: 2,
          mb: 4
        }}
      >
        {/* Showroom Settings Toggle - Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={localFormData.is_active ? "Showroom-ul va fi vizibil pe site pentru clienți" : "Showroom-ul va fi ascuns de pe site"}>
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Showroom activ
          </Typography>
          <Switch
            checked={localFormData.is_active}
            onChange={(e) => setLocalFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            color="success"
            size="medium"
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Tooltip title="Vizualizează cum va arăta showroom-ul pe site">
            <Button
              variant="outlined"
              size="large"
              startIcon={<Preview />}
              onClick={() => onPreview(localFormData)}
              disabled={saving}
              sx={{ 
                minHeight: 48,
                fontWeight: 600,
                minWidth: { xs: '100%', sm: 140 }
              }}
            >
              Preview
            </Button>
          </Tooltip>
          
          <Tooltip title={isFormValid ? (isCreate ? 'Creează showroom-ul nou' : 'Salvează modificările') : 'Completează câmpurile obligatorii'}>
            <span>
              <Button
                variant="contained"
                size="large"
                startIcon={<Save />}
                onClick={() => onSave(localFormData)}
                disabled={saving || !isFormValid}
                sx={{ 
                  minHeight: 48,
                  fontWeight: 600,
                  minWidth: { xs: '100%', sm: 160 }
                }}
              >
                {saving ? 'Se salvează...' : (isCreate ? 'Creează' : 'Salvează')}
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        
        {/* Main Form Content */}
        <Grid size={12}>
          <Stack spacing={4}>
            
            {/* Row 1: Basic Information + Contact Information */}
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <FormSection
                  icon={<Store />}
                  title="Informații de bază"
                  color="primary"
                >
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Nume Showroom"
                          value={localFormData.name}
                          onChange={(e) => setLocalFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="ex: Pro-Mac București"
                          sx={{
                            '& .MuiInputBase-input': {
                              fontSize: '1.1rem',
                              fontWeight: 500
                            }
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Oraș"
                          value={localFormData.city}
                          onChange={(e) => setLocalFormData(prev => ({ ...prev, city: e.target.value }))}
                          required
                          placeholder="ex: București"
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      fullWidth
                      label="Adresa completă"
                      value={localFormData.address}
                      onChange={(e) => setLocalFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      placeholder="Strada Principală Nr. 123, Sector 1"
                      helperText={`${localFormData.address.length}/200 caractere`}
                      inputProps={{ maxLength: 200 }}
                    />
                  </Stack>
                </FormSection>
              </Grid>
              
              <Grid size={{ xs: 12, md: 5 }}>
                <FormSection
                  icon={<Phone />}
                  title="Informații de contact"
                  color="info"
                >
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={localFormData.phone}
                      onChange={(e) => setLocalFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="021-123-4567"
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={localFormData.email}
                      onChange={(e) => setLocalFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="showroom@pro-mac.ro"
                    />
                  </Stack>
                </FormSection>
              </Grid>
            </Grid>

            {/* Row 2: Description & Navigation + Working Hours */}
            <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSection
                  icon={<Description />}
                  title="Descriere și navigare"
                  color="secondary"
                >
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Descriere"
                      multiline
                      rows={6}
                      value={localFormData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Descrieți showroom-ul, serviciile oferite și particularitățile..."
                      helperText={`${countWords(localFormData.description)} cuvinte`}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: 'auto'
                        }
                      }}
                    />
                    
                    <Divider sx={{ mx: 2 }} />
                    
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Navigation sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main', fontSize: '1rem' }}>
                          Link-uri de navigare
                        </Typography>
                      </Box>
                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          label="Link Waze"
                          value={localFormData.waze_url}
                          onChange={(e) => setLocalFormData(prev => ({ ...prev, waze_url: e.target.value }))}
                          placeholder="https://waze.com/ul/..."
                          size="small"
                        />
                        <TextField
                          fullWidth
                          label="Link Google Maps"
                          value={localFormData.google_maps_url}
                          onChange={(e) => setLocalFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                          placeholder="https://maps.google.com/..."
                          size="small"
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </FormSection>
              </Grid>
              
              <Grid size={{ xs: 12, md: 8 }}>
                <FormSection
                  icon={<AccessTime />}
                  title="Program de lucru"
                  color="success"
                >
                  <WorkingHoursEditor
                    value={localFormData.opening_hours}
                    onChange={(value) => setLocalFormData(prev => ({ ...prev, opening_hours: value }))}
                  />
                </FormSection>
              </Grid>
            </Grid>

            {/* Row 3: Photo Management */}
            <Grid container>
              <Grid size={12}>
                <FormSection
                  icon={<PhotoLibrary />}
                  title="Fotografii prezentare"
                  color="info"
                >
                  <ShowroomPhotoManager
                    photos={localFormData.photos}
                    onChange={(photos) => setLocalFormData(prev => ({ ...prev, photos }))}
                    maxPhotos={3}
                    disabled={saving}
                  />
                </FormSection>
              </Grid>
            </Grid>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  )
}

export default EnhancedShowroomForm