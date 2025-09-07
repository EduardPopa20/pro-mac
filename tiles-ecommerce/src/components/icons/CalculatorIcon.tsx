import React from 'react'

interface CalculatorIconProps {
  size?: number
  color?: string
  className?: string
}

const CalculatorIcon: React.FC<CalculatorIconProps> = ({ 
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
      {/* Calculator body - doar conturul pentru claritate */}
      <rect x="16" y="8" width="32" height="48" fill="none" stroke={color} strokeWidth="2" opacity="0.8" rx="4"/>
      
      {/* Display screen */}
      <rect x="20" y="12" width="24" height="8" fill={color} opacity="0.2" stroke={color} strokeWidth="1" rx="2"/>
      
      {/* Display content (numbers) */}
      <line x1="22" y1="15" x2="24" y2="15" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="26" y1="15" x2="30" y2="15" stroke={color} strokeWidth="1" opacity="0.7"/>
      <line x1="32" y1="15" x2="34" y2="15" stroke={color} strokeWidth="1" opacity="0.7"/>
      
      <line x1="36" y1="15" x2="42" y2="15" stroke={color} strokeWidth="1.2" opacity="0.8"/>
      <line x1="38" y1="17" x2="42" y2="17" stroke={color} strokeWidth="1" opacity="0.7"/>
      
      {/* Button grid simplified pentru claritate la dimensiuni mici */}
      {/* Row 1 - doar contururi */}
      <rect x="20" y="24" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="26" y="24" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="32" y="24" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="38" y="24" width="4" height="4" fill={color} opacity="0.3" stroke={color} strokeWidth="0.8" rx="0.5"/>
      
      {/* Row 2 */}
      <rect x="20" y="30" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="26" y="30" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="32" y="30" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="38" y="30" width="4" height="4" fill={color} opacity="0.3" stroke={color} strokeWidth="0.8" rx="0.5"/>
      
      {/* Row 3 */}
      <rect x="20" y="36" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="26" y="36" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="32" y="36" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="38" y="36" width="4" height="4" fill={color} opacity="0.3" stroke={color} strokeWidth="0.8" rx="0.5"/>
      
      {/* Row 4 - butoane mai mari pentru vizibilitate */}
      <rect x="20" y="42" width="10" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/> {/* 0 button */}
      <rect x="32" y="42" width="4" height="4" fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" rx="0.5"/>
      <rect x="38" y="42" width="4" height="10" fill={color} opacity="0.4" stroke={color} strokeWidth="1" rx="0.5"/> {/* Enter button */}
      
      {/* Simboluri matematice mai mari pentru vizibilitate la dimensiuni mici */}
      {/* Plus în prima linie de operatori */}
      <line x1="39.5" y1="25.5" x2="41.5" y2="25.5" stroke={color} strokeWidth="1" opacity="0.9"/>
      <line x1="40.5" y1="24.5" x2="40.5" y2="26.5" stroke={color} strokeWidth="1" opacity="0.9"/>
      
      {/* Minus */}
      <line x1="39.5" y1="31.5" x2="41.5" y2="31.5" stroke={color} strokeWidth="1" opacity="0.9"/>
      
      {/* Multiplicare (X) */}
      <line x1="39.5" y1="37.5" x2="41.5" y2="39.5" stroke={color} strokeWidth="1" opacity="0.9"/>
      <line x1="41.5" y1="37.5" x2="39.5" y2="39.5" stroke={color} strokeWidth="1" opacity="0.9"/>
      
      {/* Egal în butonul Enter */}
      <line x1="39.5" y1="46" x2="41.5" y2="46" stroke={color} strokeWidth="1.2" opacity="0.9"/>
      <line x1="39.5" y1="48" x2="41.5" y2="48" stroke={color} strokeWidth="1.2" opacity="0.9"/>
    </svg>
  )
}

export default CalculatorIcon