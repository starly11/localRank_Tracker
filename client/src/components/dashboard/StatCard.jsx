import { Card, CardContent } from '@/components/ui/card'

export default function StatCard({ value, label, footer, valueClassName = '' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className={`text-4xl font-semibold sm:text-5xl ${valueClassName}`}>{value}</p>
        <p className="mt-2 text-sm text-text-secondary">{label}</p>
        <div className="my-3 h-px bg-border" />
        <div className="text-xs text-text-secondary">{footer}</div>
      </CardContent>
    </Card>
  )
}
