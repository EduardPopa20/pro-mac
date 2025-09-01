import { useEffect, useCallback } from 'react'
import type { EntityType, RealTimeEvent } from '../lib/realTimeEvents'
import { realTimeEvents } from '../lib/realTimeEvents'
import { useSettingsStore } from '../stores/settings'
import { useProductStore } from '../stores/products'

export function useRealTimeSync() {
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    console.log('Received real-time event:', event)

    // Get fresh store references to avoid stale closures
    const settingsStore = useSettingsStore.getState()
    const productStore = useProductStore.getState()

    switch (event.entity) {
      case 'showrooms':
        settingsStore.fetchShowrooms()
        break

      case 'site_settings':
        settingsStore.fetchSettings()
        break

      case 'products':
        productStore.fetchProducts()
        break

      case 'categories':
        productStore.fetchCategories()
        break

      default:
        console.log('Unhandled entity type:', event.entity)
    }
  }, []) // No dependencies to avoid recreation

  useEffect(() => {
    // Subscribe to all real-time events
    const unsubscribe = realTimeEvents.subscribeToEvents(handleRealTimeEvent)

    console.log('Real-time sync initialized')

    // Cleanup on unmount
    return () => {
      unsubscribe()
      console.log('Real-time sync disconnected')
    }
  }, []) // Only run once on mount

  return {
    isConnected: realTimeEvents.isEventSystemConnected()
  }
}

// Hook specific pentru anumite entități
export function useEntitySync(entities: EntityType[]) {
  const settingsStore = useSettingsStore()
  const productStore = useProductStore()

  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    console.log(`Received ${event.entity} event:`, event)

    switch (event.entity) {
      case 'showrooms':
        settingsStore.fetchShowrooms()
        break

      case 'site_settings':
        settingsStore.fetchSettings()
        break

      case 'products':
        productStore.fetchProducts()
        break

      case 'categories':
        productStore.fetchCategories()
        break
    }
  }, [settingsStore, productStore])

  useEffect(() => {
    // Subscribe only to specified entities
    const unsubscribe = realTimeEvents.subscribeToEntities(entities, handleRealTimeEvent)

    console.log(`Entity sync initialized for: ${entities.join(', ')}`)

    return () => {
      unsubscribe()
      console.log(`Entity sync disconnected for: ${entities.join(', ')}`)
    }
  }, [entities, handleRealTimeEvent])
}