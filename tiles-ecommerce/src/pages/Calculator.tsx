import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import {
  Layers as LayersIcon,
  Straighten as StraightenIcon,
  Forest as ForestIcon,
  Architecture as ArchitectureIcon
} from '@mui/icons-material'
import type { ProductCalculatorType } from '../types/calculator'
import SimpleCalculatorForm from '../components/calculator/SimpleCalculatorForm'

interface CalculatorTab {
  id: ProductCalculatorType
  label: string
  icon: React.ReactNode
}

const calculatorTabs: CalculatorTab[] = [
  {
    id: 'gresie',
    label: 'Gresie',
    icon: <LayersIcon />
  },
  {
    id: 'faianta', 
    label: 'Faianță',
    icon: <StraightenIcon />
  },
  {
    id: 'parchet',
    label: 'Parchet',
    icon: <ForestIcon />
  },
  {
    id: 'riflaje',
    label: 'Riflaje',
    icon: <ArchitectureIcon />
  }
]

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<ProductCalculatorType>('gresie')

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
          variant="h1" 
          sx={{ 
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            mb: 2
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

      {/* Calculator Tabs */}
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
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 80,
              flexDirection: 'column',
              gap: 1,
              borderRadius: '12px 12px 0 0',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white'
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                color: 'white',
                '& .MuiSvgIcon-root': {
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))'
                }
              }
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
                color: activeTab === tab.id ? 'primary.main' : 'text.secondary'
              }}
            />
          ))}
        </Tabs>

        {/* Calculator Form */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <SimpleCalculatorForm calculatorType={activeTab} />
        </Box>
      </Paper>
    </Container>
  )
}