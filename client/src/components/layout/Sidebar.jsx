import { Bell, LayoutDashboard, LogOut, Settings, Star, Store } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/businesses', label: 'Businesses', icon: Store },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export default function Sidebar({ unreadAlertsCount = 0, onLogout }) {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-surface/90 px-4 py-5 backdrop-blur-xl lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-semibold shadow-lg shadow-accent/30">
          LR
        </div>
        <div>
          <p className="text-sm font-semibold">Local Rank Tracker</p>
          <p className="text-xs text-text-secondary">Insights Hub</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ui-transition ${
                isActive
                  ? 'bg-accent/20 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {item.label}
              </span>
              {item.to === '/alerts' && unreadAlertsCount > 0 ? (
                <Badge className="rounded-full bg-danger/90 px-2 py-0 text-[11px] text-white">{unreadAlertsCount}</Badge>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 border-t border-border pt-5">
        <div className="flex items-center gap-3 px-2">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-accent/30 text-xs font-semibold text-text-primary">
              {getInitials(user?.name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name || 'User'}</p>
            <p className="truncate text-xs text-text-secondary">{user?.email || '-'}</p>
          </div>
        </div>

        <Button variant="ghost" className="mt-3 w-full justify-start" onClick={onLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
