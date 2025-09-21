import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ReservationRequest {
  user_id: string
  session_id: string
  items: Array<{
    erp_sku: string
    quantity: number
    location_code?: string
  }>
  idempotency_key?: string
}

interface ERPReservationResponse {
  success: boolean
  reservation_id?: string
  available_quantity?: number
  error_code?: string
  error_message?: string
}

class ERPClient {
  private baseUrl: string
  private authToken: string
  private timeout: number

  constructor() {
    this.baseUrl = Deno.env.get('ERP_API_BASE_URL') || ''
    this.authToken = Deno.env.get('ERP_API_TOKEN') || ''
    this.timeout = 10000 // 10 seconds
  }

  async reserveStock(erp_sku: string, quantity: number, location_code: string = 'MAIN', idempotency_key: string): Promise<ERPReservationResponse> {
    const url = `${this.baseUrl}/inventory/reserve`
    
    const requestBody = {
      sku: erp_sku,
      quantity: quantity,
      location: location_code,
      idempotency_key: idempotency_key,
      ttl_minutes: 30
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ProMacTiles-WebApp/1.0'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          error_code: data.error_code || 'ERP_ERROR',
          error_message: data.message || `HTTP ${response.status}`
        }
      }
      
      return {
        success: true,
        reservation_id: data.reservation_id,
        available_quantity: data.available_quantity
      }
      
    } catch (error) {
      console.error('ERP reservation error:', error)
      return {
        success: false,
        error_code: 'NETWORK_ERROR',
        error_message: error.message
      }
    }
  }

  async getStockLevel(erp_sku: string, location_code: string = 'MAIN'): Promise<number> {
    const url = `${this.baseUrl}/inventory/stock/${erp_sku}?location=${location_code}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'User-Agent': 'ProMacTiles-WebApp/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      return data.available_quantity || 0
      
    } catch (error) {
      console.error('ERP stock check error:', error)
      return 0
    }
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const requestData: ReservationRequest = await req.json()
    
    // Validate request
    if (!requestData.user_id || !requestData.items || requestData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const erpClient = new ERPClient()
    const results = []
    
    // Process each item reservation
    for (const item of requestData.items) {
      const idempotencyKey = `${requestData.user_id}_${item.erp_sku}_${Date.now()}`
      const locationCode = item.location_code || 'MAIN'
      
      // Create local reservation record first
      const { data: reservation, error: dbError } = await supabase
        .from('erp_reservations')
        .insert({
          reservation_key: idempotencyKey,
          user_id: requestData.user_id,
          session_id: requestData.session_id,
          erp_sku: item.erp_sku,
          location_code: locationCode,
          quantity: item.quantity,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min TTL
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        results.push({
          erp_sku: item.erp_sku,
          success: false,
          error: 'Database error: ' + dbError.message
        })
        continue
      }

      // Call ERP to reserve stock
      const erpResult = await erpClient.reserveStock(
        item.erp_sku,
        item.quantity,
        locationCode,
        idempotencyKey
      )

      // Log the ERP call
      await supabase
        .from('erp_sync_log')
        .insert({
          operation_type: 'reserve_stock',
          endpoint: 'POST /inventory/reserve',
          request_payload: {
            sku: item.erp_sku,
            quantity: item.quantity,
            location: locationCode,
            idempotency_key: idempotencyKey
          },
          response_payload: erpResult,
          success: erpResult.success,
          erp_sku: item.erp_sku,
          reservation_id: reservation.id,
          duration_ms: 0, // Would need proper timing
          error_message: erpResult.error_message
        })

      if (erpResult.success) {
        // Update reservation status to 'reserved'
        await supabase
          .from('erp_reservations')
          .update({
            status: 'reserved',
            erp_reservation_id: erpResult.reservation_id,
            reserved_at: new Date().toISOString()
          })
          .eq('id', reservation.id)
        
        results.push({
          erp_sku: item.erp_sku,
          success: true,
          reservation_id: reservation.id,
          erp_reservation_id: erpResult.reservation_id,
          available_quantity: erpResult.available_quantity
        })
      } else {
        // Update reservation status to 'released' on failure
        await supabase
          .from('erp_reservations')
          .update({
            status: 'released'
          })
          .eq('id', reservation.id)
        
        results.push({
          erp_sku: item.erp_sku,
          success: false,
          error: erpResult.error_message,
          error_code: erpResult.error_code
        })
      }
    }

    const overallSuccess = results.every(r => r.success)
    
    return new Response(
      JSON.stringify({
        success: overallSuccess,
        reservations: results,
        timestamp: new Date().toISOString()
      }),
      { 
        status: overallSuccess ? 200 : 207, // 207 Multi-Status for partial success
        headers: { 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Reservation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})