import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { formatBRL } from '../../lib/money'
import { SERVICE_METRIC_INFO, type ServiceMetrics } from '../../lib/serviceMetrics'
import { InfoTip } from './InfoTip'

interface ServiceSummaryCardProps {
  /** null while loading or after an error: every value shows "—" and the bars stay empty. */
  metrics: ServiceMetrics | null
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, Math.max(0, (part / whole) * 100)) : 0)

/**
 * The five service metrics as one composition: the total on top, then two bars that show where it
 * stands (received vs. still to receive) and where it goes (expenses vs. what is left).
 */
export function ServiceSummaryCard({ metrics }: ServiceSummaryCardProps) {
  const { colors, isDark } = useTheme()
  const { isMobile } = useBreakpoint()
  const money = (v: number | undefined) => (metrics && v !== undefined ? formatBRL(v) : '—')

  const total = metrics?.total ?? 0
  const received = metrics ? Math.max(metrics.total - metrics.receivable, 0) : 0

  // Pale fill for "still pending" segments: the solid tone marks what is already real.
  const pending = isDark ? 'rgba(90,171,114,0.28)' : 'rgba(46,125,72,0.22)'

  return (
    <section
      aria-label="Resumo dos serviços"
      style={{
        position: 'relative',
        background: colors.bgCard,
        border: `1px solid ${colors.cardBorder}`, boxShadow: colors.cardShadow,
        borderRadius: radius.lg,
        padding: isMobile ? '18px 16px' : '22px 26px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-end',
          gap: isMobile ? '14px' : '24px',
          marginBottom: '22px',
        }}
      >
        <Figure metric="total" value={money(metrics?.total)} size={isMobile ? 30 : 36} />
        <Figure
          metric="netForecast"
          value={money(metrics?.netForecast)}
          size={isMobile ? 22 : 24}
          align={isMobile ? 'left' : 'right'}
        />
      </div>

      <Bar
        title="Recebimento"
        segments={[
          { value: pct(received, total), color: colors.income },
          { value: pct(metrics?.receivable ?? 0, total), color: pending },
        ]}
      />
      <Legend
        items={[
          { swatch: colors.income, label: 'Recebido', value: money(metrics ? received : undefined) },
          { swatch: pending, metric: 'receivable', value: money(metrics?.receivable), strong: true },
          { metric: 'consolidated', value: money(metrics?.consolidated) },
        ]}
      />

      <div style={{ height: '18px' }} />

      <Bar
        title="Para onde vai"
        segments={[
          { value: pct(metrics?.expenses ?? 0, total), color: colors.expense },
          { value: pct(Math.max(metrics?.netForecast ?? 0, 0), total), color: pending },
        ]}
      />
      <Legend
        items={[
          { swatch: colors.expense, metric: 'expenses', value: money(metrics?.expenses) },
          { swatch: pending, label: 'Sobra', value: money(metrics ? Math.max(metrics.netForecast, 0) : undefined) },
        ]}
      />
    </section>
  )
}

function Label({ metric, text }: { metric?: keyof ServiceMetrics; text?: string }) {
  const { colors } = useTheme()
  const label = metric ? SERVICE_METRIC_INFO[metric].label : text
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.textSecondary }}>
      {label}
      {metric && <InfoTip label={SERVICE_METRIC_INFO[metric].label} text={SERVICE_METRIC_INFO[metric].info} />}
    </span>
  )
}

function Figure({
  metric,
  value,
  size,
  align = 'left',
}: {
  metric: keyof ServiceMetrics
  value: string
  size: number
  align?: 'left' | 'right'
}) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start', gap: '4px', minWidth: 0 }}>
      <Label metric={metric} />
      <span
        style={{
          fontSize: `${size}px`,
          fontWeight: 600,
          color: colors.textPrimary,
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function Bar({ title, segments }: { title: string; segments: { value: number; color: string }[] }) {
  const { colors } = useTheme()
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 500, color: colors.textSecondary, marginBottom: '8px' }}>{title}</div>
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          height: '10px',
          borderRadius: radius.full,
          background: colors.bgCardElevated,
          overflow: 'hidden',
          gap: '2px',
        }}
      >
        {segments
          .filter((s) => s.value > 0)
          .map((s, i) => (
            <div key={i} style={{ width: `${s.value}%`, background: s.color }} />
          ))}
      </div>
    </div>
  )
}

interface LegendItem {
  swatch?: string
  metric?: keyof ServiceMetrics
  label?: string
  value: string
  strong?: boolean
}

function Legend({ items }: { items: LegendItem[] }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', marginTop: '10px' }}>
      {items.map((item) => (
        <div key={item.metric ?? item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
          {item.swatch && (
            <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.swatch, flexShrink: 0 }} />
          )}
          <Label metric={item.metric} text={item.label} />
          <span
            style={{
              fontSize: '14px',
              fontWeight: item.strong ? 600 : 500,
              color: item.strong ? colors.accentGreenBright : colors.textPrimary,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
