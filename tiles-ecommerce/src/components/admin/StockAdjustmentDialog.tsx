import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem
} from '@mui/material'

interface StockAdjustmentDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (quantity: number, reason: string) => Promise<void>
  product: any
  type: 'add' | 'remove'
}

const ADJUSTMENT_REASONS = {
  add: [
    'Achiziție de la furnizor',
    'Retur de la client',
    'Găsit la inventariere',
    'Transfer de la altă locație',
    'Producție finalizată',
    'Mostră returnată'
  ],
  remove: [
    'Vânzare către client',
    'Marfuri deteriorate',
    'Pierdut la inventariere',
    'Transfer la altă locație',
    'Mostră trimisă',
    'Produs expirat'
  ]
}

export default function StockAdjustmentDialog({
  open,
  onClose,
  onSubmit,
  product,
  type
}: StockAdjustmentDialogProps) {
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    // Validation
    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Vă rugăm introduceți o cantitate validă')
      return
    }

    if (type === 'remove' && qty > product?.quantity_available) {
      setError(`Nu puteți elimina mai mult decât disponibil (${product.quantity_available})`)
      return
    }

    const finalReason = reason === 'Altul (specificați)' ? customReason : reason
    if (!finalReason) {
      setError('Vă rugăm să furnizați un motiv')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onSubmit(qty, finalReason)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Eroare la ajustarea stocului')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setQuantity('')
    setReason('')
    setCustomReason('')
    setError('')
    onClose()
  }

  if (!product) return null

  const productName = product.product?.name || 'Produs Necunoscut'
  const currentStock = product.quantity_available || 0

  const reasonOptions = [
    ...ADJUSTMENT_REASONS[type],
    'Altul (specificați)'
  ]

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {type === 'add' ? 'Adaugă Stoc' : 'Elimină Stoc'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* Product Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Produs
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Stoc Disponibil Curent: <strong>{currentStock}</strong>
            </Typography>
          </Box>

          {/* Quantity Input */}
          <TextField
            fullWidth
            label="Cantitate"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 0.01, step: 0.01 }}
            sx={{ mb: 3 }}
            helperText={
              type === 'add'
                ? 'Introduceți cantitatea de adăugat în stoc'
                : `Introduceți cantitatea de eliminat (max: ${currentStock})`
            }
          />

          {/* Reason Select - EXACT copy from Profile.tsx */}
          <TextField
            select
            fullWidth
            label="Motiv"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mb: 3 }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    zIndex: 1400,
                  },
                },
                // Remove backdrop interference but keep visual appearance
                BackdropProps: {
                  invisible: true,
                },
                // Prevent focus trapping issues
                disableAutoFocus: true,
                disableEnforceFocus: true,
                disableRestoreFocus: true,
                // Fast exit transition
                transitionDuration: {
                  enter: 225,
                  exit: 50,
                },
                // Force cleanup
                keepMounted: false,
              },
              // Add explicit close handler to force cleanup
              onClose: () => {
                // Force focus back to document body to clear any lingering focus issues
                setTimeout(() => {
                  if (document.activeElement && document.activeElement !== document.body) {
                    (document.activeElement as HTMLElement).blur?.()
                  }
                }, 100)
              },
            }}
          >
            <MenuItem value="">
              <em>Selectează motivul</em>
            </MenuItem>
            {reasonOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Custom Reason */}
          {reason === 'Altul (specificați)' && (
            <TextField
              fullWidth
              label="Specificați Motivul"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Anulează
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={type === 'add' ? 'success' : 'error'}
          disabled={loading}
        >
          {loading ? 'Se procesează...' : type === 'add' ? 'Adaugă Stoc' : 'Elimină Stoc'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}