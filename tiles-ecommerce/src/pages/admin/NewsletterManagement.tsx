/**
 * Admin Newsletter Management Page
 * View all subscriptions, analytics, export, and bulk email functionality
 */
import React, { useEffect, useState } from 'react'
import {
  Box,
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
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Unsubscribe as UnsubscribeIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useNewsletterStore } from '../../stores/newsletter'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import type { NewsletterSubscription } from '../../types'

const NewsletterManagement: React.FC = () => {
  const { subscriptions, loading, fetchSubscriptions, updateSubscription, deleteSubscription, sendBulkEmail } = useNewsletterStore()
  const { showConfirmation } = useConfirmation()
  
  // State for table and filtering
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRow, setSelectedRow] = useState<NewsletterSubscription | null>(null)

  // State for bulk email dialog
  const [bulkEmailDialog, setBulkEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')

  // Load subscriptions on component mount
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // Filter subscriptions based on search and status
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
    bounced: subscriptions.filter(s => s.status === 'bounced').length
  }

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, subscription: NewsletterSubscription) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(subscription)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: NewsletterSubscription['status']) => {
    try {
      await updateSubscription(id, { status: newStatus })
      handleMenuClose()
    } catch (error: any) {
      console.error('Error updating subscription status:', error.message)
    }
  }

  // Handle delete subscription
  const handleDeleteSubscription = (subscription: NewsletterSubscription) => {
    showConfirmation({
      title: 'Șterge abonamentul',
      message: `Sigur dorești să ștergi abonamentul pentru ${subscription.email}? Această acțiune nu poate fi anulată.`,
      type: 'error',
      confirmText: 'Șterge',
      onConfirm: async () => {
        try {
          await deleteSubscription(subscription.id)
          handleMenuClose()
        } catch (error: any) {
          console.error('Error deleting subscription:', error.message)
        }
      }
    })
  }

  // Handle export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Status', 'Source', 'Subscribed At', 'Last Email Sent'],
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.status,
        sub.source,
        new Date(sub.subscribed_at).toLocaleDateString('ro-RO'),
        sub.last_email_sent_at ? new Date(sub.last_email_sent_at).toLocaleDateString('ro-RO') : 'Never'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `newsletter_subscriptions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle bulk email (placeholder for future implementation)
  const handleBulkEmail = () => {
    setBulkEmailDialog(true)
  }

  const handleSendBulkEmail = () => {
    showConfirmation({
      title: 'Trimite email în masă',
      message: `Trimitem email-ul către ${stats.active} abonați activi?`,
      type: 'warning',
      confirmText: 'Trimite',
      onConfirm: async () => {
        try {
          const result = await sendBulkEmail(emailSubject, emailContent)
          
          if (result.success) {
            // Show success confirmation
            showConfirmation({
              title: 'Email trimis cu succes!',
              message: result.message,
              type: 'success',
              confirmText: 'OK',
              onConfirm: () => {
                setBulkEmailDialog(false)
                setEmailSubject('')
                setEmailContent('')
                // Refresh subscriptions to update last_email_sent_at
                fetchSubscriptions()
              }
            })
          } else {
            // Show error confirmation
            showConfirmation({
              title: 'Eroare la trimiterea email-ului',
              message: result.message,
              type: 'error',
              confirmText: 'OK',
              onConfirm: () => {}
            })
          }
        } catch (error: any) {
          console.error('Error sending bulk email:', error)
          showConfirmation({
            title: 'Eroare neașteptată',
            message: 'A apărut o eroare neașteptată la trimiterea email-ului.',
            type: 'error',
            confirmText: 'OK',
            onConfirm: () => {}
          })
        }
      }
    })
  }

  // Get status color
  const getStatusColor = (status: NewsletterSubscription['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'unsubscribed': return 'default'
      case 'bounced': return 'error'
      default: return 'default'
    }
  }

  // Get source display name
  const getSourceDisplay = (source: NewsletterSubscription['source']) => {
    switch (source) {
      case 'modal': return 'Modal popup'
      case 'footer': return 'Footer'
      case 'checkout': return 'Checkout'
      case 'manual': return 'Manual'
      default: return source
    }
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link color="inherit" href="/admin" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Newsletter Management
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Newsletter Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchSubscriptions()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Subscribers
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {stats.total.toLocaleString()}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active
                  </Typography>
                  <Typography variant="h4" component="h2" color="success.main">
                    {stats.active.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Unsubscribed
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {stats.unsubscribed.toLocaleString()}
                  </Typography>
                </Box>
                <UnsubscribeIcon color="action" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Bounced
                  </Typography>
                  <Typography variant="h4" component="h2" color="error.main">
                    {stats.bounced.toLocaleString()}
                  </Typography>
                </Box>
                <EmailIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
            <MenuItem value="bounced">Bounced</MenuItem>
          </TextField>

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Export to CSV">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </Tooltip>

          <Tooltip title="Send bulk email to active subscribers">
            <Button
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={handleBulkEmail}
              disabled={stats.active === 0}
            >
              Bulk Email ({stats.active})
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      {/* Subscriptions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Subscribed At</TableCell>
                <TableCell>Last Email</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((subscription) => (
                  <TableRow key={subscription.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {subscription.email}
                      </Typography>
                      {subscription.user_id && (
                        <Typography variant="caption" color="text.secondary">
                          Authenticated user
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subscription.status}
                        size="small"
                        color={getStatusColor(subscription.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getSourceDisplay(subscription.source)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(subscription.subscribed_at).toLocaleDateString('ro-RO')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(subscription.subscribed_at).toLocaleTimeString('ro-RO')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {subscription.last_email_sent_at 
                          ? new Date(subscription.last_email_sent_at).toLocaleDateString('ro-RO')
                          : 'Never'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, subscription)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredSubscriptions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRow?.status !== 'active' && (
          <MenuItem onClick={() => handleStatusChange(selectedRow!.id, 'active')}>
            <ListItemIcon>
              <TrendingUpIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Active</ListItemText>
          </MenuItem>
        )}
        {selectedRow?.status !== 'unsubscribed' && (
          <MenuItem onClick={() => handleStatusChange(selectedRow!.id, 'unsubscribed')}>
            <ListItemIcon>
              <UnsubscribeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Unsubscribed</ListItemText>
          </MenuItem>
        )}
        {selectedRow?.status !== 'bounced' && (
          <MenuItem onClick={() => handleStatusChange(selectedRow!.id, 'bounced')}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Bounced</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteSubscription(selectedRow!)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Subscription</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Email Dialog */}
      <Dialog open={bulkEmailDialog} onClose={() => setBulkEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Bulk Email</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            This email will be sent to {stats.active} active subscribers.
          </Alert>
          <TextField
            fullWidth
            label="Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={8}
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            margin="normal"
            placeholder="Write your newsletter content here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkEmailDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendBulkEmail}
            variant="contained"
            disabled={!emailSubject.trim() || !emailContent.trim()}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default NewsletterManagement