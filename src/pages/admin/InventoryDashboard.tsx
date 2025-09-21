import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Alert,
  AlertTitle,
  Stack,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  Inventory as InventoryIcon
} from '@mui/icons-material'
import { useInventoryStore } from '../../stores/inventory'
import { useProductStore } from '../../stores/products'
import { supabase } from '../../lib/supabase'
import StockAdjustmentDialog from '../../components/admin/StockAdjustmentDialog'
import StockMovementHistory from '../../components/admin/StockMovementHistory'

export default function InventoryDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [statusFilter, setStatusFilter] = useState('all')

  const {
    inventories,
    alerts,
    loading,
    error,
    fetchInventory,
    fetchActiveAlerts,
    adjustStock,
    clearError
  } = useInventoryStore()

  const { products, fetchProducts } = useProductStore()

  // Initial data load and real-time subscriptions
  useEffect(() => {
    fetchInventory()
    fetchActiveAlerts()
    fetchProducts()
    
    // Set up real-time subscription for inventory changes
    const inventoryChannel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        (payload) => {
          console.log('Inventory change detected:', payload)
          // Refresh inventory data
          fetchInventory()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_reservations'
        },
        (payload) => {
          console.log('Reservation change detected:', payload)
          // Refresh inventory data to update reserved quantities
          fetchInventory()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(inventoryChannel)
    }
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      // First fix any reservation inconsistencies
      const { error: fixError } = await supabase.rpc('fix_inventory_reservations')
      if (fixError) {
        console.warn('Could not fix reservations:', fixError)
      }
      
      // Then sync reserved quantities
      const { error: syncError } = await supabase.rpc('sync_reserved_quantities')
      if (syncError) {
        console.warn('Could not sync reserved quantities:', syncError)
      }
    } catch (error) {
      console.warn('Error during refresh:', error)
    }
    
    fetchInventory()
    fetchActiveAlerts()
  }, [fetchInventory, fetchActiveAlerts])

  // Handle stock adjustment
  const handleAdjustStock = (inventory: any, type: 'add' | 'remove') => {
    const product = products.find(p => p.id === inventory.product_id)
    const productWithInventory = {
      ...inventory,
      product: product
    }
    setSelectedProduct(productWithInventory)
    setAdjustmentType(type)
    setAdjustmentDialogOpen(true)
  }

  // Handle adjustment submit
  const handleAdjustmentSubmit = async (quantity: number, reason: string) => {
    if (!selectedProduct) return

    const adjustment = adjustmentType === 'add' ? quantity : -quantity
    await adjustStock(
      selectedProduct.product_id,
      selectedProduct.warehouse_id,
      adjustment,
      reason
    )
    
    setAdjustmentDialogOpen(false)
    handleRefresh()
  }

  // Handle view history
  const handleViewHistory = (inventory: any) => {
    const product = products.find(p => p.id === inventory.product_id)
    const productWithInventory = {
      ...inventory,
      product: product
    }
    setSelectedProduct(productWithInventory)
    setHistoryDialogOpen(true)
  }

  // Filter inventories based on search and status
  const filteredInventories = inventories.filter(inv => {
    const product = products.find(p => p.id === inv.product_id)
    if (!product) return false
    
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    let matchesStatus = true
    if (statusFilter === 'low_stock') {
      matchesStatus = inv.quantity_available <= (inv.reorder_point || 0) && inv.quantity_available > 0
    } else if (statusFilter === 'out_of_stock') {
      matchesStatus = inv.quantity_available === 0
    } else if (statusFilter === 'in_stock') {
      matchesStatus = inv.quantity_available > (inv.reorder_point || 0)
    }
    
    return matchesSearch && matchesStatus
  })
  
  // Paginate results
  const totalItems = filteredInventories.length
  const totalPages = Math.ceil(totalItems / rowsPerPage)
  const startIndex = (page - 1) * rowsPerPage
  const paginatedInventories = filteredInventories.slice(startIndex, startIndex + rowsPerPage)
  
  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter])

  // Calculate summary stats
  const totalProducts = inventories.length
  const totalValue = inventories.reduce((sum, inv) => {
    const product = products.find(p => p.id === inv.product_id)
    return sum + (inv.quantity_on_hand * (product?.price || 0))
  }, 0)
  const lowStockCount = inventories.filter(inv => 
    inv.quantity_available <= (inv.reorder_point || 0) && inv.quantity_available > 0
  ).length
  const outOfStockCount = inventories.filter(inv => inv.quantity_available === 0).length

  // Get stock status chip
  const getStockStatusChip = (inventory: any) => {
    if (inventory.quantity_available === 0) {
      return <Chip label="Stoc Epuizat" color="error" size="small" />
    }
    if (inventory.quantity_available <= (inventory.reorder_point || 0)) {
      return <Chip label="Stoc Scăzut" color="warning" size="small" />
    }
    return <Chip label="În Stoc" color="success" size="small" />
  }

  if (loading && inventories.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={50} />
          <Typography color="text.secondary">Se încarcă datele...</Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/admin" color="inherit" sx={{ textDecoration: 'none' }}>
            Admin
          </Link>
          <Typography color="text.primary">Inventar</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Inventar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestionați stocurile, urmăriți mișcările și monitorizați starea inventarului
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', height: '100%' }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <InventoryIcon sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 24,
                color: 'primary.main',
                opacity: 0.6
              }} />
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Produse
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', height: '100%' }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <TrendingUp sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 24,
                color: 'success.main',
                opacity: 0.6
              }} />
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Valoare Totală
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                €{totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', height: '100%' }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <WarningIcon sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 24,
                color: 'warning.main',
                opacity: 0.6
              }} />
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Stoc Scăzut
              </Typography>
              <Typography variant="h4" fontWeight={600} color="warning.main">
                {lowStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ position: 'relative', height: '100%' }}>
            <CardContent sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4
            }}>
              <TrendingDown sx={{ 
                position: 'absolute',
                top: 16,
                right: 16,
                fontSize: 24,
                color: 'error.main',
                opacity: 0.6
              }} />
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Stoc Epuizat
              </Typography>
              <Typography variant="h4" fontWeight={600} color="error.main">
                {outOfStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map(alert => (
            <Alert key={alert.id} severity={alert.severity as any} sx={{ mb: 1 }}>
              <AlertTitle>{alert.alert_type.replace('_', ' ').toUpperCase()}</AlertTitle>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search, Filters and Actions */}
      <Box display="flex" gap={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Căutați produse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            size="medium"
          >
            <MenuItem value="all">Toate</MenuItem>
            <MenuItem value="in_stock">În Stoc</MenuItem>
            <MenuItem value="low_stock">Stoc Scăzut</MenuItem>
            <MenuItem value="out_of_stock">Stoc Epuizat</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Pe pagină</InputLabel>
          <Select
            value={rowsPerPage}
            label="Pe pagină"
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            size="medium"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Actualizare
        </Button>
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produs</TableCell>
              <TableCell align="center">
                <Tooltip title="Cantitatea totală fizică în depozit">
                  <span style={{ cursor: 'help' }}>În Stoc</span>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Cantitatea rezervată pentru coșuri active și comenzi în procesare">
                  <span style={{ cursor: 'help' }}>Rezervat</span>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Cantitatea disponibilă pentru vânzare (În Stoc - Rezervat)">
                  <span style={{ cursor: 'help' }}>Disponibil</span>
                </Tooltip>
              </TableCell>
              <TableCell align="center">Punct Recomandare</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Acțiuni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInventories.map((inventory) => {
              const product = products.find(p => p.id === inventory.product_id)
              if (!product) return null

              return (
                <TableRow key={inventory.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.slug}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontWeight={500}>
                      {inventory.quantity_on_hand}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {inventory.quantity_reserved || 0}
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body1" 
                      fontWeight={600}
                      color={inventory.quantity_available > 0 ? 'success.main' : 'error.main'}
                    >
                      {inventory.quantity_available}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {inventory.reorder_point || '-'}
                  </TableCell>
                  <TableCell align="center">
                    {getStockStatusChip(inventory)}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Adaugă Stoc">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleAdjustStock(inventory, 'add')}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Elimină Stoc">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleAdjustStock(inventory, 'remove')}
                          disabled={inventory.quantity_available === 0}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Vezi Istoric">
                        <IconButton
                          size="small"
                          onClick={() => handleViewHistory(inventory)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination and Results Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Afișez {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalItems)} din {totalItems} produse
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, newPage) => setPage(newPage)}
          color="primary"
          showFirstButton
          showLastButton
          size="medium"
        />
      </Box>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        open={adjustmentDialogOpen}
        onClose={() => setAdjustmentDialogOpen(false)}
        onSubmit={handleAdjustmentSubmit}
        product={selectedProduct}
        type={adjustmentType}
      />

      {/* Movement History Dialog */}
      <StockMovementHistory
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        productId={selectedProduct?.product_id}
      />
    </Container>
  )
}