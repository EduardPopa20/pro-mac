import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'
import { showSuccessAlert, showErrorAlert } from './globalAlert'

interface WatchlistState {
  items: Product[]
  addToWatchlist: (product: Product, isAuthenticated?: boolean) => void
  removeFromWatchlist: (productId: number) => void
  clearWatchlist: () => void
  isInWatchlist: (productId: number) => boolean
  toggleWatchlist: (product: Product, isAuthenticated?: boolean) => void
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWatchlist: (product: Product, isAuthenticated?: boolean) => {
        if (!isAuthenticated) {
          showErrorAlert(
            'Pentru a adăuga produse la favorite, trebuie să vă conectați la cont.',
            'Autentificare necesară'
          )
          return
        }

        const { items } = get()
        
        // Check if already in watchlist
        if (items.find(item => item.id === product.id)) {
          showErrorAlert('Produsul este deja în lista de favorite!')
          return
        }

        set((state) => ({
          items: [...state.items, product]
        }))

        showSuccessAlert(
          `${product.name} a fost adăugat în lista de favorite!`,
          'Produs adăugat'
        )
      },

      removeFromWatchlist: (productId: number) => {
        const { items } = get()
        const product = items.find(item => item.id === productId)
        
        set((state) => ({
          items: state.items.filter(item => item.id !== productId)
        }))

        if (product) {
          showSuccessAlert(
            `${product.name} a fost eliminat din lista de favorite!`,
            'Produs eliminat'
          )
        }
      },

      clearWatchlist: () => {
        set({ items: [] })
        showSuccessAlert('Lista de favorite a fost golită!')
      },

      isInWatchlist: (productId: number) => {
        const { items } = get()
        return items.some(item => item.id === productId)
      },

      toggleWatchlist: (product: Product, isAuthenticated?: boolean) => {
        if (!isAuthenticated) {
          showErrorAlert(
            'Pentru a gestiona lista de favorite, trebuie să vă conectați la cont.',
            'Autentificare necesară'
          )
          return
        }

        const { items, addToWatchlist, removeFromWatchlist } = get()
        
        if (items.find(item => item.id === product.id)) {
          removeFromWatchlist(product.id)
        } else {
          addToWatchlist(product, isAuthenticated)
        }
      }
    }),
    {
      name: 'promac-watchlist',
      partialize: (state) => ({ items: state.items })
    }
  )
)