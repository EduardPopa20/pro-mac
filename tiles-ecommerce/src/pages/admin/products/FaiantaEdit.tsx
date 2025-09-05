import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Save } from '@mui/icons-material'
import EnhancedProductForm from '../../../components/admin/EnhancedProductForm'
import { useProductStore } from '../../../stores/products'
import type { Product } from '../../../types'

const FaiantaEdit: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>()
  const navigate = useNavigate()
  const { products, loading, error, updateProduct, fetchProducts } = useProductStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [productForm, setProductForm] = useState({
    // Basic Info
    name: '',
    description: '',
    price: 0,
    brand: '',
    product_code: '',
    // sku: '', // Removed - not used
    
    // Faianta-specific properties
    dimensions: '',
    material: 'Ceramică',
    finish: '',
    color: '',
    usage_area: '',
    
    // Technical specifications
    thickness: 0,
    surface_finish: '',
    texture: '',
    quality_grade: 1,
    
    // Physical properties
    weight_per_box: 0,
    area_per_box: 0,
    tiles_per_box: 0,
    origin_country: '',
    
    // Technical capabilities
    is_rectified: false,
    is_frost_resistant: false,
    is_floor_heating_compatible: false,
    
    // Suitability (Faianta is primarily for walls)
    suitable_for_walls: true,
    suitable_for_floors: false,
    suitable_for_exterior: false,
    suitable_for_commercial: false,
    
    // Inventory
    stock_quantity: 0,
    standard_price: 0,
    special_price: 0,
    price_unit: 'mp',
    
    // Status
    stock_status: 'available' as const,
    is_featured: false,
    
    // Images
    image_url: '',
    image_path: ''
  })

  useEffect(() => {
    if (productSlug && products.length === 0) {
      fetchProducts()
    }
  }, [productSlug, products.length, fetchProducts])

  useEffect(() => {
    if (productSlug && products.length > 0) {
      const foundProduct = products.find(p => p.slug === productSlug)
      if (foundProduct) {
        setProduct(foundProduct)
        setProductForm({
          name: foundProduct.name || '',
          description: foundProduct.description || '',
          price: foundProduct.price || 0,
          brand: foundProduct.brand || '',
          product_code: foundProduct.product_code || '',
          // sku: foundProduct.sku || '', // Removed - not used
          dimensions: foundProduct.dimensions || '',
          material: foundProduct.material || 'Ceramică',
          finish: foundProduct.finish || '',
          color: foundProduct.color || '',
          usage_area: foundProduct.usage_area || '',
          thickness: foundProduct.thickness || 0,
          surface_finish: foundProduct.surface_finish || '',
          texture: foundProduct.texture || '',
          quality_grade: foundProduct.quality_grade || 1,
          weight_per_box: foundProduct.weight_per_box || 0,
          area_per_box: foundProduct.area_per_box || 0,
          tiles_per_box: foundProduct.tiles_per_box || 0,
          origin_country: foundProduct.origin_country || '',
          is_rectified: foundProduct.is_rectified || false,
          is_frost_resistant: foundProduct.is_frost_resistant || false,
          is_floor_heating_compatible: foundProduct.is_floor_heating_compatible || false,
          suitable_for_walls: foundProduct.suitable_for_walls !== false, // Default true for faianta
          suitable_for_floors: foundProduct.suitable_for_floors || false,
          suitable_for_exterior: foundProduct.suitable_for_exterior || false,
          suitable_for_commercial: foundProduct.suitable_for_commercial || false,
          stock_quantity: foundProduct.stock_quantity || 0,
          standard_price: foundProduct.standard_price || 0,
          special_price: foundProduct.special_price || 0,
          price_unit: foundProduct.price_unit || 'mp',
          stock_status: foundProduct.stock_status || 'available',
          is_featured: foundProduct.is_featured || false,
          image_url: foundProduct.image_url || '',
          image_path: foundProduct.image_path || ''
        })
      }
    }
  }, [productSlug, products])

  const handleSave = async () => {
    if (!product) return

    setSaving(true)
    try {
      await updateProduct(product.id, {
        ...productForm,
        // Force category-specific constraints for Faianta
        suitable_for_walls: true, // Faianta is always suitable for walls
        material: productForm.material || 'Ceramică'
      })
      
      navigate('/admin/categorii_produse')
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading && !product) {
    return (
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
          height: '100%'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={50} />
          <Typography color="text.secondary">Se încarcă produsul...</Typography>
        </Stack>
      </Box>
    )
  }

  if (!product) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          Produsul nu a fost găsit sau nu este de tip faianță.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs>
          <Link 
            href="/admin" 
            color="inherit" 
            sx={{ textDecoration: 'none' }}
          >
            Admin
          </Link>
          <Link 
            href="/admin/categorii_produse" 
            color="inherit" 
            sx={{ textDecoration: 'none' }}
          >
            Categorii Produse
          </Link>
          <Typography color="text.primary">
            Editare {product.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={productForm.stock_status}
            label="Status"
            onChange={(e) => setProductForm(prev => ({ 
              ...prev, 
              stock_status: e.target.value as 'available' | 'out_of_stock' | 'discontinued' 
            }))}
          >
            <MenuItem value="available">Disponibil</MenuItem>
            <MenuItem value="out_of_stock">Stoc epuizat</MenuItem>
            <MenuItem value="discontinued">Discontinuat</MenuItem>
          </Select>
        </FormControl>

        <Button
          startIcon={<Save />}
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving}
          size="large"
        >
          {saving ? 'Se salvează...' : 'Salvează Modificările'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Product Form - Faianta specific */}
      <EnhancedProductForm
        productForm={productForm}
        setProductForm={setProductForm}
        categoryType="faianta"
        hideCategories={true} // Hide category selector since this is faianta-specific
      />
    </Container>
  )
}

export default FaiantaEdit