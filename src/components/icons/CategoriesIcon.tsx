import React from 'react'

interface CategoriesIconProps {
  size?: number
  color?: string
  className?: string
}

const CategoriesIcon: React.FC<CategoriesIconProps> = ({ 
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
      {/* Grid layout representing categories - optimizat ca calculatorul */}
      {/* Top row of category cards - doar contururi */}
      <rect x="8" y="8" width="20" height="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="3"/>
      <rect x="36" y="8" width="20" height="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="3"/>
      
      {/* Bottom row of category cards */}
      <rect x="8" y="36" width="20" height="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="3"/>
      <rect x="36" y="36" width="20" height="20" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="3"/>
      
      {/* Simboluri simple în cards - mai vizibile */}
      {/* Top-left card - 9 dots pattern */}
      <circle cx="14" cy="14" r="1" fill={color} opacity="0.6"/>
      <circle cx="18" cy="14" r="1" fill={color} opacity="0.6"/>
      <circle cx="22" cy="14" r="1" fill={color} opacity="0.6"/>
      <circle cx="14" cy="18" r="1" fill={color} opacity="0.6"/>
      <circle cx="18" cy="18" r="1" fill={color} opacity="0.6"/>
      <circle cx="22" cy="18" r="1" fill={color} opacity="0.6"/>
      <circle cx="14" cy="22" r="1" fill={color} opacity="0.6"/>
      <circle cx="18" cy="22" r="1" fill={color} opacity="0.6"/>
      <circle cx="22" cy="22" r="1" fill={color} opacity="0.6"/>
      
      {/* Top-right card - 3 lines */}
      <line x1="40" y1="14" x2="52" y2="14" stroke={color} strokeWidth="2" opacity="0.6"/>
      <line x1="40" y1="18" x2="52" y2="18" stroke={color} strokeWidth="2" opacity="0.6"/>
      <line x1="40" y1="22" x2="52" y2="22" stroke={color} strokeWidth="2" opacity="0.6"/>
      
      {/* Bottom-left card - 4 squares */}
      <rect x="12" y="40" width="5" height="5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" rx="0.5"/>
      <rect x="19" y="40" width="5" height="5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" rx="0.5"/>
      <rect x="12" y="47" width="5" height="5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" rx="0.5"/>
      <rect x="19" y="47" width="5" height="5" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6" rx="0.5"/>
      
      {/* Bottom-right card - lista cu bullet points */}
      <circle cx="42" cy="42" r="0.8" fill={color} opacity="0.6"/>
      <line x1="44" y1="42" x2="50" y2="42" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <circle cx="42" cy="46" r="0.8" fill={color} opacity="0.6"/>
      <line x1="44" y1="46" x2="50" y2="46" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <circle cx="42" cy="50" r="0.8" fill={color} opacity="0.6"/>
      <line x1="44" y1="50" x2="50" y2="50" stroke={color} strokeWidth="1.2" opacity="0.6"/>
    </svg>
  )
}

export default CategoriesIcon