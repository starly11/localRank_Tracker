import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { logoutApi } from '@/api/authApi'
import { useUnreadAlertsCount } from '@/hooks/alerts/useUnreadAlertsCount'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AppShell({ title, topbarActions, children }) {
  const navigate = useNavigate()
  const clearUser = useAuthStore((state) => state.logout)

  const { data: unreadAlertsCount = 0 } = useUnreadAlertsCount()

  const handleLogout = async () => {
    try {
      await logoutApi()
      clearUser()
      navigate('/login', { replace: true })
    } catch {
      toast.error('Logout failed, try again')
    }
  }

  return (
    <DashboardLayout
      title={title}
      topbarActions={topbarActions}
      unreadAlertsCount={unreadAlertsCount}
      onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  )
}
