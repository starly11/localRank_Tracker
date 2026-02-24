import { useQuery } from '@tanstack/react-query'
import { getDashboardApi } from '@/api/businessApi'

export const useDashboardData = (businessId = 'all') => {
  return useQuery({
    queryKey: ['dashboard', businessId],
    queryFn: () => getDashboardApi({ businessId }),
  })
}
