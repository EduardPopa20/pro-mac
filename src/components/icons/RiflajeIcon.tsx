import React from 'react'

interface RiflajeIconProps {
  size?: number
  color?: string
  className?: string
}

const RiflajeIcon: React.FC<RiflajeIconProps> = ({ 
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
      {/* Riflaje - Wall molding/trim pattern */}
      {/* Horizontal molding strips/profiles */}
      <rect x="6" y="14" width="52" height="4" fill={color} opacity="0.9" rx="2"/>
      <rect x="6" y="22" width="52" height="3" fill={color} opacity="0.7" rx="1.5"/>
      <rect x="6" y="29" width="52" height="5" fill={color} opacity="0.9" rx="2.5"/>
      <rect x="6" y="38" width="52" height="3" fill={color} opacity="0.7" rx="1.5"/>
      <rect x="6" y="45" width="52" height="4" fill={color} opacity="0.9" rx="2"/>
      
      {/* Decorative molding profiles with beveled edges */}
      <path d="M6 14 L8 12 L56 12 L58 14 L58 18 L56 20 L8 20 L6 18 Z" 
            fill={color} opacity="0.3"/>
      <path d="M6 29 L8 27 L56 27 L58 29 L58 34 L56 36 L8 36 L6 34 Z" 
            fill={color} opacity="0.3"/>
      <path d="M6 45 L8 43 L56 43 L58 45 L58 49 L56 51 L8 51 L6 49 Z" 
            fill={color} opacity="0.3"/>
      
      {/* Corner connection elements */}
      <rect x="4" y="12" width="4" height="40" fill={color} opacity="0.8" rx="1"/>
      <rect x="56" y="12" width="4" height="40" fill={color} opacity="0.8" rx="1"/>
      
      {/* Decorative corner details */}
      <path d="M4 12 L8 8 L8 12 Z" fill={color} opacity="0.4"/>
      <path d="M56 12 L60 8 L60 12 Z" fill={color} opacity="0.4"/>
      <path d="M4 52 L8 56 L8 52 Z" fill={color} opacity="0.4"/>
      <path d="M56 52 L60 56 L60 52 Z" fill={color} opacity="0.4"/>
      
      {/* Mounting/fixing points */}
      <circle cx="12" cy="16" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="32" cy="16" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="52" cy="16" r="0.8" fill={color} opacity="0.4"/>
      
      <circle cx="12" cy="31" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="32" cy="31" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="52" cy="31" r="0.8" fill={color} opacity="0.4"/>
      
      <circle cx="12" cy="47" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="32" cy="47" r="0.8" fill={color} opacity="0.4"/>
      <circle cx="52" cy="47" r="0.8" fill={color} opacity="0.4"/>
      
      {/* Shadow/depth lines for 3D effect */}
      <line x1="8" y1="19" x2="56" y2="19" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="35" x2="56" y2="35" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      <line x1="8" y1="50" x2="56" y2="50" stroke={color} strokeWidth="0.3" opacity="0.3"/>
      
      {/* Top highlight lines */}
      <line x1="8" y1="13" x2="56" y2="13" stroke={color} strokeWidth="0.2" opacity="0.5"/>
      <line x1="8" y1="28" x2="56" y2="28" stroke={color} strokeWidth="0.2" opacity="0.5"/>
      <line x1="8" y1="44" x2="56" y2="44" stroke={color} strokeWidth="0.2" opacity="0.5"/>
      
      {/* Subtle texture pattern */}
      <rect x="14" y="15.5" width="36" height="1" fill={color} opacity="0.1" rx="0.5"/>
      <rect x="14" y="30.5" width="36" height="1" fill={color} opacity="0.1" rx="0.5"/>
      <rect x="14" y="46.5" width="36" height="1" fill={color} opacity="0.1" rx="0.5"/>
    </svg>
  )
}

export default RiflajeIcon