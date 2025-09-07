// PDF Generator for Romanian Invoices
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { 
  Invoice, 
  CompanyDetails, 
  PersonDetails,
  InvoiceItem,
  isCompany
} from './types'
import { formatInvoiceNumber } from './validator'

// Romanian number to words converter
function numberToWordsRO(num: number): string {
  const ones = ['', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă']
  const teens = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 
                 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece']
  const tens = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 
                'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci']
  const hundreds = ['', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute',
                   'șase sute', 'șapte sute', 'opt sute', 'nouă sute']
  
  if (num === 0) return 'zero'
  
  const integer = Math.floor(num)
  const decimal = Math.round((num - integer) * 100)
  
  let words = ''
  
  // Thousands
  if (integer >= 1000) {
    const thousands = Math.floor(integer / 1000)
    if (thousands === 1) {
      words += 'o mie '
    } else if (thousands < 10) {
      words += ones[thousands] + ' mii '
    } else if (thousands < 20) {
      words += teens[thousands - 10] + ' mii '
    } else {
      const t = Math.floor(thousands / 10)
      const o = thousands % 10
      words += tens[t] + (o > 0 ? ' și ' + ones[o] : '') + ' mii '
    }
  }
  
  // Hundreds
  const h = Math.floor((integer % 1000) / 100)
  if (h > 0) {
    words += hundreds[h] + ' '
  }
  
  // Tens and ones
  const remainder = integer % 100
  if (remainder >= 20) {
    const t = Math.floor(remainder / 10)
    const o = remainder % 10
    words += tens[t] + (o > 0 ? ' și ' + ones[o] : '')
  } else if (remainder >= 10) {
    words += teens[remainder - 10]
  } else if (remainder > 0) {
    words += ones[remainder]
  }
  
  // Add currency
  words = words.trim() + ' lei'
  
  // Add decimal part
  if (decimal > 0) {
    words += ' și ' + decimal + ' bani'
  }
  
  return words
}

