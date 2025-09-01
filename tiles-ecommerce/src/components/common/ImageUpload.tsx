import React, { useState, useCallback } from 'react'
import { Box, Button, Typography, CircularProgress, Alert, IconButton } from '@mui/material'
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material'
import { supabase } from '../../lib/supabase'

interface ImageUploadProps {
  onImageUpload: (imagePath: string) => void
  currentImagePath?: string
  bucketName?: string
  folder?: string
  maxSizeInMB?: number
  acceptedFormats?: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImagePath,
  bucketName = 'product-images',
  folder = 'products',
  maxSizeInMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Get public URL for current image
  const getCurrentImageUrl = useCallback(() => {
    if (!currentImagePath) return null
    
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(currentImagePath)
    
    return data.publicUrl
  }, [currentImagePath, bucketName])

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `Fișierul este prea mare. Mărimea maximă permisă: ${maxSizeInMB}MB`
    }

    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Format neacceptat. Formate permise: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Validate file
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${folder}/${timestamp}.${fileExtension}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Call callback with the uploaded file path
      onImageUpload(data.path)
      
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setError(error.message || 'Eroare la încărcarea imaginii')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
  }

  const handleRemoveImage = async () => {
    if (!currentImagePath) return

    try {
      setUploading(true)
      
      // Delete from storage
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([currentImagePath])

      if (error) {
        throw error
      }

      // Clear the image
      onImageUpload('')
      
    } catch (error: any) {
      console.error('Error removing image:', error)
      setError(error.message || 'Eroare la ștergerea imaginii')
    } finally {
      setUploading(false)
    }
  }

  const currentImageUrl = getCurrentImageUrl()

  return (
    <Box>
      {/* Current Image Display */}
      {currentImageUrl && (
        <Box sx={{ mb: 2, position: 'relative' }}>
          <Box
            component="img"
            src={currentImageUrl}
            alt="Current product image"
            sx={{
              width: '100%',
              maxWidth: 300,
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}
          />
          <IconButton
            onClick={handleRemoveImage}
            disabled={uploading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark'
              }
            }}
            size="small"
          >
            <Delete />
          </IconButton>
        </Box>
      )}

      {/* Upload Area */}
      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s ease',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? (
          <Box>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Se încarcă imaginea...
            </Typography>
          </Box>
        ) : (
          <Box>
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {dragActive ? 'Eliberează pentru a încărca' : 'Încarcă o imagine'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Trage și eliberează sau faceți clic pentru a selecta
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Max {maxSizeInMB}MB • {acceptedFormats.map(f => f.split('/')[1]).join(', ').toUpperCase()}
            </Typography>
          </Box>
        )}
      </Box>

      {/* File Input Button */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          component="label"
          disabled={uploading}
          startIcon={<CloudUpload />}
        >
          Selectează fișier
          <input
            type="file"
            hidden
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
          />
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default ImageUpload