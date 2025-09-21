import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  // Legacy address field (keeping for backwards compatibility)
  address?: string
  // New structured address fields
  county?: string
  city?: string
  street_address_1?: string
  street_address_2?: string
  postal_code?: string
  newsletter_subscribed?: boolean
  role: 'admin' | 'customer'
  created_at: string
}

interface AuthState {
  user: User | null
  loading: boolean
  authenticating: boolean // New flag to track authentication in progress
  isAdmin: boolean // Computed property for admin check
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string, recaptchaToken?: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  deleteAccount: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  checkAuth: () => Promise<void>
  resendConfirmation: (email: string) => Promise<void>
  verifyEmail: (token: string, type: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  emailConfirmationPending: string | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  authenticating: false,
  emailConfirmationPending: null,
  isAdmin: false,

  signIn: async (email: string, password: string) => {
    set({ authenticating: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        set({ authenticating: false })
        // Handle specific Supabase error messages and provide user-friendly Romanian messages
        let userMessage = 'Eroare la autentificare. Încercați din nou.'
        
        if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          userMessage = 'Email sau parolă incorectă'
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          userMessage = 'Vă rugăm să confirmați email-ul înainte de a vă autentifica'
        } else if (error.message.includes('Too many requests') || error.message.includes('too_many_requests')) {
          userMessage = 'Prea multe încercări. Încercați din nou mai târziu'
        } else if (error.message.includes('Invalid email') || error.message.includes('invalid_email')) {
          userMessage = 'Adresa de email nu este validă'
        } else if (error.message.includes('Password') || error.message.includes('password')) {
          userMessage = 'Parola introdusă nu este validă'
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          userMessage = 'Problemă de conexiune. Verificați internetul și încercați din nou'
        }
        
        throw new Error(userMessage)
      }

      // Get user profile after successful login
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          const newUser = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            created_at: profile.created_at
          }
          
          set({ 
            user: newUser,
            loading: false,
            authenticating: false
          })

          // Merge anonymous cart with authenticated user cart
          try {
            const { useCartStore } = await import('./cart')
            await useCartStore.getState().mergeAnonymousCart(newUser)
          } catch (cartError) {
            console.warn('Could not merge anonymous cart:', cartError)
          }
        } else {
          set({ authenticating: false })
          throw new Error('Profilul utilizatorului nu a fost găsit')
        }
      }
    } catch (error) {
      set({ authenticating: false })
      throw error
    }
  },

  signUp: async (email: string, password: string, fullName?: string, recaptchaToken?: string) => {
    set({ loading: true })
    
    try {
      // Check if email already exists
      const { data: existingUsers } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (existingUsers && existingUsers.length > 0) {
        set({ loading: false })
        throw new Error('Un cont cu acest email există deja')
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName,
            recaptcha_token: recaptchaToken
          }
        }
      })

      if (error) {
        set({ loading: false })
        // Handle signup-specific errors with user-friendly messages
        let userMessage = 'Eroare la crearea contului. Încercați din nou.'
        
        if (error.message.includes('already registered') || error.message.includes('already_exists')) {
          userMessage = 'Un cont cu acest email există deja'
        } else if (error.message.includes('Invalid email') || error.message.includes('invalid_email')) {
          userMessage = 'Adresa de email nu este validă'
        } else if (error.message.includes('Password') || error.message.includes('password')) {
          userMessage = 'Parola nu respectă cerințele minime de securitate'
        } else if (error.message.includes('Network') || error.message.includes('network')) {
          userMessage = 'Problemă de conexiune. Verificați internetul și încercați din nou'
        }
        
        throw new Error(userMessage)
      }

      const needsConfirmation = !data.session && !!data.user && !data.user.email_confirmed_at
      
      if (needsConfirmation) {
        set({ emailConfirmationPending: email.toLowerCase().trim(), loading: false })
      } else if (data.session) {
        // Auto-signed in, create profile
        const { data: profile } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email.toLowerCase().trim(),
              full_name: fullName,
              role: 'customer'
            }
          ])
          .select()
          .single()

        if (profile) {
          set({ 
            user: {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              created_at: profile.created_at
            },
            loading: false 
          })
        }
      } else {
        set({ loading: false })
      }

      return { needsConfirmation }
    } catch (error: any) {
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    // Save cart as abandoned before signing out (for logged-in users)
    try {
      const { useCartStore } = await import('./cart')
      // Pass true to save cart as abandoned for email recovery
      await useCartStore.getState().clearCart(true)
    } catch (cartError) {
      console.warn('Could not save/clear cart on logout:', cartError)
    }
    
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false, loading: false, emailConfirmationPending: null })
  },

  updateProfile: async (updates: Partial<User>) => {
    const currentUser = get().user
    if (!currentUser) throw new Error('Nu sunteți autentificat')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)
      .select('*')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      let errorMessage = 'Eroare la actualizarea profilului'
      
      if (error.message.includes('duplicate key')) {
        errorMessage = 'Datele introduse sunt duplicate'
      } else if (error.message.includes('violates check constraint')) {
        errorMessage = 'Datele introduse nu sunt valide'
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Nu aveți permisiunea să modificați aceste date'
      }
      
      throw new Error(errorMessage)
    }

    if (data) {
      set(state => {
        const updatedUser = state.user ? {
          ...state.user,
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          county: data.county,
          city: data.city,
          street_address_1: data.street_address_1,
          street_address_2: data.street_address_2,
          postal_code: data.postal_code,
          newsletter_subscribed: data.newsletter_subscribed,
          role: data.role || state.user.role // In case role is updated
        } : null
        return {
          user: updatedUser,
          isAdmin: updatedUser?.role === 'admin'
        }
      })
    }
  },

  deleteAccount: async () => {
    const currentUser = get().user
    if (!currentUser) throw new Error('Nu sunteți autentificat')

    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', currentUser.id)

    if (profileError) {
      throw new Error('Eroare la ștergerea profilului')
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id)
    if (authError) {
      console.error('Auth deletion error (may require admin privileges):', authError)
    }

    // Sign out locally regardless
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false, loading: false, emailConfirmationPending: null })
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw new Error('Eroare la schimbarea parolei')
    }
  },

  checkAuth: async () => {
    const { authenticating } = get()
    
    if (authenticating) {
      return
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Try to get the user profile from the database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile && !profileError) {
          const user = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            address: profile.address,
            county: profile.county,
            city: profile.city,
            street_address_1: profile.street_address_1,
            street_address_2: profile.street_address_2,
            postal_code: profile.postal_code,
            newsletter_subscribed: profile.newsletter_subscribed,
            role: profile.role,
            created_at: profile.created_at
          }
          set({
            user,
            isAdmin: user.role === 'admin',
            loading: false
          })
        } else {
          // Profile doesn't exist, create it
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name,
                role: 'customer'
              }
            ])
            .select()
            .single()

          if (newProfile) {
            const user = {
              id: newProfile.id,
              email: newProfile.email,
              full_name: newProfile.full_name,
              phone: newProfile.phone,
              address: newProfile.address,
              county: newProfile.county,
              city: newProfile.city,
              street_address_1: newProfile.street_address_1,
              street_address_2: newProfile.street_address_2,
              postal_code: newProfile.postal_code,
              newsletter_subscribed: newProfile.newsletter_subscribed,
              role: newProfile.role,
              created_at: newProfile.created_at
            }
            set({
              user,
              isAdmin: user.role === 'admin',
              loading: false
            })
          } else {
            set({ user: null, isAdmin: false, loading: false })
          }
        }
      } else {
        set({ user: null, isAdmin: false, loading: false })
      }
    } catch (error: any) {
      console.error('Auth check error:', error)
      set({ user: null, isAdmin: false, loading: false })
    }
  },

  resendConfirmation: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim()
    })

    if (error) {
      throw new Error('Eroare la retrimiterea email-ului de confirmare')
    }
  },

  verifyEmail: async (token: string, type: string) => {
    set({ loading: true })
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    })

    if (error) {
      set({ loading: false })
      throw new Error('Token de verificare invalid sau expirat')
    }

    if (data.user) {
      // Create profile after email verification
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name,
            role: 'customer'
          }
        ])
        .select()
        .single()

      if (profile && !profileError) {
        set({ 
          user: {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            created_at: profile.created_at
          },
          loading: false,
          emailConfirmationPending: null 
        })
      } else {
        set({ loading: false })
        throw new Error('Eroare la crearea profilului')
      }
    } else {
      set({ loading: false })
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw new Error('Eroare la autentificarea cu Google')
    }
  },

  signInWithFacebook: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw new Error('Eroare la autentificarea cu Facebook')
    }
  }
}))

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAdmin: false, loading: false, emailConfirmationPending: null })
  } else if (event === 'SIGNED_IN' && session?.user) {
    // Don't auto-fetch profile here to avoid conflicts with manual checkAuth
    console.log('Auth state changed to SIGNED_IN')
  }
})