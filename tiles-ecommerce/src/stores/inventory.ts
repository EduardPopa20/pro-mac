import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { 
  Inventory, 
  StockMovement, 
  StockReservation, 
  Warehouse,
  StockAlert 
} from '../types'

interface InventoryState {
  // Data
  inventories: Inventory[]
  movements: StockMovement[]
  reservations: StockReservation[]
  warehouses: Warehouse[]
  alerts: StockAlert[]
  
  // Loading states
  loading: boolean
  movementsLoading: boolean
  reservationsLoading: boolean
  
  // Error handling
  error: string | null
  
  // Actions - Inventory
  fetchInventory: (productId?: number, warehouseId?: string) => Promise<void>
  fetchInventoryByWarehouse: (warehouseId: string) => Promise<void>
  updateInventory: (id: string, updates: Partial<Inventory>) => Promise<void>
  adjustStock: (productId: number, warehouseId: string, adjustment: number, reason: string) => Promise<void>
  
  // Actions - Movements
  fetchMovements: (productId?: number, limit?: number) => Promise<void>
  createMovement: (movement: Omit<StockMovement, 'id' | 'created_at'>) => Promise<void>
  
  // Actions - Reservations
  fetchReservations: (userId?: string, status?: string) => Promise<void>
  createReservation: (productId: number, quantity: number, warehouseId?: string) => Promise<StockReservation | null>
  confirmReservation: (reservationId: string) => Promise<boolean>
  releaseReservation: (reservationId: string) => Promise<boolean>
  
  // Actions - Warehouses
  fetchWarehouses: () => Promise<void>
  getDefaultWarehouse: () => Warehouse | undefined
  
  // Actions - Alerts
  fetchActiveAlerts: () => Promise<void>
  acknowledgeAlert: (alertId: string) => Promise<void>
  
  // Real-time subscriptions
  subscribeToInventoryChanges: (productId: number) => () => void
  subscribeToAlerts: () => () => void
  
  // Utility
  checkAvailability: (productId: number, quantity: number, warehouseId?: string) => boolean
  getTotalStock: (productId: number) => number
  clearError: () => void
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  inventories: [],
  movements: [],
  reservations: [],
  warehouses: [],
  alerts: [],
  loading: false,
  movementsLoading: false,
  reservationsLoading: false,
  error: null,

  // Fetch inventory
  fetchInventory: async (productId?: number, warehouseId?: string) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('inventory')
        .select(`
          *,
          warehouse:warehouses(*)
        `)
      
      if (productId) {
        query = query.eq('product_id', productId)
      }
      
      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ inventories: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // Fetch inventory by warehouse
  fetchInventoryByWarehouse: async (warehouseId: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(*),
          warehouse:warehouses(*)
        `)
        .eq('warehouse_id', warehouseId)
        .order('product_id')
      
      if (error) throw error
      
      set({ inventories: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  // Update inventory
  updateInventory: async (id: string, updates: Partial<Inventory>) => {
    set({ error: null })
    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      set(state => ({
        inventories: state.inventories.map(inv =>
          inv.id === id ? { ...inv, ...updates } : inv
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Adjust stock
  adjustStock: async (productId: number, warehouseId: string, adjustment: number, reason: string) => {
    set({ error: null })
    try {
      // Call stored procedure for atomic operation
      const { error } = await supabase.rpc('adjust_stock', {
        p_product_id: productId,
        p_warehouse_id: warehouseId,
        p_adjustment: adjustment,
        p_reason: reason,
        p_user_id: (await supabase.auth.getUser()).data.user?.id
      })
      
      if (error) throw error
      
      // Refresh inventory
      await get().fetchInventory(productId, warehouseId)
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Fetch movements
  fetchMovements: async (productId?: number, limit = 100) => {
    set({ movementsLoading: true, error: null })
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(*),
          from_warehouse:warehouses!from_warehouse_id(*),
          to_warehouse:warehouses!to_warehouse_id(*)
        `)
        .order('movement_date', { ascending: false })
        .limit(limit)
      
