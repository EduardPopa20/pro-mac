// Utility functions for generating SEO-friendly slugs

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    // Replace Romanian diacritics
    .replace(/[ăâ]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[șş]/g, 's')
    .replace(/[țţ]/g, 't')
    // Remove any characters that are not letters, numbers, spaces, or hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces or hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
}

export const generateProductSlug = (productName: string): string => {
  // Limit slug length to avoid very long URLs while keeping it meaningful
  const slug = generateSlug(productName)
  
  // If slug is too long, truncate at word boundaries
  if (slug.length > 60) {
    const words = slug.split('-')
    let truncated = words[0]
    
    for (let i = 1; i < words.length; i++) {
      if ((truncated + '-' + words[i]).length <= 60) {
        truncated += '-' + words[i]
      } else {
        break
      }
    }
    
    return truncated
  }
  
  return slug
}

export const generateProductUrl = (productName: string, productId: number, categorySlug: string): string => {
  const productSlug = generateProductSlug(productName)
  return `/${categorySlug}/${productSlug}/${productId}`
}