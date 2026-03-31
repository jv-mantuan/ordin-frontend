import { NavLink } from 'react-router-dom'
import { colors, radius, spacing } from '../../theme'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/transacoes', label: 'Transações', icon: <ArrowsIcon /> },
  { to: '/categorias', label: 'Categorias', icon: <TagIcon /> },
  { to: '/receitas', label: 'Receitas', icon: <TrendUpIcon /> },
  { to: '/configuracoes', label: 'Configurações', icon: <GearIcon /> },
]

export function Sidebar() {
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
          fontSize: '11px', fontWeight: 600, color: colors.textPrimary, flexShrink: 0,
        }}>AM</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            André Martins
          </div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Sair</div>
        </div>
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
function TrendUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 10L5 6.5l2.5 2.5L12.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3.5h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.2 3.2l.7.7M10.1 10.1l.7.7M3.2 10.8l.7-.7M10.1 3.9l.7-.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

