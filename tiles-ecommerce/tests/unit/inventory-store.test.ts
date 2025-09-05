import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInventoryStore } from '../../src/stores/inventory'
import { supabase } from '../../src/lib/supabase'
import type { Inventory, Warehouse, StockMovement, StockReservation } from '../../src/types'

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    },
    rpc: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn()
  }
}))

describe('Inventory Store', () => {
  const mockInventory: Inventory = {
    id: 'inv-1',
    product_id: 1,
    warehouse_id: 'wh-1',
    quantity_on_hand: 100,
    quantity_reserved: 10,
    quantity_available: 90,
    pieces_per_box: 10,
    sqm_per_box: 1.44,
    pieces_per_sqm: 6.94,
    version: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockWarehouse: Warehouse = {
    id: 'wh-1',
    code: 'WH001',
    name: 'Main Warehouse',
    type: 'warehouse',
    country: 'Romania',
    can_ship: true,
    can_receive: true,
    is_default: true,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    // Reset store state
    useInventoryStore.setState({
      inventories: [],
      movements: [],
      reservations: [],
      warehouses: [],
      alerts: [],
      loading: false,
      movementsLoading: false,
      reservationsLoading: false,
      error: null
    })

    // Reset all mocks
    vi.clearAllMocks()
  })

  describe('fetchInventory', () => {
    it('should fetch inventory successfully', async () => {
      const mockData = [mockInventory]
      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.select.mockResolvedValue({ data: mockData, error: null })

      const { result } = renderHook(() => useInventoryStore())

      await act(async () => {
        await result.current.fetchInventory(1, 'wh-1')
      })

      expect(result.current.inventories).toEqual(mockData)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const mockError = { message: 'Database error' }
      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.select.mockResolvedValue({ data: null, error: mockError })

      const { result } = renderHook(() => useInventoryStore())

      await act(async () => {
        await result.current.fetchInventory(1, 'wh-1')
      })

      expect(result.current.inventories).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Database error')
    })

    it('should filter by productId and warehouseId', async () => {
      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.select.mockResolvedValue({ data: [], error: null })

      const { result } = renderHook(() => useInventoryStore())

      await act(async () => {
        await result.current.fetchInventory(123, 'wh-456')
      })

      expect(fromMock.eq).toHaveBeenCalledWith('product_id', 123)
      expect(fromMock.eq).toHaveBeenCalledWith('warehouse_id', 'wh-456')
    })
  })

  describe('adjustStock', () => {
    it('should adjust stock successfully', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1' } as any },
        error: null
      })

      vi.mocked(supabase.rpc).mockResolvedValue({ error: null } as any)

      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.select.mockResolvedValue({ data: [mockInventory], error: null })

      const { result } = renderHook(() => useInventoryStore())

      await act(async () => {
        await result.current.adjustStock(1, 'wh-1', 50, 'Manual adjustment')
      })

      expect(supabase.rpc).toHaveBeenCalledWith('adjust_stock', {
        p_product_id: 1,
        p_warehouse_id: 'wh-1',
        p_adjustment: 50,
        p_reason: 'Manual adjustment',
        p_user_id: 'user-1'
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle adjustment errors', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1' } as any },
        error: null
      })

      vi.mocked(supabase.rpc).mockResolvedValue({ 
        error: { message: 'Insufficient stock' } 
      } as any)

      const { result } = renderHook(() => useInventoryStore())

      await act(async () => {
        await result.current.adjustStock(1, 'wh-1', -200, 'Sale')
      })

      expect(result.current.error).toBe('Insufficient stock')
    })
  })

  describe('createReservation', () => {
    it('should create reservation successfully', async () => {
      const mockReservation: StockReservation = {
        id: 'res-1',
        product_id: 1,
        warehouse_id: 'wh-1',
        quantity: 5,
        reserved_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-01T00:15:00Z',
        status: 'active'
      }

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-1' } as any },
        error: null
      })

      // Set default warehouse
      useInventoryStore.setState({ warehouses: [mockWarehouse] })

      vi.mocked(supabase.rpc).mockResolvedValue({ 
        data: 'res-1',
        error: null 
      } as any)

      const fromMock = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
      }
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.single.mockResolvedValue({ data: mockReservation, error: null })

      const { result } = renderHook(() => useInventoryStore())

      let reservation: StockReservation | null = null
      await act(async () => {
        reservation = await result.current.createReservation(1, 5)
      })

      expect(supabase.rpc).toHaveBeenCalledWith('reserve_stock', {
        p_product_id: 1,
        p_warehouse_id: 'wh-1',
        p_quantity: 5,
        p_user_id: 'user-1',
        p_duration_minutes: 15
      })

      expect(reservation).toEqual(mockReservation)
      expect(result.current.reservations).toContain(mockReservation)
    })

    it('should handle reservation failures', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null
      })

      const { result } = renderHook(() => useInventoryStore())

      let reservation: StockReservation | null = null
      await act(async () => {
        reservation = await result.current.createReservation(1, 5)
      })

      expect(reservation).toBeNull()
      expect(result.current.error).toBe('User not authenticated')
    })
  })

  describe('confirmReservation', () => {
    it('should confirm reservation successfully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({ 
        data: true,
        error: null 
      } as any)

      const activeReservation: StockReservation = {
        ...mockInventory,
        id: 'res-1',
        product_id: 1,
        warehouse_id: 'wh-1',
        quantity: 5,
        reserved_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-01T00:15:00Z',
        status: 'active'
      }

      useInventoryStore.setState({ reservations: [activeReservation] })

      const { result } = renderHook(() => useInventoryStore())

      let success = false
      await act(async () => {
        success = await result.current.confirmReservation('res-1')
      })

      expect(supabase.rpc).toHaveBeenCalledWith('confirm_stock_reservation', {
        p_reservation_id: 'res-1'
      })

      expect(success).toBe(true)
      expect(result.current.reservations[0].status).toBe('confirmed')
    })
  })

  describe('releaseReservation', () => {
    it('should release reservation successfully', async () => {
      const fromMock = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      }
      
      vi.mocked(supabase.from).mockReturnValue(fromMock as any)
      fromMock.eq.mockResolvedValue({ error: null })

      const activeReservation: StockReservation = {
        id: 'res-1',
        product_id: 1,
        warehouse_id: 'wh-1',
        quantity: 5,
        reserved_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-01T00:15:00Z',
        status: 'active'
      }

      useInventoryStore.setState({ reservations: [activeReservation] })

      const { result } = renderHook(() => useInventoryStore())

      let success = false
      await act(async () => {
        success = await result.current.releaseReservation('res-1')
      })

      expect(fromMock.update).toHaveBeenCalledWith({
        status: 'released',
        released_at: expect.any(String)
      })
      expect(fromMock.eq).toHaveBeenCalledWith('id', 'res-1')

      expect(success).toBe(true)
      expect(result.current.reservations).toHaveLength(0)
    })
  })

  describe('checkAvailability', () => {
    it('should check availability correctly', () => {
      useInventoryStore.setState({ 
        inventories: [
          { ...mockInventory, product_id: 1, quantity_available: 50 },
          { ...mockInventory, product_id: 1, warehouse_id: 'wh-2', quantity_available: 30 },
          { ...mockInventory, product_id: 2, quantity_available: 100 }
        ]
      })

      const { result } = renderHook(() => useInventoryStore())

      // Check total availability for product 1
      expect(result.current.checkAvailability(1, 70)).toBe(true)
      expect(result.current.checkAvailability(1, 90)).toBe(false)

      // Check availability in specific warehouse
      expect(result.current.checkAvailability(1, 40, 'wh-1')).toBe(true)
      expect(result.current.checkAvailability(1, 60, 'wh-1')).toBe(false)
    })
  })

  describe('getTotalStock', () => {
    it('should calculate total stock correctly', () => {
      useInventoryStore.setState({ 
        inventories: [
          { ...mockInventory, product_id: 1, quantity_on_hand: 50 },
          { ...mockInventory, product_id: 1, warehouse_id: 'wh-2', quantity_on_hand: 30 },
          { ...mockInventory, product_id: 2, quantity_on_hand: 100 }
        ]
      })

      const { result } = renderHook(() => useInventoryStore())

      expect(result.current.getTotalStock(1)).toBe(80)
      expect(result.current.getTotalStock(2)).toBe(100)
      expect(result.current.getTotalStock(3)).toBe(0)
    })
  })

  describe('real-time subscriptions', () => {
    it('should subscribe to inventory changes', () => {
      const channelMock = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis()
      }

      vi.mocked(supabase.channel).mockReturnValue(channelMock as any)

      const { result } = renderHook(() => useInventoryStore())

      const unsubscribe = result.current.subscribeToInventoryChanges(1)

      expect(supabase.channel).toHaveBeenCalledWith('inventory_1')
      expect(channelMock.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: 'product_id=eq.1'
        }),
        expect.any(Function)
      )

      // Test unsubscribe
      unsubscribe()
      expect(supabase.removeChannel).toHaveBeenCalledWith(channelMock)
    })
  })

  describe('getDefaultWarehouse', () => {
    it('should return default warehouse', () => {
      const warehouses = [
        { ...mockWarehouse, id: 'wh-1', is_default: false },
        { ...mockWarehouse, id: 'wh-2', is_default: true },
        { ...mockWarehouse, id: 'wh-3', is_default: false }
      ]

      useInventoryStore.setState({ warehouses })

      const { result } = renderHook(() => useInventoryStore())
      const defaultWarehouse = result.current.getDefaultWarehouse()

      expect(defaultWarehouse?.id).toBe('wh-2')
    })

    it('should return undefined if no default warehouse', () => {
      const warehouses = [
        { ...mockWarehouse, id: 'wh-1', is_default: false },
        { ...mockWarehouse, id: 'wh-2', is_default: false }
      ]

      useInventoryStore.setState({ warehouses })

      const { result } = renderHook(() => useInventoryStore())
      const defaultWarehouse = result.current.getDefaultWarehouse()

      expect(defaultWarehouse).toBeUndefined()
    })
  })
})