import React, { useEffect } from 'react'
import { useNavigateWithScroll } from '../hooks/useNavigateWithScroll'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Fade,
  Zoom
} from '@mui/material'
import FaiantaIcon from '../components/icons/FaiantaIcon'
import GresieIcon from '../components/icons/GresieIcon'
import ParchetIcon from '../components/icons/ParchetIcon'
import RiflajeIcon from '../components/icons/RiflajeIcon'
import { useProductStore } from '../stores/products'

const Categories: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigateWithScroll()
  const { categories, fetchCategories } = useProductStore()

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Definim iconurile și culorile pentru fiecare categorie
  const categoryIcons = {
    'faianta': { 
      icon: FaiantaIcon, 
      color: '#E3F2FD', 
      iconColor: '#1976D2',
      hoverColor: '#BBDEFB'
    },
    'gresie': { 
      icon: GresieIcon, 
      color: '#F3E5F5', 
      iconColor: '#7B1FA2',
      hoverColor: '#E1BEE7'
    },
    'parchet': { 
      icon: ParchetIcon, 
      color: '#FFF3E0', 
      iconColor: '#F57C00',
      hoverColor: '#FFE0B2'
    },
    'riflaje': { 
      icon: RiflajeIcon, 
      color: '#E8F5E8', 
      iconColor: '#388E3C',
      hoverColor: '#C8E6C9'
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    navigate(`/categorii_produse/${categorySlug}`)
  }

  // Filtrăm categoriile pentru a avea cele 4 principale
  const mainCategories = categories.filter(cat => 
    ['faianta', 'gresie', 'parchet', 'riflaje'].includes(cat.slug)
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>Acasă</Link>
          <Typography color="text.primary">Categorii Produse</Typography>
        </Breadcrumbs>
      </Box>

      <Fade in timeout={800}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              mb: 2, 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Categorii Produse
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Descoperă gama noastră completă de materiale pentru construcții și amenajări
          </Typography>
        </Box>
      </Fade>

      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ justifyContent: { xs: 'center', md: 'center' } }}>
        {mainCategories.map((category, index) => {
          const categoryConfig = categoryIcons[category.slug as keyof typeof categoryIcons]
          const IconComponent = categoryConfig?.icon || FaiantaIcon

          return (
            <Grid item xs={6} sm={6} md={3} key={category.id}>
              <Zoom in timeout={600 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: categoryConfig?.color || '#F5F5F5',
                    border: '2px solid transparent',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      backgroundColor: categoryConfig?.hoverColor || '#EEEEEE',
                      borderColor: categoryConfig?.iconColor || theme.palette.primary.main,
                      boxShadow: theme.shadows[12],
                      '& .category-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      },
                      '& .category-title': {
                        color: categoryConfig?.iconColor || theme.palette.primary.main
                      }
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleCategoryClick(category.slug)}
                    sx={{
                      height: '100%',
                      p: { xs: 2, md: 3 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: { xs: 160, sm: 200, md: 250 }
                    }}
                  >
                    <Box
                      sx={{
                        mb: { xs: 2, md: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Box
                        className="category-icon"
                        sx={{ 
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComponent
                          size={isMobile ? 32 : 40}
                          color={categoryConfig?.iconColor || theme.palette.primary.main}
                        />
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      <Typography
                        className="category-title"
                        variant={isMobile ? "h6" : "h5"}
                        component="h2"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography
                        variant={isMobile ? "body2" : "body1"}
                        color="text.secondary"
                        sx={{ mb: { xs: 1.5, md: 2 } }}
                      >
                        {category.products_count || 0} produse disponibile
                      </Typography>
                      <Box
                        sx={{
                          width: { xs: 40, md: 60 },
                          height: { xs: 2, md: 3 },
                          backgroundColor: categoryConfig?.iconColor || theme.palette.primary.main,
                          borderRadius: 2,
                          mx: 'auto',
                          transition: 'width 0.3s ease',
                          '.MuiCardActionArea-root:hover &': {
                            width: { xs: 60, md: 80 }
                          }
                        }}
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Zoom>
            </Grid>
          )
        })}
      </Grid>

      {mainCategories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Se încarcă categoriile...
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default Categories