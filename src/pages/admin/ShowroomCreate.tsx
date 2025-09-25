import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Container
} from '@mui/material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import { showSuccessAlert, showErrorAlert } from '../../stores/globalAlert'
import EnhancedShowroomForm from '../../components/admin/EnhancedShowroomForm'

const ShowroomCreate: React.FC = () => {
  const navigate = useNavigate()
  const { createShowroom } = useSettingsStore()
  const { showConfirmation } = useConfirmation()
  
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
    is_active: true,
    photos: []
  })

  // We don't need this anymore since form handles its own state
  const handleFormDataChange = React.useCallback(() => {
    // Empty function - form manages its own state
  }, [])

  const handleSave = async (data: typeof formData) => {
    if (!data.name.trim() || !data.city.trim() || !data.address.trim()) {
      showErrorAlert('Vă rugăm să completați toate câmpurile obligatorii', 'Error')
      return
    }
    
    const confirmed = await showConfirmation({
      title: 'Confirmă crearea',
      message: 'Ești sigur că vrei să creezi acest showroom nou?',
      type: 'warning'
    })
    
    if (!confirmed) return

    setSaving(true)

    try {
      await createShowroom(data)
      showSuccessAlert('Showroom creat cu succes!', 'Success')
      
      setTimeout(() => {
        navigate('/admin/showroom-uri')
      }, 2000)
    } catch (error: any) {
      showErrorAlert(error.message || 'Eroare la crearea showroom-ului', 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/showroom-uri')
  }

  const handlePreview = (data: typeof formData) => {
    // For create mode, we'll navigate to a preview route with query params
    const queryParams = new URLSearchParams(data as any).toString()
    navigate(`/admin/showroom-uri/preview?${queryParams}`)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link color="inherit" href="/admin" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Link color="inherit" href="/admin/showroom-uri" sx={{ textDecoration: 'none' }}>
            Showroom-uri
          </Link>
          <Typography color="text.primary">Adaugă</Typography>
        </Breadcrumbs>
      </Box>

      {/* Removed Alert components - using global notification system */}

      <EnhancedShowroomForm
        key="create"
        formData={formData}
        setFormData={handleFormDataChange}
        onSave={handleSave}
        onCancel={handleCancel}
        onPreview={handlePreview}
        isCreate={true}
        saving={saving}
      />
    </Container>
  )
}

export default ShowroomCreate