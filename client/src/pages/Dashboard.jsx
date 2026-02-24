import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, ChevronRight, Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { useDashboardData } from '@/hooks/business/useDashboardData'
import { useRefreshBusiness } from '@/hooks/business/useRefreshBusiness'
import AppShell from '@/components/layout/AppShell'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatCard from '@/components/dashboard/StatCard'
import TrendChart from '@/components/charts/TrendChart'
import DistributionChart from '@/components/charts/DistributionChart'
import ReviewItem from '@/components/reviews/ReviewItem'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const trendRanges = [
  { key: '30d', label: '30 Days', days: 30 },
  { key: '90d', label: '90 Days', days: 90 },
  { key: 'all', label: 'All Time', days: null },
]

const chartColors = {
  positive: '#27C48F',
  neutral: '#F4B942',
  negative: '#FF6B6B',
}

const formatRelativeTime = (value) => {
  if (!value) return 'Never'
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialBusinessId = searchParams.get('businessId') || 'all'

  const [selectedBusinessId, setSelectedBusinessId] = useState(initialBusinessId)
  const [selectedTrendRange, setSelectedTrendRange] = useState('30d')

  const { data, isLoading } = useDashboardData(selectedBusinessId)
  const { mutate: refreshBusiness, isPending: isRefreshing } = useRefreshBusiness()

  const filteredTrend = useMemo(() => {
    const points = data?.trend || []
    const selectedRange = trendRanges.find((range) => range.key === selectedTrendRange)
    if (!selectedRange || !selectedRange.days) return points

    const start = new Date()
    start.setDate(start.getDate() - selectedRange.days)
    return points.filter((point) => new Date(point.date) >= start)
  }, [data?.trend, selectedTrendRange])

  const handleRefreshNow = () => {
    if (!selectedBusinessId || selectedBusinessId === 'all') {
      toast.error('Select a specific business to refresh')
      return
    }

    refreshBusiness(
      { businessId: selectedBusinessId, force: true },
      {
        onSuccess: (result) => {
          if (result?.skipped) {
            toast(result?.message || 'Using cached data')
            return
          }
          toast.success(result?.message || 'Business data refreshed')
        },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to refresh business')
      },
      }
    )
  }

  if (isLoading) return <LoadingSpinner />

  const businesses = data?.businesses || []
  const stats = data?.stats || {}
  const recentReviews = data?.recentReviews || []
  const distribution = data?.distribution || []

  return (
    <AppShell
      title="Dashboard"
      topbarActions={
        <Button onClick={() => navigate('/onboarding')}>
          <Plus className="size-4" />
          Add Business
        </Button>
      }
    >
      {!businesses.length ? (
        <EmptyState
          icon={<Building2 className="size-6 text-text-secondary" />}
          title="No businesses tracked yet"
          description="Add your first business to start monitoring your reviews"
          action={
            <Button onClick={() => navigate('/onboarding')}>
              <Plus className="size-4" /> Add Your First Business
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {businesses.length > 1 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="h-10 min-w-64 rounded-md border border-border bg-surface px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    value={selectedBusinessId}
                    onChange={(event) => setSelectedBusinessId(event.target.value)}
                  >
                    <option value="all">All Businesses</option>
                    {businesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                  <Badge variant="outline" className="border-border bg-surface px-3 py-1 text-text-secondary">
                    {selectedBusinessId === 'all' ? 'All Businesses' : 'Single Business'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              value={`${Number(stats.currentRating || 0).toFixed(1)} ★`}
              label="Current Rating"
              footer={`Based on ${stats.totalReviews || 0} reviews`}
            />
            <StatCard value={`${stats.totalReviews || 0}`} label="Total Reviews" footer={<span className="text-success">+{stats.weeklyReviews || 0} this week</span>} />
            <StatCard
              value={`${Number(stats.monthlyChange || 0) >= 0 ? '+' : ''}${Number(stats.monthlyChange || 0).toFixed(1)}`}
              label="vs Last Month"
              valueClassName={Number(stats.monthlyChange || 0) >= 0 ? 'text-success' : 'text-danger'}
              footer={`${Number(stats.monthlyPreviousRating || 0).toFixed(1)} → ${Number(stats.monthlyCurrentRating || 0).toFixed(1)}`}
            />
            <StatCard
              value={formatRelativeTime(stats.lastUpdated)}
              label="Last Updated"
              footer={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshNow}
                  disabled={isRefreshing || selectedBusinessId === 'all'}
                  className="px-0 text-xs"
                >
                  <RefreshCw className="size-3" /> Refresh Now
                </Button>
              }
            />
          </section>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-xl">Rating Trend</CardTitle>
              <div className="inline-flex rounded-md border border-border bg-surface p-1">
                {trendRanges.map((range) => (
                  <button
                    key={range.key}
                    type="button"
                    className={`rounded px-3 py-1.5 text-xs font-medium ui-transition ${
                      selectedTrendRange === range.key
                        ? 'bg-accent text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    onClick={() => setSelectedTrendRange(range.key)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <TrendChart points={filteredTrend} />
            </CardContent>
          </Card>

          <section className="grid gap-4 xl:grid-cols-[1fr_1.3fr]">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-56 overflow-y-auto">
                  <DistributionChart rows={distribution} colors={chartColors} />
                </div>
                <div className="space-y-2 text-sm">
                  {distribution.map((row) => (
                    <div key={row.star} className="flex items-center justify-between text-text-secondary">
                      <span>{row.star} stars</span>
                      <span className="font-medium text-text-primary">
                        {row.count} ({row.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {recentReviews.length === 0 ? (
                  <EmptyState
                    icon={<Building2 className="size-5 text-text-secondary" />}
                    title="No reviews available"
                    description="We're still fetching your reviews. Check back in a few minutes"
                  />
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <ReviewItem key={review.id} review={review} compact timeText={formatRelativeTime(review.publishedAt)} />
                    ))}

                    <Link
                      to={selectedBusinessId === 'all' ? '/reviews' : `/reviews/${selectedBusinessId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-accent ui-transition hover:text-accent-hover"
                    >
                      View All Reviews
                      <ChevronRight className="size-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </AppShell>
  )
}
