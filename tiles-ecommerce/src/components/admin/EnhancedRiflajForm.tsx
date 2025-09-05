import React, { useState, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  Tooltip,
  IconButton
} from '@mui/material'
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Palette as PaletteIcon,
  Build as BuildIcon,
  VolumeUp as VolumeUpIcon,
  Straighten as StraightenIcon,
  Security as SecurityIcon,
  Public as EcoIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface RiflajFormData {
  // Basic Info
  name: string
  description: string
  price: number
  brand: string
  product_code: string
  
  // Material & Panel Type
  panel_type: string
  base_material: string
  wood_species: string
  panel_profile: string
  
  // Technical Dimensions
  panel_thickness_mm: number
  panel_width_mm: number
  panel_length_mm: number
  coverage_per_panel: number
  panel_weight_kg: number
  groove_spacing_mm: number
  groove_depth_mm: number
  
  // Acoustic Properties
  acoustic_properties: string
  acoustic_rating: string
  acoustic_backing: string
  
  // Surface & Mounting
  surface_finish_type: string
  mounting_system: string
  panel_orientation: string
  installation_difficulty: string
  
  // Performance & Safety
  fire_resistance_class: string
  environmental_rating: string
  uv_resistance: boolean
  moisture_resistance: string
  
  // Colors & Variants
  color: string
  color_variants: string
  finish: string
  
  // Installation & Usage
  installation_area: string
  usage_area: string
  maintenance_type: string
  
  // Standard fields
  category_id: number
  dimensions: string
  material: string
  stock_status: 'available' | 'out_of_stock' | 'discontinued' | 'coming_soon'
  image_url: string
}

interface EnhancedRiflajFormProps {
  productForm: RiflajFormData
  setProductForm: React.Dispatch<React.SetStateAction<RiflajFormData>>
  categories?: Array<{ id: number; name: string }>
  selectedCategory?: { id: number; name: string } | null
  onSave?: () => Promise<void>
  onCancel?: () => void
  onPreview?: () => void
  loading?: boolean
  hideCategories?: boolean
  categoryType?: 'faianta' | 'gresie' | 'parchet' | 'riflaje'
}

