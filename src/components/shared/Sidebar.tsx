import { NavLink, useNavigate } from 'react-router-dom'
import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import { displayName, initials } from '../../lib/user'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/transacoes', label: 'Transações', icon: <ArrowsIcon /> },
  { to: '/categorias', label: 'Categorias', icon: <TagIcon /> },
]

export function Sidebar() {
  const { colors } = useTheme()
  const { isMobile } = useBreakpoint()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (isMobile) return null

  return (
    <aside style={{
      width: '200px',
      minWidth: '200px',
      background: colors.bgSurface,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 24px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/brand_assets/ordin-mark.png"
            alt=""
            style={{
              width: '48px',
              height: '48px',
              mixBlendMode: 'screen',
            }}
          />
          <span style={{
            color: colors.textPrimary,
            fontWeight: 700,
            fontSize: '20px',
            letterSpacing: '-0.03em',
          }}>
            ORDIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              padding: '8px 10px',
              borderRadius: radius.md,
              color: isActive ? colors.textPrimary : colors.textSecondary,
              background: isActive ? colors.bgActive : 'transparent',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: isActive ? 500 : 400,
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <span style={{ opacity: 0.8 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.accentGreenMuted}, ${colors.accentGreen})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 600, color: colors.white, flexShrink: 0,
        }}>{initials(user)}</div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayName(user)}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sair"
          aria-label="Sair"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colors.textMuted,
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: radius.sm,
            flexShrink: 0,
          }}
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  )
}

/* ── inline SVG icons ── */
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".8" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity=".8" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".8" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity=".8" />
    </svg>
  )
}
function ArrowsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4.5h10M2 4.5l2-2M2 4.5l2 2M12 9.5H2M12 9.5l-2-2M12 9.5l-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7.5 1.5H12.5V6.5L7 12a1 1 0 01-1.4 0L1.5 7.9a1 1 0 010-1.4L7.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="4" r="1" fill="currentColor" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
      <path d="M5.5 1.5H2.5a1 1 0 00-1 1v9a1 1 0 001 1h3M9 4l3 3-3 3M12 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
