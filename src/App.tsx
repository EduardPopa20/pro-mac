import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useNavigateWithScroll } from './hooks/useNavigateWithScroll'
import HomeIcon from './components/icons/HomeIcon'
import ContactIcon from './components/icons/ContactIcon'
import ShowroomIcon from './components/icons/ShowroomIcon'
import CalculatorIcon from './components/icons/CalculatorIcon'
import CategoriesIcon from './components/icons/CategoriesIcon'
import FaiantaIcon from './components/icons/FaiantaIcon'
import GresieIcon from './components/icons/GresieIcon'
import ParchetIcon from './components/icons/ParchetIcon'
import RiflajeIcon from './components/icons/RiflajeIcon'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, Suspense, lazy } from 'react'
import { useAuthStore } from './stores/auth'
import { useWatchlistStore } from './stores/watchlist'
import { useProductStore } from './stores/products'
import { useCartStore } from './stores/cart'
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
import { Menu as MenuIcon, Login, Favorite, ExpandLess, ExpandMore, Logout } from '@mui/icons-material'
import Footer from './components/layout/Footer'
import WhatsAppButton from './components/common/WhatsAppButton'
import GlobalAlert from './components/common/GlobalAlert'
import SearchComponent from './components/common/SearchComponent'
import CartPopper from './components/common/CartPopper'
import UserProfilePopper from './components/common/UserProfilePopper'
import { FEATURES } from './config/features'
import PublicShowrooms from './pages/PublicShowrooms'
import Products from './pages/Products'
import Calculator from './pages/Calculator'
import ProductDetail from './pages/ProductDetail'
import Watchlist from './pages/Watchlist'
import Cart from './pages/Cart'
import Billing from './pages/Billing'
import Checkout from './pages/Checkout'
import PaymentSimulator from './pages/PaymentSimulator'
import Conectare from './pages/Conectare'
import CreeazaCont from './pages/CreeazaCont'
import Profile from './pages/Profile'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
// Lazy load admin components for better performance
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const ShowroomManagement = lazy(() => import('./pages/admin/ShowroomManagement'))
const ShowroomEdit = lazy(() => import('./pages/admin/ShowroomEdit'))
const ShowroomCreate = lazy(() => import('./pages/admin/ShowroomCreate'))
const ShowroomPreview = lazy(() => import('./pages/admin/ShowroomPreview'))
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'))
const InventoryDashboard = lazy(() => import('./pages/admin/InventoryDashboard'))
const FaiantaEdit = lazy(() => import('./pages/admin/products/FaiantaEdit'))
const GresieEdit = lazy(() => import('./pages/admin/products/GresieEdit'))
const ParchetEdit = lazy(() => import('./pages/admin/products/ParchetEdit'))
const RiflajeEdit = lazy(() => import('./pages/admin/products/RiflajeEdit'))
const NewsletterManagement = lazy(() => import('./pages/admin/NewsletterManagement'))
const CategorySpecsManager = lazy(() => import('./pages/admin/CategorySpecsManager'))
import Contact from './pages/Contact'
import HomePage from './pages/HomePage'
import Categories from './pages/Categories'
import Unsubscribe from './pages/Unsubscribe'
import AuthCallback from './pages/AuthCallback'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ErrorBoundary from './components/common/ErrorBoundary'
import NotFoundPage from './components/common/NotFoundPage'
import CartRecover from './pages/CartRecover'
import ScrollToTop from './components/common/ScrollToTop'
import NewsletterModal from './components/common/NewsletterModal'
import { useNewsletterModal, markUserAsSubscribed } from './hooks/useNewsletterModal'
import { supabase } from './lib/supabase'
import PrivacyPolicy from './pages/PrivacyPolicy'


// Create a client
const queryClient = new QueryClient()

// Admin loading spinner component
const AdminLoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    <CircularProgress size={40} />
  </Box>
)

// Create a separate component that uses navigate inside Router context

