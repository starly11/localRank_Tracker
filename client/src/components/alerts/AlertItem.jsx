import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const alertTypeMeta = (type) => {
  if (type === 'rating_drop') {
    return {
      icon: <TrendingDown className="size-5 text-danger" />,
      unreadBorder: 'border-l-danger',
      unreadBg: 'bg-danger/5',
    }
  }

  if (type === 'negative_review') {
    return {
      icon: <AlertTriangle className="size-5 text-amber-300" />,
      unreadBorder: 'border-l-amber-300',
      unreadBg: 'bg-amber-300/5',
    }
  }

  return {
    icon: <CheckCircle2 className="size-5 text-success" />,
    unreadBorder: 'border-l-success',
    unreadBg: 'bg-success/5',
  }
}

export default function AlertItem({ alert, timeText, onViewDashboard, onViewReview, onMarkRead, onDismiss }) {
  const typeMeta = alertTypeMeta(alert.type)

  return (
    <Card
      className={`border-l-4 ${
        alert.isRead ? 'border-l-transparent bg-surface/50 text-text-secondary' : `${typeMeta.unreadBorder} ${typeMeta.unreadBg}`
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          {typeMeta.icon}
          <div>
            <CardTitle className={`text-base ${alert.isRead ? 'font-medium' : 'font-semibold'}`}>{alert.title}</CardTitle>
            <p className="text-xs text-text-secondary">{timeText}</p>
          </div>
        </div>
        <Badge variant={alert.isRead ? 'outline' : 'default'}>{alert.isRead ? 'Read' : 'Unread'}</Badge>
      </CardHeader>
      <CardContent>
        <p className={`${alert.isRead ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>{alert.message}</p>
        <p className="mt-1 text-sm text-text-secondary">{alert.subtext}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {alert.actions.includes('view_dashboard') ? (
            <Button variant="outline" size="sm" onClick={onViewDashboard}>
              View Dashboard
            </Button>
          ) : null}

          {alert.actions.includes('view_review') ? (
            <Button variant="outline" size="sm" onClick={onViewReview}>
              View Review
            </Button>
          ) : null}

          {alert.actions.includes('mark_read') && !alert.isRead ? (
            <Button variant="ghost" size="sm" onClick={onMarkRead}>
              Mark as Read
            </Button>
          ) : null}

          {alert.actions.includes('dismiss') ? (
            <Button variant="ghost" size="sm" className="text-danger" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
