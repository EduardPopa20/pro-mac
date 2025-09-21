import { useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'

export const useReCaptchaV2 = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const isAvailable = Boolean(siteKey)

  const executeRecaptcha = async (): Promise<string | null> => {
    if (!isAvailable || !recaptchaRef.current) {
      console.warn('reCAPTCHA v2 not available or not initialized')
      return null
    }

    setIsLoading(true)
    
    try {
      // Get the current token (user might have already completed it)
      const token = recaptchaRef.current.getValue()
      
      if (token) {
        return token
      }

      // If no token, execute the reCAPTCHA
      return new Promise((resolve) => {
        recaptchaRef.current?.execute()
        // The token will be available in the onChange callback
        // We'll handle this in the component that uses this hook
        resolve(null)
      })
    } catch (error) {
      console.error('reCAPTCHA v2 execution failed:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const resetRecaptcha = () => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  return {
    recaptchaRef,
    isAvailable,
    isLoading,
    siteKey,
    executeRecaptcha,
    resetRecaptcha
  }
}