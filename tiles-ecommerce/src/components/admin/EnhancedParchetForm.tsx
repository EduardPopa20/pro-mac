import React, { useCallback } from 'react'
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
  Chip,
  Button,
  CircularProgress,
  useTheme
} from '@mui/material'
import {
  BusinessCenter,
  Info,
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

interface ParchetFormData {
  [key: string]: string | number | boolean | null
}

interface EnhancedParchetFormProps {
  productForm: ParchetFormData
  setProductForm: (updater: (prev: ParchetFormData) => ParchetFormData) => void
  categories?: Category[]
  currentImagePath?: string
  onImageUpload?: (imagePath: string) => void
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
  saving = false,
  onSave = () => {},
  onCancel = () => {},
  hideCategories = false,
  categoryType
}) => {
  const theme = useTheme()

  // Use useCallback for form handlers to prevent TextField focus loss
  const handleFieldChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.value }))
    }, [setProductForm])

  const handleSelectChange = useCallback((field: string) => 
    (e: any) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.value }))
    }, [setProductForm])

  const handleSwitchChange = useCallback((field: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setProductForm(prev => ({ ...prev, [field]: e.target.checked }))
    }, [setProductForm])

  const FormSection: React.FC<{
    icon: React.ReactNode
    title: string
    children: React.ReactNode
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info'
  }> = ({ icon, title, children, color = 'primary' }) => (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        border: `1px solid`,
        borderColor: `${color}.light`,
        borderRadius: 2,
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: theme.shadows[4]
        },
        transition: theme.transitions.create(['border-color', 'box-shadow'])
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

  const FormField: React.FC<{
    label: string
    required?: boolean
    helper?: string
    children: React.ReactNode
  }> = ({ label, required, helper, children }) => (
    <Box>
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          mb: 1,
          color: 'text.primary'
        }}
      >
        {label}
        {required && (
          <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>
      {children}
      {helper && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {helper}
        </Typography>
      )}
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={4}>
        {/* Form Sections */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={4}>
            
            {/* 1. Basic Information */}
            <FormSection
              icon={<Info />}
              title="Informații de bază"
              color="primary"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <FormField label="Nume Produs" required>
                    <TextField
                      value={productForm.name}
                      onChange={handleFieldChange('name')}
                      fullWidth
                      placeholder="ex: Parchet Laminat Egger Pure Nature Stejar Athense"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: '1.1rem',
                          fontWeight: 500
                        }
                      }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormField label="Descriere" helper="Descriere detaliată pentru clienți">
                    <TextField
                      value={productForm.description}
                      onChange={handleFieldChange('description')}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Parchet laminat de înaltă calitate cu aspect natural..."
                    />
                  </FormField>
                </Grid>

                {!hideCategories && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField label="Categorie" required>
                      <FormControl fullWidth>
                        <Select
                          value={productForm.category_id || ''}
                          onChange={handleSelectChange('category_id')}
                          displayEmpty
                        >
                          <MenuItem value="">Selectați categoria</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FormField>
                  </Grid>
                )}
                
                {hideCategories && categoryType && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: 'primary.50',
                      borderLeft: 4,
                      borderColor: 'primary.main',
                      borderRadius: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                        Categorie: {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Această pagină este specializată pentru editarea produselor de tip {categoryType}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </FormSection>

            {/* 2. Brand & Identification */}
            <FormSection
              icon={<BusinessCenter />}
              title="Brand & Identificare"
              color="secondary"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Brand" helper="ex: Egger, Kronotex" required>
                    <TextField
                      value={productForm.brand}
                      onChange={handleFieldChange('brand')}
                      fullWidth
                      placeholder="ex: Egger"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Cod Produs" helper="Codul oficial al producătorului">
                    <TextField
                      value={productForm.product_code}
                      onChange={handleFieldChange('product_code')}
                      fullWidth
                      placeholder="ex: H1061"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Cod Furnizor" helper="Codul de articol al furnizorului">
                    <TextField
                      value={productForm.supplier_code}
                      onChange={handleFieldChange('supplier_code')}
                      fullWidth
                      placeholder="ex: 1802930"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Colecție" helper="Numele colecției">
                    <TextField
                      value={productForm.collection_name}
                      onChange={handleFieldChange('collection_name')}
                      fullWidth
                      placeholder="ex: Pure Nature"
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 3. Technical Specifications - Parchet Specific */}
            <FormSection
              icon={<Build />}
              title="Specificații Tehnice"
              color="info"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Grosime (mm)" helper="ex: 8, 10, 12" required>
                    <TextField
                      type="number"
                      value={productForm.thickness_mm}
                      onChange={handleFieldChange('thickness_mm')}
                      fullWidth
                      placeholder="8"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Lățime (mm)" helper="ex: 193, 192">
                    <TextField
                      type="number"
                      value={productForm.width_mm}
                      onChange={handleFieldChange('width_mm')}
                      fullWidth
                      placeholder="193"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Lungime (mm)" helper="ex: 1292, 1285">
                    <TextField
                      type="number"
                      value={productForm.length_mm}
                      onChange={handleFieldChange('length_mm')}
                      fullWidth
                      placeholder="1292"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Clasa Trafic" helper="ex: comercial general (cl. 32)">
                    <FormControl fullWidth>
                      <Select
                        value={productForm.traffic_class || ''}
                        onChange={handleSelectChange('traffic_class')}
                        displayEmpty
                      >
                        <MenuItem value="">Selectați clasa</MenuItem>
                        <MenuItem value="rezidențial ușor (cl. 21)">Rezidențial ușor (cl. 21)</MenuItem>
                        <MenuItem value="rezidențial normal (cl. 22)">Rezidențial normal (cl. 22)</MenuItem>
                        <MenuItem value="rezidențial intens (cl. 23)">Rezidențial intens (cl. 23)</MenuItem>
                        <MenuItem value="comercial ușor (cl. 31)">Comercial ușor (cl. 31)</MenuItem>
                        <MenuItem value="comercial general (cl. 32)">Comercial general (cl. 32)</MenuItem>
                        <MenuItem value="comercial intens (cl. 33)">Comercial intens (cl. 33)</MenuItem>
                        <MenuItem value="comercial foarte intens (cl. 34)">Comercial foarte intens (cl. 34)</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Tip Sol" helper="ex: clasic, premium, vintage">
                    <FormControl fullWidth>
                      <Select
                        value={productForm.floor_type || ''}
                        onChange={handleSelectChange('floor_type')}
                        displayEmpty
                      >
                        <MenuItem value="">Selectați tipul</MenuItem>
                        <MenuItem value="clasic">Clasic</MenuItem>
                        <MenuItem value="premium">Premium</MenuItem>
                        <MenuItem value="vintage">Vintage</MenuItem>
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="rustic">Rustic</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Tip Montaj" helper="ex: sistem CLIC it">
                    <TextField
                      value={productForm.installation_type}
                      onChange={handleFieldChange('installation_type')}
                      fullWidth
                      placeholder="ex: sistem CLIC it"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Esență Lemn" helper="ex: stejar, nuc, brad" required>
                    <FormControl fullWidth>
                      <Select
                        value={productForm.wood_essence || ''}
                        onChange={handleSelectChange('wood_essence')}
                        displayEmpty
                      >
                        <MenuItem value="">Selectați esența</MenuItem>
                        <MenuItem value="stejar">Stejar</MenuItem>
                        <MenuItem value="nuc">Nuc</MenuItem>
                        <MenuItem value="brad">Brad</MenuItem>
                        <MenuItem value="fag">Fag</MenuItem>
                        <MenuItem value="cires">Cireș</MenuItem>
                        <MenuItem value="frasin">Frasin</MenuItem>
                        <MenuItem value="pin">Pin</MenuItem>
                        <MenuItem value="bambus">Bambus</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormField label="Material Miez" helper="ex: HDF, MDF">
                    <FormControl fullWidth>
                      <Select
                        value={productForm.core_material || ''}
                        onChange={handleSelectChange('core_material')}
                        displayEmpty
                      >
                        <MenuItem value="">Selectați materialul</MenuItem>
                        <MenuItem value="HDF">HDF (High Density Fiberboard)</MenuItem>
                        <MenuItem value="MDF">MDF (Medium Density Fiberboard)</MenuItem>
                        <MenuItem value="OSB">OSB (Oriented Strand Board)</MenuItem>
                        <MenuItem value="Lemn solid">Lemn solid</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 4. Physical Properties - Parchet Specific */}
            <FormSection
              icon={<Inventory />}
              title="Proprietăți Fizice"
              color="success"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Suprafață per pachet (m²)" helper="ex: 1.995">
                    <TextField
                      type="number"
                      value={productForm.surface_per_package}
                      onChange={handleFieldChange('surface_per_package')}
                      fullWidth
                      placeholder="1.995"
                      inputProps={{ min: 0, step: 0.001 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Bucăți per pachet" helper="ex: 8">
                    <TextField
                      type="number"
                      value={productForm.pieces_per_package}
                      onChange={handleFieldChange('pieces_per_package')}
                      fullWidth
                      placeholder="8"
                      inputProps={{ min: 0 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Textură Suprafață" helper="ex: stejar, netedă">
                    <TextField
                      value={productForm.surface_texture}
                      onChange={handleFieldChange('surface_texture')}
                      fullWidth
                      placeholder="ex: stejar"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormField label="Locație Instalare" helper="Descriere zonă de instalare">
                    <TextField
                      value={productForm.installation_location}
                      onChange={handleFieldChange('installation_location')}
                      fullWidth
                      placeholder="ex: HDF swell barrier*"
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 5. Technical Capabilities - Parchet Specific */}
            <FormSection
              icon={<CheckCircle />}
              title="Capabilități Tehnice"
              color="success"
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Proprietăți speciale
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_antistatic}
                          onChange={handleSwitchChange('is_antistatic')}
                          color="info"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Antiestatic
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Produs cu proprietăți antiestatice
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Box>

                <Box>
                  <FormField label="Compatibilitate încălzire în pardoseală">
                    <TextField
                      value={productForm.underfloor_heating_compatible}
                      onChange={handleFieldChange('underfloor_heating_compatible')}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="ex: încălzire termică și electrică în pardoseală"
                    />
                  </FormField>
                </Box>

                <Box>
                  <FormField label="Zone potrivite">
                    <TextField
                      value={productForm.suitable_areas}
                      onChange={handleFieldChange('suitable_areas')}
                      fullWidth
                      placeholder="ex: zone rezidențiale și comerciale"
                    />
                  </FormField>
                </Box>
              </Stack>
            </FormSection>

            {/* 6. Warranty & Legal */}
            <FormSection
              icon={<Engineering />}
              title="Garanție & Detalii Legale"
              color="warning"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Garanție Fizică (luni)" helper="Garanția fizică în luni">
                    <TextField
                      type="number"
                      value={productForm.physical_warranty_years}
                      onChange={handleFieldChange('physical_warranty_years')}
                      fullWidth
                      placeholder="240"
                      inputProps={{ min: 0 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Garanție Juridică (luni)" helper="Garanția juridică în luni">
                    <TextField
                      type="number"
                      value={productForm.juridical_warranty_years}
                      onChange={handleFieldChange('juridical_warranty_years')}
                      fullWidth
                      placeholder="60"
                      inputProps={{ min: 0 }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 7. Pricing & Stock */}
            <FormSection
              icon={<LocalOffer />}
              title="Preț & Stoc"
              color="warning"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Preț Curent (lei)" required>
                    <TextField
                      type="number"
                      value={productForm.price}
                      onChange={handleFieldChange('price')}
                      fullWidth
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: 'warning.main'
                        }
                      }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Unitate Preț">
                    <FormControl fullWidth>
                      <Select
                        value={productForm.price_unit || 'mp'}
                        onChange={handleSelectChange('price_unit')}
                      >
                        <MenuItem value="mp">per m²</MenuItem>
                        <MenuItem value="pachet">per pachet</MenuItem>
                        <MenuItem value="buc">per bucată</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Stoc Disponibil (m²)">
                    <TextField
                      type="number"
                      value={productForm.stock_quantity}
                      onChange={handleFieldChange('stock_quantity')}
                      fullWidth
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Timp Livrare (zile)">
                    <TextField
                      type="number"
                      value={productForm.estimated_delivery_days}
                      onChange={handleFieldChange('estimated_delivery_days')}
                      fullWidth
                      inputProps={{ min: 1 }}
                      placeholder="7"
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 8. Additional Details */}
            <FormSection
              icon={<Description />}
              title="Detalii suplimentare"
              color="info"
            >
              <Stack spacing={3}>
                <FormField label="Instrucțiuni Montaj">
                  <TextField
                    value={productForm.installation_notes}
                    onChange={handleFieldChange('installation_notes')}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Instrucțiuni detaliate pentru instalarea parchetului..."
                  />
                </FormField>
                
                <FormField label="Instrucțiuni Îngrijire">
                  <TextField
                    value={productForm.care_instructions}
                    onChange={handleFieldChange('care_instructions')}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Instrucțiuni pentru întreținerea și curățenia parchetului..."
                  />
                </FormField>

                <FormField label="Culoare" helper="Descrierea culorii produsului">
                  <TextField
                    value={productForm.color}
                    onChange={handleFieldChange('color')}
                    fullWidth
                    placeholder="ex: Stejar Natural, Nuc Clasic"
                  />
                </FormField>

                <FormField label="Zone de utilizare" helper="ex: Living, Dormitor, Birou">
                  <TextField
                    value={productForm.usage_area}
                    onChange={handleFieldChange('usage_area')}
                    fullWidth
                    placeholder="ex: Living, Dormitor, Birou"
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* 9. Status */}
            <FormSection
              icon={<Settings />}
              title="Status Produs"
              color="secondary"
            >
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
                    },
                    // Prevent backdrop interference
                    BackdropProps: {
                      invisible: true,
                    },
                    // Prevent focus trapping issues
                    disableAutoFocus: true,
                    disableEnforceFocus: true,
                    disableRestoreFocus: true,
                    // Fast exit transition
                    transitionDuration: {
                      enter: 225,
                      exit: 50,
                    },
                    // Force cleanup
                    keepMounted: false,
                  },
                  // Add explicit close handler to force cleanup
                  onClose: () => {
                    setTimeout(() => {
                      if (document.activeElement && document.activeElement !== document.body) {
                        (document.activeElement as HTMLElement).blur?.()
                      }
                    }, 100)
                  },
                }}
              >
                <MenuItem value="available">Disponibil</MenuItem>
                <MenuItem value="out_of_stock">Epuizat</MenuItem>
                <MenuItem value="coming_soon">În curând</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
              </TextField>
            </FormSection>

          </Stack>
        </Grid>

        {/* Sidebar with image and actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ 
            position: 'sticky', 
            top: (theme) => theme.spacing(3), // 24px
            zIndex: (theme) => theme.zIndex.sticky,
            alignSelf: 'flex-start'
          }}>
            <Stack spacing={3}>
              
              {/* Image Upload Section */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Imagine Parchet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Încărcați o imagine reprezentativă pentru parchet
                </Typography>
                <ImageUpload
                  currentImagePath={currentImagePath}
                  onImageUpload={onImageUpload}
                  bucketName="product-images"
                  folder="parchet"
                  maxSizeInMB={10}
                  acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                />
              </Paper>

              {/* Quick Preview */}
              {(productForm.brand || productForm.wood_essence || productForm.thickness_mm) && (
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Previzualizare Rapidă
                  </Typography>
                  <Stack spacing={1}>
                    {productForm.brand && (
                      <Chip 
                        label={`Brand: ${productForm.brand}`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    )}
                    {productForm.wood_essence && (
                      <Chip 
                        label={`Esență: ${productForm.wood_essence}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    )}
                    {productForm.thickness_mm && (
                      <Chip 
                        label={`Grosime: ${productForm.thickness_mm}mm`} 
                        size="small" 
                        color="info" 
                        variant="outlined" 
                      />
                    )}
                    {(productForm.width_mm && productForm.length_mm) && (
                      <Chip 
                        label={`Dimensiuni: ${productForm.width_mm}×${productForm.length_mm}mm`} 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Action Buttons */}
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  Acțiuni
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onSave}
                    disabled={saving || !productForm.name?.toString().trim()}
                    startIcon={saving ? <CircularProgress size={20} /> : undefined}
                    sx={{ 
                      minHeight: 48,
                      fontWeight: 600
                    }}
                  >
                    {saving ? 'Se salvează...' : 'Salvează'} Parchet
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={onCancel}
                    disabled={saving}
                    sx={{ 
                      minHeight: 48,
                      fontWeight: 600
                    }}
                  >
                    Anulează
                  </Button>
                </Stack>
              </Paper>

            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default EnhancedParchetForm