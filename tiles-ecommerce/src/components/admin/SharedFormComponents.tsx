import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider
} from '@mui/material'

// Shared FormSection component to prevent re-creation on every render
export const FormSection: React.FC<{
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | string
  theme?: any
}> = ({ icon, title, children, color = 'primary', theme }) => (
  <Paper 
    elevation={2} 
    sx={{ 
      p: 3, 
      border: `1px solid`,
      borderColor: `${color}.light`,
      borderRadius: 2,
      '&:hover': {
        borderColor: `${color}.main`,
        boxShadow: theme?.shadows?.[4] || 4
      },
      transition: theme?.transitions?.create?.(['border-color', 'box-shadow']) || 'all 0.3s ease'
    }}
  >
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Box 
        sx={{ 
          p: 1.5, 
          borderRadius: '50%', 
          backgroundColor: `${color}.light`,
          color: `${color}.contrastText`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 700,
          color: `${color}.main`,
          letterSpacing: '-0.02em'
        }}
      >
        {title}
      </Typography>
    </Box>
    <Divider sx={{ mb: 3, borderColor: `${color}.light` }} />
    {children}
  </Paper>
)

// Shared FormField component to prevent re-creation on every render
export const FormField: React.FC<{
  label: string
  required?: boolean
  helper?: string
  children: React.ReactNode
}> = ({ label, required, helper, children }) => (
  <Box>
    <Typography 
      variant="subtitle1" 
      gutterBottom 
      sx={{ 
        fontWeight: 600, 
        mb: 1,
        color: 'text.primary'
      }}
    >
      {label}
      {required && (
        <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
          *
        </Typography>
      )}
    </Typography>
    {children}
    {helper && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {helper}
      </Typography>
    )}
  </Box>
)