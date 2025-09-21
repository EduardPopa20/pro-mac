import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReservationRequest {
  items: Array<{
    product_id: number
    quantity: number
    warehouse_id?: string
  }>
  order_id?: string
  cart_session_id?: string
  user_id?: string
  duration_minutes?: number // Default 15 minutes
}

interface ReservationResponse {
  success: boolean
  reservations?: any[]
  failures?: any[]
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    })

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const request: ReservationRequest = await req.json()
    
    // Set user_id if not provided
    if (!request.user_id) {
      request.user_id = user.id
    }

    const reservations: any[] = []
    const failures: any[] = []

    // Get default warehouse if needed
    let defaultWarehouseId: string | null = null
    if (request.items.some(item => !item.warehouse_id)) {
      const { data: defaultWarehouse } = await supabase
        .from('warehouses')
        .select('id')
        .eq('is_default', true)
        .single()
      
      defaultWarehouseId = defaultWarehouse?.id
    }

    // Process each item
    for (const item of request.items) {
      const warehouseId = item.warehouse_id || defaultWarehouseId
      
      if (!warehouseId) {
        failures.push({
          product_id: item.product_id,
          reason: 'No warehouse specified and no default warehouse found'
        })
        continue
      }

      // Begin transaction-like operation
      try {
        // Check current inventory with lock
        const { data: inventory, error: invError } = await supabase
          .from('inventory')
          .select('*')
          .eq('product_id', item.product_id)
          .eq('warehouse_id', warehouseId)
          .single()
        
        if (invError || !inventory) {
          // Create inventory record if it doesn't exist
          if (invError?.code === 'PGRST116') {
            const { error: createError } = await supabase
              .from('inventory')
              .insert({
                product_id: item.product_id,
                warehouse_id: warehouseId,
                quantity_on_hand: 0,
                quantity_reserved: 0,
                pieces_per_box: 1,
                sqm_per_box: 1
              })
            
            if (createError) {
              failures.push({
                product_id: item.product_id,
                reason: 'Failed to create inventory record',
                error: createError.message
              })
              continue
            }
            
            failures.push({
              product_id: item.product_id,
              reason: 'Product not in stock',
              available: 0,
              requested: item.quantity
            })
            continue
          }
          
          failures.push({
            product_id: item.product_id,
            reason: 'Product not found',
            error: invError?.message
          })
          continue
        }
        
        // Check if enough stock available
        if (inventory.quantity_available < item.quantity) {
          failures.push({
            product_id: item.product_id,
            reason: 'Insufficient stock',
            available: inventory.quantity_available,
            requested: item.quantity
          })
          continue
        }
        
        // Create reservation
        const expiresAt = new Date()
        expiresAt.setMinutes(
          expiresAt.getMinutes() + (request.duration_minutes || 15)
        )
        
        const { data: reservation, error: resError } = await supabase
          .from('stock_reservations')
          .insert({
            product_id: item.product_id,
            warehouse_id: warehouseId,
            quantity: item.quantity,
            order_id: request.order_id,
            cart_session_id: request.cart_session_id,
            user_id: request.user_id,
            expires_at: expiresAt.toISOString(),
            status: 'active'
          })
          .select()
          .single()
        
        if (resError) {
          failures.push({
            product_id: item.product_id,
            reason: 'Reservation failed',
            error: resError.message
          })
          continue
        }
        
        // Update inventory using optimistic locking
        const { data: updatedInventory, error: updateError } = await supabase
          .rpc('update_inventory_optimistic', {
            p_inventory_id: inventory.id,
            p_quantity_change: 0, // No change to on_hand
            p_expected_version: inventory.version
          })
        
        // Manually update reserved quantity since our function doesn't handle it
        const { error: reservedUpdateError } = await supabase
          .from('inventory')
          .update({
            quantity_reserved: inventory.quantity_reserved + item.quantity,
            version: inventory.version + 1
          })
          .eq('id', inventory.id)
          .eq('version', inventory.version)
        
        if (updateError || reservedUpdateError) {
          // Rollback reservation if inventory update failed
          await supabase
            .from('stock_reservations')
            .delete()
            .eq('id', reservation.id)
          
          failures.push({
            product_id: item.product_id,
            reason: 'Inventory update failed - possible concurrent modification',
            error: updateError?.message || reservedUpdateError?.message
          })
          continue
        }
        
        // Record movement
        await supabase.from('stock_movements').insert({
          movement_type: 'reservation',
          product_id: item.product_id,
          from_warehouse_id: warehouseId,
          quantity: -item.quantity, // Negative for reservation
          order_id: request.order_id,
          performed_by: request.user_id,
          reason: 'Stock reserved for order',
          status: 'completed'
        })
        
        reservations.push(reservation)
        
      } catch (error: any) {
        failures.push({
          product_id: item.product_id,
          reason: 'Unexpected error',
          error: error.message
        })
      }
    }
    
    // Prepare response
    const response: ReservationResponse = {
      success: failures.length === 0,
      reservations: reservations.length > 0 ? reservations : undefined,
      failures: failures.length > 0 ? failures : undefined
    }
    
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.success ? 200 : 207 // 207 for partial success
      }
    )
    
  } catch (error: any) {
    console.error('Stock reservation error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
