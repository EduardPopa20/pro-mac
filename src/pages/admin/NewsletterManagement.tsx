/**
 * Admin Newsletter Management Page
 * Modern responsive design with enhanced UX for all screen resolutions
 */
import React, { useEffect, useState, useCallback } from 'react'
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
  ListItemText,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Avatar,
  CircularProgress,
  Skeleton,
  Fade,
  FormControl,
  InputLabel,
  Select,
  Container,
  ClickAwayListener
} from '@mui/material'
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Unsubscribe as UnsubscribeIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ErrorOutline as ErrorIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material'
import { useNewsletterStore } from '../../stores/newsletter'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import type { NewsletterSubscription } from '../../types'
import { supabase } from '../../lib/supabase'
import NewsletterEditor from '../../components/email/NewsletterEditor'
import type { NewsletterTemplateProps } from '../../components/email/NewsletterTemplate'
import { sendNewsletter, validateRecipients } from '../../services/emailService'

const NewsletterManagement: React.FC = () => {
  const { subscriptions, loading, fetchSubscriptions, updateSubscription, deleteSubscription, sendBulkEmail } = useNewsletterStore()
  const { showConfirmation } = useConfirmation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

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
  const [emailLoading, setEmailLoading] = useState(false)

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
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  // Handle search change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setPage(0)
  }, [])

  // Handle status filter change
  const handleStatusFilterChange = useCallback((event: any) => {
    setStatusFilter(event.target.value)
    setPage(0)
  }, [])

  // Handle menu actions
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, subscription: NewsletterSubscription) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(subscription)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedRow(null)
  }, [])

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
      ['Email', 'Status', 'Subscribed At', 'Last Email Sent'],
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.status,
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

  // Handle bulk email dialog open
  const handleBulkEmail = useCallback(() => {
    setBulkEmailDialog(true)
  }, [])

  // Handle bulk email dialog close
  const handleCloseBulkDialog = useCallback(() => {
    setBulkEmailDialog(false)
  }, [])


  // Handle save newsletter draft
  const handleSaveNewsletter = async (emailData: NewsletterTemplateProps) => {
    try {
      // Aici poți implementa salvarea draft-ului în baza de date dacă este necesar
      showConfirmation({
        title: 'Draft salvat',
        message: 'Draft-ul newsletter-ului a fost salvat cu succes.',
        type: 'success',
        confirmText: 'OK'
      })
    } catch (error) {
      showConfirmation({
        title: 'Eroare',
        message: 'Eroare la salvarea draft-ului.',
        type: 'error',
        confirmText: 'OK'
      })
    }
  }

  // Handle send newsletter with React Email + Resend
  const handleSendNewsletter = async (emailData: NewsletterTemplateProps) => {
    setEmailLoading(true)

    try {
      // Prepare recipients from active subscriptions
      const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
      const recipients = activeSubscriptions.map(sub => ({
        email: sub.email,
        name: sub.full_name || undefined
      }))

      if (recipients.length === 0) {
        showConfirmation({
          title: 'Niciun destinatar',
          message: 'Nu există abonați activi pentru trimiterea newsletter-ului.',
          type: 'warning',
          confirmText: 'OK'
        })
        return
      }

      // Validate recipients
      const { valid, invalid } = validateRecipients(recipients)

      if (invalid.length > 0) {
        console.warn('Invalid email addresses found:', invalid)
      }

      if (valid.length === 0) {
        showConfirmation({
          title: 'Eroare validare',
          message: 'Nu există adrese de email valide pentru trimitere.',
          type: 'error',
          confirmText: 'OK'
        })
        return
      }

      // Send newsletter
      const result = await sendNewsletter({
        ...emailData,
        recipients: valid,
        unsubscribeUrl: `${window.location.origin}/unsubscribe`,
        websiteUrl: window.location.origin
      })

      if (result.success) {
        showConfirmation({
          title: 'Newsletter trimis cu succes!',
          message: result.message,
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => {
            handleCloseBulkDialog()
            fetchSubscriptions()
          }
        })
      } else {
        showConfirmation({
          title: 'Eroare la trimitere',
          message: result.message,
          type: 'error',
          confirmText: 'OK'
        })
      }

    } catch (error) {
      console.error('Newsletter send error:', error)
      showConfirmation({
        title: 'Eroare',
        message: 'Eroare la pregătirea newsletter-ului pentru trimitere.',
        type: 'error',
        confirmText: 'OK'
      })
    } finally {
      setEmailLoading(false)
    }
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

  // Get status icon
  const getStatusIcon = (status: NewsletterSubscription['status']) => {
    switch (status) {
      case 'active': return <CheckCircleIcon sx={{ fontSize: 16 }} />
      case 'unsubscribed': return <CancelIcon sx={{ fontSize: 16 }} />
      case 'bounced': return <ErrorIcon sx={{ fontSize: 16 }} />
      default: return null
    }
  }


  // Statistics Card Component - 1. Improved square shape with icon+text on same row
  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = 'primary.main' }) => (
    <Card
      sx={{
        aspectRatio: '1', // Force square shape
        borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        boxShadow: theme.shadows[2],
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Icon and title on same row */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
          <Box sx={{ color: color, display: 'flex', alignItems: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            {icon}
          </Box>
          <Typography
            color="text.secondary"
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              fontWeight: 600
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Value on center */}
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.75rem' },
            color: color,
            lineHeight: 1
          }}
        >
          {value.toLocaleString('ro-RO')}
        </Typography>
      </CardContent>
    </Card>
  )

  if (loading && subscriptions.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={30} />
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={6} sm={3} key={i}>
                <Skeleton variant="rounded" height={140} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={400} />
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Breadcrumbs - 2. Remove icons */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="/admin"
            sx={{
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Admin
          </Link>
          <Typography color="text.primary">
            Newsletter
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Fade in timeout={600}>
        <Box>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            mb={4}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}
              >
                Newsletter Management
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Gestionați abonamentele, analizați statistici și trimiteți campanii email
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchSubscriptions()}
              disabled={loading}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              {loading ? 'Se actualizează...' : 'Actualizează'}
            </Button>
          </Stack>

          {/* Statistics Cards - 1. Space-between layout */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: { xs: 2, sm: 3 },
              mb: 4,
              flexWrap: { xs: 'wrap', md: 'nowrap' }
            }}
          >
            <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, minWidth: 140 }}>
              <StatCard
                title="Total Abonați"
                value={stats.total}
                icon={<PeopleIcon fontSize="inherit" />}
                color={theme.palette.primary.main}
              />
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, minWidth: 140 }}>
              <StatCard
                title="Abonați Activi"
                value={stats.active}
                icon={<TrendingUpIcon fontSize="inherit" />}
                color={theme.palette.success.main}
              />
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, minWidth: 140 }}>
              <StatCard
                title="Dezabonați"
                value={stats.unsubscribed}
                icon={<UnsubscribeIcon fontSize="inherit" />}
                color={theme.palette.warning.main}
              />
            </Box>
            <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' }, minWidth: 140 }}>
              <StatCard
                title="Email-uri Respinse"
                value={stats.bounced}
                icon={<ErrorIcon fontSize="inherit" />}
                color={theme.palette.error.main}
              />
            </Box>
          </Box>

          {/* Filters and Actions */}
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 3,
              borderRadius: 3,
              boxShadow: theme.shadows[1],
              background: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(0,0,0,0.01)'
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <TextField
                  placeholder="Caută după email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size={isMobile ? 'small' : 'medium'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm('')}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: '100%'
                  }}
                />

                <FormControl size={isMobile ? 'small' : 'medium'} sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      <span>Toate ({subscriptions.length})</span>
                    </MenuItem>
                    <MenuItem value="active">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <span>Activi ({stats.active})</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="unsubscribed">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CancelIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                        <span>Dezabonați ({stats.unsubscribed})</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="bounced">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ErrorIcon sx={{ fontSize: 18, color: 'error.main' }} />
                        <span>Respinși ({stats.bounced})</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>

                {!isMobile && <Box sx={{ flexGrow: 1 }} />}

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <Tooltip title="Exportă lista de abonați în format CSV">
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={handleExportCSV}
                      size={isMobile ? 'medium' : 'large'}
                      sx={{
                        borderRadius: 2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Exportă CSV
                    </Button>
                  </Tooltip>

                  <Tooltip title={stats.active === 0 ? 'Nu există abonați activi' : 'Trimite email către toți abonații activi'}>
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={handleBulkEmail}
                        disabled={stats.active === 0}
                        size={isMobile ? 'medium' : 'large'}
                        sx={{
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          whiteSpace: 'nowrap',
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        Campanie Newsletter ({stats.active})
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>

              {(searchTerm || statusFilter !== 'all') && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Filtre active:
                  </Typography>
                  {searchTerm && (
                    <Chip
                      label={`Caută: ${searchTerm}`}
                      size="small"
                      onDelete={() => setSearchTerm('')}
                    />
                  )}
                  {statusFilter !== 'all' && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      size="small"
                      onDelete={() => setStatusFilter('all')}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    • {filteredSubscriptions.length} rezultate
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Subscriptions Table */}
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme.shadows[2]
            }}
          >
            <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
              <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      Email
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                        Status
                      </TableCell>
                    )}
                    {!isMobile && (
                      <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                        Data Abonării
                      </TableCell>
                    )}
                    {isDesktop && (
                      <TableCell align="center" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                        Ultimul Email
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}>
                      Acțiuni
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubscriptions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((subscription) => (
                      <TableRow
                        key={subscription.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            '& .action-button': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.875rem', sm: '1rem' }
                              }}
                            >
                              {subscription.email}
                            </Typography>
                            {isMobile && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  icon={getStatusIcon(subscription.status)}
                                  label={subscription.status === 'active' ? 'Activ' :
                                         subscription.status === 'unsubscribed' ? 'Dezabonat' :
                                         subscription.status === 'bounced' ? 'Respins' : subscription.status}
                                  size="small"
                                  color={getStatusColor(subscription.status)}
                                  sx={{ height: 24 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(subscription.subscribed_at).toLocaleDateString('ro-RO')}
                                </Typography>
                              </Stack>
                            )}
                            {subscription.user_id && (
                              <Chip
                                icon={<PersonAddIcon sx={{ fontSize: 14 }} />}
                                label="Utilizator înregistrat"
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="center">
                            <Chip
                              icon={getStatusIcon(subscription.status)}
                              label={subscription.status === 'active' ? 'Activ' :
                                     subscription.status === 'unsubscribed' ? 'Dezabonat' :
                                     subscription.status === 'bounced' ? 'Respins' : subscription.status}
                              size="small"
                              color={getStatusColor(subscription.status)}
                            />
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell align="center">
                            <Stack spacing={0.5} alignItems="center">
                              <Typography variant="body2">
                                {new Date(subscription.subscribed_at).toLocaleDateString('ro-RO')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(subscription.subscribed_at).toLocaleTimeString('ro-RO', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </Stack>
                          </TableCell>
                        )}
                        {isDesktop && (
                          <TableCell align="center">
                            {subscription.last_email_sent_at ? (
                              <Stack spacing={0.5} alignItems="center">
                                <Typography variant="body2">
                                  {new Date(subscription.last_email_sent_at).toLocaleDateString('ro-RO')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(subscription.last_email_sent_at).toLocaleTimeString('ro-RO', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                —
                              </Typography>
                            )}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, subscription)}
                            size="small"
                            className="action-button"
                            sx={{
                              opacity: { xs: 1, sm: 0.7 },
                              transition: 'opacity 0.2s'
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={filteredSubscriptions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={isMobile ? 'Rânduri:' : 'Rânduri per pagină:'}
              labelDisplayedRows={({ from, to, count }) =>
                isMobile ? `${from}-${to} / ${count}` : `${from}-${to} din ${count}`
              }
            />
          </Paper>

          {/* Empty State */}
          {filteredSubscriptions.length === 0 && !loading && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ py: 8 }}
            >
              <EmailIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Nu există abonamente
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Nu s-au găsit abonamente care să corespundă filtrelor selectate.'
                  : 'Nu există încă abonamente la newsletter.'}
              </Typography>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                >
                  Resetează Filtrele
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Fade>

      {/* Context Menu */}
      <ClickAwayListener onClickAway={handleMenuClose}>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          disableAutoFocus
          disableEnforceFocus
          disableRestoreFocus
          PaperProps={{
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          {selectedRow?.status !== 'unsubscribed' && (
            <MenuItem onClick={() => handleStatusChange(selectedRow!.id, 'unsubscribed')}>
              <ListItemIcon>
                <UnsubscribeIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Marchează ca Dezabonat</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </ClickAwayListener>

      {/* Newsletter Visual Editor Dialog */}
      <Dialog
        open={bulkEmailDialog}
        onClose={handleCloseBulkDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            height: isMobile ? '100vh' : 'auto',
            maxHeight: '95vh'
          }
        }}
      >
        <DialogContent sx={{ pt: 2 }}>
          <NewsletterEditor
            onSave={handleSaveNewsletter}
            onSend={handleSendNewsletter}
            loading={emailLoading}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseBulkDialog}
            size="large"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Închide
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default NewsletterManagement