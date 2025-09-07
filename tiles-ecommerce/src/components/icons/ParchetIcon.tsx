import React from 'react'

interface ParchetIconProps {
  size?: number
  color?: string
  className?: string
}

const ParchetIcon: React.FC<ParchetIconProps> = ({ 
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
      {/* Parchet - Wooden plank flooring pattern */}
      {/* Long wooden planks with staggered joints */}
      <rect x="4" y="12" width="24" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      <rect x="28" y="12" width="20" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.7" rx="0.5"/>
      <rect x="48" y="12" width="12" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      
      <rect x="4" y="18" width="16" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      <rect x="20" y="18" width="22" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.6" rx="0.5"/>
      <rect x="42" y="18" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      
      <rect x="4" y="24" width="20" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      <rect x="24" y="24" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.7" rx="0.5"/>
      <rect x="42" y="24" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      
      <rect x="4" y="30" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      <rect x="22" y="30" width="24" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.6" rx="0.5"/>
      <rect x="46" y="30" width="14" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      
      <rect x="4" y="36" width="22" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      <rect x="26" y="36" width="16" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.7" rx="0.5"/>
      <rect x="42" y="36" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      
      <rect x="4" y="42" width="14" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      <rect x="18" y="42" width="20" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.6" rx="0.5"/>
      <rect x="38" y="42" width="22" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.8" rx="0.5"/>
      
      <rect x="4" y="48" width="24" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      <rect x="28" y="48" width="18" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.7" rx="0.5"/>
      <rect x="46" y="48" width="14" height="6" fill={color} stroke={color} strokeWidth="0.3" opacity="0.9" rx="0.5"/>
      
      {/* Wood grain texture lines */}
      <line x1="6" y1="15" x2="26" y2="15" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="30" y1="15" x2="46" y2="15" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="50" y1="15" x2="58" y2="15" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="21" x2="18" y2="21" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="22" y1="21" x2="40" y2="21" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="44" y1="21" x2="58" y2="21" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="27" x2="22" y2="27" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="26" y1="27" x2="40" y2="27" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="44" y1="27" x2="58" y2="27" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="33" x2="20" y2="33" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="24" y1="33" x2="44" y2="33" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="48" y1="33" x2="58" y2="33" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="39" x2="24" y2="39" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="28" y1="39" x2="40" y2="39" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="44" y1="39" x2="58" y2="39" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="45" x2="16" y2="45" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="20" y1="45" x2="36" y2="45" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="40" y1="45" x2="58" y2="45" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      <line x1="6" y1="51" x2="26" y2="51" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="30" y1="51" x2="44" y2="51" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      <line x1="48" y1="51" x2="58" y2="51" stroke={color} strokeWidth="0.2" opacity="0.3"/>
      
      {/* Wood knots and natural texture */}
      <ellipse cx="16" cy="15" rx="1.5" ry="0.8" fill={color} opacity="0.2"/>
      <ellipse cx="35" cy="21" rx="1.2" ry="0.6" fill={color} opacity="0.2"/>
      <ellipse cx="50" cy="33" rx="1.3" ry="0.7" fill={color} opacity="0.2"/>
      <ellipse cx="12" cy="45" rx="1.1" ry="0.5" fill={color} opacity="0.2"/>
      <ellipse cx="40" cy="51" rx="1.4" ry="0.8" fill={color} opacity="0.2"/>
    </svg>
  )
}

export default ParchetIcon