import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { realTimeEvents } from '../lib/realTimeEvents'
import type { Showroom } from '../types'

interface SettingsState {
  settings: Record<string, string>
  showrooms: Showroom[]
  loading: boolean
  fetchSettings: () => Promise<void>
  fetchSiteSettings: () => Promise<void>
  updateSetting: (key: string, value: string) => Promise<void>
  fetchShowrooms: () => Promise<void>
  updateShowroom: (id: number, data: Partial<Showroom>) => Promise<void>
  createShowroom: (data: Omit<Showroom, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteShowroom: (id: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {},
  showrooms: [],
  loading: false,

  fetchSettings: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

      if (error) throw error

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      set({ settings: settingsMap, loading: false })
    } catch (error: any) {
      console.error('Error fetching settings:', error.message)
      set({ loading: false })
      throw new Error('Eroare la încărcarea setărilor')
    }
  },

  fetchSiteSettings: async () => {
    // Alias pentru fetchSettings pentru compatibilitate cu useRealTimeSync
    return useSettingsStore.getState().fetchSettings()
  },

  updateSetting: async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { 
            key, 
            value, 
            updated_by: (await supabase.auth.getUser()).data.user?.id 
          },
          { 
            onConflict: 'key',
            ignoreDuplicates: false 
          }
        )

      if (error) throw error

      // Update local state
      set(state => ({
        settings: {
          ...state.settings,
          [key]: value
        }
      }))

      // Emit real-time event for site settings update
      await realTimeEvents.emitEvent('site_settings', 'update', { key, value })
    } catch (error: any) {
      console.error('Error updating setting:', error.message)
      // Provide user-friendly error messages
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        throw new Error('Există deja o setare cu această cheie')
      }
      if (error.message.includes('violates not-null constraint')) {
        throw new Error('Câmpuri obligatorii lipsă. Vă rugăm să completați toate informațiile necesare')
      }
      if (error.message.includes('violates check constraint')) {
        throw new Error('Valoarea introdusă nu respectă formatul necesar')
      }
      if (error.message.includes('permission denied') || error.message.includes('access denied')) {
        throw new Error('Nu aveți permisiuni pentru a modifica această setare')
      }
      throw new Error(error.message || 'Eroare la actualizarea setării')
    }
  },

  fetchShowrooms: async () => {
    set({ loading: true })
    try {
      // First try to get all showrooms (for admins)
      let { data, error } = await supabase
        .from('showrooms')
        .select('*')
        .order('name', { ascending: true })

      // If RLS blocks access, try with active filter only for public users
      if (error && error.message.includes('permission denied')) {
        const result = await supabase
          .from('showrooms')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true })

        data = result.data
        error = result.error
      }

      if (error) throw error
      set({ showrooms: data || [], loading: false })
    } catch (error: any) {
      console.error('Error fetching showrooms:', error.message)
      // For public users, don't throw error - just set empty array
      set({ showrooms: [], loading: false })
    }
  },

  updateShowroom: async (id: number, data: Partial<Showroom>) => {
    try {
      const { error } = await supabase
        .from('showrooms')
        .update(data)
        .eq('id', id)

      if (error) throw error

      // Update local state
      const updatedShowroom = { ...data, id, updated_at: new Date().toISOString() }
      set(state => ({
        showrooms: state.showrooms.map(showroom =>
          showroom.id === id 
            ? { ...showroom, ...updatedShowroom }
            : showroom
        )
      }))

      // Emit real-time event for showroom update
      await realTimeEvents.emitEvent('showrooms', 'update', updatedShowroom)
    } catch (error: any) {
      console.error('Error updating showroom:', error.message)
      // Provide user-friendly error messages
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        throw new Error('Există deja un showroom cu același nume sau adresă')
      }
      if (error.message.includes('violates not-null constraint')) {
        throw new Error('Câmpuri obligatorii lipsă. Vă rugăm să completați toate informațiile necesare')
      }
      if (error.message.includes('violates check constraint')) {
        throw new Error('Datele introduse nu respectă formatul necesar')
      }
      throw new Error(error.message || 'Eroare la actualizarea showroom-ului')
    }
  },

  createShowroom: async (data: Omit<Showroom, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: newShowroom, error } = await supabase
        .from('showrooms')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      // Add to local state
      set(state => ({
        showrooms: [...state.showrooms, newShowroom]
      }))

      // Emit real-time event for showroom creation
      await realTimeEvents.emitEvent('showrooms', 'create', newShowroom)

      return newShowroom
    } catch (error: any) {
      console.error('Error creating showroom:', error.message)
      // Provide user-friendly error messages
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        throw new Error('Există deja un showroom cu același nume sau adresă')
      }
      if (error.message.includes('violates not-null constraint')) {
        throw new Error('Câmpuri obligatorii lipsă. Vă rugăm să completați toate informațiile necesare')
      }
      if (error.message.includes('violates check constraint')) {
        throw new Error('Datele introduse nu respectă formatul necesar')
      }
      throw new Error(error.message || 'Eroare la crearea showroom-ului')
    }
  },

  deleteShowroom: async (id: number) => {
    try {
      const { error } = await supabase
        .from('showrooms')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      set(state => ({
        showrooms: state.showrooms.filter(showroom => showroom.id !== id)
      }))

      // Emit real-time event for showroom deletion
      await realTimeEvents.emitEvent('showrooms', 'delete', { id })
    } catch (error: any) {
      console.error('Error deleting showroom:', error.message)
      // Provide user-friendly error messages
      if (error.message.includes('foreign key constraint')) {
        throw new Error('Nu se poate șterge showroom-ul deoarece este folosit în alte părți ale sistemului')
      }
      throw new Error(error.message || 'Eroare la ștergerea showroom-ului')
    }
  }
}))