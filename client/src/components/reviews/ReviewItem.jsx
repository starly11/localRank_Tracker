import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

export default function ReviewItem({ review, timeText, compact = false }) {
  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-surface/50 p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-text-primary">{review.authorName}</p>
          <p className="text-amber-300">{'★'.repeat(Math.max(1, Number(review.rating) || 1))}</p>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{review.text || 'No review text provided.'}</p>
        <p className="mt-2 text-xs text-text-secondary">{timeText}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.authorPhotoUrl} />
            <AvatarFallback className="bg-accent/30 text-xs">{initials(review.authorName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{review.authorName}</CardTitle>
            {review.businessName ? <p className="text-xs text-text-secondary">{review.businessName}</p> : null}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-amber-300">{'★'.repeat(Math.max(1, Number(review.rating) || 1))}</p>
          <p className="text-xs text-text-secondary">{Number(review.rating || 0).toFixed(1)}</p>
          <p className="text-xs text-text-secondary">{timeText}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-text-secondary">{review.text || 'No review text provided.'}</p>
      </CardContent>
    </Card>
  )
}
