import { Container, Box, Typography, Grid, Card, CardContent, Breadcrumbs, Link, useTheme, useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { 
  GridOn as FaiantaIcon,
  ViewQuilt as GresieIcon,
  Layers as ParchetIcon,
  BorderStyle as RiflajeIcon
} from '@mui/icons-material'

interface CategoryItem {
  id: string
  name: string
  slug: string
  icon: React.ReactNode
  color: string
  description: string
}

const categories: CategoryItem[] = [
  {
    id: 'faianta',
    name: 'Faianță',
    slug: 'faianta',
    icon: <FaiantaIcon sx={{ fontSize: { xs: 48, md: 64 } }} />,
    color: '#2196f3',
    description: 'Plăci ceramice pentru pereți interiori'
  },
  {
    id: 'gresie',
    name: 'Gresie',
    slug: 'gresie', 
    icon: <GresieIcon sx={{ fontSize: { xs: 48, md: 64 } }} />,
    color: '#4caf50',
    description: 'Plăci ceramice pentru pardoseli'
  },
  {
    id: 'parchet',
    name: 'Parchet',
    slug: 'parchet',
    icon: <ParchetIcon sx={{ fontSize: { xs: 48, md: 64 } }} />,
    color: '#ff9800',
    description: 'Pardoseli din lemn natural și laminat'
  },
  {
    id: 'riflaje',
    name: 'Riflaje',
    slug: 'riflaje',
    icon: <RiflajeIcon sx={{ fontSize: { xs: 48, md: 64 } }} />,
    color: '#9c27b0',
    description: 'Elemente decorative și finisaje'
  }
]

const Categories = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleCategoryClick = (slug: string) => {
    navigate(`/${slug}`)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Typography color="text.primary">Categorii Produse</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Title */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          Categorii Produse
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Explorați gama noastră completă de produse pentru amenajări interioare și exterioare
        </Typography>
      </Box>

      {/* Category Grid */}
      <Grid container spacing={4}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} lg={3} key={category.id}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[12],
                  borderColor: category.color,
                  '& .category-icon': {
                    transform: 'scale(1.1) rotate(5deg)'
                  }
                }
              }}
              onClick={() => handleCategoryClick(category.slug)}
            >
              <CardContent 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 3, md: 4 },
                  minHeight: { xs: 200, md: 280 }
                }}
              >
                {/* Icon */}
                <Box
                  className="category-icon"
                  sx={{
                    color: category.color,
                    mb: 3,
                    transition: 'transform 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {category.icon}
                </Box>

                {/* Category Name */}
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    mb: 1.5,
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', md: '1.75rem' }
                  }}
                >
                  {category.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textAlign: 'center',
                    lineHeight: 1.6,
                    px: { xs: 0, md: 2 }
                  }}
                >
                  {category.description}
                </Typography>

                {/* Decorative element */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: category.color,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease',
                    '.MuiCard-root:hover &': {
                      transform: 'scaleX(1)'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom CTA Section */}
      <Box 
        sx={{ 
          mt: 8,
          p: { xs: 3, md: 6 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Nu știți ce să alegeți?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Folosiți calculatorul nostru pentru a estima cantitatea necesară de materiale
        </Typography>
        <Box
          component="button"
          onClick={() => navigate('/calculator')}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            border: 'none',
            background: theme.palette.primary.main,
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: theme.palette.primary.dark,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            }
          }}
        >
          Deschide Calculator
        </Box>
      </Box>
    </Container>
  )
}

export default Categories