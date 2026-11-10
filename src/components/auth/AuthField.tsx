import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, error, type = 'text', ...rest },
  ref,
) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type
  const borderColor = error
    ? colors.expense
    : focused
      ? colors.accentGreenBright
      : colors.border

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textSecondary }}>{label}</span>

      <div style={{ position: 'relative', display: 'flex' }}>
        <input
          ref={ref}
          type={inputType}
          onFocus={() => setFocused(true)}
          {...rest}
          onBlur={(e) => {
            setFocused(false)
            rest.onBlur?.(e)
          }}
          style={{
            flex: 1,
            width: '100%',
            minHeight: '46px',
            padding: isPassword ? '0 44px 0 14px' : '0 14px',
            background: colors.bgSurface,
            border: `1px solid ${borderColor}`,
            borderRadius: radius.md,
            color: colors.textPrimary,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: focused && !error ? `0 0 0 3px ${colors.accentGreenMuted}33` : 'none',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Ocultar senha' : 'Mostrar senha'}
            style={{
              position: 'absolute',
              right: '4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.textMuted,
              borderRadius: radius.sm,
            }}
          >
            {reveal ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {error && <span style={{ fontSize: '11px', color: colors.expense }}>{error}</span>}
    </label>
  )
})

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.3 3.3A6.9 6.9 0 018 3.5c4.5 0 7 4.5 7 4.5a12 12 0 01-2 2.6M4 4.6A11.8 11.8 0 001 8s2.5 4.5 7 4.5c.9 0 1.7-.2 2.4-.4M2 2l12 12M6.6 6.6a2 2 0 002.8 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
