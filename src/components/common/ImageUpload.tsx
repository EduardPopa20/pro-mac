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
  onImageRemove?: () => void // New prop for state-only removal
  removeFromStorage?: boolean // Flag to control whether to actually delete from storage
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImagePath,
  bucketName = 'product-images',
  folder = 'products',
  maxSizeInMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  onImageRemove,
  removeFromStorage = true
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Get public URL for current image
  const getCurrentImageUrl = useCallback(() => {
    if (!currentImagePath) return null
    
    // If currentImagePath is already a full URL, return it directly
    if (currentImagePath.startsWith('http')) {
      return currentImagePath
    }
    
    // Otherwise, treat it as a storage path and get the public URL
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
      // Error uploading image - handled gracefully
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

    // If onImageRemove callback is provided, use it for state-only removal
    if (onImageRemove && !removeFromStorage) {
      onImageRemove()
      return
    }

    // Legacy behavior: remove from storage (for backwards compatibility)
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
      // Error removing image - handled gracefully
      setError(error.message || 'Eroare la ștergerea imaginii')
    } finally {
      setUploading(false)
    }
  }

  const currentImageUrl = getCurrentImageUrl()

  return (
    <Box>
      {currentImageUrl ? (
        /* Image Display with Remove Button */
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            border: '2px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: (theme) => theme.shadows[4]
            }
          }}
        >
          <Box
            component="img"
            src={currentImageUrl}
            alt="Current product image"
            sx={{
              width: '100%',
              maxWidth: 300,
              height: 200,
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              backgroundColor: 'grey.50'
            }}
          />
          
          {/* Remove Button Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
              padding: 2,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <IconButton
              onClick={handleRemoveImage}
              disabled={uploading}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'error.main',
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,1)',
                  transform: 'scale(1.1)'
                },
                '&:disabled': {
                  bgcolor: 'rgba(255,255,255,0.5)'
                }
              }}
              size="small"
            >
              <Delete />
            </IconButton>
          </Box>
          
          {/* Image Info Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
              color: 'white',
              p: 2
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Imagine Produs
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              Click pe coșul de gunoi pentru a elimina imaginea
            </Typography>
          </Box>
        </Box>
      ) : (
        /* Upload Area */
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
      )}
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