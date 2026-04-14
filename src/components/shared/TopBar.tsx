import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'

interface TopBarProps {
  title: string
  children?: React.ReactNode
}

export function TopBar({ title, children }: TopBarProps) {
  const { colors, isDark, toggleTheme } = useTheme()
  const { isMobile } = useBreakpoint()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
      gap: '8px',
      minWidth: 0,
    }}>
      <h1 style={{
        margin: 0,
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: 600,
        color: colors.textPrimary,
        letterSpacing: '-0.02em',
        // Allow title to shrink so right-side icons are never pushed off screen
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexShrink: 0 }}>
        {/* On mobile: only theme toggle + avatar (no bell/settings) */}
        {!isMobile && (
          <>
            <IconBtn colors={colors}><BellIcon /></IconBtn>
            <IconBtn colors={colors}><SettingsIcon /></IconBtn>
          </>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.md,
            width: isMobile ? '34px' : '32px',
            height: isMobile ? '34px' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.textSecondary,
            transition: 'background 0.2s, color 0.2s',
            flexShrink: 0,
          }}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Avatar */}
        <div style={{
          width: isMobile ? '34px' : '30px',
          height: isMobile ? '34px' : '30px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.accentGreenMuted}, ${colors.accentGreen})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          color: colors.white,
          flexShrink: 0,
        }}>AM</div>

        {!isMobile && (
          <span style={{ fontSize: '13px', color: colors.textPrimary, fontWeight: 500 }}>André Martins</span>
        )}

        {/* Page-level action slot (e.g. "+ Nova transação") */}
        {children}
      </div>
    </div>
  )
}

function IconBtn({ children, colors }: { children: React.ReactNode; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <button style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      width: '32px', height: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer',
      color: colors.textSecondary,
    }}>
      {children}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M11.5 9A5 5 0 015 2.5a.5.5 0 00-.6.6A5 5 0 1011 10a.5.5 0 00.5-.6z" fill="currentColor" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5L11.76 4.25V9.75L7 12.5L2.24 9.75V4.25Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5a4 4 0 014 4v2.5l1 1.5H2l1-1.5V5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}
