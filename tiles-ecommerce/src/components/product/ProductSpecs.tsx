import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Collapse,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Cancel,
  Info
} from '@mui/icons-material'
import type { Product } from '../../types'

interface ProductSpecsProps {
  product: Product
  categorySlug?: string
}

interface SpecItem {
  label: string
  value: string | number | boolean
  unit?: string
  priority?: 'high' | 'medium' | 'low' // high = always show, medium = show in preview
  type?: 'text' | 'boolean' | 'number'
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ product, categorySlug }) => {
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Map product data to specifications based on category
  const getSpecifications = (): SpecItem[] => {
    const specs: SpecItem[] = []

    // Add brand (always high priority)
    if (product.brand) {
      specs.push({ label: 'Brand', value: product.brand, priority: 'high', type: 'text' })
    }

    // Category-specific specifications
    switch (categorySlug) {
      case 'faianta':
      case 'gresie':
        // Tiles specifications
        if (product.thickness) {
          specs.push({ label: 'Grosime', value: product.thickness, unit: 'mm', priority: 'high', type: 'number' })
        }
        if (product.surface_finish) {
          specs.push({ label: 'Finisaj suprafață', value: product.surface_finish, priority: 'high', type: 'text' })
        }
        if (product.dimensions) {
          specs.push({ label: 'Dimensiuni', value: product.dimensions, priority: 'medium', type: 'text' })
        }
        if (product.texture) {
          specs.push({ label: 'Textură', value: product.texture, priority: 'medium', type: 'text' })
        }
        if (product.quality_grade) {
          specs.push({ label: 'Clasa de calitate', value: `Clasa ${product.quality_grade}`, priority: 'medium', type: 'text' })
        }
        if (product.suitable_for_walls !== undefined) {
          specs.push({ label: 'Potrivit pentru pereți', value: product.suitable_for_walls, priority: 'low', type: 'boolean' })
        }
        if (product.suitable_for_floors !== undefined) {
          specs.push({ label: 'Potrivit pentru podele', value: product.suitable_for_floors, priority: 'low', type: 'boolean' })
        }
        if (product.is_frost_resistant !== undefined) {
          specs.push({ label: 'Rezistent la îngheț', value: product.is_frost_resistant, priority: 'low', type: 'boolean' })
        }
        if (product.is_rectified !== undefined) {
          specs.push({ label: 'Rectificat', value: product.is_rectified, priority: 'low', type: 'boolean' })
        }
        break

      case 'parchet':
        // Flooring specifications  
        if (product.thickness) {
          specs.push({ label: 'Grosime', value: product.thickness, unit: 'mm', priority: 'high', type: 'number' })
        }
        if (product.material) {
          specs.push({ label: 'Material', value: product.material, priority: 'high', type: 'text' })
        }
        if (product.dimensions) {
          specs.push({ label: 'Dimensiuni', value: product.dimensions, priority: 'medium', type: 'text' })
        }
        if (product.finish) {
          specs.push({ label: 'Finisaj', value: product.finish, priority: 'medium', type: 'text' })
        }
        if (product.is_floor_heating_compatible !== undefined) {
          specs.push({ label: 'Compatibil încălzire în pardoseală', value: product.is_floor_heating_compatible, priority: 'low', type: 'boolean' })
        }
        break

      case 'riflaj':
        // Molding/trim specifications
        if (product.dimensions) {
          specs.push({ label: 'Dimensiuni', value: product.dimensions, priority: 'high', type: 'text' })
        }
        if (product.material) {
          specs.push({ label: 'Material', value: product.material, priority: 'high', type: 'text' })
        }
        if (product.finish) {
          specs.push({ label: 'Finisaj', value: product.finish, priority: 'medium', type: 'text' })
        }
        break

      default:
        // Generic specifications
        if (product.dimensions) {
          specs.push({ label: 'Dimensiuni', value: product.dimensions, priority: 'high', type: 'text' })
        }
        if (product.material) {
          specs.push({ label: 'Material', value: product.material, priority: 'high', type: 'text' })
        }
        if (product.finish) {
          specs.push({ label: 'Finisaj', value: product.finish, priority: 'medium', type: 'text' })
        }
    }

    // Common specifications for all categories
    if (product.color) {
      specs.push({ label: 'Culoare', value: product.color, priority: 'medium', type: 'text' })
    }
    if (product.origin_country) {
      specs.push({ label: 'Țara de origine', value: product.origin_country, priority: 'low', type: 'text' })
    }
    if (product.area_per_box) {
      specs.push({ label: 'Suprafață per cutie', value: product.area_per_box, unit: 'm²', priority: 'low', type: 'number' })
    }
    if (product.tiles_per_box) {
      specs.push({ label: 'Bucăți per cutie', value: product.tiles_per_box, priority: 'low', type: 'number' })
    }
    if (product.weight_per_box) {
      specs.push({ label: 'Greutate per cutie', value: product.weight_per_box, unit: 'kg', priority: 'low', type: 'number' })
    }
    if (product.product_code) {
      specs.push({ label: 'Cod produs', value: product.product_code, priority: 'low', type: 'text' })
    }

    return specs
  }

  const specifications = getSpecifications()
  
  // Get preview specifications (high and medium priority) - first 3 specs  
  const previewSpecs = specifications.slice(0, 3)
  
  // Show only preview specs initially, all specs when expanded
  const displaySpecs = expanded ? specifications : previewSpecs

  const formatValue = (spec: SpecItem): React.ReactNode => {
    if (spec.type === 'boolean') {
      return spec.value ? 'Da' : 'Nu'
    }

    if (spec.type === 'number' && spec.unit) {
      return `${spec.value} ${spec.unit}`
    }

    return spec.value
  }

  if (specifications.length === 0) {
    return null
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Preview Specifications */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: 'text.primary',
          fontSize: { xs: '1rem', md: '1.125rem' }
        }}
      >
        Specificații tehnice
      </Typography>

      {/* Single Expandable Specifications Table */}
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          mb: 2,
          '& .MuiTable-root': {
            '& .MuiTableRow-root:last-child .MuiTableCell-root': {
              borderBottom: 0
            }
          }
        }}
      >
        <Table size={isMobile ? 'small' : 'medium'} aria-label="Specificații produs">
          <TableBody>
            {displaySpecs.map((spec, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: 'text.secondary',
                    width: '50%',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    py: { xs: 1, md: 1.5 }
                  }}
                >
                  {spec.label}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    py: { xs: 1, md: 1.5 }
                  }}
                >
                  {formatValue(spec)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Expand/Collapse Button - Only show if there are more specs */}
      {specifications.length > previewSpecs.length && (
        <Button
          variant="text"
          startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="product-specs-table"
          aria-describedby="expand-specs-description"
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText'
            },
            borderRadius: 2,
            px: 2,
            py: 1,
            minHeight: { xs: 44, md: 36 }
          }}
        >
          {expanded ? 'Afișează mai puține specificații' : 'Afișează mai multe specificații'}
        </Button>
      )}

      {/* Hidden description for screen readers */}
      <div id="expand-specs-description" style={{ position: 'absolute', left: '-10000px' }}>
        {expanded 
          ? 'Butonul va ascunde specificațiile tehnice suplimentare' 
          : 'Butonul va afișa toate specificațiile tehnice ale produsului în format tabelar'
        }
      </div>
    </Box>
  )
}

export default ProductSpecs