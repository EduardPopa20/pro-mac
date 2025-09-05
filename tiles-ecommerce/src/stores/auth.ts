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
  emailConfirmationPending: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    })

    if (error) {
      set({ loading: false })
      switch (error.message) {
        case 'Invalid login credentials':
          throw new Error('Email sau parolă incorectă')
        case 'Email not confirmed':
          throw new Error('Vă rugăm să confirmați email-ul înainte de a vă autentifica')
        case 'Too many requests':
          throw new Error('Prea multe încercări. Încercați din nou mai târziu')
        default:
          throw new Error(error.message)
      }
    }

    // Get user profile after successful login
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        set({ 
          user: {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role
          },
          loading: false 
        })
      } else {
        set({ loading: false })
        throw new Error('Profilul utilizatorului nu a fost găsit')
      }
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
        throw new Error(error.message)
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
              role: profile.role
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
    await supabase.auth.signOut()
    set({ user: null, loading: false, emailConfirmationPending: null })
  },

  updateProfile: async (updates: Partial<User>) => {
    const currentUser = get().user
    if (!currentUser) throw new Error('Nu sunteți autentificat')

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)

    if (error) {
      throw new Error('Eroare la actualizarea profilului')
    }

    set(state => ({
      user: state.user ? { ...state.user, ...updates } : null
    }))
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
    set({ user: null, loading: false, emailConfirmationPending: null })
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
          set({ 
            user: {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone,
              address: profile.address,
              newsletter_subscribed: profile.newsletter_subscribed,
              role: profile.role,
              created_at: profile.created_at
            },
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
            set({ 
              user: {
                id: newProfile.id,
                email: newProfile.email,
                full_name: newProfile.full_name,
                phone: newProfile.phone,
                address: newProfile.address,
                newsletter_subscribed: newProfile.newsletter_subscribed,
                role: newProfile.role,
                created_at: newProfile.created_at
              },
              loading: false 
            })
          } else {
            set({ user: null, loading: false })
          }
        }
      } else {
        set({ user: null, loading: false })
      }
    } catch (error: any) {
      console.error('Auth check error:', error)
      set({ user: null, loading: false })
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
            role: profile.role
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
    useAuthStore.setState({ user: null, loading: false, emailConfirmationPending: null })
  } else if (event === 'SIGNED_IN' && session?.user) {
    // Don't auto-fetch profile here to avoid conflicts with manual checkAuth
    console.log('Auth state changed to SIGNED_IN')
  }
})