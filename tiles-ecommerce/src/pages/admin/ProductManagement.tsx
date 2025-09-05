import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Visibility,
  Category as CategoryIcon,
  Image as ImageIcon,
  Inventory as ProductsIcon,
} from '@mui/icons-material'
import { useAdminProductStore } from '../../stores/products'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import ImageUpload from '../../components/common/ImageUpload'
import type { Category, Product } from '../../types'
import EnhancedProductForm from '../../components/admin/EnhancedProductForm'
import EnhancedParchetForm from '../../components/admin/EnhancedParchetForm'
import EnhancedRiflajForm from '../../components/admin/EnhancedRiflajForm'

type ViewMode = 'categories' | 'category-products' | 'add-category' | 'edit-product' | 'add-product'

const ProductManagement: React.FC = () => {
  const { 
    categories,
    products,
    loading, 
    fetchAllCategories,
    fetchAllProducts,
    fetchProductsByCategory,
    createCategory, 
    updateCategory, 
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct
  } = useAdminProductStore()
  
  const { showConfirmation } = useConfirmation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [currentImagePath, setCurrentImagePath] = useState<string>('')

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' })
  const [productForm, setProductForm] = useState({
    // Basic info
    name: '',
    description: '',
    price: '',
    category_id: null as number | null,
    
    // Basic tile properties
    dimensions: '',
    material: '',
    finish: '',
    color: '',
    usage_area: '',
    
    // Enhanced properties
    brand: '',
    product_code: '',
    sku: '',
    thickness: '',
    surface_finish: '',
    texture: '',
    quality_grade: '',
    weight_per_box: '',
    area_per_box: '',
    tiles_per_box: '',
    origin_country: '',
    
    // Technical capabilities
    is_rectified: false,
    is_frost_resistant: false,
    is_floor_heating_compatible: false,
    
    // Application areas (will be converted to array)
    application_areas: '',
    
    // Suitability
    suitable_for_walls: true,
    suitable_for_floors: true,
    suitable_for_exterior: false,
    suitable_for_commercial: false,
    
    // Pricing and inventory
    stock_quantity: '',
    standard_price: '',
    special_price: '',
    price_unit: 'mp',
    
    // Additional details
    estimated_delivery_days: '',
    installation_notes: '',
    care_instructions: '',
    
    // Parchet-specific fields
    thickness_mm: '',
    width_mm: '',
    length_mm: '',
    traffic_class: '',
    floor_type: '',
    installation_type: '',
    wood_essence: '',
    collection_name: '',
    core_material: '',
    surface_texture: '',
    surface_per_package: '',
    pieces_per_package: '',
    installation_location: '',
    is_antistatic: false,
    underfloor_heating_compatible: '',
    supplier_code: '',
    suitable_areas: '',
    physical_warranty_years: '',
    juridical_warranty_years: '',
    
    // Riflaje-specific fields
    panel_type: '',
    panel_thickness_mm: '',
    panel_width_mm: '',
    panel_length_mm: '',
    acoustic_properties: '',
    surface_finish_type: '',
    mounting_system: '',
    panel_orientation: '',
    wood_species: '',
    base_material: '',
    acoustic_rating: '',
    installation_area: '',
    panel_profile: '',
    coverage_per_panel: '',
    panel_weight_kg: '',
    groove_spacing_mm: '',
    groove_depth_mm: '',
    fire_resistance_class: '',
    environmental_rating: '',
    maintenance_type: '',
    color_variants: '',
    acoustic_backing: '',
    uv_resistance: false,
    moisture_resistance: '',
    installation_difficulty: '',
    
    // Status
    stock_status: 'available' as const
  })

  useEffect(() => {
    fetchAllCategories()
    fetchAllProducts() // Also fetch products to calculate counts
  }, [fetchAllCategories, fetchAllProducts])

  // Handle URL parameters
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug)
      if (category) {
        setSelectedCategory(category)
        fetchProductsByCategory(category.id)
        setViewMode('category-products')
      }
    } else if (!categorySlug) {
      setViewMode('categories')
      setSelectedCategory(null)
    }
  }, [categorySlug, categories, fetchProductsByCategory])

  // Get categories with product count
  const categoriesWithCount = React.useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      products_count: products.filter(p => p.category_id === cat.id).length
    }))
  }, [categories, products])

  const handleViewCategoryProducts = async (category: Category) => {
    navigate(`/admin/categorii_produse/${category.slug}`)
  }

  const handleAddCategory = () => {
    setCategoryForm({ name: '' })
    setViewMode('add-category')
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: selectedCategory?.id || null,
      dimensions: '',
      material: '',
      finish: '',
      color: '',
      usage_area: '',
      stock_status: 'available' as const
    })
    setCurrentImagePath('')
    setViewMode('add-product')
  }

  const resetProductForm = () => {
    setProductForm({
      // Basic info
      name: '',
      description: '',
      price: '',
      category_id: null,
      
      // Basic tile properties
      dimensions: '',
      material: '',
      finish: '',
      color: '',
      usage_area: '',
      
      // Enhanced properties
      brand: '',
      product_code: '',
      sku: '',
      thickness: '',
      surface_finish: '',
      texture: '',
      quality_grade: '',
      weight_per_box: '',
      area_per_box: '',
      tiles_per_box: '',
      origin_country: '',
      
      // Technical capabilities
      is_rectified: false,
      is_frost_resistant: false,
      is_floor_heating_compatible: false,
      
      // Application areas
      application_areas: '',
      
      // Suitability
      suitable_for_walls: true,
      suitable_for_floors: true,
      suitable_for_exterior: false,
      suitable_for_commercial: false,
      
      // Pricing and inventory
      stock_quantity: '',
      standard_price: '',
      special_price: '',
      price_unit: 'mp',
      
      // Additional details
      estimated_delivery_days: '',
      installation_notes: '',
      care_instructions: '',
      
      // Parchet-specific fields
      thickness_mm: '',
      width_mm: '',
      length_mm: '',
      traffic_class: '',
      floor_type: '',
      installation_type: '',
      wood_essence: '',
      collection_name: '',
      core_material: '',
      surface_texture: '',
      surface_per_package: '',
      pieces_per_package: '',
      installation_location: '',
      is_antistatic: false,
      underfloor_heating_compatible: '',
      supplier_code: '',
      suitable_areas: '',
      physical_warranty_years: '',
      juridical_warranty_years: '',
      
      // Status
      stock_status: 'available' as const
    })
    setCurrentImagePath('')
    setEditingProduct(null)
  }

  const handleEditProduct = (product: Product) => {
    // Get the category to determine which specialized route to use
    const category = categories.find(cat => cat.id === product.category_id)
    if (!category) {
      console.error('Category not found for product:', product)
      return
    }

    // Navigate to the appropriate specialized editing route
    const categorySlug = category.slug
    let route = ''
    
    switch (categorySlug) {
      case 'faianta':
        route = `/admin/produse/faianta/${product.slug}/editare`
        break
      case 'gresie':
        route = `/admin/produse/gresie/${product.slug}/editare`
        break
      case 'parchet':
        route = `/admin/produse/parchet/${product.slug}/editare`
        break
      case 'riflaje':
        route = `/admin/produse/riflaje/${product.slug}/editare`
        break
      default:
        // Fallback to old editing method for unknown categories
        console.warn('Unknown category slug:', categorySlug, 'falling back to inline editing')
        setEditingProduct(product)
        setProductForm({
          // Basic info
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category_id: product.category_id,
          
          // Basic tile properties
          dimensions: product.dimensions || '',
          material: product.material || '',
          finish: product.finish || '',
          color: product.color || '',
          usage_area: product.usage_area || '',
          
          // Status
          stock_status: product.stock_status
        })
        setCurrentImagePath(product.image_path || '')
        setViewMode('edit-product')
        return
    }
    
    navigate(route)
  }

  const handleImageUpload = (imagePath: string) => {
    setCurrentImagePath(imagePath)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Numele categoriei este obligatoriu')
      return
    }

    setSaving(true)
    setError('')

    const confirmed = await showConfirmation({
      title: 'Confirmare Creare',
      message: `Creați categoria "${categoryForm.name}"?`,
      type: 'warning'
    })

    if (!confirmed) {
      setSaving(false)
      return
    }

    try {
      await createCategory({ name: categoryForm.name, sort_order: 0 })
      setSuccess('Categoria a fost creată cu succes!')
      setTimeout(() => {
        navigate('/admin/categorii_produse')
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError('A apărut o eroare la crearea categoriei')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      setError('Numele produsului este obligatoriu')
      return
    }

    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      setError('Prețul trebuie să fie un număr pozitiv')
      return
    }

    setSaving(true)
    setError('')

    const confirmed = await showConfirmation({
      title: editingProduct ? 'Confirmare Actualizare' : 'Confirmare Creare',
      message: editingProduct 
        ? `Actualizați produsul "${productForm.name}"?`
        : `Creați produsul "${productForm.name}"?`,
      type: 'warning'
    })

    if (!confirmed) {
      setSaving(false)
      return
    }

    try {
      // Image path comes from ImageUpload component
      const imagePath = currentImagePath || null

      // Convert application areas from comma-separated string to array
      const applicationAreas = productForm.application_areas
        ? productForm.application_areas.split(',').map(area => area.trim()).filter(area => area)
        : []

      const productData = {
        // Basic info
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id,
        image_path: imagePath,
        
        // Basic tile properties
        dimensions: productForm.dimensions || null,
        material: productForm.material || null,
        finish: productForm.finish || null,
        color: productForm.color || null,
        usage_area: productForm.usage_area || null,
        
        // Enhanced properties
        brand: productForm.brand || null,
        product_code: productForm.product_code || null,
        sku: productForm.sku || null,
        thickness: productForm.thickness ? parseFloat(productForm.thickness) : null,
        surface_finish: productForm.surface_finish || null,
        texture: productForm.texture || null,
        quality_grade: productForm.quality_grade ? parseInt(productForm.quality_grade) : null,
        weight_per_box: productForm.weight_per_box ? parseFloat(productForm.weight_per_box) : null,
        area_per_box: productForm.area_per_box ? parseFloat(productForm.area_per_box) : null,
        tiles_per_box: productForm.tiles_per_box ? parseInt(productForm.tiles_per_box) : null,
        origin_country: productForm.origin_country || null,
        
        // Technical capabilities
        is_rectified: productForm.is_rectified,
        is_frost_resistant: productForm.is_frost_resistant,
        is_floor_heating_compatible: productForm.is_floor_heating_compatible,
        
        // Application areas as JSON array
        application_areas: applicationAreas,
        
        // Suitability
        suitable_for_walls: productForm.suitable_for_walls,
        suitable_for_floors: productForm.suitable_for_floors,
        suitable_for_exterior: productForm.suitable_for_exterior,
        suitable_for_commercial: productForm.suitable_for_commercial,
        
        // Pricing and inventory
        stock_quantity: productForm.stock_quantity ? parseFloat(productForm.stock_quantity) : null,
        standard_price: productForm.standard_price ? parseFloat(productForm.standard_price) : null,
        special_price: productForm.special_price ? parseFloat(productForm.special_price) : null,
        price_unit: productForm.price_unit,
        
        // Additional details
        estimated_delivery_days: productForm.estimated_delivery_days ? parseInt(productForm.estimated_delivery_days) : null,
        installation_notes: productForm.installation_notes || null,
        care_instructions: productForm.care_instructions || null,
        
        // Parchet-specific fields
        thickness_mm: productForm.thickness_mm ? parseFloat(productForm.thickness_mm) : null,
        width_mm: productForm.width_mm ? parseFloat(productForm.width_mm) : null,
        length_mm: productForm.length_mm ? parseFloat(productForm.length_mm) : null,
        traffic_class: productForm.traffic_class || null,
        floor_type: productForm.floor_type || null,
        installation_type: productForm.installation_type || null,
        wood_essence: productForm.wood_essence || null,
        collection_name: productForm.collection_name || null,
        core_material: productForm.core_material || null,
        surface_texture: productForm.surface_texture || null,
        surface_per_package: productForm.surface_per_package ? parseFloat(productForm.surface_per_package) : null,
        pieces_per_package: productForm.pieces_per_package ? parseInt(productForm.pieces_per_package) : null,
        installation_location: productForm.installation_location || null,
        is_antistatic: productForm.is_antistatic,
        underfloor_heating_compatible: productForm.underfloor_heating_compatible || null,
        supplier_code: productForm.supplier_code || null,
        suitable_areas: productForm.suitable_areas || null,
        physical_warranty_years: productForm.physical_warranty_years ? parseInt(productForm.physical_warranty_years) : null,
        juridical_warranty_years: productForm.juridical_warranty_years ? parseInt(productForm.juridical_warranty_years) : null,
        
        // Status
        stock_status: productForm.stock_status
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        setSuccess('Produsul a fost actualizat cu succes!')
      } else {
        await createProduct(productData)
        setSuccess('Produsul a fost creat cu succes!')
      }
      
      setTimeout(() => {
        if (selectedCategory) {
          navigate(`/admin/categorii_produse/${selectedCategory.slug}`)
        }
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError('A apărut o eroare la salvarea produsului')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = await showConfirmation({
      title: 'Confirmare Ștergere',
      message: `Ștergeți categoria "${category.name}"? Toate produsele din această categorie vor rămâne fără categorie.`,
      type: 'error'
    })

    if (confirmed) {
      try {
        await deleteCategory(category.id)
        setSuccess('Categoria a fost ștearsă cu succes!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        setError('A apărut o eroare la ștergerea categoriei')
      }
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = await showConfirmation({
      title: 'Confirmare Ștergere',
      message: `Ștergeți produsul "${product.name}"? Această acțiune nu poate fi anulată.`,
      type: 'error'
    })

    if (confirmed) {
      try {
        await deleteProduct(product.id)
        setSuccess('Produsul a fost șters cu succes!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        setError('A apărut o eroare la ștergerea produsului')
      }
    }
  }

  if (loading && categories.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ 
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={50} />
          <Typography variant="body1" color="text.secondary">
            Se încarcă categoriile...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          onClick={() => navigate('/admin')} 
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
              color: 'primary.main'
            }
          }}
        >
          Admin
        </Link>
        <Link 
          color="inherit" 
          onClick={() => navigate('/admin/categorii_produse')} 
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
              color: 'primary.main'
            }
          }}
        >
          Categorii Produse
        </Link>
        {selectedCategory && viewMode !== 'categories' && (
          <Link 
            color="inherit" 
            onClick={() => navigate(`/admin/categorii_produse/${selectedCategory.slug}`)} 
            sx={{ 
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'none',
                color: 'primary.main'
              }
            }}
          >
            {selectedCategory.name}
          </Link>
        )}
        {viewMode === 'add-category' && <Typography color="text.primary">Categorie Nouă</Typography>}
        {viewMode === 'add-product' && <Typography color="text.primary">Produs Nou</Typography>}
        {viewMode === 'edit-product' && <Typography color="text.primary">Editare Produs</Typography>}
      </Breadcrumbs>

      {/* Success/Error Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Categories List View */}
      {viewMode === 'categories' && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddCategory}
              size={isMobile ? 'small' : 'medium'}
            >
              Adaugă Categorie
            </Button>
          </Stack>

