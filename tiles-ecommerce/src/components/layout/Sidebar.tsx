import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { useProductStore } from '../../stores/products'
import type { User } from '../../types'
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  ExpandLess,
  ExpandMore,
  Login,
  Logout
} from '@mui/icons-material'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const getStaticNavItems = () => [
  { id: 'home', label: 'Acasă', path: '/' },
  { id: 'showrooms', label: 'Showroomuri', path: '/showroomuri' },
  { id: 'calculator', label: 'Calculator', path: '/calculator' },
  { id: 'contact', label: 'Contact', path: '/contact' }
]

// Generate navigation items based on user authentication state and products
const getNavItems = (user: User | null, categories: any[]) => {
  const baseItems = [...getStaticNavItems()]
  
  // Add products section with categories (using slugs and product counts)
  if (categories.length > 0) {
    const productChildren = categories.map(category => ({
      id: `category-${category.id}`,
      label: `${category.name} (${category.products_count || 0})`,
      path: `/${category.slug}` // Direct category routing
    }))
    
    baseItems.splice(1, 0, {
      id: 'categories',
      label: 'Categorii',
      path: '/categorii',
      children: productChildren
    })
  }
  
  if (user) {
    // Add user-specific items (removed profile entry)
    
    if (user.role === 'admin') {
      baseItems.push({ 
        id: 'admin', 
        label: '⚙️ Dashboard Admin', 
        path: '/admin',
        isAdmin: true 
      })
    }
  }
  
  return baseItems
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { categories, fetchCategories } = useProductStore()
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])
  
  // Get dynamic navigation items based on auth state and categories
  const navItems = getNavItems(user, categories)

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const drawerWidth = 280

  const renderNavItem = (item: any, depth = 0) => (
    <React.Fragment key={item.id}>
      <ListItem disablePadding sx={{ pl: depth * 2 }}>
        <ListItemButton
          onClick={() => {
            if (item.children) {
              handleExpandClick(item.id)
            } else if (item.path) {
              navigate(item.path)
              if (isMobile) onClose()
            }
          }}
          sx={{ 
            minHeight: 56,
            px: 2.5
          }}
        >
          <ListItemText 
            primary={item.label}
            primaryTypographyProps={{
              variant: 'body1'
            }}
          />
          {item.children && (
            <Box>
              {expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
            </Box>
          )}
        </ListItemButton>
      </ListItem>
      
      {item.children && (
        <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child: any) => renderNavItem(child, depth + 1))}
          </List>
        </Collapse>
      )}
    </React.Fragment>
  )

  const handleAuthAction = async () => {
    if (user) {
      try {
        await signOut()
        navigate('/')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    } else {
      navigate('/auth')
    }
    if (isMobile) onClose()
  }

  const drawerContent = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Lista de navigare */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        pt: 2,
        // Ensure scrollable area takes up available space
        minHeight: 0,
        // Explicitly set height to enable proper scrolling
        height: 'calc(100vh - 128px)' // Account for auth section height
      }}>
        <List>
          {navItems.map(item => renderNavItem(item))}
        </List>
      </Box>

      {/* Authentication Icon - Fixed in Bottom Right Corner */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          minHeight: '64px',
          flexShrink: 0 // Prevent shrinking of auth section
        }}
      >
        <IconButton
          onClick={handleAuthAction}
          sx={{
            position: 'relative',
            bgcolor: user ? 'error.light' : 'primary.light',
            color: user ? 'error.main' : 'primary.main',
            border: 1,
            borderColor: user ? 'error.main' : 'primary.main',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: user ? 'error.main' : 'primary.main',
              color: 'white'
            },
            transition: 'all 0.2s ease'
          }}
          title={user ? 'Deconectare' : 'Autentificare'}
        >
          {user ? <Logout /> : <Login />}
        </IconButton>
      </Box>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '100%',
            height: '100%'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          position: 'relative',
          height: '100vh',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar