import React from 'react'
import {
  Skeleton,
  Box,
  Container,
  Stack,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Typography
} from '@mui/material'

// Page-level loading skeleton
export const PageLoadingSkeleton: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={60} height={24} />
          <Skeleton variant="text" width={8} height={24} />
          <Skeleton variant="text" width={100} height={24} />
        </Stack>
      </Box>

      {/* Main content skeleton */}
      <Stack spacing={4}>
        {/* Title */}
        <Skeleton 
          variant="text" 
          width={isMobile ? "80%" : "40%"} 
          height={isMobile ? 48 : 56} 
          sx={{ fontSize: '2.5rem' }} 
        />

        {/* Content grid */}
        <Grid container spacing={3}>
          {Array.from({ length: isMobile ? 2 : 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Additional content blocks */}
        <Stack spacing={2}>
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="95%" height={24} />
          <Skeleton variant="text" width="85%" height={24} />
        </Stack>
      </Stack>
    </Container>
  )
}

// Search loading skeleton
export const SearchLoadingSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    {[1, 2, 3].map((index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Skeleton variant="rectangular" width={60} height={60} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="70%" height={24} />
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="30%" height={20} />
        </Box>
      </Box>
    ))}
  </Box>
)

// Form loading skeleton
export const FormLoadingSkeleton: React.FC = () => (
  <Stack spacing={3}>
    <Skeleton variant="rectangular" height={56} />
    <Skeleton variant="rectangular" height={56} />
    <Skeleton variant="rectangular" height={120} />
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Skeleton variant="rectangular" width={100} height={44} />
      <Skeleton variant="rectangular" width={120} height={44} />
    </Box>
  </Stack>
)

// Navigation loading skeleton
export const NavLoadingSkeleton: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {['Acasă', 'Produse', 'Showroomuri', 'Contact'].map((_, index) => (
            <Skeleton key={index} variant="text" width="60%" height={44} />
          ))}
        </Stack>
      </Box>
    )
  }

  return (
    <Stack direction="row" spacing={3}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="text" width={80} height={40} />
      ))}
    </Stack>
  )
}

// Inline loading indicator for buttons
export const ButtonLoadingState: React.FC<{ 
  loading: boolean
  children: React.ReactNode
  loadingText?: string
}> = ({ 
  loading, 
  children, 
  loadingText = "Se încarcă..." 
}) => {
  if (!loading) return <>{children}</>
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Skeleton variant="circular" width={16} height={16} />
      <Typography variant="inherit">{loadingText}</Typography>
    </Stack>
  )
}

// Generic content loading
export const ContentLoadingSkeleton: React.FC<{
  lines?: number
  showImage?: boolean
  showButton?: boolean
}> = ({ 
  lines = 3, 
  showImage = false, 
  showButton = false 
}) => (
  <Stack spacing={2}>
    {showImage && (
      <Skeleton variant="rectangular" width="100%" height={240} />
    )}
    
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index}
        variant="text" 
        width={index === lines - 1 ? "70%" : "100%"} 
        height={24} 
      />
    ))}
    
    {showButton && (
      <Box sx={{ pt: 2 }}>
        <Skeleton variant="rectangular" width={120} height={44} />
      </Box>
    )}
  </Stack>
)

export default {
  PageLoadingSkeleton,
  SearchLoadingSkeleton,
  FormLoadingSkeleton,
  NavLoadingSkeleton,
  ButtonLoadingState,
  ContentLoadingSkeleton
}