import { useEffect, useId, useRef, useState } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

/** Just below the button, in the coordinates of its offsetParent (the positioned card). */
const tipTop = (button: HTMLButtonElement | null) =>
  button ? `${button.offsetTop + button.offsetHeight - 6}px` : '64px'

/**
 * "i" button with a tooltip.
 * - Mouse: opens on hover; stays open while the pointer is on the button or the tooltip (WCAG 1.4.13).
 * - Touch / click / keyboard: each activation toggles it.
 * - Esc or a tap outside closes it. Keyboard focus also shows it.
 * The tooltip spans the nearest positioned ancestor (the card) just below the button, so it never
 * overflows a narrow screen wherever the button sits inside the card.
 */
type TipState = 'closed' | 'hover' | 'pinned'

export function InfoTip({ label, text }: { label: string; text: string }) {
  const { colors, isDark } = useTheme()
  const [state, setState] = useState<TipState>('closed')
  const wrapRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const tipId = useId()
  const visible = state !== 'closed'
  // Measured when it opens (event handlers), never during render.
  const [top, setTop] = useState('64px')
  const place = () => setTop(tipTop(buttonRef.current))

  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const softOpen = () => { cancelClose(); place(); setState((s) => (s === 'closed' ? 'hover' : s)) }
  const softClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setState((s) => (s === 'hover' ? 'closed' : s)), 150)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setState('closed') }
    const onPointer = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setState('closed')
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [visible])

  return (
    <span
      ref={wrapRef}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') softOpen() }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') softClose() }}
      style={{ display: 'inline-flex', flexShrink: 0 }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="stat-info-btn"
        aria-label={`Sobre ${label}`}
        aria-expanded={visible}
        aria-describedby={visible ? tipId : undefined}
        // A tap fires focus before click: focus shows it as "hover", the click pins it,
        // and the next tap (no new focus) closes it.
        onClick={() => { cancelClose(); place(); setState((s) => (s === 'pinned' ? 'closed' : 'pinned')) }}
        onFocus={(e) => { if (e.target.matches(':focus-visible')) softOpen() }}
        onBlur={() => setState((s) => (s === 'hover' ? 'closed' : s))}
        style={{
          // 44px touch target without pushing the layout: the negative margin eats the extra size.
          width: '44px', height: '44px', margin: '-14px -14px -14px -12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', borderRadius: radius.full, cursor: 'pointer',
        }}
      >
        <InfoIcon />
      </button>
      {visible && (
        <span
          id={tipId}
          role="tooltip"
          style={{
            position: 'absolute', left: '14px', right: '14px', top, zIndex: 20,
            background: isDark ? colors.bgCardElevated : colors.bgSurface,
            border: `1px solid ${colors.border}`, borderRadius: radius.md,
            padding: '12px 14px', fontSize: '13px', lineHeight: 1.55, fontWeight: 400,
            color: colors.textPrimary,
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.38)'
              : '0 1px 2px rgba(15,26,20,0.06), 0 12px 32px rgba(15,26,20,0.12)',
          }}
        >
          {text}
        </span>
      )}
      <style>{`
        .stat-info-btn { color: ${colors.textMuted}; transition: color 0.15s, transform 0.1s; }
        .stat-info-btn:hover { color: ${colors.textSecondary}; }
        .stat-info-btn[aria-expanded="true"] { color: ${colors.accentGreenBright}; }
        .stat-info-btn:focus-visible { outline: 2px solid ${colors.accentGreenBright}; outline-offset: -6px; }
        .stat-info-btn:active { transform: scale(0.92); }
      `}</style>
    </span>
  )
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v3.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.85" fill="currentColor" />
    </svg>
  )
}
