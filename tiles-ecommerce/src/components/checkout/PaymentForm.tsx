import React from 'react'
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Checkbox,
  TextField,
  Alert,
  Chip,
  Link,
  Divider,
} from '@mui/material'
import {
  CreditCard,
  AccountBalance,
  LocalShipping,
  Security,
  Info,
} from '@mui/icons-material'
import { PAYMENT_METHODS } from '../../config/netopia'

interface PaymentFormData {
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery'
  acceptTerms: boolean
  newsletter: boolean
  notes?: string
}

interface PaymentFormProps {
  data: PaymentFormData
  onChange: (field: keyof PaymentFormData, value: any) => void
  total: number
}

export default function PaymentForm({ data, onChange, total }: PaymentFormProps) {
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard />
      case 'bank_transfer':
        return <AccountBalance />
      case 'cash_on_delivery':
        return <LocalShipping />
      default:
        return <CreditCard />
    }
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Metodă de plată
      </Typography>
      
      {/* Payment Methods */}
      <RadioGroup
        value={data.paymentMethod}
        onChange={(e) => onChange('paymentMethod', e.target.value)}
      >
        {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
          <Paper
            key={key}
            sx={{
              mb: 2,
              p: 2,
              border: '2px solid',
              borderColor: data.paymentMethod === key ? 'primary.main' : 'grey.300',
              cursor: method.enabled ? 'pointer' : 'not-allowed',
              opacity: method.enabled ? 1 : 0.5,
              transition: 'all 0.3s ease',
              '&:hover': method.enabled ? {
                borderColor: 'primary.light',
                bgcolor: 'grey.50',
              } : {},
            }}
          >
            <FormControlLabel
              value={key}
              disabled={!method.enabled}
              control={<Radio />}
              label={
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPaymentIcon(key)}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {method.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                    {method.fee > 0 && (
                      <Chip
                        label={`+${(method.fee / 100).toFixed(2)} RON`}
                        size="small"
                        color="warning"
                      />
                    )}
                    {!method.enabled && (
                      <Chip
                        label="Indisponibil"
                        size="small"
                        color="default"
                      />
                    )}
                  </Box>
                  
                  {/* Additional info for selected method */}
                  {data.paymentMethod === key && method.enabled && (
                    <Box sx={{ mt: 2 }}>
                      {key === 'card' && (
                        <Alert severity="info" icon={<Security />}>
                          <Typography variant="body2">
                            Plată securizată prin <strong>Netopia Payments</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Datele cardului sunt procesate securizat și nu sunt stocate pe serverele noastre
                          </Typography>
                        </Alert>
                      )}
                      
                      {key === 'bank_transfer' && (
                        <Alert severity="warning" icon={<Info />}>
                          <Typography variant="body2">
                            După plasarea comenzii, veți primi detaliile pentru transfer bancar pe email
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Comanda va fi procesată după confirmarea plății (1-2 zile lucrătoare)
                          </Typography>
                        </Alert>
                      )}
                      
                      {key === 'cash_on_delivery' && (
                        <Alert severity="warning" icon={<Info />}>
                          <Typography variant="body2">
                            Taxa suplimentară: <strong>15 RON</strong>
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Plata se face în numerar la primirea coletului
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              }
              sx={{ width: '100%', m: 0 }}
            />
          </Paper>
        ))}
      </RadioGroup>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Order Notes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Observații comandă (opțional)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Adăugați orice informații suplimentare despre comandă sau livrare..."
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          variant="outlined"
        />
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Terms and Newsletter */}
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.acceptTerms}
              onChange={(e) => onChange('acceptTerms', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Accept{' '}
              <Link href="/terms" target="_blank" sx={{ fontWeight: 500 }}>
                Termenii și Condițiile
              </Link>
              {' '}și{' '}
              <Link href="/privacy" target="_blank" sx={{ fontWeight: 500 }}>
                Politica de Confidențialitate
              </Link>
              {' '}*
            </Typography>
          }
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={data.newsletter}
              onChange={(e) => onChange('newsletter', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Doresc să primesc oferte și noutăți pe email
            </Typography>
          }
        />
      </Box>
      
      {/* Security Badge */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'success.lighter', border: '1px solid', borderColor: 'success.light' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security color="success" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Tranzacție securizată
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Toate plățile sunt procesate prin conexiune securizată SSL
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Total Summary */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.lighter', border: '2px solid', borderColor: 'primary.main' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Total de plată:
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {total.toFixed(2)} RON
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
          TVA inclus
        </Typography>
      </Paper>
    </Box>
  )
}