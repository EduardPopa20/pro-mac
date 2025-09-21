import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { NewsletterSubscription } from '../types'

interface NewsletterState {
  subscriptions: NewsletterSubscription[]
  loading: boolean
  isSubscribed: (email: string) => Promise<boolean>
  subscribe: (email: string, source?: string) => Promise<{ success: boolean; message: string }>
  unsubscribe: (email: string) => Promise<{ success: boolean; message: string }>
  fetchSubscriptions: () => Promise<void> // Admin only
  updateSubscription: (id: number, data: Partial<NewsletterSubscription>) => Promise<void> // Admin only
  deleteSubscription: (id: number) => Promise<void> // Admin only
  sendBulkEmail: (subject: string, content: string) => Promise<{ success: boolean; message: string }> // Admin only
}

export const useNewsletterStore = create<NewsletterState>((set, get) => ({
  subscriptions: [],
  loading: false,

  // Check if email is already subscribed
  isSubscribed: async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_email_subscribed', { p_email: email })

      if (error) throw error
      return data || false
    } catch (error: any) {
      console.error('Error checking subscription status:', error.message)
      return false
    }
  },

  // Subscribe to newsletter
  subscribe: async (email: string, source: string = 'modal') => {
    set({ loading: true })
    
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim()

      // Check if email is already subscribed
      const alreadySubscribed = await get().isSubscribed(normalizedEmail)
      
      if (alreadySubscribed) {
        set({ loading: false })
        return {
          success: false,
          message: 'Această adresă de email este deja abonată la newsletter.'
        }
      }

      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()

      // Get user's IP address and user agent (for basic tracking)
      const userAgent = navigator.userAgent
      
      // Insert subscription
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            email: normalizedEmail,
            status: 'active',
            source: source,
            user_id: user?.id || null,
            user_agent: userAgent,
            subscribed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])

      if (error) {
        set({ loading: false })
        
        // Handle specific errors
        if (error.code === '23505') { // Unique constraint violation
          return {
            success: false,
            message: 'Această adresă de email este deja abonată.'
          }
        }
        
        throw error
      }

      set({ loading: false })
      return {
        success: true,
        message: 'Te-ai abonat cu succes la newsletter-ul Pro-Mac! Vei primi ofertele noastre speciale direct în email.'
      }

    } catch (error: any) {
      set({ loading: false })
      console.error('Error subscribing to newsletter:', error.message)
      
      return {
        success: false,
        message: 'A apărut o eroare la abonare. Vă rugăm să încercați din nou.'
      }
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email: string) => {
    set({ loading: true })
    
    try {
      const normalizedEmail = email.toLowerCase().trim()

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', normalizedEmail)
        .eq('status', 'active')

      if (error) throw error

      set({ loading: false })
      return {
        success: true,
        message: 'Te-ai dezabonat cu succes de la newsletter.'
      }

    } catch (error: any) {
      set({ loading: false })
      console.error('Error unsubscribing from newsletter:', error.message)
      
      return {
        success: false,
        message: 'A apărut o eroare la dezabonare. Vă rugăm să încercați din nou.'
      }
    }
  },

  // Fetch all subscriptions (Admin only)
  fetchSubscriptions: async () => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (error) throw error

      set({ subscriptions: data || [], loading: false })
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error.message)
      set({ loading: false })
      throw new Error('Eroare la încărcarea abonamentelor')
    }
  },

  // Update subscription (Admin only)
  updateSubscription: async (id: number, data: Partial<NewsletterSubscription>) => {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // Update local state
      set(state => ({
        subscriptions: state.subscriptions.map(sub =>
          sub.id === id ? { ...sub, ...updateData } : sub
        )
      }))

    } catch (error: any) {
      console.error('Error updating subscription:', error.message)
      throw new Error('Eroare la actualizarea abonamentului')
    }
  },

  // Delete subscription (Admin only - GDPR compliance)
  deleteSubscription: async (id: number) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      set(state => ({
        subscriptions: state.subscriptions.filter(sub => sub.id !== id)
      }))

    } catch (error: any) {
      console.error('Error deleting subscription:', error.message)
      throw new Error('Eroare la ștergerea abonamentului')
    }
  },

  // Send bulk email (Admin only)
  sendBulkEmail: async (subject: string, content: string) => {
    set({ loading: true })
    
    try {
      // TODO: Deploy Edge Function first
      // For now, simulate the process
      console.log('Would send newsletter with:', { subject, content })
      console.log('Active subscribers:', get().subscriptions.filter(s => s.status === 'active'))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Try to call the Edge Function
      try {
        const { data, error } = await supabase.functions.invoke('send-newsletter', {
          body: {
            subject: subject.trim(),
            content: content.trim()
          }
        })

        if (error) {
          console.error('Edge Function error:', error)
          // Fall back to simulation for now
          set({ loading: false })
          return {
            success: true,
            message: `Newsletter simulat cu succes către ${get().subscriptions.filter(s => s.status === 'active').length} abonați! (Edge Function nu este încă deploiat - va fi trimis real după configurare)`
          }
        }

        // If Edge Function succeeds
        set({ loading: false })
        return {
          success: true,
          message: data?.message || 'Newsletter trimis cu succes!'
        }

      } catch (functionError: any) {
        console.log('Edge Function not available, simulating success:', functionError.message)
        
        // Simulate success for now
        set({ loading: false })
        return {
          success: true,
          message: `Newsletter simulat cu succes către ${get().subscriptions.filter(s => s.status === 'active').length} abonați! (Edge Function va fi configurat pentru trimiterea reală)`
        }
      }

    } catch (error: any) {
      set({ loading: false })
      console.error('Error in bulk email function:', error.message)
      
      return {
        success: false,
        message: error.message || 'A apărut o eroare la trimiterea newsletter-ului.'
      }
    }
  }
}))

// Helper function to validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to get user IP (for tracking purposes)
export const getUserIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error getting user IP:', error)
    return null
  }
}

// Helper function to generate unsubscribe URL for emails
export const generateUnsubscribeUrl = (email: string): string => {
  // In a real implementation, you would generate a secure token
  // For now, we'll create a simple token based on email + timestamp
  const token = btoa(`${email}:${Date.now()}`).replace(/[+/=]/g, '')
  const baseUrl = window.location.origin
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

// Helper function to create email template with unsubscribe link
export const createEmailTemplate = (
  content: string, 
  email: string, 
  subject: string = 'Newsletter Pro-Mac'
): string => {
  const unsubscribeUrl = generateUnsubscribeUrl(email)
  
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: #1976d2; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .unsubscribe { color: #666; text-decoration: none; }
        .unsubscribe:hover { text-decoration: underline; }
        .button { display: inline-block; background: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Pro-Mac</h1>
        <p>Magazin de faianta și gresie</p>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>Primești acest email pentru că te-ai abonat la newsletter-ul Pro-Mac.</p>
        <p>
            <a href="${unsubscribeUrl}" class="unsubscribe">Dezabonează-te</a> | 
            <a href="${window.location.origin}" class="unsubscribe">Vizitează site-ul</a>
        </p>
        <p>Pro-Mac SRL | România | contact@promac.ro</p>
    </div>
</body>
</html>
`
}