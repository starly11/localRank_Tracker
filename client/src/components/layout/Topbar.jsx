import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Topbar({ title, unreadAlertsCount = 0, actions }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-border bg-background/80 backdrop-blur-xl lg:left-60">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-semibold sm:text-2xl">{title}</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/alerts"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary ui-transition hover:text-text-primary"
          >
            <Bell className="size-4" />
            {unreadAlertsCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                {unreadAlertsCount}
              </span>
            ) : null}
          </Link>
          {actions}
        </div>
      </div>
    </header>
  )
}
