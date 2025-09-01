/**
 * RESPONSIVE WhatsApp Floating Button Component
 * Sticky button in bottom-right corner with phone number integration
 * Responsive across all device breakpoints (xs, sm, md, lg, xl)
 */
import React, { useEffect } from 'react'
import { Fab, useTheme, useMediaQuery } from '@mui/material'
import { WhatsApp } from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber,
  message = "Bună! Sunt interesat de produsele Pro-Mac și aș dori mai multe informații."
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) // < 960px
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm')) // < 600px
  
  const { settings, fetchSettings } = useSettingsStore()
  
  // Fetch settings on component mount
  useEffect(() => {
    if (Object.keys(settings).length === 0) {
      fetchSettings()
    }
  }, [settings, fetchSettings])
  
  // Use phone from settings or fallback to prop or default
  const effectivePhoneNumber = phoneNumber || settings.whatsapp_phone || "0729926085"

  const handleWhatsAppClick = () => {
    // Remove any non-digit characters and format for WhatsApp
    const formattedPhone = effectivePhoneNumber.replace(/\D/g, '')
    // Add Romania country code if not present
    const fullPhone = formattedPhone.startsWith('40') ? formattedPhone : `40${formattedPhone}`
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`
    
    // Open in new tab
    window.open(whatsappUrl, '_blank')
  }

  return (
    <Fab
      onClick={handleWhatsAppClick}
      sx={{
        position: 'fixed',
        bottom: isSmallMobile ? 16 : isMobile ? 20 : 24,  // Responsive bottom spacing
        right: isSmallMobile ? 16 : isMobile ? 20 : 24,   // Responsive right spacing
        backgroundColor: '#25D366', // Official WhatsApp green
        color: 'white',
        width: isSmallMobile ? 50 : isMobile ? 56 : 64,   // Responsive size
        height: isSmallMobile ? 50 : isMobile ? 56 : 64,  // Responsive size
        zIndex: theme.zIndex.fab, // High z-index to stay above everything
        boxShadow: 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: '#128C7E', // Darker WhatsApp green on hover
          transform: 'scale(1.1)',
          boxShadow: 'none',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
      title="Contactează-ne pe WhatsApp"
      aria-label="Contactează-ne pe WhatsApp"
    >
      <WhatsApp 
        sx={{ 
          fontSize: isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2rem' // Responsive icon size
        }} 
      />
    </Fab>
  )
}

export default WhatsAppButton