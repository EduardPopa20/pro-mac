import React from 'react'
import {
  Box,
  Typography,
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
  useTheme,
  Grid
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
  PhotoCamera
} from '@mui/icons-material'
import ImageUpload from '../common/ImageUpload'
import type { Category } from '../../types'

interface ProductFormData {
  [key: string]: string | number | boolean | null
}

interface EnhancedProductFormProps {
  productForm: ProductFormData
  setProductForm: (updater: (prev: ProductFormData) => ProductFormData) => void
  categories?: Category[]
  currentImagePath?: string
  onImageUpload?: (imagePath: string) => void
  saving?: boolean
  onSave?: () => void
  onCancel?: () => void
  hideCategories?: boolean
  categoryType?: 'faianta' | 'gresie' | 'parchet' | 'riflaje'
}

const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
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
  
  // Validation helper
  const isFormValid = () => {
    const hasName = productForm.name && String(productForm.name).trim().length > 0
    const hasPrice = productForm.price && String(productForm.price).trim().length > 0 && Number(productForm.price) > 0
    
    
    return hasName && hasPrice
  }

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
      <Stack spacing={4}>
        
        {/* Image Upload Section - Full Width */}
        <FormSection
          icon={<PhotoCamera />}
          title="Imagine Produs"
          color="warning"
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 200,
            py: 2
          }}>
            <ImageUpload
              currentImagePath={currentImagePath}
              onImageUpload={onImageUpload}
              bucketName="product-images"
              folder="products"
              maxSizeInMB={10}
              acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            />
          </Box>
        </FormSection>

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
                      onChange={(e) => {
                        setProductForm(prev => ({ ...prev, name: e.target.value }))
                      }}
                      fullWidth
                      placeholder="Introduceti numele produsului"
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
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Descriere completă a produsului..."
                    />
                  </FormField>
                </Grid>

                {!hideCategories && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormField label="Categorie" required>
                      <FormControl fullWidth>
                        <Select
                          value={productForm.category_id || ''}
                          onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value as number }))}
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
                
                {/* Category indicator removed from basic info card - now shown in page header */}
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
                  <FormField label="Brand" helper="Numele producătorului">
                    <TextField
                      value={productForm.brand}
                      onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                      fullWidth
                      placeholder="ex: CERAMAXX"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Cod Produs" helper="Codul oficial al producătorului">
                    <TextField
                      value={productForm.product_code}
                      onChange={(e) => setProductForm(prev => ({ ...prev, product_code: e.target.value }))}
                      fullWidth
                      placeholder="ex: 31326"
                    />
                  </FormField>
                </Grid>
                
