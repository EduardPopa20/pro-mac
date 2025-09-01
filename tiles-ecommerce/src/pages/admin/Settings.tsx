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
  LocationOn as LocationIcon
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
  }, [settings])


  const handleGeneralSettingsChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
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

      {/* Settings Card */}
      <Card sx={{ mb: 4 }}>
          <CardContent>
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
    </Box>
  )
}

export default Settings