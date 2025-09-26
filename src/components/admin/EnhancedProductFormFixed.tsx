import React, { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  Paper,
  Divider,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material'
import {
  BusinessCenter,
  Build,
  Inventory,
  LocalOffer,
  Description,
  Settings,
  CheckCircle,
  PhotoCamera
} from '@mui/icons-material'
import { FormFieldWithIcon } from './FieldIcons'
import ImageUpload from '../common/ImageUpload'
import type { Category } from '../../types'
import { 
  validateNumericField, 
  filterNumericInput, 
  NUMERIC_FIELDS,
  getFieldDisplayName
} from '../../utils/numericValidation'

interface ProductFormData {
  [key: string]: string | number | boolean | null
}

interface EnhancedProductFormProps {
  productForm: ProductFormData
  setProductForm: (updater: (prev: ProductFormData) => ProductFormData) => void
  categories?: Category[]
  currentImagePath?: string
  onImageUpload?: (imagePath: string) => void
  onImageRemove?: () => void
  removeFromStorage?: boolean
  saving?: boolean
  onSave?: () => void
  onCancel?: () => void
  hideCategories?: boolean
  categoryType?: 'faianta' | 'gresie' | 'parchet' | 'riflaje'
}

// Move FormSection outside to prevent re-creation on every render
const FormSection: React.FC<{
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
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
        boxShadow: theme?.shadows[4]
      },
      transition: theme?.transitions.create(['border-color', 'box-shadow'])
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

// Move FormFieldWithIcon outside to prevent re-creation on every render
// Using FormFieldWithIcon from FieldIcons.tsx instead of local FormFieldWithIcon

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  productForm,
  setProductForm,
  categories = [],
  currentImagePath = '',
  onImageUpload = () => {},
  onImageRemove,
  removeFromStorage = true,
  saving = false,
  onSave = () => {},
  onCancel = () => {},
  hideCategories = false,
  categoryType
}) => {
  const theme = useTheme()

  // State for field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Validation helper
  const isFormValid = useMemo(() => {
    const hasName = productForm.name && String(productForm.name).trim().length > 0
    const hasPrice = productForm.price && String(productForm.price).trim().length > 0 && Number(productForm.price) > 0
    
    
    return hasName && hasPrice
  }, [productForm.name, productForm.price])

  // Enhanced handleFieldChange with numeric validation
  const handleFieldChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawValue = e.target.value
      
      // Check if field requires numeric validation
      if (NUMERIC_FIELDS.includes(field)) {
        const validation = validateNumericField(rawValue, getFieldDisplayName(field))
        
        // Update field errors
        setFieldErrors(prev => ({
          ...prev,
          [field]: validation.errorMessage || ''
        }))
        
        // Use sanitized value for numeric fields
        setProductForm(prev => ({ 
          ...prev, 
          [field]: validation.sanitizedValue 
        }))
        
      } else {
        // Regular field handling for non-numeric fields
        setProductForm(prev => ({ ...prev, [field]: rawValue }))
        
        // Clear any existing error for non-numeric fields
        setFieldErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    }, [setProductForm])

  const handleCheckboxChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.checked }))
    }, [setProductForm])

  const handleSelectChange = useCallback((field: string) => 
    (e: any) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.value }))
    }, [setProductForm])

  // Handle keyboard input filtering for numeric fields
  const handleKeyDown = useCallback((field: string) => 
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (NUMERIC_FIELDS.includes(field)) {
        const isAllowed = filterNumericInput(e.nativeEvent)
        if (!isAllowed) {
          e.preventDefault()
        }
      }
    }, [])

  return (
    <Stack spacing={4}>
      {/* Image Upload Section */}
      {onImageUpload && (
        <FormSection
          icon={<PhotoCamera />}
          title="Imagine Produs"
          color="secondary"
          theme={theme}
        >
          <ImageUpload
            currentImagePath={currentImagePath}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
            removeFromStorage={removeFromStorage}
            label="Încarcă Imagine Produs"
          />
        </FormSection>
      )}

      {/* Basic Information */}
      <FormSection
        icon={<BusinessCenter />}
        title="Informații de bază"
        color="primary"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormFieldWithIcon label="Nume Produs" fieldName="name" required>
              <TextField
                value={productForm.name}
                onChange={handleFieldChange('name')}
                fullWidth
                placeholder="Introduceti numele produsului"
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }
                }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12}>
            <FormFieldWithIcon label="Descriere" fieldName="description">
              <TextField
                value={productForm.description}
                onChange={handleFieldChange('description')}
                fullWidth
                multiline
                rows={4}
                placeholder="Descriere completă a produsului..."
              />
            </FormFieldWithIcon>
          </Grid>

          {!hideCategories && categories.length > 0 && (
            <Grid item xs={12} sm={6}>
              <FormFieldWithIcon label="Categorie" fieldName="category_id">
                <FormControl fullWidth>
                  <Select
                    value={productForm.category_id || ''}
                    onChange={handleSelectChange('category_id')}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Selectează categoria</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FormFieldWithIcon>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Brand" fieldName="brand">
              <TextField
                value={productForm.brand}
                onChange={handleFieldChange('brand')}
                fullWidth
                placeholder="ex: CERAMAXX"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Cod Produs" fieldName="product_code">
              <TextField
                value={productForm.product_code}
                onChange={handleFieldChange('product_code')}
                fullWidth
                placeholder="ex: 31326"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Grad Calitate" fieldName="quality_grade">
              <FormControl fullWidth>
                <Select
                  value={productForm.quality_grade}
                  onChange={handleSelectChange('quality_grade')}
                  displayEmpty
                >
                  <MenuItem value="">Selectează</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="economic">Economic</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Physical Properties */}
      <FormSection
        icon={<Build />}
        title="Proprietăți Fizice"
        color="info"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Dimensiuni" fieldName="dimensions">
              <TextField
                value={productForm.dimensions}
                onChange={handleFieldChange('dimensions')}
                fullWidth
                placeholder="30x60 cm"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Grosime" fieldName="thickness">
              <TextField
                value={productForm.thickness}
                onChange={handleFieldChange('thickness')}
                onKeyDown={handleKeyDown('thickness')}
                fullWidth
                type="number"
                placeholder="8.5"
                error={!!fieldErrors.thickness}
                helperText={fieldErrors.thickness}
                InputProps={{ endAdornment: 'mm' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Material" fieldName="material">
              <TextField
                value={productForm.material}
                onChange={handleFieldChange('material')}
                fullWidth
                placeholder="Ceramică porțelanată"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Finisaj Suprafață" fieldName="surface_finish">
              <TextField
                value={productForm.surface_finish}
                onChange={handleFieldChange('surface_finish')}
                fullWidth
                placeholder="Mat"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Textură" fieldName="texture">
              <TextField
                value={productForm.texture}
                onChange={handleFieldChange('texture')}
                fullWidth
                placeholder="Piatră naturală"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Culoare" fieldName="color">
              <TextField
                value={productForm.color}
                onChange={handleFieldChange('color')}
                fullWidth
                placeholder="Gri"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Țara de Origine" fieldName="origin_country">
              <TextField
                value={productForm.origin_country}
                onChange={handleFieldChange('origin_country')}
                fullWidth
                placeholder="Italia"
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Packaging Information */}
      <FormSection
        icon={<Inventory />}
        title="Informații Ambalare"
        color="success"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Greutate per Cutie" fieldName="weight_per_box">
              <TextField
                value={productForm.weight_per_box}
                onChange={handleFieldChange('weight_per_box')}
                onKeyDown={handleKeyDown('weight_per_box')}
                fullWidth
                type="number"
                placeholder="22.5"
                error={!!fieldErrors.weight_per_box}
                helperText={fieldErrors.weight_per_box}
                InputProps={{ endAdornment: 'kg' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Suprafață per Cutie" fieldName="area_per_box">
              <TextField
                value={productForm.area_per_box}
                onChange={handleFieldChange('area_per_box')}
                onKeyDown={handleKeyDown('area_per_box')}
                fullWidth
                type="number"
                placeholder="1.44"
                error={!!fieldErrors.area_per_box}
                helperText={fieldErrors.area_per_box}
                InputProps={{ endAdornment: 'm²' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Plăci per Cutie" fieldName="tiles_per_box">
              <TextField
                value={productForm.tiles_per_box}
                onChange={handleFieldChange('tiles_per_box')}
                onKeyDown={handleKeyDown('tiles_per_box')}
                fullWidth
                type="number"
                placeholder="6"
                error={!!fieldErrors.tiles_per_box}
                helperText={fieldErrors.tiles_per_box}
                InputProps={{ endAdornment: 'buc' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Plăci per m²" fieldName="tiles_per_sqm">
              <TextField
                value={productForm.tiles_per_sqm}
                onChange={handleFieldChange('tiles_per_sqm')}
                onKeyDown={handleKeyDown('tiles_per_sqm')}
                fullWidth
                type="number"
                placeholder="2.78"
                error={!!fieldErrors.tiles_per_sqm}
                helperText={fieldErrors.tiles_per_sqm}
                InputProps={{ endAdornment: 'buc/m²' }}
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Technical Capabilities */}
      <FormSection
        icon={<CheckCircle />}
        title="Caracteristici Tehnice"
        color="success"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_rectified}
                  onChange={handleCheckboxChange('is_rectified')}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Rectificat</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Margini tăiate precis
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_frost_resistant}
                  onChange={handleCheckboxChange('is_frost_resistant')}
                  color="info"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Rezistent la Îngheț</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pentru exterior
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_floor_heating_compatible}
                  onChange={handleCheckboxChange('is_floor_heating_compatible')}
                  color="warning"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Compatibil Încălzire Pardoseală</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Transmite căldura eficient
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Application Areas */}
      <FormSection
        icon={<Settings />}
        title="Zone de Aplicare"
        color="warning"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_walls}
                  onChange={handleCheckboxChange('suitable_for_walls')}
                  color="primary"
                />
              }
              label="Pereți"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_floors}
                  onChange={handleCheckboxChange('suitable_for_floors')}
                  color="primary"
                />
              }
              label="Pardoseli"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_exterior}
                  onChange={handleCheckboxChange('suitable_for_exterior')}
                  color="primary"
                />
              }
              label="Exterior"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_commercial}
                  onChange={handleCheckboxChange('suitable_for_commercial')}
                  color="primary"
                />
              }
              label="Comercial"
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* Pricing & Inventory */}
      <FormSection
        icon={<LocalOffer />}
        title="Prețuri și Inventar"
        color="warning"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Preț Curent (lei)" fieldName="price" required>
              <TextField
                type="number"
                value={productForm.price}
                onChange={handleFieldChange('price')}
                onKeyDown={handleKeyDown('price')}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="99.99"
                error={!!fieldErrors.price}
                helperText={fieldErrors.price}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Unitate Preț" fieldName="price_unit">
              <FormControl fullWidth>
                <Select
                  value={productForm.price_unit}
                  onChange={handleSelectChange('price_unit')}
                >
                  <MenuItem value="mp">per m²</MenuItem>
                  <MenuItem value="buc">per bucată</MenuItem>
                  <MenuItem value="cutie">per cutie</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Preț Standard (lei)" fieldName="standard_price">
              <TextField
                type="number"
                value={productForm.standard_price}
                onChange={handleFieldChange('standard_price')}
                onKeyDown={handleKeyDown('standard_price')}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                error={!!fieldErrors.standard_price}
                helperText={fieldErrors.standard_price}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Preț Special (lei)" fieldName="special_price">
              <TextField
                type="number"
                value={productForm.special_price}
                onChange={handleFieldChange('special_price')}
                onKeyDown={handleKeyDown('special_price')}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                error={!!fieldErrors.special_price}
                helperText={fieldErrors.special_price || 'Preț redus pentru oferte speciale'}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!productForm.is_on_sale}
                  onChange={handleCheckboxChange('is_on_sale')}
                  color="error"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🔥 Produs la Reducere
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Marchează produsul ca fiind la reducere
                  </Typography>
                </Box>
              }
              sx={{
                mt: 1,
                p: 2,
                border: productForm.is_on_sale ? '2px solid' : '1px solid',
                borderColor: productForm.is_on_sale ? 'error.main' : 'divider',
                borderRadius: 2,
                backgroundColor: productForm.is_on_sale ? 'error.light' : 'transparent',
                '& .MuiFormControlLabel-label': {
                  width: '100%'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Stoc Disponibil" fieldName="stock_quantity">
              <TextField
                type="number"
                value={productForm.stock_quantity}
                onChange={handleFieldChange('stock_quantity')}
                onKeyDown={handleKeyDown('stock_quantity')}
                fullWidth
                inputProps={{ min: 0 }}
                error={!!fieldErrors.stock_quantity}
                helperText={fieldErrors.stock_quantity}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Timp Livrare (zile)" fieldName="estimated_delivery_days">
              <TextField
                type="number"
                value={productForm.estimated_delivery_days}
                onChange={handleFieldChange('estimated_delivery_days')}
                onKeyDown={handleKeyDown('estimated_delivery_days')}
                fullWidth
                inputProps={{ min: 0 }}
                error={!!fieldErrors.estimated_delivery_days}
                helperText={fieldErrors.estimated_delivery_days}
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Additional Details */}
      <FormSection
        icon={<Description />}
        title="Detalii Adiționale"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormFieldWithIcon label="Zone de Aplicare" fieldName="application_areas">
              <TextField
                value={productForm.application_areas}
                onChange={handleFieldChange('application_areas')}
                fullWidth
                multiline
                rows={2}
                placeholder="Living, dormitor, baie, bucătărie, exterior..."
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12}>
            <FormFieldWithIcon label="Notițe Instalare" fieldName="installation_method">
              <TextField
                value={productForm.installation_notes}
                onChange={handleFieldChange('installation_notes')}
                fullWidth
                multiline
                rows={3}
                placeholder="Instrucțiuni speciale de instalare..."
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12}>
            <FormFieldWithIcon label="Instrucțiuni de Îngrijire" fieldName="notes">
              <TextField
                value={productForm.care_instructions}
                onChange={handleFieldChange('care_instructions')}
                fullWidth
                multiline
                rows={3}
                placeholder="Instrucțiuni de curățare și întreținere..."
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Action Buttons */}
      {onSave && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Acțiuni
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              onClick={onSave}
              disabled={saving || !isFormValid}
              startIcon={saving ? <CircularProgress size={20} /> : undefined}
              sx={{ 
                minHeight: 48,
                fontWeight: 600
              }}
            >
              {saving ? 'Se salvează...' : 'Salvează'} Produs
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={onCancel}
              sx={{ 
                minHeight: 44,
                fontWeight: 500
              }}
            >
              Anulează
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}

export default EnhancedProductForm