{categoriesWithCount.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              sx={{ 
                minHeight: '400px',
                textAlign: 'center',
                py: 8
              }}
            >
              <CategoryIcon sx={{ fontSize: '5rem', color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                Nicio categorie găsită
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Nu există categorii în sistem. Creați prima categorie pentru a începe organizarea produselor.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddCategory}
                size="large"
              >
                Adaugă Prima Categorie
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Titlu</TableCell>
                    <TableCell align="center">Nr. Produse</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Acțiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesWithCount.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Typography variant="subtitle1">
                          {category.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={category.products_count || 0}
                          size="small"
                          color="primary"
                          variant="filled"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 2,
                            minWidth: 40,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label="Activ"
                          size="small"
                          color="success"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title={`Vezi ${category.name.toLowerCase()}`}>
                            <IconButton 
                              size="medium"
                              onClick={() => handleViewCategoryProducts(category)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Add Category Form */}
      {viewMode === 'add-category' && (
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <TextField
                label="Nume Categorie"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                fullWidth
                required
                placeholder="ex: Faianță, Gresie, Parchet"
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => setViewMode('categories')} disabled={saving}>
                  Anulează
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveCategory}
                  disabled={saving || !categoryForm.name.trim()}
                  startIcon={saving ? <CircularProgress size={20} /> : undefined}
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Category Products View */}
      {viewMode === 'category-products' && selectedCategory && (
        <Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddProduct}
              size={isMobile ? 'small' : 'medium'}
            >
              Adaugă Produs
            </Button>
          </Stack>

{products.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              sx={{ 
                minHeight: '400px',
                textAlign: 'center',
                py: 8
              }}
            >
              <ProductsIcon sx={{ fontSize: '5rem', color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="text.secondary">
                Niciun produs în această categorie
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Categoria "{selectedCategory?.name}" nu conține încă produse. Adăugați primul produs pentru a începe.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddProduct}
                size="large"
              >
                Adaugă Primul Produs
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produs</TableCell>
                    <TableCell align="center">Preț</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Acțiuni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                            {product.image_path ? <ImageIcon /> : product.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1">
                              {product.name}
                            </Typography>
                            {product.description && (
                              <Typography variant="caption" color="text.secondary">
                                {product.description.substring(0, 60)}...
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="subtitle2" color="primary.main">
                          {product.price.toFixed(2)} lei
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={product.stock_status === 'available' ? 'Disponibil' : 
                                 product.stock_status === 'out_of_stock' ? 'Epuizat' :
                                 product.stock_status === 'coming_soon' ? 'În curând' : 'Discontinued'}
                          size="small"
                          color={product.stock_status === 'available' ? 'success' : 
                                product.stock_status === 'out_of_stock' ? 'warning' :
                                product.stock_status === 'coming_soon' ? 'info' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editează">
                            <IconButton 
                              size="medium"
                              onClick={() => handleEditProduct(product)}
                              sx={{ color: '#FFB300' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Șterge">
                            <IconButton 
                              size="medium"
                              onClick={() => handleDeleteProduct(product)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Add/Edit Product Form */}
      {(viewMode === 'add-product' || viewMode === 'edit-product') && (() => {
        // Check if the selected category is parchet
        const selectedCat = categories.find(cat => cat.id === productForm.category_id) || selectedCategory
        const isParchetCategory = selectedCat?.slug === 'parchet'
        const isRiflajCategory = selectedCat?.slug === 'riflaje'
        
        if (isParchetCategory) {
          return (
            <EnhancedParchetForm
              productForm={productForm}
              setProductForm={setProductForm}
              categories={categories}
              currentImagePath={currentImagePath}
              onImageUpload={handleImageUpload}
              saving={saving}
              onSave={handleSaveProduct}
              onCancel={() => setViewMode('category-products')}
            />
          )
        } else if (isRiflajCategory) {
          return (
            <EnhancedRiflajForm
              productForm={productForm}
              setProductForm={setProductForm}
              categories={categories}
              selectedCategory={selectedCategory}
              onSave={handleSaveProduct}
              onCancel={() => setViewMode('category-products')}
              onPreview={() => {
                // Optional: Implement preview functionality
                console.log('Preview riflaj product:', productForm)
              }}
              loading={saving}
            />
          )
        } else {
          return (
            <EnhancedProductForm
              productForm={productForm}
              setProductForm={setProductForm}
              categories={categories}
              currentImagePath={currentImagePath}
              onImageUpload={handleImageUpload}
              saving={saving}
              onSave={handleSaveProduct}
              onCancel={() => setViewMode('category-products')}
            />
          )
        }
      })()}
    </Box>
  )
}

export default ProductManagement