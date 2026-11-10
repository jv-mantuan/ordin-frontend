import { createContext, useContext } from 'react'

/** App-owned user type, so no auth-SDK type leaks into components. */
export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

export interface AuthSession {
  user: AuthUser
}

export interface AuthContextValue {
  session: AuthSession | null
  user: AuthUser | null
  /** True during the initial session lookup — render a splash, don't redirect yet. */
  loading: boolean
  /** `needsVerification`: the email is not confirmed yet; a new code was sent. */
  signIn: (email: string, password: string) => Promise<{ error: string | null; needsVerification: boolean }>
  /** `needsConfirmation`: a verification code was sent to the email. */
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
  /** Redirects to Google; the session is picked up when the browser comes back. */
  signInWithGoogle: () => Promise<void>
  verifyEmail: (email: string, code: string) => Promise<{ error: string | null }>
  resendVerificationCode: (email: string) => Promise<{ error: string | null }>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ error: string | null }>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
