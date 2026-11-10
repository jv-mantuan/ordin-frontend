import { type ReactNode, useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type SignUpResult } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? mapAuthError(error.message) : null }
  }, [])

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<SignUpResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (error) return { error: mapAuthError(error.message), needsConfirmation: false }
      return { error: null, needsConfirmation: !data.session }
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/** Maps Supabase (English) auth errors to pt-BR messages for toasts. */
function mapAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Este e-mail já está cadastrado.'
  if (m.includes('password')) return 'Senha inválida (mínimo 6 caracteres).'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Muitas tentativas. Tente novamente em instantes.'
  return 'Não foi possível concluir. Tente novamente.'
}
