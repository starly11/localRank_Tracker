import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ServerError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-text-primary">
      <div className="max-w-md text-center">
        <p className="text-sm text-text-secondary">500</p>
        <h1 className="mt-2 text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Please try again. If this keeps happening, contact support at zynoochic.starly@gmail.com
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
