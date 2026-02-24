import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ title, topbarActions, unreadAlertsCount = 0, onLogout, children }) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar unreadAlertsCount={unreadAlertsCount} onLogout={onLogout} />
      <Topbar title={title} unreadAlertsCount={unreadAlertsCount} actions={topbarActions} />
      <main className="px-4 pb-8 pt-20 sm:px-6 lg:ml-60">{children}</main>
    </div>
  )
}
