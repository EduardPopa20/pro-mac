import React from 'react'

interface FaiantaIconProps {
  size?: number
  color?: string
  className?: string
}

const FaiantaIcon: React.FC<FaiantaIconProps> = ({ 
  size = 40, 
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
      {/* Faianță - Wall tiles pattern */}
      {/* First row of tiles */}
      <rect x="8" y="12" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.9"/>
      <rect x="20" y="12" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.7"/>
      <rect x="32" y="12" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.9"/>
      <rect x="44" y="12" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.7"/>
      
      {/* Second row of tiles (offset pattern) */}
      <rect x="2" y="24" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      <rect x="14" y="24" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.6"/>
      <rect x="26" y="24" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      <rect x="38" y="24" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.6"/>
      <rect x="50" y="24" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      
      {/* Third row of tiles */}
      <rect x="8" y="36" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.9"/>
      <rect x="20" y="36" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.7"/>
      <rect x="32" y="36" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.9"/>
      <rect x="44" y="36" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.7"/>
      
      {/* Fourth row of tiles (offset pattern) */}
      <rect x="2" y="48" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      <rect x="14" y="48" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.6"/>
      <rect x="26" y="48" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      <rect x="38" y="48" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.6"/>
      <rect x="50" y="48" width="12" height="12" fill={color} stroke={color} strokeWidth="0.5" opacity="0.8"/>
      
      {/* Decorative accent tiles (highlighting bathroom/kitchen feel) */}
      <rect x="22" y="14" width="8" height="8" fill={color} opacity="0.4" rx="1"/>
      <rect x="34" y="26" width="8" height="8" fill={color} opacity="0.4" rx="1"/>
      <rect x="16" y="38" width="8" height="8" fill={color} opacity="0.4" rx="1"/>
      
      {/* Subtle grout lines effect */}
      <line x1="8" y1="12" x2="56" y2="12" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="24" x2="62" y2="24" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="36" x2="56" y2="36" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="48" x2="62" y2="48" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="60" x2="56" y2="60" stroke={color} strokeWidth="0.3" opacity="0.3"/>
    </svg>
  )
}

export default FaiantaIcon