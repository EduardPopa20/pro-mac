import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Paper,
  Stack,
  Chip,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar,
  Rating,
  Divider
} from '@mui/material'
import {
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Palette as PaletteIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  Architecture as ArchitectureIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'
import { useProductStore } from '../stores/products'
import { useSettingsStore } from '../stores/settings'

const HomePage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  
  const { categories, products, fetchCategories, fetchProducts } = useProductStore()
  const { showrooms, fetchShowrooms } = useSettingsStore()
  
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])

  // Hero slides data with high-quality tile images
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
      title: 'Transformă-ți casa cu cele mai frumoase plăci ceramice',
      subtitle: 'Descoperă colecția noastră Premium 2024 cu peste 1000 de modele',
      cta: 'Explorează colecția',
      action: () => navigate('/gresie')
    },
    {
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', 
      title: 'Faianță premium pentru băi de vis',
      subtitle: 'Creează spații elegante cu texturile și culorile perfecte',
      cta: 'Vezi faianța',
      action: () => navigate('/faianta')
    },
    {
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      title: 'Bucătării moderne cu stil italian',
      subtitle: 'Gresie rezistentă și frumoasă pentru spațiul tău preferat',
      cta: 'Proiecte bucătării',
      action: () => navigate('/gresie')
    }
  ]

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchShowrooms()
  }, [fetchCategories, fetchProducts, fetchShowrooms])

  useEffect(() => {
    // Auto-rotate hero slides
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  useEffect(() => {
    // Get featured products (first 6 products)
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 6))
    }
  }, [products])

  const nextSlide = () => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <Box sx={{ m: -3 }}> {/* Override parent padding for full-width homepage */}
      {/* Hero Section */}
      <Box 
        sx={{ 
          position: 'relative', 
          height: { xs: '70vh', md: '80vh' },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Background Images */}
        {heroSlides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentHeroSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          />
        ))}

        {/* Hero Content */}
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Fade in={true} timeout={1000}>
            <Box
              sx={{
                color: 'white',
                maxWidth: { xs: '100%', md: '60%' },
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }
                }}
              >
                {heroSlides[currentHeroSlide].title}
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400,
                  opacity: 0.95,
                  lineHeight: 1.4
                }}
              >
                {heroSlides[currentHeroSlide].subtitle}
              </Typography>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={heroSlides[currentHeroSlide].action}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  textTransform: 'none'
                }}
              >
                {heroSlides[currentHeroSlide].cta}
              </Button>
            </Box>
          </Fade>
        </Container>

        {/* Navigation Arrows */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ChevronLeftIcon fontSize="large" />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)'
            }
          }}
        >
          <ChevronRightIcon fontSize="large" />
        </IconButton>

        {/* Slide Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1
          }}
        >
          {heroSlides.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentHeroSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Value Propositions */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <ShippingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Livrare Gratuită
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pentru comenzi peste 500 RON în toată România
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <VerifiedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Garanție Premium
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Produse de înaltă calitate cu garanție extinsă
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <SupportIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Consultanță Gratuită
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Specialiștii noștri te ajută să alegi perfect
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                height: '100%',
                borderRadius: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Showroom București
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vizitează showroom-ul pentru a vedea produsele
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Product Categories Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="xl">
          <Box textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
              Categoriile Noastre
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Descoperă cea mai variată gamă de produse ceramice din România
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {categories.slice(0, 4).map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/${category.slug}`)}>
                    <CardMedia
                      component="img"
                      height={250}
                      image={category.slug === 'gresie' 
                        ? 'https://images.unsplash.com/photo-1600585152915-d208bec867a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                        : category.slug === 'faianta'
                        ? 'https://images.unsplash.com/photo-1620626011761-996317b8d101?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                        : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                      }
                      alt={category.name}
                      sx={{
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.products_count} produse disponibile
                      </Typography>
                      <Button 
                        variant="outlined" 
                        endIcon={<ArrowForwardIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Explorează
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Box textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Produse Recomandate
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Cele mai populare și apreciate produse din colecția noastră
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {featuredProducts.slice(0, 6).map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardActionArea onClick={() => navigate(`/${product.category?.slug}/${product.slug}/${product.id}`)}>
                  <CardMedia
                    component="img"
                    height={200}
                    image={product.image_url || 'https://images.unsplash.com/photo-1615971677499-5467cbab01c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                    alt={product.name}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Chip 
                      label={product.category?.name} 
                      size="small" 
                      color="primary" 
                      sx={{ mb: 2 }} 
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.dimensions || 'Dimensiuni multiple'}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                      {product.price.toFixed(2)} RON/mp
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/gresie')}
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 3 }}
          >
            Vezi toate produsele
          </Button>
        </Box>
      </Container>

      {/* Why Choose Pro-Mac Section */}
      <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
                De ce să alegi Pro-Mac?
              </Typography>
              
              <Stack spacing={3}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <ArchitectureIcon sx={{ fontSize: 32, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Peste 25 de ani de experiență
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Suntem lideri pe piața românească de materiale ceramice cu o experiență vastă în domeniu.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start" gap={2}>
                  <PaletteIcon sx={{ fontSize: 32, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Colecții exclusive premium
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Colaborăm direct cu producători renumiti din Italia și Spania pentru a-ți oferi cele mai frumoase design-uri.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start" gap={2}>
                  <HomeIcon sx={{ fontSize: 32, mt: 0.5 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Proiecte complete cheie în mână
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      De la consultanță și design, la livrare și montaj - ne ocupăm de tot pentru casa ta de vis.
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: theme.shadows[12]
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Pro-Mac Showroom Interior"
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Customer Reviews Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
        <Box textAlign="center" sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
            Ce spun clienții noștri
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Mii de clienți mulțumiți și-au transformat casele cu produsele noastre
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              name: 'Maria Popescu',
              location: 'București',
              rating: 5,
              review: 'Calitate excepțională și servicii impecabile! Echipa Pro-Mac ne-a ajutat să alegem perfect pentru bucătărie și baie. Rezultatul a depășit așteptările!'
            },
            {
              name: 'Andrei Ionescu',
              location: 'Cluj-Napoca',
              rating: 5,
              review: 'Livrarea rapidă și montajul profesional. Plăcile ceramice sunt superbe și de o calitate ieșită din comun. Recomand cu încredere!'
            },
            {
              name: 'Elena Dragomir',
              location: 'Constanța',
              rating: 5,
              review: 'Showroom-ul din București este impresionant! Am găsit exact ce căutam pentru apartamentul nou. Consultanții sunt foarte profesioniști.'
            }
          ].map((review, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {review.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {review.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {review.location}
                    </Typography>
                  </Box>
                </Box>
                
                <Rating value={review.rating} readOnly sx={{ mb: 2 }} />
                
                <Typography variant="body1" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{review.review}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="xl">
          <Box textAlign="center">
            <Typography variant="h2" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Începe-ți proiectul astăzi
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
              Contactează-ne pentru o consultanță gratuită și descoperă cum putem transforma casa ta
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={3} 
              justifyContent="center"
              alignItems="center"
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/contact')}
                sx={{ px: 4, py: 1.5, borderRadius: 3 }}
              >
                Solicită consultanță gratuită
              </Button>
              
              <Button
                variant="outlined"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 3,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={() => navigate('/showroomuri')}
              >
                Vizitează showroom-ul
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage