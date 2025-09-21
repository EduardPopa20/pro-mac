/**
 * Cart Synchronization Service
 * Handles server-side cart persistence for abandoned cart email functionality
 */

import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

interface ServerCart {
  id: string
  user_id: string | null
  session_id: string | null
  status: 'active' | 'abandoned' | 'recovered' | 'completed'
  abandoned_at: string | null
  created_at: string
  updated_at: string
}

class CartSyncService {
  private syncInterval: NodeJS.Timeout | null = null
  private lastActivity: Date = new Date()
  private currentCartId: string | null = null
  private isInitialized: boolean = false

  /**
   * Initialize cart synchronization on app mount
   */
  async initialize() {
    if (this.isInitialized) return
    
    try {
      await this.loadOrCreateCart()
      this.setupActivityTracking()
      this.setupCartSubscription()
      this.isInitialized = true
      
      console.log('Cart sync service initialized')
    } catch (error) {
      console.error('Failed to initialize cart sync:', error)
    }
  }

  /**
   * Load existing cart or create new one
   */
  private async loadOrCreateCart() {
    const { user } = useAuthStore.getState()
    const sessionId = this.getOrCreateSessionId()
    
    // Try to find existing active cart
    let query = supabase
      .from('carts')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)

    // Use user_id if authenticated, session_id otherwise
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('session_id', sessionId)
    }

    const { data: existingCart, error } = await query.single()

    if (!error && existingCart) {
      this.currentCartId = existingCart.id
      await this.restoreCartItems(existingCart.id)
    } else {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          status: 'active'
        })
        .select()
        .single()

      if (!createError && newCart) {
        this.currentCartId = newCart.id
      }
    }
  }

  /**
   * Restore cart items from server to local state
   */
  private async restoreCartItems(cartId: string) {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('cart_id', cartId)

    if (!error && items && items.length > 0) {
      const cartStore = useCartStore.getState()
      
      // Clear local cart and restore from server
      cartStore.clearCart()
      
      items.forEach(item => {
        if (item.product) {
          cartStore.addItem(item.product, item.quantity)
        }
      })
      
      console.log(`Restored ${items.length} items from server`)
    }
  }

  /**
   * Setup activity tracking for abandonment detection
   */
  private setupActivityTracking() {
    // Track user activity
    const updateActivity = () => {
      this.lastActivity = new Date()
      this.markCartActive()
    }

    // Monitor various user interactions
    document.addEventListener('mousemove', updateActivity)
    document.addEventListener('keypress', updateActivity)
    document.addEventListener('click', updateActivity)
    document.addEventListener('scroll', updateActivity)
    
    // Check for abandonment every 5 minutes
    this.syncInterval = setInterval(() => {
      this.checkForAbandonment()
    }, 5 * 60 * 1000) // 5 minutes
  }

  /**
   * Subscribe to cart store changes
   */
  private setupCartSubscription() {
    // Subscribe to cart changes
    useCartStore.subscribe(
      (state) => state.items,
      (items) => {
        // Sync to server when cart changes
        this.syncToServer()
      }
    )
  }

  /**
   * Check if cart should be marked as abandoned
   */
  private async checkForAbandonment() {
    const inactiveMinutes = (Date.now() - this.lastActivity.getTime()) / 60000
    
    // Mark as abandoned after 30 minutes of inactivity
    if (inactiveMinutes > 30 && this.currentCartId) {
      await this.markCartAbandoned()
    }
  }

  /**
   * Mark cart as abandoned in database
   */
  private async markCartAbandoned() {
    if (!this.currentCartId) return

    const { error } = await supabase
      .from('carts')
      .update({
        status: 'abandoned',
        abandoned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', this.currentCartId)

    if (!error) {
      console.log('Cart marked as abandoned')
    }
  }

  /**
   * Mark cart as active (user returned)
   */
  private async markCartActive() {
    if (!this.currentCartId) return

    const { error } = await supabase
      .from('carts')
      .update({
        status: 'active',
        abandoned_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.currentCartId)
      .eq('status', 'abandoned') // Only update if currently abandoned

    if (!error) {
      console.log('Cart reactivated')
    }
  }

  /**
   * Sync local cart to server
   */
  async syncToServer() {
    if (!this.currentCartId) return

    const { items } = useCartStore.getState()
    
    try {
      // Update cart timestamp
      await supabase
        .from('carts')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', this.currentCartId)

      // Clear existing items
      await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', this.currentCartId)

      // Add current items
      if (items.length > 0) {
        const cartItems = items.map(item => ({
          cart_id: this.currentCartId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product.price
        }))

        await supabase
          .from('cart_items')
          .insert(cartItems)
      }

      console.log(`Synced ${items.length} items to server`)
    } catch (error) {
      console.error('Failed to sync cart to server:', error)
    }
  }

  /**
   * Handle user login - merge anonymous cart with user cart
   */
  async handleUserLogin(userId: string) {
    const sessionId = this.getOrCreateSessionId()
    
    try {
      // Find anonymous cart
      const { data: anonymousCart } = await supabase
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single()

      // Find user's existing cart
      const { data: userCart } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (anonymousCart && userCart) {
        // Merge carts: move items from anonymous to user cart
        await supabase
          .from('cart_items')
          .update({ cart_id: userCart.id })
          .eq('cart_id', anonymousCart.id)

        // Delete anonymous cart
        await supabase
          .from('carts')
          .delete()
          .eq('id', anonymousCart.id)

        this.currentCartId = userCart.id
      } else if (anonymousCart && !userCart) {
        // Convert anonymous cart to user cart
        await supabase
          .from('carts')
          .update({
            user_id: userId,
            session_id: null
          })
          .eq('id', anonymousCart.id)

        this.currentCartId = anonymousCart.id
      } else if (!anonymousCart && userCart) {
        // Use existing user cart
        this.currentCartId = userCart.id
        await this.restoreCartItems(userCart.id)
      }
    } catch (error) {
      console.error('Failed to handle user login for cart:', error)
    }
  }

  /**
   * Handle cart recovery from email link
   */
  async recoverCart(token: string): Promise<boolean> {
    try {
      // Validate token
      const { data: recoveryToken, error: tokenError } = await supabase
        .from('cart_recovery_tokens')
        .select('*, cart:carts(*)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single()

      if (tokenError || !recoveryToken) {
        console.error('Invalid or expired recovery token')
        return false
      }

      // Mark token as used
      await supabase
        .from('cart_recovery_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', recoveryToken.id)

      // Restore cart
      this.currentCartId = recoveryToken.cart.id
      await this.restoreCartItems(recoveryToken.cart.id)

      // Mark cart as recovered
      await supabase
        .from('carts')
        .update({
          status: 'recovered',
          updated_at: new Date().toISOString()
        })
        .eq('id', recoveryToken.cart.id)

      console.log('Cart successfully recovered')
      return true
    } catch (error) {
      console.error('Failed to recover cart:', error)
      return false
    }
  }

  /**
   * Mark cart as completed after successful order
   */
  async markCartCompleted(orderId?: string) {
    if (!this.currentCartId) return

    await supabase
      .from('carts')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', this.currentCartId)

    // Clear local cart
    useCartStore.getState().clearCart()
    
    // Reset for new cart
    this.currentCartId = null
    await this.loadOrCreateCart()
  }

  /**
   * Get or create session ID for anonymous users
   */
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('cart_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * Cleanup on unmount
   */
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.isInitialized = false
  }
}

// Export singleton instance
export const cartSyncService = new CartSyncService()