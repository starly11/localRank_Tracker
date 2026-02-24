import { useMutation, useQueryClient } from '@tanstack/react-query'
import { refreshBusinessApi } from '@/api/businessApi'

export const useRefreshBusiness = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: refreshBusinessApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
