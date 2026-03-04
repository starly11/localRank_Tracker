import { api } from './axios'
import {
  dismissDemoAlert,
  getDemoAlerts,
  getDemoUnreadAlertsCount,
  isDemoModeEnabled,
  markAllDemoAlertsRead,
  markDemoAlertRead,
} from '@/demo/mockData'

export const getAlertsApi = async (params) => {
  if (isDemoModeEnabled()) {
    return getDemoAlerts(params || {})
  }

  const res = await api.get('/alerts', { params })
  return res.data?.data
}

export const getUnreadAlertsCountApi = async () => {
  if (isDemoModeEnabled()) {
    return getDemoUnreadAlertsCount()
  }

  const res = await api.get('/alerts/unread-count')
  return res.data?.data?.unreadCount || 0
}

export const markAllAlertsReadApi = async () => {
  if (isDemoModeEnabled()) {
    markAllDemoAlertsRead()
    return { success: true, message: 'Demo alerts updated' }
  }

  const res = await api.patch('/alerts/mark-all-read')
  return res.data
}

export const markAlertReadApi = async (alertId) => {
  if (isDemoModeEnabled()) {
    markDemoAlertRead(alertId)
    return { success: true, data: { id: alertId, isRead: true } }
  }

  const res = await api.patch(`/alerts/${alertId}/read`)
  return res.data
}

export const dismissAlertApi = async (alertId) => {
  if (isDemoModeEnabled()) {
    dismissDemoAlert(alertId)
    return { success: true, message: 'Demo alert dismissed' }
  }

  const res = await api.delete(`/alerts/${alertId}`)
  return res.data
}
