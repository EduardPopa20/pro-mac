import React from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  type SlideProps
} from '@mui/material'
import { useGlobalAlertStore } from '../../stores/globalAlert'

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

const GlobalAlert: React.FC = () => {
  const { alerts, removeAlert } = useGlobalAlertStore()

  const handleClose = (id: string) => {
    removeAlert(id)
  }

  return (
    <>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.duration}
          onClose={() => handleClose(alert.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={SlideTransition}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: (theme) => theme.zIndex.globalAlert,
            '& .MuiSnackbar-root': {
              position: 'static'
            },
            // Stack multiple alerts
            ...(alerts.indexOf(alert) > 0 && {
              bottom: 16 + (alerts.indexOf(alert) * 70)
            })
          }}
        >
          <Alert
            onClose={() => handleClose(alert.id)}
            severity={alert.severity}
            variant="filled"
            sx={{
              width: '350px',
              boxShadow: 4,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            {alert.title && (
              <AlertTitle>{alert.title}</AlertTitle>
            )}
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export default GlobalAlert