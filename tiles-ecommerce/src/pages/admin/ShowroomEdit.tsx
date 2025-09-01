import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Alert,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import { showSuccessAlert, showErrorAlert } from '../../stores/globalAlert'
import EnhancedShowroomForm from '../../components/admin/EnhancedShowroomForm'
import type { Showroom } from '../../types'

const ShowroomEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showrooms, loading, fetchShowrooms, updateShowroom } = useSettingsStore()
  const { showConfirmation } = useConfirmation()
  
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    if (id && showrooms.length > 0) {
      const showroom = showrooms.find(s => s.id === parseInt(id))
      if (showroom) {
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
      } else {
        setError('Showroom not found')
      }
    }
  }, [id, showrooms])

  // We don't need this anymore since form handles its own state
  const handleFormDataChange = React.useCallback(() => {
    // Empty function - form manages its own state
  }, [])

  const handleSave = async (data: typeof formData) => {
    if (!data.name.trim() || !data.city.trim() || !data.address.trim()) {
      showErrorAlert('Vă rugăm să completați toate câmpurile obligatorii')
      return
    }
    
    const confirmed = await showConfirmation({
      title: 'Confirmă salvarea',
      message: 'Ești sigur că vrei să salvezi modificările?',
      type: 'warning'
    })
    
    if (!confirmed || !editingShowroom) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateShowroom(editingShowroom.id, data)
      
      // Show success alert and refetch data
      showSuccessAlert('Showroom actualizat cu succes!', 'Modificările au fost salvate')
      await fetchShowrooms() // Refetch to get updated data
      
      setTimeout(() => {
        navigate('/admin/showroom-uri')
      }, 1500)
    } catch (error: any) {
      showErrorAlert(error.message || 'Eroare la salvarea showroom-ului', 'Operațiune eșuată')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/showroom-uri')
  }

  const handlePreview = (data: typeof formData) => {
    // Update formData so preview can access it
    setFormData(data)
    navigate(`/admin/showroom-uri/${id}/preview`)
  }

  if (loading) {
    return (
      <Box>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
            Showroom-uri
          </Link>
          <Typography color="text.primary">Editare</Typography>
        </Breadcrumbs>
        
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
            Se încarcă showroom-ul...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error && !editingShowroom) {
    return (
      <Box>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
            Showroom-uri
          </Link>
          <Typography color="text.primary">Eroare</Typography>
        </Breadcrumbs>
        
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
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
        <Typography color="text.primary">
          {editingShowroom ? editingShowroom.name : 'Editare'}
        </Typography>
      </Breadcrumbs>

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
        key={editingShowroom?.id || 'new'}
        formData={formData}
        setFormData={handleFormDataChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onPreview={handlePreview}
        isCreate={false}
        saving={saving}
      />
    </Box>
  )
}

export default ShowroomEdit