{/* SKU field removed - not used in business logic */}
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Grad Calitate" helper="Calitatea produsului (1=Premium, 3=Economic)">
                    <FormControl fullWidth>
                      <Select
                        value={productForm.quality_grade}
                        onChange={(e) => setProductForm(prev => ({ ...prev, quality_grade: e.target.value }))}
                        displayEmpty
                      >
                        <MenuItem value="">Nu selectat</MenuItem>
                        <MenuItem value="1">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="1" color="success" size="small" />
                            Premium
                          </Box>
                        </MenuItem>
                        <MenuItem value="2">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="2" color="info" size="small" />
                            Standard
                          </Box>
                        </MenuItem>
                        <MenuItem value="3">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label="3" color="warning" size="small" />
                            Economic
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 3. Technical Specifications */}
            <FormSection
              icon={<Build />}
              title="Specificații Tehnice"
              color="info"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Dimensiuni" helper="ex: 30x60 cm">
                    <TextField
                      value={productForm.dimensions}
                      onChange={(e) => setProductForm(prev => ({ ...prev, dimensions: e.target.value }))}
                      fullWidth
                      placeholder="30x60 cm"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Grosime (mm)" helper="Grosimea în milimetri">
                    <TextField
                      type="number"
                      value={productForm.thickness}
                      onChange={(e) => setProductForm(prev => ({ ...prev, thickness: e.target.value }))}
                      fullWidth
                      placeholder="8.5"
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Material">
                    <TextField
                      value={productForm.material}
                      onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                      fullWidth
                      placeholder="Ceramică, Porțelan, etc."
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Finisaj Suprafață">
                    <TextField
                      value={productForm.surface_finish}
                      onChange={(e) => setProductForm(prev => ({ ...prev, surface_finish: e.target.value }))}
                      fullWidth
                      placeholder="Mat, Lucios, Satinat"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Textură">
                    <TextField
                      value={productForm.texture}
                      onChange={(e) => setProductForm(prev => ({ ...prev, texture: e.target.value }))}
                      fullWidth
                      placeholder="Marble-like, Wood-like"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Culoare">
                    <TextField
                      value={productForm.color}
                      onChange={(e) => setProductForm(prev => ({ ...prev, color: e.target.value }))}
                      fullWidth
                      placeholder="Alb, Gri, Maro"
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <FormField label="Țara de Origine">
                    <TextField
                      value={productForm.origin_country}
                      onChange={(e) => setProductForm(prev => ({ ...prev, origin_country: e.target.value }))}
                      fullWidth
                      placeholder="Italia, Spania, Turcia"
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 4. Physical Properties */}
            <FormSection
              icon={<Inventory />}
              title="Proprietăți Fizice"
              color="success"
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Greutate cutie (kg)">
                    <TextField
                      type="number"
                      value={productForm.weight_per_box}
                      onChange={(e) => setProductForm(prev => ({ ...prev, weight_per_box: e.target.value }))}
                      fullWidth
                      placeholder="25.5"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </FormField>
                </Grid>
                
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Plăci per cutie">
                    <TextField
                      type="number"
                      value={productForm.tiles_per_box}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tiles_per_box: e.target.value }))}
                      fullWidth
                      placeholder="8"
                      inputProps={{ min: 0 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormField label="Suprafață per cutie (m²)" helperText="Pentru calculator">
                    <TextField
                      type="number"
                      value={productForm.area_per_box}
                      onChange={(e) => setProductForm(prev => ({ ...prev, area_per_box: e.target.value }))}
                      fullWidth
                      placeholder="1.44"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        endAdornment: <Typography variant="caption" color="text.secondary">m²</Typography>
                      }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 5. Technical Capabilities */}
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
                          checked={productForm.is_rectified}
                          onChange={(e) => setProductForm(prev => ({ ...prev, is_rectified: e.target.checked }))}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Rectificat
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Muchii tăiate la 90° pentru montaj precis
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_frost_resistant}
                          onChange={(e) => setProductForm(prev => ({ ...prev, is_frost_resistant: e.target.checked }))}
                          color="info"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Rezistent la îngheț
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Potrivit pentru utilizare exterioară
                          </Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.is_floor_heating_compatible}
                          onChange={(e) => setProductForm(prev => ({ ...prev, is_floor_heating_compatible: e.target.checked }))}
                          color="warning"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            Compatibil pardoseală încălzită
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Poate fi folosit cu sisteme de încălzire în pardoseală
                          </Typography>
                        </Box>
                      }
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Zone de utilizare
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.suitable_for_walls}
                          onChange={(e) => setProductForm(prev => ({ ...prev, suitable_for_walls: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Potrivit pentru pereți"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.suitable_for_floors}
                          onChange={(e) => setProductForm(prev => ({ ...prev, suitable_for_floors: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Potrivit pentru podea"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.suitable_for_exterior}
                          onChange={(e) => setProductForm(prev => ({ ...prev, suitable_for_exterior: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Potrivit pentru exterior"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={productForm.suitable_for_commercial}
                          onChange={(e) => setProductForm(prev => ({ ...prev, suitable_for_commercial: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label="Potrivit pentru spații comerciale"
                    />
                  </Stack>
                </Box>
              </Stack>
            </FormSection>

            {/* 6. Pricing & Stock */}
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
                      onChange={(e) => {
                        setProductForm(prev => ({ ...prev, price: e.target.value }))
                      }}
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
                        value={productForm.price_unit}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price_unit: e.target.value }))}
                      >
                        <MenuItem value="mp">per m²</MenuItem>
                        <MenuItem value="buc">per bucată</MenuItem>
                        <MenuItem value="cutie">per cutie</MenuItem>
                      </Select>
                    </FormControl>
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Preț Standard (lei)" helper="Prețul înainte de oferte">
                    <TextField
                      type="number"
                      value={productForm.standard_price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, standard_price: e.target.value }))}
                      fullWidth
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Preț Ofertă (lei)" helper="Prețul redus pentru oferte speciale">
                    <TextField
                      type="number"
                      value={productForm.special_price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, special_price: e.target.value }))}
                      fullWidth
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </FormField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField label="Stoc Disponibil (m²)">
                    <TextField
                      type="number"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
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
                      onChange={(e) => setProductForm(prev => ({ ...prev, estimated_delivery_days: e.target.value }))}
                      fullWidth
                      inputProps={{ min: 1 }}
                    />
                  </FormField>
                </Grid>
              </Grid>
            </FormSection>

            {/* 7. Application Areas & Additional Details */}
            <FormSection
              icon={<Description />}
              title="Zone de aplicare și detalii"
              color="info"
            >
              <Stack spacing={3}>
                <FormField 
                  label="Zone de aplicare" 
                  helper="Separați zonele prin virgulă (ex: Living Room, Kitchen, Bathroom)"
                >
                  <TextField
                    value={productForm.application_areas}
                    onChange={(e) => setProductForm(prev => ({ ...prev, application_areas: e.target.value }))}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Living Room, Kitchen, Bathroom, Commercial Spaces"
                  />
                </FormField>
                
                <FormField label="Instrucțiuni Montaj">
                  <TextField
                    value={productForm.installation_notes}
                    onChange={(e) => setProductForm(prev => ({ ...prev, installation_notes: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Instrucțiuni detaliate pentru instalare..."
                  />
                </FormField>
                
                <FormField label="Instrucțiuni Îngrijire">
                  <TextField
                    value={productForm.care_instructions}
                    onChange={(e) => setProductForm(prev => ({ ...prev, care_instructions: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Instrucțiuni pentru întreținere și curățenie..."
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* 8. Action Buttons */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                Acțiuni
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onSave}
                  disabled={saving || !isFormValid()}
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
  )
}

export default EnhancedProductForm