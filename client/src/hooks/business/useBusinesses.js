import { useQuery } from '@tanstack/react-query'
import { getBusinessesApi } from '@/api/businessApi'

export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinessesApi,
  })
}
