import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Bell, Lock, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import {
  changePasswordApi,
  deleteAccountApi,
  logoutApi,
  updateNotificationSettingsApi,
  updateProfileApi,
} from '@/api/authApi'
import AppShell from '@/components/layout/AppShell'
import ConfirmModal from '@/components/common/ConfirmModal'
import SettingsForm from '@/components/forms/SettingsForm'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'account', label: 'Account', icon: AlertTriangle },
]

export default function Settings() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.logout)

  const [activeTab, setActiveTab] = useState('profile')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [profileValues, setProfileValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  })

  const initialSettings = useMemo(
    () => ({
      ratingDropAlerts: user?.settings?.ratingDropAlerts ?? true,
      negativeReviewAlerts: user?.settings?.negativeReviewAlerts ?? true,
      weeklyDigest: user?.settings?.weeklyDigest ?? true,
      dailySummary: user?.settings?.dailySummary ?? false,
      notificationFrequency: user?.settings?.notificationFrequency || 'daily',
    }),
    [user]
  )

  const [notificationSettings, setNotificationSettings] = useState(initialSettings)

  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.setQueryData(['auth', 'me'], updatedUser)
      toast.success('Profile updated')
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to update profile'),
  })

  const { mutate: saveNotifications, isPending: isSavingNotifications } = useMutation({
    mutationFn: updateNotificationSettingsApi,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.setQueryData(['auth', 'me'], updatedUser)
      toast.success('Notification preferences saved')
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to save preferences'),
  })

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      setPasswordValues({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated')
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to update password'),
  })

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: () => deleteAccountApi('DELETE'),
    onSuccess: async () => {
      try {
        await logoutApi()
      } catch {
        // cookie may already be cleared server-side
      }
      clearUser()
      queryClient.clear()
      toast.success('Account deleted')
      navigate('/', { replace: true })
    },
    onError: (error) => toast.error(error?.response?.data?.message || 'Failed to delete account'),
  })

  const handlePasswordSubmit = (event) => {
    event.preventDefault()

    if (passwordValues.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    updatePassword({
      currentPassword: passwordValues.currentPassword,
      newPassword: passwordValues.newPassword,
    })
  }

  return (
    <AppShell title="Settings">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <SettingsForm title="Sections">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ui-transition ${
                    activeTab === tab.key
                      ? 'bg-accent/20 text-text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </SettingsForm>

        {activeTab === 'profile' ? (
          <SettingsForm title="Profile Settings">
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture URL</Label>
              <Input
                id="avatar"
                placeholder="https://..."
                value={profileValues.avatar}
                onChange={(event) => setProfileValues((prev) => ({ ...prev, avatar: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={profileValues.name}
                onChange={(event) => setProfileValues((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileValues.email}
                onChange={(event) => setProfileValues((prev) => ({ ...prev, email: event.target.value }))}
              />
              <p className="text-xs text-text-secondary">This is your login email</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setProfileValues({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' })}
              >
                Cancel
              </Button>
              <Button onClick={() => saveProfile(profileValues)} disabled={isSavingProfile}>
                Save Changes
              </Button>
            </div>
          </SettingsForm>
        ) : null}

        {activeTab === 'notifications' ? (
          <SettingsForm title="Notification Preferences">
            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notificationSettings.ratingDropAlerts}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, ratingDropAlerts: event.target.checked }))
                  }
                />
                <span>
                  <span className="block font-medium text-text-primary">Rating drop alerts</span>
                  <span className="text-text-secondary">Notify me when rating drops ≥0.1</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notificationSettings.negativeReviewAlerts}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, negativeReviewAlerts: event.target.checked }))
                  }
                />
                <span>
                  <span className="block font-medium text-text-primary">New negative reviews</span>
                  <span className="text-text-secondary">Notify me of reviews ≤3 stars</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notificationSettings.weeklyDigest}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, weeklyDigest: event.target.checked }))
                  }
                />
                <span>
                  <span className="block font-medium text-text-primary">Weekly digest</span>
                  <span className="text-text-secondary">Send summary every Monday</span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notificationSettings.dailySummary}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, dailySummary: event.target.checked }))
                  }
                />
                <span>
                  <span className="block font-medium text-text-primary">Daily summary</span>
                  <span className="text-text-secondary">Send summary every morning</span>
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Frequency</p>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="radio"
                  name="frequency"
                  value="realtime"
                  checked={notificationSettings.notificationFrequency === 'realtime'}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, notificationFrequency: event.target.value }))
                  }
                />
                Real-time
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={notificationSettings.notificationFrequency === 'daily'}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, notificationFrequency: event.target.value }))
                  }
                />
                Daily digest
              </label>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={notificationSettings.notificationFrequency === 'weekly'}
                  onChange={(event) =>
                    setNotificationSettings((prev) => ({ ...prev, notificationFrequency: event.target.value }))
                  }
                />
                Weekly digest
              </label>
            </div>

            <Button onClick={() => saveNotifications(notificationSettings)} disabled={isSavingNotifications}>
              Save Preferences
            </Button>
          </SettingsForm>
        ) : null}

        {activeTab === 'security' ? (
          <SettingsForm title="Security Settings">
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              {String(user?.provider || '').toLowerCase() === 'google' ? (
                <div className="rounded-md border border-amber-400/50 bg-amber-400/10 p-3 text-sm text-amber-100">
                  You are logged in with a Google account.
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordValues.currentPassword}
                  onChange={(event) =>
                    setPasswordValues((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordValues.newPassword}
                  onChange={(event) => setPasswordValues((prev) => ({ ...prev, newPassword: event.target.value }))}
                />
                <p className="text-xs text-text-secondary">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordValues.confirmPassword}
                  onChange={(event) =>
                    setPasswordValues((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                />
              </div>

              <Button type="submit" disabled={isUpdatingPassword}>
                Update Password
              </Button>
            </form>

            <div className="rounded-lg border border-border bg-surface/50 p-4">
              <p className="text-sm font-medium text-text-primary">Active Sessions</p>
              <div className="mt-3 space-y-3 text-sm text-text-secondary">
                <div className="rounded-md border border-border bg-surface p-3">
                  <p className="font-medium text-text-primary">Current browser session</p>
                  <p>Protected with JWT cookie</p>
                  <Button size="sm" variant="ghost" className="mt-2" disabled>
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </SettingsForm>
        ) : null}

        {activeTab === 'account' ? (
          <SettingsForm title="Account Management">
            <div className="rounded-lg border border-danger/40 bg-danger/5 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
                <Shield className="size-4" /> Danger Zone
              </p>
              <div className="mt-3 space-y-3 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">Delete Account</p>
                <p>
                  This action cannot be undone. All your data will be permanently deleted including:
                </p>
                <ul className="list-disc pl-5">
                  <li>All tracked businesses</li>
                  <li>Historical review data</li>
                  <li>All alerts and notifications</li>
                </ul>
                <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete My Account
                </Button>
              </div>
            </div>
          </SettingsForm>
        ) : null}
      </div>

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Account?"
        description="Are you absolutely sure? This action CANNOT be undone."
        requireText="DELETE"
        confirmLabel="Delete Forever"
        confirmVariant="destructive"
        isPending={isDeletingAccount}
        onConfirm={() => deleteAccount()}
      />
    </AppShell>
  )
}
