import { useState } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

interface GoogleButtonProps {
  label: string
  onClick: () => void | Promise<void>
  disabled?: boolean
}

/** Google sign-in button. White surface + the official multicolor "G", per Google's branding guidance. */
export function GoogleButton({ label, onClick, disabled }: GoogleButtonProps) {
  const { colors } = useTheme()
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const isDisabled = disabled || busy

  const handleClick = async () => {
    setBusy(true)
    try {
      await onClick()
    } finally {
      // On success the browser navigates to Google; this only matters if the redirect fails.
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false)
        setPressed(false)
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={(e) => setFocusVisible(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocusVisible(false)}
      style={{
        minHeight: '48px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        borderRadius: radius.md,
        border: `1px solid ${hover ? '#c4c7c5' : '#dadce0'}`,
        background: pressed ? '#eef0f1' : hover ? '#f8f9fa' : '#ffffff',
        color: '#1f1f1f',
        fontSize: '14px',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.7 : 1,
        transform: pressed ? 'scale(0.99)' : 'none',
        boxShadow: focusVisible ? `0 0 0 3px ${colors.accentGreenBright}66` : 'none',
        outline: 'none',
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s, box-shadow 0.15s',
      }}
    >
      <GoogleMark />
      {label}
    </button>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}
