import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Save } from '@mui/icons-material'
import EnhancedProductForm from '../../../components/admin/EnhancedProductFormFixed'
import AdminPageLoader from '../../../components/admin/AdminPageLoader'
import { useProductStore } from '../../../stores/products'
import { showSuccessAlert, showErrorAlert } from '../../../stores/globalAlert'
import { useAdminEditLoader } from '../../../hooks/useAdminPageLoader'
import { supabase } from '../../../lib/supabase'
import type { Product } from '../../../types'

const FaiantaEdit: React.FC = () => {
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
          console.log('Successfully deleted old image:', storagePath)
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
    
    // Faianta-specific properties
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
    image_url: ''
  })

  useEffect(() => {
    if (productSlug && products.length === 0) {
      fetchProducts()
    }
  }, [productSlug, products.length, fetchProducts])

  // Fetch product by slug directly from database if not found in loaded products
  useEffect(() => {
    const findProduct = async () => {
      if (!productSlug) return

      // First try to find in loaded products
      if (products.length > 0) {
        const foundProduct = products.find(p => p.slug === productSlug)
        if (foundProduct) {
          // Also validate it's a faianta product
          const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', 'faianta')
            .single()

          if (categories && foundProduct.category_id === categories.id) {
            setProduct(foundProduct)
            return
          }
        }
      }

      // If not found in products array, fetch directly from database
      try {
        console.log('Fetching product by slug:', productSlug)
        
        const { data: productData, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('slug', productSlug)
          .single()

        if (error) {
          console.error('Error fetching product:', error)
          return
        }

        if (productData) {
          console.log('Found product:', productData)
          
          // Validate it's a faianta product
          if (productData.category?.slug !== 'faianta') {
            console.error('Product is not of type faianta:', productData.category?.slug)
            return
          }
          
          setProduct(productData)
        }
      } catch (error) {
        console.error('Error in findProduct:', error)
      }
    }

    findProduct()
  }, [productSlug, products])

  // Set up form data when product is found
  useEffect(() => {
    if (product) {
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        brand: product.brand || '',
        product_code: product.product_code || '',
        // sku: product.sku || '', // Removed - not used
        dimensions: product.dimensions || '',
        material: product.material || 'Ceramică',
        finish: product.finish || '',
        color: product.color || '',
        usage_area: product.usage_area || '',
        thickness: product.thickness || null,
        surface_finish: product.surface_finish || '',
        texture: product.texture || '',
        quality_grade: product.quality_grade || 1,
        weight_per_box: product.weight_per_box || null,
        area_per_box: product.area_per_box || null,
        tiles_per_box: product.tiles_per_box || null,
        origin_country: product.origin_country || '',
        is_rectified: product.is_rectified || false,
        is_frost_resistant: product.is_frost_resistant || false,
        is_floor_heating_compatible: product.is_floor_heating_compatible || false,
        suitable_for_walls: product.suitable_for_walls !== false, // Default true for faianta
        suitable_for_floors: product.suitable_for_floors || false,
        suitable_for_exterior: product.suitable_for_exterior || false,
        suitable_for_commercial: product.suitable_for_commercial || false,
        stock_quantity: product.stock_quantity || 0,
        standard_price: product.standard_price || 0,
        special_price: product.special_price || 0,
        price_unit: product.price_unit || 'mp',
        stock_status: product.stock_status || 'available',
        is_featured: product.is_featured || false,
        image_url: product.image_url || ''
      })
    }
  }, [product])

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
      
      // Show success alert
      showSuccessAlert(
        `Produsul "${productForm.name}" a fost actualizat cu succes.`,
        'Salvare reușită'
      )
      
      // Navigate back to faianta category page
      navigate('/admin/categorii_produse/faianta')
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

  // Use the admin loader to prevent content flashing
  const { showLoader } = useAdminEditLoader(
    loading,
    product,
    productForm,
    1200 // Longer load time for edit pages
  )

  if (showLoader) {
    return (
      <AdminPageLoader
        title="Se încarcă produsul pentru editare..."
        showSkeletons={true}
        skeletonCount={2}
        showBreadcrumb={true}
      />
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
        currentImagePath={productForm.image_url}
        onImageUpload={handleImageUpload}
        onImageRemove={() => setProductForm(prev => ({ ...prev, image_url: '' }))}
        removeFromStorage={false} // Only remove from state, not storage until save
      />
    </Container>
  )
}

export default FaiantaEdit