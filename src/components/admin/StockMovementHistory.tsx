import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { format } from 'date-fns'
import { useInventoryStore } from '../../stores/inventory'

interface StockMovementHistoryProps {
  open: boolean
  onClose: () => void
  productId?: number
}

export default function StockMovementHistory({
  open,
  onClose,
  productId
}: StockMovementHistoryProps) {
  const { movements, movementsLoading, fetchMovements } = useInventoryStore()
  const [filteredMovements, setFilteredMovements] = useState<any[]>([])

  useEffect(() => {
    if (open && productId) {
      fetchMovements(productId, 50)
    }
  }, [open, productId, fetchMovements])

  useEffect(() => {
    if (productId) {
      setFilteredMovements(movements.filter(m => m.product_id === productId))
    } else {
      setFilteredMovements(movements)
    }
  }, [movements, productId])

  const getMovementTypeChip = (type: string) => {
    const typeConfig: Record<string, { label: string; color: any }> = {
      purchase: { label: 'Achiziție', color: 'success' },
      sale: { label: 'Vânzare', color: 'primary' },
      return: { label: 'Retur', color: 'info' },
      adjustment: { label: 'Ajustare', color: 'warning' },
      transfer_in: { label: 'Transfer Primit', color: 'success' },
      transfer_out: { label: 'Transfer Trimis', color: 'warning' },
      damage: { label: 'Deteriorare', color: 'error' },
      reservation: { label: 'Rezervat', color: 'secondary' },
      release: { label: 'Eliberat', color: 'default' }
    }

    const config = typeConfig[type] || { label: type, color: 'default' }
    return <Chip label={config.label} color={config.color} size="small" />
  }

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, any> = {
      completed: 'success',
      pending: 'warning',
      failed: 'error',
      cancelled: 'default'
    }

    return (
      <Chip 
        label={status} 
        color={statusConfig[status] || 'default'} 
        size="small"
        variant="outlined"
      />
    )
  }

  // Function to translate common English reasons to Romanian
  const translateReason = (reason: string) => {
    const translations: Record<string, string> = {
      'Initial stock purchase': 'Achiziție stoc inițial',
      'Initial stock': 'Stoc inițial',
      'Stock adjustment': 'Ajustare stoc',
      'Stock correction': 'Corecție stoc',
      'Inventory count': 'Inventariere',
      'Manual adjustment': 'Ajustare manuală',
      'System correction': 'Corecție sistem',
      'Reorder': 'Recomandă',
      'Supplier return': 'Retur furnizor',
      'Customer return': 'Retur client',
      'Damaged goods': 'Produse deteriorate',
      'Expired goods': 'Produse expirate',
      'Lost items': 'Produse pierdute',
      'Found items': 'Produse găsite'
    }
    
    return translations[reason] || reason
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Istoricul Mișcărilor de Stoc</Typography>
      </DialogTitle>
      <DialogContent>
        {movementsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : filteredMovements.length === 0 ? (
          <Alert severity="info">
            Nu au fost găsite mișcări de stoc pentru acest produs.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Data</TableCell>
                  <TableCell align="center">Tip</TableCell>
                  <TableCell align="center">Cantitate</TableCell>
                  <TableCell align="center">Motiv</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Realizat De</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {format(new Date(movement.movement_date), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(movement.movement_date), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getMovementTypeChip(movement.movement_type)}
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={movement.quantity > 0 ? 'success.main' : 'error.main'}
                      >
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {translateReason(movement.reason) || '-'}
                      </Typography>
                      {movement.notes && (
                        <Typography variant="caption" color="text.secondary">
                          {movement.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(movement.status)}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">
                        {movement.performed_by_email || 'System'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Închide</Button>
      </DialogActions>
    </Dialog>
  )
}