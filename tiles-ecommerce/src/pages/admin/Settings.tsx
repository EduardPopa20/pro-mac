import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider
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

const Settings: React.FC = () => {
  const { 
    settings, 
    loading, 
    fetchSettings, 
    updateSetting
  } = useSettingsStore()
  
  const { showConfirmation } = useConfirmation()

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
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

  const handleSaveGeneralSettings = () => {
    showConfirmation({
      title: 'Confirmă salvarea setărilor',
      message: 'Ești sigur că vrei să salvezi modificările la setările generale ale site-ului?',
      type: 'warning',
      confirmText: 'Salvează',
      onConfirm: async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
          // Update all settings
          await Promise.all([
            updateSetting('whatsapp_phone', generalSettings.whatsapp_phone),
            updateSetting('company_name', generalSettings.company_name),
            updateSetting('company_email', generalSettings.company_email),
            updateSetting('company_address', generalSettings.company_address)
          ])
          
          setSuccess('Setările au fost salvate cu succes!')
        } catch (err: any) {
          setError(err.message || 'Eroare la salvarea setărilor')
        } finally {
          setSaving(false)
        }
      }
    })
  }

  const handleSaveSocialSettings = () => {
    showConfirmation({
      title: 'Confirmă salvarea setărilor social media',
      message: 'Ești sigur că vrei să salvezi modificările la linkurile de social media?',
      type: 'warning',
      confirmText: 'Salvează',
      onConfirm: async () => {
        setSaving(true)
        setError('')
        setSuccess('')

        try {
          // Update all social media settings
          await Promise.all([
            updateSetting('social_facebook_url', socialSettings.social_facebook_url),
            updateSetting('social_instagram_url', socialSettings.social_instagram_url),
            updateSetting('social_tiktok_url', socialSettings.social_tiktok_url),
            updateSetting('social_youtube_url', socialSettings.social_youtube_url)
          ])
          
          setSuccess('Setările social media au fost salvate cu succes!')
        } catch (err: any) {
          setError(err.message || 'Eroare la salvarea setărilor social media')
        } finally {
          setSaving(false)
        }
      }
    })
  }


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Setări Site
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gestionați setările generale ale site-ului
      </Typography>

      {/* Success/Error Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* General Settings Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BusinessIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Setări Generale
            </Typography>
          </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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

              <Grid item xs={12} md={6}>
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

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSaveGeneralSettings}
                disabled={saving}
                size="large"
              >
                {saving ? 'Se salvează...' : 'Salvează Setările'}
              </Button>
            </Box>
          </CardContent>
      </Card>

      {/* Social Media Settings Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ShareIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Linkuri Social Media
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

            <Grid item xs={12} md={6}>
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

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveSocialSettings}
              disabled={saving}
              size="large"
            >
              {saving ? 'Se salvează...' : 'Salvează Linkurile Social Media'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Settings