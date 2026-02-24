import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ className = '', size = 'size-5', centered = true }) {
  const spinner = <Loader2 className={`${size} animate-spin text-accent ${className}`} />

  if (!centered) return spinner

  return <div className="flex min-h-screen items-center justify-center bg-background">{spinner}</div>
}
