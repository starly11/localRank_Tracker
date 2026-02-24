import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { getReviewsApi } from '@/api/reviewApi'
import AppShell from '@/components/layout/AppShell'
import EmptyState from '@/components/common/EmptyState'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ReviewItem from '@/components/reviews/ReviewItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
]

const formatRelativeTime = (value) => {
  if (!value) return 'Unknown'
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minutes ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

export default function Reviews() {
  const navigate = useNavigate()
  const { businessId: routeBusinessId } = useParams()

  const [businessFilterId, setBusinessFilterId] = useState('all')
  const [rating, setRating] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const businessId = routeBusinessId || businessFilterId

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', { businessId, rating, sortBy, search, page }],
    queryFn: () => getReviewsApi({ businessId, rating, sortBy, search, page, limit: 10 }),
  })

  const reviews = data?.items || []
  const pagination = data?.pagination || { page: 1, totalPages: 1 }
  const businesses = data?.businesses || []

  const clearFilters = () => {
    setBusinessFilterId('all')
    setRating('all')
    setSortBy('newest')
    setSearch('')
    setSearchInput('')
    setPage(1)
    navigate('/reviews')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <AppShell title="All Reviews" topbarActions={null}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 lg:grid-cols-[220px_180px_200px_1fr]">
            <select
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
              value={businessId}
              onChange={(event) => {
                const nextBusinessId = event.target.value
                setPage(1)
                if (routeBusinessId) {
                  navigate(nextBusinessId === 'all' ? '/reviews' : `/reviews/${nextBusinessId}`)
                  return
                }
                setBusinessFilterId(nextBusinessId)
                if (nextBusinessId === 'all') navigate('/reviews')
              }}
            >
              <option value="all">Business: All</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>

            <select
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
              value={rating}
              onChange={(event) => {
                setRating(event.target.value)
                setPage(1)
              }}
            >
              <option value="all">Rating: All</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>

            <select
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value)
                setPage(1)
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSearch(searchInput.trim())
                setPage(1)
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search reviews..."
                className="pl-10"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </form>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 space-y-4">
        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="size-5 text-text-secondary" />}
            title={search || rating !== 'all' ? 'No reviews found' : 'No reviews available'}
            description={
              search || rating !== 'all'
                ? 'Try adjusting your filters'
                : "We're still fetching your reviews. Check back in a few minutes"
            }
            action={
              search || rating !== 'all' ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : null
            }
          />
        ) : (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} timeText={formatRelativeTime(review.publishedAt)} />
          ))
        )}
      </div>

      {reviews.length > 0 ? (
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
