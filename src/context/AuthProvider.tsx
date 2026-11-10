import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { attempt, authClient, invalidateAccessToken, type AuthFailure } from '../lib/auth'
import { AuthContext, type AuthSession, type AuthUser } from './AuthContext'

interface SdkUser {
  id: string
  email: string
  name?: string | null
  emailVerified?: boolean
}

function toAuthUser(u: SdkUser): AuthUser {
  return { id: u.id, email: u.email, name: u.name?.trim() || '', emailVerified: !!u.emailVerified }
}

/** Reads the current session from Neon Auth; null when signed out (also drops the cached JWT). */
async function readSession(): Promise<AuthSession | null> {
  const { data } = await attempt(() => authClient.getSession())
  const user = (data as { user?: SdkUser } | null)?.user
  if (!user) invalidateAccessToken()
  return user ? { user: toAuthUser(user) } : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  /** Re-reads the session from Neon Auth (cookie-based) and mirrors it in React state. */
  const refreshSession = useCallback(async () => {
    setSession(await readSession())
  }, [])

  useEffect(() => {
    let active = true
    readSession().then((s) => {
      if (!active) return
      setSession(s)
      setLoading(false)
    })
    // Our own actions refresh the session; also re-check when the tab regains focus
    // (another tab may have signed out, or the session may have expired).
    const onFocus = () => {
      readSession().then((s) => active && setSession(s))
    }
    window.addEventListener('focus', onFocus)
    return () => {
      active = false
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await attempt(() => authClient.signIn.email({ email, password }))
      if (error?.code === 'EMAIL_NOT_VERIFIED') {
        // Neon does not resend a code on sign-in; do it so the verify screen has a fresh one.
        await attempt(() => authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' }))
        return { error: null, needsVerification: true }
      }
      if (error) return { error: mapAuthError(error), needsVerification: false }
      await refreshSession()
      return { error: null, needsVerification: false }
    },
    [refreshSession],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await attempt(() => authClient.signUp.email({ name, email, password }))
      if (error) return { error: mapAuthError(error), needsConfirmation: false }
      const signedIn = !!(data as { token?: string | null } | null)?.token
      if (signedIn) await refreshSession()
      return { error: null, needsConfirmation: !signedIn }
    },
    [refreshSession],
  )

  const signOut = useCallback(async () => {
    await attempt(() => authClient.signOut())
    invalidateAccessToken()
    setSession(null)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await attempt(() => authClient.signIn.social({ provider: 'google', callbackURL: `${window.location.origin}/` }))
  }, [])

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const { error } = await attempt(() => authClient.emailOtp.verifyEmail({ email, otp: code }))
      if (error) return { error: mapAuthError(error) }
      await refreshSession() // verification signs the user in
      return { error: null }
    },
    [refreshSession],
  )

  const resendVerificationCode = useCallback(async (email: string) => {
    const { error } = await attempt(() => authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' }))
    return { error: error ? mapAuthError(error) : null }
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await attempt(() => authClient.emailOtp.requestPasswordReset({ email }))
    return { error: error ? mapAuthError(error) : null }
  }, [])

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    const { error } = await attempt(() => authClient.emailOtp.resetPassword({ email, otp: code, password: newPassword }))
    if (error) return { error: mapAuthError(error) }
    invalidateAccessToken()
    return { error: null }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/** Maps Neon Auth / Better Auth error codes to pt-BR messages for toasts. */
function mapAuthError(error: AuthFailure): string {
  if (error.status === 429) return 'Muitas tentativas. Tente novamente em instantes.'
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'E-mail ou senha inválidos.'
    case 'EMAIL_NOT_VERIFIED':
      return 'Confirme seu e-mail antes de entrar.'
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'Este e-mail já está cadastrado.'
    case 'PASSWORD_TOO_SHORT':
      return 'A senha precisa ter pelo menos 8 caracteres.'
    case 'PASSWORD_TOO_LONG':
      return 'A senha é longa demais.'
    case 'INVALID_OTP':
    case 'OTP_EXPIRED':
      return 'Código inválido ou expirado.'
    case 'TOO_MANY_ATTEMPTS':
      return 'Muitas tentativas. Peça um novo código.'
    case 'INVALID_EMAIL':
      return 'E-mail inválido.'
  }
  const m = error.message.toLowerCase()
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Tente novamente em instantes.'
  return 'Não foi possível concluir. Tente novamente.'
}
