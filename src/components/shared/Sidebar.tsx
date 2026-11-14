import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { radius, spacing } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import { displayName, initials } from '../../lib/user'
import { MoonIcon, SunIcon } from './TopBar'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/transacoes', label: 'Transações', icon: <ArrowsIcon /> },
  { to: '/servicos', label: 'Serviços', icon: <BriefcaseIcon /> },
  { to: '/categorias', label: 'Categorias', icon: <TagIcon /> },
]

const DEFAULT_WIDTH = 200
const MIN_WIDTH = 180
const MAX_WIDTH = 320
const COLLAPSED_WIDTH = 64
const KEY_STEP = 16
const EASE = '220ms cubic-bezier(0.2, 0.8, 0.2, 1)'

const WIDTH_KEY = 'ordin.sidebar.width'
const COLLAPSED_KEY = 'ordin.sidebar.collapsed'

const clamp = (w: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(w)))

/** Per-browser convenience only: storage can be blocked (private mode), so every access is guarded. */
function readStored<T>(key: string, parse: (raw: string) => T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : parse(raw)
  } catch {
    return fallback
  }
}
function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Not persisted; the sidebar still works for this visit.
  }
}

export function Sidebar() {
  const { colors, isDark, toggleTheme } = useTheme()
  const { isMobile } = useBreakpoint()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(() => readStored(COLLAPSED_KEY, (r) => r === 'true', false))
  const [width, setWidth] = useState(() =>
    readStored(WIDTH_KEY, (r) => (Number.isFinite(Number(r)) ? clamp(Number(r)) : DEFAULT_WIDTH), DEFAULT_WIDTH),
  )
  const drag = useRef<{ startX: number; startWidth: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      store(COLLAPSED_KEY, String(!c))
      return !c
    })
  }

  const resizeTo = (w: number) => {
    const next = clamp(w)
    setWidth(next)
    store(WIDTH_KEY, String(next))
  }

  if (isMobile) return null

  const current = collapsed ? COLLAPSED_WIDTH : width
  const iconButton: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: colors.textMuted,
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    flexShrink: 0,
    minWidth: '32px',
    minHeight: '32px',
  }
  const themeLabel = isDark ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <aside
      aria-label="Menu"
      className="sidebar-aside"
      style={{
        width: `${current}px`,
        minWidth: `${current}px`,
        background: colors.bgSurface,
        backdropFilter: colors.glassBlur,
        WebkitBackdropFilter: colors.glassBlur,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        // While dragging, stop text selection across the page.
        userSelect: dragging ? 'none' : undefined,
        // Collapse/expand animates; dragging must follow the pointer with no lag.
        transition: dragging ? 'none' : `width ${EASE}, min-width ${EASE}`,
      }}
    >
      {/* Logo + collapse toggle */}
      <div
        style={{
          padding: collapsed ? '16px 8px' : '20px 12px 20px 16px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: collapsed ? '8px' : '10px',
          overflow: 'hidden',
        }}
      >
        <img
          src="/brand_assets/ordin-mark.png"
          alt=""
          style={{ width: collapsed ? '36px' : '44px', height: collapsed ? '36px' : '44px', mixBlendMode: isDark ? 'screen' : 'normal' }}
        />
        {!collapsed && (
          <span
            className="sidebar-fade"
            style={{
              color: colors.textPrimary,
              fontWeight: 700,
              fontSize: '20px',
              letterSpacing: '-0.03em',
              flex: 1,
              minWidth: 0,
            }}
          >
            ORDIN
          </span>
        )}
        <button
          type="button"
          className="sidebar-icon-btn"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          style={iconButton}
        >
          <ChevronIcon direction={collapsed ? 'right' : 'left'} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            // Icon-only when collapsed: the name moves to aria-label and a native tooltip.
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className="sidebar-link"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: spacing.sm,
              padding: collapsed ? '10px 0' : '8px 10px',
              borderRadius: radius.md,
              color: isActive ? colors.textPrimary : colors.textSecondary,
              background: isActive ? colors.bgActive : 'transparent',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: isActive ? 500 : 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            <span style={{ opacity: 0.8, display: 'flex' }}>{icon}</span>
            {!collapsed && <span className="sidebar-fade">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '12px 12px 12px 16px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: collapsed ? '6px' : spacing.sm,
          overflow: 'hidden',
        }}
      >
        <Link
          to="/perfil"
          title="Perfil"
          aria-label="Perfil"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            flex: collapsed ? undefined : 1,
            minWidth: 0,
            textDecoration: 'none',
            borderRadius: radius.sm,
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.accentGreenMuted}, ${colors.accentGreen})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: colors.white,
              flexShrink: 0,
            }}
          >
            {initials(user)}
          </div>
          {!collapsed && (
            <div className="sidebar-fade" style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: colors.textPrimary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName(user)}
              </div>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          title={themeLabel}
          aria-label={themeLabel}
          className="sidebar-icon-btn"
          style={iconButton}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          title="Sair"
          aria-label="Sair"
          className="sidebar-icon-btn"
          style={iconButton}
        >
          <LogoutIcon />
        </button>
      </div>

      {/* Resize handle (only while expanded): drag, arrow keys, Home/End; double-click resets. */}
      {!collapsed && (
        <div
          role="separator"
          aria-label="Redimensionar menu"
          aria-orientation="vertical"
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          aria-valuenow={width}
          tabIndex={0}
          className={`sidebar-resizer${dragging ? ' is-dragging' : ''}`}
          title="Arraste para redimensionar. Duplo clique volta ao tamanho padrão."
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            drag.current = { startX: e.clientX, startWidth: width }
            setDragging(true)
          }}
          onPointerMove={(e) => {
            if (!drag.current) return
            setWidth(clamp(drag.current.startWidth + e.clientX - drag.current.startX))
          }}
          onPointerUp={(e) => {
            if (!drag.current) return
            resizeTo(drag.current.startWidth + e.clientX - drag.current.startX)
            drag.current = null
            setDragging(false)
          }}
          onPointerCancel={() => {
            drag.current = null
            setDragging(false)
          }}
          onDoubleClick={() => resizeTo(DEFAULT_WIDTH)}
          onKeyDown={(e) => {
            const next =
              e.key === 'ArrowRight' ? width + KEY_STEP
              : e.key === 'ArrowLeft' ? width - KEY_STEP
              : e.key === 'Home' ? MIN_WIDTH
              : e.key === 'End' ? MAX_WIDTH
              : null
            if (next === null) return
            e.preventDefault()
            resizeTo(next)
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: '-4px',
            width: '8px',
            height: '100%',
            cursor: 'col-resize',
            zIndex: 5,
            touchAction: 'none',
          }}
        />
      )}

      <style>{`
        .sidebar-icon-btn { transition: color 0.15s ease, background 0.15s ease; }
        .sidebar-icon-btn:hover { color: ${colors.textPrimary}; background: ${colors.bgCardElevated}; }
        .sidebar-icon-btn:focus-visible, .sidebar-link:focus-visible { outline: 2px solid ${colors.accentGreenBright}; outline-offset: 1px; }
        .sidebar-link:hover { color: ${colors.textPrimary}; }
        .sidebar-resizer::after {
          content: ''; position: absolute; top: 0; bottom: 0; left: 3px; width: 2px;
          background: ${colors.accentGreenBright}; opacity: 0; transition: opacity 0.15s ease;
        }
        .sidebar-resizer:hover::after, .sidebar-resizer:focus-visible::after, .sidebar-resizer.is-dragging::after { opacity: 0.8; }
        .sidebar-resizer:focus-visible { outline: none; }
        @keyframes sidebar-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .sidebar-fade { animation: sidebar-fade-in 180ms ease 90ms both; }
        @media (prefers-reduced-motion: reduce) {
          .sidebar-aside { transition: none !important; }
          .sidebar-fade { animation: none; }
        }
      `}</style>
    </aside>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      style={{ transform: direction === 'right' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M8.5 3.5L5 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.25" y="4" width="11.5" height="8.25" rx="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 4V2.9a.9.9 0 01.9-.9h2.2a.9.9 0 01.9.9V4M1.25 7.6h11.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
