const formatDateLabel = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

export default function TrendChart({ points, lineColor = '#7C9BFF', gridColor = '#2A3146' }) {
  if (!points?.length) {
    return <div className="flex h-full items-center justify-center text-sm text-text-secondary">No trend data</div>
  }

  const sortedPoints = [...points].sort((a, b) => new Date(a.date) - new Date(b.date))
  const normalizedPoints =
    sortedPoints.length >= 2
      ? sortedPoints
      : [
          {
            date: new Date(new Date(sortedPoints[0].date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
            rating: sortedPoints[0].rating,
          },
          sortedPoints[0],
        ]

  const width = 900
  const height = 280
  const padding = 28
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const getX = (index) =>
    normalizedPoints.length === 1 ? width / 2 : padding + (index / (normalizedPoints.length - 1)) * innerWidth
  const getY = (rating) => padding + ((5 - Math.min(5, Math.max(1, Number(rating) || 0))) / 4) * innerHeight

  const polyline = normalizedPoints.map((point, index) => `${getX(index)},${getY(point.rating)}`).join(' ')
  const areaPath = `${polyline} ${getX(normalizedPoints.length - 1)},${height - padding} ${getX(0)},${
    height - padding
  }`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {[1, 2, 3, 4, 5].map((tick) => (
        <line key={tick} x1={padding} y1={getY(tick)} x2={width - padding} y2={getY(tick)} stroke={gridColor} strokeDasharray="5 5" />
      ))}

      <path d={`M ${areaPath}`} fill={`${lineColor}22`} />
      <polyline fill="none" stroke={lineColor} strokeWidth="3" points={polyline} />

      {normalizedPoints.map((point, index) => (
        <g key={`${point.date}-${index}`}>
          <circle cx={getX(index)} cy={getY(point.rating)} r="4.5" fill="#A7BDFF" stroke={lineColor} strokeWidth="2" />
          {index % Math.max(1, Math.floor(normalizedPoints.length / 6)) === 0 || index === normalizedPoints.length - 1 ? (
            <text x={getX(index)} y={height - 4} fill="#8C8CA0" textAnchor="middle" fontSize="11">
              {formatDateLabel(point.date)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  )
}
