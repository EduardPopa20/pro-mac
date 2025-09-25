/**
 * Netopia Payment Service
 * Handles payment processing with Netopia Gateway
 */

import { supabase } from '../lib/supabase'
import { 
  netopiaConfig, 
  formatAmountForNetopia, 
  parseAmountFromNetopia,
  generateOrderReference,
  mapNetopiaStatus,
  NETOPIA_ERROR_CODES,
  validateMerchantConfig
} from '../config/netopia'
import CryptoJS from 'crypto-js'

// Types
export interface PaymentRequest {
  orderId: string
  amount: number // In RON
  currency?: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  billingAddress: {
    street: string
    city: string
    county: string
    postalCode: string
    country: string
  }
  description?: string
  returnUrl?: string
  confirmUrl?: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
  errorCode?: string
}

export interface PaymentStatus {
  transactionId: string
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'cancelled' | 'refunded'
  amount: number
  currency: string
  message?: string
  errorCode?: string
  timestamp: Date
}

export interface IpnData {
  orderId: string
  transactionId: string
  status: string
  amount: number
  currency: string
  signature: string
  timestamp: string
  errorCode?: string
  errorMessage?: string
}

/**
 * Netopia Payment Service Class
 */
class NetopiaService {
  private config = netopiaConfig
  
  constructor() {
    if (!validateMerchantConfig()) {
      console.error('NetopiaService: Invalid configuration')
    }
  }
  
