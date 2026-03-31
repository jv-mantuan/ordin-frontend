import { colors } from '../../theme'

interface BarChartProps {
  title: string
  expensesByDate: ExpenseByMonth[]
}

export interface ExpenseByMonth {
  day: string
  value: number
}

export function BarChart({ title, expensesByDate }: BarChartProps) {
  const maxVal = Math.max(...expensesByDate.map((d) => d.value))
  const chartH = 310
  const barW = 28
  const gap = 54
  const totalW = 950

  const Y_LABELS = [...expensesByDate.map((d) => d.value)].sort((a, b) => b - a)

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '14px',
        padding: '22px 24px',
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: '20px',
          paddingBottom: '20px',
        }}
      >
        {title}
      </div>

      <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'stretch' }}>
        <div
          style={{
            position: 'relative',
            width: '48px',
            height: `${chartH}px`,
            flexShrink: 0,
          }}
        >
          {Y_LABELS.map((value, i) => {
            const y = chartH - (value / maxVal) * chartH

            return (
              <span
                key={`${value}-${i}`}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: `${y - 6}px`,
                  fontSize: '11px',
                  color: colors.textMuted,
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCurrency(value)}
              </span>
            )
          })}
        </div>

        <div style={{ flex: 1, overflowX: 'auto' }}>
          <svg width={totalW} height={chartH + 20} style={{ display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
              <line
                key={pct}
                x1={0}
                y1={pct * chartH}
                x2={totalW}
                y2={pct * chartH}
                stroke={colors.border}
                strokeWidth={1}
              />
            ))}

            {expensesByDate.map((d, i) => {
              const barH = (d.value / maxVal) * chartH
              const x = 20 + i * (barW + gap)
              const y = chartH - barH
              const isActive = i === 9

              return (
                <g key={d.day}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={barH}
                    rx={3}
                    fill={isActive ? colors.accentGreenBright : colors.accentGreenMuted}
                    opacity={isActive ? 1 : 0.75}
                  />
                  <text
                    x={x + barW / 2}
                    y={chartH + 14}
                    textAnchor="middle"
                    fontSize="11"
                    fill={colors.textMuted}
                  >
                    {formatDay(d.day)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

const formatDay = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, {
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value)
