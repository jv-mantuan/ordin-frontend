import { useState, type ButtonHTMLAttributes } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function AuthButton({ loading, disabled, children, ...rest }: AuthButtonProps) {
  const { colors } = useTheme()
  const [hover, setHover] = useState(false)
  const isDisabled = disabled || loading

  return (
    <button
      {...rest}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minHeight: '48px',
        width: '100%',
        border: 'none',
        borderRadius: radius.md,
        background: isDisabled
          ? colors.accentGreenMuted
          : hover
            ? colors.accentGreenBright
            : colors.accentGreen,
        color: colors.white,
        fontSize: '14px',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled && !loading ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background 0.15s, opacity 0.15s',
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <span
      style={{
        width: '15px',
        height: '15px',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'authspin 0.6s linear infinite',
      }}
    >
      <style>{`@keyframes authspin { to { transform: rotate(360deg); } }`}</style>
    </span>
  )
}
