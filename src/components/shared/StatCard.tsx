import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { InfoTip } from './InfoTip'

interface StatCardProps {
  label: string
  value: string
  accent?: boolean
  sub?: React.ReactNode
  /** Plain-language explanation shown in a tooltip next to the label. */
  info?: string
  /** Custom icon; `null` hides the icon box; omitted keeps the up/down arrow. */
  icon?: React.ReactNode | null
  /** Font size of the value in px (default 36). */
  valueSize?: number
}

export function StatCard({ label, value, accent, sub, info, icon, valueSize = 36 }: StatCardProps) {
  const { colors, isDark } = useTheme()
  const showIcon = icon !== null

  return (
    <div style={{
      position: 'relative',
      background: accent
        ? isDark
          ? `linear-gradient(145deg, #1e3d2a 0%, #0f2318 100%)`
          : `linear-gradient(145deg, #d8eddf 0%, #c2e0cc 100%)`
        : colors.bgCard,
      border: `1px solid ${accent ? 'rgba(90,171,114,0.2)' : colors.border}`,
      borderRadius: radius.lg,
      padding: '24px 26px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
        {showIcon && (
          <div style={{
            width: '32px', height: '32px', borderRadius: radius.sm, flexShrink: 0,
            background: accent ? 'rgba(90,171,114,0.2)' : colors.bgCardElevated,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon ?? (accent ? <ArrowUpIcon /> : <ArrowDownIcon />)}
          </div>
        )}
        <span style={{ fontSize: '16px', color: colors.textSecondary, fontWeight: 600, minWidth: 0 }}>{label}</span>
        {info && <InfoTip label={label} text={info} />}
      </div>
      <div style={{
        fontSize: `${valueSize}px`, fontWeight: 700, color: colors.textPrimary,
        letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums',
        overflowWrap: 'anywhere',
      }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: spacing.sm }}>{sub}</div>}
    </div>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 9.5V2.5M6 2.5L3 5.5M6 2.5l3 3" stroke="#5aab72" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2.5v7M6 9.5L3 6.5M6 9.5l3-3" stroke="#e05c5c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
