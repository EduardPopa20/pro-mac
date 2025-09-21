import React from 'react'

interface ContactIconProps {
  size?: number
  color?: string
  className?: string
}

const ContactIcon: React.FC<ContactIconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Email envelope - optimizat ca calculatorul */}
      <rect x="8" y="18" width="48" height="32" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="3"/>
      
      {/* Envelope flap */}
      <path d="M8 21 L32 38 L56 21" stroke={color} strokeWidth="2" fill="none" opacity="0.8"/>
      <path d="M8 21 L32 35 L56 21" fill={color} opacity="0.15"/>
      
      {/* Phone handset - contur simplu */}
      <path d="M16 8 Q20 6 24 8 L28 12 Q30 14 28 16 L26 18 Q28 22 32 26 Q36 30 40 32 L42 30 Q44 28 46 30 L50 34 Q52 38 48 40 L44 42 Q38 44 30 36 L20 26 Q12 18 14 12 Z" 
            fill="none" stroke={color} strokeWidth="1.5" opacity="0.8"/>
      
      {/* Phone details - mai vizibile */}
      <ellipse cx="20" cy="14" rx="2" ry="1.5" fill={color} opacity="0.3"/>
      <ellipse cx="44" cy="36" rx="2" ry="1.5" fill={color} opacity="0.3"/>
      
      {/* Email content lines - mai groase și vizibile */}
      <line x1="14" y1="26" x2="28" y2="26" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <line x1="14" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <line x1="14" y1="34" x2="26" y2="34" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      
      {/* @ symbol for email - mai mare și vizibil */}
      <circle cx="22" cy="42" r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <circle cx="22" cy="42" r="2" stroke={color} strokeWidth="1" fill="none" opacity="0.7"/>
      <line x1="25" y1="42" x2="26" y2="42" stroke={color} strokeWidth="1" opacity="0.7"/>
      
      {/* Message notification - simplu și clar */}
      <circle cx="52" cy="22" r="3" fill={color} opacity="0.4" stroke={color} strokeWidth="1.5"/>
      <circle cx="52" cy="22" r="1" fill={color} opacity="0.9"/>
    </svg>
  )
}

export default ContactIcon