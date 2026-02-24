import { useQuery } from '@tanstack/react-query'
import { getUnreadAlertsCountApi } from '@/api/alertApi'

export const useUnreadAlertsCount = () => {
  return useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: getUnreadAlertsCountApi,
  })
}
