import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Container
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  TrendingUp
} from '@mui/icons-material'

export default function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          py: 8
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            p: 4,
            borderRadius: 3,
            boxShadow: 4,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <DashboardIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography variant="h4" fontWeight={700} gutterBottom>
                Dashboard în Dezvoltare
              </Typography>

              <Typography variant="h6" color="text.secondary" gutterBottom>
                Panoul de administrare este în construcție
              </Typography>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  width: '100%'
                }}
              >
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUp color="primary" />
                    <Typography variant="body1">
                      <strong>Implementare viitoare:</strong> Dashboard complet cu statistici în timp real
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Dashboard-ul va include statistici de vânzări, monitorizarea stocurilor, analiza comenzilor și rapoarte detaliate pentru o administrare eficientă.
                  </Typography>
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Pentru moment, accesați funcționalitățile prin meniul lateral.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}