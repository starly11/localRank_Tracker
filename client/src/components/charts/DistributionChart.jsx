export default function DistributionChart({ rows, colors }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const color = row.star >= 4 ? colors.positive : row.star === 3 ? colors.neutral : colors.negative
        const rawPercent = Number(row.percent) || 0
        const widthPercent = rawPercent > 0 ? Math.max(5, Math.min(100, rawPercent)) : 0
        return (
          <div key={row.star} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{row.star}★</span>
              <span>{row.count}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-hover">
              <div className="h-2 rounded-full transition-all" style={{ width: `${widthPercent}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