// Get navigation items based on user authentication state and products
const getStaticNavItems = () => [
  { id: 'home', label: 'Acasă', path: '/', icon: <HomeIcon size={24} color="#2196F3" /> },
  { id: 'showrooms', label: 'Showroomuri', path: '/showroom-uri', icon: <ShowroomIcon size={24} color="#FF9800" /> },
  { id: 'calculator', label: 'Calculator', path: '/calculator', icon: <CalculatorIcon size={24} color="#4CAF50" /> },
  { id: 'contact', label: 'Contact', path: '/contact', icon: <ContactIcon size={24} color="#9C27B0" /> }
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
    const productChildren = categories.map(category => {
      // Get the appropriate icon based on category name/slug
      let categoryIcon = <CategoriesIcon size={20} color="#757575" />
      
      if (category.slug === 'faianta' || category.name.toLowerCase().includes('faianta')) {
        categoryIcon = <FaiantaIcon size={20} color="#E53E3E" />
      } else if (category.slug === 'gresie' || category.name.toLowerCase().includes('gresie')) {
        categoryIcon = <GresieIcon size={20} color="#8B5A2B" />
      } else if (category.slug === 'parchet' || category.name.toLowerCase().includes('parchet')) {
        categoryIcon = <ParchetIcon size={20} color="#D69E2E" />
      } else if (category.slug === 'riflaje' || category.name.toLowerCase().includes('riflaj')) {
        categoryIcon = <RiflajeIcon size={20} color="#2B6CB0" />
      }

      return {
        id: `category-${category.id}`,
        label: `${category.name} (${category.products_count || 0})`,
        path: `/categorii_produse/${category.slug}`,
        icon: categoryIcon
      }
    })
    
    baseItems.splice(1, 0, {
      id: 'categories',
      label: 'Categorii',
      path: '/categorii_produse',
      icon: <CategoriesIcon size={24} color="#F56565" />,
      children: productChildren
    })
  }
  
  if (user) {
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
  const navigate = useNavigateWithScroll()
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
      navigate('/conectare')
    }
    handleDrawerClose()
  }

  interface NavItem {
    id: string
    label: string
    path?: string
    icon?: React.ReactNode
    children?: NavItem[]
    isAdmin?: boolean
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    // Tratament special pentru secțiunea "Categorii" - va fi permanent deschisă
    if (item.id === 'categories' && item.children) {
      return (
        <Box key={item.id}>
          {/* Titlul "Categorii" clickable */}
          <ListItem disablePadding sx={{ pl: depth * 2 }}>
            <ListItemButton
              onClick={() => {
                if (item.path) {
                  navigate(item.path)
                  handleDrawerClose()
                }
              }}
              sx={{ 
                minHeight: 56,
                px: 2.5,
                fontWeight: 600
              }}
            >
              {item.icon && (
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
              )}
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body1',
                  sx: { fontWeight: 600 }
                }}
              />
            </ListItemButton>
          </ListItem>
          
          {/* Subcategoriile - permanent deschise */}
          <List component="div" disablePadding>
            {item.children.map((child) => renderNavItem(child, depth + 1))}
          </List>
        </Box>
      )
    }

    // Pentru alte elemente, comportamentul normal
    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton
            onClick={() => {
              if (item.children && item.id !== 'categories') {
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
            {item.icon && (
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            )}
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body1'
              }}
            />
            {item.children && item.id !== 'categories' && (
              <Box>
                {expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        
        {item.children && item.id !== 'categories' && (
          <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

  return (
    <>
      <IconButton
        edge="start"
        aria-label="menu"
        onClick={handleDrawerToggle}
        sx={{
          mr: 2,
          color: 'white'
        }}
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
                style={{ height: 36, marginRight: 8 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.35rem' }}>
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
  

  useEffect(() => {
    checkAuth()
  }, [checkAuth])


  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // If user is admin, render only admin routes without the normal layout
  if (user?.role === 'admin') {
    return (
      <ErrorBoundary>
        <ScrollToTop />
        <Routes>
          <Route path="/conectare" element={
            <ProtectedRoute requireAuth={false}>
              <Conectare />
            </ProtectedRoute>
          } />
          
          <Route path="/creeaza-cont" element={
            <ProtectedRoute requireAuth={false}>
              <CreeazaCont />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/verify-email" element={
            <ProtectedRoute requireAuth={false}>
              <VerifyEmail />
            </ProtectedRoute>
          } />
          
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/cart/recover" element={<CartRecover />} />
          
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
            <Route index element={<Suspense fallback={<AdminLoadingSpinner />}><Dashboard /></Suspense>} />
            <Route path="dashboard" element={<Suspense fallback={<AdminLoadingSpinner />}><Dashboard /></Suspense>} />
            <Route path="panou-control" element={<Suspense fallback={<AdminLoadingSpinner />}><Dashboard /></Suspense>} />
            <Route path="categorii_produse" element={<Suspense fallback={<AdminLoadingSpinner />}><ProductManagement /></Suspense>} />
            <Route path="categorii_produse/:categorySlug" element={<Suspense fallback={<AdminLoadingSpinner />}><ProductManagement /></Suspense>} />
            <Route path="inventar" element={<Suspense fallback={<AdminLoadingSpinner />}><InventoryDashboard /></Suspense>} />
            {/* New specialized product editing routes */}
            <Route path="produse/faianta/:productSlug/editare" element={<Suspense fallback={<AdminLoadingSpinner />}><FaiantaEdit /></Suspense>} />
            <Route path="produse/gresie/:productSlug/editare" element={<Suspense fallback={<AdminLoadingSpinner />}><GresieEdit /></Suspense>} />
            <Route path="produse/parchet/:productSlug/editare" element={<Suspense fallback={<AdminLoadingSpinner />}><ParchetEdit /></Suspense>} />
            <Route path="produse/riflaje/:productSlug/editare" element={<Suspense fallback={<AdminLoadingSpinner />}><RiflajeEdit /></Suspense>} />
            <Route path="showroom-uri" element={<Suspense fallback={<AdminLoadingSpinner />}><ShowroomManagement /></Suspense>} />
            <Route path="showroom-uri/creeaza" element={<Suspense fallback={<AdminLoadingSpinner />}><ShowroomCreate /></Suspense>} />
            <Route path="showroom-uri/:id/edit" element={<Suspense fallback={<AdminLoadingSpinner />}><ShowroomEdit /></Suspense>} />
            <Route path="showroom-uri/:id/preview" element={<Suspense fallback={<AdminLoadingSpinner />}><ShowroomPreview /></Suspense>} />
            <Route path="showroom-uri/preview" element={<Suspense fallback={<AdminLoadingSpinner />}><ShowroomPreview /></Suspense>} />
            <Route path="newsletter" element={<Suspense fallback={<AdminLoadingSpinner />}><NewsletterManagement /></Suspense>} />
            <Route path="specificatii_categorii" element={<Suspense fallback={<AdminLoadingSpinner />}><CategorySpecsManager /></Suspense>} />
            {/* Redirect from old URL to new URL */}
            <Route path="configurare_specificatii" element={<Navigate to="/admin/specificatii_categorii" replace />} />
            <Route path="setari" element={<Suspense fallback={<AdminLoadingSpinner />}><Settings /></Suspense>} />
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
  const navigate = useNavigateWithScroll()
  const { user } = useAuthStore()
  const { syncReservations, releaseExpiredReservations } = useCartStore()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  
  // Check if user is subscribed to newsletter
  useEffect(() => {
    const checkNewsletterStatus = async () => {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('id, is_active')
            .eq('email', user.email.toLowerCase())
            .single()
          
          if (data && data.is_active) {
            setIsSubscribed(true)
            markUserAsSubscribed() // Mark in localStorage too
          }
        } catch (error) {
          console.error('Error checking newsletter status:', error)
        }
      } else {
        // For anonymous users, no need to check database - set as not subscribed
        setIsSubscribed(false)
      }
      setCheckingSubscription(false)
    }

    checkNewsletterStatus()
  }, [user])

  // Initialize cart reservations and cleanup expired ones
  useEffect(() => {
    const initializeCart = async () => {
      if (user) {
        try {
          // Sync existing reservations
          await syncReservations()
          // Clean up any expired reservations
          await releaseExpiredReservations()
        } catch (error) {
          console.warn('Error initializing cart reservations:', error)
        }
      }
    }

    initializeCart()
  }, [user, syncReservations, releaseExpiredReservations])

  // Use newsletter modal hook with conditions
  const { showModal, setShowModal } = useNewsletterModal()
  
  // Don't show modal if user is authenticated and subscribed
  const shouldShowNewsletterModal = !checkingSubscription && showModal && (!user || !isSubscribed)
  
  // Handle newsletter subscription
  const handleNewsletterSubscribe = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email.toLowerCase())
        .single()

      if (existing) {
        if (existing.is_active) {
          return { 
            success: false, 
            message: 'Această adresă de email este deja abonată la newsletter.' 
          }
        } else {
          // Reactivate subscription
          const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ 
              is_active: true,
              unsubscribed_at: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) throw error

          markUserAsSubscribed()
          setIsSubscribed(true)
          return { 
            success: true, 
            message: 'Abonarea ta a fost reactivată cu succes!' 
          }
        }
      }

      // Create new subscription
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          source: 'popup',
          is_active: true
        })

      if (error) {
        if (error.code === '23505') { // Duplicate key
          return { 
            success: false, 
            message: 'Această adresă de email este deja abonată.' 
          }
        }
        throw error
      }

      markUserAsSubscribed()
      setIsSubscribed(true)
      return { 
        success: true, 
        message: 'Te-ai abonat cu succes la newsletter!' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'A apărut o eroare. Te rugăm să încerci din nou.' 
      }
    }
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          elevation={1}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: '100%'
          }}
        >
          <Toolbar>
            {/* Hamburger Menu - Always visible */}
            <HamburgerMenu />
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  // Even more aggressive reduction for iPhone
                  ml: { xs: -3, sm: -2, md: 0 },
                  mr: { xs: -2, md: 2 } // More aggressive right margin reduction
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate('/homepage')
                }}
              >
                <img
                  src="/pro-mac-logo.png"
                  alt="Pro-Mac"
                  style={{ height: 48, marginRight: isMobile ? 0 : 12 }} // Reduced margin
                />
                {/* Hide company name on mobile */}
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    display: { xs: 'none', md: 'block' }
                  }}
                >
                  Pro-Mac
                </Typography>
              </Box>
            </Box>

            {/* Search, Watchlist, Cart and Mobile Auth */}
            <Box sx={{
              display: 'flex',
              gap: { xs: 0.5, md: 1 },
              alignItems: 'center'
            }}>
              <SearchComponent size="small" />
              {FEATURES.ECOMMERCE_ENABLED && <WatchlistPopper />}
              {FEATURES.SHOW_CART && <CartPopper />}

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
                
                <Route path="/conectare" element={
                  <ProtectedRoute requireAuth={false}>
                    <Conectare />
                  </ProtectedRoute>
                } />
                
                <Route path="/creeaza-cont" element={
                  <ProtectedRoute requireAuth={false}>
                    <CreeazaCont />
                  </ProtectedRoute>
                } />
                
                <Route path="/auth/verify-email" element={
                  <ProtectedRoute requireAuth={false}>
                    <VerifyEmail />
                  </ProtectedRoute>
                } />
                
                <Route path="/forgot-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPassword />
                  </ProtectedRoute>
                } />
                
                <Route path="/auth/reset-password" element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPassword />
                  </ProtectedRoute>
                } />
                
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/showroom-uri" element={<PublicShowrooms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categorii_produse" element={<Categories />} />
                {/* Backward compatibility */}
                <Route path="/categorii" element={<Categories />} />
                <Route path="/favorite" element={<Watchlist />} />
                {/* E-commerce routes - conditionally rendered */}
                {FEATURES.ECOMMERCE_ENABLED ? (
                  <>
                    <Route path="/cos" element={<Cart />} />
                    <Route path="/cart/recover" element={<CartRecover />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment-simulator" element={<PaymentSimulator />} />
                    <Route path="/finalizare-comanda" element={<Billing />} />
                  </>
                ) : (
                  <>
                    {/* Redirect e-commerce routes to contact when disabled */}
                    <Route path="/cos" element={<Contact />} />
                    <Route path="/checkout" element={<Contact />} />
                    <Route path="/finalizare-comanda" element={<Contact />} />
                    <Route path="/cart/recover" element={<Contact />} />
                  </>
                )}
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/politica-confidentialitate" element={<PrivacyPolicy />} />

                {/* Product detail routes - nested under categorii_produse */}
                <Route path="/categorii_produse/:categorySlug/:productSlug/:productId" element={<ProductDetail />} />
                
                {/* Category-specific product routes - nested under categorii_produse */}
                <Route path="/categorii_produse/:categorySlug" element={<Products />} />
                <Route path="/calculator" element={<Calculator />} />
                
                {/* Backward compatibility routes for old URLs */}
                <Route path="/:categorySlug/:productSlug/:productId" element={<ProductDetail />} />
                <Route path="/:categorySlug" element={<Products />} />
                
              {/* 404 catch-all route for normal users */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </Box>
        
        {/* Footer - Full Width Outside Main Layout */}
        <Footer />
        
        {/* Global WhatsApp Floating Button */}
        <WhatsAppButton />
        
        {/* Newsletter Modal - Global */}
        <NewsletterModal
          open={shouldShowNewsletterModal}
          onClose={() => setShowModal(false)}
          onSubscribe={handleNewsletterSubscribe}
        />
        
        {/* Global Alert System */}
        <GlobalAlert />
      </Box>
    </ErrorBoundary>
  )
}


// Main App component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
