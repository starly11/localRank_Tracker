import { Link } from 'react-router-dom'
import { CircleHelp, MapPinned } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Help() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="page-container py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Help Center</h1>
          <Button asChild variant="outline">
            <Link to="/">Back Home</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <MapPinned className="size-5 text-accent" />
                How to find Google Place ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-text-secondary">
              <p>1. Search your business on Google Maps.</p>
              <p>2. Click Share.</p>
              <p>3. Copy the URL and paste it in onboarding or Add Business form.</p>
              <p>4. You can also paste direct Place IDs that start with <strong className="text-text-primary">ChIJ</strong>.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2">
                <CircleHelp className="size-5 text-accent" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-text-secondary">
              <div>
                <p className="font-medium text-text-primary">What does this track?</p>
                <p>Google rating, review counts, review text, trend snapshots, and alerts.</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">How often does it refresh?</p>
                <p>Manual refresh is available anytime, but API calls are cached to protect quota. Daily cron refresh runs at midnight UTC.</p>
              </div>
              <div>
                <p className="font-medium text-text-primary">Why are charts empty?</p>
                <p>Charts need at least one snapshot/review set. Add business and run one refresh to seed initial data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
