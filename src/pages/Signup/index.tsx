import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PASSWORD_MIN, signupSchema, type SignupFormData } from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'
import { AuthDivider } from '../../components/auth/AuthDivider'
import { GoogleButton } from '../../components/auth/GoogleButton'

export function SignupPage() {
  const { signUp, signInWithGoogle, session, loading } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) })

  if (!loading && session) return <Navigate to="/" replace />

  const onSubmit = async (values: SignupFormData) => {
    const { error, needsConfirmation } = await signUp(values.name, values.email, values.password)
    if (error) {
      toast.error(error)
      return
    }
    if (needsConfirmation) {
      navigate('/verificar-email', { state: { email: values.email } })
      return
    }
    toast.success('Conta criada com sucesso!')
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a organizar suas finanças em segundos."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
            Entrar
          </Link>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <GoogleButton label="Continuar com Google" onClick={signInWithGoogle} disabled={isSubmitting} />
        <AuthDivider />
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} noValidate>
          <AuthField
            label="Nome"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register('name')}
          />
          <AuthField
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <AuthField
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder={`Mínimo ${PASSWORD_MIN} caracteres`}
            error={errors.password?.message}
            {...register('password')}
          />
          <AuthButton type="submit" loading={isSubmitting} style={{ marginTop: '4px' }}>
            {isSubmitting ? 'Criando…' : 'Criar conta'}
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  )
}
