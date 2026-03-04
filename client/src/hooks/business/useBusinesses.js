import { useQuery } from '@tanstack/react-query'
import { getBusinessesApi } from '@/api/businessApi'

export const useBusinesses = ({ includeDemo = true } = {}) => {
  return useQuery({
    queryKey: ['businesses', { includeDemo }],
    queryFn: () => getBusinessesApi({ includeDemo }),
  })
}
