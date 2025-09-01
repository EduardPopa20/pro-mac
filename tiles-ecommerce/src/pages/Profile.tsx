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
  Chip
} from '@mui/material'
import {
  Person,
  Email,
  Lock,
  Delete,
  Save,
  Edit,
  AdminPanelSettings
} from '@mui/icons-material'
import { useAuthStore } from '../stores/auth'
import { useNavigate } from 'react-router-dom'

const Profile: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const { user, updateProfile, updatePassword, deleteAccount, signOut } = useAuthStore()
  
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [changePasswordMode, setChangePasswordMode] = useState(false)

  const handleUpdateProfile = async () => {
    if (!profileData.full_name.trim()) {
      setError('Numele complet este obligatoriu')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await updateProfile({
        full_name: profileData.full_name.trim()
      })
      setSuccess('Profil actualizat cu succes!')
      setEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Parolele nu se potrivesc')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await updatePassword(passwordData.newPassword)
      setSuccess('Parola a fost schimbată cu succes!')
      setPasswordData({ newPassword: '', confirmPassword: '' })
      setChangePasswordMode(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    setError('')
    
    try {
      await deleteAccount()
      navigate('/auth')
    } catch (err: any) {
      setError(err.message)
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Profilul meu
      </Typography>

      <Card elevation={4} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: isMobile ? 2 : 4 }}>
          {/* User Info Header */}
          <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
            <Person sx={{ fontSize: '3rem', color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h5" gutterBottom>
                {user.full_name}
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  icon={user.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                  label={user.role === 'admin' ? 'Administrator' : 'Client'}
                  color={user.role === 'admin' ? 'secondary' : 'primary'}
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

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

          <TextField
            fullWidth
            label="Nume complet"
            value={editing ? profileData.full_name : user.full_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
            disabled={!editing || loading}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          <TextField
            fullWidth
            label="Email"
            value={user.email}
            disabled
            sx={{ mb: 3 }}
            helperText="Email-ul nu poate fi modificat"
            InputProps={{
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />

          {/* Profile Action Buttons */}
          <Box display="flex" gap={2} sx={{ mb: 3 }} flexWrap="wrap">
            {!editing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
                disabled={loading}
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
                >
                  Salvează modificările
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditing(false)
                    setProfileData({
                      full_name: user.full_name || '',
                      email: user.email || ''
                    })
                    setError('')
                    setSuccess('')
                  }}
                  disabled={loading}
                >
                  Anulează
                </Button>
              </>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Password Change Section */}
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Securitate
          </Typography>

          {!changePasswordMode ? (
            <Button
              variant="outlined"
              startIcon={<Lock />}
              onClick={() => setChangePasswordMode(true)}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Schimbă parola
            </Button>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Parola nouă"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={loading}
                sx={{ mb: 2 }}
                helperText="Minimum 6 caractere"
              />
              <TextField
                fullWidth
                label="Confirmă parola nouă"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  Schimbă parola
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setChangePasswordMode(false)
                    setPasswordData({ newPassword: '', confirmPassword: '' })
                    setError('')
                    setSuccess('')
                  }}
                  disabled={loading}
                >
                  Anulează
                </Button>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Danger Zone */}
          <Typography variant="h6" color="error" gutterBottom sx={{ mb: 2 }}>
            Zona de pericol
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              Șterge contul
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => signOut().then(() => navigate('/auth'))}
              disabled={loading}
            >
              Deconectează-te
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Cont creat: {new Date(user.created_at).toLocaleDateString('ro-RO')}
          </Typography>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">
          Confirmare ștergere cont
        </DialogTitle>
        <DialogContent>
          <Typography>
            Sunteți sigur că doriți să vă ștergeți contul? Această acțiune este ireversibilă și veți pierde toate datele asociate contului.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={loading}
          >
            Anulează
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            {loading ? 'Se șterge...' : 'Șterge contul'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default Profile