export class InvoicePDFGenerator {
  private doc: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number
  
  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margin = 15
    this.currentY = this.margin
  }
  
  generatePDF(invoice: Invoice): Blob {
    // Reset document
    this.doc = new jsPDF()
    this.currentY = this.margin
    
    // Add custom fonts for Romanian characters
    this.doc.setFont('helvetica')
    
    // Header
    this.addHeader(invoice)
    
    // Invoice title
    this.addInvoiceTitle(invoice)
    
    // Parties information
    this.addPartiesInfo(invoice)
    
    // Invoice details
    this.addInvoiceDetails(invoice)
    
    // Items table
    this.addItemsTable(invoice)
    
    // Totals
    this.addTotals(invoice)
    
    // Payment details
    this.addPaymentDetails(invoice)
    
    // Footer
    this.addFooter(invoice)
    
    // Return as blob
    return this.doc.output('blob')
  }
  
  private addHeader(invoice: Invoice) {
    // Company logo placeholder
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(this.margin, this.currentY, 40, 20, 'F')
    
    // Company name
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(invoice.supplier.name, this.margin + 45, this.currentY + 10)
    
    // Invoice number on the right
    this.doc.setFontSize(14)
    const invoiceNumber = formatInvoiceNumber(invoice.series, invoice.number)
    const invoiceNumberWidth = this.doc.getTextWidth(invoiceNumber)
    this.doc.text(invoiceNumber, this.pageWidth - this.margin - invoiceNumberWidth, this.currentY + 10)
    
    this.currentY += 30
  }
  
  private addInvoiceTitle(invoice: Invoice) {
    this.doc.setFontSize(20)
    this.doc.setFont('helvetica', 'bold')
    
    let title = 'FACTURĂ'
    if (invoice.type === 'PROFORMA') title = 'FACTURĂ PROFORMĂ'
    if (invoice.type === 'STORNO') title = 'FACTURĂ STORNO'
    if (invoice.type === 'AVIZ') title = 'AVIZ DE ÎNSOȚIRE'
    
    const titleWidth = this.doc.getTextWidth(title)
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.currentY)
    
    // Add series and number
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    const subtitle = `Seria ${invoice.series} Nr. ${invoice.number}`
    const subtitleWidth = this.doc.getTextWidth(subtitle)
    this.doc.text(subtitle, (this.pageWidth - subtitleWidth) / 2, this.currentY + 7)
    
    this.currentY += 15
  }
  
  private addPartiesInfo(invoice: Invoice) {
    const columnWidth = (this.pageWidth - 2 * this.margin - 10) / 2
    
    // Supplier box
    this.doc.setFillColor(245, 245, 245)
    this.doc.rect(this.margin, this.currentY, columnWidth, 60, 'F')
    this.doc.rect(this.margin, this.currentY, columnWidth, 60, 'S')
    
    // Customer box
    this.doc.rect(this.margin + columnWidth + 10, this.currentY, columnWidth, 60, 'F')
    this.doc.rect(this.margin + columnWidth + 10, this.currentY, columnWidth, 60, 'S')
    
    // Supplier info
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('FURNIZOR:', this.margin + 5, this.currentY + 8)
    
    this.doc.setFont('helvetica', 'normal')
    let supplierY = this.currentY + 15
    this.doc.text(invoice.supplier.name, this.margin + 5, supplierY)
    supplierY += 5
    this.doc.text(`CUI: ${invoice.supplier.cif}`, this.margin + 5, supplierY)
    supplierY += 5
    if (invoice.supplier.regCom) {
      this.doc.text(`Reg. Com.: ${invoice.supplier.regCom}`, this.margin + 5, supplierY)
      supplierY += 5
    }
    this.doc.text(
      `${invoice.supplier.address.street} ${invoice.supplier.address.number}`,
      this.margin + 5,
      supplierY
    )
    supplierY += 5
    this.doc.text(
      `${invoice.supplier.address.postalCode} ${invoice.supplier.address.city}, ${invoice.supplier.address.county}`,
      this.margin + 5,
      supplierY
    )
    
    // Customer info
    const customerX = this.margin + columnWidth + 15
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CLIENT:', customerX, this.currentY + 8)
    
    this.doc.setFont('helvetica', 'normal')
    let customerY = this.currentY + 15
    this.doc.text(invoice.customer.name, customerX, customerY)
    customerY += 5
    
    if (isCompany(invoice.customer)) {
      this.doc.text(`CUI: ${invoice.customer.cif}`, customerX, customerY)
      customerY += 5
      if (invoice.customer.regCom) {
        this.doc.text(`Reg. Com.: ${invoice.customer.regCom}`, customerX, customerY)
        customerY += 5
      }
    }
    
    this.doc.text(
      `${invoice.customer.address.street} ${invoice.customer.address.number}`,
      customerX,
      customerY
    )
    customerY += 5
    this.doc.text(
      `${invoice.customer.address.postalCode} ${invoice.customer.address.city}, ${invoice.customer.address.county}`,
      customerX,
      customerY
    )
    
    this.currentY += 65
  }
  
  private addInvoiceDetails(invoice: Invoice) {
    this.doc.setFontSize(10)
    
    // Date information
    const dateInfo = [
      `Data emiterii: ${format(invoice.date, 'dd.MM.yyyy', { locale: ro })}`,
      `Data scadenței: ${format(invoice.dueDate, 'dd.MM.yyyy', { locale: ro })}`
    ]
    
    if (invoice.type === 'STORNO' && invoice.stornoReference) {
      dateInfo.push(`Stornează factura: ${invoice.stornoReference}`)
    }
    
    dateInfo.forEach((info, index) => {
      this.doc.text(info, this.margin, this.currentY + (index * 5))
    })
    
    this.currentY += dateInfo.length * 5 + 10
  }
  
  private addItemsTable(invoice: Invoice) {
    // Table headers
    const headers = ['Nr.', 'Denumire', 'UM', 'Cant.', 'Preț unit.', 'Valoare', 'TVA %', 'TVA', 'Total']
    const columnWidths = [10, 60, 15, 15, 25, 25, 15, 20, 25]
    
    // Header row
    this.doc.setFillColor(50, 50, 50)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    
    let xPos = this.margin
    headers.forEach((header, index) => {
      this.doc.text(header, xPos + 2, this.currentY + 5)
      xPos += columnWidths[index]
    })
    
    this.currentY += 8
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFont('helvetica', 'normal')
    
    // Items rows
    invoice.items.forEach((item, index) => {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage()
        this.currentY = this.margin
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(248, 248, 248)
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 7, 'F')
      }
      
      xPos = this.margin
      const rowData = [
        (index + 1).toString(),
        item.name.substring(0, 40),
        item.unit,
        item.quantity.toFixed(2),
        item.unitPrice.toFixed(2),
        item.subtotal.toFixed(2),
        item.vatRate.toFixed(0) + '%',
        item.vatAmount.toFixed(2),
        item.total.toFixed(2)
      ]
      
      rowData.forEach((data, colIndex) => {
        this.doc.text(data, xPos + 2, this.currentY + 5)
        xPos += columnWidths[colIndex]
      })
      
      this.currentY += 7
    })
    
    // Table border
    this.doc.rect(
      this.margin,
      this.currentY - (invoice.items.length * 7),
      this.pageWidth - 2 * this.margin,
      invoice.items.length * 7,
      'S'
    )
    
    this.currentY += 5
  }
  
  private addTotals(invoice: Invoice) {
    const totalsX = this.pageWidth - this.margin - 70
    
    // Subtotal
    this.doc.setFontSize(10)
    this.doc.text('Subtotal (fără TVA):', totalsX - 30, this.currentY)
    this.doc.text(invoice.subtotal.toFixed(2) + ' ' + invoice.currency, totalsX + 30, this.currentY, { align: 'right' })
    this.currentY += 5
    
    // VAT breakdown
    invoice.vatBreakdown.forEach(vat => {
      this.doc.text(`TVA ${vat.rate}%:`, totalsX - 30, this.currentY)
      this.doc.text(vat.amount.toFixed(2) + ' ' + invoice.currency, totalsX + 30, this.currentY, { align: 'right' })
      this.currentY += 5
    })
    
    // Discount if applicable
    if (invoice.totalDiscount) {
      this.doc.text('Discount:', totalsX - 30, this.currentY)
      this.doc.text('-' + invoice.totalDiscount.toFixed(2) + ' ' + invoice.currency, totalsX + 30, this.currentY, { align: 'right' })
      this.currentY += 5
    }
    
    // Total line
    this.doc.line(totalsX - 35, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 3
    
    // Total
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(12)
    this.doc.text('TOTAL DE PLATĂ:', totalsX - 30, this.currentY)
    this.doc.text(invoice.total.toFixed(2) + ' ' + invoice.currency, totalsX + 30, this.currentY, { align: 'right' })
    
    // Total in words
    this.currentY += 10
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    const totalInWords = numberToWordsRO(invoice.total)
    this.doc.text(`Suma în litere: ${totalInWords}`, this.margin, this.currentY)
    
    this.currentY += 10
  }
  
  private addPaymentDetails(invoice: Invoice) {
    if (!invoice.supplier.bankAccounts || invoice.supplier.bankAccounts.length === 0) return
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Date bancare:', this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.currentY += 5
    
    invoice.supplier.bankAccounts.forEach(account => {
      this.doc.text(`${account.bankName}: ${account.iban} (${account.currency})`, this.margin + 5, this.currentY)
      this.currentY += 5
    })
    
    if (invoice.paymentMethod) {
      this.currentY += 5
      const paymentMethods = {
        'CASH': 'Numerar',
        'BANK_TRANSFER': 'Transfer bancar',
        'CARD': 'Card bancar',
        'OP': 'Ordin de plată'
      }
      this.doc.text(
        `Modalitate de plată: ${paymentMethods[invoice.paymentMethod] || invoice.paymentMethod}`,
        this.margin,
        this.currentY
      )
    }
    
    this.currentY += 10
  }
  
  private addFooter(invoice: Invoice) {
    // Signature areas
    const signatureY = this.pageHeight - 40
    const columnWidth = (this.pageWidth - 2 * this.margin - 20) / 2
    
    // Supplier signature
    this.doc.setFontSize(9)
    this.doc.text('Furnizor:', this.margin, signatureY)
    this.doc.line(this.margin, signatureY + 15, this.margin + columnWidth, signatureY + 15)
    this.doc.text('Semnătura și ștampila', this.margin + 10, signatureY + 20)
    
    // Customer signature
    this.doc.text('Client:', this.pageWidth - this.margin - columnWidth, signatureY)
    this.doc.line(
      this.pageWidth - this.margin - columnWidth,
      signatureY + 15,
      this.pageWidth - this.margin,
      signatureY + 15
    )
    this.doc.text('Semnătura și ștampila', this.pageWidth - this.margin - columnWidth + 10, signatureY + 20)
    
    // Footer text
    if (invoice.notes) {
      this.doc.setFontSize(8)
      this.doc.text(invoice.notes, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
    }
    
    // Page number
    this.doc.setFontSize(8)
    this.doc.text(
      `Pagina 1 din 1`,
      this.pageWidth - this.margin,
      this.pageHeight - 5,
      { align: 'right' }
    )
  }
  
  async saveAsPDF(invoice: Invoice, filename?: string): Promise<void> {
    const blob = this.generatePDF(invoice)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `Factura_${formatInvoiceNumber(invoice.series, invoice.number)}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  async getBase64(invoice: Invoice): Promise<string> {
    const blob = this.generatePDF(invoice)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        resolve(base64.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

export const invoicePDFGenerator = new InvoicePDFGenerator()