// Invoice Management Dashboard for Admin
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  MenuItem,
  Breadcrumbs,
  Link
} from '@mui/material'
import {
  Search,
  Download,
  Visibility,
  Send,
  Cancel,
  Add,
  Settings,
  Receipt,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Schedule,
  TrendingUp,
  TrendingDown,
  Euro,
  CalendarMonth
} from '@mui/icons-material'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import { 
  Invoice, 
  InvoiceSettings,
  formatInvoiceNumber,
  invoicePDFGenerator,
  invoiceGenerator,
  VAT_RATES
} from '../../utils/efactura'

interface InvoiceStats {
  total: number
  sent: number
  pending: number
  failed: number
  totalAmount: number
  totalVat: number
  monthlyGrowth: number
}

export default function InvoiceManagement() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // State
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    totalVat: 0,
    monthlyGrowth: 0
  })
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  
  // Dialogs
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean, invoice: Invoice | null }>({
    open: false,
    invoice: null
  })
  const [sendDialog, setSendDialog] = useState<{ open: boolean, invoice: Invoice | null }>({
    open: false,
    invoice: null
  })
  const [stornoDialog, setStornoDialog] = useState<{ open: boolean, invoice: Invoice | null, reason: string }>({
    open: false,
    invoice: null,
    reason: ''
  })
  
  // Load invoices
  useEffect(() => {
    loadInvoices()
    loadStats()
  }, [statusFilter, dateFilter])
  
  const loadInvoices = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('anaf_status', statusFilter)
      }
      
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0))
            break
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1))
            break
          default:
            startDate = new Date(0)
        }
        
        query = query.gte('created_at', startDate.toISOString())
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      // Parse JSON fields
      const parsedInvoices = data?.map(inv => ({
        ...inv,
        date: new Date(inv.date),
        dueDate: new Date(inv.due_date),
        supplier: JSON.parse(inv.supplier),
        customer: JSON.parse(inv.customer),
        items: JSON.parse(inv.items),
        vatBreakdown: JSON.parse(inv.vat_breakdown)
      })) || []
      
      setInvoices(parsedInvoices)
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('anaf_status, total, total_vat, created_at')
      
      if (error) throw error
      
      const now = new Date()
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1))
      
      const currentMonthInvoices = data?.filter(inv => 
        new Date(inv.created_at) >= lastMonth
      ) || []
      
      const lastMonthTotal = currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const previousMonthTotal = (data?.length || 0) > 0 ? lastMonthTotal * 0.8 : 0 // Mock data
      
      setStats({
        total: data?.length || 0,
        sent: data?.filter(inv => inv.anaf_status === 'ACCEPTED').length || 0,
        pending: data?.filter(inv => inv.anaf_status === 'DRAFT' || inv.anaf_status === 'SENT').length || 0,
        failed: data?.filter(inv => inv.anaf_status === 'REJECTED' || inv.anaf_status === 'ERROR').length || 0,
        totalAmount: data?.reduce((sum, inv) => sum + inv.total, 0) || 0,
        totalVat: data?.reduce((sum, inv) => sum + inv.total_vat, 0) || 0,
        monthlyGrowth: previousMonthTotal > 0 
          ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
          : 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }
  
  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase()
    return (
      formatInvoiceNumber(invoice.series, invoice.number).toLowerCase().includes(searchLower) ||
      invoice.customer.name.toLowerCase().includes(searchLower) ||
      invoice.total.toString().includes(searchTerm)
    )
  })
  
  // Pagination
  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )
  
  // Handlers
  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await invoicePDFGenerator.saveAsPDF(invoice)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }
  
  const handleSendToANAF = async (invoice: Invoice) => {
    try {
      // Generate XML
      const xml = await invoiceGenerator.generateXML(invoice)
      
      // TODO: Send to ANAF via Edge Function
      console.log('XML ready to send:', xml.substring(0, 500))
      
      // Update status
      await supabase
        .from('invoices')
        .update({ 
          anaf_status: 'SENT',
          anaf_xml: xml,
          sent_to_anaf_at: new Date().toISOString()
        })
        .eq('id', invoice.id)
      
      // Reload
      loadInvoices()
      setSendDialog({ open: false, invoice: null })
    } catch (error) {
      console.error('Error sending to ANAF:', error)
    }
  }
  
  const handleCreateStorno = async () => {
    if (!stornoDialog.invoice || !stornoDialog.reason) return
    
    try {
      // Create storno invoice
      const stornoInvoice: Invoice = {
        ...stornoDialog.invoice,
        type: 'STORNO',
        stornoReference: formatInvoiceNumber(
          stornoDialog.invoice.series,
          stornoDialog.invoice.number
        ),
        number: stornoDialog.invoice.number + 1000, // Mock new number
        date: new Date(),
        notes: `Stornare: ${stornoDialog.reason}`,
        // Negate all amounts
        items: stornoDialog.invoice.items.map(item => ({
          ...item,
          quantity: -Math.abs(item.quantity),
          subtotal: -Math.abs(item.subtotal),
          vatAmount: -Math.abs(item.vatAmount),
          total: -Math.abs(item.total)
        })),
        subtotal: -Math.abs(stornoDialog.invoice.subtotal),
        totalVat: -Math.abs(stornoDialog.invoice.totalVat),
        total: -Math.abs(stornoDialog.invoice.total)
      }
      
      // Save to database
      const { error } = await supabase.from('invoices').insert({
        ...stornoInvoice,
        supplier: JSON.stringify(stornoInvoice.supplier),
        customer: JSON.stringify(stornoInvoice.customer),
        items: JSON.stringify(stornoInvoice.items),
        vat_breakdown: JSON.stringify(stornoInvoice.vatBreakdown)
      })
      
      if (error) throw error
      
      // Reload
      loadInvoices()
      setStornoDialog({ open: false, invoice: null, reason: '' })
    } catch (error) {
      console.error('Error creating storno:', error)
    }
  }
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACCEPTED': return 'success'
      case 'SENT': return 'info'
      case 'DRAFT': return 'warning'
      case 'REJECTED': 
      case 'ERROR': return 'error'
      default: return 'default'
    }
  }
  
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ACCEPTED': return <CheckCircle fontSize="small" />
      case 'SENT': return <Send fontSize="small" />
      case 'DRAFT': return <Schedule fontSize="small" />
      case 'REJECTED': 
      case 'ERROR': return <ErrorIcon fontSize="small" />
      default: return <Receipt fontSize="small" />
    }
  }
  
  if (!user || user.role !== 'admin') {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Nu aveți permisiunea de a accesa această pagină.</Alert>
      </Container>
    )
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link 
            component="button"
            color="inherit" 
            sx={{ textDecoration: 'none' }}
            onClick={() => navigate('/')}
          >
            Acasă
          </Link>
          <Link 
            component="button"
            color="inherit" 
            sx={{ textDecoration: 'none' }}
            onClick={() => navigate('/admin')}
          >
            Admin
          </Link>
          <Typography color="text.primary">Management Facturi</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Management Facturi
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate('/admin/invoice-settings')}
          >
            Setări
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/invoice-create')}
          >
            Factură Nouă
          </Button>
        </Stack>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Total Facturi
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {stats.total}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {stats.monthlyGrowth > 0 ? (
                    <TrendingUp color="success" fontSize="small" />
                  ) : (
                    <TrendingDown color="error" fontSize="small" />
                  )}
                  <Typography 
                    variant="body2" 
                    color={stats.monthlyGrowth > 0 ? 'success.main' : 'error.main'}
                  >
                    {Math.abs(stats.monthlyGrowth).toFixed(1)}% lunar
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Trimise la ANAF
                </Typography>
                <Typography variant="h4" fontWeight={600} color="success.main">
                  {stats.sent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(0) : 0}% din total
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  În Așteptare
                </Typography>
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {stats.pending}
                </Typography>
                <Chip 
                  label="Necesită acțiune" 
                  size="small" 
                  color="warning"
                  sx={{ mt: 1 }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography color="text.secondary" variant="body2">
                  Valoare Totală
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {stats.totalAmount.toLocaleString('ro-RO')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  TVA: {stats.totalVat.toLocaleString('ro-RO')} RON
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Caută după număr, client sau sumă..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Toate</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="SENT">Trimise</MenuItem>
              <MenuItem value="ACCEPTED">Acceptate</MenuItem>
              <MenuItem value="REJECTED">Respinse</MenuItem>
              <MenuItem value="ERROR">Eroare</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Perioadă"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="all">Toate</MenuItem>
              <MenuItem value="today">Astăzi</MenuItem>
              <MenuItem value="week">Ultima săptămână</MenuItem>
              <MenuItem value="month">Ultima lună</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setDateFilter('all')
              }}
            >
              Resetează
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : filteredInvoices.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <Receipt sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Nu există facturi
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Începeți prin a crea prima factură
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/admin/invoice-create')}
            >
              Creează Prima Factură
            </Button>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Număr</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Scadență</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Acțiuni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatInvoiceNumber(invoice.series, invoice.number)}
                      </Typography>
                      {invoice.type === 'STORNO' && (
                        <Chip label="STORNO" size="small" color="error" sx={{ mt: 0.5 }} />
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.customer.name}
                      </Typography>
                      {'cif' in invoice.customer && (
                        <Typography variant="caption" color="text.secondary">
                          CUI: {invoice.customer.cif}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {format(invoice.date, 'dd MMM yyyy', { locale: ro })}
                    </TableCell>
                    
                    <TableCell>
                      {format(invoice.dueDate, 'dd MMM yyyy', { locale: ro })}
                      {invoice.dueDate < new Date() && invoice.paymentStatus !== 'PAID' && (
                        <Chip 
                          label="Întârziat" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {invoice.total.toLocaleString('ro-RO')} {invoice.currency}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        TVA: {invoice.totalVat.toLocaleString('ro-RO')}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(invoice.anafStatus)}
                        label={invoice.anafStatus || 'DRAFT'}
                        color={getStatusColor(invoice.anafStatus)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Vizualizează">
                          <IconButton 
                            size="small"
                            onClick={() => setPreviewDialog({ open: true, invoice })}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Descarcă PDF">
                          <IconButton 
                            size="small"
                            onClick={() => handleDownloadPDF(invoice)}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        
                        {invoice.anafStatus === 'DRAFT' && (
                          <Tooltip title="Trimite la ANAF">
                            <IconButton 
                              size="small"
                              color="primary"
                              onClick={() => setSendDialog({ open: true, invoice })}
                            >
                              <Send />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {invoice.anafStatus === 'ACCEPTED' && invoice.type !== 'STORNO' && (
                          <Tooltip title="Stornează">
                            <IconButton 
                              size="small"
                              color="error"
                              onClick={() => setStornoDialog({ open: true, invoice, reason: '' })}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <TablePagination
              component="div"
              count={filteredInvoices.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10))
                setPage(0)
              }}
              labelRowsPerPage="Rânduri per pagină:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} din ${count}`}
            />
          </>
        )}
      </TableContainer>
      
      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, invoice: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Previzualizare Factură {previewDialog.invoice && formatInvoiceNumber(previewDialog.invoice.series, previewDialog.invoice.number)}
        </DialogTitle>
        <DialogContent>
          {/* Simplified preview - in production, render the actual PDF */}
          {previewDialog.invoice && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewDialog.invoice.supplier.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                CUI: {previewDialog.invoice.supplier.cif}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Client: {previewDialog.invoice.customer.name}
              </Typography>
              
              <Typography variant="body1" paragraph>
                Total: {previewDialog.invoice.total.toLocaleString('ro-RO')} {previewDialog.invoice.currency}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, invoice: null })}>
            Închide
          </Button>
          {previewDialog.invoice && (
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={() => {
                handleDownloadPDF(previewDialog.invoice!)
                setPreviewDialog({ open: false, invoice: null })
              }}
            >
              Descarcă PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Send to ANAF Dialog */}
      <Dialog
        open={sendDialog.open}
        onClose={() => setSendDialog({ open: false, invoice: null })}
      >
        <DialogTitle>Trimite Factura la ANAF</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Odată trimisă la ANAF, factura nu mai poate fi modificată!
          </Alert>
          <Typography>
            Confirmați trimiterea facturii {sendDialog.invoice && formatInvoiceNumber(sendDialog.invoice.series, sendDialog.invoice.number)} către ANAF?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog({ open: false, invoice: null })}>
            Anulează
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Send />}
            onClick={() => sendDialog.invoice && handleSendToANAF(sendDialog.invoice)}
          >
            Trimite la ANAF
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Storno Dialog */}
      <Dialog
        open={stornoDialog.open}
        onClose={() => setStornoDialog({ open: false, invoice: null, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Stornare Factură</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Stornarea unei facturi este o operațiune ireversibilă!
          </Alert>
          
          <Typography paragraph>
            Stornare factură {stornoDialog.invoice && formatInvoiceNumber(stornoDialog.invoice.series, stornoDialog.invoice.number)}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motiv stornare"
            value={stornoDialog.reason}
            onChange={(e) => setStornoDialog(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Ex: Retur produse, Date incorecte, Anulare comandă..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStornoDialog({ open: false, invoice: null, reason: '' })}>
            Anulează
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCreateStorno}
            disabled={!stornoDialog.reason.trim()}
          >
            Creează Storno
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}