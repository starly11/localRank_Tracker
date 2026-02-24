import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleHelp, ExternalLink, Loader2, MapPinned } from 'lucide-react'
import toast from 'react-hot-toast'

import { useBusinesses } from '@/hooks/business/useBusinesses'
import { useAddBusiness } from '@/hooks/business/useAddBusiness'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Onboarding() {
  const navigate = useNavigate()
  const { data: businesses = [], isLoading: isCheckingBusinesses } = useBusinesses()
  const { mutate, isPending } = useAddBusiness()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      businessName: '',
      placeInput: '',
    },
  })

  useEffect(() => {
    if (!isCheckingBusinesses && businesses.length > 0) {
      navigate('/dashboard', { replace: true })
    }
  }, [businesses.length, isCheckingBusinesses, navigate])

  const onSubmit = (values) => {
    mutate(values, {
      onSuccess: () => {
        toast.success('Business added successfully')
        navigate('/dashboard', { replace: true })
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || 'Failed to add business')
      },
    })
  }

  if (isCheckingBusinesses) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-accent" />
      </div>
    )
  }

  if (businesses.length > 0) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(139,92,246,0.28),transparent_35%),radial-gradient(circle_at_90%_5%,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_55%_80%,rgba(34,197,94,0.09),transparent_35%)]" />

      <div className="page-container relative z-10 py-8 sm:py-10">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-text-primary shadow-lg shadow-accent/30">
              LR
            </div>
            <span className="text-sm font-medium tracking-wide text-text-secondary">Local Rank Tracker</span>
          </div>
          <Button variant="link" className="px-0" onClick={() => navigate('/dashboard')}>
            Skip for now
          </Button>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-semibold text-text-primary sm:text-4xl">
            Let&apos;s add your first business
          </h1>
          <p className="mt-3 text-pretty text-base text-text-secondary sm:text-xl">
            Track your Google reviews in real-time
          </p>
        </div>

        <Card className="mx-auto mt-8 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Add Business</CardTitle>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Joe's Coffee Shop"
                  {...register('businessName', {
                    required: 'Business name is required',
                    minLength: {
                      value: 2,
                      message: 'Business name is required',
                    },
                  })}
                />
                {errors.businessName && <p className="text-xs text-danger">{errors.businessName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeInput">Google Place ID or URL *</Label>
                <Input
                  id="placeInput"
                  placeholder="Paste Google Maps link or Place ID"
                  {...register('placeInput', {
                    required: 'Please provide a valid Google Maps URL',
                    validate: (value) => {
                      const input = String(value || '').trim()
                      return (
                        input.includes('maps.google') ||
                        input.includes('maps.app.goo.gl') ||
                        input.startsWith('ChIJ') ||
                        'Please provide a valid Google Maps URL'
                      )
                    },
                  })}
                />
                {errors.placeInput && <p className="text-xs text-danger">{errors.placeInput.message}</p>}
                <p className="inline-flex items-center gap-2 text-xs text-text-secondary">
                  <CircleHelp className="size-4" />
                  Find this by sharing your business on Google Maps
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Fetching data...
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mx-auto mt-8 w-full max-w-2xl rounded-xl border border-border/70 bg-surface/40 p-5">
          <h2 className="text-sm font-semibold text-text-primary">How to find your Google Place ID:</h2>
          <ul className="mt-3 space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <MapPinned className="mt-0.5 size-4 text-accent" />
              <span>Search your business on Google Maps</span>
            </li>
            <li className="flex items-start gap-2">
              <ExternalLink className="mt-0.5 size-4 text-accent" />
              <span>Click the Share button</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-accent" />
              <span>Copy the link and paste it above</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-text-secondary">
            You can also paste a direct Place ID that starts with <span className="font-medium text-text-primary">ChIJ</span>.
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            Need help?{' '}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent hover:text-accent-hover"
            >
              Open Google Maps
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
