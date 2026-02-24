import { api } from './axios'

export const getAlertsApi = async (params) => {
  const res = await api.get('/alerts', { params })
  return res.data?.data
}

export const getUnreadAlertsCountApi = async () => {
  const res = await api.get('/alerts/unread-count')
  return res.data?.data?.unreadCount || 0
}

export const markAllAlertsReadApi = async () => {
  const res = await api.patch('/alerts/mark-all-read')
  return res.data
}

export const markAlertReadApi = async (alertId) => {
  const res = await api.patch(`/alerts/${alertId}/read`)
  return res.data
}

export const dismissAlertApi = async (alertId) => {
  const res = await api.delete(`/alerts/${alertId}`)
  return res.data
}
