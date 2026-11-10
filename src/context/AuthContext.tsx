import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface SignUpResult {
  error: string | null
  /** True when Supabase requires email confirmation (no session returned yet). */
  needsConfirmation: boolean
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True during the initial session lookup — render a splash, don't redirect yet. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
