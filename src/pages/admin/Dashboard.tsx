import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material'
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  People,
  Warning,
  CheckCircle
} from '@mui/icons-material'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactElement
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon, color }) => {
  const theme = useTheme()
  
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {title}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp 
                  sx={{ 
                    fontSize: 16, 
                    mr: 0.5,
                    color: change >= 0 ? 'success.main' : 'error.main',
                    transform: change < 0 ? 'rotate(180deg)' : 'none'
                  }} 
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: change >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {change >= 0 ? '+' : ''}{change}% față de luna trecută
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              color: `${color}.contrastText`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

interface InventoryAlertItem {
  id: number
  productName: string
  currentStock: number
  reorderLevel: number
  status: 'low' | 'out'
}

const Dashboard: React.FC = () => {
  // Mock data - în implementarea reală, acestea vor veni din API
  const stats = [
    {
      title: 'Total Produse',
      value: 156,
      change: 12,
      icon: <Inventory />,
      color: 'primary' as const
    },
    {
      title: 'Comenzi Luna Aceasta',
      value: 89,
      change: 23,
      icon: <ShoppingCart />,
      color: 'success' as const
    },
    {
      title: 'Clienți Activi',
      value: 234,
      change: 8,
      icon: <People />,
      color: 'secondary' as const
    },
    {
      title: 'Stoc Scăzut',
      value: 12,
      change: -15,
      icon: <Warning />,
      color: 'warning' as const
    }
  ]

  const inventoryAlerts: InventoryAlertItem[] = [
    { id: 1, productName: 'Faianță Albă Premium', currentStock: 5, reorderLevel: 10, status: 'low' },
    { id: 2, productName: 'Gresie Gri Modern', currentStock: 0, reorderLevel: 15, status: 'out' },
    { id: 3, productName: 'Parchet Laminat', currentStock: 3, reorderLevel: 8, status: 'low' },
    { id: 4, productName: 'Gresie Exterior Antiderapantă', currentStock: 1, reorderLevel: 5, status: 'low' }
  ]

  const recentActivities = [
    { action: 'Produs adăugat', item: 'Faianță Modernă 30x60', time: '2 ore în urmă', status: 'success' },
    { action: 'Stoc actualizat', item: 'Gresie Premium', time: '4 ore în urmă', status: 'info' },
    { action: 'Comandă procesată', item: 'Comandă #1234', time: '6 ore în urmă', status: 'success' },
    { action: 'Showroom actualizat', item: 'Showroom București', time: '1 zi în urmă', status: 'info' }
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard Administrare
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bună ziua! Iată o privire de ansamblu asupra magazinului dvs.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Inventory Alerts */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Alerte Stoc
                </Typography>
                <Chip 
                  label={inventoryAlerts.length} 
                  color="warning" 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <List sx={{ py: 0 }}>
                {inventoryAlerts.map((alert, index) => (
                  <ListItem 
                    key={alert.id}
                    sx={{ 
                      px: 0,
                      borderBottom: index < inventoryAlerts.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      py: 2
                    }}
                  >
                    <ListItemIcon>
                      <Warning 
                        color={alert.status === 'out' ? 'error' : 'warning'} 
                        sx={{ fontSize: 20 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={alert.productName}
                      secondary={
                        <Box component="span" sx={{ mt: 0.5, display: 'block' }}>
                          <span style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                            Stoc actual: {alert.currentStock} | Limită comandă: {alert.reorderLevel}
                          </span>
                          <LinearProgress
                            variant="determinate"
                            value={(alert.currentStock / alert.reorderLevel) * 100}
                            color={alert.status === 'out' ? 'error' : 'warning'}
                            sx={{ mt: 1, height: 4, borderRadius: 2, display: 'block' }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Activitate Recentă
              </Typography>
              
              <List sx={{ py: 0 }}>
                {recentActivities.map((activity, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      px: 0,
                      borderBottom: index < recentActivities.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      py: 2
                    }}
                  >
                    <ListItemIcon>
                      <CheckCircle 
                        color={activity.status === 'success' ? 'success' : 'primary'} 
                        sx={{ fontSize: 20 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box component="span" sx={{ display: 'block' }}>
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {activity.action}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.875rem', color: '#1976d2' }}>
                            {activity.item}
                          </span>
                        </Box>
                      }
                      secondary={
                        <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                          {activity.time}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Acțiuni Rapide
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    <Inventory sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Adaugă Produs
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'secondary.light',
                        color: 'secondary.contrastText'
                      }
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Actualizează Stoc
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'success.main',
                        backgroundColor: 'success.light',
                        color: 'success.contrastText'
                      }
                    }}
                  >
                    <People sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Gestionează Showroom
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'warning.main',
                        backgroundColor: 'warning.light',
                        color: 'warning.contrastText'
                      }
                    }}
                  >
                    <Warning sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Setări Site
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard