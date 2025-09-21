import React, { useRef, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardMedia,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogContent,
  Backdrop
} from '@mui/material'
import {
  Add,
  Delete,
  CloudUpload,
  PhotoLibrary,
  Warning,
  Fullscreen,
  Close
} from '@mui/icons-material'

interface ShowroomPhotoManagerProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
  disabled?: boolean
}

const ShowroomPhotoManager: React.FC<ShowroomPhotoManagerProps> = ({
  photos,
  onChange,
  maxPhotos = 3,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; index: number } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vă rugăm să selectați doar fișiere imagine (JPG, PNG, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Imaginea trebuie să fie mai mică de 5MB')
      return
    }

    // Check if we can add more photos
    if (photos.length >= maxPhotos) {
      setError(`Puteți adăuga maximum ${maxPhotos} fotografii`)
      return
    }

    setError('')
    setUploading(true)

    // Create a preview URL for now (in real app, upload to Supabase storage)
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      onChange([...photos, imageUrl])
      setUploading(false)
    }
    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index)
    onChange(updatedPhotos)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFullscreen = (photo: string, index: number) => {
    setFullscreenImage({ src: photo, index })
  }

  const handleCloseFullscreen = () => {
    setFullscreenImage(null)
  }

  const canAddMore = photos.length < maxPhotos && !disabled

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
          Fotografii showroom
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ({photos.length}/{maxPhotos})
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Fixed height container for photos */}
      <Box 
        sx={{ 
          minHeight: { xs: 240, sm: 220, md: 200 },
          mb: 2
        }}
      >
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Existing Photos */}
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={12} md={4} key={index}>
              <Card 
                sx={{ 
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover .action-buttons': {
                    opacity: 1
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    height: { xs: 240, sm: 220, md: 200 },
                    width: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                  image={photo}
                  alt={`Showroom photo ${index + 1}`}
                />
                
                {/* Action Buttons */}
                <Box
                  className="action-buttons"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <Tooltip title="Vezi în dimensiune completă">
                    <IconButton
                      sx={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.9)',
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => handleFullscreen(photo, index)}
                      disabled={disabled}
                    >
                      <Fullscreen fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Șterge fotografia">
                    <IconButton
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => handleRemovePhoto(index)}
                      disabled={disabled}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}

          {/* Empty state placeholder when no photos */}
          {photos.length === 0 && (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Box
                sx={{
                  height: { xs: 240, sm: 220, md: 200 },
                  width: { xs: 240, sm: 220, md: 200 },
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  backgroundColor: 'grey.50'
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <PhotoLibrary sx={{ fontSize: 48, color: 'grey.400' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Nu există fotografii adăugate încă
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || !canAddMore}
      />

      {/* Info Section with Upload Button */}
      <Box 
        sx={{ 
          mt: 3,
          p: 2, 
          backgroundColor: 'grey.50', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>Recomandări pentru fotografii:</strong>
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              • Ratio recomandat: 16:9 sau 4:3 pentru afișare optimă
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Rezoluție minimă: 1200x800px pentru claritate pe toate dispozitivele
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Fotografiile vor fi optimizate automat pentru încărcare rapidă
            </Typography>
          </Stack>
        </Box>

        {canAddMore && (
          <Button
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            onClick={openFileDialog}
            disabled={uploading || disabled}
            sx={{
              minWidth: { xs: '100%', sm: 160 },
              whiteSpace: 'nowrap',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2,
              px: 3,
              '& .MuiButton-startIcon': {
                margin: 0,
                mb: 1
              }
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {uploading ? 'Se încarcă...' : 'Adaugă fotografie'}
              </Typography>
              {!uploading && (
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                  JPG, PNG, WebP (max 5MB)
                </Typography>
              )}
            </Box>
          </Button>
        )}
      </Box>

      {/* Fullscreen Image Dialog */}
      <Dialog
        open={!!fullscreenImage}
        onClose={handleCloseFullscreen}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
            margin: 0,
            maxWidth: '100vw',
            maxHeight: '100vh'
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
          }
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          {fullscreenImage && (
            <>
              <img
                src={fullscreenImage.src}
                alt={`Showroom photo ${fullscreenImage.index + 1} - fullscreen`}
                style={{
                  maxWidth: '95vw',
                  maxHeight: '95vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
              
              {/* Close Button */}
              <Tooltip title="Închide">
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)'
                    }
                  }}
                  onClick={handleCloseFullscreen}
                >
                  <Close />
                </IconButton>
              </Tooltip>

              {/* Image Info */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: 2
                }}
              >
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  Fotografie {fullscreenImage.index + 1} din {photos.length}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ShowroomPhotoManager