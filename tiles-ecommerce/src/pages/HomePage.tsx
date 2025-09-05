import React, { useState, useEffect, useMemo } from 'react'
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
  Rating
} from '@mui/material'
import {
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocalOffer as OfferIcon,
  Timer as TimerIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Category as CategoryIcon,
  LocalShipping,
  Architecture,
  VerifiedUser as VerifiedUserIcon,
  SupportAgent as SupportAgentIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useProductStore } from '../stores/products'
import { useSettingsStore } from '../stores/settings'

const HomePage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  
  const { categories, products, fetchCategories, fetchProducts } = useProductStore()
  const { showrooms, fetchShowrooms } = useSettingsStore()
  
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0)

  // Promotional offers for hero carousel
  const promotionalOffers = [
    {
      title: 'Reducere de Sezon',
      discount: '-25%',
      description: 'La toată gama de gresie porțelanată',
      validUntil: '31 Ianuarie 2024',
      bgColor: '#FF6B6B',
      icon: <OfferIcon />,
      action: () => navigate('/gresie'),
      buttonText: 'Vezi Oferta'
    },
    {
      title: 'Transport Gratuit',
      discount: '0 RON',
      description: 'Pentru comenzi peste 500 RON',
      validUntil: 'Ofertă permanentă',
      bgColor: '#4ECDC4',
      icon: <LocalShipping />,
      action: () => navigate('/gresie'),
      buttonText: 'Comandă Acum'
    },
    {
      title: 'Montaj Profesional',
      discount: '-15%',
      description: 'Reducere la serviciile de montaj',
      validUntil: '28 Februarie 2024',
      bgColor: '#45B7D1',
      icon: <Architecture />,
      action: () => navigate('/contact'),
      buttonText: 'Solicită Montaj'
    }
  ]

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchShowrooms()
  }, [fetchCategories, fetchProducts, fetchShowrooms])

  useEffect(() => {
    // Auto-rotate promotional offers
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % promotionalOffers.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [promotionalOffers.length])

  // Memoize carousel settings to prevent re-renders
  const carouselSettings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: !isMobile,
    lazyLoad: 'ondemand' as const,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false
        }
      }
    ]
  }), [isMobile, isTablet])

  // Memoize product filtering
  const getProductsByCategory = useMemo(() => {
    const productsByCategory: Record<string, any[]> = {}
    categories.forEach(category => {
      productsByCategory[category.slug] = products
        .filter(p => p.category?.slug === category.slug)
        .slice(0, 8)
    })
    return (categorySlug: string) => productsByCategory[categorySlug] || []
  }, [categories, products])

  const nextSlide = () => {
    setCurrentPromoSlide((prev) => (prev + 1) % promotionalOffers.length)
  }

  const prevSlide = () => {
    setCurrentPromoSlide((prev) => (prev - 1 + promotionalOffers.length) % promotionalOffers.length)
  }

  // Filter active showrooms
  const activeShowrooms = showrooms.filter(s => s.is_active)

  return (
    <Box sx={{ m: -3 }}>
      {/* Hero Section - Promotional Offers Carousel */}
      <Box 
        sx={{ 
          position: 'relative',
          height: { xs: '50vh', sm: '60vh', md: '70vh' },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
        }}
      >
        {promotionalOffers.map((offer, index) => (
          <Fade 
            key={index} 
            in={currentPromoSlide === index} 
            timeout={800}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: currentPromoSlide === index ? 'flex' : 'none',
                alignItems: 'center',
                background: `linear-gradient(135deg, ${offer.bgColor}dd 0%, ${offer.bgColor}99 100%)`
              }}
            >
              <Container maxWidth="xl">
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        color: 'white',
                        textAlign: { xs: 'center', md: 'left' }
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderRadius: 3,
                          p: 2,
                          mb: 3
                        }}
                      >
                        {React.cloneElement(offer.icon, { sx: { fontSize: 48 } })}
                      </Box>
                      
                      <Typography 
                        variant="h1" 
                        component="h1" 
                        sx={{ 
                          fontWeight: 800,
                          mb: 2,
                          fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                          lineHeight: 1.1,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        {offer.discount}
                      </Typography>
                      
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                        }}
                      >
                        {offer.title}
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mb: 3,
                          opacity: 0.95,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {offer.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        <TimerIcon />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {offer.validUntil}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={offer.action}
                        sx={{
                          py: 2,
                          px: 4,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          backgroundColor: 'white',
                          color: offer.bgColor,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8]
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {offer.buttonText}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Container>
            </Box>
          </Fade>
        ))}


        {/* Slide Indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1.5
          }}
        >
          {promotionalOffers.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentPromoSlide(index)}
              sx={{
                width: currentPromoSlide === index ? 40 : 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: currentPromoSlide === index ? 'white' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: currentPromoSlide === index ? 'white' : 'rgba(255,255,255,0.6)'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Product Carousels by Category - Optimized */}
      {categories.slice(0, 4).map((category, categoryIndex) => {
        const categoryProducts = getProductsByCategory(category.slug)
        if (categoryProducts.length === 0) return null

        return (
          <Box 
            key={category.id}
            sx={{ 
              py: { xs: 4, md: 6 },
              backgroundColor: categoryIndex % 2 === 0 ? 'white' : '#fafafa'
            }}
          >
            <Container maxWidth="xl">
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography 
                    variant="h3" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <CategoryIcon fontSize="small" />
                    {category.products_count} produse disponibile
                  </Typography>
                </Box>
                
                <Button
                  variant="text"
                  endIcon={<KeyboardArrowRightIcon />}
                  onClick={() => navigate(`/${category.slug}`)}
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  Vezi toate
                </Button>
              </Box>

              <Box sx={{ '.slick-track': { display: 'flex', alignItems: 'stretch' } }}>
                <Slider {...carouselSettings}>
                  {categoryProducts.map((product) => (
                    <Box key={product.id} sx={{ px: 1 }}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'grey.200',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[4],
                            borderColor: 'primary.main',
                            '& .MuiCardMedia-root': {
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                      >
                        <CardActionArea 
                          onClick={() => navigate(`/${category.slug}/${product.slug}/${product.id}`)}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                            <CardMedia
                              component="img"
                              height={240}
                              image={product.image_url || 'https://via.placeholder.com/400x240?text=Pro-Mac+Tiles'}
                              alt={product.name}
                              loading="lazy"
                              sx={{
                                transition: 'transform 0.3s ease'
                              }}
                            />
                            {product.is_featured && (
                              <Chip
                                label="Popular"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: '#FF6B6B',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                          
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                minHeight: '2.5rem'
                              }}
                            >
                              {product.name}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 0.5 }}>
                              <Rating value={4.5} precision={0.5} size="small" readOnly />
                              <Typography variant="caption" color="text.secondary">
                                (4.5)
                              </Typography>
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {product.dimensions || 'Dimensiuni multiple'}
                            </Typography>
                            
                            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                              {product.price.toFixed(2)} RON/mp
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Box>
                  ))}
                </Slider>
              </Box>
            </Container>
          </Box>
        )
      })}

      {/* Showrooms Section - Single Card Layout */}
      {activeShowrooms.length > 0 && (
        <Box 
          sx={{ 
            py: { xs: 6, md: 8 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Container maxWidth="xl">
            <Box textAlign="center" sx={{ mb: 4 }}>
              <Typography 
                variant="h2" 
                component="h2" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', md: '2.5rem' }
                }}
              >
                Vizitează-ne
              </Typography>
            </Box>

            <Box sx={{ 
              maxWidth: 1200, 
              mx: 'auto',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              alignItems: { xs: 'center', md: 'stretch' }
            }}>
              {/* Left Half - Showroom Card with text below */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 50%' },
                display: 'flex', 
                flexDirection: 'column',
                width: { xs: '100%', md: 'auto' }
              }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    flexGrow: 1,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 280, md: 320 },
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 80, color: 'white', opacity: 0.3 }} />
                    {activeShowrooms[0]?.photos?.length > 0 && (
                      <Box
                        component="img"
                        src={activeShowrooms[0].photos[0]}
                        alt={activeShowrooms[0].name}
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        boxShadow: theme.shadows[3]
                      }}
                    >
                      Deschis Acum
                    </Box>
                  </Box>
                  
                  {/* Showroom Information */}
                  <CardContent sx={{ p: 3, backgroundColor: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                      {activeShowrooms[0]?.name || 'Showroom Principal'}
                    </Typography>
                    
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {activeShowrooms[0]?.address || 'Adresa showroom-ului'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {activeShowrooms[0]?.phone || '+40 xxx xxx xxx'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <ScheduleIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          Luni - Vineri: 08:00 - 18:00
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body2" color="text.secondary">
                          {activeShowrooms[0]?.email || 'contact@promac.ro'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Paper>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    textAlign: 'center', 
                    mt: 2,
                    fontWeight: 600,
                    opacity: 0.9,
                    color: 'white'
                  }}
                >
                  Showroom Principal
                </Typography>
              </Box>
              
              {/* Right Half - Descriptive Text */}
              <Box sx={{ 
                flex: { xs: '1 1 100%', md: '1 1 50%' },
                px: { xs: 0, md: 4 }, 
                py: { xs: 4, md: 0 },
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'flex-start' 
              }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
                  Descoperă Experiența Pro-Mac
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                  În showroom-urile noastre vei găsi o selecție curatoriată de materiale ceramice premium. 
                  Poți atinge texturile, vedea culorile reale și te poți inspira din amenajările noastre 
                  pentru proiectul tău perfect.
                </Typography>

                <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                  Consultanții noștri specializați îți vor oferi sfaturi personalizate și te vor ghida 
                  în alegerea celor mai potrivite soluții pentru casa ta. Fiecare vizită este o 
                  oportunitate de a-ți transforma viziunea în realitate.
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => navigate('/showroom-uri')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }
                  }}
                >
                  Găsește Showroom-ul Cel Mai Apropiat
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Why Choose Pro-Mac - Enhanced Design */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(25, 118, 210, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(156, 39, 176, 0.06) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}
        />

        <Container maxWidth="xl">
          {/* Section Header */}
          <Box textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: '0.875rem'
              }}
            >
              AVANTAJELE NOASTRE
            </Typography>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 800,
                mt: 1,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              De ce să alegi Pro-Mac?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 600,
                mx: 'auto',
                color: 'text.secondary',
                fontSize: '1.1rem'
              }}
            >
              Experiență, calitate și dedicare pentru proiectul tău perfect
            </Typography>
          </Box>

          {/* Centered Image + Icons Group */}
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" gap={4} sx={{ display: { xs: 'none', lg: 'flex' } }}>
              {/* Central Image */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: 400,
                  width: 500,
                  flexShrink: 0,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Pro-Mac Experience"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                
                {/* Overlay with stats */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    p: 3,
                    color: 'white'
                  }}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>25+</Typography>
                      <Typography variant="caption">Ani Experiență</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>50K+</Typography>
                      <Typography variant="caption">Clienți Mulțumiți</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>100+</Typography>
                      <Typography variant="caption">Branduri Premium</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              {/* Right Icons Column */}
              <Stack spacing={3}>
                {[
                  {
                    icon: <StarIcon />,
                    title: 'Peste 25 de ani de excelență',
                    description: 'Suntem lideri pe piața românească cu experiență vastă în materiale ceramice premium.',
                    color: '#FFD700',
                    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                  },
                  {
                    icon: <PaletteIcon />,
                    title: 'Colecții exclusive din Italia și Spania',
                    description: 'Colaborăm cu producători renumiți pentru design-uri unice și tendințe actuale.',
                    color: '#E91E63',
                    gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)'
                  },
                  {
                    icon: <LocalShippingIcon />,
                    title: 'Livrare rapidă și sigură',
                    description: 'Transport profesional în toată țara cu manipulare atentă a produselor.',
                    color: '#2196F3',
                    gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)'
                  },
                  {
                    icon: <VerifiedUserIcon />,
                    title: 'Garanție și certificare',
                    description: 'Toate produsele sunt certificate CE și beneficiază de garanție extinsă.',
                    color: '#FF6B35',
                    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
                  }
                ].map((feature, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      width: 280,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                        borderColor: 'transparent',
                        '& .feature-icon': {
                          transform: 'rotate(10deg) scale(1.1)'
                        }
                      }
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      <Box
                        className="feature-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: feature.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                          transition: 'transform 0.3s ease',
                          boxShadow: `0 4px 12px ${feature.color}40`
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { fontSize: 20 } })}
                      </Box>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 0.5,
                            color: 'text.primary',
                            fontSize: '0.8rem',
                            display: 'block'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.3,
                            fontSize: '0.7rem',
                            display: 'block'
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Box>

            {/* Mobile version - show features below image */}
            <Grid item xs={12} sx={{ display: { xs: 'block', lg: 'none' } }}>
              <Grid container spacing={2}>
                {[
                  {
                    icon: <StarIcon />,
                    title: 'Peste 25 de ani de excelență',
                    description: 'Suntem lideri pe piața românească cu experiență vastă în materiale ceramice premium.',
                    color: '#FFD700',
                    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                  },
                  {
                    icon: <PaletteIcon />,
                    title: 'Colecții exclusive din Italia și Spania',
                    description: 'Colaborăm cu producători renumiți pentru design-uri unice și tendințe actuale.',
                    color: '#E91E63',
                    gradient: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)'
                  },
                  {
                    icon: <LocalShippingIcon />,
                    title: 'Livrare rapidă și sigură',
                    description: 'Transport profesional în toată țara cu manipulare atentă a produselor.',
                    color: '#2196F3',
                    gradient: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)'
                  },
                  {
                    icon: <VerifiedUserIcon />,
                    title: 'Garanție și certificare',
                    description: 'Toate produsele sunt certificate CE și beneficiază de garanție extinsă.',
                    color: '#FF6B35',
                    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
                  }
                ].map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                          borderColor: 'transparent',
                          '& .feature-icon': {
                            transform: 'rotate(10deg) scale(1.1)'
                          }
                        }
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={1.5}>
                        <Box
                          className="feature-icon"
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: feature.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            flexShrink: 0,
                            transition: 'transform 0.3s ease',
                            boxShadow: `0 4px 12px ${feature.color}40`
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { fontSize: 24 } })}
                        </Box>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              mb: 0.5,
                              color: 'text.primary',
                              fontSize: '0.9rem'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{
                              color: 'text.secondary',
                              lineHeight: 1.4,
                              fontSize: '0.75rem',
                              display: 'block'
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
        </Container>
      </Box>

      {/* Social Media Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          backgroundColor: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700,
              mb: 6,
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'text.primary'
            }}
          >
            Ne găsești și pe Social Media
          </Typography>

          <Stack 
            direction="row" 
            spacing={6} 
            sx={{ 
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* Facebook */}
            <Box
              component="a"
              href="https://facebook.com/promac.ro"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: '50%',
                background: '#1877F2',
                color: 'white',
                fontSize: { xs: 28, md: 36 },
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(24, 119, 242, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) rotate(5deg) scale(1.1)',
                  boxShadow: '0 12px 40px rgba(24, 119, 242, 0.4)',
                  background: '#166FE5'
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </Box>

            {/* Instagram */}
            <Box
              component="a"
              href="https://instagram.com/promac.ro"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                color: 'white',
                fontSize: { xs: 28, md: 36 },
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(225, 48, 108, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) rotate(-5deg) scale(1.1)',
                  boxShadow: '0 12px 40px rgba(225, 48, 108, 0.4)',
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </Box>

            {/* YouTube */}
            <Box
              component="a"
              href="https://youtube.com/@promac"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: '50%',
                background: '#FF0000',
                color: 'white',
                fontSize: { xs: 28, md: 36 },
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) rotate(5deg) scale(1.1)',
                  boxShadow: '0 12px 40px rgba(255, 0, 0, 0.4)',
                  background: '#E60000'
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </Box>

            {/* TikTok */}
            <Box
              component="a"
              href="https://tiktok.com/@promac.ro"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 50, md: 70 },
                height: { xs: 50, md: 70 },
                borderRadius: '50%',
                background: '#000000',
                color: 'white',
                fontSize: { xs: 28, md: 36 },
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px) rotate(-5deg) scale(1.1)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                  background: '#1a1a1a'
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </Box>
          </Stack>
        </Container>
      </Box>

    </Box>
  )
}

export default HomePage