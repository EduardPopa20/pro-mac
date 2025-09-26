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
import EnhancedProductForm from '../../../components/admin/EnhancedProductFormFixed'
import { useProductStore } from '../../../stores/products'
import { showSuccessAlert, showErrorAlert } from '../../../stores/globalAlert'
import { supabase } from '../../../lib/supabase'
import type { Product } from '../../../types'

const GresieEdit: React.FC = () => {
  const { productSlug } = useParams<{ productSlug: string }>()
  const navigate = useNavigate()
  const { products, loading, error, updateProduct, fetchProducts } = useProductStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Handle image upload with cleanup of old image
  const handleImageUpload = async (imagePath: string) => {
    try {
      // Clean up old image if exists
      if (productForm.image_url) {
        await cleanupOldImage(productForm.image_url)
      }
      
      // Get the public URL and store it
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(imagePath)
      
      setProductForm(prev => ({
        ...prev,
        image_url: data.publicUrl // Store the full public URL in image_url
      }))
      
      // Show success message for image upload
      showSuccessAlert(
        'Imaginea a fost încărcată cu succes și va fi vizibilă după salvarea produsului.',
        'Imagine încărcată'
      )
    } catch (error) {
      console.error('Error in image upload process:', error)
      showErrorAlert(
        'A apărut o eroare la procesarea imaginii. Imaginea nouă a fost încărcată dar cea veche nu a putut fi ștearsă.',
        'Avertisment procesare imagine'
      )
    }
  }
  
  // Helper function to clean up old images
  const cleanupOldImage = async (imageUrl: string) => {
    if (!imageUrl) return
    
    try {
      // Extract the storage path from the full URL
      // URL format: https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/filename.jpg
      const urlParts = imageUrl.split('/storage/v1/object/public/product-images/')
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]
        
        // Delete the old image from storage
        const { error } = await supabase.storage
          .from('product-images')
          .remove([storagePath])
          
        if (error) {
          console.warn('Could not delete old image:', error)
        } else {
          // Successfully deleted old image
        }
      }
    } catch (error) {
      console.warn('Error cleaning up old image:', error)
    }
  }
  const [productForm, setProductForm] = useState({
    // Basic Info
    name: '',
    description: '',
    price: 0,
    brand: '',
    product_code: '',
    // sku: '', // Removed - not used
    
    // Gresie-specific properties
    dimensions: '',
    material: 'Ceramică',
    finish: '',
    color: '',
    usage_area: '',
    
    // Technical specifications
    thickness: null,
    surface_finish: '',
    texture: '',
    quality_grade: 1,
    
    // Physical properties
    weight_per_box: null,
    area_per_box: null,
    tiles_per_box: null,
    origin_country: '',
    
    // Technical capabilities
    is_rectified: false,
    is_frost_resistant: false,
    is_floor_heating_compatible: false,
    
    // Suitability (Gresie is primarily for floors but can be used on walls)
    suitable_for_walls: true,
    suitable_for_floors: true,
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
    is_on_sale: false,
    
    // Images
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
          // sku: foundProduct.sku || '', // Removed - not used
          dimensions: foundProduct.dimensions || '',
          material: foundProduct.material || 'Ceramică',
          finish: foundProduct.finish || '',
          color: foundProduct.color || '',
          usage_area: foundProduct.usage_area || '',
          thickness: foundProduct.thickness || null,
          surface_finish: foundProduct.surface_finish || '',
          texture: foundProduct.texture || '',
          quality_grade: foundProduct.quality_grade || 1,
          weight_per_box: foundProduct.weight_per_box || null,
          area_per_box: foundProduct.area_per_box || null,
          tiles_per_box: foundProduct.tiles_per_box || null,
          origin_country: foundProduct.origin_country || '',
          is_rectified: foundProduct.is_rectified || false,
          is_frost_resistant: foundProduct.is_frost_resistant || false,
          is_floor_heating_compatible: foundProduct.is_floor_heating_compatible || false,
          suitable_for_walls: foundProduct.suitable_for_walls !== false,
          suitable_for_floors: foundProduct.suitable_for_floors !== false, // Default true for gresie
          suitable_for_exterior: foundProduct.suitable_for_exterior || false,
          suitable_for_commercial: foundProduct.suitable_for_commercial || false,
          stock_quantity: foundProduct.stock_quantity || 0,
          standard_price: foundProduct.standard_price || 0,
          special_price: foundProduct.special_price || 0,
          price_unit: foundProduct.price_unit || 'mp',
          stock_status: foundProduct.stock_status || 'available',
          is_featured: foundProduct.is_featured || false,
          is_on_sale: foundProduct.is_on_sale || false,
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
        // Force category-specific constraints for Gresie
        suitable_for_floors: true, // Gresie is always suitable for floors
        material: productForm.material || 'Ceramică'
      })
      
      // Show success alert
      showSuccessAlert(
        `Produsul "${productForm.name}" a fost actualizat cu succes.`,
        'Salvare reușită'
      )
      
      // Navigate back to gresie category page
      navigate('/admin/categorii_produse/gresie')
    } catch (error) {
      console.error('Error saving product:', error)
      showErrorAlert(
        'A apărut o eroare la salvarea produsului. Vă rugăm să încercați din nou.',
        'Eroare la salvare'
      )
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
          Produsul nu a fost găsit sau nu este de tip gresie.
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
            Editare Gresie
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Editează proprietățile specifice pentru gresia: {product.name}
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

      {/* Enhanced Product Form - Gresie specific */}
      <EnhancedProductForm
        productForm={productForm}
        setProductForm={setProductForm}
        categoryType="gresie"
        hideCategories={true} // Hide category selector since this is gresie-specific
        currentImagePath={productForm.image_url}
        onImageUpload={handleImageUpload}
        onImageRemove={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
        removeFromStorage={false} // Only remove from state, not storage until save
      />
    </Container>
  )
}

export default GresieEdit