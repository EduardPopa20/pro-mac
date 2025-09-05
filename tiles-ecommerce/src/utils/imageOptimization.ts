/**
 * Image Optimization Utilities
 * Provides functions for progressive image loading, WebP support, and responsive images
 */

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * Get optimized image URL based on browser support
 */
export const getOptimizedImageUrl = async (
  originalUrl: string,
  options?: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png'
  }
): Promise<string> => {
  if (!originalUrl) return ''
  
  // Check if it's a Supabase storage URL
  const isSupabaseUrl = originalUrl.includes('supabase')
  
  if (isSupabaseUrl && options) {
    // Supabase supports image transformations
    const params = new URLSearchParams()
    
    if (options.width) params.append('width', options.width.toString())
    if (options.height) params.append('height', options.height.toString())
    if (options.quality) params.append('quality', options.quality.toString())
    
    // Check WebP support
    const webpSupported = await supportsWebP()
    if (webpSupported && (!options.format || options.format === 'webp')) {
      params.append('format', 'webp')
    }
    
    const separator = originalUrl.includes('?') ? '&' : '?'
    return `${originalUrl}${separator}${params.toString()}`
  }
  
  return originalUrl
}

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920]
): string => {
  return sizes
    .map(size => `${baseUrl}?width=${size} ${size}w`)
    .join(', ')
}

/**
 * Get placeholder image URL (blurred version)
 */
export const getPlaceholderUrl = (originalUrl: string): string => {
  if (!originalUrl) return ''
  
  // For Supabase URLs, request a small, blurred version
  if (originalUrl.includes('supabase')) {
    const separator = originalUrl.includes('?') ? '&' : '?'
    return `${originalUrl}${separator}width=20&quality=10&blur=10`
  }
  
  // For other URLs, return a data URL placeholder
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="100%25" height="100%25" fill="%23ddd"/%3E%3C/svg%3E'
}

/**
 * Preload critical images
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url)))
}

/**
 * Lazy load images using Intersection Observer
 */
export const lazyLoadImages = (selector: string = 'img[data-src]'): void => {
  const images = document.querySelectorAll<HTMLImageElement>(selector)
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const src = img.dataset.src
            
            if (src) {
              img.src = src
              img.removeAttribute('data-src')
              imageObserver.unobserve(img)
              
              // Add loaded class for animations
              img.classList.add('loaded')
            }
          }
        })
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    )
    
    images.forEach(img => imageObserver.observe(img))
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      const src = img.dataset.src
      if (src) {
        img.src = src
        img.removeAttribute('data-src')
      }
    })
  }
}

/**
 * Convert image to WebP format (client-side)
 */
export const convertToWebP = async (
  file: File,
  quality: number = 0.8
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve(null)
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/webp',
          quality
        )
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Calculate optimal image dimensions based on container
 */
export const getOptimalDimensions = (
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { width: number; height: number } => {
  const containerAspectRatio = containerWidth / containerHeight
  const imageAspectRatio = imageWidth / imageHeight
  
  let optimalWidth: number
  let optimalHeight: number
  
  if (containerAspectRatio > imageAspectRatio) {
    // Container is wider than image aspect ratio
    optimalHeight = containerHeight * devicePixelRatio
    optimalWidth = optimalHeight * imageAspectRatio
  } else {
    // Container is taller than image aspect ratio
    optimalWidth = containerWidth * devicePixelRatio
    optimalHeight = optimalWidth / imageAspectRatio
  }
  
  // Round to nearest 10 for better caching
  return {
    width: Math.ceil(optimalWidth / 10) * 10,
    height: Math.ceil(optimalHeight / 10) * 10
  }
}

/**
 * Image loading states for React components
 */
export enum ImageLoadState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

/**
 * Hook-like function for progressive image loading
 */
export const useProgressiveImage = (
  src: string,
  placeholder?: string
): { src: string; blur: boolean; loaded: boolean } => {
  const [sourceLoaded, setSourceLoaded] = useState<string | null>(null)
  
  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setSourceLoaded(src)
    
    return () => {
      img.onload = null
    }
  }, [src])
  
  return {
    src: sourceLoaded || placeholder || '',
    blur: !sourceLoaded,
    loaded: !!sourceLoaded
  }
}

// Import useState and useEffect for the hook
import { useState, useEffect } from 'react'