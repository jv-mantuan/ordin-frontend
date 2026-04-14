import { NavLink } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/transacoes', label: 'Transações', icon: <ArrowsIcon /> },
  { to: '/categorias', label: 'Categorias', icon: <TagIcon /> },
]

export function BottomNav() {
  const { colors } = useTheme()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        // 64px base height is more comfortable on large-screen phones
        height: '64px',
        background: colors.bgSurface,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'stretch',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        // Subtle glassmorphism for depth
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: isActive ? colors.accentGreenBright : colors.textMuted,
            textDecoration: 'none',
            fontSize: '11px',
            fontWeight: isActive ? 600 : 400,
            letterSpacing: '0.01em',
            transition: 'color 0.15s',
            minHeight: '44px',
            position: 'relative' as const,
          })}
        >
          {({ isActive }) => (
            <>
              {/* Active indicator dot above icon */}
              {isActive && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: colors.accentGreenBright,
                  opacity: 0.8,
                }} />
              )}
              <span style={{
                display: 'flex',
                transform: isActive ? 'translateY(1px)' : 'none',
                transition: 'transform 0.15s',
              }}>
                {icon}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/* ── SVG icons ── */
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" />
      <rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor" />
      <rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor" />
      <rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor" />
    </svg>
  )
}
function ArrowsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
      <path d="M2 4.5h10M2 4.5l2-2M2 4.5l2 2M12 9.5H2M12 9.5l-2-2M12 9.5l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
      <path d="M7.5 1.5H12.5V6.5L7 12a1 1 0 01-1.4 0L1.5 7.9a1 1 0 010-1.4L7.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="10" cy="4" r="1.1" fill="currentColor" />
    </svg>
  )
}
