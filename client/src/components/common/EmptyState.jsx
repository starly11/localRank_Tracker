export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-10 text-center">
      {icon ? <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface">{icon}</div> : null}
      <p className="text-lg font-semibold text-text-primary">{title}</p>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
