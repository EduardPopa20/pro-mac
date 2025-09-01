import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        const existingItem = get().items.find(item => item.product_id === product.id)
        
        if (existingItem) {
          set({
            items: get().items.map(item =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          const newItem: CartItem = {
            id: Date.now().toString(),
            product_id: product.id,
            product,
            quantity,
            user_id: '',
            created_at: new Date().toISOString(),
          }
          set({ items: [...get().items, newItem] })
        }
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter(item => item.product_id !== productId)
        })
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map(item =>
            item.product_id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)