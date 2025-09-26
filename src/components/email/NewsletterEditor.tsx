/**
 * Newsletter Visual Editor - Interfață user-friendly pentru administratori non-tehnici
 * Permite editarea vizuală a emailurilor fără cunoștințe de markup
 */
import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  useMediaQuery,
  Stack,
  MenuItem
} from '@mui/material'
import {
  Delete as DeleteIcon,
  Image as ImageIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  ShoppingCart as ShoppingIcon,
  Close as CloseIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import NewsletterTemplate from './NewsletterTemplate'
import type { NewsletterTemplateProps } from './NewsletterTemplate'
import { render } from '@react-email/render'
import ImageUpload from '../common/ImageUpload'
import { supabase } from '../../lib/supabase'
import { useAdminProductStore } from '../../stores/products'

interface Product {
  id: string
  name: string
  image: string
  price: string
  url: string
}

interface NewsletterEditorProps {
  onSave: (emailData: NewsletterTemplateProps) => Promise<void>
  onSend: (emailData: NewsletterTemplateProps) => Promise<void>
  loading?: boolean
}

export const NewsletterEditor: React.FC<NewsletterEditorProps> = ({
  onSave,
  onSend,
  loading = false
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Store pentru produse și categorii
  const { categories, products, fetchAllCategories, fetchProductsByCategory } = useAdminProductStore()

  // State pentru datele newsletter-ului
  const [emailData, setEmailData] = useState<NewsletterTemplateProps>({
    subject: '',
    mainTitle: '',
    mainContent: '',
    headerImage: '',
    productsSection: {
      title: 'Produse Recomandate',
      products: []
    },
    footerText: 'Mulțumim că faci parte din comunitatea Pro-Mac!',
    unsubscribeUrl: '#',
    websiteUrl: 'https://promac.ro'
  })

  // State pentru UI
  const [previewOpen, setPreviewOpen] = useState(false)
  const [includeProducts, setIncludeProducts] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [previewImageIssues, setPreviewImageIssues] = useState<string[]>([])

  // State pentru selecția de produse
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])

  // Effect pentru încărcarea categoriilor
  React.useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  // Effect pentru încărcarea produselor când se schimbă categoria
  React.useEffect(() => {
    if (selectedCategoryId) {
      fetchProductsByCategory(selectedCategoryId).then(() => {
        setAvailableProducts(products)
      })
    } else {
      setAvailableProducts([])
    }
  }, [selectedCategoryId, fetchProductsByCategory])

  // Update produsele disponibile când se schimbă produsele din store
  React.useEffect(() => {
    if (selectedCategoryId) {
      setAvailableProducts(products)
    }
  }, [products, selectedCategoryId])

  // Update email data
  const updateEmailData = (field: keyof NewsletterTemplateProps, value: any) => {
    setEmailData(prev => ({ ...prev, [field]: value }))
  }

  // Helper pentru a converti calea de stocare în URL public
  const getPublicImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(imagePath)

    return data.publicUrl
  }

  // Update products section
  const updateProductsSection = (field: string, value: any) => {
    setEmailData(prev => ({
      ...prev,
      productsSection: {
        ...prev.productsSection!,
        [field]: value
      }
    }))
  }


  // Add product from database
  const addProductFromDatabase = (productId: string) => {
    const selectedProduct = availableProducts.find(p => p.id === parseInt(productId))
    if (!selectedProduct) return

    const newProduct: Product = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      image: getPublicImageUrl(selectedProduct.image_path),
      price: selectedProduct.price ? `${selectedProduct.price} lei/mp` : 'Preț la cerere',
      url: `${emailData.websiteUrl}/produs/${selectedProduct.id}`
    }

    updateProductsSection('products', [
      ...(emailData.productsSection?.products || []),
      newProduct
    ])
  }

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    const id = categoryId ? parseInt(categoryId) : null
    setSelectedCategoryId(id)
  }

  // Remove product
  const removeProduct = (productId: string) => {
    updateProductsSection('products',
      emailData.productsSection?.products.filter(p => p.id !== productId) || []
    )
  }


  // Handle header image upload
  const handleHeaderImageUpload = (imagePath: string) => {
    updateEmailData('headerImage', imagePath)
  }

  // Helper function to test if image URL is accessible
  const testImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url) {
        resolve(false)
        return
      }

      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url

      // Timeout after 3 seconds
      setTimeout(() => resolve(false), 3000)
    })
  }

  // Preview email
  const handlePreview = async () => {
    try {
      setIsGeneratingPreview(true)
      setPreviewImageIssues([])
      const issues: string[] = []

      // Test header image and provide fallback
      const headerImageUrl = getPublicImageUrl(emailData.headerImage)
      const headerImageWorks = await testImageUrl(headerImageUrl)
      console.log('Header image test:', { url: headerImageUrl, works: headerImageWorks })

      if (emailData.headerImage && !headerImageWorks) {
        issues.push('Imaginea header nu poate fi încărcată - se va folosi un placeholder în preview')
      }

      // Process products with real images and fallbacks
      let processedProductsSection = undefined
      if (includeProducts && emailData.productsSection) {
        const products = []

        for (const product of emailData.productsSection.products) {
          const realImageUrl = product.image.startsWith('http') ? product.image : getPublicImageUrl(product.image)
          const imageWorks = await testImageUrl(realImageUrl)

          console.log('Product image test:', {
            product: product.name,
            url: realImageUrl,
            works: imageWorks
          })

          if (!imageWorks) {
            issues.push(`Imaginea pentru produsul "${product.name}" nu poate fi încărcată - se va folosi un placeholder în preview`)
          }

          products.push({
            ...product,
            image: imageWorks ? realImageUrl : `https://picsum.photos/150/150?random=${Date.now()}-${Math.random()}`
          })
        }

        processedProductsSection = {
          ...emailData.productsSection,
          products
        }
      }

      const finalEmailData = {
        ...emailData,
        headerImage: headerImageWorks ? headerImageUrl :
          emailData.headerImage ? 'https://picsum.photos/200/60?random=header' : '',
        productsSection: processedProductsSection
      }

      setPreviewImageIssues(issues)
      console.log('Final preview data:', finalEmailData)

      const html = await render(<NewsletterTemplate {...finalEmailData} />)
      setPreviewHtml(html)
      setPreviewOpen(true)
    } catch (error) {
      console.error('Preview error:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Save email
  const handleSave = async () => {
    // Convert all images to public URLs before saving
    const processedProductsSection = includeProducts && emailData.productsSection ? {
      ...emailData.productsSection,
      products: emailData.productsSection.products.map(product => ({
        ...product,
        image: product.image.startsWith('http') ? product.image : getPublicImageUrl(product.image)
      }))
    } : undefined

    const finalEmailData = {
      ...emailData,
      headerImage: getPublicImageUrl(emailData.headerImage),
      productsSection: processedProductsSection
    }
    await onSave(finalEmailData)
  }

  // Send email
  const handleSend = async () => {
    // Convert all images to public URLs before sending
    const processedProductsSection = includeProducts && emailData.productsSection ? {
      ...emailData.productsSection,
      products: emailData.productsSection.products.map(product => ({
        ...product,
        image: product.image.startsWith('http') ? product.image : getPublicImageUrl(product.image)
      }))
    } : undefined

    const finalEmailData = {
      ...emailData,
      headerImage: getPublicImageUrl(emailData.headerImage),
      productsSection: processedProductsSection
    }
    await onSend(finalEmailData)
  }

  return (
    <Box>
      {/* Header cu acțiuni */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Editor Newsletter
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={isGeneratingPreview ? undefined : <PreviewIcon />}
            onClick={handlePreview}
            disabled={isGeneratingPreview}
            size={isMobile ? 'medium' : 'small'}
            sx={{
              minHeight: { xs: 44, sm: 32 },
              px: { xs: 3, sm: 2 }
            }}
          >
            {isGeneratingPreview ? 'Se generează...' : 'Previzualizează'}
          </Button>

          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSend}
            disabled={loading || !emailData.subject || !emailData.mainTitle}
            size={isMobile ? 'medium' : 'small'}
            sx={{
              minHeight: { xs: 44, sm: 32 },
              px: { xs: 3, sm: 2 }
            }}
          >
            {loading ? 'Se trimite...' : 'Trimite'}
          </Button>
        </Stack>
      </Box>

      <Stack spacing={3}>
        {/* Informații Generale - pe o linie singură */}
        <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Informații Generale
            </Typography>
          </Box>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Subiect Email *"
              value={emailData.subject}
              onChange={(e) => updateEmailData('subject', e.target.value)}
              placeholder="Ex: Oferte speciale Pro-Mac - Martie 2024"
              helperText="Acesta va fi subiectul emailului primit de clienți"
            />

            <TextField
              fullWidth
              label="Titlu Principal *"
              value={emailData.mainTitle}
              onChange={(e) => updateEmailData('mainTitle', e.target.value)}
              placeholder="Ex: Oferte de primăvară la Pro-Mac!"
              helperText="Titlul mare care va apărea în email"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mesajul Principal"
              value={emailData.mainContent}
              onChange={(e) => updateEmailData('mainContent', e.target.value)}
              placeholder="Ex: Descoperă colecția noastră de primăvară cu reduceri de până la 30%..."
              helperText="Textul principal al emailului"
            />
          </Stack>
        </Box>

        {/* Header Image + Footer Settings - pe aceeași linie cu înălțimi egale */}
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          <Grid item xs={12} md={3}>
            <Box sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ImageIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Imagine Header
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Opțional - logo sau imagine pentru header-ul newsletter-ului
              </Typography>

              <Box sx={{ flexGrow: 1 }}>
                <ImageUpload
                  onImageUpload={handleHeaderImageUpload}
                  currentImagePath={emailData.headerImage}
                  bucketName="product-images"
                  folder="newsletter-headers"
                  maxSizeInMB={5}
                  acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ArticleIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Mesaj Footer
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <TextField
                  fullWidth
                  multiline
                  label="Text Footer"
                  value={emailData.footerText}
                  onChange={(e) => updateEmailData('footerText', e.target.value)}
                  placeholder="Mulțumim că faci parte din comunitatea Pro-Mac!"
                  helperText="Mesajul de la sfârșitul emailului"
                  sx={{
                    flexGrow: 1,
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'stretch'
                    },
                    '& .MuiInputBase-input': {
                      height: '100% !important',
                      overflow: 'auto !important'
                    }
                  }}
                  InputProps={{
                    sx: {
                      height: '100%',
                      '& textarea': {
                        height: '100% !important',
                        resize: 'none'
                      }
                    }
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Secțiunea Produse */}
        <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Secțiune Produse
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={includeProducts}
                  onChange={(e) => setIncludeProducts(e.target.checked)}
                />
              }
              label="Include produse"
            />
          </Box>

          {includeProducts && (
            <>
              <TextField
                fullWidth
                label="Titlu Secțiune Produse"
                value={emailData.productsSection?.title || ''}
                onChange={(e) => updateProductsSection('title', e.target.value)}
                placeholder="Ex: Produse Recomandate"
                sx={{ mb: 3 }}
              />

              {/* Dropdowns pentru selecția produselor din baza de date */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Adaugă Produse din Baza de Date
                </Typography>

                <Stack spacing={3}>
                  <TextField
                    select
                    fullWidth
                    label="Selectează Categoria"
                    value={selectedCategoryId || ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    size="small"
                    sx={{ minWidth: 350 }}
                  >
                    <MenuItem value="">
                      <em>Selectează o categorie</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name} ({category.products_count || 0} produse)
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Selectează Produsul"
                    value=""
                    onChange={(e) => addProductFromDatabase(e.target.value)}
                    disabled={!selectedCategoryId || availableProducts.length === 0}
                    size="small"
                    sx={{ minWidth: 450 }}
                  >
                    <MenuItem value="">
                      <em>
                        {!selectedCategoryId
                          ? 'Selectează mai întâi o categorie'
                          : availableProducts.length === 0
                          ? 'Niciun produs disponibil'
                          : 'Selectează un produs'
                        }
                      </em>
                    </MenuItem>
                    {availableProducts.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} {product.price && `- ${product.price} lei/mp`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Box>

              {emailData.productsSection?.products.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Produse Adăugate ({emailData.productsSection.products.length})
                  </Typography>
                  <Stack spacing={1}>
                    {emailData.productsSection.products.map((product) => (
                      <Box
                        key={product.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          bgcolor: 'grey.50'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.price}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeProduct(product.id)}
                          sx={{
                            minWidth: { xs: 44, sm: 32 },
                            minHeight: { xs: 44, sm: 32 }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Box>
      </Stack>

      {/* Action Buttons */}
      <Box sx={{
        mt: 3,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
        maxWidth: { xs: '100%', sm: 'auto' }
      }}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleSave}
          disabled={loading}
          sx={{
            minHeight: { xs: 48, sm: 40 },
            px: { xs: 4, sm: 3 }
          }}
        >
          Salvează Draft
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<SendIcon />}
          onClick={handleSend}
          disabled={loading || !emailData.subject || !emailData.mainTitle}
          sx={{
            minHeight: { xs: 48, sm: 40 },
            px: { xs: 4, sm: 3 }
          }}
        >
          {loading ? 'Se trimite...' : 'Trimite Newsletter'}
        </Button>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Preview Newsletter
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setPreviewOpen(false)}
            aria-label="închide"
            sx={{
              color: 'grey.500',
              '&:hover': { color: 'grey.700' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {previewImageIssues.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Probleme detectate cu imaginile:
              </Typography>
              <Stack spacing={1}>
                {previewImageIssues.map((issue, index) => (
                  <Typography key={index} variant="body2">
                    • {issue}
                  </Typography>
                ))}
              </Stack>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                Nota: Imaginile reale vor fi folosite când se trimite emailul final prin Resend.
              </Typography>
            </Alert>
          )}

          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
            <iframe
              srcDoc={previewHtml}
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                borderRadius: '4px'
              }}
            />
          </Box>
        </DialogContent>

      </Dialog>

    </Box>
  )
}

export default NewsletterEditor