import React from 'react'

interface HomeIconProps {
  size?: number
  color?: string
  className?: string
}

const HomeIcon: React.FC<HomeIconProps> = ({ 
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
      {/* House structure - optimizat pentru claritate */}
      {/* Main house body - doar contur */}
      <rect x="14" y="32" width="36" height="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="2"/>
      
      {/* Roof - contur cu umplere ușoară */}
      <path d="M8 36 L32 16 L56 36 L50 36 L32 22 L14 36 Z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5"/>
      
      {/* Chimney - contur */}
      <rect x="42" y="20" width="6" height="16" fill="none" stroke={color} strokeWidth="1.2" opacity="0.8" rx="1"/>
      <rect x="40" y="18" width="10" height="3" fill={color} opacity="0.3" stroke={color} strokeWidth="1" rx="1"/>
      
      {/* Front door - contur clar */}
      <rect x="28" y="40" width="8" height="12" fill={color} opacity="0.2" stroke={color} strokeWidth="1.2" rx="1"/>
      <circle cx="34" cy="46" r="1" fill={color} opacity="0.8"/>
      
      {/* Windows - doar contururi */}
      <rect x="18" y="38" width="6" height="6" fill="none" stroke={color} strokeWidth="1.2" opacity="0.8" rx="0.5"/>
      <rect x="40" y="38" width="6" height="6" fill="none" stroke={color} strokeWidth="1.2" opacity="0.8" rx="0.5"/>
      
      {/* Window cross patterns - mai vizibile */}
      <line x1="21" y1="38" x2="21" y2="44" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <line x1="18" y1="41" x2="24" y2="41" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <line x1="43" y1="38" x2="43" y2="44" stroke={color} strokeWidth="0.8" opacity="0.7"/>
      <line x1="40" y1="41" x2="46" y2="41" stroke={color} strokeWidth="0.8" opacity="0.7"/>
    </svg>
  )
}

export default HomeIcon