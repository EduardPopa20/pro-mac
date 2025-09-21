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
  Chip
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
  Tune as TuneIcon
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
      path: '/admin/categorii_produse'
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
      text: 'Configurare Specificații',
      icon: <TuneIcon />,
      path: '/admin/category-specs'
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
      navigate('/conectare')
    } catch (error) {
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* Logo and Brand */}
      <Box sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        textAlign: 'center',
        bgcolor: 'white',
        color: 'primary.main'
      }}>
        <Box
          component="img"
          src="/pro-mac-logo.png"
          alt="Pro-Mac Logo"
          sx={{
            height: { xs: '2rem', sm: '2.25rem', md: '2.5rem' },
            mb: 1
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.15rem', md: '1.25rem' }
          }}
        >
          Pro-Mac
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.8,
            fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem' }
          }}
        >
          Dashboard Administrare
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Items with scroll */}
      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: 'white',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(0,0,0,0.3)',
        },
      }}>
        <List sx={{ pt: 2 }}>
          {navigationItems.map((item) => {
          // Fix navigation highlighting - exact match for /admin, startsWith for others
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin' || location.pathname === '/admin/panou-control'
            : location.pathname.startsWith(item.path)
          
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                data-testid={`nav-${item.text.toLowerCase().replace(' ', '-')}`}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'primary.main',
                  minHeight: { xs: 48, sm: 44, md: 40 },
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.main' : 'action.hover',
                  },
                  py: { xs: 2, sm: 1.75, md: 1.5 }
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
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
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
      </Box>

      <Divider />

      {/* Logout Button */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', bgcolor: 'white' }}>
        <IconButton
          onClick={handleSignOut}
          data-testid="logout-button"
          sx={{
            color: 'error.main',
            minWidth: { xs: 44, sm: 40, md: 36 },
            minHeight: { xs: 44, sm: 40, md: 36 },
            '&:hover': {
              backgroundColor: 'error.main',
              color: 'white'
            }
          }}
          title="Deconectare"
        >
          <LogoutIcon sx={{ fontSize: { xs: '1.4rem', sm: '1.3rem', md: '1.2rem' } }} />
        </IconButton>
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
            p: { xs: 1.5, sm: 1 }, 
            backgroundColor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0
          }}
        >
          <IconButton 
            onClick={handleDrawerToggle}
            data-testid="mobile-menu-button"
            sx={{
              minWidth: 44,
              minHeight: 44,
              p: 1
            }}
          >
            <MenuIcon sx={{ fontSize: '1.5rem' }} />
          </IconButton>
        </Box>
        
        <Box sx={{ 
          p: { xs: 1.5, sm: 2, md: 3 }, 
          flexGrow: 1, 
          overflow: 'auto', 
          height: 'fit-content',
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