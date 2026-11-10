import { useState, type ButtonHTMLAttributes } from 'react'
import { useTheme } from '../../context/ThemeContext'

/** Inline text button (e.g. "Reenviar código"): link look, real button semantics and states. */
export function TextAction({ disabled, style, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { colors } = useTheme()
  const [hover, setHover] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)

  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setFocusVisible(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocusVisible(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: '2px 0',
        font: 'inherit',
        fontSize: '13px',
        fontWeight: 500,
        color: disabled ? colors.textMuted : colors.accentGreenBright,
        cursor: disabled ? 'default' : 'pointer',
        textDecoration: hover && !disabled ? 'underline' : 'none',
        textUnderlineOffset: '3px',
        borderRadius: '4px',
        outline: 'none',
        boxShadow: focusVisible ? `0 0 0 2px ${colors.accentGreenBright}66` : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
