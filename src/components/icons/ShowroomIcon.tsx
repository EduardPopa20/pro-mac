import React from 'react'

interface ShowroomIconProps {
  size?: number
  color?: string
  className?: string
}

const ShowroomIcon: React.FC<ShowroomIconProps> = ({ 
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
      {/* Showroom building structure - optimizat ca calculatorul */}
      {/* Main building - doar contur */}
      <rect x="8" y="20" width="48" height="32" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="2"/>
      
      {/* Awning/canopy - simplu */}
      <path d="M4 24 L8 20 L56 20 L60 24 L58 26 L6 26 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5"/>
      
      {/* Large display windows - doar contururi */}
      <rect x="12" y="26" width="16" height="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" rx="1"/>
      <rect x="36" y="26" width="16" height="20" fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" rx="1"/>
      
      {/* Window dividers - mai groase */}
      <line x1="20" y1="26" x2="20" y2="46" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="12" y1="36" x2="28" y2="36" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="44" y1="26" x2="44" y2="46" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="36" y1="36" x2="52" y2="36" stroke={color} strokeWidth="1" opacity="0.7"/>
      
      {/* Entrance door - contur clar */}
      <rect x="30" y="34" width="4" height="12" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" rx="0.5"/>
      <circle cx="32.5" cy="40" r="0.6" fill={color} opacity="0.9"/>
      
      {/* Signage area - simplu și clar */}
      <rect x="20" y="8" width="24" height="8" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" rx="2"/>
      
      {/* Sign text simulation - mai groase */}
      <line x1="24" y1="11" x2="36" y2="11" stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <line x1="26" y1="13.5" x2="38" y2="13.5" stroke={color} strokeWidth="1.2" opacity="0.8"/>
    </svg>
  )
}

export default ShowroomIcon