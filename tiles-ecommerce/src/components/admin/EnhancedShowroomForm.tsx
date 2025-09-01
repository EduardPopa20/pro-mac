import React from 'react'
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
  useTheme
} from '@mui/material'
import {
  Store,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Description,
  Navigation,
  Settings,
  Save,
  ArrowBack,
  Preview
} from '@mui/icons-material'
import WorkingHoursEditor from './WorkingHoursEditor'

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
}

interface EnhancedShowroomFormProps {
  formData: ShowroomFormData
  setFormData: (data: ShowroomFormData) => void
  onSave: () => void
  onCancel: () => void
  onPreview: () => void
  isCreate: boolean
  saving?: boolean
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
  const theme = useTheme()

  const FormSection: React.FC<{
    icon: React.ReactNode
    title: string
    children: React.ReactNode
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  }> = ({ icon, title, children, color = 'primary' }) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        border: `1px solid`,
        borderColor: `${color}.light`,
        borderRadius: 2,
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
      {children}
    </Paper>
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={4}>
        
        {/* Main Form Sections */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            
            {/* Basic Information */}
            <FormSection
              icon={<Store />}
              title="Informații de bază"
              color="primary"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nume Showroom"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    placeholder="ex: București"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Adresa completă"
                    value={formData.address}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setFormData({ ...formData, address: e.target.value })
                      }
                    }}
                    required
                    placeholder="Strada Principală Nr. 123, Sector 1"
                    helperText={`${formData.address.length}/200 caractere`}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Contact Information */}
            <FormSection
              icon={<Phone />}
              title="Informații de contact"
              color="info"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="021-123-4567"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="showroom@pro-mac.ro"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Description */}
            <FormSection
              icon={<Description />}
              title="Descriere showroom"
              color="secondary"
            >
              <TextField
                fullWidth
                label="Descriere"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrieți showroom-ul, serviciile oferite și particularitățile..."
                helperText={`${formData.description.split(' ').filter(word => word.trim().length > 0).length} cuvinte`}
              />
            </FormSection>

            {/* Navigation Links */}
            <FormSection
              icon={<Navigation />}
              title="Link-uri de navigare"
              color="warning"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Link Waze"
                    value={formData.waze_url}
                    onChange={(e) => setFormData({ ...formData, waze_url: e.target.value })}
                    placeholder="https://waze.com/ul/..."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Link Google Maps"
                    value={formData.google_maps_url}
                    onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </Grid>
              </Grid>
            </FormSection>

          </Stack>
        </Grid>

        {/* Sidebar - Working Hours & Settings */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Stack spacing={4}>
              
              {/* Working Hours */}
              <FormSection
                icon={<AccessTime />}
                title="Program de lucru"
                color="success"
              >
                <WorkingHoursEditor
                  value={formData.opening_hours}
                  onChange={(value) => setFormData({ ...formData, opening_hours: value })}
                />
              </FormSection>

              {/* Settings */}
              <FormSection
                icon={<Settings />}
                title="Setări showroom"
                color="secondary"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      color="success"
                      size="medium"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Showroom activ
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Showroom-ul va fi vizibil pe site
                      </Typography>
                    </Box>
                  }
                />
              </FormSection>

              {/* Action Buttons */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Acțiuni
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={onSave}
                    disabled={saving || !formData.name.trim() || !formData.city.trim() || !formData.address.trim()}
                    sx={{ 
                      minHeight: 48,
                      fontWeight: 600
                    }}
                  >
                    {saving ? 'Se salvează...' : (isCreate ? 'Creează Showroom' : 'Salvează modificările')}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Preview />}
                    onClick={onPreview}
                    disabled={saving}
                    sx={{ 
                      minHeight: 48,
                      fontWeight: 600
                    }}
                  >
                    Preview
                  </Button>
                  
                  <Button
                    variant="text"
                    size="large"
                    startIcon={<ArrowBack />}
                    onClick={onCancel}
                    disabled={saving}
                    sx={{ 
                      minHeight: 48,
                      fontWeight: 600
                    }}
                  >
                    Înapoi la listă
                  </Button>
                </Stack>
              </Paper>

            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EnhancedShowroomForm