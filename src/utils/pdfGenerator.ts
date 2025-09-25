import jsPDF from 'jspdf'
import type { CalculationResult, ProductCalculatorType } from '../types/calculator'
import type { Product } from '../types'
import { formatArea, formatPrice, getCalculatorTitle } from './calculatorUtils'

interface PDFGenerationOptions {
  result: CalculationResult
  product: Product
  calculatorType: ProductCalculatorType
  roomDimensions?: { length: number; width: number; height?: number }
  companyInfo?: {
    name: string
    address: string
    phone: string
    email: string
    website: string
  }
}

// Default company information
const DEFAULT_COMPANY_INFO = {
  name: 'Pro-Mac',
  address: 'București, România',
  phone: '+40 XXX XXX XXX',
  email: 'contact@promac.ro',
  website: 'www.promac.ro'
}

/**
 * Generate PDF for calculation results
 */
export function generateCalculationPDF(options: PDFGenerationOptions): jsPDF {
  const { 
    result, 
    product, 
    calculatorType, 
    roomDimensions,
    companyInfo = DEFAULT_COMPANY_INFO 
  } = options
  
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })
  
  // Define colors
  const primaryColor = { r: 33, g: 150, b: 243 } // Blue
  const secondaryColor = { r: 100, g: 100, b: 100 } // Gray
  const successColor = { r: 76, g: 175, b: 80 } // Green
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (2 * margin)
  
  let yPosition = margin
  
  // Header with company logo/name
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Company name
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(companyInfo.name, margin, 20)
  
  // Document title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Calculator Necesar Material', margin, 30)
  
  // Date
  doc.setFontSize(10)
  const currentDate = new Date().toLocaleDateString('ro-RO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
  doc.text(`Data: ${currentDate}`, pageWidth - margin - 40, 30)
  
  yPosition = 50
  
  // Reset text color
  doc.setTextColor(0, 0, 0)
  
  // Product Information Section
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPosition, contentWidth, 8, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMAȚII PRODUS', margin + 2, yPosition + 5.5)
  yPosition += 12
  
  // Product details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  const productInfo = [
    ['Produs:', product.name],
    ['Cod produs:', product.product_code || 'N/A'],
    ['Categorie:', getCalculatorTitle(calculatorType).replace('Calculator ', '')],
    ['Preț/unitate:', `${formatPrice(product.price)} / ${product.price_unit || 'cutie'}`],
    ['Dimensiuni:', product.dimensions || 'N/A']
  ]
  
  productInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, yPosition)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 35, yPosition)
    yPosition += 6
  })
  
  yPosition += 5
  
  // Room/Area Information (if available)
  if (roomDimensions) {
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPosition, contentWidth, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DIMENSIUNI SPAȚIU', margin + 2, yPosition + 5.5)
    yPosition += 12
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    const dimensionInfo = [
      ['Lungime:', `${roomDimensions.length} m`],
      ['Lățime:', `${roomDimensions.width} m`],
      roomDimensions.height ? ['Înălțime:', `${roomDimensions.height} m`] : null
    ].filter(Boolean) as string[][]
    
    dimensionInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, margin, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(value, margin + 35, yPosition)
      yPosition += 6
    })
    
    yPosition += 5
  }
  
  // Calculation Results Section
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPosition, contentWidth, 8, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('REZULTATE CALCUL', margin + 2, yPosition + 5.5)
  yPosition += 12
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  // Main calculation results
  const calculationResults = [
    ['Suprafață de bază:', formatArea(result.baseArea)],
    [`Procent pierderi:`, `${result.wastagePercentage}%`],
    ['Suprafață cu pierderi:', formatArea(result.totalArea)],
    ['', ''], // Empty line
    ['CANTITATE NECESARĂ:', ''],
  ]
  
  calculationResults.forEach(([label, value]) => {
    if (label === 'CANTITATE NECESARĂ:') {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(label, margin, yPosition)
      yPosition += 8
      
      // Highlight box for main result
      doc.setFillColor(successColor.r, successColor.g, successColor.b, 20)
      doc.rect(margin, yPosition - 5, contentWidth, 12, 'F')
      
      doc.setFontSize(14)
      doc.setTextColor(successColor.r, successColor.g, successColor.b)
      doc.text(`${result.boxesNeeded} CUTII`, margin + 5, yPosition + 3)
      doc.setTextColor(0, 0, 0)
      
      if (result.piecesNeeded) {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text(`(${result.piecesNeeded} plăci)`, margin + 40, yPosition + 3)
      }
      yPosition += 10
    } else if (label) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(label, margin, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(value, margin + 45, yPosition)
      yPosition += 6
    } else {
      yPosition += 3
    }
  })
  
  yPosition += 5
  
  // Additional Materials Section (if any)
  if (result.additionalMaterials && result.additionalMaterials.length > 0) {
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPosition, contentWidth, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('MATERIALE AUXILIARE RECOMANDATE', margin + 2, yPosition + 5.5)
    yPosition += 12
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    result.additionalMaterials.forEach(material => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${material.name}:`, margin, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `${material.quantity} ${material.unit}`, 
        margin + 40, 
        yPosition
      )
      if (material.totalPrice) {
        doc.text(
          `(${formatPrice(material.totalPrice)})`, 
          margin + 80, 
          yPosition
        )
      }
      yPosition += 6
    })
    
    yPosition += 5
  }
  
  // Cost Summary Section
  doc.setFillColor(245, 245, 245)
  doc.rect(margin, yPosition, contentWidth, 8, 'F')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('ESTIMARE COSTURI', margin + 2, yPosition + 5.5)
  yPosition += 12
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  
  const costSummary = [
    [`${product.name}:`, formatPrice(result.productCost)],
    result.additionalMaterialsCost 
      ? ['Materiale auxiliare:', formatPrice(result.additionalMaterialsCost)]
      : null,
    ['', ''], // Separator
  ].filter(Boolean) as string[][]
  
  costSummary.forEach(([label, value]) => {
    if (label) {
      doc.text(label, margin, yPosition)
      doc.text(value, pageWidth - margin - 40, yPosition)
      yPosition += 6
    } else {
      // Draw line for total
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
      yPosition += 2
    }
  })
  
  // Total cost
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL ESTIMAT:', margin, yPosition)
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text(formatPrice(result.totalCost), pageWidth - margin - 40, yPosition)
  doc.setTextColor(0, 0, 0)
  yPosition += 10
  
  // Recommendations Section (if any)
  if (result.recommendations && result.recommendations.length > 0) {
    doc.setFillColor(255, 243, 224) // Light orange
    doc.rect(margin, yPosition, contentWidth, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('RECOMANDĂRI', margin + 2, yPosition + 5.5)
    yPosition += 12
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    result.recommendations.forEach(rec => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }
      
      // Bullet point
      doc.text('•', margin, yPosition)
      
      // Wrap text if needed
      const lines = doc.splitTextToSize(rec, contentWidth - 10)
      lines.forEach((line, index) => {
        doc.text(line, margin + 5, yPosition + (index * 5))
      })
      yPosition += lines.length * 5 + 2
    })
  }
  
  // Footer
  yPosition = pageHeight - 30
  
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 5
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
  
  // Company contact info
  doc.text(companyInfo.name, margin, yPosition)
  doc.text(`Tel: ${companyInfo.phone}`, margin, yPosition + 4)
  doc.text(`Email: ${companyInfo.email}`, margin, yPosition + 8)
  
  // Website
  doc.text(companyInfo.website, pageWidth - margin - 30, yPosition)
  
  // Disclaimer
  doc.setFontSize(8)
  doc.text(
    'Acest document reprezintă o estimare. Cantitățile finale pot varia în funcție de condițiile specifice.',
    pageWidth / 2,
    yPosition + 12,
    { align: 'center' }
  )
  
  return doc
}

/**
 * Download PDF directly
 */
export function downloadCalculationPDF(
  options: PDFGenerationOptions,
  filename?: string
): void {
  const pdf = generateCalculationPDF(options)
  const defaultFilename = `calculator_${options.calculatorType}_${new Date().getTime()}.pdf`
  pdf.save(filename || defaultFilename)
}

/**
 * Get PDF as blob for preview or sending
 */
export function getCalculationPDFBlob(options: PDFGenerationOptions): Blob {
  const pdf = generateCalculationPDF(options)
  return pdf.output('blob')
}

/**
 * Get PDF as base64 string
 */
export function getCalculationPDFBase64(options: PDFGenerationOptions): string {
  const pdf = generateCalculationPDF(options)
  return pdf.output('datauristring')
}