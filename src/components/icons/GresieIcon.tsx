import React from 'react'

interface GresieIconProps {
  size?: number
  color?: string
  className?: string
}

const GresieIcon: React.FC<GresieIconProps> = ({ 
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
      {/* Gresie - Large floor tiles pattern */}
      {/* Large square tiles (typical for floor) */}
      <rect x="6" y="10" width="18" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.9" rx="1"/>
      <rect x="24" y="10" width="18" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.7" rx="1"/>
      <rect x="42" y="10" width="16" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.9" rx="1"/>
      
      <rect x="6" y="28" width="18" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.8" rx="1"/>
      <rect x="24" y="28" width="18" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.6" rx="1"/>
      <rect x="42" y="28" width="16" height="18" fill={color} stroke={color} strokeWidth="0.8" opacity="0.8" rx="1"/>
      
      <rect x="6" y="46" width="18" height="12" fill={color} stroke={color} strokeWidth="0.8" opacity="0.9" rx="1"/>
      <rect x="24" y="46" width="18" height="12" fill={color} stroke={color} strokeWidth="0.8" opacity="0.7" rx="1"/>
      <rect x="42" y="46" width="16" height="12" fill={color} stroke={color} strokeWidth="0.8" opacity="0.9" rx="1"/>
      
      {/* Floor texture pattern - subtle dots to suggest ceramic texture */}
      <circle cx="15" cy="19" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="33" cy="19" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="50" cy="19" r="0.8" fill={color} opacity="0.3"/>
      
      <circle cx="15" cy="37" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="33" cy="37" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="50" cy="37" r="0.8" fill={color} opacity="0.3"/>
      
      <circle cx="15" cy="52" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="33" cy="52" r="0.8" fill={color} opacity="0.3"/>
      <circle cx="50" cy="52" r="0.8" fill={color} opacity="0.3"/>
      
      {/* Grout lines - thicker for floor tiles */}
      <line x1="6" y1="28" x2="58" y2="28" stroke={color} strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="46" x2="58" y2="46" stroke={color} strokeWidth="0.5" opacity="0.4"/>
      <line x1="24" y1="10" x2="24" y2="58" stroke={color} strokeWidth="0.5" opacity="0.4"/>
      <line x1="42" y1="10" x2="42" y2="58" stroke={color} strokeWidth="0.5" opacity="0.4"/>
      
      {/* Decorative corner elements to suggest floor installation */}
      <path d="M10 14 L14 10 L18 14 L14 18 Z" fill={color} opacity="0.2"/>
      <path d="M28 32 L32 28 L36 32 L32 36 Z" fill={color} opacity="0.2"/>
      <path d="M46 50 L50 46 L54 50 L50 54 Z" fill={color} opacity="0.2"/>
    </svg>
  )
}

export default GresieIcon