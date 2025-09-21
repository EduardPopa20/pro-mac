import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle,
  Email,
  LocalShipping,
  Receipt,
  Home,
  Print,
  GetApp,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface OrderConfirmationProps {
  orderId: string | null
  orderNumber: string
  email: string
}

export default function OrderConfirmation({ orderId, orderNumber, email }: OrderConfirmationProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    // Simulate loading for a moment
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={400}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Procesăm comanda dvs...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Vă rugăm așteptați
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Comandă plasată cu succes!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vă mulțumim pentru comandă. Veți primi un email de confirmare în curând.
        </Typography>
      </Box>
      
      {/* Order Details */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Detalii comandă
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Număr comandă:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {orderNumber}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Data:
            </Typography>
            <Typography variant="body2">
              {new Date().toLocaleDateString('ro-RO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Email confirmare:
            </Typography>
            <Typography variant="body2">
              {email}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Next Steps */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Următorii pași
        </Typography>
        <Divider sx={{ my: 2 }} />
        <List>
          <ListItem>
            <ListItemIcon>
              <Email color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Email de confirmare"
              secondary="Veți primi un email cu detaliile comenzii și factura fiscală"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Receipt color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Procesare comandă"
              secondary="Comanda dvs. va fi procesată în următoarele 24 de ore"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LocalShipping color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Expediere"
              secondary="Veți primi un email cu numărul de tracking când comanda va fi expediată"
            />
          </ListItem>
        </List>
      </Paper>
      
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Timp estimat de livrare:</strong> 2-4 zile lucrătoare
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Curierul vă va contacta telefonic înainte de livrare
        </Typography>
      </Alert>
      
      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
        >
          Înapoi la magazin
        </Button>
        
        {orderId && (
          <>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Receipt />}
              onClick={() => navigate(`/profil/orders/${orderId}`)}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
            >
              Vezi comanda
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 auto' } }}
            >
              Printează
            </Button>
          </>
        )}
      </Box>
      
      {/* Customer Support */}
      <Paper sx={{ p: 2, mt: 4, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
          Aveți întrebări?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Contactați echipa noastră de suport:
        </Typography>
        <Typography variant="body2">
          • Email: comenzi@promac.ro
        </Typography>
        <Typography variant="body2">
          • Telefon: 0700 000 000 (L-V: 9:00-18:00)
        </Typography>
      </Paper>
    </Box>
  )
}