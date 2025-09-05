import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuthStore } from './stores/auth'
import { useWatchlistStore } from './stores/watchlist'
import { useProductStore } from './stores/products'
// import { useRealTimeSync } from './hooks/useRealTimeSync'
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
  IconButton,
  useMediaQuery,
  Popper,
  Paper,
  ClickAwayListener,
  Fade,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse
} from '@mui/material'
import { theme } from './theme'
import { Menu as MenuIcon, ShoppingCart, Login, Favorite, ExpandLess, ExpandMore, Logout } from '@mui/icons-material'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/common/WhatsAppButton'
import GlobalAlert from './components/common/GlobalAlert'
import SearchComponent from './components/common/SearchComponent'
import CartPopper from './components/common/CartPopper'
import UserProfilePopper from './components/common/UserProfilePopper'
import PublicShowrooms from './pages/PublicShowrooms'
import Products from './pages/Products'
import Calculator from './pages/Calculator'
import ProductDetail from './pages/ProductDetail'
import Watchlist from './pages/Watchlist'
import Cart from './pages/Cart'
import Billing from './pages/Billing'
import Checkout from './pages/Checkout'
import PaymentSimulator from './pages/PaymentSimulator'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Settings from './pages/admin/Settings'
import ShowroomManagement from './pages/admin/ShowroomManagement'
import ShowroomEdit from './pages/admin/ShowroomEdit'
import ShowroomCreate from './pages/admin/ShowroomCreate'
import ShowroomPreview from './pages/admin/ShowroomPreview'
import ProductManagement from './pages/admin/ProductManagement'
import InventoryDashboard from './pages/admin/InventoryDashboard'
import FaiantaEdit from './pages/admin/products/FaiantaEdit'
import GresieEdit from './pages/admin/products/GresieEdit'
import ParchetEdit from './pages/admin/products/ParchetEdit'
import RiflajeEdit from './pages/admin/products/RiflajeEdit'
import NewsletterManagement from './pages/admin/NewsletterManagement'
import Contact from './pages/Contact'
import HomePage from './pages/HomePage'
import Categories from './pages/Categories'
import Unsubscribe from './pages/Unsubscribe'
import AuthCallback from './pages/AuthCallback'
import ErrorBoundary from './components/common/ErrorBoundary'
import NotFoundPage from './components/common/NotFoundPage'

// Theme is now imported from separate file

// Create a client
const queryClient = new QueryClient()

// Create a separate component that uses navigate inside Router context

// Get navigation items based on user authentication state and products
const getStaticNavItems = () => [
  { id: 'home', label: 'Acasă', path: '/' },
  { id: 'showrooms', label: 'Showroomuri', path: '/showroom-uri' },
  { id: 'offers', label: 'Oferte Speciale', path: '/oferte' },
  { id: 'ideas', label: 'Idei Amenajare', path: '/idei' },
  { id: 'calculator', label: 'Calculator', path: '/calculator' },
  { id: 'contact', label: 'Contact', path: '/contact' }
]

interface Category {
  id: string
  name: string
  slug: string
  products_count?: number
}

interface User {
  role?: string
}

