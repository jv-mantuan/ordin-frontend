import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginSchema, type LoginFormData } from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'
import { AuthDivider } from '../../components/auth/AuthDivider'
import { GoogleButton } from '../../components/auth/GoogleButton'

export function LoginPage() {
  const { signIn, signInWithGoogle, session, loading } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  if (!loading && session) return <Navigate to="/" replace />

  const onSubmit = async (values: LoginFormData) => {
    const { error, needsVerification } = await signIn(values.email, values.password)
    if (needsVerification) {
      toast.info('Confirme seu e-mail: enviamos um novo código.')
      navigate('/verificar-email', { state: { email: values.email } })
      return
    }
    if (error) {
      toast.error(error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar suas finanças."
      footer={
        <>
          Não tem uma conta?{' '}
          <Link to="/signup" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
            Criar conta
          </Link>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GoogleButton label="Entrar com Google" onClick={signInWithGoogle} disabled={isSubmitting} />
        <AuthDivider />
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
          <AuthField
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AuthField
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Link
              to="/esqueci-senha"
              style={{ alignSelf: 'flex-end', fontSize: '13px', color: colors.accentGreenBright, fontWeight: 500 }}
            >
              Esqueci minha senha
            </Link>
          </div>
          <AuthButton type="submit" loading={isSubmitting} style={{ marginTop: '4px' }}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  )
}
