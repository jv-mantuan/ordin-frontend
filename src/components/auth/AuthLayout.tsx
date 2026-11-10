import type { ReactNode } from 'react'
import { radius } from '../../theme'
import { useTheme } from '../../context/ThemeContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { colors, isDark, toggleTheme } = useTheme()
  const { isMobile } = useBreakpoint()

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '20px 16px' : '24px',
        background: colors.bgApp,
        // Atmospheric green glow behind the card (not a flat fill)
        backgroundImage: `radial-gradient(circle at 50% 0%, ${colors.accentGreenMuted}2e, transparent 55%)`,
      }}
    >
      {/* Theme toggle, top-right */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          color: colors.textSecondary,
          cursor: 'pointer',
        }}
      >
        {isDark ? '☀' : '☾'}
      </button>

      <div
        className="animate-fade"
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '24px',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/brand_assets/ordin-mark.png"
              alt=""
              style={{ width: '44px', height: '44px', mixBlendMode: isDark ? 'screen' : 'normal' }}
            />
            <span
              style={{
                color: colors.textPrimary,
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '-0.03em',
              }}
            >
              ORDIN
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.xl,
            padding: isMobile ? '24px 20px' : '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            boxShadow: isDark
              ? '0 24px 60px -20px rgba(0,0,0,0.6)'
              : '0 24px 60px -24px rgba(15,26,20,0.25)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: colors.textPrimary,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary, lineHeight: 1.5 }}>
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        {/* Footer link */}
        <div style={{ textAlign: 'center', fontSize: '13px', color: colors.textSecondary }}>
          {footer}
        </div>
      </div>
    </div>
  )
}
