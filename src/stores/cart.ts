import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { CartItem, Product, StockReservation } from '../types'

interface CartState {
  items: CartItem[]
  reservations: StockReservation[]
  sessionId: string | null
  loading: boolean
  error: string | null
  unavailableItems: Array<{ productId: number; productName: string; reason: string }>
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: (saveAsAbandoned?: boolean) => Promise<void>
  getTotalItems: () => number
  getTotalPrice: () => number
  syncReservations: () => Promise<void>
  releaseExpiredReservations: () => Promise<void>
  validateCartAvailability: () => Promise<void>
  clearError: () => void
  clearUnavailableNotifications: () => void
  mergeAnonymousCart: (user: any) => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      reservations: [],
      sessionId: null,
      loading: false,
      error: null,
      unavailableItems: [],

      addItem: async (product: Product, quantity = 1) => {
        set({ loading: true, error: null })
        
        try {
          const existingItem = get().items.find(item => item.product_id === product.id)
          const user = (await supabase.auth.getUser()).data.user
          
          // Get or create session ID
          let sessionId = get().sessionId
          if (!sessionId) {
            sessionId = crypto.randomUUID()
            set({ sessionId })
          }
          
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
                  // Use the stored procedure to reserve stock
                  const { data, error } = await supabase.rpc('reserve_stock', {
                    p_product_id: product.id,
                    p_warehouse_id: defaultWarehouse.id,
                    p_quantity: quantity,
                    p_user_id: user.id,
                    p_duration_minutes: 30
                  })

                  if (error) {
                    console.warn('Could not create stock reservation:', error)
                  } else if (data) {
                    // Update the reservation with session ID
                    const { error: updateError } = await supabase
                      .from('stock_reservations')
                      .update({ cart_session_id: sessionId })
                      .eq('id', data)
                    
                    if (updateError) {
                      console.warn('Could not update session ID:', updateError)
                    }
                    
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

      clearCart: async (saveAsAbandoned = false) => {
        set({ loading: true, error: null })
        
        try {
          const user = (await supabase.auth.getUser()).data.user
          const currentItems = get().items
          
          // Save to abandoned carts if user is logging out and has items
          if (saveAsAbandoned && user && currentItems.length > 0) {
            try {
              const cartTotal = get().getTotalPrice()
              const itemsCount = get().getTotalItems()
              
              // Get current session ID and reservations
              const sessionId = get().sessionId || crypto.randomUUID()
              const currentReservations = get().reservations
              
              // Prepare cart items data for JSONB storage with reservation info
              const cartItemsData = currentItems.map(item => {
                const reservation = currentReservations.find(r => r.product_id === item.product_id)
                return {
                  product_id: item.product_id,
                  product_name: item.product.name,
                  product_image: item.product.image_url,
                  quantity: item.quantity,
                  price: item.product.price,
                  price_unit: item.product.price_unit,
                  subtotal: item.product.price * item.quantity,
                  reservation_id: reservation?.id || null,
                  reserved_quantity: reservation?.quantity || 0
                }
              })
              
              // Check if there's already an abandoned cart for this user in the last 24 hours
              const { data: existingCart } = await supabase
                .from('abandoned_carts')
                .select('id')
                .eq('user_id', user.id)
                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                .single()
              
              if (!existingCart) {
                // Create new abandoned cart record with session link
                const { error: abandonedError } = await supabase
                  .from('abandoned_carts')
                  .insert({
                    user_id: user.id,
                    email: user.email || '',
                    cart_items: cartItemsData,
                    cart_total: cartTotal,
                    items_count: itemsCount,
                    session_id: sessionId,
                    status: 'abandoned',
                    // Store phone if available from user profile
                    phone: (user as any).phone || null
                  })
                
                if (abandonedError) {
                  console.warn('Could not save abandoned cart:', abandonedError)
                }
              } else {
                // Update existing abandoned cart
                const { error: updateError } = await supabase
                  .from('abandoned_carts')
                  .update({
                    cart_items: cartItemsData,
                    cart_total: cartTotal,
                    items_count: itemsCount,
                    updated_at: new Date().toISOString(),
                    abandoned_at: new Date().toISOString()
                  })
                  .eq('id', existingCart.id)
                
                if (updateError) {
                  console.warn('Could not update abandoned cart:', updateError)
                }
              }
            } catch (abandonedError) {
              console.warn('Error saving abandoned cart:', abandonedError)
              // Continue with clearing the cart even if saving fails
            }
          }
          
          if (user) {
            const reservations = get().reservations
            
            if (saveAsAbandoned && reservations.length > 0) {
              // When saving as abandoned, mark reservations as 'pending_abandonment'
              // They will be released after the email recovery grace period (e.g., 4 hours)
              for (const reservation of reservations) {
                try {
                  await supabase
                    .from('stock_reservations')
                    .update({ 
                      status: 'pending_abandonment',
                      // Extend expiry for email recovery period (4 hours)
                      expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
                    })
                    .eq('id', reservation.id)
                    .eq('status', 'active')
                } catch (err) {
                  console.warn('Could not update reservation status:', err)
                }
              }
            } else {
              // Normal clear (not logout) - release reservations immediately
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
          }

          set({ items: [], reservations: [], sessionId: null, loading: false })
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

      clearUnavailableNotifications: () => set({ unavailableItems: [] }),

      validateCartAvailability: async () => {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) return // Anonymous users don't have reservations to check
        
        try {
          // Check availability of all cart items
          const { data: availability, error } = await supabase.rpc(
            'check_cart_availability',
            { p_user_id: user.id }
          )
          
          if (error) {
            console.warn('Could not check cart availability:', error)
            return
          }
          
          if (!availability || availability.length === 0) return
          
          const unavailable: Array<{ productId: number; productName: string; reason: string }> = []
          const itemsToUpdate: Array<{ productId: number; newQuantity: number }> = []
          const itemsToRemove: number[] = []
          
          // Process availability results
          for (const item of availability) {
            if (!item.is_available) {
              const cartItem = get().items.find(i => i.product_id === item.product_id)
              if (!cartItem) continue
              
              if (item.available_quantity === 0) {
                // Remove item completely
                itemsToRemove.push(item.product_id)
                unavailable.push({
                  productId: item.product_id,
                  productName: cartItem.product.name,
                  reason: item.message || 'Produs indisponibil'
                })
              } else if (item.available_quantity < item.requested_quantity) {
                // Reduce quantity
                itemsToUpdate.push({
                  productId: item.product_id,
                  newQuantity: item.available_quantity
                })
                unavailable.push({
                  productId: item.product_id,
                  productName: cartItem.product.name,
                  reason: item.message || `Cantitate redusă la ${item.available_quantity}`
                })
              }
            }
          }
          
          // Apply updates
          if (itemsToRemove.length > 0 || itemsToUpdate.length > 0) {
            set(state => {
              let newItems = [...state.items]
              
              // Remove unavailable items
              newItems = newItems.filter(item => 
                !itemsToRemove.includes(item.product_id)
              )
              
              // Update quantities
              newItems = newItems.map(item => {
                const update = itemsToUpdate.find(u => u.productId === item.product_id)
                if (update) {
                  return { ...item, quantity: update.newQuantity }
                }
                return item
              })
              
              return {
                items: newItems,
                unavailableItems: unavailable
              }
            })
            
            // Sync reservations after changes
            await get().syncReservations()
          }
        } catch (error) {
          console.error('Error validating cart availability:', error)
        }
      },

      // Merge anonymous cart with authenticated user cart on login
      mergeAnonymousCart: async (user: any) => {
        const anonymousItems = get().items
        const sessionId = get().sessionId
        
        // First, check if user has pending_abandonment reservations from previous session
        if (user && sessionId) {
          try {
            const { data: recoveredReservations } = await supabase.rpc(
              'recover_abandoned_cart_reservations',
              {
                p_session_id: sessionId,
                p_user_id: user.id
              }
            )
            
            if (recoveredReservations && recoveredReservations.length > 0) {
              console.log('Recovered abandoned cart reservations:', recoveredReservations)
              // Sync the recovered reservations
              await get().syncReservations()
            }
          } catch (error) {
            console.warn('Could not recover abandoned reservations:', error)
          }
        }
        
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
          
          // Validate cart availability after merge
          // This will handle cases where items became unavailable while user was logged out
          await get().validateCartAvailability()
        } catch (error) {
          console.warn('Error during cart merge:', error)
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId
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