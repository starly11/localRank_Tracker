import { api } from './axios'
import { getDemoReviews, isDemoBusinessId, isDemoModeEnabled } from '@/demo/mockData'

export const getReviewsApi = async (params) => {
  const businessId = params?.businessId || 'all'

  if (isDemoModeEnabled() && (businessId === 'all' || isDemoBusinessId(businessId))) {
    return getDemoReviews(params)
  }

  try {
    const res = await api.get('/reviews', { params })
    return res.data?.data
  } catch (error) {
    if (error?.response?.status === 401) throw error
    if (isDemoModeEnabled()) return getDemoReviews({ ...params, businessId: 'all' })
    throw error
  }
}
