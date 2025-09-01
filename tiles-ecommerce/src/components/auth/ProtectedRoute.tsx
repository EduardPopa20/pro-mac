import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'
import { Box, CircularProgress, Typography } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: 'admin' | 'customer'
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  redirectTo = '/auth'
}) => {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Se verifică autentificarea...
        </Typography>
      </Box>
    )
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check if user doesn't need to be authenticated (like auth page when already logged in)
  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  // Check role-based access
  if (requireRole && user && user.role !== requireRole) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        gap={2}
        textAlign="center"
      >
        <Typography variant="h4" color="error" gutterBottom>
          Acces interzis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Nu aveți permisiunile necesare pentru a accesa această pagină.
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute