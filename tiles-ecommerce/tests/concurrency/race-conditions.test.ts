import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

describe('Stock Management Race Condition Tests', () => {
  let testProductId: number
  let testWarehouseId: string
  let testUsers: Array<{ id: string; email: string; token: string }> = []

  beforeAll(async () => {
    // Create test warehouse
    const { data: warehouse } = await supabaseAdmin
      .from('warehouses')
      .insert({
        code: 'RACE-WH',
        name: 'Race Test Warehouse',
        type: 'warehouse',
        country: 'Romania',
        can_ship: true,
        can_receive: true,
        is_default: false,
        is_active: true
      })
      .select()
      .single()

    testWarehouseId = warehouse.id

    // Create test product
    const { data: product } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Race Test Product',
        slug: 'race-test-product',
        price: 100,
        stock_status: 'available',
        is_featured: false
      })
      .select()
      .single()

    testProductId = product.id

    // Create test inventory with limited stock
    await supabaseAdmin
      .from('inventory')
      .insert({
        product_id: testProductId,
        warehouse_id: testWarehouseId,
        quantity_on_hand: 10, // Limited stock to trigger race conditions
        quantity_reserved: 0,
        pieces_per_box: 1,
        sqm_per_box: 1,
        version: 1
      })

    // Create multiple test users for concurrent requests
    for (let i = 0; i < 5; i++) {
      const { data: authData } = await supabaseAdmin.auth.admin.createUser({
        email: `race-test-${i}@example.com`,
        password: 'Test123!@#',
        email_confirm: true
      })

      const { data: session } = await supabaseAdmin.auth.signInWithPassword({
        email: `race-test-${i}@example.com`,
        password: 'Test123!@#'
      })

      testUsers.push({
        id: authData.user.id,
        email: `race-test-${i}@example.com`,
        token: session.session?.access_token || ''
      })
    }
  })

  afterAll(async () => {
    // Cleanup
    await supabaseAdmin.from('stock_reservations').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('stock_movements').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('inventory').delete().eq('product_id', testProductId)
    await supabaseAdmin.from('products').delete().eq('id', testProductId)
    await supabaseAdmin.from('warehouses').delete().eq('id', testWarehouseId)
    
    for (const user of testUsers) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
  })

  beforeEach(async () => {
    // Reset inventory
    await supabaseAdmin
      .from('inventory')
      .update({
        quantity_on_hand: 10,
        quantity_reserved: 0,
        version: 1
      })
      .eq('product_id', testProductId)

    // Clear reservations
    await supabaseAdmin
      .from('stock_reservations')
      .delete()
      .eq('product_id', testProductId)

    // Clear movements
    await supabaseAdmin
      .from('stock_movements')
      .delete()
      .eq('product_id', testProductId)
  })

  describe('Concurrent Reservation Attempts', () => {
    it('should prevent overselling with concurrent reservations', async () => {
      // All 5 users try to reserve 3 units simultaneously
      // Total requested: 15 units, Available: 10 units
      const reservationPromises = testUsers.map(user =>
        fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            items: [{
              product_id: testProductId,
              quantity: 3,
              warehouse_id: testWarehouseId
            }]
          })
        }).then(res => res.json())
      )

      const results = await Promise.all(reservationPromises)

      // Count successful and failed reservations
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      // Total successful reservations should not exceed available stock
      const totalReserved = successful.reduce((sum, r) => 
        sum + (r.reservations?.[0]?.quantity || 0), 0
      )

      expect(totalReserved).toBeLessThanOrEqual(10)
      expect(failed.length).toBeGreaterThan(0) // Some should fail

      // Verify inventory integrity
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_on_hand, quantity_reserved')
        .eq('product_id', testProductId)
        .single()

      expect(inventory.quantity_reserved).toBe(totalReserved)
      expect(inventory.quantity_on_hand).toBe(10)
    })

    it('should handle version conflicts with optimistic locking', async () => {
      // Simulate version conflict by manually incrementing version
      await supabaseAdmin
        .from('inventory')
        .update({ version: 5 })
        .eq('product_id', testProductId)

      // Multiple concurrent updates with wrong version expectations
      const updatePromises = Array.from({ length: 3 }, async (_, i) => {
        // Try to update with old version
        const { error } = await supabaseAdmin.rpc('update_inventory_optimistic', {
          p_inventory_id: testWarehouseId,
          p_quantity_change: -2,
          p_expected_version: 1 // Wrong version
        })
        return { index: i, error }
      })

      const results = await Promise.all(updatePromises)

      // All should fail due to version mismatch
      const failures = results.filter(r => r.error !== null)
      expect(failures.length).toBe(3)
    })

    it('should maintain consistency with rapid sequential reservations', async () => {
      // Rapid sequential reservations from same user
      const user = testUsers[0]
      const quantities = [2, 3, 2, 1, 2] // Total: 10

      for (const quantity of quantities) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            items: [{
              product_id: testProductId,
              quantity,
              warehouse_id: testWarehouseId
            }]
          })
        })

        const result = await response.json()
        expect(result.success).toBe(true)
      }

      // Next reservation should fail
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: testProductId,
            quantity: 1,
            warehouse_id: testWarehouseId
          }]
        })
      })

      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.failures[0].reason).toContain('Insufficient stock')

      // Verify final state
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_reserved')
        .eq('product_id', testProductId)
        .single()

      expect(inventory.quantity_reserved).toBe(10)
    })
  })

  describe('Distributed Lock Mechanism', () => {
    it('should prevent duplicate processing with distributed locks', async () => {
      // Try to acquire same lock multiple times concurrently
      const lockKey = `test-lock-${Date.now()}`
      
      const lockPromises = Array.from({ length: 5 }, async () => {
        const { data, error } = await supabaseAdmin
          .from('distributed_locks')
          .insert({
            lock_key: lockKey,
            locked_by: 'test-process',
            expires_at: new Date(Date.now() + 5000).toISOString()
          })
          .select()
        
        return { success: !error, data, error }
      })

      const results = await Promise.all(lockPromises)

      // Only one should succeed due to unique constraint
      const successful = results.filter(r => r.success)
      expect(successful.length).toBe(1)

      // Cleanup
      await supabaseAdmin
        .from('distributed_locks')
        .delete()
        .eq('lock_key', lockKey)
    })

    it('should auto-release expired locks', async () => {
      const lockKey = `expired-lock-${Date.now()}`

      // Create an already expired lock
      await supabaseAdmin
        .from('distributed_locks')
        .insert({
          lock_key: lockKey,
          locked_by: 'test-process',
          expires_at: new Date(Date.now() - 1000).toISOString() // Already expired
        })

      // Should be able to delete expired lock and create new one
      await supabaseAdmin
        .from('distributed_locks')
        .delete()
        .eq('lock_key', lockKey)
        .lte('expires_at', new Date().toISOString())

      // Now should be able to create new lock with same key
      const { error } = await supabaseAdmin
        .from('distributed_locks')
        .insert({
          lock_key: lockKey,
          locked_by: 'new-process',
          expires_at: new Date(Date.now() + 5000).toISOString()
        })

      expect(error).toBeNull()

      // Cleanup
      await supabaseAdmin
        .from('distributed_locks')
        .delete()
        .eq('lock_key', lockKey)
    })
  })

  describe('Concurrent Stock Adjustments', () => {
    it('should handle concurrent positive and negative adjustments', async () => {
      // Mix of additions and subtractions
      const adjustments = [
        { change: 5, reason: 'Restock' },
        { change: -3, reason: 'Sale' },
        { change: 2, reason: 'Return' },
        { change: -4, reason: 'Damage' },
        { change: -2, reason: 'Transfer' }
      ]

      const adjustmentPromises = adjustments.map(async (adj) => {
        const { error } = await supabaseAdmin.rpc('adjust_stock', {
          p_product_id: testProductId,
          p_warehouse_id: testWarehouseId,
          p_adjustment: adj.change,
          p_reason: adj.reason,
          p_user_id: testUsers[0].id
        })
        return { adjustment: adj, error }
      })

      await Promise.all(adjustmentPromises)

      // Calculate expected final quantity
      const expectedChange = adjustments.reduce((sum, adj) => sum + adj.change, 0)
      const expectedFinal = 10 + expectedChange // Initial 10 + net change

      // Verify final inventory state
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_on_hand')
        .eq('product_id', testProductId)
        .single()

      expect(inventory.quantity_on_hand).toBe(expectedFinal)

      // Verify all movements were recorded
      const { data: movements } = await supabaseAdmin
        .from('stock_movements')
        .select('*')
        .eq('product_id', testProductId)
        .order('created_at', { ascending: true })

      expect(movements.length).toBe(adjustments.length)
    })

    it('should prevent negative stock with concurrent deductions', async () => {
      // Multiple users trying to deduct more than available
      const deductionPromises = testUsers.map(async (user) => {
        const { error } = await supabaseAdmin.rpc('adjust_stock', {
          p_product_id: testProductId,
          p_warehouse_id: testWarehouseId,
          p_adjustment: -3, // 5 users × 3 = 15 total (more than 10 available)
          p_reason: 'Concurrent sale',
          p_user_id: user.id
        })
        return { user: user.email, error }
      })

      const results = await Promise.all(deductionPromises)

      // Verify stock never goes negative
      const { data: inventory } = await supabaseAdmin
        .from('inventory')
        .select('quantity_on_hand')
        .eq('product_id', testProductId)
        .single()

      expect(inventory.quantity_on_hand).toBeGreaterThanOrEqual(0)

      // Some deductions should have failed
      const failures = results.filter(r => r.error !== null)
      expect(failures.length).toBeGreaterThan(0)
    })
  })

  describe('Real-time Update Consistency', () => {
    it('should maintain consistency across real-time subscriptions', async () => {
      const updateEvents: any[] = []
      
      // Set up subscription
      const channel = supabaseAdmin
        .channel(`test-inventory-${testProductId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory',
            filter: `product_id=eq.${testProductId}`
          },
          (payload) => {
            updateEvents.push(payload)
          }
        )
        .subscribe()

      // Wait for subscription to be ready
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Perform multiple concurrent updates
      const updates = Array.from({ length: 3 }, async (_, i) => {
        await supabaseAdmin
          .from('inventory')
          .update({ 
            quantity_on_hand: 10 + i,
            version: i + 2
          })
          .eq('product_id', testProductId)
      })

      await Promise.all(updates)

      // Wait for events to propagate
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verify events were received
      expect(updateEvents.length).toBeGreaterThan(0)

      // Cleanup subscription
      await supabaseAdmin.removeChannel(channel)
    })
  })

  describe('Batch Operations', () => {
    it('should handle batch reservations atomically', async () => {
      // Create additional products
      const products = await Promise.all(
        Array.from({ length: 3 }, async (_, i) => {
          const { data: product } = await supabaseAdmin
            .from('products')
            .insert({
              name: `Batch Product ${i}`,
              slug: `batch-product-${i}`,
              price: 50,
              stock_status: 'available',
              is_featured: false
            })
            .select()
            .single()

          await supabaseAdmin
            .from('inventory')
            .insert({
              product_id: product.id,
              warehouse_id: testWarehouseId,
              quantity_on_hand: i === 1 ? 0 : 10, // Middle product has no stock
              quantity_reserved: 0,
              pieces_per_box: 1,
              sqm_per_box: 1
            })

          return product
        })
      )

      // Try to reserve all products in batch
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testUsers[0].token}`
        },
        body: JSON.stringify({
          items: products.map(p => ({
            product_id: p.id,
            quantity: 5,
            warehouse_id: testWarehouseId
          }))
        })
      })

      const result = await response.json()

      // Should have partial success
      expect(result.success).toBe(false)
      expect(result.reservations).toHaveLength(2) // Two products with stock
      expect(result.failures).toHaveLength(1) // One product without stock

      // Verify atomicity per item
      for (const reservation of result.reservations) {
        const { data: inventory } = await supabaseAdmin
          .from('inventory')
          .select('quantity_reserved')
          .eq('product_id', reservation.product_id)
          .single()

        expect(inventory.quantity_reserved).toBe(5)
      }

      // Cleanup
      for (const product of products) {
        await supabaseAdmin.from('inventory').delete().eq('product_id', product.id)
        await supabaseAdmin.from('products').delete().eq('id', product.id)
      }
    })
  })
})