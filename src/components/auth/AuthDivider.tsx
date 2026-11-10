import { useTheme } from '../../context/ThemeContext'

/** "ou" divider between the Google button and the email form. */
export function AuthDivider() {
  const { colors } = useTheme()
  const line = { flex: 1, height: '1px', background: colors.border }

  return (
    <div
      role="separator"
      aria-label="ou"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}
    >
      <span style={line} />
      <span style={{ fontSize: '12px', color: colors.textMuted }}>ou</span>
      <span style={line} />
    </div>
  )
}
