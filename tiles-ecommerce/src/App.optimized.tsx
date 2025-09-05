import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useAuthStore } from './stores/auth'
import { useWatchlistStore } from './stores/watchlist'
import { useProductStore } from './stores/products'
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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  Skeleton
} from '@mui/material'
import { theme } from './theme'
import { Menu as MenuIcon, ShoppingCart, Login, Favorite, ExpandLess, ExpandMore, Logout } from '@mui/icons-material'
import ErrorBoundary from './components/common/ErrorBoundary'

// Critical components loaded immediately
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import SearchComponent from './components/common/SearchComponent'
import CartPopper from './components/common/CartPopper'
import UserProfilePopper from './components/common/UserProfilePopper'
import GlobalAlert from './components/common/GlobalAlert'
import WhatsAppButton from './components/common/WhatsAppButton'

// Lazy load all other pages and heavy components
const Products = lazy(() => import('./pages/Products'))
const PublicShowrooms = lazy(() => import('./pages/PublicShowrooms'))
const Calculator = lazy(() => import('./pages/Calculator'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Cart = lazy(() => import('./pages/Cart'))
const Billing = lazy(() => import('./pages/Billing'))
const Checkout = lazy(() => import('./pages/Checkout'))
const PaymentSimulator = lazy(() => import('./pages/PaymentSimulator'))
const Auth = lazy(() => import('./pages/Auth'))
const Profile = lazy(() => import('./pages/Profile'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Contact = lazy(() => import('./pages/Contact'))
const Unsubscribe = lazy(() => import('./pages/Unsubscribe'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const NotFoundPage = lazy(() => import('./components/common/NotFoundPage'))
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'))

// Lazy load entire admin section
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
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

// Optimized QueryClient with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Loading component with better UX
const PageLoader: React.FC = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
    gap={2}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Se încarcă...
    </Typography>
  </Box>
)

// Skeleton loader for better perceived performance
const SkeletonLoader: React.FC = () => (
  <Box p={3}>
    <Skeleton variant="text" width="40%" height={40} />
    <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
    <Box display="flex" gap={2}>
      <Skeleton variant="rectangular" width="30%" height={150} />
      <Skeleton variant="rectangular" width="30%" height={150} />
      <Skeleton variant="rectangular" width="30%" height={150} />
    </Box>
  </Box>
)

// Navigation configuration
const getStaticNavItems = () => [
  { id: 'home', label: 'Acasă', path: '/' },
  { id: 'showrooms', label: 'Showroomuri', path: '/showroomuri' },
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
        label: 'Dashboard Admin', 
        path: '/admin',
        isAdmin: true 
      })
    }
  }
  
  return baseItems
}

// Optimized Hamburger Menu
const HamburgerMenu: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { categories, fetchCategories } = useProductStore()

  useEffect(() => {
    // Only fetch if not already loaded
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  const navItems = getNavItems(user, categories)

  const handleExpandClick = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
    setExpandedItems([])
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setDrawerOpen(false)
  }

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={() => setDrawerOpen(true)}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '85%', sm: 320 },
            maxWidth: '100%',
            background: theme.palette.background.paper
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight={700}>
            Pro-Mac Tiles
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              {user.email}
            </Typography>
          )}
        </Box>

        <List sx={{ py: 0 }}>
          {navItems.map(item => (
            <div key={item.id}>
              <ListItemButton
                onClick={() => 
                  item.children 
                    ? handleExpandClick(item.id)
                    : item.path && handleNavigation(item.path)
                }
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  ...(item.isAdmin && {
                    backgroundColor: 'warning.light',
                    '&:hover': {
                      backgroundColor: 'warning.main'
                    }
                  })
                }}
              >
                <ListItem sx={{ p: 0 }}>
                  <Typography 
                    sx={{ 
                      flexGrow: 1,
                      fontWeight: item.isAdmin ? 600 : 500
                    }}
                  >
                    {item.label}
                  </Typography>
                  {item.children && (
                    expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItem>
              </ListItemButton>

              {item.children && (
                <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => (
                      <ListItemButton
                        key={child.id}
                        onClick={() => handleNavigation(child.path)}
                        sx={{ 
                          pl: 4, 
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'grey.50'
                        }}
                      >
                        <Typography variant="body2">
                          {child.label}
                        </Typography>
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
          
          {user && (
            <ListItemButton
              onClick={handleSignOut}
              sx={{ 
                py: 1.5,
                px: 2,
                borderTop: 2,
                borderColor: 'divider',
                mt: 2,
                color: 'error.main'
              }}
            >
              <Logout sx={{ mr: 2 }} />
              <Typography fontWeight={500}>
                Deconectare
              </Typography>
            </ListItemButton>
          )}
        </List>
      </Drawer>
    </>
  )
}

// Main App component
function AppContent() {
  const { user, loading, initAuth } = useAuthStore()
  const { fetchWatchlist } = useWatchlistStore()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (user) {
      fetchWatchlist()
    }
  }, [user, fetchWatchlist])

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header */}
      <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: { xs: 0.5, md: 2 } }}>
          {isMobile && <HamburgerMenu />}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
            onClick={() => navigate('/')}
          >
            Pro-Mac
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1.5, flexGrow: 1, ml: 4 }}>
              <Button color="inherit" onClick={() => navigate('/')}>
                Acasă
              </Button>
              <Button color="inherit" onClick={() => navigate('/gresie')}>
                Gresie
              </Button>
              <Button color="inherit" onClick={() => navigate('/faianta')}>
                Faianță
              </Button>
              <Button color="inherit" onClick={() => navigate('/parchet')}>
                Parchet
              </Button>
              <Button color="inherit" onClick={() => navigate('/calculator')}>
                Calculator
              </Button>
              <Button color="inherit" onClick={() => navigate('/contact')}>
                Contact
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/admin')}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  Admin
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <SearchComponent />
            
            {user ? (
              <>
                <IconButton 
                  color="inherit"
                  onClick={() => navigate('/watchlist')}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  <Favorite />
                </IconButton>
                <CartPopper />
                <UserProfilePopper />
              </>
            ) : (
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/auth')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Conectare
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              
              {/* Product routes */}
              <Route path="/gresie" element={<Products category="gresie" />} />
              <Route path="/faianta" element={<Products category="faianta" />} />
              <Route path="/parchet" element={<Products category="parchet" />} />
              <Route path="/riflaje" element={<Products category="riflaje" />} />
              <Route path="/:category/:slug/:id" element={<ProductDetail />} />
              
              {/* Feature routes */}
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/showroomuri" element={<PublicShowrooms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-simulator" element={<PaymentSimulator />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="showrooms" element={<ShowroomManagement />} />
                  <Route path="showrooms/new" element={<ShowroomCreate />} />
                  <Route path="showrooms/:id/edit" element={<ShowroomEdit />} />
                  <Route path="showrooms/:id/preview" element={<ShowroomPreview />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="products/faianta/:id/edit" element={<FaiantaEdit />} />
                  <Route path="products/gresie/:id/edit" element={<GresieEdit />} />
                  <Route path="products/parchet/:id/edit" element={<ParchetEdit />} />
                  <Route path="products/riflaje/:id/edit" element={<RiflajeEdit />} />
                  <Route path="inventory" element={<InventoryDashboard />} />
                  <Route path="newsletter" element={<NewsletterManagement />} />
                </Route>
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Box>

      <Footer />
      <WhatsAppButton />
      <GlobalAlert />
    </Box>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}