import { useEffect, useState, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Inventory } from '../types'

interface UseRealTimeStockOptions {
  productId: number
  warehouseId?: string
  autoSubscribe?: boolean
}

interface StockStatus {
  available: number
  reserved: number
  onHand: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved'
  canReserve: (quantity: number) => boolean
}

export function useRealTimeStock({
  productId,
  warehouseId,
  autoSubscribe = true
}: UseRealTimeStockOptions) {
  const [inventory, setInventory] = useState<Inventory | null>(null)
  const [stockStatus, setStockStatus] = useState<StockStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Calculate stock status
  const calculateStockStatus = useCallback((inv: Inventory): StockStatus => {
    const status: StockStatus = {
      available: inv.quantity_available,
      reserved: inv.quantity_reserved,
      onHand: inv.quantity_on_hand,
      status: 'in_stock',
      canReserve: (quantity: number) => inv.quantity_available >= quantity
    }

    // Determine status
    if (inv.quantity_available <= 0) {
      status.status = inv.quantity_on_hand > 0 ? 'reserved' : 'out_of_stock'
    } else if (inv.reorder_point && inv.quantity_available <= inv.reorder_point) {
      status.status = 'low_stock'
    }

    return status
  }, [])

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('inventory')
        .select('*')
        .eq('product_id', productId)

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId)
      } else {
        // Get from default warehouse if no warehouse specified
        const { data: defaultWarehouse } = await supabase
          .from('warehouses')
          .select('id')
          .eq('is_default', true)
          .single()

        if (defaultWarehouse) {
          query = query.eq('warehouse_id', defaultWarehouse.id)
        }
      }

      const { data, error: fetchError } = await query.single()

      if (fetchError) {
        // If no inventory record exists, create a default one
        if (fetchError.code === 'PGRST116') {
          const newInventory: Partial<Inventory> = {
            product_id: productId,
            warehouse_id: warehouseId || defaultWarehouse?.id,
            quantity_on_hand: 0,
            quantity_reserved: 0,
            quantity_available: 0,
            pieces_per_box: 1,
            sqm_per_box: 1,
            pieces_per_sqm: 1,
            version: 1
          }
          
          setInventory(newInventory as Inventory)
          setStockStatus(calculateStockStatus(newInventory as Inventory))
        } else {
          throw fetchError
        }
      } else if (data) {
        setInventory(data)
        setStockStatus(calculateStockStatus(data))
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching inventory:', err)
    } finally {
      setIsLoading(false)
    }
  }, [productId, warehouseId, calculateStockStatus])

  // Set up real-time subscription
  const setupSubscription = useCallback(async () => {
    // Clean up existing subscription
    if (channel) {
      await supabase.removeChannel(channel)
    }

    // Create filter for subscription
    let filter = `product_id=eq.${productId}`
    if (warehouseId) {
      filter += `,warehouse_id=eq.${warehouseId}`
    }

    // Subscribe to inventory changes
    const newChannel = supabase
      .channel(`inventory_${productId}_${warehouseId || 'default'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter
        },
        (payload) => {
          console.log('Inventory change detected:', payload)
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newInventory = payload.new as Inventory
            setInventory(newInventory)
            setStockStatus(calculateStockStatus(newInventory))
          } else if (payload.eventType === 'DELETE') {
            setInventory(null)
            setStockStatus(null)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_movements',
          filter: `product_id=eq.${productId}`
        },
        async () => {
          // Refetch inventory when a new movement is recorded
          console.log('Stock movement detected, refetching inventory')
          await fetchInventory()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    setChannel(newChannel)
  }, [productId, warehouseId, channel, fetchInventory, calculateStockStatus])

  // Reserve stock function
  const reserveStock = useCallback(async (quantity: number): Promise<boolean> => {
    if (!stockStatus?.canReserve(quantity)) {
      setError('Insufficient stock available')
      return false
    }

    try {
      const response = await fetch('/api/functions/v1/stock-reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          items: [{
            product_id: productId,
            quantity,
            warehouse_id: warehouseId || inventory?.warehouse_id
          }]
        })
      })

      const result = await response.json()

      if (result.success) {
        // Inventory will be updated via real-time subscription
        return true
      } else {
        setError(result.failures?.[0]?.reason || 'Failed to reserve stock')
        return false
      }
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }, [productId, warehouseId, inventory, stockStatus])

  // Check availability without reserving
  const checkAvailability = useCallback((quantity: number): boolean => {
    return stockStatus?.canReserve(quantity) || false
  }, [stockStatus])

  // Initialize
  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  // Set up subscription
  useEffect(() => {
    if (autoSubscribe) {
      setupSubscription()
    }

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [autoSubscribe, setupSubscription])

  return {
    inventory,
    stockStatus,
    isLoading,
    error,
    refetch: fetchInventory,
    reserveStock,
    checkAvailability,
    subscribe: setupSubscription,
    unsubscribe: () => {
      if (channel) {
        supabase.removeChannel(channel)
        setChannel(null)
      }
    }
  }
}