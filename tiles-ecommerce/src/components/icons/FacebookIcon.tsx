import React from 'react'

interface FacebookIconProps {
  size?: number
}

const FacebookIcon: React.FC<FacebookIconProps> = ({ size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M15.12 12.4l.29-1.89h-1.81V9.35c0-.52.25-1.02 1.06-1.02h.82V6.73s-.75-.13-1.46-.13c-1.49 0-2.46.9-2.46 2.54v1.37H9.91v1.89h1.65V18h2.03v-5.6h1.53z"
        fill="white"
      />
    </svg>
  )
}

export default FacebookIcon