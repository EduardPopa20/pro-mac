import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Stack,
  CircularProgress
} from '@mui/material'
import FaiantaIcon from '../components/icons/FaiantaIcon'
import GresieIcon from '../components/icons/GresieIcon'
import ParchetIcon from '../components/icons/ParchetIcon'
import RiflajeIcon from '../components/icons/RiflajeIcon'
import type { ProductCalculatorType } from '../types/calculator'
import SimpleCalculatorForm from '../components/calculator/SimpleCalculatorForm'
import { useAdminPageLoader } from '../hooks/useAdminPageLoader'

interface CalculatorTab {
  id: ProductCalculatorType
  label: string
  icon: React.ReactNode
}

// Culori consistente cu pagina Categories
const getCategoryColors = (category: ProductCalculatorType) => {
  const colorMap = {
    'faianta': { 
      bgColor: '#E3F2FD', 
      iconColor: '#1976D2',
      hoverColor: '#BBDEFB'
    },
    'gresie': { 
      bgColor: '#F3E5F5', 
      iconColor: '#7B1FA2',
      hoverColor: '#E1BEE7'
    },
    'parchet': { 
      bgColor: '#FFF3E0', 
      iconColor: '#F57C00',
      hoverColor: '#FFE0B2'
    },
    'riflaje': { 
      bgColor: '#E8F5E8', 
      iconColor: '#388E3C',
      hoverColor: '#C8E6C9'
    }
  }
  return colorMap[category]
}

const getCalculatorTabs = (activeTab: ProductCalculatorType): CalculatorTab[] => [
  {
    id: 'gresie',
    label: 'Gresie',
    icon: <GresieIcon size={32} color={activeTab === 'gresie' ? 'white' : getCategoryColors('gresie').iconColor} />
  },
  {
    id: 'faianta', 
    label: 'Faianță',
    icon: <FaiantaIcon size={32} color={activeTab === 'faianta' ? 'white' : getCategoryColors('faianta').iconColor} />
  },
  {
    id: 'parchet',
    label: 'Parchet',
    icon: <ParchetIcon size={32} color={activeTab === 'parchet' ? 'white' : getCategoryColors('parchet').iconColor} />
  },
  {
    id: 'riflaje',
    label: 'Riflaje',
    icon: <RiflajeIcon size={32} color={activeTab === 'riflaje' ? 'white' : getCategoryColors('riflaje').iconColor} />
  }
]

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<ProductCalculatorType>('gresie')
  const [selectOpen, setSelectOpen] = useState(false)
  const calculatorTabs = getCalculatorTabs(activeTab)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // xs screens (< 600px)

  // Add skeleton loading to prevent content flash
  const { showLoader } = useAdminPageLoader({
    minLoadTime: 800,
    dependencies: [calculatorTabs, activeTab],
    isLoading: false
  })
  
  // Handle select change with proper focus management
  const handleSelectChange = (event: { target: { value: string } }) => {
    setActiveTab(event.target.value as ProductCalculatorType)
    setSelectOpen(false)
    // Allow focus to return to the select trigger properly
    setTimeout(() => {
      const firstInput = document.querySelector('input[type="number"]') as HTMLInputElement
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  }

  // Show skeleton loading during initial render
  if (showLoader) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton variant="text" width={50} height={20} />
            <Typography color="text.secondary">›</Typography>
            <Skeleton variant="text" width={100} height={20} />
          </Stack>
        </Box>

        {/* Title Skeleton */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Skeleton variant="text" width={400} height={48} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width={600} height={24} sx={{ mx: 'auto' }} />
        </Box>

        {/* Calculator Paper Skeleton */}
        <Paper sx={{
          width: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'grey.200',
          p: 3
        }}>
          {/* Tabs/Select Skeleton */}
          <Box sx={{ mb: 3 }}>
            {isMobile ? (
              <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            ) : (
              <Stack direction="row" spacing={1}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={120}
                    height={48}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Form Skeleton */}
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link href="/" color="inherit" sx={{ textDecoration: 'none' }}>
            Acasă
          </Link>
          <Typography color="text.primary">Calculatoare</Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Title */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            mb: 2, 
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Calculatoare Materiale
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Calculați cantitatea necesară de materiale pentru proiectul dumneavoastră
        </Typography>
      </Box>

      {/* Calculator Tabs - Responsive */}
      <Paper 
        sx={{ 
          width: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        {/* Mobile View - Dropdown Select */}
        {isMobile ? (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <FormControl fullWidth>
              <InputLabel id="calculator-select-label">Selectează Calculatorul</InputLabel>
              <Select
                labelId="calculator-select-label"
                value={activeTab}
                label="Selectează Calculatorul"
                open={selectOpen}
                onOpen={() => setSelectOpen(true)}
                onClose={() => setSelectOpen(false)}
                onChange={handleSelectChange}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      zIndex: 1300,
                    },
                  },
                  // Prevent backdrop from interfering with focus
                  BackdropProps: {
                    invisible: true,
                  },
                  // Better focus management
                  disableAutoFocus: true,
                  disableEnforceFocus: true,
                  disableRestoreFocus: true,
                }}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                {calculatorTabs.map((tab) => (
                  <MenuItem 
                    key={tab.id} 
                    value={tab.id}
                    onClick={() => setSelectOpen(false)}
                    sx={{
                      '&:focus': {
                        backgroundColor: 'action.hover',
                        outline: 'none',
                      },
                      '&.Mui-selected': {
                        backgroundColor: getCategoryColors(tab.id).bgColor,
                        color: getCategoryColors(tab.id).iconColor,
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {React.cloneElement(tab.icon as React.ReactElement, { 
                        size: 24,
                        color: activeTab === tab.id ? getCategoryColors(tab.id).iconColor : getCategoryColors(tab.id).iconColor
                      })}
                      <Typography>{tab.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          /* Desktop/Tablet View - Tabs */
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            scrollButtons={false}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 64, md: 80 },
                flexDirection: 'column',
                gap: 1,
                borderRadius: '12px 12px 0 0',
                transition: 'all 0.3s ease',
                py: { xs: 1, md: 2 },
                // Hover și selected vor fi gestionate individual pe fiecare tab
              }
            }}
          >
            {calculatorTabs.map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={tab.label}
                icon={tab.icon}
                sx={{
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  color: activeTab === tab.id ? 'white' : getCategoryColors(tab.id).iconColor,
                  '&.Mui-selected': {
                    backgroundColor: `${getCategoryColors(tab.id).iconColor} !important`,
                    color: 'white !important',
                    '&:hover': {
                      backgroundColor: `${getCategoryColors(tab.id).iconColor} !important`,
                    }
                  },
                  '&:hover:not(.Mui-selected)': {
                    backgroundColor: getCategoryColors(tab.id).hoverColor,
                    color: getCategoryColors(tab.id).iconColor,
                  }
                }}
              />
            ))}
          </Tabs>
        )}

        {/* Calculator Form */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <SimpleCalculatorForm calculatorType={activeTab} />
        </Box>
      </Paper>
    </Container>
  )
}