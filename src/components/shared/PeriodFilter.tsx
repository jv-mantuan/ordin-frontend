import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { PERIOD_OPTIONS, REVERSED_PERIOD_MESSAGE, type Period, type PeriodPreset } from '../../lib/period'

interface PeriodFilterProps {
  value: Period
  onChange: (period: Period) => void
  /** The custom range is reversed (from after to): show why it is not applied. */
  invalid: boolean
}

/** Period picker: presets in a native select (good on phones), plus from/to dates for "Personalizado". */
export function PeriodFilter({ value, onChange, invalid }: PeriodFilterProps) {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()

  const control: React.CSSProperties = {
    minHeight: isMobile ? '44px' : '36px',
    padding: '0 12px',
    borderRadius: radius.md,
    border: `1px solid ${invalid ? colors.expense : colors.border}`,
    background: colors.bgCard,
    color: colors.textPrimary,
    fontSize: '13px',
    fontFamily: 'inherit',
    colorScheme: 'dark light',
  }
  const label: React.CSSProperties = { fontSize: '12px', color: colors.textSecondary }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '10px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: isMobile ? '1 1 100%' : undefined }}>
          <span style={label}>Período</span>
          <select
            className="period-control"
            value={value.preset}
            onChange={(e) => onChange({ ...value, preset: e.target.value as PeriodPreset })}
            style={{ ...control, border: `1px solid ${colors.border}`, cursor: 'pointer' }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {value.preset === 'custom' && (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: isMobile ? '1 1 0' : undefined }}>
              <span style={label}>De</span>
              <input
                type="date"
                className="period-control"
                value={value.from}
                onChange={(e) => onChange({ ...value, from: e.target.value })}
                aria-invalid={invalid}
                style={control}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: isMobile ? '1 1 0' : undefined }}>
              <span style={label}>Até</span>
              <input
                type="date"
                className="period-control"
                value={value.to}
                onChange={(e) => onChange({ ...value, to: e.target.value })}
                aria-invalid={invalid}
                style={control}
              />
            </label>
          </>
        )}
      </div>
      {invalid && (
        <span role="alert" style={{ fontSize: '12px', color: colors.expense }}>
          {REVERSED_PERIOD_MESSAGE}
        </span>
      )}
      <style>{`
        .period-control:focus-visible { outline: 2px solid ${colors.accentGreenBright}; outline-offset: 1px; }
        .period-control:hover { border-color: ${colors.accentGreenMuted}; }
      `}</style>
    </div>
  )
}
