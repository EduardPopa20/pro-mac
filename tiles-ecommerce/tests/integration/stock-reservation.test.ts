import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'test-anon-key'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

// Create clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

describe('Stock Reservation Integration Tests', () => {
  let testUserId: string
  let testProductId: number
  let testWarehouseId: string

  beforeAll(async () => {
    // Create test user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test-stock@example.com',
      password: 'Test123!@#',
      email_confirm: true
    })

    if (authError) throw authError
    testUserId = authData.user.id

    // Create test warehouse
    const { data: warehouse, error: warehouseError } = await supabaseAdmin
      .from('warehouses')
      .insert({
        code: 'TEST-WH',
        name: 'Test Warehouse',
        type: 'warehouse',
        country: 'Romania',
        can_ship: true,
        can_receive: true,
        is_default: true,
        is_active: true
      })
      .select()
      .single()

    if (warehouseError) throw warehouseError
    testWarehouseId = warehouse.id

    // Create test product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Test Product for Stock',
        slug: 'test-product-stock',
        price: 100,
        stock_status: 'available',
        is_featured: false
      })
      .select()
      .single()

    if (productError) throw productError
    testProductId = product.id

    // Create initial inventory
    const { error: inventoryError } = await supabaseAdmin
      .from('inventory')
      .insert({
        product_id: testProductId,
        warehouse_id: testWarehouseId,
        quantity_on_hand: 100,
        quantity_reserved: 0,
        pieces_per_box: 10,
        sqm_per_box: 1.44
      })

    if (inventoryError) throw inventoryError
  })

  afterAll(async () => {
    // Cleanup in reverse order
    await supabaseAdmin.from('stock_reservations').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('stock_movements').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('inventory').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('products').delete().eq('id', testProductId)
    await supabaseAdmin.from('warehouses').delete().eq('id', testWarehouseId)
    await supabaseAdmin.auth.admin.deleteUser(testUserId)
  })

  beforeEach(async () => {
    // Reset inventory to initial state
    await supabaseAdmin
      .from('inventory')
      .update({
        quantity_on_hand: 100,
        quantity_reserved: 0,
        version: 1
      })
      .eq('product_id', testProductId)
      .eq('warehouse_id', testWarehouseId)

    // Clear any existing reservations
    await supabaseAdmin
      .from('stock_reservations')
      .delete()
      .eq('product_id', testProductId)
  })

  describe('Basic Reservation Flow', () => {
    it('should create a reservation successfully', async () => {
      // Sign in as test user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      expect(signInError).toBeNull()
      expect(signInData.session).toBeDefined()

      // Create reservation via Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 10,
            warehouse_id: testWarehouseId
          }]
        })
      })

      expect(response.ok).toBe(true)
      const result = await response.json()
      
      expect(result.success).toBe(true)
      expect(result.reservations).toHaveLength(1)
      expect(result.reservations[0].quantity).toBe(10)
      expect(result.reservations[0].status).toBe('active')

      // Verify inventory was updated
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_reserved')
        .eq('product_id', testProductId)
        .single()

      expect(inventory?.quantity_reserved).toBe(10)
    })

    it('should fail when requesting more than available', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 150, // More than available (100)
            warehouse_id: testWarehouseId
          }]
        })
      })

      const result = await response.json()
      
      expect(result.success).toBe(false)
      expect(result.failures).toHaveLength(1)
      expect(result.failures[0].reason).toContain('Insufficient stock')
      expect(result.failures[0].available).toBe(100)
      expect(result.failures[0].requested).toBe(150)
    })

    it('should handle multiple items with partial success', async () => {
      // Create a second product with limited stock
      const { data: product2 } = await supabaseAdmin
        .from('products')
        .insert({
          name: 'Test Product 2',
          slug: 'test-product-2',
          price: 50,
          stock_status: 'available',
          is_featured: false
        })
        .select()
        .single()

      await supabaseAdmin
        .from('inventory')
        .insert({
          product_id: product2.id,
          warehouse_id: testWarehouseId,
          quantity_on_hand: 5,
          quantity_reserved: 0,
          pieces_per_box: 1,
          sqm_per_box: 1
        })

      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [
            {
              product_id: testProductId,
              quantity: 10,
              warehouse_id: testWarehouseId
            },
            {
              product_id: product2.id,
              quantity: 10, // More than available (5)
              warehouse_id: testWarehouseId
            }
          ]
        })
      })

      expect(response.status).toBe(207) // Partial success
      const result = await response.json()
      
      expect(result.success).toBe(false)
      expect(result.reservations).toHaveLength(1)
      expect(result.failures).toHaveLength(1)
      
      // First item should succeed
      expect(result.reservations[0].product_id).toBe(testProductId)
      expect(result.reservations[0].quantity).toBe(10)
      
      // Second item should fail
      expect(result.failures[0].product_id).toBe(product2.id)
      expect(result.failures[0].reason).toContain('Insufficient stock')

      // Cleanup
      await supabaseAdmin.from('inventory').delete().eq('product_id', product2.id)
      await supabaseAdmin.from('products').delete().eq('id', product2.id)
    })
  })

  describe('Reservation Expiry', () => {
    it('should automatically expire reservations', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      // Create reservation with 1 second duration for testing
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 10,
            warehouse_id: testWarehouseId
          }],
          duration_minutes: 0.017 // ~1 second
        })
      })

      const result = await response.json()
      expect(result.success).toBe(true)
      const reservationId = result.reservations[0].id

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Call release expired function
      const { error } = await supabaseAdmin.rpc('release_expired_reservations')
      expect(error).toBeNull()

      // Check reservation status
      const { data: reservation } = await supabaseAdmin
        .from('stock_reservations')
        .select('status')
        .eq('id', reservationId)
        .single()

      expect(reservation?.status).toBe('expired')

      // Check inventory was restored
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_reserved')
        .eq('product_id', testProductId)
        .single()

      expect(inventory?.quantity_reserved).toBe(0)
    })
  })

  describe('Confirmation Flow', () => {
    it('should confirm a reservation', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      // Create reservation
      const reserveResponse = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 10,
            warehouse_id: testWarehouseId
          }]
        })
      })

      const reserveResult = await reserveResponse.json()
      const reservationId = reserveResult.reservations[0].id

      // Confirm reservation
      const { data: confirmed, error } = await supabaseAdmin.rpc('confirm_stock_reservation', {
        p_reservation_id: reservationId
      })

      expect(error).toBeNull()
      expect(confirmed).toBe(true)

      // Check reservation status
      const { data: reservation } = await supabaseAdmin
        .from('stock_reservations')
        .select('status')
        .eq('id', reservationId)
        .single()

      expect(reservation?.status).toBe('confirmed')

      // Check inventory - quantity should be deducted from on_hand
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved')
        .eq('product_id', testProductId)
        .single()

      expect(inventory?.quantity_on_hand).toBe(90)
      expect(inventory?.quantity_reserved).toBe(0)
    })
  })

  describe('Stock Movement Tracking', () => {
    it('should create movement records for reservations', async () => {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'test-stock@example.com',
        password: 'Test123!@#'
      })

      await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${signInData.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 10,
            warehouse_id: testWarehouseId
          }]
        })
      })

      // Check movement was created
      const { data: movements } = await supabaseAdmin
        .from('stock_movements')
        .select('*')
        .eq('product_id', testProductId)
        .eq('movement_type', 'reservation')
        .order('created_at', { ascending: false })
        .limit(1)

      expect(movements).toHaveLength(1)
      expect(movements[0].quantity).toBe(-10) // Negative for reservation
      expect(movements[0].status).toBe('completed')
      expect(movements[0].reason).toContain('Stock reserved')
    })
  })
})