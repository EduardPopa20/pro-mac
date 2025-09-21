import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Breadcrumbs,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Grid
} from '@mui/material'
import {
  Favorite,
  ShoppingCart,
  Delete,
  FavoriteBorder
} from '@mui/icons-material'
import { useWatchlistStore } from '../stores/watchlist'
import { generateProductSlug } from '../utils/slugUtils'
import { useProductStore } from '../stores/products'

const Watchlist: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  
  const { items, removeFromWatchlist, clearWatchlist } = useWatchlistStore()
  const { categories } = useProductStore()

  const generateProductUrl = (product: any) => {
    const category = categories.find(c => c.id === product.category_id)
    if (!category) return '#'
    
    const productSlug = generateProductSlug(product.name)
    return `/${category.slug}/${productSlug}/${product.id}`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const WatchlistCard: React.FC<{ product: any }> = ({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        },
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Remove from watchlist button */}
      <IconButton
        onClick={() => removeFromWatchlist(product.id)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          color: 'error.main',
          zIndex: 2,
          '&:hover': {
            bgcolor: 'error.main',
            color: 'white'
          }
        }}
      >
        <Delete fontSize="small" />
      </IconButton>

      {/* Product Image */}
      <Box
        sx={{ 
          position: 'relative', 
          paddingBottom: '60%',
          cursor: 'pointer' 
        }}
        onClick={() => navigate(generateProductUrl(product))}
      >
        {product.image_url ? (
          <CardMedia
            component="img"
            image={product.image_url}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Fără imagine
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Product Info */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 1, 
            cursor: 'pointer',
            '&:hover': { color: 'primary.main' }
          }}
          onClick={() => navigate(generateProductUrl(product))}
        >
          {product.name}
        </Typography>
        
        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
          {formatPrice(product.price)}
        </Typography>

        {/* Specifications */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          {product.dimensions && (
            <Typography variant="body2" color="text.secondary">
              <strong>Dimensiuni:</strong> {product.dimensions}
            </Typography>
          )}
          {product.color && (
            <Typography variant="body2" color="text.secondary">
              <strong>Culoare:</strong> {product.color}
            </Typography>
          )}
          {product.material && (
            <Typography variant="body2" color="text.secondary">
              <strong>Material:</strong> {product.material}
            </Typography>
          )}
        </Stack>

        {/* Action Button */}
        <Button
          variant="contained"
          startIcon={<ShoppingCart />}
          fullWidth
          size="large"
          onClick={() => navigate(generateProductUrl(product))}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            mt: 'auto'
          }}
        >
          Vezi detalii
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs - Fixed top-left positioning */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Typography color="text.primary">Lista de favorite</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Favorite color="error" sx={{ fontSize: 40 }} />
              Lista mea de favorite
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {items.length === 0 
                ? 'Nu ai produse salvate în lista de favorite'
                : `${items.length} ${items.length === 1 ? 'produs salvat' : 'produse salvate'}`
              }
            </Typography>
          </Box>
          
          {items.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={clearWatchlist}
              sx={{ textTransform: 'none' }}
            >
              Golește lista
            </Button>
          )}
        </Box>
      </Box>

      {/* Empty State */}
      {items.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          sx={{ 
            minHeight: '400px',
            textAlign: 'center',
            py: 8 
          }}
        >
          <FavoriteBorder sx={{ fontSize: 120, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
            Lista de favorite este goală
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
            Salvează produsele care îți plac pentru a le vedea mai târziu. 
            Apasă pe iconița cu inimă de pe produsele care te interesează.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Explorează produsele
          </Button>
        </Box>
      ) : (
        /* Products Grid */
        <Grid container spacing={3}>
          {items.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
              <WatchlistCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default Watchlist