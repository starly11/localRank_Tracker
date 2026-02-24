import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
  dismissAlertApi,
  getAlertsApi,
  markAlertReadApi,
  markAllAlertsReadApi,
} from '@/api/alertApi'
import AppShell from '@/components/layout/AppShell'
import AlertItem from '@/components/alerts/AlertItem'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'rating_drop', label: 'Rating Drops' },
  { key: 'negative_review', label: 'Negative Reviews' },
]

const formatRelativeTime = (value) => {
  if (!value) return 'Unknown'
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Alerts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)

  const refreshAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['alerts', 'unread-count'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', tab, page],
    queryFn: () => getAlertsApi({ tab, page, limit: 10 }),
  })

  const { mutate: markRead } = useMutation({
    mutationFn: markAlertReadApi,
    onSuccess: refreshAlerts,
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to mark read'),
  })

  const { mutate: dismissAlert } = useMutation({
    mutationFn: dismissAlertApi,
    onSuccess: refreshAlerts,
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to dismiss alert'),
  })

  const { mutate: markAllRead, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAlertsReadApi,
    onSuccess: () => {
      toast.success('All alerts marked as read')
      refreshAlerts()
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to mark all as read'),
  })

  const alerts = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1 }
  const unreadCount = data?.unreadCount || 0

  if (isLoading) return <LoadingSpinner />

  return (
    <AppShell
      title="Alerts & Notifications"
      topbarActions={
        <Button variant="link" className="px-0" onClick={() => markAllRead()} disabled={isMarkingAll}>
          Mark all as read
        </Button>
      }
    >
      <div className="mb-4 inline-flex flex-wrap gap-2 rounded-md border border-border bg-surface p-1">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`rounded px-3 py-1.5 text-sm ui-transition ${
              tab === item.key ? 'bg-accent text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => {
              setTab(item.key)
              setPage(1)
            }}
          >
            {item.label}
            {item.key === 'unread' ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <EmptyState icon={<Bell className="size-8 text-text-secondary" />} title="No alerts yet" description="You're all caught up!" />
        ) : (
          alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              timeText={formatRelativeTime(alert.createdAt)}
              onViewDashboard={() => navigate(`/dashboard?businessId=${alert.businessId}`)}
              onViewReview={() => navigate(`/reviews/${alert.businessId}`)}
              onMarkRead={() => markRead(alert.id)}
              onDismiss={() => dismissAlert(alert.id)}
            />
          ))
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={pagination.page <= 1} onClick={() => setPage((prev) => prev - 1)}>
            Previous
          </Button>
          <p className="text-sm text-text-secondary">
            Page {pagination.page} of {Math.max(1, pagination.totalPages || 1)}
          </p>
          <Button
            variant="outline"
            disabled={pagination.page >= (pagination.totalPages || 1)}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </AppShell>
  )
}
