import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Grid,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Stack
} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ro } from 'date-fns/locale'
import { BusinessCenter } from '@mui/icons-material'

interface WorkingDay {
  day: string
  dayName: string
  isOpen: boolean
  openTime: Date | null
  closeTime: Date | null
}

interface WorkingHoursEditorProps {
  value: string
  onChange: (value: string) => void
}

// Move defaultDays outside component to prevent re-creation
const defaultDays: WorkingDay[] = [
  { day: 'luni', dayName: 'Luni', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 18, 0) },
  { day: 'marti', dayName: 'Marți', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 18, 0) },
  { day: 'miercuri', dayName: 'Miercuri', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 18, 0) },
  { day: 'joi', dayName: 'Joi', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 18, 0) },
  { day: 'vineri', dayName: 'Vineri', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 18, 0) },
  { day: 'sambata', dayName: 'Sâmbătă', isOpen: true, openTime: new Date(2024, 0, 1, 9, 0), closeTime: new Date(2024, 0, 1, 14, 0) },
  { day: 'duminica', dayName: 'Duminică', isOpen: false, openTime: null, closeTime: null }
]

const WorkingHoursEditor: React.FC<WorkingHoursEditorProps> = ({ value, onChange }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(defaultDays)
  const [initialized, setInitialized] = useState(false)

  // Define parseWorkingHours before using it
  const parseWorkingHours = useCallback((hoursStr: string) => {
    // Simple parsing for common formats
    const updatedDays = [...defaultDays]
    
    if (hoursStr.includes('Luni-Vineri')) {
      const match = hoursStr.match(/Luni-Vineri:?\s*(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/)
      if (match) {
        const [, openHour, openMin, closeHour, closeMin] = match
        for (let i = 0; i < 5; i++) {
          updatedDays[i].openTime = new Date(2024, 0, 1, parseInt(openHour), parseInt(openMin))
          updatedDays[i].closeTime = new Date(2024, 0, 1, parseInt(closeHour), parseInt(closeMin))
          updatedDays[i].isOpen = true
        }
      }
    }
    
    setWorkingDays(updatedDays)
  }, []) // No dependencies needed since defaultDays is constant

  // Parse existing value on mount only
  useEffect(() => {
    if (value && value.trim() !== '' && !initialized) {
      try {
        parseWorkingHours(value)
        setInitialized(true)
      } catch (error) {
        // Could not parse existing working hours, using defaults
        setInitialized(true)
      }
    } else if (!value && !initialized) {
      setInitialized(true)
    }
  }, [value, initialized, parseWorkingHours])

  // Update parent when working days change (but only after initialization)
  useEffect(() => {
    if (initialized) {
      const hoursString = generateWorkingHoursString()
      onChange(hoursString)
    }
  }, [workingDays, initialized]) // Remove onChange dependency to prevent infinite loop

  const generateWorkingHoursString = (): string => {
    const openDays = workingDays.filter(day => day.isOpen && day.openTime && day.closeTime)
    
    if (openDays.length === 0) {
      return 'Închis'
    }

    // Group consecutive days with same hours
    const grouped: { days: string[], hours: string }[] = []
    
    openDays.forEach(day => {
      const hours = `${formatTime(day.openTime!)}-${formatTime(day.closeTime!)}`
      const existing = grouped.find(g => g.hours === hours)
      
      if (existing) {
        existing.days.push(day.dayName)
      } else {
        grouped.push({ days: [day.dayName], hours })
      }
    })

    return grouped.map(g => {
      if (g.days.length > 1 && isConsecutive(g.days)) {
        return `${g.days[0]}-${g.days[g.days.length - 1]}: ${g.hours}`
      } else {
        return `${g.days.join(', ')}: ${g.hours}`
      }
    }).join(', ')
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const isConsecutive = (dayNames: string[]): boolean => {
    const dayOrder = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']
    const indices = dayNames.map(name => dayOrder.indexOf(name)).sort((a, b) => a - b)
    
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i-1] + 1) {
        return false
      }
    }
    return true
  }

  const updateDay = useCallback((index: number, updates: Partial<WorkingDay>) => {
    setWorkingDays(prev => {
      const newDays = prev.map((day, i) => 
        i === index ? { ...day, ...updates } : day
      )
      return newDays
    })
  }, [])


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ro}>
      <Box mb={2}>
        <Stack spacing={1.5}>
          {workingDays.map((day, index) => (
            <Box 
              key={day.day}
              sx={{ 
                p: 1.5,
                border: 1,
                borderColor: 'grey.300',
                borderRadius: 1.5,
                backgroundColor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                },
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                minHeight: '48px'
              }}
            >
              {/* Day name */}
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  fontSize: '0.9rem',
                  minWidth: '80px',
                  textAlign: 'left'
                }}
              >
                {day.dayName}
              </Typography>

              {/* Time pickers or closed indicator */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  alignItems: 'center', 
                  flex: 1, 
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                {day.isOpen ? (
                  <>
                    <TimePicker
                      label="Start"
                      value={day.openTime}
                      onChange={(newTime) => updateDay(index, { openTime: newTime })}
                      disabled={!day.isOpen}
                      ampm={false}
                      slotProps={{
                        textField: {
                          size: 'small',
                          variant: 'outlined',
                          disabled: !day.isOpen,
                          sx: { 
                            flex: 1,
                            minWidth: { xs: '130px', sm: '110px' },
                            width: { xs: '100%', sm: 'auto' },
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 1,
                              fontSize: '0.8rem',
                              '& input': {
                                padding: '6px 10px',
                                textAlign: 'center'
                              }
                            },
                            '& .MuiInputBase-root': { 
                              height: { xs: '44px', sm: '34px' },
                              fontSize: '0.8rem'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.75rem',
                              transform: 'translate(10px, 8px) scale(1)'
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(10px, -6px) scale(0.75)'
                            }
                          }
                        }
                      }}
                    />
                    
                    <TimePicker
                      label="Stop"
                      value={day.closeTime}
                      onChange={(newTime) => updateDay(index, { closeTime: newTime })}
                      disabled={!day.isOpen}
                      ampm={false}
                      slotProps={{
                        textField: {
                          size: 'small',
                          variant: 'outlined',
                          disabled: !day.isOpen,
                          sx: { 
                            flex: 1,
                            minWidth: { xs: '130px', sm: '110px' },
                            width: { xs: '100%', sm: 'auto' },
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: 1,
                              fontSize: '0.8rem',
                              '& input': {
                                padding: '6px 10px',
                                textAlign: 'center'
                              }
                            },
                            '& .MuiInputBase-root': { 
                              height: { xs: '44px', sm: '34px' },
                              fontSize: '0.8rem'
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '0.75rem',
                              transform: 'translate(10px, 8px) scale(1)'
                            },
                            '& .MuiInputLabel-shrink': {
                              transform: 'translate(10px, -6px) scale(0.75)'
                            }
                          }
                        }
                      }}
                    />
                  </>
                ) : (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.85rem',
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      flex: 1,
                      textAlign: 'center'
                    }}
                  >
                    Închis
                  </Typography>
                )}
              </Box>
              
              {/* Toggle switch - moved to right */}
              <Switch
                checked={day.isOpen}
                onChange={(e) => updateDay(index, { 
                  isOpen: e.target.checked,
                  openTime: e.target.checked && !day.openTime ? new Date(2024, 0, 1, 9, 0) : day.openTime,
                  closeTime: e.target.checked && !day.closeTime ? new Date(2024, 0, 1, 18, 0) : day.closeTime
                })}
                size="small"
                sx={{
                  transform: 'scale(0.9)'
                }}
              />
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        
        {/* Preview */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Preview program:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              p: 1.5, 
              backgroundColor: 'grey.50', 
              borderRadius: 1.5,
              border: 1,
              borderColor: 'grey.200',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}
          >
            {generateWorkingHoursString()}
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  )
}

export default WorkingHoursEditor