const getNavItems = (user: User | null, categories: Category[]) => {
  const baseItems = [...getStaticNavItems()]
  
  // Add products section with categories
  if (categories.length > 0) {
    const productChildren = categories.map(category => ({
      id: `category-${category.id}`,
      label: `${category.name} (${category.products_count || 0})`,
      path: `/${category.slug}`
    }))
    
    baseItems.splice(1, 0, {
      id: 'products',
      label: 'Produse',
      children: productChildren
    })
  }
  
  if (user) {
    baseItems.push({ id: 'profile', label: 'Profilul meu', path: '/profile' })
    
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

// Hamburger Menu Component
const HamburgerMenu: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { categories, fetchCategories } = useProductStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const navItems = getNavItems(user, categories)

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

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
    handleDrawerClose()
  }

  interface NavItem {
    id: string
    label: string
    path?: string
    children?: NavItem[]
    isAdmin?: boolean
  }

  const renderNavItem = (item: NavItem, depth = 0) => (
    <Box key={item.id}>
      <ListItem disablePadding sx={{ pl: depth * 2 }}>
        <ListItemButton
          onClick={() => {
            if (item.children) {
              handleExpandClick(item.id)
            } else if (item.path) {
              navigate(item.path)
              handleDrawerClose()
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
            {item.children.map((child) => renderNavItem(child, depth + 1))}
          </List>
        </Collapse>
      )}
    </Box>
  )

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          }
        }}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src="/pro-mac-logo.png" 
                alt="Pro-Mac" 
                style={{ height: 36, marginRight: 12 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pro-Mac
              </Typography>
            </Box>
          </Box>

          {/* Navigation items */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden'
          }}>
            <List>
              {navItems.map(item => renderNavItem(item))}
            </List>
          </Box>

          {/* Authentication section */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              fullWidth
              variant={user ? "outlined" : "contained"}
              color={user ? "error" : "primary"}
              startIcon={user ? <Logout /> : <Login />}
              onClick={handleAuthAction}
              sx={{
                minHeight: 48,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {user ? 'Deconectare' : 'Autentificare'}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

// Watchlist Popper Component
const WatchlistPopper: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { items } = useWatchlistStore()
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton size="medium" onClick={handleClick} color={items.length > 0 ? 'error' : 'default'}>
        <Favorite />
        {items.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: 'error.main',
              color: 'white',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {items.length > 9 ? '9+' : items.length}
          </Box>
        )}
      </IconButton>
      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="bottom-end" 
        transition
        strategy="fixed" // Prevents lag on mobile scroll
        sx={{
          zIndex: theme.zIndex.modal + 1 // Higher than breadcrumbs and other content
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                width: { 
                  xs: '100vw', // Full screen width on mobile
                  md: 320 
                },
                maxWidth: { xs: '100vw', md: 320 },
                maxHeight: 400,
                overflow: 'auto',
                mt: 0.5,
                mx: { xs: 0, md: 0 }, // No margins on mobile for full width
                borderRadius: { xs: 0, md: 2 }, // No border radius on mobile for full edge-to-edge
                boxShadow: theme.shadows[8],
                border: '1px solid',
                borderColor: 'divider',
                // Remove side borders on mobile for true full width
                borderLeft: { xs: 'none', md: '1px solid' },
                borderRight: { xs: 'none', md: '1px solid' },
                // Add small arrow/connector effect on mobile - positioned for full width
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'divider',
                  display: { xs: 'block', md: 'none' }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -7,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'background.paper',
                  display: { xs: 'block', md: 'none' }
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6">Favorite ({items.length})</Typography>
                  </Box>
                  {items.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Favorite sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Nu aveți produse favorite încă
                      </Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={handleClose}>
                        Explorează produsele
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {items.map((product) => (
                        <Box
                          key={product.id}
                          sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { backgroundColor: 'grey.50' },
                            cursor: 'pointer'
                          }}
                          onClick={handleClose}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            {product.price.toFixed(2)} RON
                          </Typography>
                        </Box>
                      ))}
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Button variant="contained" size="small" href="/favorite" onClick={handleClose}>
                          Vezi toate favorite
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

const AppContent: React.FC = () => {
  const { checkAuth, loading, user } = useAuthStore()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Initialize real-time synchronization for all clients - DISABLED for debugging
  // const { isConnected } = useRealTimeSync()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])


  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    )
  }

  // If user is admin, render only admin routes without the normal layout
  if (user?.role === 'admin') {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/auth" element={
            <ProtectedRoute requireAuth={false}>
              <Auth />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/verify-email" element={
            <ProtectedRoute requireAuth={false}>
              <VerifyEmail />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Admin routes - redirect root to admin dashboard */}
          <Route path="/" element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route path="/admin" element={
            <ProtectedRoute requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="panou-control" element={<Dashboard />} />
            <Route path="categorii_produse" element={<ProductManagement />} />
            <Route path="categorii_produse/:categorySlug" element={<ProductManagement />} />
            <Route path="inventar" element={<InventoryDashboard />} />
            {/* New specialized product editing routes */}
            <Route path="produse/faianta/:productSlug/editare" element={<FaiantaEdit />} />
            <Route path="produse/gresie/:productSlug/editare" element={<GresieEdit />} />
            <Route path="produse/parchet/:productSlug/editare" element={<ParchetEdit />} />
            <Route path="produse/riflaje/:productSlug/editare" element={<RiflajeEdit />} />
            <Route path="inventar" element={
              <Box textAlign="center" py={8}>
                <Typography variant="h5" gutterBottom>Managementul Stocurilor</Typography>
                <Typography color="text.secondary">În dezvoltare - disponibil în curând</Typography>
              </Box>
            } />
            <Route path="showroom-uri" element={<ShowroomManagement />} />
            <Route path="showroom-uri/create" element={<ShowroomCreate />} />
            <Route path="showroom-uri/:id/edit" element={<ShowroomEdit />} />
            <Route path="showroom-uri/:id/preview" element={<ShowroomPreview />} />
            <Route path="showroom-uri/preview" element={<ShowroomPreview />} />
            <Route path="newsletter" element={<NewsletterManagement />} />
            <Route path="setari" element={<Settings />} />
          </Route>
          
          {/* 404 page for admin users */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    )
  }

  // Normal user layout - render the NormalUserLayout component
  return <NormalUserLayout isMobile={isMobile} />
}

// Normal User Layout Component with Newsletter functionality
interface NormalUserLayoutProps {
  isMobile: boolean
}

const NormalUserLayout: React.FC<NormalUserLayoutProps> = ({
  isMobile
}) => {
  const navigate = useNavigate()

  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* AppBar */}
        <AppBar 
          position="fixed" 
          elevation={1} 
          sx={{ 
            backgroundColor: 'white', 
            color: 'black',
            zIndex: theme.zIndex.drawer + 1,
            width: '100%'
          }}
        >
          <Toolbar>
            {/* Hamburger Menu - Always visible */}
            <HamburgerMenu />
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexGrow: 1,
                cursor: 'pointer',
                // Even more aggressive reduction for iPhone
                ml: { xs: -3, sm: -2, md: 0 },
                mr: { xs: -2, md: 0 } // More aggressive right margin reduction
              }}
              onClick={() => navigate('/homepage')}
            >
              <img 
                src="/pro-mac-logo.png" 
                alt="Pro-Mac" 
                style={{ height: 48, marginRight: isMobile ? 0 : 16 }} // Remove all margin on mobile
              />
              {/* Hide company name on mobile */}
              <Typography 
                variant="h6" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Pro-Mac
              </Typography>
            </Box>

            {/* Search, Watchlist, Cart and Mobile Auth */}
            <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, alignItems: 'center' }}>
              <SearchComponent size="small" />
              <WatchlistPopper />
              <CartPopper />
              
              {/* User Profile Icon */}
              <UserProfilePopper />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Toolbar spacer for AppBar */}
        <Toolbar />

        {/* Main Content - Full Width */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            width: '100%',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          {/* Page Content - Full Height */}
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto'
            }}
          >
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/homepage" element={<HomePage />} />
                
                <Route path="/auth" element={
                  <ProtectedRoute requireAuth={false}>
                    <Auth />
                  </ProtectedRoute>
                } />
                
                <Route path="/auth/verify-email" element={
                  <ProtectedRoute requireAuth={false}>
                    <VerifyEmail />
                  </ProtectedRoute>
                } />
                
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/showroom-uri" element={<PublicShowrooms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/favorite" element={<Watchlist />} />
                <Route path="/cos" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-simulator" element={<PaymentSimulator />} />
                <Route path="/finalizare-comanda" element={<Billing />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                
                {/* Product detail routes - must come before category routes */}
                <Route path="/:categorySlug/:productSlug/:productId" element={<ProductDetail />} />
                
                {/* Category-specific product routes */}
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/:categorySlug" element={<Products />} />
                
              {/* 404 catch-all route for normal users */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </Box>
        
        {/* Footer - Full Width Outside Main Layout */}
        <Footer />
        
        {/* Global WhatsApp Floating Button */}
        <WhatsAppButton phoneNumber="0729926085" />
        
        {/* Newsletter Modal - Global */}
        {/* <NewsletterModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubscribe={handleNewsletterSubscribe}
        /> */}
        
        {/* Global Alert System */}
        <GlobalAlert />
      </Box>
    </ErrorBoundary>
  )
}


// Main App component
function App() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
          {content}
    </ThemeProvider>
  )
}

export default App
