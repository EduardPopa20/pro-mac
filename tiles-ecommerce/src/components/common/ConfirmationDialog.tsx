import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon
} from '@mui/icons-material'

type ConfirmationType = 'warning' | 'error' | 'info' | 'success'

interface ConfirmationOptions {
  title: string
  message: string
  type?: ConfirmationType
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null)

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}

interface ConfirmationProviderProps {
  children: ReactNode
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const [dialog, setDialog] = useState<ConfirmationOptions & { 
    open: boolean
    resolve?: (confirmed: boolean) => void 
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const showConfirmation = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        open: true,
        type: options.type || 'warning',
        confirmText: options.confirmText || 'Confirmă',
        cancelText: options.cancelText || 'Anulează',
        resolve
      })
    })
  }

  const handleClose = () => {
    if (!loading) {
      if (dialog?.resolve) {
        dialog.resolve(false)
      }
      dialog?.onCancel?.()
      setDialog(null)
    }
  }

  const handleConfirm = async () => {
    if (!dialog) return
    
    setLoading(true)
    try {
      if (dialog.onConfirm && typeof dialog.onConfirm === 'function') {
        await dialog.onConfirm()
      }
      
      if (dialog.resolve) {
        dialog.resolve(true)
      }
      setDialog(null)
    } catch (error) {
      console.error('Confirmation action failed:', error)
      // Keep dialog open on error so user can see what happened
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: ConfirmationType) => {
    const iconProps = { sx: { fontSize: 48, mb: 2 } }
    switch (type) {
      case 'error':
        return <ErrorIcon {...iconProps} color="error" />
      case 'warning':
        return <WarningIcon {...iconProps} color="warning" />
      case 'info':
        return <InfoIcon {...iconProps} color="info" />
      case 'success':
        return <SuccessIcon {...iconProps} color="success" />
      default:
        return <WarningIcon {...iconProps} color="warning" />
    }
  }

  const getColor = (type: ConfirmationType) => {
    switch (type) {
      case 'error': return 'error'
      case 'warning': return 'warning'
      case 'info': return 'info'
      case 'success': return 'success'
      default: return 'warning'
    }
  }

  return (
    <ConfirmationContext.Provider value={{ showConfirmation }}>
      {children}
      
      {dialog && (
        <Dialog
          open={dialog.open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1, position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500'
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <Box display="flex" flexDirection="column" alignItems="center">
              {getIcon(dialog.type!)}
              <Typography variant="h5" sx={{ fontWeight: 600, color: `${getColor(dialog.type!)}.main` }}>
                {dialog.title}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {dialog.message}
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outlined"
              color="inherit"
              sx={{ minWidth: 100 }}
            >
              {dialog.cancelText}
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={loading}
              variant="contained"
              color={getColor(dialog.type!)}
              sx={{ minWidth: 100 }}
            >
              {loading ? 'Se procesează...' : dialog.confirmText}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </ConfirmationContext.Provider>
  )
}

