// XML Generator for Romanian e-Factura (UBL 2.1 Standard)
import { Builder } from 'xml2js'
import { format } from 'date-fns'
import { 
  Invoice, 
  CompanyDetails, 
  PersonDetails,
  InvoiceItem,
  isCompany
} from './types'
import { validateInvoice, formatInvoiceNumber } from './validator'

// XML namespaces required by ANAF
const XML_NAMESPACES = {
  'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
  'xmlns:ccts': 'urn:un:unece:uncefact:documentation:2',
  'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
  'xmlns:qdt': 'urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2',
  'xmlns:udt': 'urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2',
  'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
}

export class InvoiceXMLGenerator {
  private builder: Builder
  
  constructor() {
    this.builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
      headless: false
    })
  }
  
  /**
   * Generate UBL 2.1 compliant XML for ANAF e-Factura
   */
  async generateXML(invoice: Invoice): Promise<string> {
    // Validate invoice first
    const validation = await validateInvoice(invoice)
    if (!validation.valid) {
      throw new Error(`Invoice validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }
    
    const xmlObject = {
      Invoice: {
        $: XML_NAMESPACES,
        
        // UBL Version
        'cbc:UBLVersionID': '2.1',
        'cbc:CustomizationID': 'urn:cen.eu:en16931:2017#compliant#urn:efactura.mfinante.ro:CIUS-RO:1.0.1',
        
        // Invoice identification
        'cbc:ID': formatInvoiceNumber(invoice.series, invoice.number),
        'cbc:IssueDate': format(invoice.date, 'yyyy-MM-dd'),
        'cbc:DueDate': format(invoice.dueDate, 'yyyy-MM-dd'),
        'cbc:InvoiceTypeCode': this.getInvoiceTypeCode(invoice.type),
        
        // Currency
        'cbc:DocumentCurrencyCode': invoice.currency,
        
        // Exchange rate if not RON
        ...(invoice.currency !== 'RON' && invoice.exchangeRate ? {
          'cac:TaxExchangeRate': {
            'cbc:SourceCurrencyCode': invoice.currency,
            'cbc:TargetCurrencyCode': 'RON',
            'cbc:CalculationRate': invoice.exchangeRate.toFixed(4)
          }
        } : {}),
        
        // Notes
        ...(invoice.notes ? { 'cbc:Note': invoice.notes } : {}),
        
        // Storno reference
        ...(invoice.type === 'STORNO' && invoice.stornoReference ? {
          'cac:BillingReference': {
            'cac:InvoiceDocumentReference': {
              'cbc:ID': invoice.stornoReference
            }
          }
        } : {}),
        
        // Supplier (AccountingSupplierParty)
        'cac:AccountingSupplierParty': this.buildParty(invoice.supplier),
        
        // Customer (AccountingCustomerParty)
        'cac:AccountingCustomerParty': this.buildParty(invoice.customer),
        
        // Payment means
        ...(invoice.paymentMethod ? {
          'cac:PaymentMeans': {
            'cbc:PaymentMeansCode': this.getPaymentMeansCode(invoice.paymentMethod),
            ...(invoice.paymentReference ? {
              'cbc:PaymentID': invoice.paymentReference
            } : {}),
            ...(invoice.supplier.bankAccounts && invoice.supplier.bankAccounts[0] ? {
              'cac:PayeeFinancialAccount': {
                'cbc:ID': invoice.supplier.bankAccounts[0].iban,
                'cbc:Name': invoice.supplier.bankAccounts[0].bankName
              }
            } : {})
          }
        } : {}),
        
        // Payment terms
        'cac:PaymentTerms': {
          'cbc:Note': `Termen de plată: ${Math.ceil((invoice.dueDate.getTime() - invoice.date.getTime()) / (1000 * 60 * 60 * 24))} zile`
        },
        
        // Tax total
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            $: { currencyID: invoice.currency },
            _: invoice.totalVat.toFixed(2)
          },
          ...this.buildTaxSubtotals(invoice)
        },
        
        // Document totals
        'cac:LegalMonetaryTotal': {
          'cbc:LineExtensionAmount': {
            $: { currencyID: invoice.currency },
            _: invoice.subtotal.toFixed(2)
          },
          'cbc:TaxExclusiveAmount': {
            $: { currencyID: invoice.currency },
            _: invoice.subtotal.toFixed(2)
          },
          'cbc:TaxInclusiveAmount': {
            $: { currencyID: invoice.currency },
            _: invoice.total.toFixed(2)
          },
          ...(invoice.totalDiscount ? {
            'cbc:AllowanceTotalAmount': {
              $: { currencyID: invoice.currency },
              _: invoice.totalDiscount.toFixed(2)
            }
          } : {}),
          'cbc:PayableAmount': {
            $: { currencyID: invoice.currency },
            _: invoice.total.toFixed(2)
          }
        },
        
        // Invoice lines
        ...this.buildInvoiceLines(invoice)
      }
    }
    
    return this.builder.buildObject(xmlObject)
  }
  
  private getInvoiceTypeCode(type: Invoice['type']): string {
    const typeCodes: Record<Invoice['type'], string> = {
      'FACTURA': '380', // Commercial invoice
      'PROFORMA': '325', // Proforma invoice
      'STORNO': '381', // Credit note
      'AVIZ': '230' // Delivery note
    }
    return typeCodes[type]
  }
  
  private getPaymentMeansCode(method: string): string {
    const methodCodes: Record<string, string> = {
      'CASH': '10', // In cash
      'BANK_TRANSFER': '30', // Credit transfer
      'CARD': '48', // Bank card
      'OP': '42' // Payment order
    }
    return methodCodes[method] || '1' // Unspecified
  }
  
  private buildParty(party: CompanyDetails | PersonDetails) {
    const isCompanyParty = isCompany(party)
    
    return {
      'cac:Party': {
        // Tax scheme for companies
        ...(isCompanyParty ? {
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': party.cif.replace(/^RO/i, ''),
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        } : {}),
        
        // Party name
        'cac:PartyName': {
          'cbc:Name': party.name
        },
        
        // Postal address
        'cac:PostalAddress': {
          'cbc:StreetName': `${party.address.street} ${party.address.number}`,
          'cbc:CityName': party.address.city,
          'cbc:PostalZone': party.address.postalCode,
          'cbc:CountrySubentity': party.address.county,
          'cac:Country': {
            'cbc:IdentificationCode': party.address.country || 'RO'
          }
        },
        
        // Party legal entity (for companies)
        ...(isCompanyParty ? {
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': party.name,
            'cbc:CompanyID': {
              $: { schemeID: 'RO:CIF' },
              _: party.cif
            },
            ...(party.regCom ? {
              'cbc:CompanyLegalForm': party.regCom
            } : {})
          }
        } : {
          // For individuals
          'cac:Person': {
            'cbc:FirstName': party.name.split(' ')[0],
            'cbc:FamilyName': party.name.split(' ').slice(1).join(' ')
          }
        }),
        
        // Contact
        'cac:Contact': {
          ...(party.phone ? { 'cbc:Telephone': party.phone } : {}),
          ...(party.email ? { 'cbc:ElectronicMail': party.email } : {})
        }
      }
    }
  }
  
  private buildTaxSubtotals(invoice: Invoice) {
    return invoice.vatBreakdown.map(breakdown => ({
      'cac:TaxSubtotal': {
        'cbc:TaxableAmount': {
          $: { currencyID: invoice.currency },
          _: breakdown.base.toFixed(2)
        },
        'cbc:TaxAmount': {
          $: { currencyID: invoice.currency },
          _: breakdown.amount.toFixed(2)
        },
        'cac:TaxCategory': {
          'cbc:ID': this.getTaxCategoryCode(breakdown.rate),
          'cbc:Percent': breakdown.rate.toFixed(2),
          'cac:TaxScheme': {
            'cbc:ID': 'VAT'
          }
        }
      }
    }))
  }
  
  private getTaxCategoryCode(rate: number): string {
    // Standard VAT category codes
    if (rate === 0) return 'Z' // Zero rated
    if (rate === 5) return 'AA' // Lower rate
    if (rate === 9) return 'AA' // Lower rate
    if (rate === 19) return 'S' // Standard rate
    return 'S' // Default to standard
  }
  
  private buildInvoiceLines(invoice: Invoice) {
    return invoice.items.map((item, index) => ({
      'cac:InvoiceLine': {
        'cbc:ID': (index + 1).toString(),
        
        // Quantity
        'cbc:InvoicedQuantity': {
          $: { unitCode: this.getUnitCode(item.unit) },
          _: item.quantity.toString()
        },
        
        // Line amount
        'cbc:LineExtensionAmount': {
          $: { currencyID: invoice.currency },
          _: item.subtotal.toFixed(2)
        },
        
        // Item description
        'cac:Item': {
          'cbc:Description': item.description || item.name,
          'cbc:Name': item.name,
          ...(item.code ? {
            'cac:SellersItemIdentification': {
              'cbc:ID': item.code
            }
          } : {}),
          
          // VAT category
          'cac:ClassifiedTaxCategory': {
            'cbc:ID': this.getTaxCategoryCode(item.vatRate),
            'cbc:Percent': item.vatRate.toFixed(2),
            'cac:TaxScheme': {
              'cbc:ID': 'VAT'
            }
          }
        },
        
        // Price
        'cac:Price': {
          'cbc:PriceAmount': {
            $: { currencyID: invoice.currency },
            _: item.unitPrice.toFixed(2)
          }
        },
        
        // Discount if applicable
        ...(item.discount ? {
          'cac:AllowanceCharge': {
            'cbc:ChargeIndicator': 'false',
            'cbc:AllowanceChargeReason': item.discount.reason || 'Discount',
            'cbc:Amount': {
              $: { currencyID: invoice.currency },
              _: (item.discount.amount || (item.subtotal * (item.discount.percentage || 0) / 100)).toFixed(2)
            }
          }
        } : {})
      }
    }))
  }
  
  private getUnitCode(unit: string): string {
    // UN/ECE Recommendation 20 unit codes
    const unitCodes: Record<string, string> = {
      'buc': 'H87', // Piece
      'mp': 'MTK', // Square metre
      'ml': 'MTR', // Metre
      'kg': 'KGM', // Kilogram
      'l': 'LTR', // Litre
      'ore': 'HUR', // Hour
      'zi': 'DAY', // Day
      'luna': 'MON', // Month
      'set': 'SET', // Set
      'pereche': 'PR' // Pair
    }
    return unitCodes[unit] || 'H87' // Default to piece
  }
}

// Helper function to create invoice from order
export function createInvoiceFromOrder(order: any, settings: any): Invoice {
  // Calculate VAT breakdown
  const vatBreakdown = new Map<number, { base: number, amount: number }>()
  
  const items: InvoiceItem[] = order.items.map((item: any) => {
    const vatRate = 19 // Default Romanian VAT
    const subtotal = item.quantity * item.price
    const vatAmount = subtotal * (vatRate / 100)
    
    // Update VAT breakdown
    const current = vatBreakdown.get(vatRate) || { base: 0, amount: 0 }
    current.base += subtotal
    current.amount += vatAmount
    vatBreakdown.set(vatRate, current)
    
    return {
      name: item.name,
      code: item.sku,
      description: item.description,
      quantity: item.quantity,
      unit: 'buc',
      unitPrice: item.price,
      vatRate,
      vatAmount,
      subtotal,
      total: subtotal + vatAmount
    }
  })
  
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalVat = items.reduce((sum, item) => sum + item.vatAmount, 0)
  
  return {
    series: settings.currentSeries || 'PMT',
    number: settings.lastInvoiceNumber + 1,
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    type: 'FACTURA',
    
    supplier: settings.defaultSupplier,
    customer: order.customer,
    
    items,
    
    currency: 'RON',
    subtotal,
    totalVat,
    total: subtotal + totalVat,
    
    vatBreakdown: Array.from(vatBreakdown.entries()).map(([rate, data]) => ({
      rate,
      base: data.base,
      amount: data.amount
    })),
    
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || 'UNPAID'
  }
}

// Export singleton instance
export const invoiceGenerator = new InvoiceXMLGenerator()