const EnhancedRiflajForm: React.FC<EnhancedRiflajFormProps> = ({
  productForm,
  setProductForm,
  categories = [],
  selectedCategory = null,
  onSave = async () => {},
  onCancel = () => {},
  onPreview = () => {},
  loading = false,
  hideCategories = false,
  categoryType
}) => {
  const theme = useTheme()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form field change handler with useCallback to prevent focus loss
  const handleFieldChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
      const value = e.target.value
      setProductForm(prev => ({ 
        ...prev, 
        [field]: value,
        // Auto-generate dimensions string when dimension fields change
        ...(field.includes('_mm') ? {
          dimensions: `${prev.panel_width_mm || 0}x${prev.panel_length_mm || 0}x${prev.panel_thickness_mm || 0} mm`
        } : {})
      }))
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
    }, [setProductForm, errors])

  const handleSwitchChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.checked }))
    }, [setProductForm])

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!productForm.name.trim()) newErrors.name = 'Numele este obligatoriu'
    if (!productForm.description.trim()) newErrors.description = 'Descrierea este obligatorie'
    if (productForm.price <= 0) newErrors.price = 'Prețul trebuie să fie pozitiv'
    if (!productForm.panel_type) newErrors.panel_type = 'Tipul de panou este obligatoriu'
    if (!productForm.base_material) newErrors.base_material = 'Materialul de bază este obligatoriu'
    if (productForm.panel_thickness_mm <= 0) newErrors.panel_thickness_mm = 'Grosimea trebuie să fie pozitivă'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (validateForm()) {
      await onSave()
    }
  }

  // Form sections data
  const FormSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; color?: string }> = ({ 
    icon, title, children, color = 'primary' 
  }) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        border: '1px solid',
        borderColor: `${color}.light`,
        borderRadius: 2,
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: '50%', 
          backgroundColor: `${color}.light`,
          color: `${color}.contrastText`
        }}>
          {icon}
        </Box>
        <Typography variant="h5" sx={{ 
          fontWeight: 700,
          color: `${color}.main`
        }}>
          {title}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3, borderColor: `${color}.light` }} />
      {children}
    </Paper>
  )

  // Quick Preview Sidebar
  const QuickPreview = () => (
    <Card sx={{ 
      position: 'sticky', 
      top: (theme) => theme.spacing(2.5), // 20px
      zIndex: (theme) => theme.zIndex.sticky,
      height: 'fit-content',
      alignSelf: 'flex-start'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Preview Rapid
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Chip 
            label={productForm.panel_type || 'Tip panou'}
            color="primary" 
            size="small"
            variant={productForm.panel_type ? "filled" : "outlined"}
          />
          <Chip 
            label={productForm.base_material || 'Material'}
            color="secondary" 
            size="small"
            variant={productForm.base_material ? "filled" : "outlined"}
          />
          {productForm.acoustic_properties && (
            <Chip 
              icon={<VolumeUpIcon />}
              label={productForm.acoustic_properties}
              color="success" 
              size="small"
            />
          )}
          {productForm.panel_thickness_mm > 0 && (
            <Chip 
              icon={<StraightenIcon />}
              label={`${productForm.panel_thickness_mm}mm`}
              color="info" 
              size="small"
            />
          )}
          {productForm.uv_resistance && (
            <Chip 
              label="UV Rezistent"
              color="warning" 
              size="small"
            />
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Preț:</strong> {productForm.price > 0 ? `${productForm.price} RON` : 'Nesetat'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Brand:</strong> {productForm.brand || 'Nesetat'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Dimensiuni:</strong> {productForm.dimensions || 'Auto-generate'}
        </Typography>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Formular Riflaj Premium
        </Typography>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Anulează modificările">
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              sx={{ minWidth: 120 }}
            >
              Anulează
            </Button>
          </Tooltip>
          <Tooltip title="Previzualizează produsul">
            <Button
              variant="outlined"
              color="info"
              startIcon={<PreviewIcon />}
              onClick={onPreview}
              sx={{ minWidth: 120 }}
            >
              Preview
            </Button>
          </Tooltip>
          <Tooltip title="Salvează produsul riflaj">
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ minWidth: 120, fontWeight: 600 }}
            >
              {loading ? 'Salvează...' : 'Salvează'}
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Corectați următoarele erori:</Typography>
          {Object.entries(errors).map(([field, error]) => (
            <Typography key={field} variant="body2">• {error}</Typography>
          ))}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            
            {/* 1. Basic Info */}
            <FormSection icon={<InfoIcon />} title="Informații de Bază" color="primary">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nume Produs"
                    value={productForm.name}
                    onChange={handleFieldChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="ex: Panou Riflaj MDF Premium Stejar Natural"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Descriere Detaliată"
                    value={productForm.description}
                    onChange={handleFieldChange('description')}
                    error={!!errors.description}
                    helperText={errors.description}
                    placeholder="Descriere completă cu beneficii și caracteristici..."
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Preț (RON)"
                    value={productForm.price}
                    onChange={handleFieldChange('price')}
                    error={!!errors.price}
                    helperText={errors.price}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Brand"
                    value={productForm.brand}
                    onChange={handleFieldChange('brand')}
                    placeholder="ex: Egger, FrontMDF, Vox"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Cod Produs"
                    value={productForm.product_code}
                    onChange={handleFieldChange('product_code')}
                    placeholder="ex: EG-RF2831"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Category Indicator for specialized pages */}
            {hideCategories && categoryType && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: 'primary.50',
                borderLeft: 4,
                borderColor: 'primary.main',
                borderRadius: 1,
                mb: 3
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                  Categorie: {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Această pagină este specializată pentru editarea produselor de tip {categoryType}
                </Typography>
              </Box>
            )}

            {/* 2. Material & Panel Type */}
            <FormSection icon={<PaletteIcon />} title="Material și Tip Panou" color="secondary">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.panel_type}>
                    <InputLabel>Tip Panou</InputLabel>
                    <Select
                      value={productForm.panel_type}
                      label="Tip Panou"
                      onChange={handleFieldChange('panel_type')}
                    >
                      <MenuItem value="MDF">MDF Decorativ</MenuItem>
                      <MenuItem value="Lemn Solid">Lemn Solid</MenuItem>
                      <MenuItem value="Polistiren">Polistiren Extrudat</MenuItem>
                      <MenuItem value="Acustic">Panou Acustic</MenuItem>
                      <MenuItem value="MDF Exterior">MDF Exterior</MenuItem>
                      <MenuItem value="MDF Ignifug">MDF Ignifug</MenuItem>
                      <MenuItem value="Lemn Premium">Lemn Premium/Furnir</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.base_material}>
                    <InputLabel>Material de Bază</InputLabel>
                    <Select
                      value={productForm.base_material}
                      label="Material de Bază"
                      onChange={handleFieldChange('base_material')}
                    >
                      <MenuItem value="MDF 18mm">MDF Standard 18mm</MenuItem>
                      <MenuItem value="MDF Premium">MDF Premium</MenuItem>
                      <MenuItem value="Lemn Masiv Stejar">Lemn Masiv Stejar</MenuItem>
                      <MenuItem value="Lemn Masiv Nuc">Lemn Masiv Nuc</MenuItem>
                      <MenuItem value="Lemn Masiv Pin">Lemn Masiv Pin</MenuItem>
                      <MenuItem value="Polistiren Extrudat">Polistiren Extrudat</MenuItem>
                      <MenuItem value="MDF + Fetru">MDF + Fetru Acustic</MenuItem>
                      <MenuItem value="MDF + Spumă">MDF + Spumă Acustică</MenuItem>
                      <MenuItem value="Furnir + MDF">Furnir Premium + MDF</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Esență Lemn"
                    value={productForm.wood_species}
                    onChange={handleFieldChange('wood_species')}
                    placeholder="ex: stejar, nuc, pin, fag, tec"
                    helperText="Pentru panouri din lemn solid/furnir"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Profil/Model Panou"
                    value={productForm.panel_profile}
                    onChange={handleFieldChange('panel_profile')}
                    placeholder="ex: DIMENSION, SPACE, NOVA, Classic"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* 3. Technical Dimensions */}
            <FormSection icon={<StraightenIcon />} title="Dimensiuni Tehnice" color="info">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Grosime (mm)"
                    value={productForm.panel_thickness_mm}
                    onChange={handleFieldChange('panel_thickness_mm')}
                    error={!!errors.panel_thickness_mm}
                    helperText={errors.panel_thickness_mm}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lățime (mm)"
                    value={productForm.panel_width_mm}
                    onChange={handleFieldChange('panel_width_mm')}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lungime (mm)"
                    value={productForm.panel_length_mm}
                    onChange={handleFieldChange('panel_length_mm')}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Suprafață/Panou (m²)"
                    value={productForm.coverage_per_panel}
                    onChange={handleFieldChange('coverage_per_panel')}
                    inputProps={{ min: 0, step: 0.001 }}
                    helperText="Suprafața acoperită de un panou"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Greutate (kg)"
                    value={productForm.panel_weight_kg}
                    onChange={handleFieldChange('panel_weight_kg')}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Spațiere Caneluri (mm)"
                    value={productForm.groove_spacing_mm}
                    onChange={handleFieldChange('groove_spacing_mm')}
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Distanța între caneluri"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Adâncime Caneluri (mm)"
                    value={productForm.groove_depth_mm}
                    onChange={handleFieldChange('groove_depth_mm')}
                    inputProps={{ min: 0, step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* 4. Acoustic Properties */}
            <FormSection icon={<VolumeUpIcon />} title="Proprietăți Acustice" color="success">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Proprietăți Acustice</InputLabel>
                    <Select
                      value={productForm.acoustic_properties}
                      label="Proprietăți Acustice"
                      onChange={handleFieldChange('acoustic_properties')}
                    >
                      <MenuItem value="decorativ">Doar Decorativ</MenuItem>
                      <MenuItem value="fonoabsorbant">Fonoabsorbant</MenuItem>
                      <MenuItem value="izolant fonix">Izolant Fonic</MenuItem>
                      <MenuItem value="mixt">Decorativ + Acustic</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rating Acustic (NRC)"
                    value={productForm.acoustic_rating}
                    onChange={handleFieldChange('acoustic_rating')}
                    placeholder="ex: NRC 0.85, α 0.90"
                    helperText="Coeficient absorbție zgomot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Material Suport Acustic"
                    value={productForm.acoustic_backing}
                    onChange={handleFieldChange('acoustic_backing')}
                    placeholder="ex: Fetru acustic 9mm, Spumă absorbantă"
                    helperText="Pentru panouri acustice"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* 5. Surface & Mounting */}
            <FormSection icon={<BuildIcon />} title="Suprafață și Montaj" color="warning">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tip Finisaj Suprafață"
                    value={productForm.surface_finish_type}
                    onChange={handleFieldChange('surface_finish_type')}
                    placeholder="ex: Mat, Ultramat, Synchro, Auriu Metalic"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sistem Montaj</InputLabel>
                    <Select
                      value={productForm.mounting_system}
                      label="Sistem Montaj"
                      onChange={handleFieldChange('mounting_system')}
                    >
                      <MenuItem value="lipire">Lipire cu Adeziv</MenuItem>
                      <MenuItem value="înșurubare">Înșurubare</MenuItem>
                      <MenuItem value="profile montaj">Profile de Montaj</MenuItem>
                      <MenuItem value="kit complet">Kit Complet cu Accesorii</MenuItem>
                      <MenuItem value="sistem premium">Sistem Premium</MenuItem>
                      <MenuItem value="magnetic">Montaj Magnetic</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Orientare Panou</InputLabel>
                    <Select
                      value={productForm.panel_orientation}
                      label="Orientare Panou"
                      onChange={handleFieldChange('panel_orientation')}
                    >
                      <MenuItem value="vertical">Vertical</MenuItem>
                      <MenuItem value="orizontal">Orizontal</MenuItem>
                      <MenuItem value="ambele">Ambele Orientări</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Dificultate Instalare</InputLabel>
                    <Select
                      value={productForm.installation_difficulty}
                      label="Dificultate Instalare"
                      onChange={handleFieldChange('installation_difficulty')}
                    >
                      <MenuItem value="ușoară">Ușoară (DIY)</MenuItem>
                      <MenuItem value="medie">Medie (Experiență Necesară)</MenuItem>
                      <MenuItem value="avansată">Avansată (Profesional)</MenuItem>
                      <MenuItem value="specializată">Specializată</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </FormSection>

            {/* 6. Performance & Safety */}
            <FormSection icon={<SecurityIcon />} title="Performanță și Siguranță" color="error">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Clasa Rezistență Foc"
                    value={productForm.fire_resistance_class}
                    onChange={handleFieldChange('fire_resistance_class')}
                    placeholder="ex: B-s1,d0, A2-s1,d0"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Certificări Ecologice"
                    value={productForm.environmental_rating}
                    onChange={handleFieldChange('environmental_rating')}
                    placeholder="ex: E1, FSC, PEFC, Low VOC"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Rezistență Umiditate</InputLabel>
                    <Select
                      value={productForm.moisture_resistance}
                      label="Rezistență Umiditate"
                      onChange={handleFieldChange('moisture_resistance')}
                    >
                      <MenuItem value="scăzută">Scăzută (Interior Uscat)</MenuItem>
                      <MenuItem value="medie">Medie (Interior Normal)</MenuItem>
                      <MenuItem value="ridicată">Ridicată (Bucătărie, Baie)</MenuItem>
                      <MenuItem value="excelentă">Excelentă (Exterior)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={productForm.uv_resistance}
                        onChange={handleSwitchChange('uv_resistance')}
                        color="warning"
                      />
                    }
                    label="Rezistență UV (Exterior)"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* 7. Colors & Finishes */}
            <FormSection icon={<PaletteIcon />} title="Culori și Finisaje" color="secondary">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Culoare Principală"
                    value={productForm.color}
                    onChange={handleFieldChange('color')}
                    placeholder="ex: Stejar Natural, Gri Antracit"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Finisaj"
                    value={productForm.finish}
                    onChange={handleFieldChange('finish')}
                    placeholder="ex: Mat Natural, Premium Cognac"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tip Întreținere</InputLabel>
                    <Select
                      value={productForm.maintenance_type}
                      label="Tip Întreținere"
                      onChange={handleFieldChange('maintenance_type')}
                    >
                      <MenuItem value="ușoară">Ușoară</MenuItem>
                      <MenuItem value="medie">Medie</MenuItem>
                      <MenuItem value="intensivă">Intensivă</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Variante Culoare Disponibile"
                    value={productForm.color_variants}
                    onChange={handleFieldChange('color_variants')}
                    placeholder="ex: Stejar Natural, Stejar Cognac, Stejar Vintage"
                    helperText="Separate prin virgulă variantele de culoare"
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* 8. Installation & Usage */}
            <FormSection icon={<HomeIcon />} title="Instalare și Utilizare" color="info">
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Zonă Instalare</InputLabel>
                    <Select
                      value={productForm.installation_area}
                      label="Zonă Instalare"
                      onChange={handleFieldChange('installation_area')}
                    >
                      <MenuItem value="interior">Doar Interior</MenuItem>
                      <MenuItem value="exterior">Doar Exterior</MenuItem>
                      <MenuItem value="ambele">Interior și Exterior</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="URL Imagine"
                    value={productForm.image_url}
                    onChange={handleFieldChange('image_url')}
                    placeholder="https://example.com/image.jpg"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Zone de Utilizare"
                    value={productForm.usage_area}
                    onChange={handleFieldChange('usage_area')}
                    placeholder="ex: Living, Dormitor, Birou, Studio, Restaurant"
                    helperText="Separate prin virgulă zonele recomandate"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Status stoc"
                    value={productForm.stock_status}
                    onChange={handleInputChange('stock_status')}
                    fullWidth
                    size="medium"
                    helperText="Selectează statusul disponibilității produsului"
                    SelectProps={{
                      MenuProps: {
                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        PaperProps: {
                          sx: {
                            maxHeight: 200,
                            zIndex: (theme) => theme.zIndex.modal + 100,
                            boxShadow: (theme) => theme.shadows[8],
                            '& .MuiMenuItem-root': {
                              fontSize: '0.875rem',
                              minHeight: 36,
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="available">Disponibil</MenuItem>
                    <MenuItem value="out_of_stock">Epuizat</MenuItem>
                    <MenuItem value="coming_soon">În curând</MenuItem>
                    <MenuItem value="discontinued">Discontinued</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </FormSection>
          </Stack>
        </Grid>

        {/* Quick Preview Sidebar */}
        <Grid item xs={12} md={4}>
          <QuickPreview />
        </Grid>
      </Grid>
    </Box>
  )
}

export default EnhancedRiflajForm