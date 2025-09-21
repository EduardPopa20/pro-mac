import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Layers as LayersIcon
} from '@mui/icons-material'
import type {
  ProductCalculatorType,
  CalculationInput,
  CalculationResult,
  RoomDimensions,
  WallDimensions,
  ProductSpecifications,
  WastageOption
} from '../../types/calculator'
import { WASTAGE_OPTIONS } from '../../types/calculator'
import {
  calculateProductNeeds,
  formatArea,
  getCalculatorTitle,
  getCalculatorDescription
} from '../../utils/calculatorUtils'

interface SimpleCalculatorFormProps {
  calculatorType: ProductCalculatorType
}

export default function SimpleCalculatorForm({ calculatorType }: SimpleCalculatorFormProps) {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Form state
  const [roomLength, setRoomLength] = useState<string>('')
  const [roomWidth, setRoomWidth] = useState<string>('')
  const [roomHeight, setRoomHeight] = useState<string>('')
  const [wastagePercentage, setWastagePercentage] = useState<number>(
    WASTAGE_OPTIONS[calculatorType]?.find(o => o.recommended)?.value || 
    WASTAGE_OPTIONS[calculatorType]?.[0]?.value || 10
  )
  
  // Wall dimensions for faianta
  const [wallLength, setWallLength] = useState<string>('')
  const [wallHeight, setWallHeight] = useState<string>('')

  // Reset form state when calculator type changes
  useEffect(() => {
    setResult(null)
    setRoomLength('')
    setRoomWidth('')
    setRoomHeight('')
    setWallLength('')
    setWallHeight('')
    setWastagePercentage(
      WASTAGE_OPTIONS[calculatorType]?.find(o => o.recommended)?.value || 
      WASTAGE_OPTIONS[calculatorType]?.[0]?.value || 10
    )
  }, [calculatorType])

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true)
    setResult(null)
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      const specs: ProductSpecifications = {
        coveragePerBox: 1.44 // Default value
      }

      let input: CalculationInput
      
      if (calculatorType === 'faianta') {
        const walls = [{
          id: '1',
          length: parseFloat(wallLength) || 0,
          height: parseFloat(wallHeight) || 0,
          openings: []
        }]
        const wallDimensions: WallDimensions = { walls }
        input = {
          calculatorType,
          wallDimensions,
          productSpecs: specs,
          wastagePercentage
        }
      } else {
        const roomDimensions: RoomDimensions = {
          length: parseFloat(roomLength),
          width: parseFloat(roomWidth),
          height: parseFloat(roomHeight) || 2.5
        }
        input = {
          calculatorType,
          roomDimensions,
          productSpecs: specs,
          wastagePercentage
        }
      }

      const calculationResult = calculateProductNeeds(input)
      setResult(calculationResult)
    } catch (error) {
      // Calculation error - handled gracefully
    } finally {
      setIsCalculating(false)
    }
  }, [calculatorType, roomLength, roomWidth, roomHeight, wallLength, wallHeight, wastagePercentage])

  const isFormValid = () => {
    if (calculatorType === 'faianta') {
      return wallLength && wallHeight && parseFloat(wallLength) > 0 && parseFloat(wallHeight) > 0
    }
    return roomLength && roomWidth && parseFloat(roomLength) > 0 && parseFloat(roomWidth) > 0
  }

  const resetForm = () => {
    setResult(null)
    setRoomLength('')
    setRoomWidth('')
    setRoomHeight('')
    setWallLength('')
    setWallHeight('')
    setWastagePercentage(
      WASTAGE_OPTIONS[calculatorType]?.find(o => o.recommended)?.value || 
      WASTAGE_OPTIONS[calculatorType]?.[0]?.value || 10
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {getCalculatorTitle(calculatorType)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {getCalculatorDescription(calculatorType)}
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'flex',
          gap: 4,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          alignItems: 'stretch'
        }}
      >
        {/* Form Section */}
        <Box sx={{ 
          width: { xs: '100%', md: 'calc(50% - 16px)' },
          minWidth: 0,
          flexShrink: 0
        }}>
          <Card 
            variant="outlined" 
            sx={{ 
              p: 3, 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              height: 'fit-content',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.300',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              '&:hover': {
                borderColor: 'primary.light',
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              {calculatorType === 'faianta' ? 'Dimensiuni Pereți' : 'Dimensiuni Cameră'}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {calculatorType === 'faianta' ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Introduceți dimensiunile peretelui care va fi placat cu faianță.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Introduceți dimensiunile camerei pentru calculul materialului necesar.
                </Alert>
              )}
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {calculatorType === 'faianta' ? (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lungime perete (m)"
                        type="number"
                        value={wallLength}
                        onChange={(e) => setWallLength(e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          minWidth: { xs: 80, sm: 90, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Înălțime perete (m)"
                        type="number"
                        value={wallHeight}
                        onChange={(e) => setWallHeight(e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          minWidth: { xs: 80, sm: 90, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lungime cameră (m)"
                        type="number"
                        value={roomLength}
                        onChange={(e) => setRoomLength(e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          minWidth: { xs: 80, sm: 90, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Lățime cameră (m)"
                        type="number"
                        value={roomWidth}
                        onChange={(e) => setRoomWidth(e.target.value)}
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{
                          minWidth: { xs: 80, sm: 90, md: 100 },
                          '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }
                        }}
                      />
                    </Grid>
                    {calculatorType === 'faianta' && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Înălțime cameră (m)"
                          type="number"
                          value={roomHeight}
                          onChange={(e) => setRoomHeight(e.target.value)}
                          inputProps={{ min: 0, step: 0.1 }}
                          sx={{
                            minWidth: { xs: 80, sm: 90, md: 100 },
                            '& .MuiInputBase-root': {
                              fontSize: { xs: '0.875rem', md: '1rem' }
                            }
                          }}
                        />
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </Box>

            <Typography variant="h6" gutterBottom>
              Pierderi Estimate
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selectați procentul de pierderi în funcție de complexitatea montajului:
            </Typography>
            
            <RadioGroup
              value={wastagePercentage}
              onChange={(e) => setWastagePercentage(parseInt(e.target.value))}
              sx={{ mb: 3 }}
            >
              {WASTAGE_OPTIONS[calculatorType]?.map((option: WastageOption) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={option.recommended ? 600 : 400}>
                        {option.label} {option.recommended && '(Recomandat)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
              <Button
                variant="contained"
                onClick={handleCalculate}
                disabled={!isFormValid() || isCalculating}
                startIcon={isCalculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  borderRadius: 3,
                  fontWeight: 600,
                  minHeight: { xs: 44, md: 48 },
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1BA7D3 90%)',
                    boxShadow: '0 6px 10px 4px rgba(33, 203, 243, .2)',
                    transform: 'translateY(-1px)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
                    boxShadow: 'none'
                  }
                }}
              >
                {isCalculating ? 'Se calculează...' : 'Calculează'}
              </Button>
              
              {result && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    minHeight: { xs: 44, md: 48 },
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: 2
                    }
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>
          </Card>
        </Box>

        {/* Results Section */}
        <Box sx={{ 
          width: { xs: '100%', md: 'calc(50% - 16px)' },
          minWidth: 0,
          flexShrink: 0
        }}>
          <Card 
            variant="outlined" 
            sx={{ 
              p: 3, 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              minHeight: 'auto',
              borderRadius: 3,
              border: '1px solid',
              borderColor: result ? 'success.light' : 'grey.300',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              '&:hover': {
                borderColor: result ? 'success.main' : 'primary.light',
                boxShadow: 6,
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Rezultate
            </Typography>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {isCalculating ? (
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    flex: 1, 
                    minHeight: 300,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'primary.light'
                  }}
                >
                  <CircularProgress 
                    size={50} 
                    thickness={4}
                    sx={{ 
                      color: 'primary.main',
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                </Box>
              ) : result ? (
                <Box sx={{ flex: 1 }}>
                  <Grid container spacing={3}>
                    {/* First Row: Material Principal and Material Auxiliar */}
                    <Grid item xs={12}>
                      <Grid container spacing={2}>
                        {/* Main Results - always takes half the width */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <LayersIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                  Material Principal
                                </Typography>
                              </Box>
                              
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
                                    <CheckCircleIcon fontSize="small" color="success" />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Suprafață cu pierderi"
                                    secondary={formatArea(result.totalArea)}
                                  />
                                </ListItem>
                                
                                <Divider />
                                
                                <ListItem>
                                  <ListItemText 
                                    primary={
                                      <Typography variant="h6" color="primary">
                                        Cutii necesare: {result.boxesNeeded}
                                      </Typography>
                                    }
                                    secondary={`${result.wastagePercentage}% pierderi incluse`}
                                  />
                                </ListItem>
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Additional Materials - always takes the other half */}
                        <Grid item xs={12} md={6}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                Materiale Auxiliare
                              </Typography>
                              
                              {result.additionalMaterials && result.additionalMaterials.length > 0 ? (
                                <List dense>
                                  {result.additionalMaterials.map((material, index) => (
                                    <ListItem key={index}>
                                      <ListItemText 
                                        primary={material.name}
                                        secondary={`${material.quantity} ${material.unit}`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              ) : (
                                <Box 
                                  display="flex" 
                                  flexDirection="column" 
                                  alignItems="center" 
                                  justifyContent="center"
                                  sx={{ 
                                    minHeight: 120,
                                    textAlign: 'center',
                                    color: 'text.secondary'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    Nu sunt necesare materiale auxiliare pentru acest tip de calculator
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Second Row: Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <Grid item xs={12} sx={{ width: '100%' }}>
                        <Alert 
                          severity="info"
                          sx={{
                            width: '100%',
                            maxWidth: 'none',
                            margin: 0,
                            '& .MuiAlert-message': {
                              width: '100%'
                            }
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Recomandări:
                          </Typography>
                          <List dense sx={{ width: '100%', margin: 0 }}>
                            {result.recommendations.map((rec, index) => (
                              <ListItem key={index} sx={{ py: 0, px: 0, width: '100%' }}>
                                <Typography variant="body2">
                                  • {rec}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              ) : (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  sx={{ 
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)',
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: 'primary.light',
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f2ff 100%)'
                    }
                  }}
                >
                  <CalculateIcon 
                    sx={{ 
                      fontSize: 64, 
                      color: 'primary.light', 
                      mb: 2,
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                    }} 
                  />
                  <Typography variant="h6" color="primary.main" gutterBottom fontWeight={600}>
                    Introduceți dimensiunile
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ maxWidth: 280, lineHeight: 1.6, px: 2 }}
                  >
                    Completați formularul din stânga și apăsați "Calculează" pentru a vedea rezultatele
                  </Typography>
                </Box>
            )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}