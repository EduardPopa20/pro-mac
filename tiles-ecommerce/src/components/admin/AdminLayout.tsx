import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Inventory as ProductsIcon,
  Store as ShowroomsIcon,
  Assessment as InventoryIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import { useAuthStore } from '../../stores/auth'
import { ConfirmationProvider } from '../common/ConfirmationDialog'
import GlobalAlert from '../common/GlobalAlert'

const drawerWidth = 280

interface NavigationItem {
  text: string
  icon: React.ReactElement
  path: string
  badge?: number
}

const AdminLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuthStore()

  const [mobileOpen, setMobileOpen] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      text: 'Panou Control',
      icon: <DashboardIcon />,
      path: '/admin'
    },
    {
      text: 'Produse',
      icon: <ProductsIcon />,
      path: '/admin/produse'
    },
    {
      text: 'Inventar',
      icon: <InventoryIcon />,
      path: '/admin/inventar'
    },
    {
      text: 'Showroom-uri',
      icon: <ShowroomsIcon />,
      path: '/admin/showroom-uri'
    },
    {
      text: 'Newsletter',
      icon: <EmailIcon />,
      path: '/admin/newsletter'
    },
    {
      text: 'Setări',
      icon: <SettingsIcon />,
      path: '/admin/setari'
    }
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo and Brand */}
      <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <AdminIcon sx={{ fontSize: '2.5rem', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Pro-Mac Admin
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Dashboard Administrare
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navigationItems.map((item) => {
          // Fix navigation highlighting - exact match for /admin, startsWith for others
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin' || location.pathname === '/admin/panou-control'
            : location.pathname.startsWith(item.path)
          
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'action.hover',
                  },
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.contrastText' : 'primary.main',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '1rem'
                    }
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    color="error"
                    sx={{ ml: 1, minWidth: 24, height: 24 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* User Info and Logout */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {user?.full_name?.[0] || user?.email?.[0] || 'A'}
          </Avatar>
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {user?.full_name || 'Administrator'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleSignOut}
            sx={{
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white'
              }
            }}
            title="Deconectare"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <ConfirmationProvider>
      <Box sx={{ display: 'flex' }}>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: theme.shadows[8]
            }
          }}
        >
          {/* Mobile header with menu button */}
          <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Pro-Mac Admin
            </Typography>
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          </Box>
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: 1,
              borderColor: 'divider',
              height: '100vh'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          minHeight: '100vh',
          backgroundColor: 'grey.50',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mobile menu trigger */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            p: 1, 
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ 
          p: 3, 
          flexGrow: 1, 
          overflow: 'auto', 
          height: { xs: 'calc(100vh - 120px)', md: '100vh' }, 
          minHeight: { xs: 'calc(100vh - 120px)', md: '100vh' }
        }}>
          <Outlet />
        </Box>
      </Box>
      </Box>
      
      {/* Global Alert System */}
      <GlobalAlert />
    </ConfirmationProvider>
  )
}

export default AdminLayout