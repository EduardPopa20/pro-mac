import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Performance optimization: Hide initial loading screen once React loads
const AppWithLoadingOptimization = () => {
  useEffect(() => {
    // Remove initial loading screen once React has mounted
    const appLoading = document.querySelector('.app-loading')
    if (appLoading) {
      // Add fade-out animation
      appLoading.style.opacity = '0'
      appLoading.style.transition = 'opacity 0.3s ease-out'
      
      setTimeout(() => {
        appLoading.remove()
      }, 300)
    }
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithLoadingOptimization />
  </StrictMode>,
)
