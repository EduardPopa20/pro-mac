import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  IconButton,
  Divider,
  Paper,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  Edit,
  Delete,
  LocationOn,
  Phone,
  AccessTime,
  Email,
  Store,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import type { Showroom } from '../../types'

interface EnhancedShowroomCardProps {
  showroom: Showroom
  onEdit: (showroom: Showroom) => void
  onDelete: (id: number) => void
}

const EnhancedShowroomCard: React.FC<EnhancedShowroomCardProps> = ({
  showroom,
  onEdit,
  onDelete
}) => {
  const theme = useTheme()

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default'
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle /> : <Cancel />
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        border: `1px solid`,
        borderColor: showroom.is_active ? 'success.light' : 'grey.300',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: showroom.is_active ? 'success.main' : 'primary.light',
          boxShadow: theme.shadows[6],
          transform: 'translateY(-2px)'
        },
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Status Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: 16,
          zIndex: 1
        }}
      >
        <Chip
          icon={getStatusIcon(showroom.is_active)}
          label={showroom.is_active ? 'Activ' : 'Inactiv'}
          color={getStatusColor(showroom.is_active)}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            boxShadow: theme.shadows[2]
          }}
        />
      </Box>

      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Section */}
        <Box
          sx={{
            p: 3,
            pb: 2,
            background: `linear-gradient(135deg, ${
              showroom.is_active ? theme.palette.success.light : theme.palette.grey[100]
            } 0%, ${
              showroom.is_active ? theme.palette.success.main : theme.palette.grey[200]
            } 100%)`,
            color: showroom.is_active ? 'white' : 'text.primary',
            borderRadius: '12px 12px 0 0'
          }}
        >
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Store sx={{ fontSize: 24, color: 'inherit' }} />
            </Box>
            <Box flex={1}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 0.5,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em'
                }}
              >
                {showroom.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontWeight: 500
                }}
              >
                {showroom.city}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 3, pt: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Location */}
          <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
            <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.1 }} />
            <Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: 'text.primary'
                }}
              >
                {showroom.address}
              </Typography>
            </Box>
          </Box>

          {/* Contact Info */}
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {showroom.phone && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Phone sx={{ color: 'info.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {showroom.phone}
                </Typography>
              </Box>
            )}
            
            {showroom.email && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <Email sx={{ color: 'warning.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {showroom.email}
                </Typography>
              </Box>
            )}

            {showroom.opening_hours && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <AccessTime sx={{ color: 'secondary.main', fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {showroom.opening_hours}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Description */}
          {showroom.description && (
            <Box sx={{ mb: 2, flex: 1 }}>
              <Divider sx={{ mb: 2, borderColor: 'divider' }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                "{showroom.description}"
              </Typography>
            </Box>
          )}

          {/* Actions */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Editează acest showroom">
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Edit />}
                  onClick={() => onEdit(showroom)}
                  sx={{ 
                    flex: 1, 
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 40
                  }}
                >
                  Editează
                </Button>
              </Tooltip>
              
              <Tooltip title="Șterge acest showroom">
                <Paper 
                  elevation={1}
                  sx={{ 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'error.light',
                    '&:hover': {
                      borderColor: 'error.main',
                      backgroundColor: 'error.light',
                      '& .MuiIconButton-root': {
                        color: 'white'
                      }
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <IconButton
                    color="error"
                    onClick={() => onDelete(showroom.id)}
                    size="medium"
                    sx={{ 
                      borderRadius: 2,
                      width: 40,
                      height: 40
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Paper>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default EnhancedShowroomCard