import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsForm({ title, children }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
