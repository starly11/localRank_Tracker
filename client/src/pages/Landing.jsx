import { Link } from 'react-router-dom'
import { Bell, Building2, ChartLine, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const benefits = [
  'Monitor rating changes daily before they hurt conversions',
  'Catch negative reviews quickly and respond faster',
  'Track multi-location reputation from a single dashboard',
  'Get trend charts, alerts, and weekly performance digests',
]

const features = [
  {
    icon: Building2,
    title: 'Track Multiple Businesses',
    text: 'Monitor ratings and review volume for every location from one dashboard.',
  },
  {
    icon: ChartLine,
    title: 'Trend Analytics',
    text: 'See 30/90 day rating movement and monthly changes in one place.',
  },
  {
    icon: Star,
    title: 'Review Insights',
    text: 'Filter, search, and inspect customer reviews with fast pagination.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    text: 'Get notified about rating drops and negative feedback immediately.',
  },
]

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(139,92,246,0.28),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(124,58,237,0.2),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.1),transparent_40%)]" />

      <div className="page-container relative z-10 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/30">
              LR
            </div>
            <p className="text-sm font-medium text-text-secondary">Local Rank Tracker</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto mt-16 max-w-5xl">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="text-balance text-4xl font-semibold sm:text-5xl">Track Your Google Reviews in Real-Time</h1>
              <ul className="mt-5 space-y-2 text-sm text-text-secondary">
                {benefits.map((item) => (
                  <li key={item} className="inline-flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Button asChild size="lg">
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/help">How it works</Link>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Dashboard Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded bg-surface-hover p-2 text-xs">Rating 4.6</div>
                    <div className="rounded bg-surface-hover p-2 text-xs">Reviews 324</div>
                    <div className="rounded bg-surface-hover p-2 text-xs">+0.2 MoM</div>
                  </div>
                  <div className="mt-3 h-28 rounded bg-[linear-gradient(120deg,#1f2937,#111827)]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="inline-flex items-center gap-2 text-lg">
                    <Icon className="size-5 text-accent" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-text-secondary">{feature.text}</CardContent>
              </Card>
            )
          })}
        </section>

        <footer className="mt-10 border-t border-border pt-6 text-sm text-text-secondary">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Local Rank Tracker</p>
            <div className="flex items-center gap-4">
              <a href="mailto:support@localranktracker.dev" className="hover:text-text-primary">Contact</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-text-primary">GitHub</a>
              <Link to="/help" className="hover:text-text-primary">Help</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
