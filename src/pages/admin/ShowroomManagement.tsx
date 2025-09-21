import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Add,
  Store
} from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import EnhancedShowroomCard from '../../components/admin/EnhancedShowroomCard'

const ShowroomManagement: React.FC = () => {
  const navigate = useNavigate()
  const { showrooms, loading, fetchShowrooms, deleteShowroom } = useSettingsStore()
  const { showConfirmation } = useConfirmation()
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchShowrooms()
  }, [fetchShowrooms])

  const handleEdit = (showroom: any) => {
    navigate(`/admin/showroom-uri/${showroom.id}/edit`)
  }

  const handleCreate = () => {
    navigate('/admin/showroom-uri/create')
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

  const renderBreadcrumbs = () => (
    <Breadcrumbs sx={{ mb: 3 }}>
      <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
        Admin
      </Link>
      <Typography color="text.primary">Showroom-uri</Typography>
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

export default ShowroomManagement