import React from 'react'
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Stack,
  Skeleton,
  Card,
  CardContent
} from '@mui/material'

interface AdminPageLoaderProps {
  /** Title for the loading screen */
  title?: string
  /** Show skeleton cards instead of just spinner */
  showSkeletons?: boolean
  /** Number of skeleton cards to show */
  skeletonCount?: number
  /** Show breadcrumb skeleton */
  showBreadcrumb?: boolean
}

const AdminPageLoader: React.FC<AdminPageLoaderProps> = ({
  title = 'Se încarcă...',
  showSkeletons = false,
  skeletonCount = 3,
  showBreadcrumb = true
}) => {
  if (showSkeletons) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumb Skeleton */}
        {showBreadcrumb && (
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={30} />
          </Box>
        )}

        {/* Title Skeleton */}
        <Skeleton variant="text" width={300} height={50} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={500} height={25} sx={{ mb: 4 }} />

        {/* Content Skeletons */}
        <Stack spacing={3}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Card key={index} sx={{ borderRadius: 3 }}>
              <CardContent>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="text" width={150} height={28} />
                </Stack>

                {/* Form Fields */}
                <Stack spacing={3}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Skeleton variant="rounded" height={56} />
                    <Skeleton variant="rounded" height={56} />
                  </Box>
                </Stack>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Skeleton variant="rounded" width={120} height={42} />
                  <Skeleton variant="rounded" width={100} height={42} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
    )
  }

  // Simple spinner loader
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          minHeight: 'calc(100vh - 200px)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Stack alignItems="center" spacing={3}>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              fontSize: { xs: '1rem', md: '1.25rem' }
            }}
          >
            {title}
          </Typography>
        </Stack>
      </Box>
    </Container>
  )
}

export default AdminPageLoader