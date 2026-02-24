import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addBusinessApi } from '@/api/businessApi'

export const useAddBusiness = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addBusinessApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
    },
  })
}
