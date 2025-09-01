import { useContext } from 'react'
import { GoogleReCaptchaContext } from 'react-google-recaptcha-v3'

export const useOptionalReCaptcha = () => {
  try {
    const context = useContext(GoogleReCaptchaContext)
    return {
      executeRecaptcha: context?.executeRecaptcha || null,
      isAvailable: !!context?.executeRecaptcha
    }
  } catch {
    return {
      executeRecaptcha: null,
      isAvailable: false
    }
  }
}