      if (productId) {
        query = query.eq('product_id', productId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ movements: data || [], movementsLoading: false })
    } catch (error: any) {
      set({ error: error.message, movementsLoading: false })
    }
  },

  // Create movement
  createMovement: async (movement: Omit<StockMovement, 'id' | 'created_at'>) => {
    set({ error: null })
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          ...movement,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Add to local state
      set(state => ({
        movements: [data, ...state.movements]
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Fetch reservations
  fetchReservations: async (userId?: string, status = 'active') => {
    set({ reservationsLoading: true, error: null })
    try {
      let query = supabase
        .from('stock_reservations')
        .select(`
          *,
          product:products(*),
          warehouse:warehouses(*)
        `)
        .eq('status', status)
        .order('reserved_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ reservations: data || [], reservationsLoading: false })
    } catch (error: any) {
      set({ error: error.message, reservationsLoading: false })
    }
  },

  // Create reservation
  createReservation: async (productId: number, quantity: number, warehouseId?: string) => {
    set({ error: null })
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('User not authenticated')
      
      // Get default warehouse if not specified
      const warehouse = warehouseId || get().getDefaultWarehouse()?.id
      if (!warehouse) throw new Error('No warehouse specified')
      
      // Call stored procedure
      const { data, error } = await supabase.rpc('reserve_stock', {
        p_product_id: productId,
        p_warehouse_id: warehouse,
        p_quantity: quantity,
        p_user_id: user.id,
        p_duration_minutes: 15
      })
      
      if (error) throw error
      
      // Fetch the created reservation
      const { data: reservation } = await supabase
        .from('stock_reservations')
        .select(`
          *,
          product:products(*),
          warehouse:warehouses(*)
        `)
        .eq('id', data)
        .single()
      
      // Add to local state
      if (reservation) {
        set(state => ({
          reservations: [reservation, ...state.reservations]
        }))
      }
      
      return reservation
    } catch (error: any) {
      set({ error: error.message })
      return null
    }
  },

  // Confirm reservation
  confirmReservation: async (reservationId: string) => {
    set({ error: null })
    try {
      const { data, error } = await supabase.rpc('confirm_stock_reservation', {
        p_reservation_id: reservationId
      })
      
      if (error) throw error
      
      // Update local state
      set(state => ({
        reservations: state.reservations.map(res =>
          res.id === reservationId ? { ...res, status: 'confirmed' } : res
        )
      }))
      
      return data
    } catch (error: any) {
      set({ error: error.message })
      return false
    }
  },

  // Release reservation
  releaseReservation: async (reservationId: string) => {
    set({ error: null })
    try {
      const { error } = await supabase
        .from('stock_reservations')
        .update({ 
          status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', reservationId)
      
      if (error) throw error
      
      // Update local state
      set(state => ({
        reservations: state.reservations.filter(res => res.id !== reservationId)
      }))
      
      return true
    } catch (error: any) {
      set({ error: error.message })
      return false
    }
  },

  // Fetch warehouses
  fetchWarehouses: async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      
      set({ warehouses: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Get default warehouse
  getDefaultWarehouse: () => {
    return get().warehouses.find(w => w.is_default)
  },

  // Fetch active alerts
  fetchActiveAlerts: async () => {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          *,
          product:products(*),
          warehouse:warehouses(*)
        `)
        .eq('is_active', true)
        .eq('is_acknowledged', false)
        .order('severity', { ascending: false })
      
      if (error) throw error
      
      set({ alerts: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user
      
      const { error } = await supabase
        .from('stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)
      
      if (error) throw error
      
      // Remove from local state
      set(state => ({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Subscribe to inventory changes
  subscribeToInventoryChanges: (productId: number) => {
    const channel = supabase
      .channel(`inventory_${productId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `product_id=eq.${productId}`
        },
        (payload) => {
          // Update local state
          set(state => ({
            inventories: state.inventories.map(inv =>
              inv.product_id === productId && inv.id === payload.new.id
                ? payload.new as Inventory
                : inv
            )
          }))
        }
      )
      .subscribe()
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
    }
  },

  // Subscribe to alerts
  subscribeToAlerts: () => {
    const channel = supabase
      .channel('stock_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stock_alerts',
          filter: 'is_active=eq.true'
        },
        async (payload) => {
          // Fetch complete alert with relations
          const { data } = await supabase
            .from('stock_alerts')
            .select(`
              *,
              product:products(*),
              warehouse:warehouses(*)
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (data) {
            set(state => ({
              alerts: [data, ...state.alerts]
            }))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  },

  // Check availability
  checkAvailability: (productId: number, quantity: number, warehouseId?: string) => {
    const inventories = get().inventories.filter(inv => 
      inv.product_id === productId &&
      (!warehouseId || inv.warehouse_id === warehouseId)
    )
    
    const totalAvailable = inventories.reduce((sum, inv) => sum + inv.quantity_available, 0)
    return totalAvailable >= quantity
  },

  // Get total stock
  getTotalStock: (productId: number) => {
    const inventories = get().inventories.filter(inv => inv.product_id === productId)
    return inventories.reduce((sum, inv) => sum + inv.quantity_on_hand, 0)
  },

  // Clear error
  clearError: () => set({ error: null })
}))