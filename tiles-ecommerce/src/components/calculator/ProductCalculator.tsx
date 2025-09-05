import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Chip,
  Paper
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Straighten as StraightenIcon,
  Layers as LayersIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import type {
  ProductCalculatorType,
  CalculationInput,
  CalculationResult,
  RoomDimensions,
  WallDimensions,
  ProductSpecifications
} from '../../types/calculator'
import { WASTAGE_OPTIONS } from '../../types/calculator'
import {
  calculateProductNeeds,
  formatArea,
  getCalculatorTitle,
  getCalculatorDescription
} from '../../utils/calculatorUtils'
import type { Product } from '../../types'

interface ProductCalculatorProps {
  open: boolean
  onClose: () => void
  product: Product
  calculatorType: ProductCalculatorType
  embedded?: boolean
}

export default function ProductCalculator({ 
  open, 
  onClose, 
  product, 
  calculatorType,
  embedded = false
}: ProductCalculatorProps) {
  // Remove cart functionality in embedded mode
  
  // Form state
  const [activeStep, setActiveStep] = useState(0)
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    length: 0,
    width: 0,
    height: 2.5
  })
  const [wallDimensions, setWallDimensions] = useState<WallDimensions>({
    walls: []
  })
  const [wastagePercentage, setWastagePercentage] = useState(
    WASTAGE_OPTIONS[calculatorType][0].value
  )
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('simple')
  const [installationType, setInstallationType] = useState<'standard' | 'diagonal'>('standard')
  
  // Calculation result
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Get product specifications from the product
  const getProductSpecs = useCallback((): ProductSpecifications => {
    // Extract coverage from product specifications
    // Use area_per_box first, then fall back to specifications
    const specs: ProductSpecifications = {
      coveragePerBox: product.area_per_box || 
                     product.specifications?.coverage_per_box || 
                     1.44, // Default value
      piecesPerBox: product.tiles_per_box || 
                   product.specifications?.pieces_per_box
    }

    // Add tile dimensions if available (from dimensions string or specifications)
    if (product.dimensions) {
      // Parse dimensions string like "60x120" or "60 x 120"
      const match = product.dimensions.match(/(\d+)\s*[xX]\s*(\d+)/)
      if (match) {
        specs.tileWidth = parseInt(match[1])
        specs.tileHeight = parseInt(match[2])
      }
    } else if (product.specifications?.width && product.specifications?.height) {
      specs.tileWidth = product.specifications.width
      specs.tileHeight = product.specifications.height
    }

    return specs
  }, [product])

  // Steps configuration
  const getSteps = () => {
    if (calculatorType === 'faianta') {
      return ['Dimensiuni pereți', 'Procent pierderi', 'Rezultat calcul']
    }
    return ['Dimensiuni cameră', 'Procent pierderi', 'Rezultat calcul']
  }

  // Handle room dimension changes
  const handleRoomDimensionChange = (field: keyof RoomDimensions) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRoomDimensions(prev => ({
        ...prev,
        [field]: parseFloat(event.target.value) || 0
      }))
      setError(null)
    }

  // Add wall for faianta calculator
  const addWall = () => {
    setWallDimensions(prev => ({
      walls: [
        ...prev.walls,
        {
          id: `wall-${Date.now()}`,
          length: 0,
          height: 2.5,
          openings: []
        }
      ]
    }))
  }

  // Update wall dimensions
  const updateWall = (wallId: string, field: 'length' | 'height', value: number) => {
    setWallDimensions(prev => ({
      walls: prev.walls.map(wall =>
        wall.id === wallId ? { ...wall, [field]: value } : wall
      )
    }))
    setError(null)
  }

  // Remove wall
  const removeWall = (wallId: string) => {
    setWallDimensions(prev => ({
      walls: prev.walls.filter(wall => wall.id !== wallId)
    }))
  }

  // Perform calculation
  const performCalculation = () => {
    try {
      const input: CalculationInput = {
        calculatorType,
        roomDimensions: calculatorType !== 'faianta' ? roomDimensions : undefined,
        wallDimensions: calculatorType === 'faianta' ? wallDimensions : undefined,
        productSpecs: getProductSpecs(),
        wastagePercentage,
        installationType: installationType as any,
        complexity
      }

      const calculationResult = calculateProductNeeds(input)
      setResult(calculationResult)
      setActiveStep(getSteps().length - 1)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Eroare la calcul')
      setResult(null)
    }
  }

  // Add calculated quantity to cart
  const handleAddToCart = () => {
    if (result) {
      // Add the product with calculated quantity
      for (let i = 0; i < result.boxesNeeded; i++) {
        addToCart(product)
      }
      
      onClose()
    }
  }

  // Download PDF with calculation results
  const handleDownloadPDF = () => {
    if (result) {
      const pdfOptions = {
        result,
        product,
        calculatorType,
        roomDimensions: calculatorType !== 'faianta' ? roomDimensions : undefined
      }
      
      const filename = `calculator_${product.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      downloadCalculationPDF(pdfOptions, filename)
    }
  }

  // Reset calculator
  const handleReset = () => {
    setActiveStep(0)
    setRoomDimensions({ length: 0, width: 0, height: 2.5 })
    setWallDimensions({ walls: [] })
    setResult(null)
    setError(null)
  }

  const steps = getSteps()

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CalculateIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              {getCalculatorTitle(calculatorType)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {getCalculatorDescription(calculatorType)} pentru {product.name}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Dimensions */}
          <Step>
            <StepLabel>
              {calculatorType === 'faianta' ? 'Dimensiuni pereți' : 'Dimensiuni cameră'}
            </StepLabel>
            <StepContent>
              {calculatorType === 'faianta' ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Adăugați dimensiunile fiecărui perete care va fi placat.
                    Puteți scădea suprafața ferestrelor și ușilor.
                  </Alert>
                  
                  <Button
                    variant="outlined"
                    onClick={addWall}
                    startIcon={<LayersIcon />}
                    sx={{ mb: 2 }}
                  >
                    Adaugă perete
                  </Button>

                  {wallDimensions.walls.map((wall, index) => (
                    <Paper key={wall.id} sx={{ p: 2, mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2">
                          Perete {index + 1}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => removeWall(wall.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <TextField
                            label="Lungime (m)"
                            type="number"
                            fullWidth
                            value={wall.length || ''}
                            onChange={(e) => updateWall(
                              wall.id, 
                              'length', 
                              parseFloat(e.target.value) || 0
                            )}
                            inputProps={{ step: 0.1, min: 0 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Înălțime (m)"
                            type="number"
                            fullWidth
                            value={wall.height || ''}
                            onChange={(e) => updateWall(
                              wall.id, 
                              'height', 
                              parseFloat(e.target.value) || 0
                            )}
                            inputProps={{ step: 0.1, min: 0 }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  {wallDimensions.walls.length === 0 && (
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                      Adăugați cel puțin un perete pentru calcul
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Introduceți dimensiunile camerei pentru a calcula necesarul
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lungime (m)"
                        type="number"
                        fullWidth
                        value={roomDimensions.length || ''}
                        onChange={handleRoomDimensionChange('length')}
                        inputProps={{ step: 0.1, min: 0 }}
                        InputProps={{
                          startAdornment: <StraightenIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Lățime (m)"
                        type="number"
                        fullWidth
                        value={roomDimensions.width || ''}
                        onChange={handleRoomDimensionChange('width')}
                        inputProps={{ step: 0.1, min: 0 }}
                        InputProps={{
                          startAdornment: <StraightenIcon fontSize="small" color="action" sx={{ mr: 1, transform: 'rotate(90deg)' }} />
                        }}
                      />
                    </Grid>
                  </Grid>

                  {roomDimensions.length > 0 && roomDimensions.width > 0 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Suprafață: {formatArea(roomDimensions.length * roomDimensions.width)}
                    </Alert>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(1)}
                  disabled={
                    calculatorType === 'faianta' 
                      ? wallDimensions.walls.length === 0
                      : roomDimensions.length === 0 || roomDimensions.width === 0
                  }
                >
                  Continuă
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Wastage */}
          <Step>
            <StepLabel>Procent pierderi și complexitate</StepLabel>
            <StepContent>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Selectați procentul de rezervă recomandat:
                </Typography>
                
                <RadioGroup
                  value={wastagePercentage}
                  onChange={(e) => setWastagePercentage(parseInt(e.target.value))}
                >
                  {WASTAGE_OPTIONS[calculatorType].map(option => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1">
                            {option.label}
                            {option.recommended && (
                              <Chip 
                                label="Recomandat" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </RadioGroup>

                {calculatorType === 'gresie' && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tip montaj:
                    </Typography>
                    <RadioGroup
                      value={installationType}
                      onChange={(e) => setInstallationType(e.target.value as any)}
                    >
                      <FormControlLabel
                        value="standard"
                        control={<Radio />}
                        label="Standard (paralel cu pereții)"
                      />
                      <FormControlLabel
                        value="diagonal"
                        control={<Radio />}
                        label="Diagonal (45°)"
                      />
                    </RadioGroup>
                  </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                  >
                    Înapoi
                  </Button>
                  <Button
                    variant="contained"
                    onClick={performCalculation}
                    startIcon={<CalculateIcon />}
                  >
                    Calculează
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Results */}
          <Step>
            <StepLabel>Rezultat calcul</StepLabel>
            <StepContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {result && (
                <Box>
                  <Grid container spacing={3}>
                    {/* Main results */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom color="primary">
                            Cantități calculate
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <HomeIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Suprafață de bază"
                                secondary={formatArea(result.baseArea)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <LayersIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={`Suprafață cu rezervă (+${result.wastagePercentage}%)`}
                                secondary={formatArea(result.totalArea)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <CheckCircleIcon fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Cutii necesare"
                                secondary={
                                  <Typography variant="h5" color="primary">
                                    {result.boxesNeeded} cutii
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {result.piecesNeeded && (
                              <ListItem>
                                <ListItemIcon>
                                  <LayersIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Plăci necesare"
                                  secondary={`${result.piecesNeeded} bucăți`}
                                />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Cost breakdown */}
                    <Grid item xs={12} md={6}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom color="primary">
                            Estimare costuri
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <AttachMoneyIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={product.name}
                                secondary={formatPrice(result.productCost)}
                              />
                            </ListItem>
                            {result.additionalMaterials?.map((material, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <LayersIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`${material.name} (${material.quantity} ${material.unit})`}
                                  secondary={material.totalPrice ? formatPrice(material.totalPrice) : 'N/A'}
                                />
                              </ListItem>
                            ))}
                            <Divider />
                            <ListItem>
                              <ListItemIcon>
                                <AttachMoneyIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography variant="h6">
                                    Total estimat
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="h5" color="primary">
                                    {formatPrice(result.totalCost)}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="subtitle2" gutterBottom>
                            Recomandări:
                          </Typography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {result.recommendations.map((rec, index) => (
                              <li key={index}>
                                <Typography variant="body2">{rec}</Typography>
                              </li>
                            ))}
                          </ul>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                    >
                      Recalculează
                    </Button>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadPDF}
                      >
                        Descarcă PDF
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddToCart}
                        startIcon={<ShoppingCartIcon />}
                      >
                        Adaugă {result.boxesNeeded} cutii în coș
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
    </Dialog>
  )
}