  /**
   * Generate payment signature
   */
  private generateSignature(data: Record<string, any>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort()
    
    // Build signature string
    let signatureString = ''
    sortedKeys.forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        signatureString += `${data[key]}`
      }
    })
    
    // Add merchant key
    signatureString += this.config.merchantKey
    
    // Generate SHA512 hash
    return CryptoJS.SHA512(signatureString).toString()
  }
  
  /**
   * Verify IPN signature from Netopia
   */
  private verifySignature(data: IpnData): boolean {
    const { signature, ...dataWithoutSignature } = data
    const expectedSignature = this.generateSignature(dataWithoutSignature)
    return signature === expectedSignature
  }
  
  /**
   * Build payment form data
   */
  private buildPaymentData(request: PaymentRequest): Record<string, any> {
    const orderRef = generateOrderReference(request.orderId)
    
    return {
      // Merchant info
      account: this.config.merchantId,
      
      // Order details
      order_id: orderRef,
      order_desc: request.description || `Comandă Pro-Mac #${request.orderId}`,
      amount: formatAmountForNetopia(request.amount).toString(),
      currency: request.currency || this.config.currency,
      
      // Customer info
      billing_email: request.customerEmail,
      billing_first_name: request.customerName.split(' ')[0] || '',
      billing_last_name: request.customerName.split(' ').slice(1).join(' ') || '',
      billing_phone: request.customerPhone || '',
      billing_address: request.billingAddress.street,
      billing_city: request.billingAddress.city,
      billing_state: request.billingAddress.county,
      billing_zip: request.billingAddress.postalCode,
      billing_country: request.billingAddress.country || 'Romania',
      
      // URLs
      confirm_url: request.confirmUrl || this.config.confirmUrl,
      return_url: request.returnUrl || this.config.returnUrl,
      
      // Additional params
      timestamp: Math.floor(Date.now() / 1000).toString(),
      language: this.config.language,
    }
  }
  
  /**
   * Initiate payment
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate configuration
      if (!validateMerchantConfig()) {
        throw new Error('Invalid merchant configuration')
      }
      
      // In development mode, simulate payment process
      if (this.config.isProduction === false) {
        console.log('🧪 DEVELOPMENT MODE: Simulating payment process')
        
        // Create a mock payment record
        const mockTransactionId = `TEST-${Date.now()}`
        
        // Create payment record in database
        const { data: paymentRecord, error: dbError } = await supabase
          .from('order_payments')
          .insert({
            order_id: request.orderId,
            transaction_id: mockTransactionId,
            payment_method: 'card',
            status: 'pending',
            amount: formatAmountForNetopia(request.amount),
            gateway_response: {
              mode: 'development_simulation',
              amount: request.amount,
              currency: 'RON',
              customer: request.customerName,
            },
            signature_sent: 'development_test_signature',
          })
          .select()
          .single()
        
        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`)
        }
        
        // Return a mock payment URL that simulates success
        const mockPaymentUrl = `${window.location.origin}/payment-simulator?transaction=${mockTransactionId}&amount=${request.amount}&status=success`
        
        return {
          success: true,
          paymentUrl: mockPaymentUrl,
          transactionId: mockTransactionId,
        }
      }
      
      // Build payment data
      const paymentData = this.buildPaymentData(request)
      
      // Generate signature
      paymentData.signature = this.generateSignature(paymentData)
      
      // Create payment record in database
      const { data: paymentRecord, error: dbError } = await supabase
        .from('order_payments')
        .insert({
          order_id: request.orderId,
          transaction_id: paymentData.order_id,
          payment_method: 'card',
          status: 'pending',
          amount: formatAmountForNetopia(request.amount),
          gateway_response: paymentData,
          signature_sent: paymentData.signature,
          ipn_url: paymentData.confirm_url,
          return_url: paymentData.return_url,
        })
        .select()
        .single()
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }
      
      // Build payment URL with form data
      const paymentUrl = this.buildPaymentUrl(paymentData)
      
      return {
        success: true,
        paymentUrl,
        transactionId: paymentData.order_id,
      }
    } catch (error: any) {
      console.error('NetopiaService: Payment initiation failed', error)
      
      return {
        success: false,
        error: error.message || 'Payment initiation failed',
        errorCode: 'INIT_ERROR',
      }
    }
  }
  
  /**
   * Build payment URL for redirect
   */
  private buildPaymentUrl(data: Record<string, any>): string {
    // For sandbox/development, we'll create a form that auto-submits
    // In production, this would be a direct POST to Netopia
    const params = new URLSearchParams(data)
    return `${this.config.paymentUrl}/order/card?${params.toString()}`
  }
  
  /**
   * Process IPN callback from Netopia
   */
  async processIpn(ipnData: IpnData): Promise<{ success: boolean; message: string }> {
    try {
      // Verify signature
      if (!this.verifySignature(ipnData)) {
        throw new Error('Invalid IPN signature')
      }
      
      // Get payment record
      const { data: payment, error: fetchError } = await supabase
        .from('order_payments')
        .select('*, orders!inner(*)')
        .eq('transaction_id', ipnData.transactionId)
        .single()
      
      if (fetchError || !payment) {
        throw new Error('Payment not found')
      }
      
      // Map Netopia status to our status
      const newStatus = mapNetopiaStatus(ipnData.status)
      
      // Update payment record
      const { error: updateError } = await supabase
        .from('order_payments')
        .update({
          status: newStatus,
          gateway_response: ipnData,
          gateway_status: ipnData.status,
          error_code: ipnData.errorCode,
          error_message: ipnData.errorMessage,
          signature_received: ipnData.signature,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payment.id)
      
      if (updateError) {
        throw new Error(`Failed to update payment: ${updateError.message}`)
      }
      
      // Update order status based on payment status
      await this.updateOrderStatus(payment.order_id, newStatus)
      
      // Handle stock reservation based on status
      await this.handleStockReservation(payment.order_id, newStatus)
      
      // Send confirmation email if payment confirmed
      if (newStatus === 'confirmed') {
        await this.sendPaymentConfirmation(payment.orders)
      }
      
      return {
        success: true,
        message: 'IPN processed successfully',
      }
    } catch (error: any) {
      console.error('NetopiaService: IPN processing failed', error)
      
      return {
        success: false,
        message: error.message || 'IPN processing failed',
      }
    }
  }
  
  /**
   * Update order status based on payment status
   */
  private async updateOrderStatus(orderId: string, paymentStatus: string): Promise<void> {
    const orderStatusMap: Record<string, string> = {
      'confirmed': 'processing',
      'failed': 'pending_payment',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
    }
    
    const newOrderStatus = orderStatusMap[paymentStatus]
    
    if (newOrderStatus) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newOrderStatus,
          paid_at: paymentStatus === 'confirmed' ? new Date().toISOString() : null,
        })
        .eq('id', orderId)
      
      if (error) {
        console.error('Failed to update order status:', error)
      }
    }
  }
  
  /**
   * Handle stock reservation based on payment status
   */
  private async handleStockReservation(orderId: string, paymentStatus: string): Promise<void> {
    // Get order items with reservations
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('stock_reservation_id')
      .eq('order_id', orderId)
      .not('stock_reservation_id', 'is', null)
    
    if (error || !orderItems) {
      console.error('Failed to fetch order items:', error)
      return
    }
    
    const reservationIds = orderItems.map(item => item.stock_reservation_id)
    
    if (reservationIds.length === 0) return
    
    // Update reservations based on payment status
    if (paymentStatus === 'confirmed') {
      // Confirm reservations
      await supabase
        .from('stock_reservations')
        .update({ status: 'confirmed' })
        .in('id', reservationIds)
    } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
      // Release reservations
      await supabase
        .from('stock_reservations')
        .update({ status: 'cancelled' })
        .in('id', reservationIds)
    }
  }
  
  /**
   * Send payment confirmation email
   */
  private async sendPaymentConfirmation(order: any): Promise<void> {
    try {
      // Call edge function to send email
      const { error } = await supabase.functions.invoke('send-order-confirmation', {
        body: {
          orderId: order.id,
          orderNumber: order.order_number,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          totalAmount: parseAmountFromNetopia(order.total_amount),
        },
      })
      
      if (error) {
        console.error('Failed to send confirmation email:', error)
      }
    } catch (error) {
      console.error('Email service error:', error)
    }
  }
  
  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    try {
      const { data, error } = await supabase
        .from('order_payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .single()
      
      if (error || !data) {
        return null
      }
      
      return {
        transactionId: data.transaction_id,
        status: data.status,
        amount: parseAmountFromNetopia(data.amount),
        currency: 'RON',
        message: NETOPIA_ERROR_CODES[data.error_code || ''] || data.error_message,
        errorCode: data.error_code,
        timestamp: new Date(data.updated_at),
      }
    } catch (error) {
      console.error('NetopiaService: Failed to check payment status', error)
      return null
    }
  }
  
  /**
   * Refund payment
   */
  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      // Get payment details
      const { data: payment, error: fetchError } = await supabase
        .from('order_payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('status', 'confirmed')
        .single()
      
      if (fetchError || !payment) {
        throw new Error('Payment not found or not eligible for refund')
      }
      
      const refundAmount = amount ? formatAmountForNetopia(amount) : payment.amount
      
      // Validate refund amount
      if (refundAmount > payment.amount - payment.refunded_amount) {
        throw new Error('Refund amount exceeds available amount')
      }
      
      // Build refund request
      const refundData = {
        account: this.config.merchantId,
        order_id: transactionId,
        amount: refundAmount.toString(),
        currency: this.config.currency,
        timestamp: Math.floor(Date.now() / 1000).toString(),
      }
      
      refundData['signature'] = this.generateSignature(refundData)
      
      // In sandbox, simulate refund
      // In production, this would be an API call to Netopia
      
      // Update payment record
      const { error: updateError } = await supabase
        .from('order_payments')
        .update({
          status: refundAmount === payment.amount ? 'refunded' : 'partially_refunded',
          refunded_amount: payment.refunded_amount + refundAmount,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', payment.id)
      
      if (updateError) {
        throw new Error('Failed to update payment record')
      }
      
      // Update order status
      await this.updateOrderStatus(payment.order_id, 'refunded')
      
      return {
        success: true,
        transactionId,
      }
    } catch (error: any) {
      console.error('NetopiaService: Refund failed', error)
      
      return {
        success: false,
        error: error.message || 'Refund failed',
        errorCode: 'REFUND_ERROR',
      }
    }
  }
  
  /**
   * Generate payment form HTML for testing
   */
  generatePaymentFormHtml(paymentData: Record<string, any>): string {
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n')
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirectare către plată...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Redirectare către plată</h2>
          <div class="spinner"></div>
          <p>Vă rugăm așteptați...</p>
        </div>
        <form id="paymentForm" action="${this.config.paymentUrl}/order/card" method="POST">
          ${formFields}
        </form>
        <script>
          setTimeout(() => {
            document.getElementById('paymentForm').submit();
          }, 1500);
        </script>
      </body>
      </html>
    `
  }
}

// Export singleton instance
export const netopiaService = new NetopiaService()

// Export types for use in components
export type { PaymentRequest, PaymentResponse, PaymentStatus, IpnData }