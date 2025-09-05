import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material'
import { CheckCircle, Cancel, CreditCard } from '@mui/icons-material'

export default function PaymentSimulator() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  
  const transactionId = searchParams.get('transaction')
  const amount = searchParams.get('amount')
  const status = searchParams.get('status') || 'pending'
  
  useEffect(() => {
    if (!transactionId || !amount) {
      navigate('/')
    }
  }, [transactionId, amount, navigate])
  
  const handlePaymentAction = async (action: 'success' | 'failure') => {
    setProcessing(true)
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (action === 'success') {
      // Redirect to success page
      navigate(`/payment/return?status=success&transaction=${transactionId}`)
    } else {
      // Redirect to failure page
      navigate(`/payment/return?status=failed&transaction=${transactionId}`)
    }
  }
  
  if (!transactionId || !amount) {
    return null
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CreditCard sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            🧪 Payment Simulator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Development Mode - Simulare Plată Netopia
          </Typography>
        </Box>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Mod Development:</strong> Aceasta este o simulare pentru testare. 
            Nicio plată reală nu va fi procesată.
          </Typography>
        </Alert>
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detalii Tranzacție
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                <strong>ID Tranzacție:</strong> {transactionId}
              </Typography>
              <Typography variant="body2">
                <strong>Sumă:</strong> {amount} RON
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> În procesare...
              </Typography>
            </Box>
          </CardContent>
        </Card>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Simulează Rezultatul Plății:
          </Typography>
          
          {processing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={40} />
              <Typography>Se procesează plata...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircle />}
                onClick={() => handlePaymentAction('success')}
                sx={{ minWidth: 150 }}
              >
                Plată Reușită
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                size="large"
                startIcon={<Cancel />}
                onClick={() => handlePaymentAction('failure')}
                sx={{ minWidth: 150 }}
              >
                Plată Eșuată
              </Button>
            </Box>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            În producție, acest pas se va face automat prin Netopia
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}