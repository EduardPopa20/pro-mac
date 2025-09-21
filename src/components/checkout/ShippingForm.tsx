import React, { useCallback, useEffect } from 'react'
import {
  Grid,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Paper,
  MenuItem,
  Alert,
} from '@mui/material'
import { LocalShipping, Home, Phone } from '@mui/icons-material'

interface ShippingFormData {
  sameAsBilling: boolean
  firstName?: string
  lastName?: string
  phone?: string
  street?: string
  city?: string
  county?: string
  postalCode?: string
  country?: string
}

interface BillingAddress {
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  county: string
  postalCode: string
  country: string
}

interface ShippingFormProps {
  data: ShippingFormData
  billingAddress: BillingAddress
  onChange: (data: ShippingFormData) => void
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

export default function ShippingForm({ data, billingAddress, onChange }: ShippingFormProps) {
  const handleFieldChange = useCallback((field: keyof ShippingFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({
        ...data,
        [field]: e.target.value,
      })
    }, [data, onChange]
  )
  
  const handleSameAsBillingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    
    if (checked) {
      // Clear shipping-specific fields when using billing address
      onChange({
        sameAsBilling: true,
        firstName: '',
        lastName: '',
        phone: '',
        street: '',
        city: '',
        county: '',
        postalCode: '',
        country: '',
      })
    } else {
      // Pre-fill with billing address when unchecking
      onChange({
        sameAsBilling: false,
        firstName: billingAddress.firstName,
        lastName: billingAddress.lastName,
        phone: billingAddress.phone,
        street: billingAddress.street,
        city: billingAddress.city,
        county: billingAddress.county,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country,
      })
    }
  }
  
  // Set default to same as billing on mount
  useEffect(() => {
    if (data.sameAsBilling === undefined) {
      onChange({ ...data, sameAsBilling: true })
    }
  }, [])
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Date de livrare
      </Typography>
      
      {/* Shipping Options */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Livrare prin curier rapid</strong> - Transport gratuit pentru comenzi peste 500 RON
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Timp estimat de livrare: 2-4 zile lucrătoare
        </Typography>
      </Alert>
      
      {/* Same as Billing Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={data.sameAsBilling}
            onChange={handleSameAsBillingToggle}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Home fontSize="small" />
            <Typography>Folosește adresa de facturare pentru livrare</Typography>
          </Box>
        }
        sx={{ mb: 3 }}
      />
      
      {/* Show billing address if same */}
      {data.sameAsBilling ? (
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalShipping color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Adresă de livrare
            </Typography>
          </Box>
          
          <Typography variant="body2" gutterBottom>
            <strong>{billingAddress.firstName} {billingAddress.lastName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {billingAddress.street}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {billingAddress.city}, {billingAddress.county} {billingAddress.postalCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {billingAddress.country}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {billingAddress.phone}
            </Typography>
          </Box>
        </Paper>
      ) : (
        // Different shipping address form
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocalShipping color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Adresă diferită pentru livrare
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Prenume destinatar"
                value={data.firstName || ''}
                onChange={handleFieldChange('firstName')}
                variant="outlined"
                autoComplete="given-name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nume destinatar"
                value={data.lastName || ''}
                onChange={handleFieldChange('lastName')}
                variant="outlined"
                autoComplete="family-name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Telefon contact"
                value={data.phone || ''}
                onChange={handleFieldChange('phone')}
                variant="outlined"
                autoComplete="tel"
                placeholder="07XX XXX XXX"
                helperText="Pentru contactare de către curier"
                InputProps={{
                  startAdornment: <Phone fontSize="small" color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Adresă livrare"
                value={data.street || ''}
                onChange={handleFieldChange('street')}
                variant="outlined"
                autoComplete="street-address"
                placeholder="Strada, număr, bloc, scară, etaj, apartament"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Oraș"
                value={data.city || ''}
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
                value={data.county || ''}
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
                value={data.postalCode || ''}
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
                value={data.country || 'România'}
                onChange={handleFieldChange('country')}
                variant="outlined"
                autoComplete="country-name"
                disabled
              />
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Delivery Instructions */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
          Informații importante despre livrare:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
          <li>Produsele vor fi livrate la adresa specificată mai sus</li>
          <li>Curierul vă va contacta telefonic înainte de livrare</li>
          <li>Este necesară semnătura la primirea coletului</li>
          <li>Verificați coletul în prezența curierului</li>
        </Typography>
      </Paper>
    </Box>
  )
}