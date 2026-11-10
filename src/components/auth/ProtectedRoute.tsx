import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <AuthSplash />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthSplash() {
  const { colors } = useTheme()
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bgApp,
      }}
    >
      <img
        src="/brand_assets/ordin-mark.png"
        alt="Carregando"
        style={{ width: '52px', height: '52px', mixBlendMode: 'screen', opacity: 0.9, animation: 'authpulse 1.2s ease-in-out infinite' }}
      />
      <style>{`@keyframes authpulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }`}</style>
    </div>
  )
}
