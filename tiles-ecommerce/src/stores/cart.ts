import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { CartItem, Product, StockReservation } from '../types'

interface CartState {
  items: CartItem[]
  reservations: StockReservation[]
  loading: boolean
  error: string | null
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  syncReservations: () => Promise<void>
  releaseExpiredReservations: () => Promise<void>
  clearError: () => void
  mergeAnonymousCart: (user: any) => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      reservations: [],
      loading: false,
      error: null,

      addItem: async (product: Product, quantity = 1) => {
        set({ loading: true, error: null })
        
        try {
          const existingItem = get().items.find(item => item.product_id === product.id)
          const user = (await supabase.auth.getUser()).data.user
          
          if (existingItem) {
            // Update existing item and reservation
            const newQuantity = existingItem.quantity + quantity
            await get().updateQuantity(product.id, newQuantity)
          } else {
            // Create new cart item
            const newItem: CartItem = {
              id: Date.now().toString(),
              product_id: product.id,
              product,
              quantity,
              user_id: user?.id || '',
              created_at: new Date().toISOString(),
            }

            // Create reservations only for authenticated users
            // Anonymous users have local-only cart without DB reservations
            if (user) {
              try {
                const { data: defaultWarehouse } = await supabase
                  .from('warehouses')
                  .select('id')
                  .eq('is_default', true)
                  .single()

                if (defaultWarehouse) {
                  // Authenticated user - use the stored procedure
                  const { data, error } = await supabase.rpc('reserve_stock', {
                    p_product_id: product.id,
                    p_warehouse_id: defaultWarehouse.id,
                    p_quantity: quantity,
                    p_user_id: user.id,
                    p_duration_minutes: 30
                  })

                  if (error) {
                    console.warn('Could not create stock reservation:', error)
                  } else {
                    const { data: reservation } = await supabase
                      .from('stock_reservations')
                      .select('*')
                      .eq('id', data)
                      .single()

                    if (reservation) {
                      set(state => ({
                        reservations: [...state.reservations, reservation]
                      }))
                    }
                  }
                }
              } catch (reservationError) {
                console.warn('Reservation failed:', reservationError)
                // Continue without reservation - don't block cart functionality
              }
            }

            set(state => ({ 
              items: [...state.items, newItem],
              loading: false 
            }))
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      removeItem: async (productId: number) => {
        set({ loading: true, error: null })
        
        try {
          const user = (await supabase.auth.getUser()).data.user
          
          // Release reservations only for authenticated users
          if (user) {
            const productReservations = get().reservations.filter(r => r.product_id === productId)
            
            for (const reservation of productReservations) {
              try {
                await supabase
                  .from('stock_reservations')
                  .update({ 
                    status: 'released',
                    released_at: new Date().toISOString()
                  })
                  .eq('id', reservation.id)
                  .eq('status', 'active')
              } catch (err) {
                console.warn('Could not release reservation:', err)
              }
            }
          }

          set(state => ({
            items: state.items.filter(item => item.product_id !== productId),
            reservations: user ? state.reservations.filter(r => r.product_id !== productId) : [],
            loading: false
          }))
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      updateQuantity: async (productId: number, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(productId)
          return
        }

        set({ loading: true, error: null })
        
        try {
          const user = (await supabase.auth.getUser()).data.user
          const currentItem = get().items.find(item => item.product_id === productId)
          
          if (!currentItem) return
          
          if (user) {
            // Update reservation quantity
            const reservation = get().reservations.find(r => r.product_id === productId)
            
            if (reservation) {
              const quantityDiff = quantity - currentItem.quantity
              
              if (quantityDiff !== 0) {
                try {
                  // Release old reservation
                  await supabase
                    .from('stock_reservations')
                    .update({ 
                      status: 'released',
                      released_at: new Date().toISOString()
                    })
                    .eq('id', reservation.id)
                    .eq('status', 'active')

                  // Create new reservation with updated quantity
                  const { data: defaultWarehouse } = await supabase
                    .from('warehouses')
                    .select('id')
                    .eq('is_default', true)
                    .single()

                  if (defaultWarehouse) {
                    const { data } = await supabase.rpc('reserve_stock', {
                      p_product_id: productId,
                      p_warehouse_id: defaultWarehouse.id,
                      p_quantity: quantity,
                      p_user_id: user.id,
                      p_duration_minutes: 30
                    })

                    if (data) {
                      const { data: newReservation } = await supabase
                        .from('stock_reservations')
                        .select('*')
                        .eq('id', data)
                        .single()

                      if (newReservation) {
                        set(state => ({
                          reservations: state.reservations.map(r => 
                            r.product_id === productId ? newReservation : r
                          )
                        }))
                      }
                    }
                  }
                } catch (err) {
                  console.warn('Could not update reservation:', err)
                }
              }
            }
          }
          // For anonymous users, no reservations - cart is local only

          set(state => ({
            items: state.items.map(item =>
              item.product_id === productId
                ? { ...item, quantity }
                : item
            ),
            loading: false
          }))
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null })
        
        try {
          const user = (await supabase.auth.getUser()).data.user
          
          if (user) {
            // Release all reservations for authenticated users
            const reservations = get().reservations
            
            for (const reservation of reservations) {
              try {
                await supabase
                  .from('stock_reservations')
                  .update({ 
                    status: 'released',
                    released_at: new Date().toISOString()
                  })
                  .eq('id', reservation.id)
                  .eq('status', 'active')
              } catch (err) {
                console.warn('Could not release reservation:', err)
              }
            }
          }

          set({ items: [], reservations: [], loading: false })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      syncReservations: async () => {
        const user = (await supabase.auth.getUser()).data.user

        try {
          if (user) {
            // Only authenticated users have reservations
            const { data: reservations } = await supabase
              .from('stock_reservations')
              .select('*')
              .eq('status', 'active')
              .eq('user_id', user.id)

            set({ reservations: reservations || [] })
          } else {
            // Anonymous users have no reservations
            set({ reservations: [] })
          }
        } catch (error: any) {
          console.warn('Could not sync reservations:', error)
          set({ reservations: [] })
        }
      },

      releaseExpiredReservations: async () => {
        try {
          await supabase.rpc('release_expired_reservations')
          // Refresh reservations after cleanup
          await get().syncReservations()
        } catch (error: any) {
          console.warn('Could not release expired reservations:', error)
        }
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },

      clearError: () => set({ error: null }),

      // Merge anonymous cart with authenticated user cart on login
      mergeAnonymousCart: async (user: any) => {
        const anonymousItems = get().items
        
        if (anonymousItems.length === 0) {
          await get().syncReservations()
          return
        }

        try {
          // Update all anonymous items with the authenticated user's ID
          const updatedItems = anonymousItems.map(item => ({
            ...item,
            user_id: user.id
          }))

          // For each anonymous cart item, create reservations as authenticated user
          const { data: defaultWarehouse, error: warehouseError } = await supabase
            .from('warehouses')
            .select('id')
            .eq('is_default', true)
            .single()

          if (warehouseError) {
            throw warehouseError
          }

          const newReservations = []

          if (defaultWarehouse) {
            for (const item of anonymousItems) {
              try {
                const { data, error } = await supabase.rpc('reserve_stock', {
                  p_product_id: item.product_id,
                  p_warehouse_id: defaultWarehouse.id,
                  p_quantity: item.quantity,
                  p_user_id: user.id,
                  p_duration_minutes: 30
                })

                if (error) {
                  console.warn(`Could not create reservation for product ${item.product_id}:`, error)
                } else if (data) {
                  const { data: reservation } = await supabase
                    .from('stock_reservations')
                    .select('*')
                    .eq('id', data)
                    .single()

                  if (reservation) {
                    newReservations.push(reservation)
                  }
                }
              } catch (error) {
                console.warn(`Exception creating reservation for product ${item.product_id}:`, error)
              }
            }
          }

          // Update the cart state with authenticated user items and reservations
          set(state => ({
            items: updatedItems,
            reservations: newReservations
          }))
          
          // Trigger real-time update for admin dashboards
          if (newReservations.length > 0) {
            supabase.rpc('sync_reserved_quantities').catch(err => 
              console.warn('Could not sync quantities:', err)
            )
          }
        } catch (error) {
          console.warn('Error during cart merge:', error)
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
        // Don't persist reservations as they have server-side expiry
      })
    }
  )
)

// Export for global debugging (remove in production)
// if (typeof window !== 'undefined') {
//   ;(window as any).debugCart = useCartStore
//   ;(window as any).testAddItem = (productId = 999) => {
//     const testProduct = {
//       id: productId,
//       name: `Test Product ${productId}`,
//       price: 100,
//       price_unit: 'mp'
//     }
//     console.log('🧪 Testing addItem manually...')
//     return useCartStore.getState().addItem(testProduct, 1)
//   }
// }