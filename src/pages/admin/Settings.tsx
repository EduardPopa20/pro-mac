import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Container,
  Breadcrumbs,
  Link,
  Paper,
  Grid
} from '@mui/material'
import {
  Save as SaveIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  VideoLibrary as TikTokIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import { showSuccessAlert, showErrorAlert } from '../../stores/globalAlert'

const Settings: React.FC = () => {
  const { 
    settings, 
    loading, 
    fetchSettings, 
    updateSetting
  } = useSettingsStore()
  
  const { showConfirmation } = useConfirmation()

  const [saving, setSaving] = useState(false)

  // General Settings Form State
  const [generalSettings, setGeneralSettings] = useState({
    whatsapp_phone: '',
    company_name: '',
    company_email: '',
    company_address: ''
  })

  // Social Media Settings Form State
  const [socialSettings, setSocialSettings] = useState({
    social_facebook_url: '',
    social_instagram_url: '',
    social_tiktok_url: '',
    social_youtube_url: ''
  })


  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    // Update form when settings are loaded
    setGeneralSettings({
      whatsapp_phone: settings.whatsapp_phone || '',
      company_name: settings.company_name || '',
      company_email: settings.company_email || '',
      company_address: settings.company_address || ''
    })
    setSocialSettings({
      social_facebook_url: settings.social_facebook_url || '',
      social_instagram_url: settings.social_instagram_url || '',
      social_tiktok_url: settings.social_tiktok_url || '',
      social_youtube_url: settings.social_youtube_url || ''
    })
  }, [settings])


  const handleGeneralSettingsChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialSettingsChange = (field: string, value: string) => {
    setSocialSettings(prev => ({ ...prev, [field]: value }))
  }

  // Unified save function for all settings
  const handleSaveAllSettings = () => {
    showConfirmation({
      title: 'Confirmă salvarea modificărilor',
      message: 'Ești sigur că vrei să salvezi toate modificările la setările site-ului?',
      type: 'warning',
      confirmText: 'Salvează',
      onConfirm: async () => {
        setSaving(true)

        try {
          // Update all settings in parallel
          await Promise.all([
            // General settings
            updateSetting('whatsapp_phone', generalSettings.whatsapp_phone),
            updateSetting('company_name', generalSettings.company_name),
            updateSetting('company_email', generalSettings.company_email),
            updateSetting('company_address', generalSettings.company_address),
            // Social media settings
            updateSetting('social_facebook_url', socialSettings.social_facebook_url),
            updateSetting('social_instagram_url', socialSettings.social_instagram_url),
            updateSetting('social_tiktok_url', socialSettings.social_tiktok_url),
            updateSetting('social_youtube_url', socialSettings.social_youtube_url)
          ])

          showSuccessAlert('Toate setările au fost salvate cu succes!', 'Succes')
        } catch (err: any) {
          showErrorAlert(err.message || 'Eroare la salvarea setărilor', 'Eroare')
        } finally {
          setSaving(false)
        }
      }
    })
  }


  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/admin" color="inherit" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Typography color="text.primary">Setări</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header with Save Button */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Setări Site
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestionați setările generale ale site-ului
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSaveAllSettings}
          disabled={saving}
          size="large"
          sx={{
            minWidth: 200,
            fontWeight: 600,
            py: 1.5
          }}
        >
          {saving ? 'Se salvează...' : 'Salvează Modificările'}
        </Button>
      </Box>

      {/* Removed Alert components - using global notification system */}

      {/* General Settings Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BusinessIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Setări Generale
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Număr Telefon WhatsApp"
              placeholder="0729926085"
              value={generalSettings.whatsapp_phone}
              onChange={(e) => handleGeneralSettingsChange('whatsapp_phone', e.target.value)}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ color: 'primary.main', mr: 1 }} />
              }}
              helperText="Format: 0729926085 (fără spații sau alte caractere)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Numele Companiei"
              value={generalSettings.company_name}
              onChange={(e) => handleGeneralSettingsChange('company_name', e.target.value)}
              InputProps={{
                startAdornment: <BusinessIcon sx={{ color: 'primary.main', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Oficial"
              type="email"
              value={generalSettings.company_email}
              onChange={(e) => handleGeneralSettingsChange('company_email', e.target.value)}
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: 'primary.main', mr: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Adresa Principală"
              value={generalSettings.company_address}
              onChange={(e) => handleGeneralSettingsChange('company_address', e.target.value)}
              InputProps={{
                startAdornment: <LocationIcon sx={{ color: 'primary.main', mr: 1 }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Social Media Settings Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ShareIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Linkuri Social Media
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Link Facebook"
              placeholder="https://facebook.com/promac.ro"
              value={socialSettings.social_facebook_url}
              onChange={(e) => handleSocialSettingsChange('social_facebook_url', e.target.value)}
              InputProps={{
                startAdornment: <FacebookIcon sx={{ color: '#1877F2', mr: 1 }} />
              }}
              helperText="Link complet către pagina de Facebook"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Link Instagram"
              placeholder="https://instagram.com/promac.ro"
              value={socialSettings.social_instagram_url}
              onChange={(e) => handleSocialSettingsChange('social_instagram_url', e.target.value)}
              InputProps={{
                startAdornment: <InstagramIcon sx={{ color: '#E4405F', mr: 1 }} />
              }}
              helperText="Link complet către pagina de Instagram"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Link TikTok"
              placeholder="https://tiktok.com/@promac.ro"
              value={socialSettings.social_tiktok_url}
              onChange={(e) => handleSocialSettingsChange('social_tiktok_url', e.target.value)}
              InputProps={{
                startAdornment: <TikTokIcon sx={{ color: '#000000', mr: 1 }} />
              }}
              helperText="Link complet către contul de TikTok"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Link YouTube"
              placeholder="https://youtube.com/@promac.ro"
              value={socialSettings.social_youtube_url}
              onChange={(e) => handleSocialSettingsChange('social_youtube_url', e.target.value)}
              InputProps={{
                startAdornment: <YouTubeIcon sx={{ color: '#FF0000', mr: 1 }} />
              }}
              helperText="Link complet către canalul de YouTube"
            />
          </Grid>
        </Grid>
      </Paper>

    </Container>
  )
}

export default Settings