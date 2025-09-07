import React, { useCallback, useMemo } from 'react'
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
  HomeWork,
  Engineering
} from '@mui/icons-material'
import ImageUpload from '../common/ImageUpload'
import type { Category } from '../../types'
import { FormSection,  } from './SharedFormComponents'
import { FormFieldWithIcon } from './FieldIcons'
interface ParchetFormData {
  [key: string]: string | number | boolean | null
}

interface EnhancedParchetFormProps {
  productForm: ParchetFormData
  setProductForm: (updater: (prev: ParchetFormData) => ParchetFormData) => void
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

const EnhancedParchetForm: React.FC<EnhancedParchetFormProps> = ({
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

  // Validation helper
  const isFormValid = useMemo(() => {
    const hasName = productForm.name && String(productForm.name).trim().length > 0
    const hasPrice = productForm.price && String(productForm.price).trim().length > 0 && Number(productForm.price) > 0
    return hasName && hasPrice
  }, [productForm.name, productForm.price])

  // Use useCallback for form handlers to prevent TextField focus loss
  const handleFieldChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      console.log(`${field} onChange:`, value)
      setProductForm(prev => ({ ...prev, [field]: value }))
    }, [setProductForm])

  const handleSelectChange = useCallback((field: string) => 
    (e: any) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.value }))
    }, [setProductForm])

  const handleSwitchChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.checked }))
    }, [setProductForm])

  return (
    <Stack spacing={4}>
      {/* Image Upload Section */}
      {onImageUpload && (
        <FormSection
          icon={<Engineering />}
          title="Imagine Produs"
          color="secondary"
          theme={theme}
        >
          <ImageUpload
            currentImagePath={currentImagePath}
            onImageUpload={onImageUpload}
            onImageRemove={onImageRemove}
            removeFromStorage={removeFromStorage}
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
                placeholder="ex: Egger"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Cod Produs" fieldName="product_code">
              <TextField
                value={productForm.product_code}
                onChange={handleFieldChange('product_code')}
                fullWidth
                placeholder="ex: EPL001"
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

      {/* Parchet-Specific Properties */}
      <FormSection
        icon={<HomeWork />}
        title="Caracteristici Parchet"
        color="info"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Tip Parchet" fieldName="style" required>
              <FormControl fullWidth>
                <Select
                  value={productForm.wood_type || 'laminat'}
                  onChange={handleSelectChange('wood_type')}
                >
                  <MenuItem value="laminat">Laminat</MenuItem>
                  <MenuItem value="stratificat">Stratificat</MenuItem>
                  <MenuItem value="masiv">Masiv</MenuItem>
                  <MenuItem value="spc">SPC</MenuItem>
                  <MenuItem value="lvt">LVT</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Clasa de Trafic" fieldName="durability_rating">
              <FormControl fullWidth>
                <Select
                  value={productForm.traffic_class || 'AC4'}
                  onChange={handleSelectChange('traffic_class')}
                >
                  <MenuItem value="AC3">AC3 (Rezidențial moderat)</MenuItem>
                  <MenuItem value="AC4">AC4 (Rezidențial intens)</MenuItem>
                  <MenuItem value="AC5">AC5 (Comercial moderat)</MenuItem>
                  <MenuItem value="AC6">AC6 (Comercial intens)</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Sistem de Îmbinare" fieldName="installation_method">
              <FormControl fullWidth>
                <Select
                  value={productForm.locking_system || 'click'}
                  onChange={handleSelectChange('locking_system')}
                >
                  <MenuItem value="click">Click</MenuItem>
                  <MenuItem value="click-2g">Click 2G</MenuItem>
                  <MenuItem value="click-5g">Click 5G</MenuItem>
                  <MenuItem value="lipire">Lipire</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Decor" fieldName="special_features">
              <TextField
                value={productForm.decor_pattern || ''}
                onChange={handleFieldChange('decor_pattern')}
                fullWidth
                placeholder="ex: Stejar Natural"
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Physical Properties */}
      <FormSection
        icon={<Build />}
        title="Proprietăți Fizice"
        color="secondary"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Dimensiuni Placă" fieldName="dimensions">
              <TextField
                value={productForm.dimensions}
                onChange={handleFieldChange('dimensions')}
                fullWidth
                placeholder="1285x192 mm"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Grosime" fieldName="thickness">
              <TextField
                value={productForm.thickness}
                onChange={handleFieldChange('thickness')}
                fullWidth
                type="number"
                placeholder="8"
                InputProps={{ endAdornment: 'mm' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Finisaj Suprafață" fieldName="surface_finish">
              <FormControl fullWidth>
                <Select
                  value={productForm.surface_finish || 'mat'}
                  onChange={handleSelectChange('surface_finish')}
                >
                  <MenuItem value="mat">Mat</MenuItem>
                  <MenuItem value="satinat">Satinat</MenuItem>
                  <MenuItem value="lucios">Lucios</MenuItem>
                  <MenuItem value="structurat">Structurat</MenuItem>
                  <MenuItem value="sincronizat">Sincronizat</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Textură" fieldName="texture">
              <TextField
                value={productForm.texture}
                onChange={handleFieldChange('texture')}
                fullWidth
                placeholder="Lemn autentic"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Culoare" fieldName="color">
              <TextField
                value={productForm.color}
                onChange={handleFieldChange('color')}
                fullWidth
                placeholder="Maro"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Țara de Origine" fieldName="origin_country">
              <TextField
                value={productForm.origin_country}
                onChange={handleFieldChange('origin_country')}
                fullWidth
                placeholder="Germania"
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Technical Properties */}
      <FormSection
        icon={<Engineering />}
        title="Proprietăți Tehnice"
        color="warning"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Rezistență la Abraziune" fieldName="technical_features">
              <FormControl fullWidth>
                <Select
                  value={productForm.abrasion_resistance || 'AC4'}
                  onChange={handleSelectChange('abrasion_resistance')}
                >
                  <MenuItem value="AC3">AC3</MenuItem>
                  <MenuItem value="AC4">AC4</MenuItem>
                  <MenuItem value="AC5">AC5</MenuItem>
                  <MenuItem value="AC6">AC6</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Garanție (ani)" fieldName="notes">
              <TextField
                value={productForm.warranty_years}
                onChange={handleFieldChange('warranty_years')}
                fullWidth
                type="number"
                placeholder="15"
                InputProps={{ endAdornment: 'ani' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Nivel de Zgomot" fieldName="material">
              <FormControl fullWidth>
                <Select
                  value={productForm.noise_level || 'normal'}
                  onChange={handleSelectChange('noise_level')}
                >
                  <MenuItem value="foarte_silentios">Foarte Silențios</MenuItem>
                  <MenuItem value="silentios">Silențios</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                </Select>
              </FormControl>
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Rezistență la Umiditate" fieldName="water_resistance">
              <FormControl fullWidth>
                <Select
                  value={productForm.moisture_resistance || 'standard'}
                  onChange={handleSelectChange('moisture_resistance')}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="imbunatatita">Îmbunătățită</MenuItem>
                  <MenuItem value="waterproof">Waterproof</MenuItem>
                </Select>
              </FormControl>
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
            <FormFieldWithIcon label="Greutate per Pachet" fieldName="weight_per_box">
              <TextField
                value={productForm.weight_per_box}
                onChange={handleFieldChange('weight_per_box')}
                fullWidth
                type="number"
                placeholder="15.5"
                InputProps={{ endAdornment: 'kg' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Suprafață per Pachet" fieldName="area_per_box">
              <TextField
                value={productForm.area_per_box}
                onChange={handleFieldChange('area_per_box')}
                fullWidth
                type="number"
                placeholder="2.131"
                InputProps={{ endAdornment: 'm²' }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Plăci per Pachet" fieldName="pieces_per_pack">
              <TextField
                value={productForm.tiles_per_box}
                onChange={handleFieldChange('tiles_per_box')}
                fullWidth
                type="number"
                placeholder="8"
                InputProps={{ endAdornment: 'buc' }}
              />
            </FormFieldWithIcon>
          </Grid>
        </Grid>
      </FormSection>

      {/* Features & Capabilities */}
      <FormSection
        icon={<CheckCircle />}
        title="Caracteristici și Capabilități"
        color="success"
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_waterproof}
                  onChange={handleSwitchChange('is_waterproof')}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Rezistent la Apă</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Potrivit pentru băi și bucătării
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.has_underlayment}
                  onChange={handleSwitchChange('has_underlayment')}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={500}>Folie Integrată</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Izolație fonică inclusă
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
                  onChange={handleSwitchChange('is_floor_heating_compatible')}
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
        theme={theme}
      >
        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_residential}
                  onChange={handleSwitchChange('suitable_for_residential')}
                  color="primary"
                />
              }
              label="Rezidențial"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_commercial}
                  onChange={handleSwitchChange('suitable_for_commercial')}
                  color="primary"
                />
              }
              label="Comercial"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_stairs}
                  onChange={handleSwitchChange('suitable_for_stairs')}
                  color="primary"
                />
              }
              label="Scări"
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.suitable_for_bathroom}
                  onChange={handleSwitchChange('suitable_for_bathroom')}
                  color="primary"
                />
              }
              label="Baie"
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
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="99.99"
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Unitate Preț" fieldName="price_unit">
              <FormControl fullWidth>
                <Select
                  value={productForm.price_unit || 'mp'}
                  onChange={handleSelectChange('price_unit')}
                >
                  <MenuItem value="mp">per m²</MenuItem>
                  <MenuItem value="pachet">per pachet</MenuItem>
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
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Preț Special (lei)" fieldName="special_price">
              <TextField
                type="number"
                value={productForm.special_price}
                onChange={handleFieldChange('special_price')}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Stoc Disponibil" fieldName="stock_quantity">
              <TextField
                type="number"
                value={productForm.stock_quantity}
                onChange={handleFieldChange('stock_quantity')}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </FormFieldWithIcon>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormFieldWithIcon label="Timp Livrare (zile)" fieldName="estimated_delivery_days">
              <TextField
                type="number"
                value={productForm.estimated_delivery_days}
                onChange={handleFieldChange('estimated_delivery_days')}
                fullWidth
                inputProps={{ min: 0 }}
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
                placeholder="Living, dormitor, birou, hol..."
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

export default EnhancedParchetForm