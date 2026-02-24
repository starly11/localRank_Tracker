import { api } from './axios'

export const getBusinessesApi = async () => {
  const res = await api.get('/businesses')
  return res.data?.data || []
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
  const res = await api.get('/businesses/dashboard', {
    params: { businessId },
  })
  return res.data?.data
}

export const refreshBusinessApi = async ({ businessId, force = false }) => {
  const res = await api.post(`/businesses/${businessId}/refresh`, null, {
    params: { force },
  })
  return {
    data: res.data?.data,
    message: res.data?.message,
    skipped: Boolean(res.data?.skipped),
  }
}
