import { useEffect, useState } from 'react'
import { Chip, Box } from '@mui/material'
import { WifiOff, Wifi } from '@mui/icons-material'
import { realTimeEvents } from '../../lib/realTimeEvents'

interface RealTimeStatusProps {
  showStatus?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export default function RealTimeStatus({ 
  showStatus = true, 
  position = 'top-right' 
}: RealTimeStatusProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  useEffect(() => {
    if (!showStatus) return

    // Check initial connection status
    setIsConnected(realTimeEvents.isEventSystemConnected())

    // Subscribe to events to track connection status
    const unsubscribe = realTimeEvents.subscribeToEvents((event) => {
      setIsConnected(true)
      setLastEvent(`${event.entity} ${event.action}`)
      
      // Clear last event after 3 seconds
      setTimeout(() => setLastEvent(null), 3000)
    })

    return () => {
      unsubscribe()
    }
  }, [showStatus])

  if (!showStatus) return null

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 9999,
      m: 1,
    }

    switch (position) {
      case 'top-left':
        return { ...base, top: 0, left: 0 }
      case 'top-right':
        return { ...base, top: 0, right: 0 }
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 }
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 }
      default:
        return { ...base, top: 0, right: 0 }
    }
  }

  return (
    <Box sx={getPositionStyles()}>
      <Chip
        icon={isConnected ? <Wifi /> : <WifiOff />}
        label={
          lastEvent 
            ? `${lastEvent} actualizat`
            : isConnected 
              ? 'Sincronizare activă' 
              : 'Fără sincronizare'
        }
        color={isConnected ? 'success' : 'error'}
        variant="filled"
        size="small"
        sx={{
          fontSize: '0.7rem',
          height: 24,
          '& .MuiChip-icon': {
            fontSize: '0.9rem'
          }
        }}
      />
    </Box>
  )
}