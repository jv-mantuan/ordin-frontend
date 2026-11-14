import { useEffect, useId, useRef, useState } from 'react'
import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'

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

/**
 * "i" button with a tooltip.
 * - Mouse: opens on hover; stays open while the pointer is on the button or the tooltip (WCAG 1.4.13).
 * - Touch / click / keyboard: each activation toggles it.
 * - Esc or a tap outside closes it. Keyboard focus also shows it.
 * The tooltip spans the card width (positioned against the card), so it never overflows a narrow screen.
 */
type TipState = 'closed' | 'hover' | 'pinned'

function InfoTip({ label, text }: { label: string; text: string }) {
  const { colors, isDark } = useTheme()
  const [state, setState] = useState<TipState>('closed')
  const wrapRef = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const tipId = useId()
  const visible = state !== 'closed'

  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const softOpen = () => { cancelClose(); setState((s) => (s === 'closed' ? 'hover' : s)) }
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
      style={{ display: 'inline-flex', marginLeft: 'auto', flexShrink: 0 }}
    >
      <button
        type="button"
        className="stat-info-btn"
        aria-label={`Sobre ${label}`}
        aria-expanded={visible}
        aria-describedby={visible ? tipId : undefined}
        // A tap fires focus before click: focus shows it as "hover", the click pins it,
        // and the next tap (no new focus) closes it.
        onClick={() => { cancelClose(); setState((s) => (s === 'pinned' ? 'closed' : 'pinned')) }}
        onFocus={(e) => { if (e.target.matches(':focus-visible')) softOpen() }}
        onBlur={() => setState((s) => (s === 'hover' ? 'closed' : s))}
        style={{
          width: '44px', height: '44px', margin: '-10px -12px -10px 0',
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
            position: 'absolute', left: '14px', right: '14px', top: '64px', zIndex: 20,
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
