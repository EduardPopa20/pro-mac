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
    
    // Status
    is_active: true
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
    navigate(`/admin/produse/${category.slug}`)
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
      is_active: true
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
      
      // Status
      is_active: true
    })
    setCurrentImagePath('')
    setEditingProduct(null)
  }

  const handleEditProduct = (product: Product) => {
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
      
      // Enhanced properties
      brand: product.brand || '',
      product_code: product.product_code || '',
      sku: product.sku || '',
      thickness: product.thickness ? product.thickness.toString() : '',
      surface_finish: product.surface_finish || '',
      texture: product.texture || '',
      quality_grade: product.quality_grade ? product.quality_grade.toString() : '',
      weight_per_box: product.weight_per_box ? product.weight_per_box.toString() : '',
      area_per_box: product.area_per_box ? product.area_per_box.toString() : '',
      tiles_per_box: product.tiles_per_box ? product.tiles_per_box.toString() : '',
      origin_country: product.origin_country || '',
      
      // Technical capabilities
      is_rectified: product.is_rectified || false,
      is_frost_resistant: product.is_frost_resistant || false,
      is_floor_heating_compatible: product.is_floor_heating_compatible || false,
      
      // Application areas (convert array to comma-separated string)
      application_areas: product.application_areas ? product.application_areas.join(', ') : '',
      
      // Suitability
      suitable_for_walls: product.suitable_for_walls !== undefined ? product.suitable_for_walls : true,
      suitable_for_floors: product.suitable_for_floors !== undefined ? product.suitable_for_floors : true,
      suitable_for_exterior: product.suitable_for_exterior || false,
      suitable_for_commercial: product.suitable_for_commercial || false,
      
      // Pricing and inventory
      stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '',
      standard_price: product.standard_price ? product.standard_price.toString() : '',
      special_price: product.special_price ? product.special_price.toString() : '',
      price_unit: product.price_unit || 'mp',
      
      // Additional details
      estimated_delivery_days: product.estimated_delivery_days ? product.estimated_delivery_days.toString() : '',
      installation_notes: product.installation_notes || '',
      care_instructions: product.care_instructions || '',
      
      // Status
      is_active: product.is_active
    })
    setCurrentImagePath(product.image_path || '')
    setViewMode('edit-product')
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
      await createCategory({ name: categoryForm.name, is_active: true, sort_order: 0 })
      setSuccess('Categoria a fost creată cu succes!')
      setTimeout(() => {
        navigate('/admin/produse')
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
        
        // Status
        is_active: productForm.is_active
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
          navigate(`/admin/produse/${selectedCategory.slug}`)
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
          onClick={() => navigate('/admin/produse')} 
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
              color: 'primary.main'
            }
          }}
        >
          Categorii
        </Link>
        {selectedCategory && viewMode !== 'categories' && (
          <Link 
            color="inherit" 
            onClick={() => navigate(`/admin/produse/${selectedCategory.slug}`)} 
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
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={category.is_active ? 'Activ' : 'Inactiv'}
                          size="small"
                          color={category.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Vezi Produse">
                            <IconButton 
                              size="medium"
                              onClick={() => handleViewCategoryProducts(category)}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Șterge Categoria">
                            <IconButton 
                              size="medium"
                              onClick={() => handleDeleteCategory(category)}
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
                placeholder="ex: Faianță, Gresie, Mozaic"
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
                          label={product.is_active ? 'Activ' : 'Inactiv'}
                          size="small"
                          color={product.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editează">
                            <IconButton 
                              size="medium"
                              onClick={() => handleEditProduct(product)}
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
      {(viewMode === 'add-product' || viewMode === 'edit-product') && (
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
      )}
    </Box>
  )
}

export default ProductManagement