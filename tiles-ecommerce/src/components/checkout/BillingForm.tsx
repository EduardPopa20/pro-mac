import React, { useCallback } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Divider,
  MenuItem,
} from '@mui/material'
import { Person, Business, Email, Phone, LocationOn } from '@mui/icons-material'

interface BillingFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  county: string
  postalCode: string
  country: string
  companyName?: string
  cui?: string
}

interface BillingFormProps {
  data: BillingFormData
  onChange: (data: BillingFormData) => void
}

// Romanian counties
const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
  'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași',
  'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș',
  'Mehedinți', 'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj',
  'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'
]

export default function BillingForm({ data, onChange }: BillingFormProps) {
  const [isCompany, setIsCompany] = React.useState(false)
  
  const handleFieldChange = useCallback((field: keyof BillingFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...data,
        [field]: e.target.value,
      })
    }, [data, onChange]
  )
  
  const handleCompanyToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCompany(event.target.checked)
    if (!event.target.checked) {
      // Clear company fields when toggling off
      onChange({
        ...data,
        companyName: '',
        cui: '',
      })
    }
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Date de facturare
      </Typography>
      
      {/* Personal Info */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Person color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Informații personale
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Prenume"
              value={data.firstName}
              onChange={handleFieldChange('firstName')}
              variant="outlined"
              autoComplete="given-name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Nume"
              value={data.lastName}
              onChange={handleFieldChange('lastName')}
              variant="outlined"
              autoComplete="family-name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={data.email}
              onChange={handleFieldChange('email')}
              variant="outlined"
              autoComplete="email"
              InputProps={{
                startAdornment: <Email fontSize="small" color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Telefon"
              value={data.phone}
              onChange={handleFieldChange('phone')}
              variant="outlined"
              autoComplete="tel"
              placeholder="07XX XXX XXX"
              InputProps={{
                startAdornment: <Phone fontSize="small" color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Company Info (Optional) */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isCompany}
              onChange={handleCompanyToggle}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Business fontSize="small" />
              <Typography>Persoană juridică (firmă)</Typography>
            </Box>
          }
        />
        
        {isCompany && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="Denumire firmă"
                value={data.companyName || ''}
                onChange={handleFieldChange('companyName')}
                variant="outlined"
                autoComplete="organization"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="CUI"
                value={data.cui || ''}
                onChange={handleFieldChange('cui')}
                variant="outlined"
                placeholder="RO12345678"
                helperText="Cod Unic de Înregistrare"
              />
            </Grid>
          </Grid>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Address Info */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Adresă de facturare
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Adresă"
              value={data.street}
              onChange={handleFieldChange('street')}
              variant="outlined"
              autoComplete="street-address"
              placeholder="Strada, număr, bloc, scară, etaj, apartament"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Oraș"
              value={data.city}
              onChange={handleFieldChange('city')}
              variant="outlined"
              autoComplete="address-level2"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              select
              label="Județ"
              value={data.county}
              onChange={handleFieldChange('county')}
              variant="outlined"
              autoComplete="address-level1"
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
                      zIndex: (theme) => theme.zIndex.modal + 100, // Higher than modals
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
              {ROMANIAN_COUNTIES.map((county) => (
                <MenuItem key={county} value={county}>
                  {county}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Cod poștal"
              value={data.postalCode}
              onChange={handleFieldChange('postalCode')}
              variant="outlined"
              autoComplete="postal-code"
              placeholder="000000"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Țară"
              value={data.country}
              onChange={handleFieldChange('country')}
              variant="outlined"
              autoComplete="country-name"
              disabled
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}