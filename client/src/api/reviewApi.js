import { api } from './axios'

export const getReviewsApi = async (params) => {
  const res = await api.get('/reviews', { params })
  return res.data?.data
}
