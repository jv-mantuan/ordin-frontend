import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { signupSchema, type SignupFormData } from '../../schemas/auth.schema'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { AuthField } from '../../components/auth/AuthField'
import { AuthButton } from '../../components/auth/AuthButton'

export function SignupPage() {
  const { signUp, session, loading } = useAuth()
  const { colors } = useTheme()
  const navigate = useNavigate()
  const [confirmSent, setConfirmSent] = useState(false)
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
      setConfirmSent(true)
      return
    }
    toast.success('Conta criada com sucesso!')
    navigate('/', { replace: true })
  }

  if (confirmSent) {
    return (
      <AuthLayout
        title="Confirme seu e-mail"
        subtitle="Enviamos um link de confirmação para o seu e-mail. Abra-o para ativar sua conta e depois faça login."
        footer={
          <Link to="/login" style={{ color: colors.accentGreenBright, fontWeight: 500 }}>
            Voltar para o login
          </Link>
        }
      >
        <div />
      </AuthLayout>
    )
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
          placeholder="Mínimo 6 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <AuthButton type="submit" loading={isSubmitting} style={{ marginTop: '4px' }}>
          {isSubmitting ? 'Criando…' : 'Criar conta'}
        </AuthButton>
      </form>
    </AuthLayout>
  )
}
