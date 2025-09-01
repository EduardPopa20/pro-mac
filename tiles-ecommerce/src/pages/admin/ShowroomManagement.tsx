import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Breadcrumbs,
  Link,
  Paper,
  Avatar,
  Fade,
  Skeleton,
  Tooltip
} from '@mui/material'
import {
  ArrowBack,
  Preview,
  Save,
  Edit,
  Delete,
  Add,
  LocationOn,
  AccessTime,
  Phone,
  Email,
  Navigation,
  Directions,
  Store,
  BusinessCenter
} from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import WorkingHoursEditor from '../../components/admin/WorkingHoursEditor'
import EnhancedShowroomCard from '../../components/admin/EnhancedShowroomCard'
import EnhancedShowroomForm from '../../components/admin/EnhancedShowroomForm'
import type { Showroom } from '../../types'

type ViewMode = 'list' | 'edit' | 'create' | 'preview'

const ShowroomManagement: React.FC = () => {
  const { showrooms, loading, fetchShowrooms, updateShowroom, createShowroom, deleteShowroom } = useSettingsStore()
  const { showConfirmation } = useConfirmation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    waze_url: '',
    google_maps_url: '',
    description: '',
    opening_hours: '',
    is_active: true
  })

  useEffect(() => {
    fetchShowrooms()
  }, [fetchShowrooms])

  const handleEdit = (showroom: Showroom) => {
    setEditingShowroom(showroom)
    setFormData({
      name: showroom.name,
      city: showroom.city,
      address: showroom.address,
      phone: showroom.phone || '',
      email: showroom.email || '',
      waze_url: showroom.waze_url || '',
      google_maps_url: showroom.google_maps_url || '',
      description: showroom.description || '',
      opening_hours: showroom.opening_hours || '',
      is_active: showroom.is_active
    })
    setViewMode('edit')
    setError('')
    setSuccess('')
  }

  const handleCreate = () => {
    setEditingShowroom(null)
    setFormData({
      name: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      waze_url: '',
      google_maps_url: '',
      description: '',
      opening_hours: '',
      is_active: true
    })
    setViewMode('create')
    setError('')
    setSuccess('')
  }

  const handlePreview = () => {
    setViewMode('preview')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setEditingShowroom(null)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Confirmă ștergerea',
      message: 'Ești sigur că vrei să ștergi acest showroom? Această acțiune nu poate fi anulată.',
      type: 'error'
    })

    if (!confirmed) return

    try {
      await deleteShowroom(id)
      setSuccess('Showroom șters cu succes!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim()) {
      setError('Vă rugăm să completați toate câmpurile obligatorii')
      setTimeout(() => setError(''), 5000)
      return
    }

    const confirmed = await showConfirmation({
      title: viewMode === 'create' ? 'Confirmă crearea' : 'Confirmă salvarea',
      message: viewMode === 'create' 
        ? 'Ești sigur că vrei să creezi acest showroom nou?'
        : 'Ești sigur că vrei să salvezi modificările?',
      type: 'warning'
    })

    if (!confirmed) return

    try {
      if (viewMode === 'create') {
        await createShowroom(formData)
        setSuccess('Showroom creat cu succes!')
      } else if (editingShowroom) {
        await updateShowroom(editingShowroom.id, formData)
        setSuccess('Showroom actualizat cu succes!')
      }
      
      setTimeout(() => {
        setSuccess('')
        handleBackToList()
      }, 2000)
    } catch (error: any) {
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const renderBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 3 }}>
      <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
        Admin
      </Link>
      <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
        Showroom-uri
      </Link>
      {viewMode !== 'list' && (
        <Typography color="text.primary">
          {viewMode === 'create' ? 'Adaugă nou' : 
           viewMode === 'preview' ? 'Preview' : 
           editingShowroom ? editingShowroom.name : 'Editare'}
        </Typography>
      )}
    </Breadcrumbs>
  )

  if (loading) {
    return (
      <Box>
        {renderBreadcrumbs()}
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Se încarcă showroom-urile...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vă rugăm să așteptați
          </Typography>
        </Box>
      </Box>
    )
  }

  if (viewMode === 'list') {
    return (
      <Box>
        {renderBreadcrumbs()}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Management Showrooms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestionează showroom-urile afișate în site
            </Typography>
          </Box>
          <Tooltip title="Creează un showroom nou">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Adaugă Showroom
            </Button>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {showrooms.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: 'grey.50'
            }}
          >
            <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Niciun showroom găsit
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Creează primul showroom pentru a începe
            </Typography>
            <Tooltip title="Creează primul showroom">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                size="large"
                sx={{ borderRadius: 2 }}
              >
                Adaugă primul showroom
              </Button>
            </Tooltip>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {showrooms.map((showroom) => (
              <Grid item xs={12} md={6} xl={4} key={showroom.id}>
                <EnhancedShowroomCard
                  showroom={showroom}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    )
  }

  if (viewMode === 'preview') {
    const previewShowroom: Showroom = {
      id: 0,
      name: formData.name,
      city: formData.city,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      waze_url: formData.waze_url,
      google_maps_url: formData.google_maps_url,
      description: formData.description,
      opening_hours: formData.opening_hours,
      is_active: formData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return (
      <Box>
        {renderBreadcrumbs()}
        
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Tooltip title="Înapoi la editare">
            <IconButton 
              onClick={() => setViewMode('edit')}
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
              onClick={() => setViewMode('edit')}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Înapoi la editare
            </Button>
          </Tooltip>
        </Box>
      </Box>
    )
  }

  // Edit/Create Form
  return (
    <Box>
      {renderBreadcrumbs()}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <EnhancedShowroomForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        onCancel={handleBackToList}
        onPreview={handlePreview}
        isCreate={viewMode === 'create'}
        saving={false}
      />
    </Box>
  )
}

export default ShowroomManagement