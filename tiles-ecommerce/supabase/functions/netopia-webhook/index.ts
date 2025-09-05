import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHash } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NetopiaIPN {
  orderId: string
  transactionId: string
  action: string // 'confirmed' | 'paid_pending' | 'paid' | 'canceled' | 'credit'
  errorCode: string
  errorMessage?: string
  amount: number
  currency: string
  timestamp: number
  signature: string
  mobilpayMessage?: string
  originalAmount?: number
  processedAmount?: number
}

// Map Netopia action codes to our payment status
const mapNetopiaAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    'confirmed': 'confirmed',
    'paid': 'confirmed',
    'paid_pending': 'processing',
    'canceled': 'cancelled',
    'credit': 'refunded',
    'failed': 'failed',
  }
  
  return actionMap[action.toLowerCase()] || 'failed'
}

// Verify IPN signature
const verifySignature = (data: Record<string, any>, receivedSignature: string, merchantKey: string): boolean => {
  try {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).filter(k => k !== 'signature').sort()
    
    // Build signature string
    let signatureString = ''
    sortedKeys.forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        signatureString += `${data[key]}`
      }
    })
    
    // Add merchant key
    signatureString += merchantKey
    
    // Generate SHA512 hash
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(signatureString)
    const hashBuffer = createHash('sha512', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return hashHex === receivedSignature.toLowerCase()
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const merchantKey = Deno.env.get('NETOPIA_MERCHANT_KEY') || 'test_key'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })
    
    // Parse IPN data
    const formData = await req.formData()
    const ipnData: Record<string, any> = {}
    
    for (const [key, value] of formData) {
      ipnData[key] = value.toString()
    }
    
    console.log('Received IPN data:', ipnData)
    
    // Extract key fields
    const orderId = ipnData.orderId || ipnData.order_id
    const transactionId = ipnData.transactionId || ipnData.mobilpay_transaction_id || ipnData.transaction_id
    const action = ipnData.action || ipnData.mobilpay_action
    const errorCode = ipnData.errorCode || ipnData.error_code || '0'
    const signature = ipnData.signature || ipnData.mobilpay_signature
    
    // Verify required fields
    if (!orderId || !transactionId || !action || !signature) {
      console.error('Missing required IPN fields')
      return new Response('Invalid IPN data', { 
        status: 400,
        headers: corsHeaders 
      })
    }
    
    // Verify signature
    if (!verifySignature(ipnData, signature, merchantKey)) {
      console.error('Invalid IPN signature')
      return new Response('Invalid signature', { 
        status: 403,
        headers: corsHeaders 
      })
    }
    
    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from('order_payments')
      .select('*, orders!inner(*)')
      .eq('transaction_id', transactionId)
      .single()
    
    if (fetchError || !payment) {
      console.error('Payment not found:', transactionId)
      return new Response('Payment not found', { 
        status: 404,
        headers: corsHeaders 
      })
    }
    
    // Map action to our payment status
    const newStatus = mapNetopiaAction(action)
    
    // Update payment record
    const { error: updateError } = await supabase
      .from('order_payments')
      .update({
        status: newStatus,
        gateway_response: ipnData,
        gateway_status: action,
        error_code: errorCode,
        error_message: ipnData.errorMessage || ipnData.mobilpay_message,
        signature_received: signature,
        processed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
    
    if (updateError) {
      console.error('Failed to update payment:', updateError)
      return new Response('Database error', { 
        status: 500,
        headers: corsHeaders 
      })
    }
    
    // Update order status based on payment action
    const orderStatusMap: Record<string, string> = {
      'confirmed': 'processing',
      'processing': 'pending_payment',
      'failed': 'pending_payment',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
    }
    
    const newOrderStatus = orderStatusMap[newStatus]
    
    if (newOrderStatus) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: newOrderStatus,
          paid_at: newStatus === 'confirmed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.order_id)
      
      if (orderError) {
        console.error('Failed to update order:', orderError)
      }
    }
    
    // Handle stock reservations based on payment status
    if (newStatus === 'confirmed') {
      // Confirm stock reservations
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('stock_reservation_id')
        .eq('order_id', payment.order_id)
        .not('stock_reservation_id', 'is', null)
      
      if (orderItems && orderItems.length > 0) {
        const reservationIds = orderItems.map(item => item.stock_reservation_id)
        
        await supabase
          .from('stock_reservations')
          .update({ 
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          })
          .in('id', reservationIds)
      }
      
      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: payment.orders.id,
            orderNumber: payment.orders.order_number,
            customerEmail: payment.orders.customer_email,
            customerName: payment.orders.customer_name,
            totalAmount: payment.orders.total_amount / 100, // Convert from bani to RON
          },
        })
        
        if (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }
      } catch (emailErr) {
        console.error('Email service error:', emailErr)
      }
      
    } else if (newStatus === 'failed' || newStatus === 'cancelled') {
      // Release stock reservations
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('stock_reservation_id')
        .eq('order_id', payment.order_id)
        .not('stock_reservation_id', 'is', null)
      
      if (orderItems && orderItems.length > 0) {
        const reservationIds = orderItems.map(item => item.stock_reservation_id)
        
        await supabase
          .from('stock_reservations')
          .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .in('id', reservationIds)
      }
    }
    
    // Log the IPN for audit
    await supabase
      .from('order_status_history')
      .insert({
        order_id: payment.order_id,
        old_status: payment.orders.status,
        new_status: newOrderStatus || payment.orders.status,
        reason: `Netopia IPN: ${action}`,
        notes: JSON.stringify({
          transactionId,
          action,
          errorCode,
          errorMessage: ipnData.errorMessage,
        }),
      })
    
    // Return success response to Netopia
    // Netopia expects specific format for success
    const successResponse = `<?xml version="1.0" encoding="utf-8"?>
<crc error_code="0" error_text="success">
  ${errorCode}|${action}|${transactionId}|${orderId}
</crc>`
    
    return new Response(successResponse, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
    
  } catch (error: any) {
    console.error('IPN processing error:', error)
    
    // Return error response to Netopia
    const errorResponse = `<?xml version="1.0" encoding="utf-8"?>
<crc error_code="1" error_text="${error.message || 'Internal server error'}">
  failed
</crc>`
    
    return new Response(errorResponse, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  }
})