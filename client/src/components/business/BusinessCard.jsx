import { MapPin, MoreHorizontal, Phone, RefreshCw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const getInitial = (name = '') => name.trim().charAt(0).toUpperCase() || 'B'

export default function BusinessCard({ business, updatedText, onView, onEdit, onRefresh, onDelete }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/25 text-base font-semibold text-text-primary">
            {getInitial(business.businessName)}
          </div>
          <CardTitle className="text-xl">{business.businessName}</CardTitle>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit}>Edit Business Name</DropdownMenuItem>
            <DropdownMenuItem onClick={onRefresh}>
              <RefreshCw className="size-4" />
              Refresh Data Now
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger" onClick={onDelete}>
              <Trash2 className="size-4" />
              Delete Business
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p className="text-text-secondary">
          <span className="text-amber-300">★</span> {Number(business.currentRating || 0).toFixed(1)} • {business.totalReviews || 0} reviews
        </p>
        <p className="text-text-secondary">Last updated: {updatedText}</p>
        <div className="space-y-1 text-text-secondary">
          <p className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 size-4" />
            <span>{business.address || 'Address not available'}</span>
          </p>★
          <p className="inline-flex items-start gap-2">
            <Phone className="mt-0.5 size-4" />
            <span>{business.phone || 'Phone not available'}</span>
          </p>
        </div>

        <div className="pt-2">
          <Button variant="outline" onClick={onView}>
            View Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
