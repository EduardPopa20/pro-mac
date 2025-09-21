import { create } from 'zustand'

export interface AlertData {
  id: string
  message: string
  title?: string
  severity: 'success' | 'error' | 'warning' | 'info'
  duration?: number // in milliseconds, null for persistent
}

interface GlobalAlertState {
  alerts: AlertData[]
  showAlert: (alert: Omit<AlertData, 'id'>) => void
  removeAlert: (id: string) => void
  clearAll: () => void
}

export const useGlobalAlertStore = create<GlobalAlertState>((set, get) => ({
  alerts: [],

  showAlert: (alertData: Omit<AlertData, 'id'>) => {
    const alert: AlertData = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      duration: 5000, // Default 5 seconds
      ...alertData
    }

    set((state) => ({
      alerts: [...state.alerts, alert]
    }))

    // Auto-remove alert after duration
    if (alert.duration && alert.duration > 0) {
      setTimeout(() => {
        get().removeAlert(alert.id)
      }, alert.duration)
    }
  },

  removeAlert: (id: string) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    }))
  },

  clearAll: () => {
    set({ alerts: [] })
  }
}))

// Helper functions for common alert types
export const showSuccessAlert = (message: string, title?: string) => {
  useGlobalAlertStore.getState().showAlert({
    message,
    title,
    severity: 'success'
  })
}

export const showErrorAlert = (message: string, title?: string) => {
  useGlobalAlertStore.getState().showAlert({
    message,
    title,
    severity: 'error',
    duration: 7000 // Longer duration for errors
  })
}

export const showWarningAlert = (message: string, title?: string) => {
  useGlobalAlertStore.getState().showAlert({
    message,
    title,
    severity: 'warning',
    duration: 6000
  })
}

export const showInfoAlert = (message: string, title?: string) => {
  useGlobalAlertStore.getState().showAlert({
    message,
    title,
    severity: 'info'
  })
}