import { useRef, useState } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

const LENGTH = 6

interface CodeInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  autoFocus?: boolean
}

/** Keeps only digits, capped at 6, so pasting "123 456" or "123-456" just works. */
function normalizeCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, LENGTH)
}

/**
 * 6-digit code entry: one real input (typing, paste, one-time-code autofill, screen readers)
 * drawn as six boxes.
 */
export function CodeInput({ value, onChange, error, autoFocus }: CodeInputProps) {
  const { colors } = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const activeIndex = Math.min(value.length, LENGTH - 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textSecondary }}>Código de verificação</span>

      <div style={{ position: 'relative' }} onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(normalizeCode(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          aria-label="Código de verificação de 6 dígitos"
          aria-invalid={!!error}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            fontSize: '16px', // avoids iOS zoom on focus
            cursor: 'text',
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${LENGTH}, 1fr)`, gap: '8px' }} aria-hidden="true">
          {Array.from({ length: LENGTH }, (_, i) => {
            const isActive = focused && i === activeIndex
            return (
              <span
                key={i}
                style={{
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.md,
                  background: colors.bgSurface,
                  border: `1px solid ${error ? colors.expense : isActive ? colors.accentGreenBright : colors.border}`,
                  boxShadow: isActive && !error ? `0 0 0 3px ${colors.accentGreenMuted}33` : 'none',
                  color: colors.textPrimary,
                  fontSize: '22px',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                {value[i] ?? ''}
              </span>
            )
          })}
        </div>
      </div>

      {error && (
        <span role="alert" style={{ fontSize: '12px', color: colors.expense }}>
          {error}
        </span>
      )}
    </div>
  )
}
