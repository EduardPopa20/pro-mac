import { supabase } from './supabase'

export type EntityType = 'showrooms' | 'products' | 'site_settings' | 'categories'
export type ActionType = 'create' | 'update' | 'delete'

export interface RealTimeEvent {
  entity: EntityType
  action: ActionType
  data: any
  timestamp: string
  id?: string
}

class RealTimeEventManager {
  private static instance: RealTimeEventManager
  private isConnected: boolean = false

  static getInstance(): RealTimeEventManager {
    if (!RealTimeEventManager.instance) {
      RealTimeEventManager.instance = new RealTimeEventManager()
    }
    return RealTimeEventManager.instance
  }

  async emitEvent(entity: EntityType, action: ActionType, data: any): Promise<void> {
    const event: RealTimeEvent = {
      entity,
      action,
      data,
      timestamp: new Date().toISOString(),
      id: `${entity}_${action}_${Date.now()}`
    }

    try {
      await supabase
        .from('real_time_events')
        .insert([event])

      console.log(`Event emitted: ${entity} ${action}`, data)
    } catch (error) {
      console.error('Failed to emit real-time event:', error)
    }
  }

  subscribeToEvents(callback: (event: RealTimeEvent) => void): () => void {
    const channel = supabase
      .channel('real_time_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_events'
        },
        (payload) => {
          const event = payload.new as RealTimeEvent
          callback(event)
        }
      )
      .subscribe()

    this.isConnected = true

    return () => {
      channel.unsubscribe()
      this.isConnected = false
    }
  }

  subscribeToEntity(
    entity: EntityType, 
    callback: (event: RealTimeEvent) => void
  ): () => void {
    return this.subscribeToEvents((event) => {
      if (event.entity === entity) {
        callback(event)
      }
    })
  }

  subscribeToEntities(
    entities: EntityType[], 
    callback: (event: RealTimeEvent) => void
  ): () => void {
    return this.subscribeToEvents((event) => {
      if (entities.includes(event.entity)) {
        callback(event)
      }
    })
  }

  isEventSystemConnected(): boolean {
    return this.isConnected
  }
}

export const realTimeEvents = RealTimeEventManager.getInstance()