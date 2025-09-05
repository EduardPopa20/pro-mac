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
  Stack
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import EnhancedRiflajForm from '../../../components/admin/EnhancedRiflajForm'
import { useProductStore } from '../../../stores/products'
import type { Product } from '../../../types'

const RiflajeEdit: React.FC = () => {
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
    
    // Material & Panel Type
    panel_type: '',
    base_material: '',
    wood_species: '',
    panel_profile: '',
    
    // Technical Dimensions
    panel_thickness_mm: 0,
    panel_width_mm: 0,
    panel_length_mm: 0,
    coverage_per_panel: 0,
    panel_weight_kg: 0,
    groove_spacing_mm: 0,
    groove_depth_mm: 0,
    
    // Acoustic Properties
    acoustic_properties: '',
    acoustic_rating: '',
    acoustic_backing: '',
    
    // Surface & Mounting
    surface_finish_type: '',
    mounting_system: '',
    panel_orientation: '',
    installation_difficulty: '',
    
    // Performance & Safety
    fire_resistance_class: '',
    environmental_rating: '',
    uv_resistance: false,
    moisture_resistance: '',
    
    // Colors & Variants
    color: '',
    color_variants: '',
    finish: '',
    
    // Installation & Usage
    installation_area: '',
    usage_area: '',
    maintenance_type: '',
    
    // Standard fields
    category_id: 0,
    dimensions: '',
    material: 'Lemn',
    stock_status: 'available' as const,
    image_url: ''
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
          panel_type: (foundProduct as any).panel_type || '',
          base_material: (foundProduct as any).base_material || '',
          wood_species: (foundProduct as any).wood_species || '',
          panel_profile: (foundProduct as any).panel_profile || '',
          panel_thickness_mm: (foundProduct as any).panel_thickness_mm || 0,
          panel_width_mm: (foundProduct as any).panel_width_mm || 0,
          panel_length_mm: (foundProduct as any).panel_length_mm || 0,
          coverage_per_panel: (foundProduct as any).coverage_per_panel || 0,
          panel_weight_kg: (foundProduct as any).panel_weight_kg || 0,
          groove_spacing_mm: (foundProduct as any).groove_spacing_mm || 0,
          groove_depth_mm: (foundProduct as any).groove_depth_mm || 0,
          acoustic_properties: (foundProduct as any).acoustic_properties || '',
          acoustic_rating: (foundProduct as any).acoustic_rating || '',
          acoustic_backing: (foundProduct as any).acoustic_backing || '',
          surface_finish_type: (foundProduct as any).surface_finish_type || '',
          mounting_system: (foundProduct as any).mounting_system || '',
          panel_orientation: (foundProduct as any).panel_orientation || '',
          installation_difficulty: (foundProduct as any).installation_difficulty || '',
          fire_resistance_class: (foundProduct as any).fire_resistance_class || '',
          environmental_rating: (foundProduct as any).environmental_rating || '',
          uv_resistance: (foundProduct as any).uv_resistance || false,
          moisture_resistance: (foundProduct as any).moisture_resistance || '',
          color: foundProduct.color || '',
          color_variants: (foundProduct as any).color_variants || '',
          finish: foundProduct.finish || '',
          installation_area: (foundProduct as any).installation_area || '',
          usage_area: foundProduct.usage_area || '',
          maintenance_type: (foundProduct as any).maintenance_type || '',
          category_id: foundProduct.category_id || 0,
          dimensions: foundProduct.dimensions || '',
          material: foundProduct.material || 'Lemn',
          stock_status: foundProduct.stock_status || 'available',
          image_url: foundProduct.image_url || ''
        })
      }
    }
  }, [id, products])

  const handleSave = async () => {
    if (!product) return

    setSaving(true)
    try {
      await updateProduct(product.id, {
        ...productForm,
        // Force category-specific constraints for Riflaje
        material: productForm.material || 'Lemn'
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
          Produsul nu a fost găsit sau nu este de tip riflaj.
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/categorii_produse')}
          variant="outlined"
          color="inherit"
        >
          Înapoi
        </Button>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Editare Riflaj
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Editează proprietățile specifice pentru riflajul: {product.name}
          </Typography>
        </Box>

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

      {/* Enhanced Riflaj Form - Riflaj specific */}
      <EnhancedRiflajForm
        productForm={productForm}
        setProductForm={setProductForm}
        categoryType="riflaje"
        hideCategories={true} // Hide category selector since this is riflaj-specific
      />
    </Container>
  )
}

export default RiflajeEdit