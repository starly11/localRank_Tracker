import { api } from './axios'
import {
  getDemoBusinesses,
  getDemoDashboardData,
  isDemoBusinessId,
  isDemoModeEnabled,
} from '@/demo/mockData'

const mergeBusinesses = (realBusinesses = []) => {
  const demoBusinesses = getDemoBusinesses()
  const map = new Map()
  for (const item of [...demoBusinesses, ...realBusinesses]) {
    map.set(String(item._id), item)
  }
  return Array.from(map.values())
}

export const getBusinessesApi = async ({ includeDemo = true } = {}) => {
  try {
    const res = await api.get('/businesses')
    const realBusinesses = res.data?.data || []
    if (!includeDemo || !isDemoModeEnabled()) return realBusinesses
    return mergeBusinesses(realBusinesses)
  } catch (error) {
    if (error?.response?.status === 401) throw error
    if (includeDemo && isDemoModeEnabled()) return getDemoBusinesses()
    throw error
  }
}

export const addBusinessApi = async (payload) => {
  const res = await api.post('/businesses', payload)
  return res.data?.data
}

export const updateBusinessApi = async ({ businessId, businessName }) => {
  const res = await api.patch(`/businesses/${businessId}`, { businessName })
  return res.data?.data
}

export const deleteBusinessApi = async (businessId) => {
  const res = await api.delete(`/businesses/${businessId}`)
  return res.data
}

export const getDashboardApi = async ({ businessId = 'all' } = {}) => {
  if (isDemoModeEnabled() && (businessId === 'all' || isDemoBusinessId(businessId))) {
    return getDemoDashboardData({ businessId })
  }

  try {
    const res = await api.get('/businesses/dashboard', {
      params: { businessId },
    })
    return res.data?.data
  } catch (error) {
    if (error?.response?.status === 401) throw error
    if (isDemoModeEnabled()) return getDemoDashboardData({ businessId: 'all' })
    throw error
  }
}

export const refreshBusinessApi = async ({ businessId, force = false }) => {
  if (isDemoModeEnabled() && isDemoBusinessId(businessId)) {
    return {
      data: null,
      message: 'Demo business data is static. Add a real business to show live fetching.',
      skipped: true,
    }
  }

  const res = await api.post(`/businesses/${businessId}/refresh`, null, {
    params: { force },
  })
  return {
    data: res.data?.data,
    message: res.data?.message,
    skipped: Boolean(res.data?.skipped),
  }
}
