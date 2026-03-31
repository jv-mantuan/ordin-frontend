import { colors, radius, spacing } from '../../theme'

interface TopBarProps {
  title: string
  children?: React.ReactNode
}

export function TopBar({ title, children }: TopBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl,
    }}>
      <h1 style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
        color: colors.textPrimary,
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.full,
          padding: '6px 14px',
        }}>
          <SearchIcon />
          <input
            placeholder="Pesquisar..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: colors.textPrimary,
              fontSize: '12px',
              width: '140px',
            }}
          />
        </div>

        {/* Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <IconBtn><BellIcon /></IconBtn>
          <IconBtn><SettingsIcon /></IconBtn>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.accentGreenMuted}, ${colors.accentGreen})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 600, color: colors.textPrimary,
          }}>AM</div>
          <span style={{ fontSize: '13px', color: colors.textPrimary, fontWeight: 500 }}>André Martins</span>
        </div>

        {children}
      </div>
    </div>
  )
}

function IconBtn({ children }: { children: React.ReactNode }) {
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

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="#7a9882" strokeWidth="1.4"/>
      <path d="M9.5 9.5l2.5 2.5" stroke="#7a9882" strokeWidth="1.4" strokeLinecap="round"/>
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
function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.2 3.2l.7.7M10.1 10.1l.7.7M3.2 10.8l.7-.7M10.1 3.9l.7-.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
