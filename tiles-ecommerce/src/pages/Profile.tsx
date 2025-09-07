import React, { useState } from 'react'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip,
  Breadcrumbs,
  Link,
  Switch,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Select,
  MenuItem
} from '@mui/material'
import {
  Person,
  Email,
  Save,
  Edit,
  Phone,
  Home,
  LocationOn
} from '@mui/icons-material'
import { useAuthStore } from '../stores/auth'
import { useNewsletterStore } from '../stores/newsletter'
import { useNavigate } from 'react-router-dom'
import ROMANIA_COUNTIES from '../utils/romaniaData'

const Profile: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const { user, updateProfile, updatePassword, deleteAccount, signOut } = useAuthStore()
  const { subscribe, unsubscribe, isSubscribed } = useNewsletterStore()
  
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    county: user?.county || '',
    city: user?.city || '',
    street_address_1: user?.street_address_1 || '',
    street_address_2: user?.street_address_2 || '',
    postal_code: user?.postal_code || '',
    newsletter_subscribed: user?.newsletter_subscribed || false
  })
  

  const handleUpdateProfile = async () => {
    if (!profileData.full_name.trim()) {
      setError('Numele complet este obligatoriu')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Update profile data
      await updateProfile({
        full_name: profileData.full_name.trim(),
        phone: profileData.phone.trim() || null,
        county: profileData.county.trim() || null,
        city: profileData.city.trim() || null,
        street_address_1: profileData.street_address_1.trim() || null,
        street_address_2: profileData.street_address_2.trim() || null,
        postal_code: profileData.postal_code.trim() || null,
        newsletter_subscribed: profileData.newsletter_subscribed
      })

      // Handle newsletter subscription changes
      if (user?.email) {
        if (profileData.newsletter_subscribed && !user.newsletter_subscribed) {
          await subscribe(user.email, 'profile_update')
        } else if (!profileData.newsletter_subscribed && user.newsletter_subscribed) {
          await unsubscribe(user.email)
        }
      }

      setSuccess('Profil actualizat cu succes!')
      setEditing(false)
    } catch (err: any) {
      console.error('Profile update error details:', err)
      setError(err.message || 'Eroare necunoscută la actualizarea profilului')
    } finally {
      setLoading(false)
    }
  }



  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" textAlign="center">
          Nu sunteți autentificat
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: 'calc(100vh - 200px)' }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link 
            component="button" 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Acasă
          </Link>
          <Typography color="text.primary">Profilul meu</Typography>
        </Breadcrumbs>
      </Box>


      <Card elevation={4} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>

          {/* Error/Success Messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Profile Information */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Informații personale
          </Typography>

          {/* First Row: Name, Email, Phone - Desktop Only */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
              gap: 2,
              mb: 3
            }}
          >
            <TextField
              label="Nume complet"
              value={editing ? profileData.full_name : user.full_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
              disabled={!editing || loading}
              InputProps={{
                startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              label="Email"
              value={user.email}
              disabled
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              label="Număr de telefon"
              value={editing ? profileData.phone : (user.phone || '')}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!editing || loading}
              placeholder="0729123456"
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          {/* Delivery Address Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2, mt: 3 }}>
            Adrese de livrare
          </Typography>

          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mb: 3
            }}
          >
            <TextField
              select
              label="Județ"
              value={editing ? profileData.county : (user.county || ROMANIA_COUNTIES[0].name)}
              onChange={(e) => setProfileData(prev => ({ ...prev, county: e.target.value }))}
              disabled={!editing || loading}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      zIndex: 1400,
                    },
                  },
                  // Remove backdrop interference but keep visual appearance
                  BackdropProps: {
                    invisible: true,
                  },
                  // Prevent focus trapping issues
                  disableAutoFocus: true,
                  disableEnforceFocus: true,
                  disableRestoreFocus: true,
                  // Fast exit transition
                  transitionDuration: {
                    enter: 225,
                    exit: 50,
                  },
                  // Force cleanup
                  keepMounted: false,
            sT    },
                // Add explicit close handler to force cleanup
                onClose: () => {
                  // Force focus back to document body to clear any lingering focus issues
                  setTimeout(() => {
                    if (document.activeElement && document.activeElement !== document.body) {
                      (document.activeElement as HTMLElement).blur?.()
                    }
                  }, 100)
                },
              }}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            >
              <MenuItem value="">
                <em>Selectează județul</em>
              </MenuItem>
              {ROMANIA_COUNTIES.map((county) => (
                <MenuItem key={county.code} value={county.name}>
                  {county.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Localitate"
              value={editing ? profileData.city : (user.city || '')}
              onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
              disabled={!editing || loading}
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mb: 2
            }}
          >
            <TextField
              label="Adresă strada (Linia 1)"
              value={editing ? profileData.street_address_1 : (user.street_address_1 || '')}
              onChange={(e) => setProfileData(prev => ({ ...prev, street_address_1: e.target.value }))}
              disabled={!editing || loading}
              placeholder="Strada, numărul"
              inputProps={{ maxLength: 100 }}
              helperText={`${(editing ? profileData.street_address_1 : (user.street_address_1 || '')).length}/100`}
              InputProps={{
                startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              label="Adresă strada (Linia 2)"
              value={editing ? profileData.street_address_2 : (user.street_address_2 || '')}
              onChange={(e) => setProfileData(prev => ({ ...prev, street_address_2: e.target.value }))}
              disabled={!editing || loading}
              placeholder="Bloc, scara, apartament (opțional)"
              inputProps={{ maxLength: 100 }}
              helperText={`${(editing ? profileData.street_address_2 : (user.street_address_2 || '')).length}/100`}
              InputProps={{
                startAdornment: <Home sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          <TextField
            label="Cod poștal"
            value={editing ? profileData.postal_code : (user.postal_code || '')}
            onChange={(e) => setProfileData(prev => ({ ...prev, postal_code: e.target.value }))}
            disabled={!editing || loading}
            sx={{ width: { xs: '100%', md: '200px' }, mb: 3 }}
            inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Newsletter Subscription */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Preferințe newsletter
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={editing ? profileData.newsletter_subscribed : (user.newsletter_subscribed || false)}
                  onChange={(e) => setProfileData(prev => ({ ...prev, newsletter_subscribed: e.target.checked }))}
                  disabled={!editing || loading}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {(editing ? profileData.newsletter_subscribed : (user.newsletter_subscribed || false))
                      ? 'Subscris la newsletter' 
                      : 'Nu ești subscris la newsletter'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primește oferte speciale și noutăți prin email
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Action Buttons - Right Aligned */}
          <Box 
            display="flex" 
            justifyContent="flex-end"
            gap={1} 
            sx={{ mt: 4 }} 
            flexWrap="wrap"
          >
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                disabled={loading}
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  backgroundColor: '#FFB300',
                  '&:hover': {
                    backgroundColor: '#FF9800'
                  }
                }}
              >
                Editează profilul
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    minWidth: { xs: 'auto', sm: '140px' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  {isMobile ? 'Salvează' : 'Salvează modificările'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(false)
                    setProfileData({
                      full_name: user.full_name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      county: user.county || '',
                      city: user.city || '',
                      street_address_1: user.street_address_1 || '',
                      street_address_2: user.street_address_2 || '',
                      postal_code: user.postal_code || '',
                      newsletter_subscribed: user.newsletter_subscribed || false
                    })
                    setError('')
                    setSuccess('')
                  }}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    minWidth: { xs: 'auto', sm: '100px' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                >
                  Anulează
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

    </Container>
  )
}

export default Profile